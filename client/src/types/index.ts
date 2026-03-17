export interface User {
  _id: string;
  name: string;
  email: string;
  role: "user" | "publisher" | "admin";
  photo: string;
  likes?: string[];
  active?: boolean;
  createdAt: string;
}

export interface Game {
  _id: string;
  name: string;
  description: string;
  price: number;
  genre: string[];
  category: string[];
  publisher: User | string;
  photo: string;
  images?: string[];
  desPhotos?: string[];
  videos?: string[];
  ratingsAverage: number;
  reviewCount: number;
  requirements?: string;
  slug?: string;
  createdAt: string;
}

export interface Review {
  _id: string;
  text: string;
  rating: number;
  user: Pick<User, "_id" | "name"> | string;
  game: Pick<Game, "_id" | "name"> | string;
  createdAt: string;
}

export interface CartData {
  _id: string;
  user: string;
  games: Game[];
  createdAt: string;
  updatedAt: string;
}

export interface Booking {
  _id: string;
  game: Pick<Game, "_id" | "name">[];
  user?: string;
  price: number;
  paid: boolean;
  createdAt: string;
}

export interface ApiResponse<T> {
  status: string;
  message?: string;
  results?: number;
  data: T;
  token?: string;
  user?: User;
}
