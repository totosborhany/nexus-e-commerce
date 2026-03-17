import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { cartService } from "@/api/cartService";
import type { Game } from "@/types";

export const useCart = () => {
  return useQuery({
    queryKey: ["cart"],
    queryFn: async () => {
      return await cartService.getCart();
    },
  });
};

export const useAddToCart = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (gameId: string) => {
      return await cartService.addToCart(gameId);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cart"] }),
  });
};

export const useRemoveFromCart = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (gameId: string) => {
      await cartService.removeFromCart(gameId);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cart"] }),
  });
};

export const useClearCart = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      await cartService.clearCart();
    },
    onSuccess: () => {
      qc.setQueryData(["cart"], []);
      qc.invalidateQueries({ queryKey: ["cart"] });
    },
  });
};
