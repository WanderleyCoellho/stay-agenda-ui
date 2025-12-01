import { useEffect, useState, useRef, useContext } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useReactToPrint } from "react-to-print";
import { Comprovante } from "../Components/Comprovante/Comprovante";
import api from "../Services/api";
import { EmpresaContext } from "../Context/EmpresaContext";

// --- IMPORT NOVO ---
import html2pdf from 'html2pdf.js';

function AgendamentoFormPage() {
    const { nomeEmpresa, logo } = useContext(EmpresaContext);

    // Estados
    const [data, setData] = useState("");
    const [horaInicial, setHoraInicial] = useState("");
    const [horaFinal, setHoraFinal] = useState("");
    const [observacoes, setObservacoes] = useState("");
    const [status, setStatus] = useState("PENDENTE");

    const [clienteId, setClienteId] = useState("");
    const [procedimentoId, setProcedimentoId] = useState("");

    const [valorProcedimento, setValorProcedimento] = useState(0);
    const [valorDesconto, setValorDesconto] = useState(0);
    const [valorParcial, setValorParcial] = useState("");

    const [promoAplicada, setPromoAplicada] = useState(null);
    const [nomePromocaoAtiva, setNomePromocaoAtiva] = useState("");

    const [formaSinalId, setFormaSinalId] = useState("");
    const [formaPagamentoId, setFormaPagamentoId] = useState("");

    const [pagamentosMultiplos, setPagamentosMultiplos] = useState([]);

    // Listas
    const [listaClientes, setListaClientes] = useState([]);
    const [listaProcedimentos, setListaProcedimentos] = useState([]);
    const [listaPagamentos, setListaPagamentos] = useState([]);
    const [listaPromocoes, setListaPromocoes] = useState([]);

    const [id, setId] = useState(null);
    const [sharing, setSharing] = useState(false); // Estado para loading do botão compartilhar

    const navigate = useNavigate();
    const { id: paramId } = useParams();

    const componentRef = useRef();

    // Helpers... (MANTENHA IGUAL)
    const criarDataSegura = (dataString) => {
        if (!dataString) return null;
        const partes = dataString.split('-');
        const dataLocal = new Date(partes[0], partes[1] - 1, partes[2]);
        dataLocal.setHours(0, 0, 0, 0);
        return dataLocal;
    };

    const renderTaxaInfo = (valorInput, formaId) => {
        if (!valorInput || !formaId) return null;
        const valor = parseFloat(valorInput);
        const forma = listaPagamentos.find(f => f.id == formaId);
        if (forma && forma.taxa > 0) {
            const valorTaxa = (valor * forma.taxa) / 100;
            if (forma.repassarTaxa) {
                const totalACobrar = valor + valorTaxa;
                return (
                    <div className="mt-2 p-2 bg-warning bg-opacity-10 border border-warning rounded small">
                        <div className="text-dark">Taxa ({forma.taxa}%) repassada.</div>
                        <div className="fw-bold text-primary">
                            👉 Cobrar: R$ {totalACobrar.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </div>
                    </div>
                );
            } else {
                const valorLiquido = valor - valorTaxa;
                return (
                    <div className="d-flex justify-content-between align-items-center mt-1 small text-muted">
                        <span>Taxa: -{valorTaxa.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                        <span className="text-success fw-bold">Liq: {valorLiquido.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                    </div>
                );
            }
        }
        return null;
    };

    const adicionarLinhaPagamento = () => setPagamentosMultiplos([...pagamentosMultiplos, { tempId: Date.now(), formaId: "", valor: "" }]);
    const removerLinhaPagamento = (tempId) => setPagamentosMultiplos(pagamentosMultiplos.filter(p => p.tempId !== tempId));
    const atualizarLinhaPagamento = (tempId, campo, novoValor) => {
        setPagamentosMultiplos(pagamentosMultiplos.map(p => {
            if (p.tempId === tempId) return { ...p, [campo]: novoValor };
            return p;
        }));
    };

    // Carregamento (MANTENHA IGUAL)
    useEffect(() => {
        const loadAllData = async () => {
            const reqClientes = api.get("/clientes").catch(() => ({ data: [] }));
            const reqProcedimentos = api.get("/procedimentos").catch(() => ({ data: [] }));
            const reqPagamentos = api.get("/formaspagamento").catch(() => ({ data: [] }));
            const reqPromocoes = api.get("/promocoes").catch(() => ({ data: [] }));

            const [resCli, resProc, resPay, resPromo] = await Promise.all([reqClientes, reqProcedimentos, reqPagamentos, reqPromocoes]);

            setListaClientes(resCli.data);
            setListaProcedimentos(resProc.data);
            setListaPagamentos(resPay.data);
            setListaPromocoes(resPromo.data);

            if (paramId && paramId !== "novo") {
                try {
                    const agRes = await api.get(`/agendamentos/${paramId}`);
                    const dados = agRes.data;
                    setData(dados.data);
                    setHoraInicial(dados.horaInicial);
                    setHoraFinal(dados.horaFinal);
                    setObservacoes(dados.observacoes || "");
                    setStatus(dados.status);
                    setId(dados.id);
                    setValorProcedimento(dados.valorProcedimento || 0);
                    setValorDesconto(dados.valorDesconto || 0);
                    setValorParcial(dados.valorParcial || "");

                    if (dados.clientes) setClienteId(dados.clientes.id);

                    const procIdAtual = dados.procedimentos ? dados.procedimentos.id : "";
                    if (dados.procedimentos) setProcedimentoId(procIdAtual);

                    if (dados.formaPagamentoSinal) setFormaSinalId(dados.formaPagamentoSinal.id);

                    if (dados.pagamentos && dados.pagamentos.length > 0) {
                        const listaFormatada = dados.pagamentos.map((pg, index) => ({
                            tempId: index,
                            formaId: pg.formaPagamento ? pg.formaPagamento.id : "",
                            valor: pg.valor
                        }));
                        setPagamentosMultiplos(listaFormatada);
                    }

                    if (dados.promocao) {
                        setPromoAplicada(dados.promocao);
                        setNomePromocaoAtiva(dados.promocao.descricao);
                    } else if ((dados.valorDesconto || 0) > 0) {
                        encontrarNomePromocao(dados.data, procIdAtual, resPromo.data);
                    }
                } catch (error) { console.error(error); }
            }
        };
        loadAllData();
    }, [paramId]);

    // Funções de Cálculo (MANTENHA IGUAL)
    const encontrarNomePromocao = (dataAgendamento, procId, todasPromocoes) => {
        if (!dataAgendamento) return;
        const dataRef = criarDataSegura(dataAgendamento);
        const promosValidas = todasPromocoes.filter(p => {
            if (p.status !== 'ATIVA') return false;
            const inicio = criarDataSegura(p.dataInicio);
            let fim = null;
            if (p.dataFim) { fim = criarDataSegura(p.dataFim); fim.setHours(23, 59, 59, 999); }
            return dataRef >= inicio && (!fim || dataRef <= fim);
        });
        const promoEspecifica = promosValidas.find(p => p.procedimento && p.procedimento.id == procId);
        const promoGlobal = promosValidas.find(p => !p.procedimento);
        const encontrada = promoEspecifica || promoGlobal;
        if (encontrada) setNomePromocaoAtiva(encontrada.descricao);
    };

    const calcularPreco = (procId, dataAgendamento) => {
        const procOriginal = listaProcedimentos.find(p => p.id == procId);
        if (!procOriginal) return;
        let precoFinal = procOriginal.valor;
        let descontoCalculado = 0;
        let promocaoEncontrada = null;
        if (!dataAgendamento) {
            setValorProcedimento(precoFinal); setValorDesconto(0); setPromoAplicada(null); setNomePromocaoAtiva(""); return;
        }
        const dataRef = criarDataSegura(dataAgendamento);
        const promosValidas = listaPromocoes.filter(p => {
            if (p.status !== 'ATIVA') return false;
            const inicio = criarDataSegura(p.dataInicio);
            let fim = null;
            if (p.dataFim) { fim = criarDataSegura(p.dataFim); fim.setHours(23, 59, 59, 999); }
            return dataRef >= inicio && (!fim || dataRef <= fim);
        });
        const promoEspecifica = promosValidas.find(p => p.procedimento && p.procedimento.id == procId);
        const promoGlobal = promosValidas.find(p => !p.procedimento);
        promocaoEncontrada = promoEspecifica || promoGlobal;
        if (promocaoEncontrada) {
            if (promocaoEncontrada.tipoDesconto === 'FIXO') {
                descontoCalculado = promocaoEncontrada.valorPromocional;
                precoFinal = precoFinal - descontoCalculado;
            } else if (promocaoEncontrada.tipoDesconto === 'PORCENTAGEM') {
                descontoCalculado = (precoFinal * promocaoEncontrada.valorPromocional) / 100;
                precoFinal = precoFinal - descontoCalculado;
            }
        }
        setValorDesconto(descontoCalculado);
        setValorProcedimento(Math.max(0, precoFinal));
        setPromoAplicada(promocaoEncontrada);
        if (promocaoEncontrada) setNomePromocaoAtiva(promocaoEncontrada.descricao);
        else setNomePromocaoAtiva("");
    };

    const handleProcedimentoChange = (e) => { const novoId = e.target.value; setProcedimentoId(novoId); calcularPreco(novoId, data); };
    const handleDataChange = (e) => { const novaData = e.target.value; setData(novaData); calcularPreco(procedimentoId, novaData); };

    const handleSubmit = (e) => {
        e.preventDefault();
        const listaPagamentosParaEnviar = pagamentosMultiplos
            .filter(p => p.valor && p.formaId)
            .map(p => ({ valor: parseFloat(p.valor), formaPagamento: { id: p.formaId } }));

        const dadosParaEnviar = {
            data, horaInicial, horaFinal: horaFinal || null, observacoes, status,
            valorProcedimento: valorProcedimento, valorDesconto: valorDesconto, valorParcial: valorParcial ? parseFloat(valorParcial) : 0,
            clientes: { id: clienteId }, procedimentos: { id: procedimentoId },
            formaPagamentoSinal: formaSinalId ? { id: formaSinalId } : null,
            promocao: promoAplicada ? { id: promoAplicada.id } : null,
            pagamentos: listaPagamentosParaEnviar
        };

        const request = id ? api.put(`/agendamentos/${id}`, dadosParaEnviar) : api.post("/agendamentos", dadosParaEnviar);
        request.then(() => { alert("Agendamento salvo!"); navigate("/agendamentos"); }).catch((err) => alert("Erro ao salvar agendamento."));
    };

    // --- FUNÇÃO DE IMPRESSÃO NORMAL ---
    const handlePrint = useReactToPrint({ contentRef: componentRef, documentTitle: `Comprovante` });

    // --- FUNÇÃO DE COMPARTILHAMENTO (NOVA!) ---
    const handleShare = async () => {
        const element = componentRef.current;
        setSharing(true);

        // Configuração do html2pdf
        const opt = {
            margin: 0,
            filename: 'comprovante.pdf',
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2 },
            jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
        };

        try {
            // Gera o PDF como Blob (arquivo na memória)
            const pdfBlob = await html2pdf().set(opt).from(element).output('blob');

            // Cria um arquivo File
            const file = new File([pdfBlob], "comprovante_agendamento.pdf", { type: "application/pdf" });

            // Verifica se o navegador suporta compartilhamento de arquivos (Mobile)
            if (navigator.canShare && navigator.canShare({ files: [file] })) {
                await navigator.share({
                    files: [file],
                    title: 'Comprovante de Agendamento',
                    text: `Olá! Segue o comprovante do seu agendamento em ${nomeEmpresa}.`,
                });
            } else {
                // Fallback para Desktop: Se não puder compartilhar, baixa o PDF
                alert("Compartilhamento nativo não suportado neste navegador. O PDF será baixado.");
                const url = URL.createObjectURL(pdfBlob);
                const a = document.createElement('a');
                a.href = url;
                a.download = "comprovante_agendamento.pdf";
                a.click();
            }
        } catch (error) {
            console.error("Erro ao compartilhar:", error);
            alert("Não foi possível gerar o compartilhamento. Tente imprimir.");
        } finally {
            setSharing(false);
        }
    };
    // -------------------------------------

    const getDadosComprovante = () => {
        const clienteNome = listaClientes.find(c => c.id == clienteId)?.nome || "Cliente";
        const procedimentoNome = listaProcedimentos.find(p => p.id == procedimentoId)?.procedimento || "Procedimento";
        const formatMoney = (val) => parseFloat(val || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
        const dataFormatada = data ? data.split('-').reverse().join('/') : "";
        const totalMultiplo = pagamentosMultiplos.reduce((acc, p) => acc + parseFloat(p.valor || 0), 0);
        const totalPago = parseFloat(valorParcial || 0) + totalMultiplo;
        return {
            empresaNome: nomeEmpresa, empresaLogo: logo, clienteNome, dataFormatada, horaInicial, horaFinal, procedimentoNome, observacoes,
            valorTotal: formatMoney(valorProcedimento), valorDesconto: valorDesconto, valorDescontoFormatado: formatMoney(valorDesconto),
            valorPago: formatMoney(totalPago), valorRestante: formatMoney(valorProcedimento - totalPago)
        };
    };

    const valorOriginalBase = (parseFloat(valorProcedimento) + parseFloat(valorDesconto));
    const totalJaPagoSinal = valorParcial ? parseFloat(valorParcial) : 0;
    const totalJaPagoMultiplo = pagamentosMultiplos.reduce((acc, p) => acc + (p.valor ? parseFloat(p.valor) : 0), 0);
    const totalPagoGeral = totalJaPagoSinal + totalJaPagoMultiplo;
    const saldoDevedor = valorProcedimento - totalPagoGeral;

    return (
        <div className="container mt-4 pb-5">
            <div style={{ position: "absolute", top: "-9999px", left: "-9999px" }}>
                <Comprovante ref={componentRef} dados={getDadosComprovante()} />
            </div>

            <div className="card shadow border-0">
                <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center py-3">
                    <h5 className="mb-0 fw-bold">{id ? "Editar" : "Novo"} Agendamento</h5>

                    {/* BOTÕES DE AÇÃO (Só se já estiver salvo) */}
                    {id && (
                        <div className="d-flex gap-2">
                            {/* Botão Imprimir (Desktop) */}
                            <button type="button" onClick={handlePrint} className="btn btn-light text-primary fw-bold btn-sm rounded-pill d-none d-md-inline-block">
                                🖨️ Imprimir
                            </button>

                            {/* Botão Compartilhar (Mobile/Geral) */}
                            <button type="button" onClick={handleShare} className="btn btn-warning text-dark fw-bold btn-sm rounded-pill shadow-sm" disabled={sharing}>
                                {sharing ? "Gerando..." : "📤 Compartilhar"}
                            </button>
                        </div>
                    )}
                </div>
                <div className="card-body p-4">
                    <form onSubmit={handleSubmit}>
                        {/* ... (O RESTO DO SEU FORMULÁRIO CONTINUA IGUAL, SEM ALTERAÇÕES) ... */}

                        <div className="row g-3 mb-3">
                            <div className="col-12 col-md-6">
                                <label className="form-label fw-bold">Cliente *</label>
                                <select className="form-select" required value={clienteId} onChange={(e) => setClienteId(e.target.value)}>
                                    <option value="">Selecione...</option>
                                    {listaClientes.map(cli => <option key={cli.id} value={cli.id}>{cli.nome}</option>)}
                                </select>
                            </div>
                            <div className="col-12 col-md-6">
                                <label className="form-label fw-bold">Data *</label>
                                <input type="date" className="form-control" required value={data} onChange={handleDataChange} />
                            </div>
                        </div>

                        <div className="mb-3">
                            <label className="form-label fw-bold">Procedimento *</label>
                            <select className="form-select" required value={procedimentoId} onChange={handleProcedimentoChange}>
                                <option value="">Selecione...</option>
                                {listaProcedimentos.map(proc => (
                                    <option key={proc.id} value={proc.id}>{proc.procedimento} (Base: R$ {proc.valor})</option>
                                ))}
                            </select>
                        </div>

                        <div className="card mb-4 border-secondary bg-light">
                            <div className="card-header bg-transparent border-bottom fw-bold text-uppercase text-secondary small">Financeiro</div>
                            <div className="card-body">
                                <div className="row g-4">
                                    <div className="col-12 col-md-5 border-end-md">
                                        <h6 className="text-success fw-bold mb-3">1. Sinal / Entrada</h6>
                                        <div className="mb-3">
                                            <label className="form-label small text-muted">Valor (R$)</label>
                                            <input type="number" step="0.01" className="form-control border-success" placeholder="0.00" value={valorParcial} onChange={(e) => setValorParcial(e.target.value)} />
                                        </div>
                                        <div className="mb-2">
                                            <label className="form-label small text-muted">Forma de Pagamento</label>
                                            <select className="form-select form-select-sm" value={formaSinalId} onChange={e => setFormaSinalId(e.target.value)}>
                                                <option value="">Selecione...</option>
                                                {listaPagamentos.map(fp => <option key={fp.id} value={fp.id}>{fp.nome}</option>)}
                                            </select>
                                        </div>
                                        {renderTaxaInfo(valorParcial, formaSinalId)}
                                        <hr className="d-md-none" />
                                    </div>

                                    <div className="col-12 col-md-7">
                                        <div className="d-flex justify-content-between align-items-center mb-3">
                                            <h6 className="text-primary fw-bold mb-0">2. Restante</h6>
                                            <button type="button" onClick={adicionarLinhaPagamento} className="btn btn-sm btn-outline-primary py-0">+ Add</button>
                                        </div>
                                        {pagamentosMultiplos.map((pg, index) => (
                                            <div key={pg.tempId} className="border rounded p-2 mb-2 bg-white">
                                                <div className="row g-2 align-items-center">
                                                    <div className="col-12 col-sm-6">
                                                        <select className="form-select form-select-sm" value={pg.formaId} onChange={(e) => atualizarLinhaPagamento(pg.tempId, 'formaId', e.target.value)}>
                                                            <option value="">Forma...</option>
                                                            {listaPagamentos.map(fp => <option key={fp.id} value={fp.id}>{fp.nome}</option>)}
                                                        </select>
                                                    </div>
                                                    <div className="col-9 col-sm-4">
                                                        <div className="input-group input-group-sm">
                                                            <span className="input-group-text">R$</span>
                                                            <input type="number" step="0.01" className="form-control" placeholder="0.00" value={pg.valor} onChange={(e) => atualizarLinhaPagamento(pg.tempId, 'valor', e.target.value)} />
                                                        </div>
                                                    </div>
                                                    <div className="col-3 col-sm-2 text-end">
                                                        <button type="button" onClick={() => removerLinhaPagamento(pg.tempId)} className="btn btn-sm btn-outline-danger w-100">X</button>
                                                    </div>
                                                </div>
                                                {renderTaxaInfo(pg.valor, pg.formaId)}
                                            </div>
                                        ))}
                                        <div className="mt-3 pt-3 border-top text-end">
                                            <div className="d-flex justify-content-between align-items-center mb-1">
                                                <span className="text-muted small">Total Serviço:</span>
                                                <span className="fw-bold">R$ {valorProcedimento.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                                            </div>
                                            {valorDesconto > 0 && (
                                                <div className="d-flex justify-content-between align-items-center text-success small mb-2">
                                                    <span>Desconto:</span>
                                                    <span>- R$ {valorDesconto.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                                                </div>
                                            )}
                                            <div className="d-flex justify-content-between align-items-center fs-5">
                                                <span className={saldoDevedor > 0.01 ? "text-danger fw-bold" : "text-success fw-bold"}>{saldoDevedor > 0.01 ? "Falta:" : "Quitado:"}</span>
                                                <span className={saldoDevedor > 0.01 ? "text-danger fw-bold" : "text-success fw-bold"}>R$ {Math.abs(saldoDevedor).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="row g-3 mb-4">
                            <div className="col-12 col-md-6">
                                <label className="form-label fw-bold">Status</label>
                                <select className="form-select" value={status} onChange={(e) => setStatus(e.target.value)}>
                                    <option value="PENDENTE">Pendente</option>
                                    <option value="CONFIRMADO">Confirmado</option>
                                    <option value="CONCLUIDO">Concluído</option>
                                    <option value="CANCELADO">Cancelado</option>
                                </select>
                            </div>
                            <div className="col-6 col-md-3">
                                <label className="form-label fw-bold">Início</label>
                                <input type="time" className="form-control" required value={horaInicial} onChange={(e) => setHoraInicial(e.target.value)} />
                            </div>
                            <div className="col-6 col-md-3">
                                <label className="form-label fw-bold">Fim</label>
                                <input type="time" className="form-control" value={horaFinal} onChange={(e) => setHoraFinal(e.target.value)} />
                            </div>
                        </div>

                        <div className="mb-4">
                            <label className="form-label fw-bold">Observações</label>
                            <textarea className="form-control" rows="3" value={observacoes} onChange={(e) => setObservacoes(e.target.value)}></textarea>
                        </div>

                        <div className="d-grid gap-2">
                            <button type="submit" className="btn btn-success btn-lg py-3 rounded-pill shadow fw-bold">💾 Salvar Agendamento</button>
                            <button type="button" className="btn btn-outline-secondary rounded-pill" onClick={() => navigate("/agendamentos")}>Cancelar</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default AgendamentoFormPage;