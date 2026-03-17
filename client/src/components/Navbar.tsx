import { Link, useNavigate } from "react-router-dom";
import { ShoppingCart, User, Heart, LogOut, Menu, Search, Gamepad2, MessageCircle, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/hooks/useCart";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Navbar = () => {
  const { user, logout } = useAuth();
  const { data: cart } = useCart();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  const cartCount = cart?.games?.length || 0;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/browse?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2">
          <Gamepad2 className="h-7 w-7 text-primary" />
          <span className="font-display text-xl font-bold tracking-tight">NEXUS</span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          <Link to="/browse" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
            Browse
          </Link>
          {user?.role === "publisher" && (
            <Link to="/publisher" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
              Publisher
            </Link>
          )}
          {user?.role === "admin" && (
            <>
              <Link to="/admin" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                Admin
              </Link>
              <Link to="/publisher" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                Games
              </Link>
            </>
          )}
        </nav>

        <form onSubmit={handleSearch} className="hidden max-w-sm flex-1 px-8 md:block">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search games..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-9 w-full rounded-lg border border-border bg-secondary pl-9 pr-4 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </form>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            title="Chat with support (coming soon)"
            className="cursor-not-allowed opacity-50"
          >
            <MessageCircle className="h-5 w-5" />
          </Button>

          {user && (
            <Link to="/cart" className="relative">
              <Button variant="ghost" size="icon">
                <ShoppingCart className="h-5 w-5" />
                {cartCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-success text-xs font-bold text-success-foreground">
                    {cartCount}
                  </span>
                )}
              </Button>
            </Link>
          )}

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <User className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <div className="px-2 py-1.5">
                  <p className="text-sm font-medium">{user?.name || "User"}</p>
                  <p className="text-xs text-muted-foreground">{user?.email || "email@example.com"}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate("/profile")}>
                  <User className="mr-2 h-4 w-4" /> Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/library")}>
                  <Gamepad2 className="mr-2 h-4 w-4" /> My Library
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/reviews")}>
                  <MessageSquare className="mr-2 h-4 w-4" /> My Reviews
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/likes")}>
                  <Heart className="mr-2 h-4 w-4" /> Wishlist
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => { logout(); navigate("/"); }}>
                  <LogOut className="mr-2 h-4 w-4" /> Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => navigate("/login")}>
                Sign In
              </Button>
              <Button variant="default" size="sm" onClick={() => navigate("/signup")}>
                Sign Up
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
