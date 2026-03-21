import { Navigate } from "react-router";
import { useAuth } from "../auth/AuthContext";

export default function ProtectedRoute({ children }) {
  const { token, loadingUser } = useAuth();

  if (loadingUser) {
    return <p>Loading...</p>;
  }

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
}