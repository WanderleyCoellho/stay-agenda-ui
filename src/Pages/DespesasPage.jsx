import { useEffect, useState, useRef, useContext } from "react";
import { Html5Qrcode } from "html5-qrcode"; // Importa o leitor
import api from "../Services/api";
import { ThemeContext } from "../Context/ThemeContext";

function DespesasPage() {
    const { primaryColor } = useContext(ThemeContext);

    const [despesas, setDespesas] = useState([]);
    const [scanning, setScanning] = useState(false); // Controla se a câmera está aberta
    const [loading, setLoading] = useState(false); // Controla o processamento da nota

    // Elemento onde a câmera vai aparecer
    const scannerRef = useRef(null);
    const html5QrCode = useRef(null);

    useEffect(() => {
        carregarDespesas();

        // Limpeza ao sair da página (garante que a câmera desligue)
        return () => {
            if (html5QrCode.current) {
                html5QrCode.current.stop().catch(err => console.error(err));
            }
        };
    }, []);

    const carregarDespesas = () => {
        api.get("/despesas")
            .then(res => setDespesas(res.data))
            .catch(err => console.error("Erro ao listar despesas", err));
    };

    // --- FUNÇÃO DE INICIAR A CÂMERA ---
    const startScanner = () => {
        setScanning(true);

        // Pequeno delay para o DIV renderizar
        setTimeout(() => {
            html5QrCode.current = new Html5Qrcode("reader");

            const config = { fps: 10, qrbox: { width: 250, height: 250 } };

            // Prefere a câmera traseira (environment)
            html5QrCode.current.start(
                { facingMode: "environment" },
                config,
                onScanSuccess,
                (errorMessage) => { /* ignora erros de frame vazio */ }
            ).catch(err => {
                alert("Erro ao abrir câmera: " + err);
                setScanning(false);
            });
        }, 100);
    };

    // --- FUNÇÃO DE PARAR A CÂMERA ---
    const stopScanner = () => {
        if (html5QrCode.current) {
            html5QrCode.current.stop().then(() => {
                html5QrCode.current.clear();
                setScanning(false);
            }).catch(err => console.error(err));
        } else {
            setScanning(false);
        }
    };

    // --- QUANDO O QR CODE É LIDO ---
    const onScanSuccess = (decodedText) => {
        // 1. Para a câmera
        stopScanner();

        // 2. Pergunta se quer importar
        if (window.confirm(`QR Code detectado!\nLink: ${decodedText}\n\nDeseja importar esta nota?`)) {
            processarNota(decodedText);
        }
    };

    // --- ENVIA PARA O JAVA ---
    const processarNota = async (url) => {
        setLoading(true);
        try {
            await api.post("/despesas/importar/qrcode", { url });
            alert("✅ Sucesso! Nota importada e despesa criada.");
            carregarDespesas(); // Atualiza a lista
        } catch (error) {
            console.error(error);
            alert("Erro ao importar nota. Verifique se o link é válido.");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = (id) => {
        if (window.confirm("Excluir registro?")) {
            api.delete(`/despesas/${id}`).then(carregarDespesas);
        }
    };

    const formatMoney = (val) => val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    const formatDate = (d) => d ? d.split('-').reverse().join('/') : '-';

    return (
        <div className="container mt-4 mb-5">

            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="fw-bold text-secondary">💰 Despesas</h2>

                {/* BOTÃO DE SCAN */}
                <button
                    onClick={scanning ? stopScanner : startScanner}
                    className={`btn fw-bold shadow-sm rounded-pill px-4 ${scanning ? 'btn-danger' : 'btn-primary'}`}
                    style={!scanning ? { backgroundColor: primaryColor } : {}}
                    disabled={loading}
                >
                    {scanning ? "Parar Câmera" : "📸 Ler Nota Fiscal"}
                </button>
            </div>

            {/* --- ÁREA DA CÂMERA (Aparece só quando clica) --- */}
            {scanning && (
                <div className="card mb-4 border-primary shadow">
                    <div className="card-body text-center">
                        <h6 className="text-muted mb-3">Aponte para o QR Code da Nota</h6>
                        {/* O leitor será injetado nesta DIV */}
                        <div id="reader" style={{ width: "100%", maxWidth: "400px", margin: "0 auto" }}></div>
                    </div>
                </div>
            )}

            {/* LOADER */}
            {loading && (
                <div className="alert alert-info text-center">
                    <div className="spinner-border spinner-border-sm me-2"></div>
                    Processando nota na SEFAZ...
                </div>
            )}

            {/* LISTA DE DESPESAS */}
            <div className="card shadow border-0">
                <div className="card-body p-0">
                    <table className="table table-hover align-middle mb-0 mobile-table" style={{ background: 'white', borderRadius: '12px' }}>
                        <thead className="bg-light">
                            <tr>
                                <th className="ps-4">Data</th>
                                <th>Descrição</th>
                                <th>Categoria</th>
                                <th>Valor</th>
                                <th className="text-end pe-4">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {despesas.map((d) => (
                                <tr key={d.id}>
                                    <td className="ps-4 text-muted" data-label="Data">{formatDate(d.dataDespesa)}</td>
                                    <td className="fw-bold text-primary" data-label="Descrição">{d.descricao}</td>
                                    <td data-label="Categoria">
                                        <span className="badge bg-secondary bg-opacity-10 text-secondary border">{d.categoria}</span>
                                    </td>
                                    <td className="fw-bold text-danger" data-label="Valor">
                                        - {formatMoney(d.valorTotal)}
                                    </td>
                                    <td className="text-end pe-4" data-label="Ações">
                                        {d.linkNotaFiscal && (
                                            <a href={d.linkNotaFiscal} target="_blank" rel="noreferrer" className="btn btn-sm btn-outline-info me-2" title="Ver Nota Original">
                                                📄
                                            </a>
                                        )}
                                        <button onClick={() => handleDelete(d.id)} className="btn btn-sm btn-outline-danger">🗑️</button>
                                    </td>
                                </tr>
                            ))}
                            {despesas.length === 0 && <tr><td colSpan="5" className="text-center py-5 text-muted">Nenhuma despesa lançada.</td></tr>}
                        </tbody>
                    </table>
                </div>
            </div>

        </div>
    );
}

export default DespesasPage;