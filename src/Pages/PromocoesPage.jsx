import { useEffect, useState, useContext } from "react";
import { Link } from "react-router-dom";
import api from "../Services/api";
import { ThemeContext } from "../Context/ThemeContext"; // 1. Importe o Contexto

function PromocoesPage() {
  const { primaryColor } = useContext(ThemeContext); // 2. Pegue a cor do tema
  const [promocoes, setPromocoes] = useState([]);

  useEffect(() => {
    carregarPromocoes();
  }, []);

  const carregarPromocoes = () => {
    api.get("/promocoes")
      .then((res) => setPromocoes(res.data))
      .catch((err) => console.error("Erro ao carregar promoções", err));
  };

  const handleDelete = (id) => {
    if (window.confirm("Tem certeza que deseja excluir esta promoção?")) {
      api.delete(`/promocoes/${id}`).then(() => carregarPromocoes());
    }
  };

  const formatarDesconto = (promo) => {
    if (promo.tipoDesconto === 'PORCENTAGEM') {
      return <span className="badge bg-light text-dark fw-bold border">{promo.valorPromocional}% OFF</span>;
    } else {
      const valor = promo.valorPromocional.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
      return <span className="badge bg-warning text-dark fw-bold">{valor} OFF</span>;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Indeterminado';
    const [ano, mes, dia] = dateString.split("-");
    return `${dia}/${mes}/${ano}`;
  };

  return (
    <div className="container mt-4 pb-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold text-secondary">🏷️ Promoções</h2>

        {/* BOTÃO COM COR DINÂMICA */}
        <Link
          to="/promocoes/novo"
          className="btn text-white shadow-sm rounded-pill px-4 fw-bold"
          style={{ backgroundColor: primaryColor }}
        >
          + Nova
        </Link>
      </div>

      <div className="row">
        {promocoes.map((promo) => (
          <div key={promo.id} className="col-md-6 col-lg-4 mb-4">
            <div className="card shadow border-0 h-100">

              {/* CABEÇALHO DO CARD DINÂMICO */}
              <div
                className="card-header d-flex justify-content-between align-items-center py-3"
                style={{ backgroundColor: primaryColor, color: 'white' }}
              >
                <h5 className="mb-0 fw-bold text-truncate" style={{ maxWidth: '70%' }} title={promo.descricao}>
                  {promo.descricao}
                </h5>
                {formatarDesconto(promo)}
              </div>

              <div className="card-body">
                <p className="mb-1 text-muted small text-uppercase fw-bold">Alvo da Promoção:</p>
                <p className="card-text fw-bold fs-5 mb-3">
                  {promo.procedimento ? (
                    <span>💅 {promo.procedimento.procedimento}</span>
                  ) : (
                    <span className="text-success">🌍 Todos (Global)</span>
                  )}
                </p>

                <div className="p-2 bg-light rounded border d-flex justify-content-between align-items-center">
                  <div className="small text-muted lh-1">
                    <i className="bi bi-calendar-event me-1"></i> Validade:<br />
                    <strong className="text-dark">
                      {formatDate(promo.dataInicio)} até {formatDate(promo.dataFim)}
                    </strong>
                  </div>
                  <span className={`badge rounded-pill ${promo.status === 'ATIVA' ? 'bg-success' : 'bg-secondary'}`}>
                    {promo.status}
                  </span>
                </div>
              </div>

              <div className="card-footer bg-white border-0 pb-3 text-end">
                <Link
                  to={`/promocoes/editar/${promo.id}`}
                  className="btn btn-sm btn-outline-primary me-2 fw-bold"
                >
                  ✏️ Editar
                </Link>
                <button
                  onClick={() => handleDelete(promo.id)}
                  className="btn btn-sm btn-outline-danger"
                >
                  🗑️
                </button>
              </div>
            </div>
          </div>
        ))}

        {promocoes.length === 0 && (
          <div className="col-12 text-center text-muted py-5">
            <div className="fs-1 opacity-25 mb-2">🏷️</div>
            <h4>Nenhuma promoção ativa.</h4>
            <p>Crie campanhas para atrair mais clientes!</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default PromocoesPage;