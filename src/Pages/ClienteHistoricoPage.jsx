import { useEffect, useState, useContext } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../Services/api";
import { ThemeContext } from "../Context/ThemeContext"; // 1. Importe o Contexto

function ClienteHistoricoPage() {
  const { primaryColor } = useContext(ThemeContext); // 2. Pegue a cor do tema
  const { id } = useParams();

  const [mapeamentos, setMapeamentos] = useState([]);
  const [cliente, setCliente] = useState({ nome: "" });

  useEffect(() => {
    // Busca dados do cliente
    api.get(`/clientes/${id}`).then(res => setCliente(res.data));

    // Busca histórico (mapeamentos)
    api.get(`/mapeamentos/cliente/${id}`)
      .then(res => setMapeamentos(res.data))
      .catch(err => console.error("Erro ao buscar histórico:", err));
  }, [id]);

  const handleDelete = (mapId) => {
    if (window.confirm("Excluir este registro?")) {
      api.delete(`/mapeamentos/${mapId}`)
        .then(() => setMapeamentos(mapeamentos.filter(m => m.id !== mapId)));
    }
  }

  // Formata data YYYY-MM-DD para DD/MM/YYYY
  const formatDate = (dateString) => {
    if (!dateString) return "N/D";
    const [ano, mes, dia] = dateString.split("-");
    return `${dia}/${mes}/${ano}`;
  };

  return (
    <div className="container mt-4 mb-5">

      {/* --- CABEÇALHO DO CLIENTE --- */}
      <div className="card shadow border-0 mb-4">
        <div className="card-header text-white py-3 d-flex justify-content-between align-items-center"
          style={{ backgroundColor: primaryColor }}>
          <div>
            <h5 className="mb-0 fw-bold">📁 Histórico: {cliente.nome}</h5>
            <small className="opacity-75">Galeria de procedimentos realizados</small>
          </div>
          <Link to="/clientes" className="btn btn-light btn-sm fw-bold text-dark rounded-pill px-3">
            Voltar
          </Link>
        </div>
      </div>

      {/* --- GALERIA --- */}
      <div className="row">
        {mapeamentos.length === 0 ? (
          <div className="col-12">
            <div className="alert alert-secondary text-center py-5 border-0 shadow-sm">
              <div className="fs-1 mb-2">📷</div>
              <p className="mb-0">Nenhum registro de mídia encontrado para este cliente.</p>
            </div>
          </div>
        ) : (
          mapeamentos.map((item) => (
            <div key={item.id} className="col-md-6 col-lg-4 mb-4">
              <div className="card shadow-sm h-100 border-0">

                {/* DATA E HORA (Topo do Card) */}
                <div className="card-header bg-white border-bottom-0 pt-3 pb-2 d-flex justify-content-between align-items-center">
                  <span className="badge bg-light text-dark border">
                    📅 {item.agendamentos ? formatDate(item.agendamentos.data) : "Data Antiga"}
                  </span>
                  <small className="text-muted fw-bold">
                    {item.agendamentos ? `${item.agendamentos.horaInicial}h` : "--:--"}
                  </small>
                </div>

                {/* ÁREA DA MÍDIA */}
                <div className="bg-light d-flex justify-content-center align-items-center position-relative overflow-hidden" style={{ height: "250px" }}>
                  {item.midia ? (
                    <>
                      {item.tipoArquivo && item.tipoArquivo.includes("video") ? (
                        <video controls style={{ maxWidth: "100%", maxHeight: "100%" }}>
                          <source src={`data:${item.tipoArquivo};base64,${item.midia}`} />
                        </video>
                      ) : (
                        <img
                          src={`data:${item.tipoArquivo};base64,${item.midia}`}
                          alt="Mapeamento"
                          style={{ width: "100%", height: "100%", objectFit: "cover" }}
                          // Clique para abrir em tela cheia (opcional, lógica simples)
                          onClick={() => window.open(`data:${item.tipoArquivo};base64,${item.midia}`)}
                          className="cursor-pointer"
                        />
                      )}
                    </>
                  ) : (
                    <span className="text-muted">Sem imagem</span>
                  )}
                </div>

                {/* CORPO DO CARD */}
                <div className="card-body">
                  <h6 className="fw-bold text-dark mb-1">
                    {item.procedimentos?.procedimento || "Procedimento"}
                  </h6>

                  <p className="card-text small text-muted mb-3">
                    {item.descricao || "Sem observações."}
                  </p>

                  {/* Detalhes do Agendamento (Expansível ou fixo) */}
                  {item.agendamentos && (
                    <div className="p-2 bg-light rounded border small mb-3">
                      <strong>Agendamento:</strong> {item.agendamentos.status}
                    </div>
                  )}

                  <button onClick={() => handleDelete(item.id)} className="btn btn-outline-danger btn-sm w-100 rounded-pill">
                    🗑️ Excluir
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default ClienteHistoricoPage;