import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../Services/api";

function PromocoesPage() {
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
    if (window.confirm("Excluir esta promoção?")) {
      api.delete(`/promocoes/${id}`).then(() => carregarPromocoes());
    }
  };

  const formatarDesconto = (promo) => {
      if (promo.tipoDesconto === 'PORCENTAGEM') {
          return <span className="badge bg-info text-dark shadow-sm">{promo.valorPromocional}% OFF</span>;
      } else {
          const valor = promo.valorPromocional.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'});
          return <span className="badge bg-success shadow-sm">{valor} OFF</span>;
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
        <Link to="/promocoes/novo" className="btn btn-primary shadow-sm rounded-pill px-4">
          + Nova
        </Link>
      </div>

      <div className="row">
        {promocoes.map((promo) => (
          <div key={promo.id} className="col-md-6 col-lg-4 mb-4">
            <div className="card shadow border-0 h-100">
              <div className="card-header d-flex justify-content-between align-items-center bg-white border-bottom-0 pt-3">
                  <h5 className="mb-0 fw-bold text-primary">{promo.descricao}</h5>
                  {formatarDesconto(promo)}
              </div>
              
              <div className="card-body">
                  <p className="mb-2 text-muted small text-uppercase fw-bold">Alvo:</p>
                  <p className="card-text fw-bold">
                      {promo.procedimento ? (
                          <span>💅 {promo.procedimento.procedimento}</span>
                      ) : (
                          <span className="text-success">🌍 Todos (Global)</span>
                      )}
                  </p>

                  <hr className="my-2 opacity-25"/>

                  <div className="d-flex justify-content-between align-items-center mt-3">
                      <div className="small text-muted">
                          <i className="bi bi-calendar-event me-1"></i>
                          {formatDate(promo.dataInicio)} <br/>
                          até {formatDate(promo.dataFim)}
                      </div>
                      <span className={`badge rounded-pill ${promo.status === 'ATIVA' ? 'bg-success' : 'bg-secondary'}`}>
                          {promo.status}
                      </span>
                  </div>
              </div>

              <div className="card-footer bg-white border-0 pb-3 text-end">
                <Link to={`/promocoes/editar/${promo.id}`} className="btn btn-sm btn-outline-primary me-2">
                    ✏️ Editar
                </Link>
                <button onClick={() => handleDelete(promo.id)} className="btn btn-sm btn-outline-danger">
                    🗑️
                </button>
              </div>
            </div>
          </div>
        ))}

        {promocoes.length === 0 && (
            <div className="col-12 text-center text-muted py-5">
                <h4>Nenhuma promoção ativa.</h4>
                <p>Crie campanhas para atrair mais clientes!</p>
            </div>
        )}
      </div>
    </div>
  );
}

export default PromocoesPage;