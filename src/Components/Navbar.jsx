import { Link, useLocation, useNavigate } from "react-router-dom";
import { useContext } from "react";
import { ThemeContext } from "../Context/ThemeContext";
import { EmpresaContext } from "../Context/EmpresaContext";

function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();

  const { primaryColor, changeThemeColor } = useContext(ThemeContext);
  const { nomeEmpresa, logo } = useContext(EmpresaContext); // Pegando a logo atualizada

  if (location.pathname === "/login" || location.pathname === "/register") {
    return null;
  }

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <nav
      className="navbar navbar-expand-lg navbar-dark shadow-sm mb-4"
      style={{ backgroundColor: primaryColor, transition: 'background-color 0.3s ease' }}
    >
      <div className="container">
        <Link className="navbar-brand d-flex align-items-center" to="/">
          {/* LOGO DA EMPRESA (Vem do Contexto) */}
          {logo ? (
            <img src={logo} alt="Logo" width="35" height="35" className="d-inline-block me-2 rounded bg-white p-1" />
          ) : (
            <span className="me-2 fs-4">📅</span>
          )}
          <span className="fw-bold tracking-wide">{nomeEmpresa}</span>
        </Link>

        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto align-items-end align-items-lg-center pe-2">

            <li className="nav-item mx-1"><Link className={`nav-link ${location.pathname === '/' ? 'active fw-bold' : ''}`} to="/">Dashboard</Link></li>
            <li className="nav-item mx-1"><Link className={`nav-link ${location.pathname === '/calendario' ? 'active fw-bold' : ''}`} to="/calendario">Calendário</Link></li>
            <li className="nav-item mx-1"><Link className={`nav-link ${location.pathname.includes('/agendamentos') ? 'active fw-bold' : ''}`} to="/agendamentos">Agenda</Link></li>
            <li className="nav-item mx-1"><Link className={`nav-link ${location.pathname.includes('/clientes') ? 'active fw-bold' : ''}`} to="/clientes">Clientes</Link></li>

            <li className="nav-item dropdown mx-1">
              <a className="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown">Cadastros</a>
              <ul className="dropdown-menu dropdown-menu-end shadow border-0">
                <li><Link className="dropdown-item" to="/procedimentos">💅 Procedimentos</Link></li>
                <li><Link className="dropdown-item" to="/categorias">📂 Categorias</Link></li>
                <li><hr className="dropdown-divider" /></li>
                <li><Link className="dropdown-item" to="/promocoes">🏷️ Promoções</Link></li>
                <li><Link className="dropdown-item" to="/config/pagamentos">💳 Formas Pagamento</Link></li>
              </ul>
            </li>

            {/* --- NOVO: BOTÃO DE CONFIGURAÇÃO (ENGRENAGEM) --- */}
            <li className="nav-item mx-1">
              <Link
                to="/config/geral"
                className="nav-link text-white"
                title="Configurações da Empresa"
                style={{ fontSize: '1.2rem', cursor: 'pointer' }}
              >
                ⚙️
              </Link>
            </li>

            {/* BOTÃO SAIR */}
            <li className="nav-item ms-2">
              <button onClick={handleLogout} className="btn btn-sm text-white-50 hover-text-white">
                Sair
              </button>
            </li>

          </ul>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;