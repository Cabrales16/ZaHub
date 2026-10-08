import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

const ROLES_PERMITIDOS = ["ADMIN", "CAJERO", "COCINA"];

export default function ProtectedRoute({ children }) {
  const { userProfile, loading } = useAuth();

  // 🔹 Si ya sabemos que NO hay usuario -> al login
  if (!loading && !userProfile) {
    return <Navigate to="/login" replace />;
  }

  // 🔹 Si sí hay usuario pero sin rol permitido (o con la cuenta desactivada)
  if (
    userProfile &&
    (userProfile.activo === false || !ROLES_PERMITIDOS.includes(userProfile.rol))
  ) {
    return (
      <div className="p-4 text-red-600">
        No tienes permiso para ver esta sección.
      </div>
    );
  }

  // 🔹 Mientras carga, o si ya hay usuario -> mostramos la app normal
  return children;
}
