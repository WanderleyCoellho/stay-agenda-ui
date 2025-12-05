import { useEffect, useState, useContext } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../Services/api";
import { ThemeContext } from "../Context/ThemeContext";
import CalculadoraPrecificacao from "../Components/Modals/CalculadoraPrecificacao";

function ProcedimentoFormPage() {
  const { primaryColor } = useContext(ThemeContext);

  const [procedimento, setProcedimento] = useState("");
  const [valor, setValor] = useState("");

  // --- NOVO: ESTADO DE MEMÓRIA ---
  // Guarda o valor digitado manualmente para não perder quando trocar para automático
  const [valorManualState, setValorManualState] = useState("");

  const [categoriaId, setCategoriaId] = useState("");
  const [listaCategorias, setListaCategorias] = useState([]);

  // Precificação
  const [usarPrecificacao, setUsarPrecificacao] = useState(false);
  const [materiais, setMateriais] = useState([]);
  const [tempoMinutos, setTempoMinutos] = useState(0);
  const [margemLucro, setMargemLucro] = useState(0);

  const [valorSugeridoPreview, setValorSugeridoPreview] = useState(0);
  const [custoTotalPreview, setCustoTotalPreview] = useState(0);
  const [showCalculadora, setShowCalculadora] = useState(false);

  const [id, setId] = useState(null);
  const navigate = useNavigate();
  const { id: paramId } = useParams();

  const formatMoney = (val) => val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  const safeParse = (val) => parseFloat(String(val).replace(',', '.')) || 0;

  useEffect(() => {
    api.get("/categorias").then((res) => setListaCategorias(res.data));
  }, []);

  useEffect(() => {
    if (paramId && paramId !== "novo") {
      api.get(`/procedimentos/${paramId}`)
        .then((response) => {
          const dados = response.data;
          setProcedimento(dados.procedimento);

          setValor(dados.valor);
          // Carrega o valor manual salvo no banco (ou usa o valor atual se for antigo)
          setValorManualState(dados.valorManual || dados.valor);

          setId(dados.id);
          if (dados.categoria) setCategoriaId(dados.categoria.id);

          if (dados.materiais) setMateriais(dados.materiais);
          if (dados.tempoMinutos) setTempoMinutos(dados.tempoMinutos);
          if (dados.margemLucro) setMargemLucro(dados.margemLucro);
          if (dados.usarPrecificacao) setUsarPrecificacao(dados.usarPrecificacao);
        })
        .catch((error) => console.error("Erro ao carregar", error));
    }
  }, [paramId]);

  // CÁLCULO EM TEMPO REAL
  useEffect(() => {
    const salario = safeParse(localStorage.getItem("calc_salario"));
    const fixos = safeParse(localStorage.getItem("calc_fixos"));
    const dias = safeParse(localStorage.getItem("calc_dias") || 5);
    const horasDia = safeParse(localStorage.getItem("calc_horas_dia") || 8);
    const horasMensais = dias * horasDia * 4 || 160;

    const custoMinuto = (salario + fixos) / (horasMensais * 60);
    const custoTempo = custoMinuto * safeParse(tempoMinutos);

    const totalMateriais = materiais.reduce((acc, item) => {
      return acc + (safeParse(item.preco) / safeParse(item.rendimento));
    }, 0);

    const custoBase = custoTempo + totalMateriais;
    const sugerido = custoBase * (1 + (safeParse(margemLucro) / 100));

    setCustoTotalPreview(custoBase);
    setValorSugeridoPreview(sugerido);

    // SE TIVER AUTOMÁTICO: Atualiza o valor visual com o sugerido
    if (usarPrecificacao) {
      setValor(sugerido.toFixed(2));
    }

  }, [materiais, tempoMinutos, margemLucro, usarPrecificacao]);

  // --- LÓGICA DE TROCA (Manual <-> Automático) ---
  const handleCheckboxChange = (e) => {
    const checked = e.target.checked;
    setUsarPrecificacao(checked);

    if (!checked) {
      // SE DESLIGOU O AUTOMÁTICO: Restaura o valor que estava na memória manual
      setValor(valorManualState);
    } else {
      // SE LIGOU O AUTOMÁTICO: (O useEffect acima já vai atualizar o valor para o sugerido)
    }
  };

  // Quando o usuário digita no campo (só funciona se flag false)
  const handleValorChange = (e) => {
    const novoValor = e.target.value;
    setValor(novoValor);
    // Atualiza a memória manual também
    setValorManualState(novoValor);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const materiaisLimpos = materiais.map(m => {
      if (m.id < 0) return { nome: m.nome, preco: m.preco, rendimento: m.rendimento };
      return m;
    });

    const dados = {
      procedimento,
      valor: parseFloat(valor),
      valorManual: parseFloat(valorManualState), // Salva o backup no banco!
      categoria: categoriaId ? { id: categoriaId } : null,
      usarPrecificacao,
      tempoMinutos,
      margemLucro,
      materiais: materiaisLimpos
    };

    const request = id
      ? api.put(`/procedimentos/${id}`, dados)
      : api.post("/procedimentos", dados);

    request.then(() => { alert("Salvo!"); navigate("/procedimentos"); }).catch(() => alert("Erro ao salvar."));
  };

  const handleSalvarPrecificacao = (dadosCalc) => {
    setMateriais(dadosCalc.materiais);
    setTempoMinutos(dadosCalc.tempoMinutos);
    setMargemLucro(dadosCalc.margemLucro);
    setShowCalculadora(false);
  };

  return (
    <div className="container mt-5 pb-5">

      {showCalculadora && (
        <CalculadoraPrecificacao
          onClose={() => setShowCalculadora(false)}
          onSave={handleSalvarPrecificacao}
          dadosIniciais={{ materiais, tempoMinutos, margemLucro }}
        />
      )}

      <div className="card shadow border-0">
        <div className="card-header text-white py-3" style={{ backgroundColor: primaryColor }}>
          <h5 className="mb-0 fw-bold">{id ? "Editar" : "Novo"} Procedimento</h5>
        </div>

        <div className="card-body p-4">
          <form onSubmit={handleSubmit}>

            <div className="mb-3">
              <label className="form-label fw-bold">Nome do Procedimento *</label>
              <input type="text" className="form-control" required value={procedimento} onChange={(e) => setProcedimento(e.target.value)} />
            </div>

            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label fw-bold">Valor (R$) *</label>
                <div className="input-group">
                  <span className="input-group-text">R$</span>
                  <input
                    type="number" step="0.01" className="form-control fw-bold" required
                    value={valor}
                    onChange={handleValorChange} // Usa o handler novo
                    readOnly={usarPrecificacao}
                    style={usarPrecificacao ? { backgroundColor: '#e9ecef', color: '#6c757d' } : { color: '#198754' }}
                  />
                  <button
                    type="button" className="btn btn-outline-secondary"
                    onClick={() => setShowCalculadora(true)}
                    title="Abrir Calculadora"
                  >
                    🧮 Precificar
                  </button>
                </div>

                {/* PAINEL INTELIGENTE */}
                <div className="mt-2 p-3 rounded border bg-light">
                  <div className="form-check form-switch mb-2">
                    <input
                      className="form-check-input" type="checkbox" id="checkPrecificacao"
                      checked={usarPrecificacao}
                      onChange={handleCheckboxChange}
                      style={{ cursor: 'pointer' }}
                    />
                    <label className="form-check-label fw-bold small" htmlFor="checkPrecificacao" style={{ cursor: 'pointer' }}>
                      Usar preço calculado automaticamente
                    </label>
                  </div>

                  <div className="d-flex justify-content-between align-items-center small mt-2 pt-2 border-top">
                    <span className="text-muted">
                      Custo: <strong>{formatMoney(custoTotalPreview)}</strong>
                    </span>
                    <span className={`fw-bold ${usarPrecificacao ? 'text-success' : 'text-secondary'}`}>
                      Sugerido: {formatMoney(valorSugeridoPreview)}
                    </span>
                  </div>

                  {/* Mostra o valor que está guardado na memória se estiver no modo automático */}
                  {usarPrecificacao && (
                    <div className="mt-2 small text-muted fst-italic">
                      Seu valor manual (R$ {formatMoney(safeParse(valorManualState))}) está salvo. Desmarque para usar.
                    </div>
                  )}
                </div>

              </div>

              <div className="col-md-6 mb-3">
                <label className="form-label fw-bold">Categoria</label>
                <select className="form-select" value={categoriaId} onChange={(e) => setCategoriaId(e.target.value)}>
                  <option value="">Selecione...</option>
                  {listaCategorias.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.categoria}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="d-grid gap-2 d-md-flex justify-content-md-end mt-3">
              <button type="button" className="btn btn-outline-secondary rounded-pill px-4" onClick={() => navigate("/procedimentos")}>Cancelar</button>
              <button type="submit" className="btn text-white fw-bold rounded-pill px-4 shadow-sm" style={{ backgroundColor: primaryColor }}>Salvar</button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}

export default ProcedimentoFormPage;