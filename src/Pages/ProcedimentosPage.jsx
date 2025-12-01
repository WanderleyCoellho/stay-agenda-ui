import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../Services/api";

function ProcedimentosPage() {
  const [procedimentos, setProcedimentos] = useState([]);

  const loadProcedimentos = () => {
    api.get("/procedimentos")
      .then((res) => setProcedimentos(res.data))
      .catch((err) => console.error("Erro", err));
  };

  useEffect(() => {
    loadProcedimentos();
  }, []);

  const handleDelete = (id) => {
    if (window.confirm("Excluir?")) {
      api.delete(`/procedimentos/${id}`).then(() => loadProcedimentos());
    }
  };

  return (
    <div className="container mt-4 mb-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold text-secondary">💅 Procedimentos</h2>
        <Link to="/procedimentos/novo" className="btn btn-primary shadow-sm rounded-pill">
          + Novo
        </Link>
      </div>

      <div className="card shadow border-0 bg-transparent">
        <div className="card-body p-0">
          <table className="table table-hover align-middle mb-0 mobile-table" style={{background: 'white', borderRadius: '12px'}}>
            <thead className="bg-light">
              <tr>
                <th className="ps-4">Procedimento</th>
                <th>Categoria</th>
                <th>Valor</th>
                <th className="text-end pe-4">Ações</th>
              </tr>
            </thead>
            <tbody>
              {procedimentos.map((proc) => (
                <tr key={proc.id}>
                  <td className="ps-4 fw-bold" data-label="Nome">{proc.procedimento}</td>
                  <td data-label="Categoria">
                    <span className="badge bg-secondary bg-opacity-10 text-secondary border">
                        {proc.categoria?.categoria || "Sem Categoria"}
                    </span>
                  </td>
                  <td className="fw-bold text-success" data-label="Valor">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(proc.valor)}
                  </td>
                  <td className="text-end pe-4" data-label="Ações">
                    <Link to={`/procedimentos/editar/${proc.id}`} className="btn btn-sm btn-outline-primary me-2">✏️</Link>
                    <button onClick={() => handleDelete(proc.id)} className="btn btn-sm btn-outline-danger">🗑️</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default ProcedimentosPage;