import { useQuery } from "@tanstack/react-query";
import { gameService } from "@/api/gameService";
import type { Game } from "@/types";

export interface GameFilters {
  search?: string;
  genre?: string;
  category?: string;
  sort?: string;
  page?: number;
  limit?: number;
}

export const useGames = (params?: GameFilters) => {
  return useQuery({
    queryKey: ["games", params],
    queryFn: async () => {
      return await gameService.getGames(params);
    },
  });
};

export const useGame = (id: string) => {
  return useQuery({
    queryKey: ["game", id],
    queryFn: async () => {
      return await gameService.getGame(id);
    },
    enabled: !!id,
  });
};
