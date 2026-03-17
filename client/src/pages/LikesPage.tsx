import { useQuery } from "@tanstack/react-query";
import { userService } from "@/api/userService";
import type { Game } from "@/types";
import GameCard from "@/components/GameCard";
import { Heart } from "lucide-react";

const LikesPage = () => {
  const { data: likedGames, isLoading } = useQuery({
    queryKey: ["user-likes"],
    queryFn: async () => {
      return await userService.getLikedGames();
    },
  });

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 animate-fade-in">
      <h1 className="font-display text-3xl font-bold mb-8 flex items-center gap-3">
        <Heart className="h-8 w-8 text-primary" /> Wishlist
      </h1>

      {isLoading ? (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="aspect-[3/4] animate-pulse rounded-lg bg-card" />
          ))}
        </div>
      ) : likedGames && likedGames.length > 0 ? (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-5 lg:gap-6">
          {likedGames.map((game) => (
            <GameCard key={game._id} game={game} />
          ))}
        </div>
      ) : (
        <div className="py-20 text-center">
          <Heart className="mx-auto h-16 w-16 text-muted-foreground/30" />
          <p className="mt-4 text-lg text-muted-foreground">No wishlist items yet</p>
        </div>
      )}
    </div>
  );
};

export default LikesPage;
