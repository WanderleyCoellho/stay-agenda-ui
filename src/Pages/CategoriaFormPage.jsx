import { useEffect, useState, useContext } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../Services/api";
import { ThemeContext } from "../Context/ThemeContext"; // 1. Importe o Contexto

function CategoriaFormPage() {
  const { primaryColor } = useContext(ThemeContext); // 2. Pegue a cor do tema

  const [categoria, setCategoria] = useState("");
  const [descricao, setDescricao] = useState("");

  const [id, setId] = useState(null);
  const navigate = useNavigate();
  const { id: paramId } = useParams();

  useEffect(() => {
    if (paramId && paramId !== "novo") {
      api.get(`/categorias/${paramId}`)
        .then((response) => {
          const dados = response.data;
          setCategoria(dados.categoria);
          setDescricao(dados.descricao || "");
          setId(dados.id);
        })
        .catch((error) => console.error("Erro ao carregar categoria", error));
    }
  }, [paramId]);

  const handleSubmit = (e) => {
    e.preventDefault();

    const dados = { categoria, descricao };

    const request = id
      ? api.put(`/categorias/${id}`, dados)
      : api.post("/categorias", dados);

    request
      .then(() => {
        alert("Categoria salva com sucesso!");
        navigate("/categorias");
      })
      .catch((err) => alert("Erro ao salvar categoria."));
  };

  return (
    <div className="container mt-5">
      <div className="card shadow border-0">

        {/* --- CABEÇALHO DINÂMICO --- */}
        <div className="card-header text-white py-3" style={{ backgroundColor: primaryColor }}>
          <h5 className="mb-0 fw-bold">{id ? "Editar" : "Nova"} Categoria</h5>
        </div>

        <div className="card-body p-4">
          <form onSubmit={handleSubmit}>

            <div className="mb-3">
              <label className="form-label fw-bold">Nome da Categoria *</label>
              <input
                type="text" className="form-control" required
                value={categoria} onChange={(e) => setCategoria(e.target.value)}
                placeholder="Ex: Cabelo, Barba, Estética Corporal..."
              />
            </div>

            <div className="mb-4">
              <label className="form-label fw-bold">Descrição</label>
              <textarea
                className="form-control" rows="3"
                value={descricao} onChange={(e) => setDescricao(e.target.value)}
                placeholder="Descrição opcional para esta categoria."
              ></textarea>
            </div>

            <div className="d-grid gap-2 d-md-flex justify-content-md-end">
              <button type="button" className="btn btn-outline-secondary rounded-pill px-4" onClick={() => navigate("/categorias")}>
                Cancelar
              </button>

              {/* --- BOTÃO DINÂMICO --- */}
              <button type="submit" className="btn text-white fw-bold rounded-pill px-4 shadow-sm" style={{ backgroundColor: primaryColor }}>
                Salvar
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}

export default CategoriaFormPage;