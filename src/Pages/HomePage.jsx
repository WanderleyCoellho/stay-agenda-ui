import { useEffect, useState, useContext } from "react";
import { Link } from "react-router-dom";
import api from "../Services/api";
import Loader from "../Components/Loader/Loader";
import { ThemeContext } from "../Context/ThemeContext"; // 1. Importe o Contexto

// FullCalendar
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import ptBrLocale from '@fullcalendar/core/locales/pt-br';

function HomePage() {
    const { primaryColor } = useContext(ThemeContext); // 2. Pegue a cor

    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState("dashboard");

    // --- ESTADOS DASHBOARD ---
    const [dataFaturamento, setDataFaturamento] = useState("");
    const [listaFaturamento, setListaFaturamento] = useState([]);
    const [totalFaturamento, setTotalFaturamento] = useState(0);
    const [qtdFaturamento, setQtdFaturamento] = useState(0);

    const [dataPrevisao, setDataPrevisao] = useState("");
    const [listaPrevisao, setListaPrevisao] = useState([]);
    const [totalPrevisao, setTotalPrevisao] = useState(0);
    const [qtdPrevisao, setQtdPrevisao] = useState(0);

    // --- ESTADOS CALENDÁRIO ---
    const [todosAgendamentos, setTodosAgendamentos] = useState([]);

    useEffect(() => {
        const hoje = new Date();
        const ano = hoje.getFullYear();
        const mes = String(hoje.getMonth() + 1).padStart(2, '0');
        const dia = String(hoje.getDate()).padStart(2, '0');
        const hojeFormatado = `${ano}-${mes}-${dia}`;

        setDataFaturamento(hojeFormatado);
        setDataPrevisao(hojeFormatado);
    }, []);

    useEffect(() => {
        const carregarDados = async () => {
            setLoading(true);
            try {
                if (viewMode === 'dashboard') {
                    if (!dataFaturamento || !dataPrevisao) return;

                    const [resFat, resPrev] = await Promise.all([
                        api.get(`/agendamentos/filtro?data=${dataFaturamento}`).catch(() => ({ data: [] })),
                        api.get(`/agendamentos/filtro?data=${dataPrevisao}`).catch(() => ({ data: [] }))
                    ]);

                    // Faturamento
                    const todosFat = resFat.data;
                    const totalFat = todosFat.reduce((acc, item) => {
                        if (item.status === 'CONCLUIDO') return acc + (item.valorLiquidoTotal || item.valorProcedimento || 0);
                        else if (item.status === 'CONFIRMADO') return acc + (item.valorParcial || 0); // Aqui poderíamos usar o líquido do sinal se tivesse no back
                        return acc;
                    }, 0);
                    setTotalFaturamento(totalFat);
                    const listaFiltradaFat = todosFat.filter(item =>
                        item.status === 'CONCLUIDO' || (item.status === 'CONFIRMADO' && item.valorParcial > 0)
                    );
                    setListaFaturamento(listaFiltradaFat);
                    setQtdFaturamento(listaFiltradaFat.length);

                    // Previsão
                    const todosPrev = resPrev.data;
                    const totalPrev = todosPrev.reduce((acc, item) => {
                        if (item.status === 'PENDENTE' || item.status === 'CONFIRMADO') {
                            return acc + (item.valorProcedimento || 0);
                        }
                        return acc;
                    }, 0);
                    setTotalPrevisao(totalPrev);
                    const listaFiltradaPrev = todosPrev.filter(item =>
                        item.status === 'CONFIRMADO' || item.status === 'PENDENTE'
                    );
                    setListaPrevisao(listaFiltradaPrev);
                    setQtdPrevisao(listaFiltradaPrev.length);

                } else {
                    // Calendário
                    const res = await api.get("/agendamentos");
                    setTodosAgendamentos(res.data);
                }
            } catch (error) {
                console.error("Erro ao carregar:", error);
            } finally {
                setLoading(false);
            }
        };
        carregarDados();
    }, [viewMode, dataFaturamento, dataPrevisao]);

    // Renderizador do Calendário (Bolinhas)
    const renderDayContent = (arg) => {
        const cellDateStr = arg.date.toISOString().split('T')[0];
        const agendamentosDoDia = todosAgendamentos.filter(ag => ag.data === cellDateStr);

        if (agendamentosDoDia.length === 0) {
            return <div className="fc-daygrid-day-top"><a className="fc-daygrid-day-number text-decoration-none text-dark">{arg.dayNumberText}</a></div>;
        }

        let countAzul = 0, countVerde = 0, countAmarelo = 0, countVermelho = 0;
        agendamentosDoDia.forEach(ag => {
            if (ag.status === 'CONFIRMADO') countAzul++;
            else if (ag.status === 'CONCLUIDO') countVerde++;
            else if (ag.status === 'PENDENTE') countAmarelo++;
            else if (ag.status === 'CANCELADO') countVermelho++;
        });

        return (
            <div style={{ textAlign: 'left', padding: '2px' }}>
                <div className="fc-daygrid-day-top"><a className="fc-daygrid-day-number text-decoration-none fw-bold text-dark">{arg.dayNumberText}</a></div>
                <div className="dashboard-dots-container">
                    {countAmarelo > 0 && <div className="dot-row text-dark"><span className="status-dot dot-yellow"></span> +{countAmarelo}</div>}
                    {countAzul > 0 && <div className="dot-row text-primary"><span className="status-dot dot-blue"></span> +{countAzul}</div>}
                    {countVerde > 0 && <div className="dot-row text-success"><span className="status-dot dot-green"></span> +{countVerde}</div>}
                    {countVermelho > 0 && <div className="dot-row text-danger"><span className="status-dot dot-red"></span> +{countVermelho}</div>}
                </div>
            </div>
        );
    };

    const calcularRestante = (item) => {
        const resto = (item.valorProcedimento || 0) - (item.valorParcial || 0);
        return resto > 0 ? resto : 0;
    };

    const formatMoney = (valor) => {
        return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    };

    const getBadgeColor = (status) => {
        if (status === 'CONCLUIDO') return 'bg-success';
        if (status === 'CONFIRMADO') return 'bg-primary';
        if (status === 'CANCELADO') return 'bg-danger';
        return 'bg-warning text-dark';
    };

    if (loading) return <Loader />;

    return (
        <div className="container-fluid mt-4 pb-5">

            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="mb-0 fw-bold text-secondary">📊 Visão Geral</h2>

                {/* BOTÕES DE TROCA COM COR DINÂMICA */}
                <div className="btn-group shadow-sm">
                    <button
                        className="btn fw-bold"
                        style={{
                            backgroundColor: viewMode === 'dashboard' ? primaryColor : 'white',
                            color: viewMode === 'dashboard' ? 'white' : primaryColor,
                            borderColor: primaryColor
                        }}
                        onClick={() => setViewMode('dashboard')}
                    >
                        Hoje
                    </button>
                    <button
                        className="btn fw-bold"
                        style={{
                            backgroundColor: viewMode === 'calendar' ? primaryColor : 'white',
                            color: viewMode === 'calendar' ? 'white' : primaryColor,
                            borderColor: primaryColor
                        }}
                        onClick={() => setViewMode('calendar')}
                    >
                        Mês
                    </button>
                </div>
            </div>

            {/* ================== DASHBOARD ================== */}
            {viewMode === 'dashboard' && (
                <div className="row g-4">
                    {/* LADO ESQUERDO (Mantivemos Verde por semântica financeira "Dinheiro Vivo") */}
                    <div className="col-lg-6">
                        <div className="card h-100 shadow border-0">
                            <div className="card-header bg-success text-white py-3 d-flex justify-content-between align-items-center">
                                <h5 className="mb-0 fw-bold">💰 Recebido (Caixa)</h5>
                                <input
                                    type="date" className="form-control form-control-sm border-0 text-success fw-bold" style={{ width: "140px" }}
                                    value={dataFaturamento} onChange={(e) => setDataFaturamento(e.target.value)}
                                />
                            </div>
                            <div className="card-body p-0">
                                <div className="text-center py-4 bg-light border-bottom">
                                    <h1 className="display-4 fw-bold text-success mb-2">{formatMoney(totalFaturamento)}</h1>
                                    <span className="badge bg-secondary rounded-pill px-3 py-2">{qtdFaturamento} Baixas</span>
                                </div>

                                {/* TABELA RESPONSIVA (mobile-table) */}
                                <div className="table-responsive" style={{ maxHeight: "350px", overflowY: "auto" }}>
                                    <table className="table table-hover mb-0 align-middle mobile-table">
                                        <thead className="table-light sticky-top">
                                            <tr>
                                                <th className="ps-3">Hora</th><th>Cliente</th><th>Status</th><th className="text-end pe-3">Entrada</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {listaFaturamento.map(item => (
                                                <tr key={item.id}>
                                                    <td className="fw-bold text-muted small ps-3" data-label="Hora">{item.horaInicial}</td>
                                                    <td className="text-truncate" style={{ maxWidth: "150px" }} data-label="Cliente">{item.clientes?.nome}</td>
                                                    <td data-label="Status"><span className={`badge ${getBadgeColor(item.status)}`}>{item.status}</span></td>
                                                    <td className="fw-bold text-success text-end pe-3" data-label="Entrada">
                                                        {item.status === 'CONCLUIDO'
                                                            ? formatMoney(item.valorLiquidoTotal || item.valorProcedimento || 0)
                                                            : <span>{formatMoney(item.valorParcial || 0)} <small>(Sinal)</small></span>
                                                        }
                                                    </td>
                                                </tr>
                                            ))}
                                            {listaFaturamento.length === 0 && <tr><td colSpan="4" className="text-center py-4 text-muted">Nenhuma entrada.</td></tr>}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* LADO DIREITO (Cor Dinâmica) */}
                    <div className="col-lg-6">
                        <div className="card h-100 shadow border-0">
                            <div
                                className="card-header text-white py-3 d-flex justify-content-between align-items-center"
                                style={{ backgroundColor: primaryColor }}
                            >
                                <h5 className="mb-0 fw-bold">📈 A Receber (Previsão)</h5>
                                <input
                                    type="date" className="form-control form-control-sm border-0 fw-bold"
                                    style={{ width: "140px", color: primaryColor }}
                                    value={dataPrevisao} onChange={(e) => setDataPrevisao(e.target.value)}
                                />
                            </div>
                            <div className="card-body p-0">
                                <div className="text-center py-4 bg-light border-bottom">
                                    <h1 className="display-4 fw-bold mb-2" style={{ color: primaryColor }}>{formatMoney(totalPrevisao)}</h1>
                                    <span className="badge bg-secondary rounded-pill px-3 py-2">{qtdPrevisao} Previstos</span>
                                </div>

                                {/* TABELA RESPONSIVA (mobile-table) */}
                                <div className="table-responsive" style={{ maxHeight: "350px", overflowY: "auto" }}>
                                    <table className="table table-hover mb-0 align-middle mobile-table">
                                        <thead className="table-light sticky-top">
                                            <tr>
                                                <th className="ps-3">Hora</th><th>Cliente</th><th>Status</th><th className="text-end">Restante</th><th className="text-center pe-3">Ação</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {listaPrevisao.map(item => (
                                                <tr key={item.id}>
                                                    <td className="fw-bold text-muted small ps-3" data-label="Hora">{item.horaInicial}</td>
                                                    <td className="text-truncate" style={{ maxWidth: "150px" }} data-label="Cliente">{item.clientes?.nome}</td>
                                                    <td data-label="Status"><span className={`badge ${getBadgeColor(item.status)}`}>{item.status}</span></td>
                                                    <td className="text-end fw-bold" style={{ color: primaryColor }} data-label="Restante">
                                                        {formatMoney(calcularRestante(item))}
                                                    </td>
                                                    <td className="text-center pe-3" data-label="Ação">
                                                        <Link to={`/agendamentos/editar/${item.id}`} className="btn btn-sm btn-outline-primary py-0">✏️</Link>
                                                    </td>
                                                </tr>
                                            ))}
                                            {listaPrevisao.length === 0 && <tr><td colSpan="5" className="text-center py-4 text-muted">Agenda livre.</td></tr>}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ================== CALENDÁRIO ================== */}
            {viewMode === 'calendar' && (
                <div className="card shadow border-0">
                    <div className="card-body">
                        <FullCalendar
                            plugins={[dayGridPlugin, interactionPlugin]}
                            initialView="dayGridMonth"
                            locale={ptBrLocale}
                            headerToolbar={{ left: 'prev,next today', center: 'title', right: '' }}
                            events={todosAgendamentos}
                            dayCellContent={renderDayContent}
                            height="auto"
                        />
                    </div>
                </div>
            )}

        </div>
    );
}

export default HomePage;