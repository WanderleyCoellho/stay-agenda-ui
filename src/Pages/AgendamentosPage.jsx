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

  const renderProcedimentos = (ag) => {
    let lista = [];
    if (ag.procedimentos && Array.isArray(ag.procedimentos)) {
      lista = ag.procedimentos;
    } else if (ag.listaProcedimentos && Array.isArray(ag.listaProcedimentos)) {
      lista = ag.listaProcedimentos;
    }

    if (lista.length > 0) {
      const primeiroNome = lista[0].procedimento || lista[0].nome;
      const restantes = lista.length - 1;

      if (restantes > 0) {
        return (
          <span>
            {primeiroNome} <span className="badge bg-secondary ms-1" style={{ fontSize: '0.7em' }}>+{restantes}</span>
          </span>
        );
      } else {
        return primeiroNome;
      }
    }

    if (ag.procedimento) return ag.procedimento.procedimento;
    if (ag.procedimentos && !Array.isArray(ag.procedimentos)) return ag.procedimentos.procedimento;

    return "---";
  };

  return (
    <div className="container mt-4 mb-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold text-secondary">📅 Agenda (Lista)</h2>
        <Link to="/agendamentos/novo" className="btn btn-primary shadow-sm rounded-pill">
          + Novo
        </Link>
      </div>

      <div className="card shadow border-0 bg-transparent">
        <div className="card-body p-0">

          <table className="table table-hover align-middle mb-0 mobile-table" style={{ background: 'white', borderRadius: '12px' }}>
            <thead className="bg-light">
              <tr>
                <th className="ps-4">Data</th>
                <th>Hora</th>
                <th>Cliente</th>
                <th>Procedimentos</th>
                <th>Status</th>
                <th className="text-end pe-4">Ações</th>
              </tr>
            </thead>
            <tbody>
              {agendamentos.map((ag) => (
                <tr key={ag.id}>
                  <td className="ps-4 text-muted" data-label="Data" style={{ whiteSpace: 'nowrap' }}>
                    {formatDate(ag.data)}
                  </td>

                  <td className="fw-bold text-primary" data-label="Hora" style={{ whiteSpace: 'nowrap' }}>
                    {ag.horaInicial}
                  </td>

                  {/* Cliente: Pode quebrar linha se for nome grande */}
                  <td className="fw-bold" data-label="Cliente" style={{ minWidth: '150px' }}>
                    {ag.clientes?.nome || "---"}
                  </td>

                  {/* Procedimentos: Pode quebrar linha à vontade */}
                  <td data-label="Procedimentos" className="text-dark" style={{ minWidth: '150px', wordWrap: 'break-word' }}>
                    {renderProcedimentos(ag)}
                  </td>

                  <td data-label="Status">
                    <span className={`badge rounded-pill ${ag.status === 'CONCLUIDO' ? 'bg-success' :
                      ag.status === 'CONFIRMADO' ? 'bg-primary' :
                        ag.status === 'CANCELADO' ? 'bg-danger' : 'bg-warning text-dark'
                      }`}>
                      {ag.status || "PENDENTE"}
                    </span>
                  </td>

                  {/* Ações: text-nowrap garante que fiquem lado a lado */}
                  <td className="text-end pe-4 text-nowrap" data-label="Ações">
                    <div className="d-inline-flex gap-2">
                      <Link
                        to={`/mapeamentos/novo/${ag.id}`}
                        className="btn btn-sm btn-outline-warning"
                        title="Anexar Foto"
                      >
                        📷
                      </Link>
                      <Link
                        to={`/agendamentos/editar/${ag.id}`}
                        className="btn btn-sm btn-outline-primary"
                      >
                        ✏️
                      </Link>
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => handleDelete(ag.id)}
                      >
                        🗑️
                      </button>
                    </div>
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