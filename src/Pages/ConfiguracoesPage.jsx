import { useState, useContext, useEffect } from "react";
import api from "../Services/api";
import { EmpresaContext } from "../Context/EmpresaContext";
import { ThemeContext } from "../Context/ThemeContext";

function ConfiguracoesPage() {
    // --- CONTEXTOS ---
    const { nomeEmpresa, logo, carregarDadosEmpresa } = useContext(EmpresaContext);
    const { primaryColor, changeThemeColor } = useContext(ThemeContext);

    // --- ESTADOS FORMULÁRIO EMPRESA ---
    const [nomeInput, setNomeInput] = useState("");
    const [arquivoInput, setArquivoInput] = useState(null);
    const [preview, setPreview] = useState(null);

    // Carrega dados atuais
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

    // --- CORES PRÉ-DEFINIDAS (Paletas Bonitas) ---
    const coresPredefinidas = [
        "#6f42c1", // Roxo Original
        "#0d6efd", // Azul Royal
        "#198754", // Verde
        "#d63384", // Rosa Pink
        "#fd7e14", // Laranja
        "#212529", // Preto/Dark
    ];

    return (
        <div className="container mt-4 mb-5">
            <h2 className="mb-4 fw-bold text-secondary">⚙️ Configurações Gerais</h2>

            <div className="row g-4">

                {/* === CARD 1: IDENTIDADE DA EMPRESA (LADO ESQUERDO) === */}
                <div className="col-md-6">
                    <div className="card shadow h-100 border-0">
                        <div className="card-header bg-white py-3 border-bottom">
                            <h5 className="mb-0 fw-bold text-primary">🏢 Identidade Visual</h5>
                        </div>
                        <div className="card-body">
                            <form onSubmit={handleSaveEmpresa}>
                                <div className="mb-3">
                                    <label className="form-label fw-bold">Nome do Estabelecimento</label>
                                    <input
                                        type="text" className="form-control" required
                                        value={nomeInput} onChange={e => setNomeInput(e.target.value)}
                                        placeholder="Ex: Barbearia do Zé"
                                    />
                                </div>

                                <div className="mb-3">
                                    <label className="form-label fw-bold">Logotipo</label>
                                    <input type="file" className="form-control" accept="image/*" onChange={handleFileChange} />
                                    <div className="form-text">Aparece no Menu, Login e PDF.</div>
                                </div>

                                {/* Preview da Logo */}
                                <div className="mb-3 text-center p-3 border rounded bg-light" style={{ minHeight: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    {preview ? (
                                        <img src={preview} alt="Logo" style={{ height: "80px", objectFit: "contain" }} />
                                    ) : (
                                        <span className="text-muted">Sem logo selecionada</span>
                                    )}
                                </div>

                                <button className="btn btn-primary w-100 fw-bold">Salvar Identidade</button>
                            </form>
                        </div>
                    </div>
                </div>

                {/* === CARD 2: TEMA E CORES (LADO DIREITO) === */}
                {/* Verifique se este bloco está no seu código! */}
                <div className="col-md-6">
                    <div className="card shadow h-100 border-0">
                        <div className="card-header bg-white py-3 border-bottom">
                            <h5 className="mb-0 fw-bold text-primary">🎨 Aparência do Sistema</h5>
                        </div>
                        <div className="card-body">
                            <p className="text-muted small">Escolha a cor principal que combina com sua marca.</p>

                            <label className="form-label fw-bold mb-3">Cores Sugeridas:</label>
                            <div className="d-flex flex-wrap gap-2 mb-4">
                                {coresPredefinidas.map(cor => (
                                    <button
                                        key={cor}
                                        onClick={() => changeThemeColor(cor)}
                                        className="btn rounded-circle shadow-sm border-2"
                                        style={{
                                            width: '40px', height: '40px',
                                            backgroundColor: cor,
                                            borderColor: primaryColor === cor ? '#000' : 'transparent',
                                            transform: primaryColor === cor ? 'scale(1.1)' : 'scale(1)',
                                            transition: 'transform 0.2s'
                                        }}
                                        title={cor}
                                    />
                                ))}
                            </div>

                            <hr />

                            <label className="form-label fw-bold mb-2">Cor Personalizada:</label>
                            <div className="d-flex align-items-center gap-3">
                                <input
                                    type="color"
                                    className="form-control form-control-color"
                                    value={primaryColor}
                                    onChange={(e) => changeThemeColor(e.target.value)}
                                    title="Escolher cor exata"
                                />
                                <div className="form-text m-0">
                                    Toque na caixa para escolher qualquer cor.
                                </div>
                            </div>

                            {/* Preview Visual */}
                            <div className="mt-4 p-3 rounded text-white text-center fw-bold shadow-sm" style={{ backgroundColor: primaryColor, transition: 'background 0.3s' }}>
                                VISUALIZAÇÃO DO BOTÃO
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}

export default ConfiguracoesPage;