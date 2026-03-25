import client from './client';
import type { Game } from '@/types';

export interface Cart {
  _id: string;
  user: string;
  games: Game[];
  createdAt: string;
  updatedAt: string;
}

const extractErrorMessage = (error: any): string => {
  if (error.response?.data?.message) return error.response.data.message;
  if (error.message) return error.message;
  return 'Cart operation failed. Please try again.';
};

export const cartService = {
  getCart: async (): Promise<Game[]> => {
    try {
      const res = await client.get('/cart');
      // Backend returns: { status: "success", data: [] } (array of games)
      return Array.isArray(res.data.data) ? res.data.data : [];
    } catch (error: any) {
      console.error('Error fetching cart:', error);
      return [];
    }
  },

  addToCart: async (gameId: string): Promise<void> => {
    try {
      await client.post(`/cart/${gameId}`);
      // The mutation hook will handle refetching via invalidateQueries
    } catch (error: any) {
      throw new Error(extractErrorMessage(error));
    }
  },

  removeFromCart: async (gameId: string): Promise<void> => {
    try {
      await client.delete(`/cart/${gameId}`);
      // The mutation hook will handle refetching via invalidateQueries
    } catch (error: any) {
      throw new Error(extractErrorMessage(error));
    }
  },

  clearCart: async (): Promise<void> => {
    try {
      await client.delete('/cart');
    } catch (error: any) {
      throw new Error(extractErrorMessage(error));
    }
  },
};
