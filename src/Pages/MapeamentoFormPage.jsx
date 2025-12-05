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

  const [agendamento, setAgendamento] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setArquivo(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!arquivo) return alert("Por favor, selecione uma mídia!");

    const formData = new FormData();
    formData.append("arquivo", arquivo);
    formData.append("descricao", descricao);
    formData.append("agendamentoId", agendamentoId);

    if (agendamento.clientes) formData.append("clienteId", agendamento.clientes.id);
    if (agendamento.procedimentos) {
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
    <div className="container mt-4">
      <div className="card shadow border-0">
        <div className="card-header bg-warning text-dark py-3">
          <h4 className="mb-0 fw-bold">📷 Anexar Mídia</h4>
        </div>
        <div className="card-body p-4">

          <div className="alert alert-light border mb-4 shadow-sm">
            <strong>Cliente:</strong> {agendamento.clientes?.nome} <br />
            <strong>Data:</strong> {agendamento.data ? agendamento.data.split('-').reverse().join('/') : ''}
          </div>

          <form onSubmit={handleSubmit}>

            <label className="form-label fw-bold mb-3">Selecione a origem:</label>

            {/* --- BOTÕES DE SELEÇÃO (Android Fix) --- */}
            <div className="row g-2 mb-3">

              {/* OPÇÃO 1: CÂMERA (FOTO) */}
              <div className="col-4">
                <input
                  type="file" id="camFoto" hidden
                  accept="image/*" capture="environment"
                  onChange={handleFileChange}
                />
                <label htmlFor="camFoto" className="btn btn-outline-primary w-100 h-100 d-flex flex-column align-items-center justify-content-center py-3 border-2">
                  <span className="fs-1">📸</span>
                  <span className="small fw-bold mt-1">Foto</span>
                </label>
              </div>

              {/* OPÇÃO 2: FILMADORA (VÍDEO) */}
              <div className="col-4">
                <input
                  type="file" id="camVideo" hidden
                  accept="video/*" capture="environment"
                  onChange={handleFileChange}
                />
                <label htmlFor="camVideo" className="btn btn-outline-danger w-100 h-100 d-flex flex-column align-items-center justify-content-center py-3 border-2">
                  <span className="fs-1">🎥</span>
                  <span className="small fw-bold mt-1">Vídeo</span>
                </label>
              </div>

              {/* OPÇÃO 3: GALERIA */}
              <div className="col-4">
                <input
                  type="file" id="galeria" hidden
                  accept="image/*,video/*"
                  onChange={handleFileChange}
                />
                <label htmlFor="galeria" className="btn btn-outline-secondary w-100 h-100 d-flex flex-column align-items-center justify-content-center py-3 border-2">
                  <span className="fs-1">📁</span>
                  <span className="small fw-bold mt-1">Galeria</span>
                </label>
              </div>
            </div>

            {/* --- PREVIEW DO ARQUIVO SELECIONADO --- */}
            {arquivo ? (
              <div className="alert alert-success d-flex align-items-center animate__animated animate__fadeIn">
                <i className="bi bi-check-circle-fill me-2 fs-4"></i>
                <div className="text-truncate">
                  <strong>Arquivo pronto:</strong><br />
                  {arquivo.name}
                </div>
              </div>
            ) : (
              <p className="text-muted small text-center mb-4">Nenhum arquivo selecionado.</p>
            )}

            <div className="mb-4">
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
              <button type="submit" className="btn btn-success btn-lg shadow fw-bold" disabled={!arquivo}>
                Salvar Mídia
              </button>
              <button type="button" className="btn btn-outline-secondary rounded-pill" onClick={() => navigate("/agendamentos")}>
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