import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../Services/api";

function CategoriaFormPage() {
  const [categoria, setCategoria] = useState(""); 
  const [descricao, setDescricao] = useState("");
  const [id, setId] = useState(null);
  
  const navigate = useNavigate();
  const { id: paramId } = useParams();

  // useEffect blindado
  useEffect(() => {
    // AQUI ESTÁ A CORREÇÃO:
    // Só entra no IF se tiver paramId E se esse paramId NÃO for a palavra "novo"
    if (paramId && paramId !== "novo") {
      
      console.log("Tentando buscar dados para edição do ID:", paramId);
      
      api.get(`/categorias/${paramId}`)
        .then((response) => {
          setCategoria(response.data.categoria);
          setDescricao(response.data.descricao);
          setId(response.data.id);
        })
        .catch((error) => {
          console.error("Erro no GET:", error);
          // Opcional: Se der erro, não mostre alert para não travar a tela
          // alert("Erro ao carregar dados.");
        });
    }
  }, [paramId]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const dadosParaEnviar = { 
      categoria: categoria,
      descricao: descricao
    }; 

    if (id) {
      api.put(`/categorias/${id}`, dadosParaEnviar)
        .then(() => {
            alert("Atualizado com sucesso!");
            navigate("/categorias");
        })
        .catch((err) => {
            console.error("Erro ao atualizar:", err);
            alert("Erro ao atualizar.");
        });
    } else {
      api.post("/categorias", dadosParaEnviar)
        .then(() => {
            alert("Criado com sucesso!");
            navigate("/categorias");
        })
        .catch((err) => {
            console.error("Erro ao criar:", err);
            alert("Erro ao criar.");
        });
    }
  };

  return (
    <div className="container mt-5">
      <div className="card shadow">
        <div className="card-header bg-primary text-white">
          <h3>{id ? `Editar Categoria (ID: ${id})` : "Nova Categoria"}</h3>
        </div>
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            
            <div className="mb-3">
              <label className="form-label">Nome da Categoria</label>
              <input 
                type="text" 
                className="form-control" 
                value={categoria}
                onChange={(e) => setCategoria(e.target.value)}
                required
              />
            </div>

             <div className="mb-3">
              <label className="form-label">Descrição</label>
              <input 
                type="text" 
                className="form-control" 
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
              />
            </div>

            <button type="submit" className="btn btn-success me-2">Salvar</button>
            <button type="button" className="btn btn-secondary" onClick={() => navigate("/categorias")}>Cancelar</button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default CategoriaFormPage;