import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../Services/api";

function AgendamentosPage() {
  const [agendamentos, setAgendamentos] = useState([]);

  const loadAgendamentos = () => {
    api.get("/agendamentos")
      .then((res) => setAgendamentos(res.data))
      .catch((err) => console.error("Erro ao carregar agendamentos", err));
  };

  useEffect(() => {
    loadAgendamentos();
  }, []);

  const handleDelete = (id) => {
    if (window.confirm("Tem certeza que deseja cancelar este agendamento?")) {
      api.delete(`/agendamentos/${id}`)
        .then(() => loadAgendamentos())
        .catch((err) => alert("Erro ao excluir."));
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const [ano, mes, dia] = dateString.split("-");
    return `${dia}/${mes}/${ano}`;
  };

  return (
    <div className="container mt-4 mb-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold text-secondary">📅 Agenda</h2>
        <Link to="/agendamentos/novo" className="btn btn-primary shadow-sm rounded-pill">
          + Novo
        </Link>
      </div>

      <div className="card shadow border-0 bg-transparent">
        <div className="card-body p-0">
          
          {/* ADICIONEI A CLASSE 'mobile-table' AQUI */}
          <table className="table table-hover align-middle mb-0 mobile-table" style={{background: 'white', borderRadius: '12px'}}>
            <thead className="bg-light">
              <tr>
                <th className="ps-4">Data</th>
                <th>Hora</th>
                <th>Cliente</th>
                <th>Procedimento</th>
                <th>Status</th>
                <th className="text-end pe-4">Ações</th>
              </tr>
            </thead>
            <tbody>
              {agendamentos.map((ag) => (
                <tr key={ag.id}>
                  {/* ADICIONEI data-label EM TODOS OS TDs */}
                  <td className="ps-4 text-muted" data-label="Data">
                      {formatDate(ag.data)}
                  </td>
                  
                  <td className="fw-bold text-primary" data-label="Hora">
                      {ag.horaInicial}
                  </td>
                  
                  <td className="fw-bold" data-label="Cliente">
                      {ag.clientes?.nome || "---"}
                  </td>
                  
                  <td data-label="Procedimento">
                      {ag.procedimento?.procedimento || ag.procedimentos?.procedimento || "---"}
                  </td>
                  
                  <td data-label="Status">
                    <span className={`badge rounded-pill ${
                      ag.status === 'CONCLUIDO' ? 'bg-success' : 
                      ag.status === 'CONFIRMADO' ? 'bg-primary' : 
                      ag.status === 'CANCELADO' ? 'bg-danger' : 'bg-warning text-dark'
                    }`}>
                      {ag.status || "PENDENTE"}
                    </span>
                  </td>

                  <td className="text-end pe-4" data-label="Ações">
                    <Link 
                      to={`/mapeamentos/novo/${ag.id}`} 
                      className="btn btn-sm btn-outline-warning me-2"
                      title="Anexar Foto"
                    >
                      📷
                    </Link>
                    <Link 
                      to={`/agendamentos/editar/${ag.id}`} 
                      className="btn btn-sm btn-outline-primary me-2"
                    >
                      ✏️
                    </Link>
                    <button 
                      className="btn btn-sm btn-outline-danger" 
                      onClick={() => handleDelete(ag.id)}
                    >
                      🗑️
                    </button>
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

export default AgendamentosPage;