import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { userService } from "@/api/userService";
import { reviewService } from "@/api/reviewService";
import { Button } from "@/components/ui/button";
import { Star, MessageSquare, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface Review {
  _id: string;
  text: string;
  rating: number;
  game?: { _id: string; name: string };
  createdAt: string;
}

const UserReviewsPage = () => {
  const qc = useQueryClient();

  const { data: reviews, isLoading } = useQuery({
    queryKey: ["user-reviews"],
    queryFn: async () => {
      return await userService.getUserReviews() as Review[];
    },
  });

  const deleteReview = useMutation({
    mutationFn: async (reviewId: string) => {
      // We need gameId - get it from the review data
      const review = reviews?.find((r) => r._id === reviewId);
      if (!review?.game?._id) throw new Error("Game not found");
      await reviewService.deleteReview(review.game._id, reviewId);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["user-reviews"] });
      toast.success("Review deleted");
    },
    onError: (err: any) => toast.error(err.message || "Failed to delete review"),
  });

  if (isLoading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8">
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-32 animate-pulse rounded-lg bg-card" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 animate-fade-in">
      <h1 className="font-display text-3xl font-bold mb-8 flex items-center gap-3">
        <MessageSquare className="h-8 w-8 text-primary" /> My Reviews
      </h1>

      {!reviews || reviews.length === 0 ? (
        <div className="py-20 text-center">
          <MessageSquare className="mx-auto h-16 w-16 text-muted-foreground/30" />
          <p className="mt-4 text-lg text-muted-foreground">No reviews yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => {
            if (!review || !review._id) return null;
            const game = review.game && typeof review.game === "object" ? review.game : null;
            const rating = Number(review.rating) || 0;
            
            return (
              <div key={review._id} className="rounded-lg bg-card p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    {game && (
                      <h3 className="font-display font-semibold mb-2">{game.name}</h3>
                    )}
                    <div className="flex items-center gap-2 mb-3">
                      {Array.from({ length: Math.min(rating, 5) }).map((_, i) => (
                        <Star
                          key={i}
                          className="h-4 w-4 fill-amber-400 text-amber-400"
                        />
                      ))}
                    </div>
                    <p className="text-muted-foreground">{review.text || "No text"}</p>
                    <p className="text-xs text-muted-foreground/60 mt-3">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      if (confirm("Delete this review?")) {
                        deleteReview.mutate(review._id);
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
    </div>
  );
};

export default UserReviewsPage;
