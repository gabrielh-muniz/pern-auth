import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail } from "lucide-react";
import { useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { toast } from "sonner";
import { Link } from "react-router-dom";

function ForgotPasswordPage() {
  const [email, setEmail] = useState("");

  const { isLoading, error, forgotPassword, clearError } = useAuthStore();

  async function submit(e) {
    e.preventDefault();
    try {
      await forgotPassword(email);
      setEmail("");
      toast.success("Password reset link sent!");
    } catch (error) {
      //toast.error("Failed to send password reset link.");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Enter Your Email</CardTitle>
          <CardDescription>
            Type in the email associated with your account to receive a password
            reset link.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-6" onSubmit={submit}>
            <div className="space-y-2">
              <div className="flex flex-col items-center space-y-2">
                <div className="relative w-full">
                  <Mail
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    size={18}
                  />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    className="pl-10"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Verifying..." : "Verify Email"}
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

export default ForgotPasswordPage;
