import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../Services/api";

function ClienteHistoricoPage() {
  const { id } = useParams();
  const [mapeamentos, setMapeamentos] = useState([]);
  const [cliente, setCliente] = useState({ nome: "" });

  useEffect(() => {
    api.get(`/clientes/${id}`).then(res => setCliente(res.data));
    
    api.get(`/mapeamentos/cliente/${id}`)
       .then(res => {
          console.log("Histórico carregado:", res.data); // Confira aqui se o 'agendamentos' veio preenchido
          setMapeamentos(res.data);
       })
       .catch(err => console.error("Erro ao buscar histórico:", err));
  }, [id]);

  const handleDelete = (mapId) => {
    if(window.confirm("Excluir este registro?")) {
      api.delete(`/mapeamentos/${mapId}`)
         .then(() => setMapeamentos(mapeamentos.filter(m => m.id !== mapId)));
    }
  }

  // Função para formatar data (yyyy-mm-dd -> dd/mm/yyyy)
  const formatDate = (dateString) => {
    if (!dateString) return "N/D";
    const [ano, mes, dia] = dateString.split("-");
    return `${dia}/${mes}/${ano}`;
  };

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
            <h2>Histórico: {cliente.nome}</h2>
            <p className="text-muted">Rastreabilidade de procedimentos e mídias</p>
        </div>
        <Link to="/clientes" className="btn btn-secondary">Voltar</Link>
      </div>

      <div className="row">
        {mapeamentos.length === 0 ? (
            <div className="col-12">
                <div className="alert alert-info">Nenhum registro encontrado.</div>
            </div>
        ) : (
            mapeamentos.map((item) => (
              <div key={item.id} className="col-md-6 col-lg-4 mb-4"> {/* Ajustei colunas */}
                <div className="card shadow-sm h-100 border-0">
                  
                  {/* CABEÇALHO DO CARD: DATA E HORA */}
                  <div className="card-header bg-light d-flex justify-content-between align-items-center">
                    <span className="badge bg-primary">
                        {item.agendamentos ? formatDate(item.agendamentos.data) : "Data Antiga"}
                    </span>
                    <small className="text-muted fw-bold">
                        {item.agendamentos ? `${item.agendamentos.horaInicial}h` : "--:--"}
                    </small>
                  </div>

                  {/* MÍDIA */}
                  <div className="bg-dark d-flex justify-content-center align-items-center position-relative" style={{height: "250px", overflow: "hidden"}}>
                    {item.midia ? (
                        item.tipoArquivo && item.tipoArquivo.includes("video") ? (
                            <video controls style={{maxWidth:"100%", maxHeight:"100%"}}>
                                <source src={`data:${item.tipoArquivo};base64,${item.midia}`} />
                            </video>
                        ) : (
                            <img 
                                src={`data:${item.tipoArquivo};base64,${item.midia}`} 
                                alt="Mapeamento" 
                                style={{maxWidth:"100%", maxHeight:"100%", objectFit:"contain"}}
                            />
                        )
                    ) : (
                        <span className="text-white-50">Sem imagem</span>
                    )}
                  </div>

                  {/* CORPO DO CARD */}
                  <div className="card-body">
                    <h5 className="card-title fw-bold text-dark">
                        {item.procedimentos?.procedimento || "Procedimento"}
                    </h5>
                    
                    {/* Descrição do Mapeamento (Upload) */}
                    <p className="card-text mb-2">
                        <strong>Obs Mídia:</strong> {item.descricao || "Sem observações."}
                    </p>

                    <hr />

                    {/* DETALHES DO AGENDAMENTO (RASTREABILIDADE) */}
                    {item.agendamentos ? (
                        <div className="alert alert-light border p-2 mb-0" style={{fontSize: "0.9em"}}>
                            <strong>Detalhes do Agendamento:</strong>
                            <ul className="mb-0 ps-3 mt-1">
                                <li>Status: {item.agendamentos.status}</li>
                                <li>Obs: {item.agendamentos.observacoes || "Nenhuma"}</li>
                                {/* Você pode adicionar mais campos aqui se quiser */}
                            </ul>
                        </div>
                    ) : (
                        <small className="text-muted fst-italic">Vínculo de agendamento não encontrado.</small>
                    )}

                    <button onClick={() => handleDelete(item.id)} className="btn btn-outline-danger btn-sm w-100 mt-3">
                        🗑️ Excluir Registro
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