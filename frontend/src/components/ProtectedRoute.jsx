import { useAuthStore } from "@/store/authStore";
import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";

function ProtectedRoute({ children }) {
  const { isAuthenticated, user, isCheckingAuth, checkAuth } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function verifyAuth() {
      if (!isAuthenticated && !user) {
        try {
          await checkAuth();
          setIsLoading(false);
        } catch (error) {
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
      }
    }

    verifyAuth();
  }, [isAuthenticated, user, checkAuth]);

  // Show loading while checking auth status
  if (isLoading || isCheckingAuth) {
    return (
      <div className="flex items-center justify-center h-screen">
        Loading...
      </div>
    );
  }

  // After loading, check if user is authenticated
  if (!isAuthenticated || !user) {
    // If user is not authenticated, redirect to login page
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default ProtectedRoute;
