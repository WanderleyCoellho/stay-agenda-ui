import { useState, useEffect } from "react";

function CalculadoraPrecificacao({ onClose, onSave, dadosIniciais }) {

    // --- CONFIGURAÇÃO GLOBAL (Salva no Navegador) ---
    const [salarioDesejado, setSalarioDesejado] = useState(localStorage.getItem("calc_salario") || "");
    const [gastosFixosMensais, setGastosFixosMensais] = useState(localStorage.getItem("calc_fixos") || "");
    const [diasSemana, setDiasSemana] = useState(localStorage.getItem("calc_dias") || "5");
    const [horasDia, setHorasDia] = useState(localStorage.getItem("calc_horas_dia") || "8");
    const [horasMensais, setHorasMensais] = useState(160);

    // --- DADOS DO PROCEDIMENTO ---
    const [tempoMinutos, setTempoMinutos] = useState(dadosIniciais?.tempoMinutos || "60");
    const [lucroDesejado, setLucroDesejado] = useState(dadosIniciais?.margemLucro || "50");

    // --- MATERIAIS ---
    const [materiais, setMateriais] = useState(dadosIniciais?.materiais || []);
    const [novoMaterial, setNovoMaterial] = useState({ nome: "", preco: "", rendimento: "" });

    // --- RESULTADOS ---
    const [custoTotal, setCustoTotal] = useState(0);
    const [valorLucro, setValorLucro] = useState(0);
    const [precoSugerido, setPrecoSugerido] = useState(0);

    // Detalhamento Visual
    const [custoMaoDeObra, setCustoMaoDeObra] = useState(0);
    const [custoFixo, setCustoFixo] = useState(0);
    const [custoMaterial, setCustoMaterial] = useState(0);

    const safeParse = (val) => {
        if (!val) return 0;
        const str = String(val).replace(',', '.');
        return parseFloat(str) || 0;
    };

    // 1. Calcula Horas Mensais
    useEffect(() => {
        const d = safeParse(diasSemana);
        const h = safeParse(horasDia);
        const totalHoras = d * h * 4; // 4 semanas
        setHorasMensais(totalHoras || 1);

        localStorage.setItem("calc_dias", diasSemana);
        localStorage.setItem("calc_horas_dia", horasDia);
        localStorage.setItem("calc_salario", salarioDesejado);
        localStorage.setItem("calc_fixos", gastosFixosMensais);
    }, [diasSemana, horasDia, salarioDesejado, gastosFixosMensais]);

    // 2. O Grande Cálculo (Rateio)
    useEffect(() => {
        const salario = safeParse(salarioDesejado);
        const fixosMes = safeParse(gastosFixosMensais);
        const tempo = safeParse(tempoMinutos);
        const margem = safeParse(lucroDesejado);

        // A. Valor Mão de Obra (Salário / Horas * Tempo)
        const valorHoraMaoDeObra = salario / horasMensais;
        const totalMaoDeObra = valorHoraMaoDeObra * (tempo / 60);

        // B. Custo Fixo Proporcional (Total Fixo / Horas * Tempo)
        const valorHoraFixa = fixosMes / horasMensais;
        const totalFixo = valorHoraFixa * (tempo / 60);

        // C. Custo Material
        const totalMateriaisCalc = materiais.reduce((acc, item) => {
            const p = safeParse(item.preco);
            const r = safeParse(item.rendimento) || 1;
            return acc + (p / r);
        }, 0);

        // Totais
        const base = totalMaoDeObra + totalFixo + totalMateriaisCalc;
        const final = base * (1 + (margem / 100));
        const lucroReais = final - base;

        setCustoMaoDeObra(totalMaoDeObra);
        setCustoFixo(totalFixo);
        setCustoMaterial(totalMateriaisCalc);
        setCustoTotal(base);
        setValorLucro(lucroReais);
        setPrecoSugerido(final);

    }, [horasMensais, salarioDesejado, gastosFixosMensais, tempoMinutos, materiais, lucroDesejado]);

    const adicionarMaterial = () => {
        if (!novoMaterial.nome || !novoMaterial.preco || !novoMaterial.rendimento) return;
        setMateriais([...materiais, { ...novoMaterial, id: -Date.now() }]);
        setNovoMaterial({ nome: "", preco: "", rendimento: "" });
    };

    const removerMaterial = (id) => {
        setMateriais(materiais.filter(m => m.id !== id));
    };

    const formatMoney = (val) => val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

    const handleSave = () => {
        onSave({
            tempoMinutos: safeParse(tempoMinutos),
            margemLucro: safeParse(lucroDesejado),
            materiais: materiais,
            valorSugerido: precoSugerido
        });
    };

    return (
        <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', overflowY: 'auto', zIndex: 1050 }}>
            <div className="modal-dialog modal-lg modal-dialog-scrollable">
                <div className="modal-content">
                    <div className="modal-header bg-primary text-white">
                        <h5 className="modal-title">🧮 Precificação Detalhada</h5>
                        <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
                    </div>
                    <div className="modal-body">

                        {/* 1. CUSTOS MENSAIS */}
                        <div className="p-3 mb-3 bg-light rounded border">
                            <h6 className="text-primary fw-bold border-bottom pb-2 mb-3">1. Custos Mensais (Base de Cálculo)</h6>
                            <div className="row g-3">
                                <div className="col-md-6">
                                    <label className="small fw-bold text-dark">Pretensão Salarial (Mensal)</label>
                                    <input type="number" className="form-control" placeholder="Ex: 3000" value={salarioDesejado} onChange={e => setSalarioDesejado(e.target.value)} />
                                </div>
                                <div className="col-md-6">
                                    <label className="small fw-bold text-dark">Despesas Fixas (Aluguel, Luz...)</label>
                                    <input type="number" className="form-control" placeholder="Ex: 1000" value={gastosFixosMensais} onChange={e => setGastosFixosMensais(e.target.value)} />
                                </div>

                                <div className="col-6 col-md-4">
                                    <label className="small fw-bold text-dark">Dias/Semana</label>
                                    <input type="number" className="form-control" value={diasSemana} onChange={e => setDiasSemana(e.target.value)} />
                                </div>
                                <div className="col-6 col-md-4">
                                    <label className="small fw-bold text-dark">Horas/Dia</label>
                                    <input type="number" className="form-control" value={horasDia} onChange={e => setHorasDia(e.target.value)} />
                                </div>
                                <div className="col-12 col-md-4 d-flex align-items-end">
                                    <div className="alert alert-info w-100 mb-0 py-2 small text-center">
                                        Base de Cálculo: <strong>{horasMensais}h/mês</strong>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 2. PROCEDIMENTO */}
                        <div className="row g-3 mb-4">
                            <div className="col-12 border-bottom pb-2"><h6 className="text-secondary fw-bold mb-0">2. Sobre este Procedimento</h6></div>
                            <div className="col-6">
                                <label className="fw-bold small">Duração (minutos)</label>
                                <input type="number" className="form-control" value={tempoMinutos} onChange={e => setTempoMinutos(e.target.value)} />
                            </div>
                            <div className="col-6">
                                <label className="fw-bold small text-primary">Margem de Lucro %</label>
                                <div className="input-group">
                                    <input type="number" className="form-control border-primary" value={lucroDesejado} onChange={e => setLucroDesejado(e.target.value)} />
                                    <span className="input-group-text text-primary">%</span>
                                </div>
                            </div>
                        </div>

                        {/* 3. MATERIAIS */}
                        <div className="mb-3">
                            <h6 className="fw-bold border-bottom pb-1 text-secondary">3. Materiais de Consumo</h6>
                            <div className="row g-2 align-items-end mb-2">
                                <div className="col-12 col-md-4">
                                    <label className="small text-muted">Item</label>
                                    <input type="text" className="form-control" placeholder="Ex: Luva" value={novoMaterial.nome} onChange={e => setNovoMaterial({ ...novoMaterial, nome: e.target.value })} />
                                </div>
                                <div className="col-4 col-md-3">
                                    <label className="small text-muted">R$ Pacote</label>
                                    <input type="number" className="form-control" placeholder="0.00" value={novoMaterial.preco} onChange={e => setNovoMaterial({ ...novoMaterial, preco: e.target.value })} />
                                </div>
                                <div className="col-4 col-md-3">
                                    <label className="small text-muted">Rende Qts?</label>
                                    <input type="number" className="form-control" placeholder="1" value={novoMaterial.rendimento} onChange={e => setNovoMaterial({ ...novoMaterial, rendimento: e.target.value })} />
                                </div>
                                <div className="col-4 col-md-2">
                                    <label className="small text-muted">&nbsp;</label>
                                    <button className="btn btn-outline-primary w-100" onClick={adicionarMaterial}>Add</button>
                                </div>
                            </div>

                            {materiais.length > 0 && (
                                <div className="table-responsive border rounded bg-light" style={{ maxHeight: '150px' }}>
                                    <table className="table table-sm table-borderless mb-0 small">
                                        <thead><tr><th>Item</th><th>Custo Real</th><th></th></tr></thead>
                                        <tbody>
                                            {materiais.map(m => (
                                                <tr key={m.id}>
                                                    <td>{m.nome}</td>
                                                    <td className="fw-bold text-danger">{formatMoney(safeParse(m.preco) / safeParse(m.rendimento))}</td>
                                                    <td className="text-end"><button onClick={() => removerMaterial(m.id)} className="btn btn-link text-danger p-0">✕</button></td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>

                        {/* --- RESULTADO DETALHADO (EXATAMENTE COMO PEDIU) --- */}
                        <div className="card border-success bg-success bg-opacity-10 mt-4">
                            <div className="card-body">

                                {/* OS 3 PILARES DO CUSTO */}
                                <div className="row text-center mb-3 small text-muted">
                                    <div className="col border-end border-success">
                                        Valor Mão de Obra<br />
                                        <strong className="text-dark fs-6">{formatMoney(custoMaoDeObra)}</strong>
                                    </div>
                                    <div className="col border-end border-success">
                                        Custo Fixo<br />
                                        <strong className="text-dark fs-6">{formatMoney(custoFixo)}</strong>
                                    </div>
                                    <div className="col">
                                        Custo Material<br />
                                        <strong className="text-dark fs-6">{formatMoney(custoMaterial)}</strong>
                                    </div>
                                </div>

                                <div className="d-flex justify-content-between align-items-center mb-1 border-top border-success pt-2">
                                    <span className="small fw-bold text-uppercase">Custo Total (Base):</span>
                                    <strong className="text-danger">{formatMoney(custoTotal)}</strong>
                                </div>

                                <div className="d-flex justify-content-between align-items-center mb-3">
                                    <span className="small fw-bold text-uppercase">Lucro Líquido ({lucroDesejado}%):</span>
                                    <strong className="text-primary">+ {formatMoney(valorLucro)}</strong>
                                </div>

                                <div className="d-flex justify-content-between align-items-center bg-white p-3 rounded border border-success shadow-sm">
                                    <span className="fs-5 text-success fw-bold">Preço Final Sugerido:</span>
                                    <span className="fs-1 fw-bold text-success">{formatMoney(precoSugerido)}</span>
                                </div>
                            </div>
                        </div>

                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" onClick={onClose}>Cancelar</button>
                        <button type="button" className="btn btn-success fw-bold shadow" onClick={handleSave}>
                            💾 Salvar Precificação
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default CalculadoraPrecificacao;