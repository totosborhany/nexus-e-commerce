import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { userService } from "@/api/userService";
import { getImageUrl } from "@/api/client";
import { toast } from "sonner";
import { User, Lock, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

const ProfilePage = () => {
  const { user, updateUser, logout } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [photo, setPhoto] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwLoading, setPwLoading] = useState(false);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error("User not authenticated");
      return;
    }
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("email", email);
      if (photo) formData.append("photo", photo);
      const updatedUser = await userService.updateProfile(formData);
      if (updatedUser && typeof updatedUser === "object") {
        updateUser(updatedUser);
        toast.success("Profile updated!");
      } else {
        toast.error("Invalid response from server");
      }
    } catch (err: any) {
      toast.error(err.message || err.response?.data?.message || "Failed");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) { toast.error("Passwords don't match"); return; }
    setPwLoading(true);
    try {
      await userService.updatePassword(currentPassword, newPassword, confirmPassword);
      toast.success("Password updated!");
      setCurrentPassword(""); setNewPassword(""); setConfirmPassword("");
    } catch (err: any) {
      toast.error(err.message || err.response?.data?.message || "Failed");
    } finally {
      setPwLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!confirm("Are you sure you want to delete your account?")) return;
    try {
      await userService.deleteAccount();
      await logout();
      navigate("/");
      toast.success("Account deleted");
    } catch (err: any) {
      toast.error(err.message || err.response?.data?.message || "Failed");
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 animate-fade-in">
      {!user ? (
        <div className="py-20 text-center">
          <p className="text-lg text-muted-foreground">Please log in to view your profile</p>
          <Button className="mt-4" onClick={() => navigate("/login")}>Login</Button>
        </div>
      ) : (
        <>
      <h1 className="font-display text-3xl font-bold mb-8 flex items-center gap-3">
        <User className="h-8 w-8 text-primary" /> Profile
      </h1>

      <div className="space-y-8">
        <form onSubmit={handleUpdateProfile} className="rounded-xl bg-card p-6 space-y-4">
          <div className="flex items-center gap-4">
            <img src={getImageUrl(user?.photo)} alt="Avatar" className="h-16 w-16 rounded-full object-cover" />
            <div>
              <Label htmlFor="photo" className="cursor-pointer text-primary hover:underline">Change Photo</Label>
              <input id="photo" type="file" accept="image/*" className="hidden" onChange={(e) => setPhoto(e.target.files?.[0] || null)} />
            </div>
          </div>
          <div>
            <Label htmlFor="name">Username</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <Button type="submit" disabled={loading}>{loading ? "Saving..." : "Save Changes"}</Button>
        </form>

        <form onSubmit={handleUpdatePassword} className="rounded-xl bg-card p-6 space-y-4">
          <h2 className="font-display text-lg font-semibold flex items-center gap-2">
            <Lock className="h-5 w-5" /> Change Password
          </h2>
          <div>
            <Label htmlFor="currentPassword">Current Password</Label>
            <Input id="currentPassword" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required />
          </div>
          <div>
            <Label htmlFor="newPassword">New Password</Label>
            <Input id="newPassword" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required minLength={8} />
          </div>
          <div>
            <Label htmlFor="confirmPassword">Confirm New Password</Label>
            <Input id="confirmPassword" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
          </div>
          <Button type="submit" disabled={pwLoading}>{pwLoading ? "Updating..." : "Update Password"}</Button>
        </form>

        <div className="rounded-xl border border-destructive/30 bg-card p-6">
          <h2 className="font-display text-lg font-semibold flex items-center gap-2 text-destructive">
            <Trash2 className="h-5 w-5" /> Danger Zone
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">Permanently delete your account and all associated data.</p>
          <Button variant="destructive" className="mt-4" onClick={handleDeleteAccount}>Delete Account</Button>
        </div>
      </div>
        </>
      )}
    </div>
  );
};

export default ProfilePage;
