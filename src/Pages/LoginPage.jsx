import { useState, useContext, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../Services/api";
import { ThemeContext } from "../Context/ThemeContext";
import { EmpresaContext } from "../Context/EmpresaContext"; // <--- Importe o Contexto

function LoginPage() {
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const { primaryColor } = useContext(ThemeContext);
  const { nomeEmpresa, logo, carregarDadosEmpresa } = useContext(EmpresaContext); // <--- Use o Contexto

  // Tenta carregar os dados da empresa assim que abre o login
  // (Isso funciona porque liberamos o GET /api/empresa na segurança)
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

      // Força recarregar os dados da empresa após login para garantir
      carregarDadosEmpresa();

      navigate("/");
    } catch (error) {
      alert("Falha no login! Verifique seus dados.");
    } finally {
      setLoading(false);
    }
  };

  const bgGradient = `linear-gradient(135deg, ${primaryColor} 0%, #2d3436 100%)`;

  return (
    <div className="login-bg d-flex justify-content-center align-items-center" style={{ background: bgGradient, minHeight: '100vh', width: '100vw' }}>
      <div className="card p-4 p-md-5 shadow-lg border-0 m-3" style={{ width: "100%", maxWidth: "400px", borderRadius: "20px", background: "rgba(255, 255, 255, 0.96)" }}>

        {/* --- ÁREA DA LOGO --- */}
        <div className="text-center mb-4">
          {logo ? (
            // Se tiver logo personalizada no banco, usa ela
            <img
              src={logo}
              alt="Logo Empresa"
              className="shadow-sm rounded-circle bg-white p-1 mb-2"
              style={{ width: "100px", height: "100px", objectFit: "contain" }}
            />
          ) : (
            // Se não tiver, tenta usar a logo padrão da pasta public
            <img
              src="/logo.png"
              alt="Logo Padrão"
              className="shadow-sm rounded-circle bg-white p-2 mb-2"
              style={{ width: "100px", height: "100px", objectFit: "contain" }}
              onError={(e) => {
                // Se não tiver nem a imagem padrão, mostra o ícone
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'inline-flex';
              }}
            />
          )}

          {/* Fallback: Ícone (só aparece se as imagens falharem) */}
          <div className="bg-white text-primary rounded-circle justify-content-center align-items-center shadow-sm mb-2" style={{ width: "100px", height: "100px", fontSize: "3rem", display: 'none' }}>
            📅
          </div>

          <h3 className="fw-bold" style={{ color: primaryColor }}>
            {nomeEmpresa !== "Stay Agenda" ? nomeEmpresa : "Bem-vindo"}
          </h3>
          <p className="text-muted small">Faça login para gerenciar</p>
        </div>

        <form onSubmit={handleLogin}>
          <div className="form-floating mb-3">
            <input
              type="text" className="form-control" id="floatingInput" placeholder="Login"
              value={login} onChange={(e) => setLogin(e.target.value)} required
            />
            <label htmlFor="floatingInput">Usuário</label>
          </div>

          <div className="form-floating mb-4">
            <input
              type="password" className="form-control" id="floatingPassword" placeholder="Senha"
              value={password} onChange={(e) => setPassword(e.target.value)} required
            />
            <label htmlFor="floatingPassword">Senha</label>
          </div>

          <button type="submit" className="btn btn-primary w-100 py-2 rounded-pill fw-bold shadow-sm" disabled={loading}>
            {loading ? "Autenticando..." : "ENTRAR"}
          </button>
        </form>

        <div className="text-center mt-4">
          <Link to="/register" className="text-decoration-none small text-muted">Criar conta</Link>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;