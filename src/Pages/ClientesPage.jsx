import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../Services/api";

function ClientesPage() {
  const [clientes, setClientes] = useState([]);

  const loadClientes = () => {
    api.get("/clientes")
      .then((res) => setClientes(res.data))
      .catch((err) => console.error("Erro ao carregar clientes", err));
  };

  useEffect(() => {
    loadClientes();
  }, []);

  const handleDelete = (id) => {
    if (window.confirm("Tem certeza que deseja excluir?")) {
      api.delete(`/clientes/${id}`)
        .then(() => loadClientes())
        .catch((err) => alert("Erro ao excluir."));
    }
  };

  return (
    <div className="container mt-4 mb-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold text-secondary">👥 Meus Clientes</h2>
        <Link to="/clientes/novo" className="btn btn-primary shadow-sm rounded-pill">
          + Novo
        </Link>
      </div>

      <div className="card shadow border-0 bg-transparent">
        <div className="card-body p-0">
          <table className="table table-hover align-middle mb-0 mobile-table" style={{background: 'white', borderRadius: '12px'}}>
            <thead className="bg-light">
              <tr>
                <th className="ps-4">Nome</th>
                <th>Email</th>
                <th>Telefone</th>
                <th className="text-end pe-4">Ações</th>
              </tr>
            </thead>
            <tbody>
              {clientes.map((cliente) => (
                <tr key={cliente.id}>
                  <td className="ps-4 fw-bold text-primary" data-label="Nome">
                      {cliente.nome}
                  </td>
                  <td data-label="Email">{cliente.email}</td>
                  <td data-label="Telefone">{cliente.telefone}</td>
                  <td className="text-end pe-4" data-label="Ações">
                    <Link 
                      to={`/clientes/historico/${cliente.id}`} 
                      className="btn btn-sm btn-info me-2 text-white rounded-pill px-3"
                    >
                      📷 Histórico
                    </Link>

                    <Link 
                      to={`/clientes/editar/${cliente.id}`} 
                      className="btn btn-sm btn-outline-primary me-2"
                    >
                      ✏️
                    </Link>
                    <button 
                      className="btn btn-sm btn-outline-danger" 
                      onClick={() => handleDelete(cliente.id)}
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

export default ClientesPage;