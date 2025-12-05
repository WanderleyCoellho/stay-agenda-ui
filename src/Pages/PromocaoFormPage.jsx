import { useEffect, useState, useContext } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../Services/api";
import { ThemeContext } from "../Context/ThemeContext"; // 1. Importe o Contexto

function PromocaoFormPage() {
  const { primaryColor } = useContext(ThemeContext); // 2. Pegue a cor

  const [descricao, setDescricao] = useState("");
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [status, setStatus] = useState("ATIVA");

  const [valorPromocional, setValorPromocional] = useState("");
  const [tipoDesconto, setTipoDesconto] = useState("FIXO");

  const [procedimentoId, setProcedimentoId] = useState("");
  const [listaProcedimentos, setListaProcedimentos] = useState([]);

  const [id, setId] = useState(null);
  const navigate = useNavigate();
  const { id: paramId } = useParams();

  useEffect(() => {
    api.get("/procedimentos").then((res) => setListaProcedimentos(res.data));
  }, []);

  useEffect(() => {
    if (paramId && paramId !== "novo") {
      api.get(`/promocoes/${paramId}`)
        .then((response) => {
          const dados = response.data;
          setDescricao(dados.descricao);
          setDataInicio(dados.dataInicio);
          setDataFim(dados.dataFim || "");
          setStatus(dados.status);
          setValorPromocional(dados.valorPromocional);
          setTipoDesconto(dados.tipoDesconto);
          setId(dados.id);

          if (dados.procedimento) {
            setProcedimentoId(dados.procedimento.id);
          } else {
            setProcedimentoId("");
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
      dataFim: dataFim || null,
      status,
      valorPromocional: parseFloat(valorPromocional),
      tipoDesconto,
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
    <div className="container mt-5 mb-5">
      <div className="card shadow border-0">

        {/* --- CABEÇALHO DINÂMICO --- */}
        <div className="card-header text-white py-3" style={{ backgroundColor: primaryColor }}>
          <h5 className="mb-0 fw-bold">{id ? "Editar" : "Nova"} Promoção</h5>
        </div>

        <div className="card-body p-4">
          <form onSubmit={handleSubmit}>

            <div className="mb-3">
              <label className="form-label fw-bold">Descrição da Campanha *</label>
              <input
                type="text" className="form-control" placeholder="Ex: Black Friday, Desconto de Natal..."
                required value={descricao} onChange={(e) => setDescricao(e.target.value)}
              />
            </div>

            {/* Linha de Datas */}
            <div className="row mb-3">
              <div className="col-md-4">
                <label className="form-label fw-bold">Data Início *</label>
                <input
                  type="date" className="form-control" required
                  value={dataInicio} onChange={(e) => setDataInicio(e.target.value)}
                />
              </div>
              <div className="col-md-4">
                <label className="form-label fw-bold">Data Fim (Opcional)</label>
                <input
                  type="date" className="form-control"
                  value={dataFim} onChange={(e) => setDataFim(e.target.value)}
                />
                <small className="text-muted">Vazio = Indeterminado</small>
              </div>
              <div className="col-md-4">
                <label className="form-label fw-bold">Status</label>
                <select className="form-select" value={status} onChange={(e) => setStatus(e.target.value)}>
                  <option value="ATIVA">ATIVA</option>
                  <option value="PAUSADA">PAUSADA</option>
                  <option value="CANCELADA">CANCELADA</option>
                </select>
              </div>
            </div>

            {/* Regra Financeira */}
            <div className="card bg-light border-0 p-3 mb-4 rounded-3">
              <h6 className="fw-bold text-secondary mb-3">Regra do Desconto</h6>
              <div className="row g-3">
                <div className="col-md-4">
                  <label className="form-label small text-muted">Tipo de Desconto</label>
                  <select className="form-select" value={tipoDesconto} onChange={(e) => setTipoDesconto(e.target.value)}>
                    <option value="FIXO">Valor Fixo (R$)</option>
                    <option value="PORCENTAGEM">Porcentagem (%)</option>
                  </select>
                </div>
                <div className="col-md-4">
                  <label className="form-label small text-muted">Valor do Desconto</label>
                  <div className="input-group">
                    <span className="input-group-text">{tipoDesconto === 'FIXO' ? 'R$' : '%'}</span>
                    <input
                      type="number" step="0.01" className="form-control" required
                      value={valorPromocional} onChange={(e) => setValorPromocional(e.target.value)}
                    />
                  </div>
                </div>
                <div className="col-md-4">
                  <label className="form-label small text-muted">Aplicar em:</label>
                  <select className="form-select" value={procedimentoId} onChange={(e) => setProcedimentoId(e.target.value)}>
                    <option value="">🌍 TODOS (Global)</option>
                    {listaProcedimentos.map(proc => (
                      <option key={proc.id} value={proc.id}>{proc.procedimento} (R$ {proc.valor})</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="d-grid gap-2 d-md-flex justify-content-md-end">
              <button type="button" className="btn btn-outline-secondary rounded-pill px-4" onClick={() => navigate("/promocoes")}>
                Cancelar
              </button>

              {/* --- BOTÃO DINÂMICO --- */}
              <button type="submit" className="btn text-white fw-bold rounded-pill px-4 shadow-sm" style={{ backgroundColor: primaryColor }}>
                Salvar Promoção
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}

export default PromocaoFormPage;