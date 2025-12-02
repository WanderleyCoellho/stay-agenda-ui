import { useState, useContext, useEffect } from "react";
import api from "../Services/api";
import { EmpresaContext } from "../Context/EmpresaContext";
import { ThemeContext } from "../Context/ThemeContext";

function ConfiguracoesPage() {
    // Contextos
    const { nomeEmpresa, logo, carregarDadosEmpresa } = useContext(EmpresaContext);
    const { primaryColor, changeThemeColor } = useContext(ThemeContext);

    // Estados
    const [nomeInput, setNomeInput] = useState("");
    const [arquivoInput, setArquivoInput] = useState(null);
    const [preview, setPreview] = useState(null);

    useEffect(() => {
        setNomeInput(nomeEmpresa !== "Stay Agenda" ? nomeEmpresa : "");
        setPreview(logo);
    }, [nomeEmpresa, logo]);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        setArquivoInput(file);
        if (file) {
            setPreview(URL.createObjectURL(file));
        }
    };

    const handleSaveEmpresa = async (e) => {
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
            alert("Dados da empresa salvos!");
            carregarDadosEmpresa();
        } catch (error) {
            alert("Erro ao salvar.");
        }
    };

    const coresPredefinidas = [
        "#6f42c1", "#0d6efd", "#198754", "#d63384", "#fd7e14", "#212529"
    ];

    return (
        <div className="container mt-4 mb-5">
            <h2 className="mb-4 fw-bold text-secondary">⚙️ Configurações</h2>

            <div className="row g-4">

                {/* --- CARD 1: EMPRESA --- */}
                <div className="col-12 col-md-6">
                    <div className="card shadow h-100 border-0">
                        <div className="card-header bg-white py-3 border-bottom">
                            <h5 className="mb-0 fw-bold text-primary">🏢 Identidade</h5>
                        </div>
                        <div className="card-body">
                            <form onSubmit={handleSaveEmpresa}>
                                <div className="mb-3">
                                    <label className="form-label fw-bold">Nome</label>
                                    <input type="text" className="form-control" required value={nomeInput} onChange={e => setNomeInput(e.target.value)} />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label fw-bold">Logo</label>
                                    <input type="file" className="form-control" accept="image/*" onChange={handleFileChange} />
                                </div>
                                <div className="mb-3 text-center p-3 border rounded bg-light">
                                    {preview ? <img src={preview} alt="Logo" style={{ height: "60px", objectFit: "contain" }} /> : <span className="text-muted">Sem logo</span>}
                                </div>
                                <button className="btn btn-primary w-100 fw-bold">Salvar</button>
                            </form>
                        </div>
                    </div>
                </div>

                {/* --- CARD 2: TEMA (VERIFIQUE SE ESTE BLOCO ESTÁ AQUI) --- */}
                <div className="col-12 col-md-6">
                    <div className="card shadow h-100 border-0">
                        <div className="card-header bg-white py-3 border-bottom">
                            <h5 className="mb-0 fw-bold text-primary">🎨 Cores do Sistema</h5>
                        </div>
                        <div className="card-body">
                            <label className="form-label fw-bold mb-2">Escolha uma cor:</label>
                            <div className="d-flex flex-wrap gap-2 mb-4">
                                {coresPredefinidas.map(cor => (
                                    <button
                                        key={cor} onClick={() => changeThemeColor(cor)}
                                        className="btn rounded-circle shadow-sm border-2"
                                        style={{
                                            width: '40px', height: '40px', backgroundColor: cor,
                                            borderColor: primaryColor === cor ? '#000' : 'transparent',
                                            transform: primaryColor === cor ? 'scale(1.1)' : 'scale(1)'
                                        }}
                                    />
                                ))}
                            </div>
                            <hr />
                            <div className="d-flex align-items-center gap-3">
                                <input
                                    type="color" className="form-control form-control-color"
                                    value={primaryColor} onChange={(e) => changeThemeColor(e.target.value)}
                                />
                                <span className="text-muted small">Ou selecione manualmente</span>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}

export default ConfiguracoesPage;