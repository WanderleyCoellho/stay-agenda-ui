import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../Services/api";

function CategoriasPage() {
  const [categorias, setCategorias] = useState([]);

  const loadCategorias = () => {
    api.get("/categorias")
      .then((res) => setCategorias(res.data))
      .catch((err) => console.error(err));
  };

  useEffect(() => { loadCategorias(); }, []);

  const handleDelete = (id) => {
    if (window.confirm("Excluir?")) {
      api.delete(`/categorias/${id}`).then(() => loadCategorias());
    }
  };

  return (
    <div className="container mt-4 mb-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold text-secondary">📂 Categorias</h2>
        <Link to="/categorias/novo" className="btn btn-primary shadow-sm rounded-pill">
          + Nova
        </Link>
      </div>

      <div className="card shadow border-0 bg-transparent">
        <div className="card-body p-0">
          <table className="table table-hover align-middle mb-0 mobile-table" style={{background: 'white', borderRadius: '12px'}}>
            <thead className="bg-light">
              <tr>
                <th className="ps-4">Nome</th>
                <th>Descrição</th>
                <th className="text-end pe-4">Ações</th>
              </tr>
            </thead>
            <tbody>
              {categorias.map((cat) => (
                <tr key={cat.id}>
                  <td className="ps-4 fw-bold" data-label="Categoria">{cat.categoria}</td>
                  <td className="text-muted small" data-label="Descrição">{cat.descricao}</td>
                  <td className="text-end pe-4" data-label="Ações">
                    <Link to={`/categorias/editar/${cat.id}`} className="btn btn-sm btn-outline-primary me-2">✏️</Link>
                    <button onClick={() => handleDelete(cat.id)} className="btn btn-sm btn-outline-danger">🗑️</button>
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

export default CategoriasPage;