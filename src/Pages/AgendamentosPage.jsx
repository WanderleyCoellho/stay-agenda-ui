import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../Services/api";

function AgendamentosPage() {
  const [agendamentos, setAgendamentos] = useState([]);
  const [busca, setBusca] = useState("");

  const loadAgendamentos = () => {
    api.get("/agendamentos")
      .then((res) => {
        // Ordenação: Mais recentes/futuros primeiro
        const listaOrdenada = res.data.sort((a, b) => {
          const dataA = new Date(`${a.data}T${a.horaInicial}`);
          const dataB = new Date(`${b.data}T${b.horaInicial}`);
          return dataB - dataA;
        });
        setAgendamentos(listaOrdenada);
      })
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
    if (ag.procedimentos && Array.isArray(ag.procedimentos)) lista = ag.procedimentos;
    else if (ag.listaProcedimentos && Array.isArray(ag.listaProcedimentos)) lista = ag.listaProcedimentos;

    if (lista.length > 0) {
      const primeiroNome = lista[0].procedimento || lista[0].nome;
      const restantes = lista.length - 1;
      if (restantes > 0) {
        return <span>{primeiroNome} <span className="badge bg-secondary ms-1" style={{ fontSize: '0.7em' }}>+{restantes}</span></span>;
      } else {
        return primeiroNome;
      }
    }
    if (ag.procedimento) return ag.procedimento.procedimento;
    if (ag.procedimentos && !Array.isArray(ag.procedimentos)) return ag.procedimentos.procedimento;
    return "---";
  };

  const agendamentosFiltrados = agendamentos.filter((ag) => {
    const nomeCliente = ag.clientes?.nome?.toLowerCase() || "";
    const termoBusca = busca.toLowerCase();
    return nomeCliente.includes(termoBusca);
  });

  return (
    <div className="container mt-4 mb-5">

      {/* CABEÇALHO */}
      <div className="row mb-4 align-items-center g-3">
        <div className="col-md-4">
          <h2 className="fw-bold text-secondary mb-0">📅 Agenda</h2>
        </div>

        {/* BARRA DE PESQUISA ESTILO "CÁPSULA" */}
        <div className="col-md-4">
          <div
            className="d-flex align-items-center bg-white shadow-sm border rounded-pill px-3 py-2"
            style={{ transition: "box-shadow 0.3s" }}
          >
            <span className="me-2 text-muted" style={{ fontSize: '1.1rem' }}>🔍</span>
            <input
              type="text"
              className="form-control border-0 shadow-none p-0 bg-transparent"
              placeholder="Buscar cliente..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              style={{ outline: 'none' }}
            />
            {/* Botão X para limpar busca (aparece se tiver texto) */}
            {busca && (
              <button
                onClick={() => setBusca("")}
                className="btn btn-sm text-muted border-0 p-0 ms-2"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        <div className="col-md-4 text-md-end text-center">
          <Link to="/agendamentos/novo" className="btn btn-primary shadow-sm rounded-pill px-4 fw-bold w-100 w-md-auto">
            + Novo Agendamento
          </Link>
        </div>
      </div>

      {/* LISTA DE CARDS/TABELA */}
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
              {agendamentosFiltrados.length > 0 ? (
                agendamentosFiltrados.map((ag) => (
                  <tr key={ag.id}>
                    <td className="ps-4 text-muted" data-label="Data" style={{ whiteSpace: 'nowrap' }}>
                      {formatDate(ag.data)}
                    </td>

                    <td className="fw-bold text-primary" data-label="Hora" style={{ whiteSpace: 'nowrap' }}>
                      {ag.horaInicial}
                    </td>

                    <td className="fw-bold" data-label="Cliente" style={{ minWidth: '150px' }}>
                      {ag.clientes?.nome || "---"}
                    </td>

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

                    <td className="text-end pe-4 text-nowrap" data-label="Ações">
                      <div className="d-inline-flex gap-2">
                        <Link to={`/mapeamentos/novo/${ag.id}`} className="btn btn-sm btn-outline-warning" title="Anexar Foto">📷</Link>
                        <Link to={`/agendamentos/editar/${ag.id}`} className="btn btn-sm btn-outline-primary">✏️</Link>
                        <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(ag.id)}>🗑️</button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center py-5 text-muted">
                    <div className="fs-1 mb-2">🔍</div>
                    <p>Nenhum agendamento encontrado para "<strong>{busca}</strong>".</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default AgendamentosPage;