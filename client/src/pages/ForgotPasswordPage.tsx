import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { userService } from "@/api/userService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await userService.forgotPassword(email);
      toast.success("Reset link sent to your email!");
    } catch (err: any) {
      toast.error(err.message || err.response?.data?.message || "Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4 animate-fade-in">
      <div className="w-full max-w-md rounded-xl bg-card p-8">
        <h1 className="font-display text-2xl font-bold mb-2">Forgot Password</h1>
        <p className="text-sm text-muted-foreground mb-6">Enter your email to receive a reset link</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Sending..." : "Send Reset Link"}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
