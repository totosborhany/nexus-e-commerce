import client from './client';
import type { Game } from '@/types';

export interface CheckoutSession {
  id: string;
  url: string;
  success_url: string;
  cancel_url: string;
  customer_email: string;
  line_items: {
    data: Array<{
      price: { unit_amount: number };
      quantity: number;
    }>;
  };
}

export interface Booking {
  _id: string;
  game: Array<{ _id: string; name: string }> | Game[];
  user: string;
  price: number;
  paid: boolean;
  createdAt: string;
}

const extractErrorMessage = (error: any): string => {
  if (error.response?.data?.message) return error.response.data.message;
  if (error.message) return error.message;
  return 'Booking operation failed. Please try again.';
};

export const bookingService = {
  createCheckoutSession: async (): Promise<CheckoutSession> => {
    try {
      const res = await client.post('/bookings/checkout-session');
      return res.data.session || {};
    } catch (error: any) {
      throw new Error(extractErrorMessage(error));
    }
  },

  getBookings: async (): Promise<Booking[]> => {
    try {
      const res = await client.get('/bookings');
      return res.data.data || [];
    } catch (error: any) {
      console.error('Error fetching bookings:', error);
      return [];
    }
  },

  createBooking: async (gameIds: string[], price: number): Promise<Booking> => {
    try {
      const res = await client.post('/bookings', {
        game: gameIds,
        price,
      });
      return res.data.data;
    } catch (error: any) {
      throw new Error(extractErrorMessage(error));
    }
  },

  getBooking: async (id: string): Promise<Booking> => {
    try {
      const res = await client.get(`/bookings/${id}`);
      return res.data.data;
    } catch (error: any) {
      throw new Error(extractErrorMessage(error));
    }
  },

  updateBooking: async (id: string, data: Partial<Booking>): Promise<Booking> => {
    try {
      const res = await client.patch(`/bookings/${id}`, data);
      return res.data.data;
    } catch (error: any) {
      throw new Error(extractErrorMessage(error));
    }
  },

  deleteBooking: async (id: string) => {
    try {
      return await client.delete(`/bookings/${id}`);
    } catch (error: any) {
      throw new Error(extractErrorMessage(error));
    }
  },
};
