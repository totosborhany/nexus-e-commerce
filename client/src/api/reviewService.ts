import client from './client';

export interface Review {
  _id: string;
  text: string;
  rating: number;
  user: {
    _id: string;
    name: string;
  };
  game: {
    _id: string;
    name: string;
  };
  createdAt: string;
}

const extractErrorMessage = (error: any): string => {
  if (error.response?.data?.message) return error.response.data.message;
  if (error.message) return error.message;
  return 'Review operation failed. Please try again.';
};

export const reviewService = {
  getGameReviews: async (gameId: string): Promise<Review[]> => {
    try {
      const res = await client.get(`/games/${gameId}/reviews`);
      return res.data.data || [];
    } catch (error: any) {
      console.error('Error fetching reviews:', error);
      return [];
    }
  },

  createReview: async (gameId: string, text: string, rating: number): Promise<Review> => {
    try {
      const res = await client.post(`/games/${gameId}/reviews`, { text, rating });
      return res.data.data;
    } catch (error: any) {
      throw new Error(extractErrorMessage(error));
    }
  },

  getReview: async (gameId: string, reviewId: string): Promise<Review> => {
    try {
      const res = await client.get(`/games/${gameId}/reviews/${reviewId}`);
      return res.data.data;
    } catch (error: any) {
      throw new Error(extractErrorMessage(error));
    }
  },

  deleteReview: async (gameId: string, reviewId: string) => {
    try {
      return await client.delete(`/games/${gameId}/reviews/${reviewId}`);
    } catch (error: any) {
      throw new Error(extractErrorMessage(error));
    }
  },
};
