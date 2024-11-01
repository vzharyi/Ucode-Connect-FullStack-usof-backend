# USOF Backend

> This project is a back-end API built with Express.js for a personal platform called **USOF**. The API allows users to register, log in, create posts/comments, like/dislike posts, and manage other interactions.

## Setup and Installation

1. **Clone this repository.**
   ```bash
   git clone git@gitlab.ucode.world:connect-khpi/connect-fullstack-usof-backend/vzharyi.git
   ```
   
2. **Customize the [config/config.json](config/config.json) file. Change the user and password to your existing user. Example:**
   ```
   "user": "vzharyi"
   "password": "securepass"
   ```
   
3. **Install the dependencies.**
   ```bash
   npm install
   ```
   
4. **Run the command MySQL:** 
   ```
   mysql -u {USER_NAME} -p < config/db.sql. 
   ```
   You need to enter your login, press enter, and provide your MySQL password.

5. **Start the server.**
   ```bash
   npm run start
   ```

## Mailing Service

[Ethereal](https://ethereal.email/) is a fake SMTP service primarily intended for, but not limited to, Nodemailer and EmailEngine users. 
This free anti-transactional email service does not deliver messages, allowing you to view sent emails by logging in with a test login and password.
```
login: rosemarie.windler@ethereal.email
password: pXUV3PeFKkXncqdehZ
```
## REST API Documentation

### 1. Authentication
- `POST /api/auth/register` — Register a new user
- `POST /api/auth/verify-email/:confirm_token` — Verify user’s email with token
- `POST /api/auth/login` — Log in and receive an access token
- `POST /api/auth/logout` — Log out the user
- `POST /api/auth/password-reset` — Send password reset email (requires authentication)
- `POST /api/auth/password-reset/:confirm_token` — Confirm and reset password with token (requires authentication)

### 2. Users
- `GET /api/users` — Get all users
- `GET /api/users/:user_id` — Get specific user information
- `GET /api/users/:user_id/posts` — Get all posts of a user 
- `POST /api/users` — Create a new user (admin only)
- `PATCH /api/users/avatar` — Update user avatar
- `PATCH /api/users/:user_id` — Update user profile
- `DELETE /api/users/:user_id` — Delete a user

### 3. Posts
- `GET /api/posts` — Get all posts with filtering and sorting
- `GET /api/posts/:post_id` — Get specific post by ID
- `GET /api/posts/:post_id/comments` — Get comments on a specific post
- `POST /api/posts/:post_id/comments` — Add a comment to a post
- `GET /api/posts/:post_id/categories` — Get categories of a specific post
- `GET /api/posts/:post_id/like` — Get likes for a specific post
- `POST /api/posts` — Create a new post
- `POST /api/posts/:post_id/like` — Add a like/dislike to a post
- `GET /api/favorites` — Get all favorite posts of the user
- `POST /api/favorites/:post_id` — Add a post to favorites
- `PATCH /api/posts/:post_id` — Update a post (author or admin)
- `DELETE /api/posts/:post_id` — Delete a post (author or admin)
- `DELETE /api/posts/:post_id/like` — Remove a like/dislike from a post
- `DELETE /api/favorites/:post_id` — Remove a post from favorites

### 4. Categories
- `GET /api/categories` — Get all categories
- `GET /api/categories/:category_id` — Get a specific category by ID
- `GET /api/categories/:category_id/posts` — Get posts in a specific category
- `POST /api/categories` — Create a new category (admin only)
- `PATCH /api/categories/:category_id` — Update a category (admin only)
- `DELETE /api/categories/:category_id` — Delete a category (admin only)

### 5. Comments
- `GET /api/comments/:comment_id` — Get a specific comment by ID
- `GET /api/comments/:comment_id/like` — Get likes for a specific comment
- `POST /api/comments/:comment_id/like` — Add a like/dislike to a comment
- `PATCH /api/comments/:comment_id` — Update a comment
- `DELETE /api/comments/:comment_id` — Delete a comment
- `DELETE /api/comments/:comment_id/like` — Remove a like/dislike from a comment

---

## Admin Panel
AdminJS library is used. The admin panel is available at [http://localhost:8080/admin](http://localhost:8080/admin).

---

## Additional Features
- Favorite posts - users can add posts to favorites and see this list.
- Automatic post blocking - automatically blocks a post a month after it was created. After blocking, the author will not be able to edit the post, and other users will not be able to leave comments on it.

### Admin for presentations
   ```
   email: john.smith@example.com
   password: Adm1nP@ss!
   ```
