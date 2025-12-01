import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// Páginas de Autenticação
import LoginPage from "./Pages/LoginPage";
import RegisterPage from "./Pages/RegisterPage";

// Contextos
import { ThemeProvider } from "./Context/ThemeContext";
import { EmpresaProvider } from "./Context/EmpresaContext";

// Componentes Gerais
import Navbar from "./Components/Navbar";
import PrivateRoute from "./Components/PrivateRoute";
import InstallPrompt from "./Components/InstallPrompt"; // <--- Não esqueça o prompt de instalação

// Home
import HomePage from "./Pages/HomePage";

// Categorias
import CategoriasPage from "./Pages/CategoriasPage";
import CategoriaFormPage from "./Pages/CategoriaFormPage";

// Procedimentos
import ProcedimentosPage from "./Pages/ProcedimentosPage";
import ProcedimentoFormPage from "./Pages/ProcedimentoFormPage";

// Clientes
import ClientesPage from "./Pages/ClientesPage";
import ClienteFormPage from "./Pages/ClienteFormPage";
import ClienteHistoricoPage from "./Pages/ClienteHistoricoPage";

// Agendamentos
import AgendamentosPage from "./Pages/AgendamentosPage";
import AgendamentoFormPage from "./Pages/AgendamentoFormPage";

// Mapeamentos (Upload)
import MapeamentoFormPage from "./Pages/MapeamentoFormPage";

// Promoções
import PromocoesPage from "./Pages/PromocoesPage";
import PromocaoFormPage from "./Pages/PromocaoFormPage";

// Configurações
import FormasPagamentoPage from "./Pages/FormasPagamentoPage";
import ConfigEmpresaPage from "./Pages/ConfigEmpresaPage";

// Calendário
import CalendarioPage from "./Pages/CalendarioPage";


function App() {
  return (
    <ThemeProvider>
      <EmpresaProvider>
        <Router>
          <Navbar />

          {/* --- REMOVIDA A DIV CONTAINER DAQUI --- */}
          {/* O Login agora pode ocupar 100% da tela, e as outras páginas usam seus próprios containers */}

          <Routes>
            {/* --- Rotas Públicas --- */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* --- Rotas Protegidas (Só entra com Login) --- */}

            {/* Dashboard */}
            <Route path="/" element={<PrivateRoute><HomePage /></PrivateRoute>} />

            {/* Categorias */}
            <Route path="/categorias" element={<PrivateRoute><CategoriasPage /></PrivateRoute>} />
            <Route path="/categorias/novo" element={<PrivateRoute><CategoriaFormPage /></PrivateRoute>} />
            <Route path="/categorias/editar/:id" element={<PrivateRoute><CategoriaFormPage /></PrivateRoute>} />

            {/* Procedimentos */}
            <Route path="/procedimentos" element={<PrivateRoute><ProcedimentosPage /></PrivateRoute>} />
            <Route path="/procedimentos/novo" element={<PrivateRoute><ProcedimentoFormPage /></PrivateRoute>} />
            <Route path="/procedimentos/editar/:id" element={<PrivateRoute><ProcedimentoFormPage /></PrivateRoute>} />

            {/* Agendamentos */}
            <Route path="/agendamentos" element={<PrivateRoute><AgendamentosPage /></PrivateRoute>} />
            <Route path="/agendamentos/novo" element={<PrivateRoute><AgendamentoFormPage /></PrivateRoute>} />
            <Route path="/agendamentos/editar/:id" element={<PrivateRoute><AgendamentoFormPage /></PrivateRoute>} />

            {/* Clientes */}
            <Route path="/clientes" element={<PrivateRoute><ClientesPage /></PrivateRoute>} />
            <Route path="/clientes/novo" element={<PrivateRoute><ClienteFormPage /></PrivateRoute>} />
            <Route path="/clientes/editar/:id" element={<PrivateRoute><ClienteFormPage /></PrivateRoute>} />
            <Route path="/clientes/historico/:id" element={<PrivateRoute><ClienteHistoricoPage /></PrivateRoute>} />

            {/* Calendário */}
            <Route path="/calendario" element={<PrivateRoute><CalendarioPage /></PrivateRoute>} />

            {/* Promoções */}
            <Route path="/promocoes" element={<PrivateRoute><PromocoesPage /></PrivateRoute>} />
            <Route path="/promocoes/novo" element={<PrivateRoute><PromocaoFormPage /></PrivateRoute>} />
            <Route path="/promocoes/editar/:id" element={<PrivateRoute><PromocaoFormPage /></PrivateRoute>} />

            {/* Configurações */}
            <Route path="/config/pagamentos" element={<PrivateRoute><FormasPagamentoPage /></PrivateRoute>} />
            <Route path="/config/geral" element={<PrivateRoute><ConfigEmpresaPage /></PrivateRoute>} />

            {/* Mapeamentos */}
            <Route path="/mapeamentos/novo/:agendamentoId" element={<PrivateRoute><MapeamentoFormPage /></PrivateRoute>} />

          </Routes>

          <InstallPrompt />

        </Router>
      </EmpresaProvider>
    </ThemeProvider>
  );
}

export default App;