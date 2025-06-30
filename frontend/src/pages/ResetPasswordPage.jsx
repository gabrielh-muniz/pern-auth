import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Lock } from "lucide-react";
import { useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { useSearchParams } from "react-router-dom";

function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const { isLoading, error, resetPassword, clearError } = useAuthStore();

  async function submit(e) {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error("Passwords do not match!", { closeButton: true });
      return;
    }
    try {
      await resetPassword(token, password);
      setPassword("");
      setConfirmPassword("");
      toast.success("Password reset successfully!");
    } catch (error) {
      //toast.error("Failed to send password reset link.");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">
            Reset Your Password
          </CardTitle>
          <CardDescription>Type in your new password below.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-6" onSubmit={submit}>
            <div className="space-y-2">
              <div className="flex flex-col items-center space-y-2">
                <div className="relative w-full">
                  <Lock
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    size={18}
                  />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    className="pl-10"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                <div className="relative w-full">
                  <Lock
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    size={18}
                  />
                  <Input
                    id="confirm-password"
                    type="password"
                    placeholder="Confirm your password"
                    className="pl-10"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Changing..." : "Change Password"}
            </Button>
          </form>
          {error && <div className="mt-4 text-red-600">{error}</div>}
          <Button
            variant="link"
            className="px-0 w-full"
            onClick={() => clearError()}
          >
            <Link to="/login">← Back to login</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

export default ResetPasswordPage;
