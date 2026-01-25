# Daloy - Social Media Platform

A full-stack social media platform built with React, Laravel, and MySQL.

## Quick Setup Guide

### Prerequisites
- PHP 8.2+ with extensions: OpenSSL, PDO, Mbstring, Tokenizer, XML, Ctype, JSON, BCMath
- Composer
- Node.js 18+
- MySQL 8.0+ or MariaDB 10.5+

### Database Setup

1. **Create the MySQL database:**
   ```sql
   mysql -u root -p < backend/database/init.sql
   ```
   
   Or manually:
   ```sql
   CREATE DATABASE daloy_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```

2. **Configure database connection** in `backend/.env`:
   ```env
   DB_CONNECTION=mysql
   DB_HOST=127.0.0.1
   DB_PORT=3306
   DB_DATABASE=daloy_db
   DB_USERNAME=root
   DB_PASSWORD=your_password
   ```

### Backend Setup

```bash
cd backend

# Install PHP dependencies
composer install

# Generate application key
php artisan key:generate

# Run database migrations
php artisan migrate

# Seed the database with sample data
php artisan db:seed

# Create storage link for file uploads
php artisan storage:link

# Start the development server
php artisan serve
```

The API will be available at `http://localhost:8000/api`

### Frontend Setup

```bash
# In the root directory
npm install
npm run dev
```

The frontend will be available at `http://localhost:5173`

### Admin Panel Setup

```bash
cd admin
npm install
npm run dev
```

The admin panel will be available at `http://localhost:5174`

### Default Accounts (after seeding)

**Admin Panel:**
- Email: `admin@daloy.app`
- Password: `admin123`

**User Accounts:**
- Email: `marcus@example.com` / Password: `password123`
- Email: `elena@example.com` / Password: `password123`
- Email: `john@example.com` / Password: `password123`

---

## Tech Stack

- **Frontend**: React 18, Vite, TanStack Query, Tailwind CSS, shadcn/ui
- **Backend**: Laravel 11, PHP 8.2+
- **Database**: MySQL 8.0+ with InnoDB
- **Authentication**: Laravel Sanctum (token-based)
- **Admin Panel**: React with Recharts for analytics

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user

### Posts
- `GET /api/posts/feed` - Get user's feed
- `GET /api/posts/explore` - Get explore posts
- `POST /api/posts` - Create post
- `GET /api/posts/{id}` - Get post details
- `DELETE /api/posts/{id}` - Delete post

### Users
- `GET /api/users/{username}` - Get user profile
- `POST /api/users/{id}/follow` - Follow user
- `DELETE /api/users/{id}/follow` - Unfollow user

### Search
- `GET /api/search?q=query` - Search posts, users, hashtags
- `GET /api/search/trending` - Get trending hashtags

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## License

MIT
