import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../Services/api";

function ProcedimentosPage() {
  const [procedimentos, setProcedimentos] = useState([]);
  const [busca, setBusca] = useState("");

  // --- DADOS GLOBAIS DE CUSTO (Do LocalStorage) ---
  const [configGlobal, setConfigGlobal] = useState({
    salario: 0, fixos: 0, horasMensais: 160
  });

  useEffect(() => {
    // Carrega as configurações globais para poder calcular o sugerido na lista
    const salario = parseFloat(localStorage.getItem("calc_salario")) || 0;
    const fixos = parseFloat(localStorage.getItem("calc_fixos")) || 0;
    const dias = parseFloat(localStorage.getItem("calc_dias") || 5);
    const horasDia = parseFloat(localStorage.getItem("calc_horas_dia") || 8);
    const horasMensais = dias * horasDia * 4 || 160;

    setConfigGlobal({ salario, fixos, horasMensais });
    loadProcedimentos();
  }, []);

  const loadProcedimentos = () => {
    api.get("/procedimentos")
      .then((res) => setProcedimentos(res.data))
      .catch((err) => console.error("Erro", err));
  };

  const handleDelete = (id) => {
    if (window.confirm("Excluir?")) {
      api.delete(`/procedimentos/${id}`).then(() => loadProcedimentos());
    }
  };

  // --- FUNÇÃO QUE CALCULA O SUGERIDO NA VOLTA ---
  const calcularSugeridoItem = (proc) => {
    // Se não tiver dados de precificação salvos, retorna 0
    if (!proc.tempoMinutos || !proc.margemLucro) return 0;

    const { salario, fixos, horasMensais } = configGlobal;

    // 1. Custo Tempo
    const custoMinuto = (salario + fixos) / (horasMensais * 60);
    const custoTempo = custoMinuto * proc.tempoMinutos;

    // 2. Materiais
    let custoMateriais = 0;
    if (proc.materiais) {
      custoMateriais = proc.materiais.reduce((acc, m) => {
        const p = m.preco || 0;
        const r = m.rendimento || 1;
        return acc + (p / r);
      }, 0);
    }

    // 3. Final
    const base = custoTempo + custoMateriais;
    return base * (1 + (proc.margemLucro / 100));
  };

  // Formatador
  const fmt = (v) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

  const procedimentosFiltrados = procedimentos.filter((proc) =>
    proc.procedimento.toLowerCase().includes(busca.toLowerCase())
  );

  return (
    <div className="container mt-4 mb-5">

      <div className="row mb-4 align-items-center g-3">
        <div className="col-md-4"><h2 className="fw-bold text-secondary mb-0">💅 Procedimentos</h2></div>
        <div className="col-md-4">
          <div className="d-flex align-items-center bg-white shadow-sm border rounded-pill px-3 py-2">
            <span className="me-2 text-muted">🔍</span>
            <input type="text" className="form-control border-0 shadow-none p-0 bg-transparent" placeholder="Buscar..." value={busca} onChange={(e) => setBusca(e.target.value)} style={{ outline: 'none' }} />
            {busca && <button onClick={() => setBusca("")} className="btn btn-sm text-muted border-0 p-0 ms-2">✕</button>}
          </div>
        </div>
        <div className="col-md-4 text-md-end text-center">
          <Link to="/procedimentos/novo" className="btn btn-primary shadow-sm rounded-pill px-4 fw-bold">+ Novo</Link>
        </div>
      </div>

      <div className="card shadow border-0 bg-transparent">
        <div className="card-body p-0">
          <table className="table table-hover align-middle mb-0 mobile-table" style={{ background: 'white', borderRadius: '12px' }}>
            <thead className="bg-light">
              <tr>
                <th className="ps-4">Procedimento</th>
                <th>Categoria</th>

                {/* COLUNAS DE PREÇO */}
                <th className="text-center">Valor Atual</th>
                <th className="text-center">Sugerido (Calc)</th>

                <th className="text-end pe-4">Ações</th>
              </tr>
            </thead>
            <tbody>
              {procedimentosFiltrados.map((proc) => {
                const valorSugerido = calcularSugeridoItem(proc);
                const usaAuto = proc.usarPrecificacao; // A Flag do Banco

                return (
                  <tr key={proc.id}>
                    <td className="ps-4 fw-bold text-primary" data-label="Nome">{proc.procedimento}</td>

                    <td data-label="Categoria">
                      <span className="badge bg-secondary bg-opacity-10 text-secondary border">
                        {proc.categoria?.categoria || "S/C"}
                      </span>
                    </td>

                    {/* --- LÓGICA DE CORES --- */}

                    {/* 1. VALOR ATUAL (O que é cobrado) */}
                    <td className="text-center" data-label="Valor Atual">
                      <span className={`fw-bold ${!usaAuto ? 'text-success' : 'text-muted opacity-50'}`}>
                        {fmt(proc.valor)}
                      </span>
                      {!usaAuto && <small className="d-block text-success" style={{ fontSize: '0.7em' }}>Manual</small>}
                    </td>

                    {/* 2. VALOR SUGERIDO (Calculadora) */}
                    <td className="text-center" data-label="Sugerido">
                      <span className={`fw-bold ${usaAuto ? 'text-success' : 'text-muted opacity-50'}`}>
                        {valorSugerido > 0 ? fmt(valorSugerido) : "--"}
                      </span>
                      {usaAuto && <small className="d-block text-success" style={{ fontSize: '0.7em' }}>Automático</small>}
                    </td>

                    <td className="text-end pe-4" data-label="Ações">
                      <Link to={`/procedimentos/editar/${proc.id}`} className="btn btn-sm btn-outline-primary me-2">✏️</Link>
                      <button onClick={() => handleDelete(proc.id)} className="btn btn-sm btn-outline-danger">🗑️</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default ProcedimentosPage;