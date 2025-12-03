import { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../Services/api";
import { EmpresaContext } from "../Context/EmpresaContext";

function MapeamentoFormPage() {
  const { agendamentoId } = useParams();
  const navigate = useNavigate();
  const { nomeEmpresa } = useContext(EmpresaContext);

  const [descricao, setDescricao] = useState("");
  const [arquivo, setArquivo] = useState(null);

  // Dados do agendamento para exibir na tela
  const [agendamento, setAgendamento] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Busca o agendamento para saber quem é o cliente e qual o procedimento
    api.get(`/agendamentos/${agendamentoId}`)
      .then(res => {
        setAgendamento(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        alert("Erro ao carregar dados do agendamento.");
        navigate("/agendamentos");
      });
  }, [agendamentoId, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!arquivo) return alert("Por favor, tire uma foto ou selecione um arquivo!");

    const formData = new FormData();
    formData.append("arquivo", arquivo);
    formData.append("descricao", descricao);

    // Envia os IDs necessários para o vínculo
    formData.append("agendamentoId", agendamentoId);
    if (agendamento.clientes) formData.append("clienteId", agendamento.clientes.id);
    if (agendamento.procedimentos) {
      // Se for lista (novo), pega o primeiro, ou ajusta conforme sua regra de negócio
      // Aqui estou assumindo o primeiro para simplificar o vínculo principal
      const procId = Array.isArray(agendamento.procedimentos)
        ? agendamento.procedimentos[0].id
        : agendamento.procedimentos.id;
      formData.append("procedimentoId", procId);
    }

    try {
      await api.post("/mapeamentos", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      alert("Mídia salva com sucesso!");
      // Redireciona para o histórico do cliente
      if (agendamento.clientes) {
        navigate(`/clientes/historico/${agendamento.clientes.id}`);
      } else {
        navigate("/agendamentos");
      }
    } catch (error) {
      console.error(error);
      alert("Erro ao fazer upload. Verifique o tamanho do arquivo.");
    }
  };

  if (loading) return <div className="container mt-5 text-center">Carregando...</div>;

  return (
    <div className="container mt-5">
      <div className="card shadow border-0">
        <div className="card-header bg-warning text-dark">
          <h4 className="mb-0 fw-bold">📷 Anexar Mídia</h4>
        </div>
        <div className="card-body p-4">

          <div className="alert alert-light border mb-4">
            <strong>Cliente:</strong> {agendamento.clientes?.nome} <br />
            <strong>Data:</strong> {agendamento.data ? agendamento.data.split('-').reverse().join('/') : ''}
          </div>

          <form onSubmit={handleSubmit}>

            {/* CAMPO DE CÂMERA / ARQUIVO */}
            <div className="mb-4 text-center">
              <label className="form-label fw-bold d-block mb-2">Capturar Foto/Vídeo</label>

              <input
                type="file"
                className="form-control form-control-lg"
                id="cameraInput"

                // --- AQUI ESTÁ A MÁGICA PARA O MOBILE ---
                accept="image/*,video/*"
                capture="environment" // Tenta abrir a câmera traseira direto
                // ----------------------------------------

                required
                onChange={e => setArquivo(e.target.files[0])}
              />
              <div className="form-text mt-2">
                No celular, isso abrirá a câmera. No PC, abrirá seus arquivos.
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label fw-bold">Descrição / Observação</label>
              <textarea
                className="form-control"
                rows="3"
                placeholder="Ex: Antes do procedimento..."
                value={descricao}
                onChange={e => setDescricao(e.target.value)}
              ></textarea>
            </div>

            <div className="d-grid gap-2">
              <button type="submit" className="btn btn-success btn-lg shadow-sm fw-bold">
                Salvar Mídia
              </button>
              <button type="button" className="btn btn-outline-secondary" onClick={() => navigate("/agendamentos")}>
                Cancelar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default MapeamentoFormPage;