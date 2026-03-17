import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { userService } from "@/api/userService";
import { gameService } from "@/api/gameService";
import { reviewService } from "@/api/reviewService";
import { Button } from "@/components/ui/button";
import { getImageUrl } from "@/api/client";
import type { User, Game } from "@/types";
import { toast } from "sonner";
import { Shield, Users, Gamepad2, Trash2, BarChart3, MessageSquare } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Review {
  _id: string;
  text: string;
  rating: number;
  user: { _id: string; name: string };
  game: { _id: string; name: string };
  createdAt: string;
}

const AdminDashboard = () => {
  const qc = useQueryClient();

  const { data: users, isLoading: usersLoading } = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      return await userService.getUsers() as User[];
    },
  });

  const { data: games, isLoading: gamesLoading } = useQuery({
    queryKey: ["admin-games"],
    queryFn: async () => {
      return await gameService.getGames({ limit: 1000 }) as Game[];
    },
  });

  const { data: allReviews } = useQuery({
    queryKey: ["admin-reviews"],
    queryFn: async () => {
      // Fetch reviews from all games
      if (!games || games.length === 0) return [];
      try {
        const reviewsPromises = games.map((g) =>
          reviewService.getGameReviews(g._id).catch(() => [])
        );
        const reviewsArrays = await Promise.all(reviewsPromises);
        return reviewsArrays.flat() as Review[];
      } catch (error) {
        console.error("Error fetching reviews:", error);
        return [];
      }
    },
    enabled: !!games && games.length > 0,
  });

  const deleteGame = useMutation({
    mutationFn: async (id: string) => {
      await gameService.deleteGame(id);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-games"] });
      toast.success("Game deleted");
    },
    onError: (err: unknown) => toast.error(typeof err === 'object' && err && 'message' in err ? (err as any).message : "Failed"),
  });

  const deleteUser = useMutation({
    mutationFn: async (userId: string) => {
      await userService.deleteUser(userId);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-users"] });
      toast.success("User deleted");
    },
    onError: (err: unknown) => toast.error(typeof err === 'object' && err && 'message' in err ? (err as any).message : "Failed to delete user"),
  });

  const deleteReview = useMutation({
    mutationFn: async ({ gameId, reviewId }: { gameId: string; reviewId: string }) => {
      await reviewService.deleteReview(gameId, reviewId);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-reviews"] });
      toast.success("Review deleted");
    },
    onError: (err: unknown) => toast.error(typeof err === 'object' && err && 'message' in err ? (err as any).message : "Failed to delete review"),
  });

  const totalUsers = users?.length || 0;
  const totalGames = games?.length || 0;
  const publishers = users?.filter((u) => u.role === "publisher").length || 0;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 animate-fade-in">
      <h1 className="font-display text-3xl font-bold mb-8 flex items-center gap-3">
        <Shield className="h-8 w-8 text-primary" /> Admin Dashboard
      </h1>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="rounded-xl bg-card p-6 text-center">
          <Users className="mx-auto h-8 w-8 text-primary" />
          <p className="mt-2 font-display text-2xl font-bold">{totalUsers}</p>
          <p className="text-sm text-muted-foreground">Total Users</p>
        </div>
        <div className="rounded-xl bg-card p-6 text-center">
          <Gamepad2 className="mx-auto h-8 w-8 text-success" />
          <p className="mt-2 font-display text-2xl font-bold">{totalGames}</p>
          <p className="text-sm text-muted-foreground">Total Games</p>
        </div>
        <div className="rounded-xl bg-card p-6 text-center">
          <BarChart3 className="mx-auto h-8 w-8 text-accent" />
          <p className="mt-2 font-display text-2xl font-bold">{publishers}</p>
          <p className="text-sm text-muted-foreground">Publishers</p>
        </div>
      </div>

      <Tabs defaultValue="users">
        <TabsList className="mb-6">
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="games">Games</TabsTrigger>
          <TabsTrigger value="reviews">Reviews</TabsTrigger>
        </TabsList>

        <TabsContent value="users">
          {usersLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-16 animate-pulse rounded-lg bg-card" />
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {users?.map((u) => (
                <div key={u._id} className="flex items-center gap-4 rounded-lg bg-card p-4">
                  <img src={getImageUrl(u.photo)} alt={u.name} className="h-10 w-10 rounded-full object-cover" />
                  <div className="flex-1">
                    <p className="font-medium">{u.name}</p>
                    <p className="text-sm text-muted-foreground">{u.email}</p>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-medium ${
                    u.role === "admin" ? "bg-primary/20 text-primary" :
                    u.role === "publisher" ? "bg-success/20 text-success" :
                    "bg-secondary text-muted-foreground"
                  }`}>
                    {u.role}
                  </span>
                  <span className={`text-xs ${u.active !== false ? "text-success" : "text-destructive"}`}>
                    {u.active !== false ? "Active" : "Inactive"}
                  </span>
                  {u.role !== "admin" && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        if (confirm(`Delete user ${u.name}?`)) {
                          deleteUser.mutate(u._id);
                        }
                      }}
                      disabled={deleteUser.isPending}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="games">
          {gamesLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-16 animate-pulse rounded-lg bg-card" />
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {games?.map((game) => (
                <div key={game._id} className="flex items-center gap-4 rounded-lg bg-card p-4">
                  <img src={getImageUrl(game.photo)} alt={game.name} className="h-12 w-12 rounded-lg object-cover" />
                  <div className="flex-1">
                    <p className="font-display font-semibold">{game.name}</p>
                    <p className="text-sm text-muted-foreground">{game.genre?.join(", ")} · ${game.price?.toFixed(2)}</p>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    ⭐ {game.ratingsAverage?.toFixed(1)} ({game.reviewCount})
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      if (confirm("Delete this game?")) deleteGame.mutate(game._id);
                    }}
                    disabled={deleteGame.isPending}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="reviews">
          {!allReviews || allReviews.length === 0 ? (
            <div className="py-20 text-center">
              <MessageSquare className="mx-auto h-16 w-16 text-muted-foreground/30" />
              <p className="mt-4 text-lg text-muted-foreground">No reviews to manage</p>
            </div>
          ) : (
            <div className="space-y-3">
              {allReviews.map((review) => {
                if (!review || !review._id) return null;
                const reviewer = typeof review.user === "object" && review.user ? review.user : null;
                const game = typeof review.game === "object" && review.game ? review.game : null;
                const rating = Number(review.rating) || 0;
                
                return (
                  <div key={review._id} className="rounded-lg bg-card p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <p className="font-semibold text-sm">{reviewer?.name || "Anonymous"}</p>
                          <span className="text-xs text-muted-foreground">reviewed</span>
                          <p className="font-semibold text-sm">{game?.name || "Unknown Game"}</p>
                        </div>
                        <div className="flex gap-1 mb-2">
                          {Array.from({ length: Math.min(rating, 5) }).map((_, i) => (
                            <span key={i} className="text-amber-400">⭐</span>
                          ))}
                        </div>
                        <p className="text-sm text-muted-foreground">{review.text || "No text"}</p>
                      <p className="text-xs text-muted-foreground/60 mt-2">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        if (confirm("Delete this review?")) {
                          deleteReview.mutate({
                            gameId: game?._id || "",
                            reviewId: review._id,
                          });
                        }
                      }}
                      disabled={deleteReview.isPending}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboard;
