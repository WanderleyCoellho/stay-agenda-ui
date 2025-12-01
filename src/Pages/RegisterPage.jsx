import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../Services/api";

function RegisterPage() {
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("ADMIN"); // Padrão ADMIN para o primeiro
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await api.post("/auth/register", { login, password, role });
      alert("Utilizador criado com sucesso!");
      navigate("/login");
    } catch (error) {
      alert("Erro ao registar. Verifique se o login já existe.");
    }
  };

  return (
    <div className="container d-flex justify-content-center align-items-center vh-100 bg-light">
      <div className="card shadow p-4" style={{ width: "400px" }}>
        <h2 className="text-center mb-4">Criar Conta</h2>
        <form onSubmit={handleRegister}>
          <div className="mb-3">
            <label className="form-label">Login / Email</label>
            <input
              type="text"
              className="form-control"
              value={login}
              onChange={(e) => setLogin(e.target.value)}
              required
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Palavra-passe</label>
            <input
              type="password"
              className="form-control"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Perfil</label>
            <select className="form-select" value={role} onChange={(e) => setRole(e.target.value)}>
                <option value="ADMIN">Administrador</option>
                <option value="USER">Funcionário</option>
            </select>
          </div>
          <button type="submit" className="btn btn-primary w-100">Registar</button>
        </form>
        <div className="text-center mt-3">
            <Link to="/login">Já tenho conta (Login)</Link>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;