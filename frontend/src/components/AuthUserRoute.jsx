import { useAuthStore } from "@/store/authStore";
import { Navigate } from "react-router-dom";

function AuthUserRoute({ children }) {
  const { isAuthenticated, user } = useAuthStore();

  return isAuthenticated || user ? (
    <Navigate to="/dashboard" replace />
  ) : (
    children
  );
}

export default AuthUserRoute;
