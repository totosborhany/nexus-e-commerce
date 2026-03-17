import { Link } from "react-router-dom";
import { Star, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getImageUrl } from "@/api/client";
import type { Game } from "@/types";
import { useAddToCart } from "@/hooks/useCart";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface GameCardProps {
  game: Game;
}

const GameCard = ({ game }: GameCardProps) => {
  const { user } = useAuth();
  const addToCart = useAddToCart();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      toast.error("Please login to add games to cart");
      return;
    }
    addToCart.mutate(game._id, {
      onSuccess: () => toast.success(`${game.name} added to cart!`),
      onError: (err: any) => toast.error(err.response?.data?.message || "Failed to add to cart"),
    });
  };

  return (
    <Link to={`/games/${game._id}`} className="group block">
      <div className="relative overflow-hidden rounded-lg bg-card transition-all duration-300 hover:scale-[1.03] hover:shadow-xl hover:shadow-primary/10">
        <div className="aspect-[3/4] overflow-hidden">
          <img
            src={getImageUrl(game.photo)}
            alt={game.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        </div>
        <div className="p-4">
          <h3 className="font-display text-base font-semibold truncate">{game.name || "Unknown Game"}</h3>
          <div className="mt-1 flex items-center gap-2">
            {Array.isArray(game.genre) && game.genre.slice(0, 2).map((g) => (
              <span key={g} className="text-xs text-muted-foreground">{g}</span>
            ))}
          </div>
          <div className="mt-3 flex items-center justify-between">
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
              <span className="text-sm font-medium">{game.ratingsAverage?.toFixed(1) || "N/A"}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-display text-lg font-bold text-success">${game.price?.toFixed(2)}</span>
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8"
                onClick={handleAddToCart}
                disabled={addToCart.isPending}
              >
                <ShoppingCart className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default GameCard;
