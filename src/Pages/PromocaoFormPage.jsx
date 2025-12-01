import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../Services/api";

function PromocaoFormPage() {
  const [descricao, setDescricao] = useState("");
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [status, setStatus] = useState("ATIVA");
  
  const [valorPromocional, setValorPromocional] = useState("");
  const [tipoDesconto, setTipoDesconto] = useState("FIXO"); // FIXO ou PORCENTAGEM
  
  const [procedimentoId, setProcedimentoId] = useState(""); // Se vazio = Global
  const [listaProcedimentos, setListaProcedimentos] = useState([]);

  const [id, setId] = useState(null);
  const navigate = useNavigate();
  const { id: paramId } = useParams();

  useEffect(() => {
    // Carrega procedimentos para o select
    api.get("/procedimentos").then((res) => setListaProcedimentos(res.data));
  }, []);

  useEffect(() => {
    if (paramId && paramId !== "novo") {
      api.get(`/promocoes/${paramId}`)
        .then((response) => {
          const dados = response.data;
          setDescricao(dados.descricao);
          setDataInicio(dados.dataInicio);
          setDataFim(dados.dataFim || ""); // Se for null, vira vazio
          setStatus(dados.status);
          setValorPromocional(dados.valorPromocional);
          setTipoDesconto(dados.tipoDesconto);
          setId(dados.id);

          if (dados.procedimento) {
              setProcedimentoId(dados.procedimento.id);
          } else {
              setProcedimentoId(""); // Global
          }
        })
        .catch((error) => console.error("Erro ao carregar promoção", error));
    }
  }, [paramId]);

  const handleSubmit = (e) => {
    e.preventDefault();

    const dadosParaEnviar = {
      descricao,
      dataInicio,
      dataFim: dataFim || null, // Se vazio, envia null (indeterminado)
      status,
      valorPromocional: parseFloat(valorPromocional),
      tipoDesconto,
      // Se procedimentoId for vazio, envia NULL (Promoção Global)
      // Se tiver ID, envia o objeto com ID
      procedimento: procedimentoId ? { id: procedimentoId } : null
    };

    const request = id 
      ? api.put(`/promocoes/${id}`, dadosParaEnviar)
      : api.post("/promocoes", dadosParaEnviar);

    request
      .then(() => {
        alert("Promoção salva com sucesso!");
        navigate("/promocoes");
      })
      .catch((err) => alert("Erro ao salvar promoção."));
  };

  return (
    <div className="container mt-5">
      <div className="card shadow">
        <div className="card-header bg-success text-white">
          <h3>{id ? "Editar Promoção" : "Nova Promoção"}</h3>
        </div>
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            
            <div className="mb-3">
              <label className="form-label">Descrição da Campanha</label>
              <input 
                type="text" className="form-control" placeholder="Ex: Black Friday, Desconto de Natal..."
                required value={descricao} onChange={(e) => setDescricao(e.target.value)}
              />
            </div>

            {/* Linha de Datas */}
            <div className="row mb-3">
                <div className="col-md-4">
                    <label className="form-label">Data Início</label>
                    <input 
                        type="date" className="form-control" required
                        value={dataInicio} onChange={(e) => setDataInicio(e.target.value)}
                    />
                </div>
                <div className="col-md-4">
                    <label className="form-label">Data Fim (Opcional)</label>
                    <input 
                        type="date" className="form-control"
                        value={dataFim} onChange={(e) => setDataFim(e.target.value)}
                    />
                    <small className="text-muted">Deixe vazio para prazo indeterminado.</small>
                </div>
                <div className="col-md-4">
                    <label className="form-label">Status</label>
                    <select className="form-select" value={status} onChange={(e) => setStatus(e.target.value)}>
                        <option value="ATIVA">ATIVA</option>
                        <option value="PAUSADA">PAUSADA</option>
                        <option value="CANCELADA">CANCELADA</option>
                    </select>
                </div>
            </div>

            {/* Linha Financeira */}
            <div className="card bg-light p-3 mb-3">
                <h6 className="text-muted mb-3">Regra do Desconto</h6>
                <div className="row">
                    <div className="col-md-4">
                        <label className="form-label">Tipo de Desconto</label>
                        <select className="form-select" value={tipoDesconto} onChange={(e) => setTipoDesconto(e.target.value)}>
                            <option value="FIXO">Valor Fixo (R$)</option>
                            <option value="PORCENTAGEM">Porcentagem (%)</option>
                        </select>
                    </div>
                    <div className="col-md-4">
                        <label className="form-label">Valor do Desconto</label>
                        <div className="input-group">
                            <span className="input-group-text">{tipoDesconto === 'FIXO' ? 'R$' : '%'}</span>
                            <input 
                                type="number" step="0.01" className="form-control" required
                                value={valorPromocional} onChange={(e) => setValorPromocional(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="col-md-4">
                        <label className="form-label">Aplicar em:</label>
                        <select className="form-select" value={procedimentoId} onChange={(e) => setProcedimentoId(e.target.value)}>
                            <option value="">TODOS OS PROCEDIMENTOS (Global)</option>
                            {listaProcedimentos.map(proc => (
                                <option key={proc.id} value={proc.id}>{proc.procedimento} (R$ {proc.valor})</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            <button type="submit" className="btn btn-success me-2">Salvar</button>
            <button type="button" className="btn btn-secondary" onClick={() => navigate("/promocoes")}>Cancelar</button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default PromocaoFormPage;