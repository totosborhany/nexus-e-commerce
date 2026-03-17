import client from './client';
import type { Game } from '@/types';

export interface GameFilters {
  search?: string;
  genre?: string;
  category?: string;
  sort?: string;
  page?: number;
  limit?: number;
}

export interface GamesResponse {
  status: string;
  results: number;
  data: Game[];
}

const extractErrorMessage = (error: unknown): string => {
  if (error && typeof error === 'object' && 'response' in error) {
    const err = error as any;
    if (err.response?.data?.message) return err.response.data.message;
  }
  if (error && typeof error === 'object' && 'message' in error) {
    return (error as any).message;
  }
  return 'Failed to fetch games. Please try again.';
};

export const gameService = {
  getGames: async (filters?: GameFilters): Promise<Game[]> => {
    try {
      const params = {
        sort: filters?.sort || '-createdAt',
        page: filters?.page || 1,
        limit: filters?.limit || 20,
        ...(filters?.search && { search: filters.search }),
        // Genre filtering is done frontend-based, not via API
        ...(filters?.category && { category: filters.category }),
      };

      const res = await client.get('/games', { params });
      return res.data.data || [];
    } catch (error: any) {
      throw new Error(extractErrorMessage(error));
    }
  },

  getGame: async (id: string): Promise<Game> => {
    try {
      const res = await client.get(`/games/${id}`);
      return res.data.data;
    } catch (error: any) {
      throw new Error(extractErrorMessage(error));
    }
  },

  createGame: async (formData: FormData): Promise<Game> => {
    try {
      const res = await client.post('/games', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return res.data.data;
    } catch (error: any) {
      throw new Error(extractErrorMessage(error));
    }
  },

  updateGame: async (id: string, formData: FormData): Promise<Game> => {
    try {
      const res = await client.patch(`/games/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return res.data.data;
    } catch (error: any) {
      throw new Error(extractErrorMessage(error));
    }
  },

  deleteGame: async (id: string) => {
    try {
      return await client.delete(`/games/${id}`);
    } catch (error: any) {
      throw new Error(extractErrorMessage(error));
    }
  },
};
