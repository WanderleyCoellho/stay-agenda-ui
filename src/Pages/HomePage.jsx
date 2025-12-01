import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../Services/api";
import Loader from "../Components/Loader/Loader";

function HomePage() {
    // Estado de Carregamento Global da Página
    const [loading, setLoading] = useState(true); // 2. ESTADO INICIAL

    // LADO ESQUERDO
    const [dataFaturamento, setDataFaturamento] = useState("");
    const [listaFaturamento, setListaFaturamento] = useState([]);
    const [totalFaturamento, setTotalFaturamento] = useState(0);
    const [qtdFaturamento, setQtdFaturamento] = useState(0);

    // LADO DIREITO
    const [dataPrevisao, setDataPrevisao] = useState("");
    const [listaPrevisao, setListaPrevisao] = useState([]);
    const [totalPrevisao, setTotalPrevisao] = useState(0);
    const [qtdPrevisao, setQtdPrevisao] = useState(0);

    // Inicializa datas
    useEffect(() => {
        const hoje = new Date();
        const ano = hoje.getFullYear();
        const mes = String(hoje.getMonth() + 1).padStart(2, '0');
        const dia = String(hoje.getDate()).padStart(2, '0');
        const hojeFormatado = `${ano}-${mes}-${dia}`;

        setDataFaturamento(hojeFormatado);
        setDataPrevisao(hojeFormatado);
    }, []);

    // CARREGAMENTO UNIFICADO (Para controlar o Loader)
    useEffect(() => {
        if (!dataFaturamento || !dataPrevisao) return;

        // Função para buscar tudo de uma vez
        const carregarDashboard = async () => {
            setLoading(true); // Liga o spinner ao mudar a data
            try {
                // Chama as duas APIs ao mesmo tempo
                const [resFat, resPrev] = await Promise.all([
                    api.get(`/agendamentos/filtro?data=${dataFaturamento}`),
                    api.get(`/agendamentos/filtro?data=${dataPrevisao}`)
                ]);

                // --- LÓGICA ESQUERDA (FATURAMENTO) ---
                const todosFat = resFat.data;
                const totalFat = todosFat.reduce((acc, item) => {
                    if (item.status === 'CONCLUIDO') return acc + (item.valorProcedimento || 0);
                    else if (item.status === 'CONFIRMADO') return acc + (item.valorParcial || 0);
                    return acc;
                }, 0);
                setTotalFaturamento(totalFat);
                const listaFiltradaFat = todosFat.filter(item =>
                    item.status === 'CONCLUIDO' || (item.status === 'CONFIRMADO' && item.valorParcial > 0)
                );
                setListaFaturamento(listaFiltradaFat);
                setQtdFaturamento(listaFiltradaFat.length);

                // --- LÓGICA DIREITA (PREVISÃO) ---
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

            } catch (error) {
                console.error("Erro ao carregar dashboard", error);
            } finally {
                // 3. DESLIGA O LOADER (Independente se deu certo ou erro)
                setLoading(false);
            }
        };

        carregarDashboard();

    }, [dataFaturamento, dataPrevisao]); // Roda quando qualquer data muda

    const getBadgeColor = (status) => {
        if (status === 'CONCLUIDO') return 'bg-success';
        if (status === 'CONFIRMADO') return 'bg-primary';
        return 'bg-warning text-dark';
    };

    const formatMoney = (valor) => {
        return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    };

    const calcularRestante = (item) => {
        const resto = (item.valorProcedimento || 0) - (item.valorParcial || 0);
        return resto > 0 ? resto : 0;
    };

    // 4. VERIFICAÇÃO VISUAL: Se estiver carregando, mostra o Spinner e PARA AQUI.
    if (loading) {
        return <Loader />;
    }

    // Se não estiver carregando, mostra o HTML normal da página
    return (
        <div className="container-fluid mt-4 pb-5">

            <div className="d-flex align-items-center mb-4">
                <h2 className="mb-0">📊 Dashboard Financeiro</h2>
            </div>

            <div className="row g-4">

                {/* LADO ESQUERDO */}
                <div className="col-lg-6">
                    <div className="card h-100 shadow-sm border-0">
                        <div className="card-header bg-success text-white py-3 d-flex justify-content-between align-items-center">
                            <h5 className="mb-0 fw-bold">💰 Faturamento Real</h5>
                            <input
                                type="date" className="form-control form-control-sm border-0 text-success fw-bold" style={{ width: "140px" }}
                                value={dataFaturamento} onChange={(e) => setDataFaturamento(e.target.value)}
                            />
                        </div>

                        <div className="card-body d-flex flex-column">
                            <div className="text-center py-4 bg-light rounded-3 mb-4">
                                <h1 className="display-4 fw-bold text-success mb-2">
                                    {formatMoney(totalFaturamento)}
                                </h1>
                                <span className="badge bg-secondary rounded-pill px-3 py-2">
                                    {qtdFaturamento} Baixas realizadas
                                </span>
                            </div>

                            <h6 className="text-muted text-uppercase small fw-bold mb-3">Concluídos e Sinais Pagos:</h6>

                            <div className="table-responsive border rounded" style={{ maxHeight: "350px", overflowY: "auto" }}>
                                <table className="table table-hover mb-0 align-middle">
                                    <thead className="table-light sticky-top">
                                        <tr>
                                            <th>Hora</th>
                                            <th>Cliente</th>
                                            <th>Status</th>
                                            <th className="text-end">Entrada</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {listaFaturamento.map(item => (
                                            <tr key={item.id}>
                                                <td className="fw-bold text-muted small">{item.horaInicial}</td>
                                                <td className="text-truncate" style={{ maxWidth: "100px" }} title={item.clientes?.nome}>
                                                    {item.clientes?.nome}
                                                </td>
                                                <td><span className={`badge ${getBadgeColor(item.status)}`}>{item.status}</span></td>
                                                <td className="fw-bold text-success text-end">
                                                    {/* Valor Líquido ou Parcial Líquido (se tiver lógica no back, senao valor bruto) */}
                                                    {item.status === 'CONCLUIDO'
                                                        ? formatMoney(item.valorLiquidoTotal || item.valorProcedimento || 0)
                                                        : <span>{formatMoney(item.valorParcial || 0)} <small className="text-muted">(Sinal)</small></span>
                                                    }
                                                </td>
                                            </tr>
                                        ))}
                                        {listaFaturamento.length === 0 && (
                                            <tr><td colSpan="4" className="text-center text-muted py-4">Nenhum valor compensado.</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>

                {/* LADO DIREITO */}
                <div className="col-lg-6">
                    <div className="card h-100 shadow-sm border-0">
                        <div className="card-header bg-primary text-white py-3 d-flex justify-content-between align-items-center">
                            <h5 className="mb-0 fw-bold">📈 A Receber (Previsão)</h5>
                            <input
                                type="date" className="form-control form-control-sm border-0 text-primary fw-bold" style={{ width: "140px" }}
                                value={dataPrevisao} onChange={(e) => setDataPrevisao(e.target.value)}
                            />
                        </div>

                        <div className="card-body d-flex flex-column">
                            <div className="text-center py-4 bg-light rounded-3 mb-4">
                                <h1 className="display-4 fw-bold text-primary mb-2">
                                    {formatMoney(totalPrevisao)}
                                </h1>
                                <span className="badge bg-secondary rounded-pill px-3 py-2">
                                    {qtdPrevisao} Pendentes de Pagamento Total
                                </span>
                            </div>

                            <h6 className="text-muted text-uppercase small fw-bold mb-3">Agenda Aberta (Saldo Devedor):</h6>

                            <div className="table-responsive border rounded" style={{ maxHeight: "350px", overflowY: "auto" }}>
                                <table className="table table-hover mb-0 align-middle">
                                    <thead className="table-light sticky-top">
                                        <tr>
                                            <th>Hora</th>
                                            <th>Cliente</th>
                                            <th>Status</th>
                                            <th className="text-end">Restante</th>
                                            <th className="text-center">Ação</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {listaPrevisao.map(item => (
                                            <tr key={item.id}>
                                                <td className="fw-bold text-muted small">{item.horaInicial}</td>
                                                <td className="text-truncate" style={{ maxWidth: "100px" }} title={item.clientes?.nome}>
                                                    {item.clientes?.nome}
                                                </td>
                                                <td><span className={`badge ${getBadgeColor(item.status)}`}>{item.status}</span></td>
                                                <td className="text-end fw-bold text-primary">
                                                    {formatMoney(calcularRestante(item))}
                                                </td>
                                                <td className="text-center">
                                                    <Link to={`/agendamentos/editar/${item.id}`} className="btn btn-sm btn-outline-primary py-0">
                                                        ✏️
                                                    </Link>
                                                </td>
                                            </tr>
                                        ))}
                                        {listaPrevisao.length === 0 && (
                                            <tr><td colSpan="5" className="text-center text-muted py-4">Agenda limpa ou tudo quitado! 🎉</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}

export default HomePage;