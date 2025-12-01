import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../Services/api";

function ProcedimentoFormPage() {
  // 1. Definição dos Estados (Com os nomes IGUAIS ao Java)
  const [procedimento, setProcedimento] = useState("");
  const [descricao, setDescricao] = useState("");
  const [valor, setValor] = useState("");
  
  const [categoriaId, setCategoriaId] = useState(""); 
  const [listaCategorias, setListaCategorias] = useState([]);
  const [id, setId] = useState(null);

  const navigate = useNavigate();
  const { id: paramId } = useParams();

  // Carrega categorias para o Select
  useEffect(() => {
    api.get("/categorias")
      .then((res) => setListaCategorias(res.data))
      .catch((err) => console.error("Erro ao carregar categorias", err));
  }, []);

  // Carrega dados se for Edição
  useEffect(() => {
    if (paramId && paramId !== "novo") {
      api.get(`/procedimentos/${paramId}`)
        .then((response) => {
          const dados = response.data;
          // Preenche os campos usando os nomes do Java
          setProcedimento(dados.procedimento);
          setDescricao(dados.descricao);
          setValor(dados.valor);
          setId(dados.id);
          
          if (dados.categoria) {
            setCategoriaId(dados.categoria.id);
          }
        })
        .catch((error) => console.error("Erro ao carregar procedimento", error));
    }
  }, [paramId]);

  const handleSubmit = (e) => {
    e.preventDefault();

    const dadosParaEnviar = {
      procedimento: procedimento, // Envia a variável 'procedimento'
      descricao: descricao,
      valor: valor ? parseFloat(valor) : 0, 
      categoria: {
        id: categoriaId 
      }
    };

    const request = id 
      ? api.put(`/procedimentos/${id}`, dadosParaEnviar)
      : api.post("/procedimentos", dadosParaEnviar);

    request
      .then(() => {
        alert("Salvo com sucesso!");
        navigate("/procedimentos");
      })
      .catch((err) => alert("Erro ao salvar."));
  };

  return (
    <div className="container mt-5">
      <div className="card shadow">
        <div className="card-header bg-primary text-white">
          <h3>{id ? "Editar Procedimento" : "Novo Procedimento"}</h3>
        </div>
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            
            {/* --- AQUI ESTAVA O ERRO --- */}
            <div className="mb-3">
              <label className="form-label">Nome do Procedimento</label>
              <input 
                type="text" className="form-control" required
                // O valor agora deve ser 'procedimento', não 'nome'
                value={procedimento} 
                onChange={(e) => setProcedimento(e.target.value)}
              />
            </div>

            {/* Campo Descrição */}
            <div className="mb-3">
              <label className="form-label">Descrição</label>
              <input 
                type="text" className="form-control"
                value={descricao} onChange={(e) => setDescricao(e.target.value)}
              />
            </div>

            {/* Campo Valor */}
            <div className="mb-3">
              <label className="form-label">Valor (R$)</label>
              <input 
                type="number" step="0.01" className="form-control" required
                value={valor} onChange={(e) => setValor(e.target.value)}
              />
            </div>

            {/* Select de Categoria */}
            <div className="mb-3">
              <label className="form-label">Categoria</label>
              <select 
                className="form-select" required
                value={categoriaId} 
                onChange={(e) => setCategoriaId(e.target.value)}
              >
                <option value="">Selecione uma categoria...</option>
                {listaCategorias.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.categoria} 
                  </option>
                ))}
              </select>
            </div>

            <button type="submit" className="btn btn-success me-2">Salvar</button>
            <button type="button" className="btn btn-secondary" onClick={() => navigate("/procedimentos")}>Cancelar</button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ProcedimentoFormPage;