import { Navigate } from "react-router-dom";

function PrivateRoute({ children }) {
  const token = localStorage.getItem("token");

  // Se não tem token, chuta para o login imediatamente
  if (!token) {
    return <Navigate to="/login" />;
  }

  // Se tem token, deixa entrar
  return children;
}

export default PrivateRoute;