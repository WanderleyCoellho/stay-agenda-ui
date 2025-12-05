import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../Services/api";

function CategoriasPage() {
  const [categorias, setCategorias] = useState([]);
  const [busca, setBusca] = useState("");

  const loadCategorias = () => {
    api.get("/categorias")
      .then((res) => setCategorias(res.data))
      .catch((err) => console.error("Erro ao carregar categorias", err));
  };

  useEffect(() => {
    loadCategorias();
  }, []);

  const handleDelete = (id) => {
    if (window.confirm("Tem certeza que deseja excluir esta categoria?")) {
      api.delete(`/categorias/${id}`)
        .then(() => loadCategorias())
        .catch((err) => alert("Erro ao excluir. Verifique se não há procedimentos vinculados."));
    }
  };

  // Filtro de Busca
  const categoriasFiltradas = categorias.filter((cat) => {
    const termo = busca.toLowerCase();
    return cat.categoria.toLowerCase().includes(termo) ||
      (cat.descricao && cat.descricao.toLowerCase().includes(termo));
  });

  return (
    <div className="container mt-4 mb-5">

      {/* CABEÇALHO COM BUSCA */}
      <div className="row mb-4 align-items-center g-3">
        <div className="col-md-4">
          <h2 className="fw-bold text-secondary mb-0">📂 Categorias</h2>
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
              placeholder="Buscar categoria..."
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
          <Link to="/categorias/novo" className="btn btn-primary shadow-sm rounded-pill px-4 fw-bold w-100 w-md-auto">
            + Nova Categoria
          </Link>
        </div>
      </div>

      <div className="card shadow border-0 bg-transparent">
        <div className="card-body p-0">

          <table className="table table-hover align-middle mb-0 mobile-table" style={{ background: 'white', borderRadius: '12px' }}>
            <thead className="bg-light">
              <tr>
                <th className="ps-4">Nome</th>
                <th>Descrição</th>
                <th className="text-end pe-4">Ações</th>
              </tr>
            </thead>
            <tbody>
              {categoriasFiltradas.length > 0 ? (
                categoriasFiltradas.map((cat) => (
                  <tr key={cat.id}>
                    <td className="ps-4 fw-bold text-primary" data-label="Nome">
                      {cat.categoria}
                    </td>

                    <td className="text-muted small" data-label="Descrição">
                      {cat.descricao || "---"}
                    </td>

                    <td className="text-end pe-4 text-nowrap" data-label="Ações">
                      <div className="d-inline-flex gap-2">
                        <Link
                          to={`/categorias/editar/${cat.id}`}
                          className="btn btn-sm btn-outline-primary"
                          title="Editar"
                        >
                          ✏️
                        </Link>
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleDelete(cat.id)}
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
                  <td colSpan="3" className="text-center py-5 text-muted">
                    <div className="fs-1 mb-2">📂</div>
                    <p>Nenhuma categoria encontrada.</p>
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

export default CategoriasPage;