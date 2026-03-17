import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { reviewService } from "@/api/reviewService";
import type { Review } from "@/types";

export const useReviews = (gameId: string) => {
  return useQuery({
    queryKey: ["reviews", gameId],
    queryFn: async () => {
      return await reviewService.getGameReviews(gameId);
    },
    enabled: !!gameId,
  });
};

export const useCreateReview = (gameId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: { text: string; rating: number }) => {
      return await reviewService.createReview(gameId, data.text, data.rating);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["reviews", gameId] });
      qc.invalidateQueries({ queryKey: ["game", gameId] });
    },
  });
};

export const useDeleteReview = (gameId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (reviewId: string) => {
      await reviewService.deleteReview(gameId, reviewId);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["reviews", gameId] });
      qc.invalidateQueries({ queryKey: ["game", gameId] });
    },
  });
};
