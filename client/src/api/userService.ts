import client from './client';

export interface LoginResponse {
  status: string;
  message: string;
  token: string;
  user: {
    _id: string;
    name: string;
    email: string;
    role: 'user' | 'publisher' | 'admin';
    photo: string;
    createdAt: string;
  };
}

export interface SignupResponse {
  status: string;
  message: string;
}

const extractErrorMessage = (error: unknown): string => {
  if (error && typeof error === 'object' && 'response' in error) {
    const err = error as any;
    if (err.response?.data?.message) return err.response.data.message;
  }
  if (error && typeof error === 'object' && 'message' in error) {
    return (error as any).message;
  }
  return 'An error occurred. Please try again.';
};

export const userService = {
  login: async (email: string, password: string): Promise<LoginResponse> => {
    try {
      const res = await client.post('/users/login', { email, password });
      return res.data;
    } catch (error: any) {
      throw new Error(extractErrorMessage(error));
    }
  },

  signup: async (
    name: string,
    email: string,
    password: string,
    passwordConfirm: string
  ): Promise<SignupResponse> => {
    try {
      const res = await client.post('/users/signup', { name, email, password, passwordConfirm });
      return res.data;
    } catch (error: any) {
      throw new Error(extractErrorMessage(error));
    }
  },

  logout: async () => {
    try {
      return await client.get('/users/logout');
    } catch (error: any) {
      throw new Error(extractErrorMessage(error));
    }
  },

  getCurrentUser: async () => {
    try {
      const res = await client.get('/users/me');
      return res.data.data.user || res.data.data;
    } catch (error: any) {
      throw new Error(extractErrorMessage(error));
    }
  },

  updateProfile: async (formData: FormData) => {
    try {
      const res = await client.patch('/users/update-me', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      // Extract user data from response
      const userData = res.data.user;
      if (!userData || typeof userData !== "object") {
        throw new Error("Invalid user data in response");
      }
      return userData;
    } catch (error: any) {
      throw new Error(extractErrorMessage(error));
    }
  },

  updatePassword: async (password: string, newPassword: string, passwordConfirm: string) => {
    try {
      const res = await client.patch('/users/update-password', {
        password,
        newPassword,
        passwordConfirm,
      });
      return res.data;
    } catch (error: any) {
      throw new Error(extractErrorMessage(error));
    }
  },

  deleteAccount: async () => {
    try {
      const res = await client.delete('/users/delete-me');
      return res.data;
    } catch (error: any) {
      throw new Error(extractErrorMessage(error));
    }
  },

  getLikedGames: async () => {
    try {
      const res = await client.get('/users/likes');
      return res.data.data?.likedGames || [];
    } catch (error: any) {
      throw new Error(extractErrorMessage(error));
    }
  },

  likeGame: async (gameId: string) => {
    try {
      const res = await client.post(`/users/likes/${gameId}`);
      return res.data;
    } catch (error: any) {
      throw new Error(extractErrorMessage(error));
    }
  },

  unlikeGame: async (gameId: string) => {
    try {
      const res = await client.delete(`/users/likes/${gameId}`);
      return res.data;
    } catch (error: any) {
      throw new Error(extractErrorMessage(error));
    }
  },

  getUserBookings: async () => {
    try {
      const res = await client.get('/users/bookings');
      return Array.isArray(res.data.data) ? res.data.data : res.data.data.data || [];
    } catch (error: any) {
      throw new Error(extractErrorMessage(error));
    }
  },

  forgotPassword: async (email: string) => {
    try {
      const res = await client.post('/users/forgot-password', { email });
      return res.data;
    } catch (error: any) {
      throw new Error(extractErrorMessage(error));
    }
  },

  resetPassword: async (token: string, password: string, passwordConfirm: string) => {
    try {
      const res = await client.patch(`/users/reset-password`, {
        token,
        password,
        passwordConfirm,
      });
      return res.data;
    } catch (error: any) {
      throw new Error(extractErrorMessage(error));
    }
  },

  getUsers: async () => {
    try {
      const res = await client.get('/users');
      return res.data.data || [];
    } catch (error: any) {
      throw new Error(extractErrorMessage(error));
    }
  },

  deleteUser: async (userId: string) => {
    try {
      return await client.delete(`/users/${userId}`);
    } catch (error: any) {
      throw new Error(extractErrorMessage(error));
    }
  },

  getUserReviews: async () => {
    try {
      const res = await client.get('/users/reviews');
      return res.data.data?.reviews || [];
    } catch (error: any) {
      console.error('Error fetching user reviews:', error);
      return [];
    }
  },
};
