import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../Services/api";

function ClienteFormPage() {
  // Estados
  const [nome, setNome] = useState("");
  const [documento, setDocumento] = useState("");
  const [email, setEmail] = useState("");
  const [redesocial, setRedeSocial] = useState("");
  const [telefone, setTelefone] = useState("");
  const [telefone2, setTelefone2] = useState("");

  const [id, setId] = useState(null);

  const navigate = useNavigate();
  const { id: paramId } = useParams();

  // Carregar dados na Edição
  useEffect(() => {
    if (paramId && paramId !== "novo") {
      api.get(`/clientes/${paramId}`)
        .then((response) => {
          const dados = response.data;
          setNome(dados.nome);
          setDocumento(dados.documento || "");
          setEmail(dados.email || "");
          setRedeSocial(dados.redesocial || "");
          setTelefone(dados.telefone);
          setTelefone2(dados.telefone2 || "");
          setId(dados.id);
        })
        .catch((error) => console.error("Erro ao carregar cliente", error));
    }
  }, [paramId]);

  const handleSubmit = (e) => {
    e.preventDefault();

    const dadosParaEnviar = {
      nome,
      documento,
      email,
      redesocial,
      telefone,
      telefone2
    };

    const request = id
      ? api.put(`/clientes/${id}`, dadosParaEnviar)
      : api.post("/clientes", dadosParaEnviar);

    request
      .then(() => {
        alert("Cliente salvo com sucesso!");
        navigate("/clientes");
      })
      .catch((err) => {
        console.error("Erro:", err);
        alert("Erro ao salvar. Verifique o console.");
      });
  };

  return (
    <div className="container mt-5">
      <div className="card shadow">
        <div className="card-header bg-primary text-white">
          <h3>{id ? "Editar Cliente" : "Novo Cliente"}</h3>
        </div>
        <div className="card-body">
          <form onSubmit={handleSubmit}>

            {/* Linha 1: Nome e Documento */}
            <div className="row">
              <div className="col-md-8 mb-3">
                <label className="form-label fw-bold">Nome Completo *</label>
                <input
                  type="text" className="form-control"
                  required // <--- OBRIGATÓRIO
                  value={nome} onChange={(e) => setNome(e.target.value)}
                />
              </div>
              <div className="col-md-4 mb-3">
                <label className="form-label">Documento (CPF/CNPJ)</label>
                <input
                  type="text" className="form-control"
                  // OPCIONAL (Sem required)
                  value={documento} onChange={(e) => setDocumento(e.target.value)}
                />
              </div>
            </div>

            {/* Linha 2: Email e Rede Social */}
            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label">Email</label>
                <input
                  type="email" className="form-control"
                  // OPCIONAL (Sem required)
                  value={email} onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label">Rede Social</label>
                <input
                  type="text" className="form-control" placeholder="@usuario"
                  // OPCIONAL (Sem required)
                  value={redesocial} onChange={(e) => setRedeSocial(e.target.value)}
                />
              </div>
            </div>

            {/* Linha 3: Telefones */}
            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label fw-bold">Telefone Principal *</label>
                <input
                  type="text" className="form-control" placeholder="(00) 00000-0000"
                  required // <--- OBRIGATÓRIO
                  value={telefone} onChange={(e) => setTelefone(e.target.value)}
                />
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label">Telefone Secundário</label>
                <input
                  type="text" className="form-control" placeholder="(00) 00000-0000"
                  // OPCIONAL (Sem required)
                  value={telefone2} onChange={(e) => setTelefone2(e.target.value)}
                />
              </div>
            </div>

            <div className="d-flex gap-2">
              <button type="submit" className="btn btn-success">Salvar</button>
              <button type="button" className="btn btn-secondary" onClick={() => navigate("/clientes")}>Cancelar</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ClienteFormPage;