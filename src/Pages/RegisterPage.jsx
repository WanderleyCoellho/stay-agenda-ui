import { useState, useContext, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../Services/api";
import { ThemeContext } from "../Context/ThemeContext";
import { EmpresaContext } from "../Context/EmpresaContext";

function RegisterPage() {
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("ADMIN");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const { primaryColor } = useContext(ThemeContext); // Cor do tema
  const { nomeEmpresa, logo, carregarDadosEmpresa } = useContext(EmpresaContext); // Dados da empresa

  // Carrega logo ao abrir (caso o usuário vá direto para o registro)
  useEffect(() => {
    carregarDadosEmpresa();
  }, []);

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/auth/register", { login, password, role });
      alert("Conta criada com sucesso!");
      navigate("/login");
    } catch (error) {
      alert("Erro ao registrar. Verifique se o login já existe.");
    } finally {
      setLoading(false);
    }
  };

  // Gradiente Dinâmico
  const bgGradient = `linear-gradient(135deg, ${primaryColor} 0%, #2d3436 100%)`;

  return (
    <div className="d-flex justify-content-center align-items-center"
      style={{
        background: bgGradient,
        minHeight: '100vh',
        width: '100vw',
        position: 'fixed',
        top: 0, left: 0
      }}>

      <div className="card p-4 p-md-5 shadow-lg border-0 m-3"
        style={{
          width: "100%",
          maxWidth: "400px",
          borderRadius: "24px",
          background: "rgba(255, 255, 255, 0.96)"
        }}>

        {/* --- ÁREA DA LOGO --- */}
        <div className="text-center mb-4">
          {logo ? (
            <img
              src={logo}
              alt="Logo Empresa"
              className="shadow-sm rounded-circle bg-white p-2 mb-2"
              style={{ width: "80px", height: "80px", objectFit: "contain" }}
            />
          ) : (
            <div
              className="text-white rounded-circle d-inline-flex justify-content-center align-items-center shadow-sm mb-3"
              style={{ width: "80px", height: "80px", fontSize: "2.5rem", backgroundColor: primaryColor }}
            >
              👤
            </div>
          )}

          <h3 className="fw-bold mb-1" style={{ color: primaryColor }}>Criar Conta</h3>
          <p className="text-muted small">Junte-se ao {nomeEmpresa !== "Stay Agenda" ? nomeEmpresa : "Stay Agenda"}</p>
        </div>

        <form onSubmit={handleRegister}>

          {/* Login */}
          <div className="form-floating mb-3">
            <input
              type="text" className="form-control border-0 bg-light"
              id="regLogin" placeholder="Login"
              value={login} onChange={(e) => setLogin(e.target.value)} required
            />
            <label htmlFor="regLogin">Novo Usuário</label>
          </div>

          {/* Senha */}
          <div className="form-floating mb-3">
            <input
              type="password" className="form-control border-0 bg-light"
              id="regPass" placeholder="Senha"
              value={password} onChange={(e) => setPassword(e.target.value)} required
            />
            <label htmlFor="regPass">Nova Senha</label>
          </div>

          {/* Perfil (Select) */}
          <div className="form-floating mb-4">
            <select
              className="form-select border-0 bg-light"
              id="regRole"
              value={role} onChange={(e) => setRole(e.target.value)}
            >
              <option value="ADMIN">Administrador</option>
              <option value="USER">Funcionário</option>
            </select>
            <label htmlFor="regRole">Tipo de Acesso</label>
          </div>

          <button
            type="submit"
            className="btn w-100 py-3 rounded-pill fw-bold shadow-sm text-white"
            style={{ backgroundColor: primaryColor, transition: 'transform 0.2s' }}
            disabled={loading}
            onMouseDown={(e) => e.target.style.transform = 'scale(0.98)'}
            onMouseUp={(e) => e.target.style.transform = 'scale(1)'}
          >
            {loading ? "CRIANDO..." : "REGISTRAR-SE"}
          </button>
        </form>

        <div className="text-center mt-4 pt-3 border-top">
          <Link to="/login" className="text-decoration-none small fw-bold" style={{ color: primaryColor }}>
            Já tem uma conta? Fazer Login
          </Link>
        </div>

      </div>
    </div>
  );
}

export default RegisterPage;