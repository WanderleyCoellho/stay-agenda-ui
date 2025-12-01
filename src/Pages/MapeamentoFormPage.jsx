import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../Services/api";

function MapeamentoFormPage() {
  const { agendamentoId } = useParams(); // Agora pegamos o ID do Agendamento
  const navigate = useNavigate();

  const [descricao, setDescricao] = useState("");
  const [arquivo, setArquivo] = useState(null);
  
  // Dados que vêm do agendamento (apenas para visualização e envio oculto)
  const [agendamento, setAgendamento] = useState(null);

  useEffect(() => {
    // Busca o agendamento para saber quem é o cliente e qual o procedimento
    api.get(`/agendamentos/${agendamentoId}`)
       .then(res => setAgendamento(res.data))
       .catch(err => alert("Erro ao carregar dados do agendamento."));
  }, [agendamentoId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!arquivo) return alert("Selecione um arquivo!");

    const formData = new FormData();
    formData.append("arquivo", arquivo);
    formData.append("descricao", descricao);
    // Pega os IDs direto do objeto carregado
    formData.append("agendamentoId", agendamentoId); 
    formData.append("clienteId", agendamento.clientes.id);
    formData.append("procedimentoId", agendamento.procedimentos.id);

    try {
        await api.post("/mapeamentos", formData, {
            headers: { "Content-Type": "multipart/form-data" }
        });
        alert("Mídia salva com sucesso!");
        // Redireciona para o histórico do cliente para ver a foto
        navigate(`/clientes/historico/${agendamento.clientes.id}`);
    } catch (error) {
        console.error(error);
        alert("Erro no upload.");
    }
  };

  if (!agendamento) return <div className="container mt-5">Carregando dados...</div>;

  return (
    <div className="container mt-5">
      <div className="card shadow">
        <div className="card-header bg-warning">
          <h3>Anexar Mídia ao Agendamento #{agendamentoId}</h3>
        </div>
        <div className="card-body">
          
          <div className="alert alert-secondary">
            <strong>Cliente:</strong> {agendamento.clientes?.nome} <br />
            <strong>Procedimento:</strong> {agendamento.procedimentos?.procedimento}
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label>Descrição / Observação</label>
              <textarea className="form-control" onChange={e => setDescricao(e.target.value)}></textarea>
            </div>

            <div className="mb-3">
              <label>Foto ou Vídeo</label>
              <input type="file" className="form-control" required onChange={e => setArquivo(e.target.files[0])} />
            </div>

            <button type="submit" className="btn btn-primary me-2">Salvar Mídia</button>
            <button type="button" className="btn btn-secondary" onClick={() => navigate("/agendamentos")}>Cancelar</button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default MapeamentoFormPage;