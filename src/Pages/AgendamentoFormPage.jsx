import { useEffect, useState, useRef, useContext } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useReactToPrint } from "react-to-print";
import { Comprovante } from "../Components/Comprovante/Comprovante";
import api from "../Services/api";
import { EmpresaContext } from "../Context/EmpresaContext";
import { ThemeContext } from "../Context/ThemeContext"; // <--- IMPORT NOVO
import html2pdf from 'html2pdf.js';

function AgendamentoFormPage() {
    const { nomeEmpresa, logo } = useContext(EmpresaContext);
    const { primaryColor } = useContext(ThemeContext); // <--- PEGA A COR

    // Estados Básicos
    const [data, setData] = useState("");
    const [horaInicial, setHoraInicial] = useState("");
    const [horaFinal, setHoraFinal] = useState("");
    const [observacoes, setObservacoes] = useState("");
    const [status, setStatus] = useState("PENDENTE");
    const [clienteId, setClienteId] = useState("");

    // Múltiplos Procedimentos
    const [procedimentosSelecionados, setProcedimentosSelecionados] = useState([]);
    const [procedimentoInputId, setProcedimentoInputId] = useState("");

    // Financeiro
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
    const [sharing, setSharing] = useState(false);

    const navigate = useNavigate();
    const { id: paramId } = useParams();
    const componentRef = useRef();

    // --- HELPERS E LÓGICA (Mantidos iguais) ---
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
                        <div className="fw-bold" style={{ color: primaryColor }}>
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

    const adicionarProcedimento = () => {
        if (!procedimentoInputId) return;
        const procOriginal = listaProcedimentos.find(p => p.id == procedimentoInputId);
        if (!procOriginal) return;
        const novaLista = [...procedimentosSelecionados, {
            id: procOriginal.id, nome: procOriginal.procedimento, valor: procOriginal.valor
        }];
        setProcedimentosSelecionados(novaLista);
        recalcularTotal(novaLista, data);
        setProcedimentoInputId("");
    };

    const removerProcedimento = (indexToRemove) => {
        const novaLista = procedimentosSelecionados.filter((_, index) => index !== indexToRemove);
        setProcedimentosSelecionados(novaLista);
        recalcularTotal(novaLista, data);
    };

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
                    setData(dados.data || "");
                    setHoraInicial(dados.horaInicial || "");
                    setHoraFinal(dados.horaFinal || "");
                    setObservacoes(dados.observacoes || "");
                    setStatus(dados.status || "PENDENTE");
                    setId(dados.id);
                    setValorProcedimento(dados.valorProcedimento || 0);
                    setValorDesconto(dados.valorDesconto || 0);
                    setValorParcial(dados.valorParcial || "");

                    if (dados.clientes) setClienteId(dados.clientes.id);

                    if (dados.procedimentos && Array.isArray(dados.procedimentos)) {
                        setProcedimentosSelecionados(dados.procedimentos.map(p => ({ id: p.id, nome: p.procedimento, valor: p.valor })));
                    } else if (dados.procedimentos) {
                        setProcedimentosSelecionados([{ id: dados.procedimentos.id, nome: dados.procedimentos.procedimento, valor: dados.procedimentos.valor }]);
                    }

                    if (dados.formaPagamentoSinal) setFormaSinalId(dados.formaPagamentoSinal.id);

                    if (dados.pagamentos && dados.pagamentos.length > 0) {
                        const listaFormatada = dados.pagamentos.map((pg, index) => ({
                            tempId: index, formaId: pg.formaPagamento ? pg.formaPagamento.id : "", valor: pg.valor
                        }));
                        setPagamentosMultiplos(listaFormatada);
                    }

                    if (dados.promocao) {
                        setPromoAplicada(dados.promocao);
                        setNomePromocaoAtiva(dados.promocao.descricao);
                    } else if ((dados.valorDesconto || 0) > 0) {
                        encontrarNomePromocao(dados.data, null, resPromo.data);
                    }
                } catch (error) { console.error(error); }
            }
        };
        loadAllData();
    }, [paramId]);

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
        const encontrada = promosValidas[0];
        if (encontrada) setNomePromocaoAtiva(encontrada.descricao);
    };

    const recalcularTotal = (procs, dataAgendamento) => {
        let totalBruto = procs.reduce((acc, p) => acc + (p.valor || 0), 0);
        if (!dataAgendamento || procs.length === 0) {
            setValorProcedimento(totalBruto); setValorDesconto(0); setPromoAplicada(null); setNomePromocaoAtiva(""); return;
        }
        const dataRef = criarDataSegura(dataAgendamento);
        const promosValidas = listaPromocoes.filter(p => {
            if (p.status !== 'ATIVA') return false;
            const inicio = criarDataSegura(p.dataInicio);
            let fim = null;
            if (p.dataFim) { fim = criarDataSegura(p.dataFim); fim.setHours(23, 59, 59, 999); }
            return dataRef >= inicio && (!fim || dataRef <= fim);
        });
        const promo = promosValidas.find(p => !p.procedimento || procs.some(sel => sel.id === p.procedimento.id));
        let desconto = 0;
        if (promo) {
            if (promo.tipoDesconto === 'FIXO') { desconto = promo.valorPromocional; }
            else { desconto = (totalBruto * promo.valorPromocional) / 100; }
            setPromoAplicada(promo); setNomePromocaoAtiva(promo.descricao);
        } else {
            setPromoAplicada(null); setNomePromocaoAtiva("");
        }
        setValorDesconto(desconto);
        setValorProcedimento(Math.max(0, totalBruto - desconto));
    };

    const handleDataChange = (e) => { const novaData = e.target.value; setData(novaData); recalcularTotal(procedimentosSelecionados, novaData); };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (procedimentosSelecionados.length === 0) { alert("Selecione pelo menos um procedimento!"); return; }
        const listaPagamentosParaEnviar = pagamentosMultiplos
            .filter(p => p.valor && p.formaId)
            .map(p => ({ valor: parseFloat(p.valor), formaPagamento: { id: p.formaId } }));
        const dadosParaEnviar = {
            data, horaInicial, horaFinal: horaFinal || null, observacoes, status,
            valorProcedimento: valorProcedimento, valorDesconto: valorDesconto, valorParcial: valorParcial ? parseFloat(valorParcial) : 0,
            clientes: { id: clienteId },
            procedimentos: procedimentosSelecionados.map(p => ({ id: p.id })),
            formaPagamentoSinal: formaSinalId ? { id: formaSinalId } : null,
            promocao: promoAplicada ? { id: promoAplicada.id } : null,
            pagamentos: listaPagamentosParaEnviar
        };
        const request = id ? api.put(`/agendamentos/${id}`, dadosParaEnviar) : api.post("/agendamentos", dadosParaEnviar);
        request.then(() => { alert("Agendamento salvo!"); navigate("/agendamentos"); }).catch((err) => {
            if (err.response && err.response.status === 409) alert("❌ ERRO: Já existe um agendamento neste horário!");
            else alert("Erro ao salvar agendamento.");
        });
    };

    // --- COMPARTILHAMENTO / IMPRESSÃO INTELIGENTE ---
    const handleShare = async () => {
        const element = componentRef.current;
        setSharing(true);

        // Detecta se é celular (Android/iPhone/iPad)
        const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

        const opt = {
            margin: 0,
            filename: `comprovante_${data || 'agenda'}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };

        try {
            const pdfBlob = await html2pdf().set(opt).from(element).output('blob');
            const file = new File([pdfBlob], "comprovante.pdf", { type: "application/pdf" });

            // Lógica Híbrida:
            // Só usa o compartilhamento nativo se for MOBILE E se o navegador suportar.
            // No PC, forçamos o download direto.
            if (isMobile && navigator.canShare && navigator.canShare({ files: [file] })) {
                await navigator.share({
                    files: [file],
                    title: 'Comprovante',
                    text: `Olá! Segue o comprovante.`
                });
            } else {
                // No PC (ou se falhar o share), baixa o arquivo ou abre em nova aba
                const url = URL.createObjectURL(pdfBlob);

                // Cria link temporário para forçar download
                const a = document.createElement('a');
                a.href = url;
                a.download = `comprovante_${data || 'agenda'}.pdf`;
                document.body.appendChild(a); // Necessário para Firefox
                a.click();
                document.body.removeChild(a); // Limpa
                URL.revokeObjectURL(url); // Libera memória
            }
        } catch (error) {
            console.error("Erro ao gerar PDF:", error);
            alert("Erro ao gerar PDF.");
        } finally {
            setSharing(false);
        }
    };

    const getDadosComprovante = () => {
        const clienteNome = listaClientes.find(c => c.id == clienteId)?.nome || "Cliente";
        const nomesProcedimentos = procedimentosSelecionados.map(p => p.nome).join(", ");
        const formatMoney = (val) => parseFloat(val || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
        const dataFormatada = data ? data.split('-').reverse().join('/') : "";
        const totalMultiplo = pagamentosMultiplos.reduce((acc, p) => acc + parseFloat(p.valor || 0), 0);
        const totalPago = parseFloat(valorParcial || 0) + totalMultiplo;
        return {
            empresaNome: nomeEmpresa, empresaLogo: logo,
            clienteNome, dataFormatada, horaInicial, horaFinal,
            procedimentoNome: nomesProcedimentos, observacoes,
            valorTotal: formatMoney(valorProcedimento), valorDesconto: valorDesconto, valorDescontoFormatado: formatMoney(valorDesconto),
            valorPago: formatMoney(totalPago), valorRestante: formatMoney(valorProcedimento - totalPago)
        };
    };

    const totalJaPagoSinal = valorParcial ? parseFloat(valorParcial) : 0;
    const totalJaPagoMultiplo = pagamentosMultiplos.reduce((acc, p) => acc + (p.valor ? parseFloat(p.valor) : 0), 0);
    const totalPagoGeral = totalJaPagoSinal + totalJaPagoMultiplo;
    const saldoDevedor = valorProcedimento - totalPagoGeral;

    return (
        <div className="container mt-4 pb-5">
            {/* Componente Escondido - Forçamos largura de A4 (aprox 750px) para o PDF ficar cheio */}
            <div style={{ position: "absolute", top: "-9999px", left: "-9999px" }}>
                <Comprovante
                    ref={componentRef}
                    dados={getDadosComprovante()}
                    style={{ width: "750px", maxWidth: "none" }}
                />
            </div>

            <div className="card shadow border-0">
                {/* --- CABEÇALHO DINÂMICO (MUDANÇA VISUAL) --- */}
                <div className="card-header text-white d-flex justify-content-between align-items-center py-3"
                    style={{ backgroundColor: primaryColor }}>
                    <h5 className="mb-0 fw-bold">{id ? "Editar" : "Novo"} Agendamento</h5>
                    {id && (
                        <button type="button" onClick={handleShare} className="btn btn-light fw-bold btn-sm rounded-pill shadow-sm" style={{ color: primaryColor }} disabled={sharing}>
                            {sharing ? "Gerando..." : "📤 Compartilhar"}
                        </button>
                    )}
                </div>

                <div className="card-body p-4">
                    <form onSubmit={handleSubmit}>
                        {/* ... (Restante do HTML igual ao anterior) ... */}
                        {/* Linha 1 */}
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

                        {/* Procedimentos */}
                        <div className="mb-4 p-3 bg-light rounded border">
                            <label className="form-label fw-bold">Procedimentos</label>
                            <div className="d-flex gap-2 mb-2">
                                <select className="form-select" value={procedimentoInputId} onChange={(e) => setProcedimentoInputId(e.target.value)}>
                                    <option value="">Selecione um serviço...</option>
                                    {listaProcedimentos.map(proc => (
                                        <option key={proc.id} value={proc.id}>{proc.procedimento} (R$ {proc.valor})</option>
                                    ))}
                                </select>
                                <button type="button" onClick={adicionarProcedimento} className="btn btn-sm px-3 fw-bold text-white" style={{ backgroundColor: primaryColor }}>+</button>
                            </div>
                            {procedimentosSelecionados.length > 0 ? (
                                <ul className="list-group mb-2">
                                    {procedimentosSelecionados.map((p, idx) => (
                                        <li key={idx} className="list-group-item d-flex justify-content-between align-items-center">
                                            <span>{p.nome} <small className="text-muted">R$ {p.valor}</small></span>
                                            <button type="button" onClick={() => removerProcedimento(idx)} className="btn btn-sm btn-outline-danger py-0">x</button>
                                        </li>
                                    ))}
                                </ul>
                            ) : (<small className="text-muted fst-italic">Nenhum procedimento adicionado.</small>)}
                        </div>

                        {/* Financeiro */}
                        <div className="card mb-4 border-secondary">
                            <div className="card-header bg-light fw-bold d-flex justify-content-between">
                                <span>Financeiro</span>
                                <span className={saldoDevedor > 0.01 ? "text-danger" : "text-success"}>
                                    {saldoDevedor > 0.01 ? `Falta: R$ ${saldoDevedor.toFixed(2)}` : "Pago ✅"}
                                </span>
                            </div>
                            <div className="card-body p-3">
                                <div className="row g-4">
                                    <div className="col-12 col-md-5 border-end-md">
                                        <h6 className="text-success fw-bold mb-3">1. Sinal / Entrada</h6>
                                        <div className="mb-2"><label className="small text-muted">Valor (R$)</label><input type="number" step="0.01" className="form-control border-success" placeholder="0.00" value={valorParcial} onChange={(e) => setValorParcial(e.target.value)} /></div>
                                        <div className="mb-2"><label className="small text-muted">Forma de Pagamento</label><select className="form-select form-select-sm" value={formaSinalId} onChange={e => setFormaSinalId(e.target.value)}><option value="">Selecione...</option>{listaPagamentos.map(fp => <option key={fp.id} value={fp.id}>{fp.nome}</option>)}</select></div>
                                        {renderTaxaInfo(valorParcial, formaSinalId)}
                                        <hr className="d-md-none" />
                                    </div>
                                    <div className="col-12 col-md-7">
                                        <div className="d-flex justify-content-between align-items-center mb-3">
                                            <h6 className="fw-bold mb-0" style={{ color: primaryColor }}>2. Restante</h6>
                                            <button type="button" onClick={adicionarLinhaPagamento} className="btn btn-sm btn-outline-primary py-0" style={{ borderColor: primaryColor, color: primaryColor }}>+ Add</button>
                                        </div>
                                        {pagamentosMultiplos.map((pg, index) => (
                                            <div key={pg.tempId} className="border rounded p-2 mb-2 bg-light">
                                                <div className="row g-2 align-items-center">
                                                    <div className="col-12 col-sm-6"><select className="form-select form-select-sm" value={pg.formaId} onChange={(e) => atualizarLinhaPagamento(pg.tempId, 'formaId', e.target.value)}><option value="">Forma...</option>{listaPagamentos.map(fp => <option key={fp.id} value={fp.id}>{fp.nome}</option>)}</select></div>
                                                    <div className="col-9 col-sm-4"><div className="input-group input-group-sm"><span className="input-group-text">R$</span><input type="number" step="0.01" className="form-control" placeholder="0.00" value={pg.valor} onChange={(e) => atualizarLinhaPagamento(pg.tempId, 'valor', e.target.value)} /></div></div>
                                                    <div className="col-3 col-sm-2 text-end"><button type="button" onClick={() => removerLinhaPagamento(pg.tempId)} className="btn btn-sm btn-outline-danger w-100">X</button></div>
                                                </div>
                                                {renderTaxaInfo(pg.valor, pg.formaId)}
                                            </div>
                                        ))}
                                        <div className="mt-3 pt-3 border-top text-end">
                                            <div className="d-flex justify-content-between align-items-center mb-1"><span className="text-muted small">Total Serviços:</span><span className="fw-bold" style={{ color: primaryColor }}>R$ {valorProcedimento.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span></div>
                                            {valorDesconto > 0 && (<div className="d-flex justify-content-between align-items-center text-success small mb-2"><span>Desconto:</span><span>- R$ {valorDesconto.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span></div>)}
                                            <div className="d-flex justify-content-between align-items-center fs-5"><span className={saldoDevedor > 0.01 ? "text-danger fw-bold" : "text-success fw-bold"}>{saldoDevedor > 0.01 ? "Falta:" : "Quitado:"}</span><span className={saldoDevedor > 0.01 ? "text-danger fw-bold" : "text-success fw-bold"}>R$ {Math.abs(saldoDevedor).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span></div>
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
                            <div className="col-6 col-md-3"><label className="form-label fw-bold">Início</label><input type="time" className="form-control" required value={horaInicial} onChange={(e) => setHoraInicial(e.target.value)} /></div>
                            <div className="col-6 col-md-3"><label className="form-label fw-bold">Fim</label><input type="time" className="form-control" value={horaFinal} onChange={(e) => setHoraFinal(e.target.value)} /></div>
                        </div>
                        <div className="mb-4"><label className="form-label fw-bold">Observações</label><textarea className="form-control" rows="3" value={observacoes} onChange={(e) => setObservacoes(e.target.value)}></textarea></div>

                        <div className="d-grid gap-2">
                            <button type="submit" className="btn btn-lg text-white shadow fw-bold" style={{ backgroundColor: primaryColor }}>💾 Salvar Agendamento</button>
                            <button type="button" className="btn btn-outline-secondary rounded-pill" onClick={() => navigate("/agendamentos")}>Cancelar</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default AgendamentoFormPage;