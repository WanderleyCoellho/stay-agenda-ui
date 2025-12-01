import axios from "axios";

// Lê a variável de ambiente. Se não existir, tenta usar localhost como fallback.
const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8080/api";

const api = axios.create({
  baseURL: apiUrl,
})

// --- INTERCEPTOR DE PEDIDO (REQUEST) ---
// Antes de enviar qualquer coisa, coloca o crachá (Token)
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// --- INTERCEPTOR DE RESPOSTA (RESPONSE) ---
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Se o erro for 403 (Proibido) ou 401 (Não autorizado), manda para o Login
    if (error.response && (error.response.status === 403 || error.response.status === 401)) {
      localStorage.removeItem("token"); // Limpa token inválido
      // Redirecionamento forçado via window.location (o navigate não funciona aqui dentro)
      if (!window.location.pathname.includes("/login") && !window.location.pathname.includes("/register")) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;