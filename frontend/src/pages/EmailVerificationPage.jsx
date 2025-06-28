import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { toast } from "sonner";

export default function EmailVerificationPage() {
  const [value, setValue] = useState("");

  const { verifyEmail, error, isLoading } = useAuthStore();

  async function submit(e) {
    e.preventDefault();
    try {
      await verifyEmail(value);
      toast.success("Email verified successfully!", { closeButton: true });
    } catch (err) {}
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">
            Enter Verification Code
          </CardTitle>
          <CardDescription>
            We've sent a 6-digit verification code to your phone number
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-6" onSubmit={submit}>
            <div className="space-y-2">
              <div className="flex flex-col items-center space-y-2">
                <InputOTP
                  maxLength={6}
                  value={value}
                  onChange={(value) => setValue(value)}
                >
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Verifying..." : "Verify Email"}
            </Button>
          </form>
          {error && <div className="mt-4 text-red-600">{error}</div>}
        </CardContent>
      </Card>
    </div>
  );
}
