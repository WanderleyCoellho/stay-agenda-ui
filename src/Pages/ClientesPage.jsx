import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../Services/api";

function ClientesPage() {
  const [clientes, setClientes] = useState([]);
  const [busca, setBusca] = useState(""); // Estado da pesquisa

  const loadClientes = () => {
    api.get("/clientes")
      .then((res) => setClientes(res.data))
      .catch((err) => console.error("Erro ao carregar clientes", err));
  };

  useEffect(() => {
    loadClientes();
  }, []);

  const handleDelete = (id) => {
    if (window.confirm("Tem certeza que deseja excluir este cliente?")) {
      api.delete(`/clientes/${id}`)
        .then(() => loadClientes())
        .catch((err) => alert("Erro ao excluir. Verifique se não há agendamentos vinculados."));
    }
  };

  // Lógica de Filtragem (Busca por Nome, Email ou Telefone)
  const clientesFiltrados = clientes.filter((cli) => {
    const termo = busca.toLowerCase();
    return (
      cli.nome.toLowerCase().includes(termo) ||
      (cli.email && cli.email.toLowerCase().includes(termo)) ||
      (cli.telefone && cli.telefone.includes(termo))
    );
  });

  return (
    <div className="container mt-4 mb-5">

      {/* --- CABEÇALHO COM BUSCA --- */}
      <div className="row mb-4 align-items-center g-3">
        <div className="col-md-4">
          <h2 className="fw-bold text-secondary mb-0">👥 Meus Clientes</h2>
        </div>

        {/* BARRA DE PESQUISA */}
        <div className="col-md-4">
          <div
            className="d-flex align-items-center bg-white shadow-sm border rounded-pill px-3 py-2"
            style={{ transition: "box-shadow 0.3s" }}
          >
            <span className="me-2 text-muted" style={{ fontSize: '1.1rem' }}>🔍</span>
            <input
              type="text"
              className="form-control border-0 shadow-none p-0 bg-transparent"
              placeholder="Buscar por nome ou telefone..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              style={{ outline: 'none' }}
            />
            {busca && (
              <button onClick={() => setBusca("")} className="btn btn-sm text-muted border-0 p-0 ms-2">✕</button>
            )}
          </div>
        </div>

        <div className="col-md-4 text-md-end text-center">
          <Link to="/clientes/novo" className="btn btn-primary shadow-sm rounded-pill px-4 fw-bold w-100 w-md-auto">
            + Novo Cliente
          </Link>
        </div>
      </div>

      {/* --- TABELA DE CLIENTES --- */}
      <div className="card shadow border-0 bg-transparent">
        <div className="card-body p-0">

          <table className="table table-hover align-middle mb-0 mobile-table" style={{ background: 'white', borderRadius: '12px' }}>
            <thead className="bg-light">
              <tr>
                <th className="ps-4">Nome</th>
                <th>Email</th>
                <th>Telefone</th>
                <th className="text-end pe-4">Ações</th>
              </tr>
            </thead>
            <tbody>
              {clientesFiltrados.length > 0 ? (
                clientesFiltrados.map((cliente) => (
                  <tr key={cliente.id}>
                    <td className="ps-4 fw-bold text-primary" data-label="Nome">
                      {cliente.nome}
                    </td>

                    <td className="text-muted" data-label="Email">
                      {cliente.email || "---"}
                    </td>

                    <td className="fw-bold" data-label="Telefone">
                      {cliente.telefone}
                    </td>

                    <td className="text-end pe-4 text-nowrap" data-label="Ações">
                      <div className="d-inline-flex gap-2">
                        <Link
                          to={`/clientes/historico/${cliente.id}`}
                          className="btn btn-sm btn-info text-white"
                          title="Histórico de Mídia"
                        >
                          📷
                        </Link>

                        <Link
                          to={`/clientes/editar/${cliente.id}`}
                          className="btn btn-sm btn-outline-primary"
                          title="Editar"
                        >
                          ✏️
                        </Link>
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleDelete(cliente.id)}
                          title="Excluir"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="text-center py-5 text-muted">
                    <div className="fs-1 mb-2">👥</div>
                    <p>Nenhum cliente encontrado para "<strong>{busca}</strong>".</p>
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

export default ClientesPage;