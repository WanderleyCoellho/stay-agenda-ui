import { useState, useContext, useEffect } from "react";
import api from "../Services/api";
import { EmpresaContext } from "../Context/EmpresaContext";
import { ThemeContext } from "../Context/ThemeContext";

function ConfiguracoesPage() {
    // Contextos
    const { nomeEmpresa, logo, carregarDadosEmpresa } = useContext(EmpresaContext);
    const { primaryColor, changeThemeColor } = useContext(ThemeContext);

    // Estados do Formulário da Empresa
    const [nomeInput, setNomeInput] = useState("");
    const [arquivoInput, setArquivoInput] = useState(null);
    const [preview, setPreview] = useState(null);

    // Carrega dados atuais ao abrir
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
            carregarDadosEmpresa(); // Atualiza o site todo na hora
        } catch (error) {
            alert("Erro ao salvar.");
        }
    };

    // Cores Sugeridas
    const coresPredefinidas = [
        "#6f42c1", // Roxo Original
        "#0d6efd", // Azul Royal
        "#198754", // Verde
        "#d63384", // Rosa Pink
        "#fd7e14", // Laranja
        "#212529", // Preto Dark
    ];

    return (
        <div className="container mt-4 mb-5">
            <h2 className="mb-4 fw-bold text-secondary">⚙️ Configurações</h2>

            <div className="row g-4">

                {/* --- CARD 1: IDENTIDADE DA EMPRESA --- */}
                <div className="col-12 col-md-6">
                    <div className="card shadow h-100 border-0">

                        {/* Cabeçalho Dinâmico */}
                        <div className="card-header text-white py-3" style={{ backgroundColor: primaryColor }}>
                            <h5 className="mb-0 fw-bold">🏢 Identidade Visual</h5>
                        </div>

                        <div className="card-body p-4">
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
                                <div className="mb-4 text-center p-3 border rounded bg-light" style={{ minHeight: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    {preview ? (
                                        <img src={preview} alt="Logo" style={{ height: "80px", objectFit: "contain" }} />
                                    ) : (
                                        <span className="text-muted">Sem logo selecionada</span>
                                    )}
                                </div>

                                {/* Botão Dinâmico */}
                                <button className="btn text-white w-100 fw-bold py-2 shadow-sm" style={{ backgroundColor: primaryColor }}>
                                    💾 Salvar Identidade
                                </button>
                            </form>
                        </div>
                    </div>
                </div>

                {/* --- CARD 2: TEMA E CORES --- */}
                <div className="col-12 col-md-6">
                    <div className="card shadow h-100 border-0">

                        {/* Cabeçalho Dinâmico */}
                        <div className="card-header text-white py-3" style={{ backgroundColor: primaryColor }}>
                            <h5 className="mb-0 fw-bold">🎨 Aparência do Sistema</h5>
                        </div>

                        <div className="card-body p-4">
                            <p className="text-muted small mb-3">
                                Escolha a cor principal que combina com sua marca. Isso afetará botões, cabeçalhos e menus.
                            </p>

                            <label className="form-label fw-bold mb-2">Cores Sugeridas:</label>
                            <div className="d-flex flex-wrap gap-2 mb-4">
                                {coresPredefinidas.map(cor => (
                                    <button
                                        key={cor}
                                        onClick={() => changeThemeColor(cor)}
                                        className="btn rounded-circle shadow-sm border-2"
                                        style={{
                                            width: '45px', height: '45px',
                                            backgroundColor: cor,
                                            borderColor: primaryColor === cor ? '#000' : 'transparent',
                                            transform: primaryColor === cor ? 'scale(1.1)' : 'scale(1)',
                                            transition: 'all 0.2s'
                                        }}
                                        title={cor}
                                    />
                                ))}
                            </div>

                            <hr />

                            <label className="form-label fw-bold mb-2">Cor Personalizada:</label>
                            <div className="d-flex align-items-center gap-3 bg-light p-3 rounded border">
                                <input
                                    type="color"
                                    className="form-control form-control-color shadow-sm"
                                    value={primaryColor}
                                    onChange={(e) => changeThemeColor(e.target.value)}
                                    title="Escolher cor exata"
                                />
                                <div className="small text-muted">
                                    Toque para abrir o seletor de cores.
                                </div>
                            </div>

                            {/* Preview Visual do Botão */}
                            <div className="mt-4">
                                <label className="form-label fw-bold small text-muted">Como vai ficar:</label>
                                <div className="p-3 rounded text-white text-center fw-bold shadow-sm" style={{ backgroundColor: primaryColor, transition: 'background 0.3s' }}>
                                    EXEMPLO DE BOTÃO
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}

export default ConfiguracoesPage;