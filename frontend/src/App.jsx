import { Routes, Route } from "react-router-dom";
import RegisterPage from "./pages/RegisterPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import EmailVerificationPage from "./pages/EmailVerificationPage.jsx";
import { useAuthStore } from "@/store/authStore";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";
//import DashboardPage from "@/pages/DashboardPage.jsx";
import ProtectedRoute from "@/components/ProtectedRoute.jsx";
import AuthUserRoute from "@/components/AuthUserRoute.jsx";
import ForgotPasswordPage from "@/pages/ForgotPasswordPage.jsx";
import ResetPasswordPage from "@/pages/ResetPasswordPage.jsx";
import DashboardLayout from "@/layouts/DashboardLayout.jsx";
import GamePage from "@/pages/GamePage.jsx";
import LeaderboardPage from "@/pages/LeaderboardPage.jsx";

function App() {
  const { isAuthenticated, isCheckingAuth, checkAuth } = useAuthStore();

  useEffect(() => {
    const checkUserAuth = async () => {
      if (!isAuthenticated && !isCheckingAuth) {
        try {
          await checkAuth();
        } catch (error) {
          // Silently handle auth check errors
          // This prevents errors from being displayed when user is not logged in
        }
      }
    };
    checkUserAuth();
  }, [checkAuth, isAuthenticated]);

  if (isCheckingAuth) {
    return (
      <div className="flex items-center justify-center h-screen">
        Loading...
      </div>
    );
  }

  return (
    <div>
      <Routes>
        <Route path="/" element={<h1>Home</h1>} />
        <Route
          path="/signup"
          element={
            <AuthUserRoute>
              <RegisterPage />
            </AuthUserRoute>
          }
        />
        <Route
          path="/login"
          element={
            <AuthUserRoute>
              <LoginPage />
            </AuthUserRoute>
          }
        />
        <Route path="/verify-email" element={<EmailVerificationPage />} />
        <Route
          path="/reset-password"
          element={
            <AuthUserRoute>
              <ResetPasswordPage />
            </AuthUserRoute>
          }
        />
        <Route
          path="/forgot-password"
          element={
            <AuthUserRoute>
              <ForgotPasswordPage />
            </AuthUserRoute>
          }
        />
        <Route
          path="/dashboard/*"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<GamePage />} />
          <Route path="game" element={<GamePage />} />
          <Route path="leaderboard" element={<LeaderboardPage />} />
        </Route>
      </Routes>
      <Toaster />
    </div>
  );
}

export default App;
