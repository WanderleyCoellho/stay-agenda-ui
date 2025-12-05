import { useState, useContext, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../Services/api";
import { ThemeContext } from "../Context/ThemeContext";
import { EmpresaContext } from "../Context/EmpresaContext"; // Importe o Contexto da Empresa

function LoginPage() {
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const { primaryColor } = useContext(ThemeContext); // Cor do tema
  const { nomeEmpresa, logo, carregarDadosEmpresa } = useContext(EmpresaContext); // Dados da empresa

  // Tenta carregar a logo da empresa ao abrir a tela de login
  useEffect(() => {
    carregarDadosEmpresa();
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await api.post("/auth/login", { login, password });
      const token = response.data.token;

      localStorage.setItem("token", token);
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      // Recarrega dados da empresa para garantir que o contexto esteja atualizado
      carregarDadosEmpresa();

      navigate("/");
    } catch (error) {
      alert("Falha no login! Verifique usuário e senha.");
    } finally {
      setLoading(false);
    }
  };

  // Cria um gradiente bonito com a cor do tema
  const bgGradient = `linear-gradient(135deg, ${primaryColor} 0%, #2d3436 100%)`;

  return (
    <div className="d-flex justify-content-center align-items-center"
      style={{
        background: bgGradient,
        minHeight: '100vh',
        width: '100vw',
        position: 'fixed', // Garante tela cheia sem rolagens
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
            // Se tiver logo personalizada, usa ela
            <img
              src={logo}
              alt="Logo Empresa"
              className="shadow-sm rounded-circle bg-white p-2 mb-2"
              style={{ width: "100px", height: "100px", objectFit: "contain" }}
            />
          ) : (
            // Se não tiver, mostra o ícone padrão com a cor do tema
            <div
              className="text-white rounded-circle d-inline-flex justify-content-center align-items-center shadow-sm mb-3"
              style={{ width: "80px", height: "80px", fontSize: "2.5rem", backgroundColor: primaryColor }}
            >
              📅
            </div>
          )}

          <h3 className="fw-bold mb-1" style={{ color: primaryColor }}>
            {nomeEmpresa !== "Stay Agenda" ? nomeEmpresa : "Bem-vindo"}
          </h3>
          <p className="text-muted small">Faça login para gerenciar seu negócio</p>
        </div>

        <form onSubmit={handleLogin}>
          <div className="form-floating mb-3">
            <input
              type="text" className="form-control border-0 bg-light"
              id="floatingInput" placeholder="Login"
              value={login} onChange={(e) => setLogin(e.target.value)} required
            />
            <label htmlFor="floatingInput">Usuário</label>
          </div>

          <div className="form-floating mb-4">
            <input
              type="password" className="form-control border-0 bg-light"
              id="floatingPassword" placeholder="Senha"
              value={password} onChange={(e) => setPassword(e.target.value)} required
            />
            <label htmlFor="floatingPassword">Senha</label>
          </div>

          <button
            type="submit"
            className="btn w-100 py-3 rounded-pill fw-bold shadow-sm text-white"
            style={{ backgroundColor: primaryColor, transition: 'transform 0.2s' }}
            disabled={loading}
            onMouseDown={(e) => e.target.style.transform = 'scale(0.98)'}
            onMouseUp={(e) => e.target.style.transform = 'scale(1)'}
          >
            {loading ? "AUTENTICANDO..." : "ENTRAR"}
          </button>
        </form>

        <div className="text-center mt-4 pt-3 border-top">
          <Link to="/register" className="text-decoration-none small fw-bold" style={{ color: primaryColor }}>
            Não tem conta? Cadastre-se aqui
          </Link>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;