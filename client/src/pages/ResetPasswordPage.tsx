// // import { useState } from "react";
// // import { useLocation, useNavigate } from "react-router-dom";
// // import { userService } from "@/api/userService";
// // import { Button } from "@/components/ui/button";
// // import { Input } from "@/components/ui/input";
// // import { Label } from "@/components/ui/label";
// // import { toast } from "sonner";
// import React, { useState } from "react"; // <-- add useState here
// import { useLocation, useNavigate } from "react-router-dom";
// import { userService } from "@/api/userService";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { toast } from "sonner";

// const ResetPasswordPage = () => {
//   const navigate = useNavigate();
//   const location = useLocation();

//   // Get token from query string
//   const query = new URLSearchParams(location.search);
//   const token = query.get("token");

//   const [password, setPassword] = useState("");
//   const [passwordConfirm, setPasswordConfirm] = useState("");
//   const [loading, setLoading] = useState(false);

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();

//     if (!token) {
//       toast.error("Invalid reset token");
//       return;
//     }

//     if (password !== passwordConfirm) {
//       toast.error("Passwords don't match");
//       return;
//     }

//     setLoading(true);
//     try {
//       await userService.resetPassword(token, password, passwordConfirm);
//       toast.success("Password reset! Please login.");
//       navigate("/login");
//     } catch (err: any) {
//       toast.error(err.message || err.response?.data?.message || "Failed");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="flex min-h-[80vh] items-center justify-center px-4 animate-fade-in">
//       <div className="w-full max-w-md rounded-xl bg-card p-8">
//         <h1 className="font-display text-2xl font-bold mb-6">Reset Password</h1>
//         <form onSubmit={handleSubmit} className="space-y-4">
//           <div>
//             <Label htmlFor="password">New Password</Label>
//             <Input
//               id="password"
//               type="password"
//               value={password}
//               onChange={(e) => setPassword(e.target.value)}
//               required
//               minLength={8}
//             />
//           </div>
//           <div>
//             <Label htmlFor="passwordConfirm">Confirm Password</Label>
//             <Input
//               id="passwordConfirm"
//               type="password"
//               value={passwordConfirm}
//               onChange={(e) => setPasswordConfirm(e.target.value)}
//               required
//             />
//           </div>
//           <Button type="submit" className="w-full" disabled={loading}>
//             {loading ? "Resetting..." : "Reset Password"}
//           </Button>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default ResetPasswordPage;
import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { userService } from "@/api/userService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [token, setToken] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  // Extract token from query string and clean URL
  useEffect(() => {
    const query = new URLSearchParams(location.search);
    const t = query.get("token");
    if (t) {
      setToken(t);

      // Remove token from URL without reloading
      const cleanUrl = location.pathname;
      window.history.replaceState({}, "", cleanUrl);
    }
  }, [location.search, location.pathname]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      toast.error("Invalid reset token");
      return;
    }

    if (password !== passwordConfirm) {
      toast.error("Passwords don't match");
      return;
    }

    setLoading(true);
    try {
      await userService.resetPassword(token, password, passwordConfirm);
      toast.success("Password reset! Please login.");
      navigate("/login");
    } catch (err: any) {
      toast.error(err.message || err.response?.data?.message || "Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4 animate-fade-in">
      <div className="w-full max-w-md rounded-xl bg-card p-8">
        <h1 className="font-display text-2xl font-bold mb-6">Reset Password</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="password">New Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
            />
          </div>
          <div>
            <Label htmlFor="passwordConfirm">Confirm Password</Label>
            <Input
              id="passwordConfirm"
              type="password"
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Resetting..." : "Reset Password"}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ResetPasswordPage;