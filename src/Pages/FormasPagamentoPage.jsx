import { useEffect, useState } from "react";
import api from "../Services/api";

function FormasPagamentoPage() {
  const [formas, setFormas] = useState([]);
  
  // Estados do Formulário
  const [id, setId] = useState(null);
  const [nome, setNome] = useState("");
  const [taxa, setTaxa] = useState("");
  const [repassarTaxa, setRepassarTaxa] = useState(false);

  useEffect(() => {
    carregarFormas();
  }, []);

  const carregarFormas = () => {
    // URL corrigida para formaspagamento (sem hífen)
    api.get("/formaspagamento")
       .then((res) => setFormas(res.data))
       .catch(err => console.error("Erro ao carregar formas", err));
  };

  const iniciarEdicao = (forma) => {
      setId(forma.id);
      setNome(forma.nome);
      setTaxa(forma.taxa);
      setRepassarTaxa(forma.repassarTaxa || false);
      window.scrollTo(0, 0);
  };

  const cancelarEdicao = () => {
      setId(null);
      setNome("");
      setTaxa("");
      setRepassarTaxa(false);
  };

  const salvar = (e) => {
    e.preventDefault();
    if(!nome) return;
    
    const dados = { 
        nome, 
        taxa: taxa ? parseFloat(taxa) : 0,
        repassarTaxa
    };

    const request = id 
        ? api.put(`/formaspagamento/${id}`, dados) 
        : api.post("/formaspagamento", dados);

    request.then(() => {
        alert("Salvo com sucesso!");
        cancelarEdicao();
        carregarFormas();
    }).catch(() => alert("Erro ao salvar."));
  };

  const deletar = (idParaDeletar) => {
      if(window.confirm("Excluir esta forma de pagamento?")) {
          api.delete(`/formaspagamento/${idParaDeletar}`)
             .then(carregarFormas)
             .catch(err => alert("Erro ao excluir."));
      }
  };

  return (
    <div className="container mt-4 mb-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold text-secondary">💳 Formas de Pagamento</h2>
      </div>

      {/* --- FORMULÁRIO DE CADASTRO --- */}
      <div className="card shadow border-0 mb-4">
        <div className="card-header bg-dark text-white">
            <h5 className="mb-0">Configurar</h5>
        </div>
        <div className="card-body">
            <form onSubmit={salvar} className="row g-3 align-items-end">
                <div className="col-md-4">
                    <label className="form-label fw-bold">Nome</label>
                    <input 
                        type="text" className="form-control" 
                        placeholder="Ex: Crédito 1x" 
                        value={nome} onChange={e => setNome(e.target.value)}
                    />
                </div>
                <div className="col-md-3">
                    <label className="form-label fw-bold">Taxa (%)</label>
                    <div className="input-group">
                        <input 
                            type="number" step="0.01" className="form-control" 
                            placeholder="0.00" 
                            value={taxa} onChange={e => setTaxa(e.target.value)}
                        />
                        <span className="input-group-text">%</span>
                    </div>
                </div>
                
                <div className="col-md-3">
                    <div className="form-check form-switch mb-2">
                        <input 
                            className="form-check-input" type="checkbox" id="repassarCheck"
                            checked={repassarTaxa} 
                            onChange={e => setRepassarTaxa(e.target.checked)}
                        />
                        <label className="form-check-label small" htmlFor="repassarCheck">
                            Repassar taxa ao cliente?
                        </label>
                    </div>
                </div>

                <div className="col-md-2 d-flex gap-1">
                    <button className={`btn w-100 ${id ? 'btn-primary' : 'btn-success'}`}>
                        {id ? 'Salvar' : 'Adicionar'}
                    </button>
                    {id && <button type="button" onClick={cancelarEdicao} className="btn btn-secondary">X</button>}
                </div>
            </form>
        </div>
      </div>

      {/* --- LISTAGEM RESPONSIVA --- */}
      <div className="card shadow border-0 bg-transparent">
        <div className="card-body p-0">
            <table className="table table-hover align-middle mb-0 mobile-table" style={{background: 'white', borderRadius: '12px'}}>
                <thead className="bg-light">
                    <tr>
                        <th className="ps-4">Nome</th>
                        <th>Taxa (%)</th>
                        <th>Regra</th>
                        <th className="text-end pe-4">Ações</th>
                    </tr>
                </thead>
                <tbody>
                    {formas.map(f => (
                        <tr key={f.id}>
                            <td className="ps-4 fw-bold" data-label="Nome">{f.nome}</td>
                            <td data-label="Taxa">
                                {f.taxa > 0 
                                    ? <span className="badge bg-warning text-dark">{f.taxa}%</span> 
                                    : <span className="badge bg-success">Isento</span>
                                }
                            </td>
                            <td data-label="Regra">
                                {f.repassarTaxa 
                                    ? <span className="text-primary fw-bold">Repassa ao Cliente ↗️</span>
                                    : <span className="text-secondary">Estabelecimento Absorve ↘️</span>
                                }
                            </td>
                            <td className="text-end pe-4" data-label="Ações">
                                <button 
                                    onClick={() => iniciarEdicao(f)} 
                                    className="btn btn-sm btn-outline-primary me-2"
                                >
                                    ✏️
                                </button>
                                <button 
                                    onClick={() => deletar(f.id)} 
                                    className="btn btn-sm btn-outline-danger"
                                >
                                    🗑️
                                </button>
                            </td>
                        </tr>
                    ))}
                    {formas.length === 0 && (
                        <tr>
                            <td colSpan="4" className="text-center text-muted py-4">Nenhuma forma de pagamento cadastrada.</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
      </div>
    </div>
  );
}

export default FormasPagamentoPage;