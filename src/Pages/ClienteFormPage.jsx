import { useEffect, useState, useContext } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../Services/api";
import { ThemeContext } from "../Context/ThemeContext";

function ClienteFormPage() {
  const { primaryColor } = useContext(ThemeContext);
  // ... (estados nome, documento, email, etc. iguais) ...
  const [nome, setNome] = useState("");
  const [documento, setDocumento] = useState("");
  const [email, setEmail] = useState("");
  const [redesocial, setRedeSocial] = useState("");
  const [telefone, setTelefone] = useState("");
  const [telefone2, setTelefone2] = useState("");
  const [id, setId] = useState(null);
  const navigate = useNavigate();
  const { id: paramId } = useParams();

  useEffect(() => {
    if (paramId && paramId !== "novo") {
      api.get(`/clientes/${paramId}`).then(res => {
        const d = res.data;
        setNome(d.nome); setDocumento(d.documento || ""); setEmail(d.email || "");
        setRedeSocial(d.redesocial || ""); setTelefone(d.telefone); setTelefone2(d.telefone2 || "");
        setId(d.id);
      });
    }
  }, [paramId]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const dados = { nome, documento, email, redesocial, telefone, telefone2 };
    const req = id ? api.put(`/clientes/${id}`, dados) : api.post("/clientes", dados);
    req.then(() => { alert("Salvo!"); navigate("/clientes"); }).catch(() => alert("Erro ao salvar."));
  };

  return (
    <div className="container mt-5">
      <div className="card shadow border-0">
        <div className="card-header text-white py-3" style={{ backgroundColor: primaryColor }}>
          <h5 className="mb-0 fw-bold">{id ? "Editar" : "Novo"} Cliente</h5>
        </div>
        <div className="card-body p-4">
          <form onSubmit={handleSubmit}>
            {/* ... (Inputs iguais aos anteriores) ... */}
            <div className="row">
              <div className="col-md-8 mb-3"><label className="form-label fw-bold">Nome *</label><input type="text" className="form-control" required value={nome} onChange={e => setNome(e.target.value)} /></div>
              <div className="col-md-4 mb-3"><label className="form-label">CPF/CNPJ</label><input type="text" className="form-control" value={documento} onChange={e => setDocumento(e.target.value)} /></div>
            </div>
            <div className="row">
              <div className="col-md-6 mb-3"><label className="form-label">Email</label><input type="email" className="form-control" value={email} onChange={e => setEmail(e.target.value)} /></div>
              <div className="col-md-6 mb-3"><label className="form-label">Rede Social</label><input type="text" className="form-control" value={redesocial} onChange={e => setRedeSocial(e.target.value)} /></div>
            </div>
            <div className="row">
              <div className="col-md-6 mb-3"><label className="form-label fw-bold">Telefone *</label><input type="text" className="form-control" required value={telefone} onChange={e => setTelefone(e.target.value)} /></div>
              <div className="col-md-6 mb-3"><label className="form-label">Telefone 2</label><input type="text" className="form-control" value={telefone2} onChange={e => setTelefone2(e.target.value)} /></div>
            </div>

            <div className="d-grid gap-2 d-md-flex justify-content-md-end">
              <button type="button" className="btn btn-outline-secondary" onClick={() => navigate("/clientes")}>Cancelar</button>
              <button type="submit" className="btn text-white fw-bold px-4" style={{ backgroundColor: primaryColor }}>Salvar</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ClienteFormPage;