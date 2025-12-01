import { useState, useContext, useEffect } from "react";
import api from "../Services/api";
import { EmpresaContext } from "../Context/EmpresaContext";

function ConfigEmpresaPage() {
  const { nomeEmpresa, logo, carregarDadosEmpresa } = useContext(EmpresaContext);
  
  const [nomeInput, setNomeInput] = useState("");
  const [arquivoInput, setArquivoInput] = useState(null);
  const [preview, setPreview] = useState(null);

  // Carrega dados atuais nos inputs ao abrir
  useEffect(() => {
      setNomeInput(nomeEmpresa !== "Stay Agenda" ? nomeEmpresa : "");
      setPreview(logo);
  }, [nomeEmpresa, logo]);

  const handleFileChange = (e) => {
      const file = e.target.files[0];
      setArquivoInput(file);
      if (file) {
          setPreview(URL.createObjectURL(file)); // Mostra preview na hora
      }
  };

  const handleSave = async (e) => {
      e.preventDefault();
      
      const formData = new FormData();
      formData.append("nome", nomeInput);
      if (arquivoInput) {
          formData.append("logo", arquivoInput);
      }

      try {
          await api.post("/empresa", formData, {
              headers: { "Content-Type": "multipart/form-data" }
          });
          alert("Configurações salvas!");
          carregarDadosEmpresa(); // Atualiza o site todo na hora!
      } catch (error) {
          alert("Erro ao salvar.");
      }
  };

  return (
    <div className="container mt-5">
      <div className="card shadow">
        <div className="card-header bg-secondary text-white">
            <h3>⚙️ Dados da Sua Empresa</h3>
        </div>
        <div className="card-body">
            <form onSubmit={handleSave}>
                <div className="mb-3">
                    <label className="form-label">Nome do Estabelecimento</label>
                    <input 
                        type="text" className="form-control" required 
                        value={nomeInput} onChange={e => setNomeInput(e.target.value)}
                    />
                </div>

                <div className="mb-3">
                    <label className="form-label">Logotipo</label>
                    <input type="file" className="form-control" accept="image/*" onChange={handleFileChange} />
                </div>

                {/* Preview da Logo */}
                {preview && (
                    <div className="mb-4 text-center p-3 border rounded bg-light">
                        <p className="text-muted small mb-2">Pré-visualização:</p>
                        <img src={preview} alt="Logo" style={{height: "80px", objectFit: "contain"}} />
                    </div>
                )}

                <button className="btn btn-primary">Salvar Alterações</button>
            </form>
        </div>
      </div>
    </div>
  );
}

export default ConfigEmpresaPage;