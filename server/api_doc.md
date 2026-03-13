# Complete Nexus E-Commerce Backend API Documentation

**Project**: Nexus E-Commerce Platform  
**Backend Base URL**: `http://localhost:3000/api/nexus`  
**API Version**: 1.0  
**Last Updated**: March 12, 2026  
**Database**: MongoDB  
**Authentication**: JWT (JSON Web Tokens)

---

## Table of Contents

1. [Overview](#overview)
2. [Authentication](#authentication)
3. [User Routes](#user-routes)
4. [Game Routes](#game-routes)
5. [Review Routes](#review-routes)
6. [Cart Routes](#cart-routes)
7. [Booking Routes](#booking-routes)
8. [Error Handling](#error-handling)
9. [Status Codes Reference](#status-codes-reference)

---

## Overview

The Nexus E-Commerce API provides endpoints for managing:
- **User Authentication**: Sign up, login, password reset
- **Game Management**: Browse, create, update, delete games
- **Shopping Cart**: Add/remove items, manage cart
- **Reviews & Ratings**: Create and read game reviews
- **Bookings/Purchases**: Checkout and payment processing via Stripe
- **User Profiles**: Profile management, wishlist, user bookings

### Base URL
```
http://localhost:3000/api/nexus
```

### CORS Configuration
- Allowed Origins:
  - `http://localhost:8081`
  - `http://127.0.0.1:8081`
  - `http://localhost:8080`
  - `http://127.0.0.1:8080`
- Credentials: Enabled (cookies allowed)

### Rate Limiting
- **Window**: 1 hour
- **Max Requests**: 100 per hour per IP
- **Message on Limit**: "try in an hour cause your limit"

---

## Authentication

### JWT (JSON Web Token)
All protected endpoints require JWT authentication.

### Getting a Token

The token is obtained from the **POST /login** endpoint and is returned in the response body as `token`.

### Using the Token

Include the token in the `Authorization` header:
```
Authorization: Bearer {token}
```

### Token Storage Options
1. **HTTP Only Cookie** (Recommended - Backend sets `jwt` cookie automatically)
2. **LocalStorage** (Optional - Store the token string)

### Token Expiration
- Set via `JWT_EXPIRES_IN` environment variable (default: check `.env`)
- When expired, API returns **401 Unauthorized**
- User must log in again to get a fresh token

### User Roles
The system supports three user roles:
- **user** (default): Regular user, can browse games, make purchases
- **publisher**: Can create, edit, and delete games
- **admin**: Full access including user management

---

# USER ROUTES

**Base Path**: `/api/nexus/users`

## 1. POST /login - User Login

### Description
Authenticates a user with email and password. Returns JWT token and user information.

### Endpoint
```
POST /api/nexus/users/login
```

### Authentication
- **Required**: ❌ NO
- Any user can log in without prior authentication

### Request Headers
```
Content-Type: application/json
```

### Request Body
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

### Success Response (201 Created)
```json
{
  "status": "success",
  "message": "successfully loged in",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "64f1a2b3c4d5e6f7g8h9i0j2",
    "name": "john_gamer",
    "email": "user@example.com",
    "role": "user",
    "photo": "default.jpeg",
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

### Status Codes
- **201 Created**: Login successful
- **400 Bad Request**: Email or password missing
- **404 Not Found**: Invalid credentials
- **500 Internal Server Error**: Server error

### Example Request
```bash
curl -X POST http://localhost:3000/api/nexus/users/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"SecurePass123!"}'
```

---

## 2. POST /signup - User Registration

### Description
Creates a new user account. Sends verification code to email.

### Request Body
```json
{
  "name": "john_gaming",
  "email": "user@example.com",
  "password": "SecurePass123!",
  "passwordConfirm": "SecurePass123!"
}
```

### Success Response
```
verification code sent to email
```

---

## 3. GET /logout - User Logout

### Description
Logs out the user by clearing the JWT cookie.

### Success Response (200 OK)
```json
{
  "status": "success",
  "message": "successfully logged out"
}
```

---

## 4. POST /forgot-password - Request Password Reset

### Request Body
```json
{
  "email": "user@example.com"
}
```

### Success Response (200 OK)
```json
{
  "status": "success",
  "message": "token sent"
}
```

---

## 5. PATCH /reset-password/:token - Reset Password

### Request Body
```json
{
  "password": "NewSecurePass456!",
  "passwordConfirm": "NewSecurePass456!"
}
```

---

## 6. GET /me - Get Current User Profile

### Success Response (200 OK)
```json
{
  "status": "success",
  "data": {
    "user": {
      "_id": "64f1a2b3c4d5e6f7g8h9i0j2",
      "name": "john_gamer",
      "email": "john@example.com",
      "role": "user",
      "photo": "user-64f1a2b3c4d5e6f7g8h9i0j2-1710001234.jpeg",
      "active": true,
      "createdAt": "2024-01-15T10:30:00Z",
      "likes": ["64f1a2b3c4d5e6f7g8h9i0j3"]
    }
  }
}
```

---

## 7. PATCH /update-me - Update User Profile

### Request Headers
```
Content-Type: multipart/form-data
Authorization: Bearer {token}
```

### Request Body (Form Data)
```
name: john_gaming_pro
email: newemail@example.com
photo: [file binary]
```

### Success Response (201 Created)
Returns updated user object with new JWT cookie.

---

## 8. PATCH /update-password - Change Password

### Request Body
```json
{
  "password": "CurrentPass123!",
  "newPassword": "NewSecurePass456!",
  "passwordConfirm": "NewSecurePass456!"
}
```

---

## 9. DELETE /delete-me - Deactivate Account

### Success Response (200 OK)
```json
{
  "status": "success",
  "message": "your account is deleted"
}
```

---

## 10. GET /likes - Get User's Liked Games

### Success Response (200 OK)
```json
{
  "status": "success",
  "data": {
    "likedGames": [
      {
        "_id": "64f1a2b3c4d5e6f7g8h9i0j3",
        "name": "The Witcher 3",
        "price": 59.99,
        "photo": "game-64f-1234567890-cover.jpeg"
      }
    ]
  }
}
```

---

## 11. POST /likes/:gameId - Like a Game

### Success Response (201 Created)
```json
{
  "status": "success",
  "message": "Game liked successfully"
}
```

---

## 12. DELETE /likes/:gameId - Unlike a Game

### Success Response (204 No Content)
(empty response)

---

## 13. GET /reviews - Get User's Reviews

### Success Response (200 OK)
```json
{
  "status": "success",
  "data": {
    "reviews": [
      {
        "_id": "64f1a2b3c4d5e6f7g8h9i0j7",
        "text": "Amazing game!",
        "rating": 5,
        "createdAt": "2024-03-10T14:30:00Z"
      }
    ]
  }
}
```

---

## 14. GET /bookings - Get User's Bookings

### Success Response (200 OK)
```json
{
  "status": "success",
  "results": 2,
  "data": [
    {
      "_id": "64f1a2b3c4d5e6f7g8h9i0j9",
      "game": [{"_id": "64f1a2b3c4d5e6f7g8h9i0j3", "name": "The Witcher 3"}],
      "price": 59.99,
      "CreatedAt": "2024-03-10T14:30:00Z",
      "paid": true
    }
  ]
}
```

---

## 15. GET / - Get All Users (Admin Only)

### Success Response (200 OK)
```json
{
  "status": "success",
  "results": 10,
  "data": [
    {
      "_id": "64f1a2b3c4d5e6f7g8h9i0j2",
      "name": "john_gamer",
      "email": "john@example.com",
      "role": "user",
      "photo": "default.jpeg",
      "active": true,
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ]
}
```

---

# GAME ROUTES

**Base Path**: `/api/nexus/games`

## 1. GET / - Get All Games

### Description
Retrieves list of all games with filtering, searching, and pagination support.

### Query Parameters
- `search`: Search for games by name, description, or genre
- `genre`: Filter by genre (exact match)
- `category`: Filter by category
- `sort`: Sort field (prefix with `-` for descending)
- `page`: Page number for pagination
- `limit`: Results per page

### Success Response (200 OK)
```json
{
  "status": "success",
  "results": 2,
  "data": [
    {
      "_id": "64f1a2b3c4d5e6f7g8h9i0j3",
      "name": "The Witcher 3",
      "price": 59.99,
      "genre": ["RPG"],
      "category": ["AAA"],
      "photo": "game-64f-1234567890-cover.jpeg",
      "ratingsAverage": 4.7,
      "reviewCount": 145,
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ]
}
```

---

## 2. POST / - Create Game

### Description
Creates a new game. **Requires authentication and admin/publisher role.**

### Request Headers
```
Authorization: Bearer {token}
Content-Type: multipart/form-data
```

### Request Body (Form Data)
```
name: The Witcher 3
description: Open world RPG
price: 59.99
genre: RPG
category: AAA
photo: [file binary]
images: [file binary]
```

### Success Response (201 Created)
Returns created game object with all fields.

---

## 3. GET /:id - Get Single Game

### Success Response (200 OK)
```json
{
  "status": "success",
  "data": {
    "_id": "64f1a2b3c4d5e6f7g8h9i0j3",
    "name": "The Witcher 3",
    "description": "Open world RPG...",
    "price": 59.99,
    "genre": ["RPG"],
    "photo": "game-64f-1234567890-cover.jpeg",
    "publisher": {
      "_id": "64f1a2b3c4d5e6f7g8h9i0j4",
      "name": "publisher_name",
      "email": "contact@publisher.com"
    },
    "ratingsAverage": 4.7,
    "reviewCount": 145,
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

---

## 4. PATCH /:id - Update Game

### Description
Updates a game. **Requires authentication and admin/publisher role.**

### Success Response (200 OK)
Returns updated game object.

---

## 5. DELETE /:id - Delete Game

### Success Response (204 No Content)
(empty response)

---

# REVIEW ROUTES

**Base Path**: `/api/nexus/games/:gameId/reviews`

## 1. GET / - Get Game Reviews

### Success Response (200 OK)
```json
{
  "status": "success",
  "results": 2,
  "data": [
    {
      "_id": "64f1a2b3c4d5e6f7g8h9i0j7",
      "text": "Amazing game!",
      "rating": 5,
      "user": {"_id": "64f1a2b3c4d5e6f7g8h9i0j2", "name": "john_gamer"},
      "game": {"_id": "64f1a2b3c4d5e6f7g8h9i0j3", "name": "The Witcher 3"},
      "createdAt": "2024-03-10T14:30:00Z"
    }
  ]
}
```

---

## 2. POST / - Create Review

### Request Body
```json
{
  "text": "Amazing game! Highly recommended!",
  "rating": 5
}
```

### Success Response (201 Created)
Returns created review object.

---

## 3. GET /:reviewId - Get Single Review

### Success Response (200 OK)
Returns single review object with populated user and game details.

---

## 4. DELETE /:reviewId - Delete Review

### Success Response (204 No Content)
(empty response)

---

# CART ROUTES

**Base Path**: `/api/nexus/cart`

See [CartAPI.md](CartAPI.md) for complete Cart documentation.

### Quick Reference
- GET / - Get user's cart
- POST /:gameId - Add game to cart
- DELETE / - Clear cart
- DELETE /:id - Remove game from cart
- PATCH /:id - Update quantity (not implemented)

---

# BOOKING ROUTES

**Base Path**: `/api/nexus/bookings`

## 1.POST /checkout-session - Create Stripe Session

### Description
Creates a Stripe checkout session for payment processing.

### Success Response (200 OK)
```json
{
  "status": "success",
  "session": {
    "id": "cs_test_abc123",
    "url": "https://checkout.stripe.com/pay/cs_test_...",
    "success_url": "http://localhost:8081/purchase-success?session_id={CHECKOUT_SESSION_ID}",
    "cancel_url": "http://localhost:8081/cart",
    "customer_email": "user@example.com",
    "line_items": {
      "data": [
        {
          "price": {"unit_amount": 5999},
          "quantity": 1
        }
      ]
    }
  }
}
```

---

## 2. GET / - Get All User's Bookings

### Success Response (200 OK)
```json
{
  "status": "success",
  "results": 2,
  "data": [
    {
      "_id": "64f1a2b3c4d5e6f7g8h9i0j9",
      "game": [{"_id": "64f1a2b3c4d5e6f7g8h9i0j3", "name": "The Witcher 3"}],
      "price": 59.99,
      "CreatedAt": "2024-03-10T14:30:00Z",
      "paid": true
    }
  ]
}
```

---

## 3. POST / - Create Booking

### Request Body
```json
{
  "game": ["64f1a2b3c4d5e6f7g8h9i0j3"],
  "price": 59.99
}
```

### Success Response (201 Created)
Returns created booking object.

---

## 4. GET /:id - Get Booking Details

### Success Response (200 OK)
Returns single booking with game and user details.

---

## 5. PATCH /:id - Update Booking

### Success Response (200 OK)
Returns updated booking object.

---

## 6. DELETE /:id - Delete Booking

### Success Response (204 No Content)
(empty response)

---
---

## Error Handling

### Standard Error Response
```json
{
  "status": "error",
  "message": "Error description"
}
```

### Common Error Scenarios

#### 400 - Bad Request
```json
{
  "status": "fail",
  "message": "Field validation failed",
  "details": {"email": "must be a valid email"}
}
```

#### 401 - Unauthorized
```json
{
  "status": "fail",
  "message": "You are not logged in! Please log in to get access."
}
```

#### 403 - Forbidden
```json
{
  "status": "fail",
  "message": "You do not have permission to perform this action"
}
```

#### 404 - Not Found
```json
{
  "status": "fail",
  "message": "Resource not found"
}
```

#### 500 - Server Error
```json
{
  "status": "error",
  "message": "Something went wrong! 😢"
}
```

---

## Status Codes Reference

| Code | Status | Meaning |
|------|--------|---------|
| 200 | OK | Request successful |
| 201 | Created | Resource created successfully |
| 204 | No Content | Request successful, no response body |
| 400 | Bad Request | Invalid request parameters or body |
| 401 | Unauthorized | No authentication token or token invalid |
| 403 | Forbidden | Authenticated but lacks permission (insufficient role) |
| 404 | Not Found | Resource does not exist |
| 500 | Internal Server Error | Server error |

---

## Data Models

### User Model
```javascript
{
  _id: ObjectId,
  name: String (unique, 8-20 characters),
  email: String (unique),
  password: String (bcrypt hashed, min 8 chars),
  role: String enum ["user", "publisher", "admin"] (default: "user"),
  photo: String (filename, default: "default.jpeg"),
  likes: [ObjectId] (Array of Game IDs),
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  verifierDigit: Number,
  active: Boolean (default: true),
  createdAt: Date (auto-set on creation)
}
```

### Game Model
```javascript
{
  _id: ObjectId,
  name: String (unique),
  description: String,
  price: Number,
  genre: [String] (Array of genre tags),
  category: [String] (Array of categories like AAA, Indie),
  publisher: ObjectId (Reference to User),
  photo: String (cover image filename),
  images: [String] (Array of max 5 description images),
  ratingsAverage: Number (auto-calculated from reviews),
  reviewCount: Number (auto-calculated),
  requirements: String (system requirements),
  createdAt: Date,
  slug: String (URL-friendly name)
}
```

### Review Model
```javascript
{
  _id: ObjectId,
  text: String (min 10 characters),
  rating: Number (1-5, required),
  user: ObjectId (Reference to User),
  game: ObjectId (Reference to Game),
  createdAt: Date
}
```

### Cart Model
```javascript
{
  _id: ObjectId,
  user: ObjectId (Reference to User, unique),
  games: [ObjectId] (Array of Game IDs),
  createdAt: Date,
  updatedAt: Date
}
```

### Booking Model
```javascript
{
  _id: ObjectId,
  game: [ObjectId] (Array of Game IDs purchased),
  user: ObjectId (Reference to User),
  price: Number (total price paid),
  paid: Boolean (payment status),
  createdAt: Date
}
```

---

## Environment Variables

Create a `.env` file in the `server/` directory with these values:

```env
# Server Configuration
NODE_ENV=development
PORT=3000

# Database
DATABASE_URL=mongodb://localhost:27017/nexus_ecommerce
DATABASE_PASSWORD=your_mongodb_password

# JWT Authentication
JWT_SECRET=your_super_secret_jwt_key_here_change_in_production
JWT_EXPIRES_IN=10d
JWT_COOKIE_EXPIRES_IN=10

# Email (Password Reset)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=465
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# Stripe Payment
STRIPE_API_KEY=sk_test_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Frontend URLs
FRONTEND_URL_LOCAL=http://localhost:8081
FRONTEND_URL_PROD=https://yourdomain.com

# File Upload Limits
MAX_FILE_SIZE=5000000
ALLOWED_FILE_TYPES=image/jpeg,image/png
```

---

## Frontend Integration Guide

### 1. Setting Up Axios Instance

Create `src/api/client.js`:
```javascript
import axios from 'axios';

const client = axios.create({
  baseURL: 'http://localhost:3000/api/nexus',
  withCredentials: true, // Send cookies
  timeout: 10000,
});

// Add token to request headers
client.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 unauthorized responses
client.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default client;
```

### 2. Login Example

```javascript
import client from './api/client';

const login = async (email, password) => {
  try {
    const response = await client.post('/users/login', {
      email,
      password
    });
    
    // Store token
    localStorage.setItem('token', response.data.token);
    
    // Store user
    const user = response.data.user;
    localStorage.setItem('user', JSON.stringify(user));
    
    return user;
  } catch (error) {
    throw error.response?.data?.message || 'Login failed';
  }
};
```

### 3. Fetching Games with Filters

```javascript
const fetchGames = async (filters = {}) => {
  try {
    const response = await client.get('/games', {
      params: {
        search: filters.search,
        genre: filters.genre,
        category: filters.category,
        sort: filters.sort || '-createdAt',
        page: filters.page || 1,
        limit: filters.limit || 20
      }
    });
    
    return response.data.data;
  } catch (error) {
    console.error('Error fetching games:', error);
    return [];
  }
};
```

### 4. Managing Shopping Cart

```javascript
// Add game to cart
const addToCart = async (gameId) => {
  try {
    const response = await client.post(`/cart/${gameId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Failed to add to cart';
  }
};

// Get user's cart
const getCart = async () => {
  try {
    const response = await client.get('/cart');
    return response.data.data.games;
  } catch (error) {
    console.error('Error fetching cart:', error);
    return [];
  }
};

// Remove game from cart
const removeFromCart = async (gameId) => {
  try {
    const response = await client.delete(`/cart/${gameId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Failed to remove from cart';
  }
};
```

### 5. User Management

```javascript
// Get current user profile
const getMe = async () => {
  try {
    const response = await client.get('/users/me');
    return response.data.data.user;
  } catch (error) {
    throw error.response?.data?.message || 'Failed to fetch profile';
  }
};

// Update profile
const updateProfile = async (userData, photoFile = null) => {
  try {
    const formData = new FormData();
    if (userData.name) formData.append('name', userData.name);
    if (userData.email) formData.append('email', userData.email);
    if (photoFile) formData.append('photo', photoFile);
    
    const response = await client.patch('/users/update-me', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    
    return response.data.data.user;
  } catch (error) {
    throw error.response?.data?.message || 'Failed to update profile';
  }
};

// Like/Unlike game
const toggleLike = async (gameId, isLiked) => {
  try {
    if (isLiked) {
      await client.delete(`/users/likes/${gameId}`);
    } else {
      await client.post(`/users/likes/${gameId}`);
    }
  } catch (error) {
    throw error.response?.data?.message || 'Failed to toggle like';
  }
};
```

### 6. Error Handling Pattern

```javascript
const handleApiError = (error) => {
  if (!error.response) {
    return 'Network error. Please check your connection.';
  }
  
  const { status, data } = error.response;
  
  switch (status) {
    case 400:
      return data.details || data.message || 'Invalid request';
    case 401:
      return 'Please log in to continue';
    case 403:
      return 'You do not have permission for this action';
    case 404:
      return 'Resource not found';
    case 500:
      return 'Server error. Please try again later.';
    default:
      return data.message || 'An error occurred';
  }
};

// Usage
try {
  await addToCart(gameId);
} catch (error) {
  const message = handleApiError(error);
  showErrorAlert(message);
}
```

---

## Quick Testing with cURL

```bash
# Get all games
curl http://localhost:3000/api/nexus/games

# Get single game
curl http://localhost:3000/api/nexus/games/64f1a2b3c4d5e6f7g8h9i0j3

# Login (get token)
curl -X POST http://localhost:3000/api/nexus/users/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"SecurePass123!"}'

# Get current user (with token)
curl http://localhost:3000/api/nexus/users/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"

# Add to cart (with token)
curl -X POST http://localhost:3000/api/nexus/cart/64f1a2b3c4d5e6f7g8h9i0j3 \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"

# Get user's cart
curl http://localhost:3000/api/nexus/cart \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"

# Create review
curl -X POST http://localhost:3000/api/nexus/games/64f1a2b3c4d5e6f7g8h9i0j3/reviews \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{"text":"Excellent game!","rating":5}'

# Get checkout session
curl -X POST http://localhost:3000/api/nexus/bookings/checkout-session \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

**Last Updated**: March 12, 2026  
**Status**: Complete - All Endpoints Documented  
**Total Endpoints**: 30+ endpoints across all routes  
**All Routes Covered**: ✅ Users (15), Games (5), Reviews (4), Cart (5), Bookings (6)  

---
