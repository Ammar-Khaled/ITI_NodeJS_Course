# Blog RESTful API
This project was done for the Node.js course at ITI 9-month scholarship.

A RESTful API for a blogging platform built with Node.js, Express, and MongoDB.

## Table of contents
- [Features](#features)
- [Prerequisites](#prerequisites)
- [Environment variables](#environment-variables)
- [Installation](#installation)
- [Running the app](#running-the-app)
- [Available scripts](#available-scripts)
- [API overview](#api-overview)
- [Project structure](#project-structure)
- [Testing](#testing)
- [Contributing](#contributing)
- [License](#license)

## Features

- User management: signup, login, profile updates
- Create / Read / Update / Delete posts
- Post scheduling & drafts
- Comments with nested replies
- Likes for posts and comments
- Follows (followers / following)
- Bookmarks
- Notifications (create / read / mark-as-read)
- Image upload (ImageKit) for profiles and posts
- Password reset via email
- Input validation, sanitization, and rate limiting
- Structured error handling and logging

## Prerequisites

- Node.js 16+ (LTS recommended)
- npm or yarn
- MongoDB (local or hosted)

## Environment variables

Create a `.env` file in the project root using the `.env.example` file as a template

## Installation

Install dependencies:

```bash
npm install
# or
npm ci
```

## Running the app

Start in development with nodemon (if installed):

```bash
npm run dev
```

Start production:

```bash
npm start
```

## Available scripts

- `npm run dev` — start app in development (watch mode)
- `npm start` — start app in production mode
- `npm test` — run tests (if present)
- `npm run lint` — run linter (if configured)

## API overview

The API is versioned under `/api/v1`. Below is a concise, route-by-route reference grouped by resource. Each entry lists HTTP method, path, auth requirement, and short notes about behavior/validation.

Users
- `POST /api/v1/users/sign-up` — register a new user (rate-limited).
- `POST /api/v1/users/sign-in` — authenticate user.
- `GET /api/v1/users/search` — search users by name/email.
- `POST /api/v1/users/forgot-password` — request password reset (rate-limited).
- `POST /api/v1/users/reset-password` — reset password using token (rate-limited).
- `PATCH /api/v1/users/change-password` — change password while logged-in.
- `POST /api/v1/users/profile-picture` — upload profile picture (file validations + image-dimension checks).
- `DELETE /api/v1/users/profile-picture` — remove profile picture.
- `GET /api/v1/users/bookmarks` — list user's bookmarked posts.
- `GET /api/v1/users` — list all users (admin-only).
- `GET /api/v1/users/:id` — get user by id (admin-only).
- `PATCH /api/v1/users/:id` — update user (admin-only).
- `DELETE /api/v1/users/:id` — delete user (admin-only).

Posts
- `POST /api/v1/posts/:id/view` — optional auth; increment post view count (duplicate prevention for authenticated users).
- `GET /api/v1/posts/search` — full-text search with filters (date range, tags).
- `GET /api/v1/posts/drafts` — get current user's drafts.
- `POST /api/v1/posts` — create a new post (content sanitized).
- `GET /api/v1/posts` — list posts with pagination and filters.
- `GET /api/v1/posts/:id` — get post details.
- `PATCH /api/v1/posts/:id` — update a post (content sanitized).
- `DELETE /api/v1/posts/:id` — delete a post.
- `POST /api/v1/posts/:id/publish` — publish a draft.
- `POST /api/v1/posts/:id/schedule` — schedule post for future publication.
- `POST /api/v1/posts/:id/images` — upload post images (file + dimension validation, rate-limited).
- `DELETE /api/v1/posts/:id/images/:imageId` — delete a post image.
- `GET /api/v1/posts/:postId/comments` — list comments for a specific post.
- `POST /api/v1/posts/:postId/bookmark` — bookmark a post.
- `DELETE /api/v1/posts/:postId/bookmark` — remove bookmark.
- `GET /api/v1/posts/:postId/bookmark/check` — check if current user bookmarked the post.

Comments
- All comment routes require authentication.
- `POST /api/v1/comments` — create comment or reply.
- `GET /api/v1/comments` — list comments (optional `postId` filter & pagination).
- `GET /api/v1/comments/:id` — get a single comment.
- `PATCH /api/v1/comments/:id` — update comment (author only).
- `DELETE /api/v1/comments/:id` — delete comment (author or post author).

Likes
- `POST /api/v1/likes` — toggle like for a target (post or comment).
- `GET /api/v1/likes/count` — get likes count for a target.
- `GET /api/v1/likes/check` — check if current user liked a given target.
- `GET /api/v1/likes/users/:userId` — list likes by a user.

Follows (mounted under `/api/v1/users`)
- `GET /api/v1/users/:userId/followers` — list followers.
- `GET /api/v1/users/:userId/following` — list users that `:userId` is following.
- `GET /api/v1/users/:userId/follow-counts` — follower/following counts.
- `GET /api/v1/users/:userId/follow/check` — check if current user is following `:userId`.
- `POST /api/v1/users/:userId/follow` — follow `:userId`.
- `DELETE /api/v1/users/:userId/follow` — unfollow `:userId`.

Notifications
- All notification routes require authentication.
- `GET /api/v1/notifications` — list user notifications.
- `GET /api/v1/notifications/unread-count` — unread notifications count.
- `PATCH /api/v1/notifications/read-all` — mark all notifications as read.
- `PATCH /api/v1/notifications/:id/read` — mark a specific notification as read.
- `DELETE /api/v1/notifications/:id` — delete a notification.

Donations
- `POST /api/v1/donations` — create a donation.
- `POST /api/v1/donations/webhook` — payment gateway webhook endpoint.

Notes
- Validation: most endpoints run Joi schemas from `schemas/` — see `schemas/index.js` for details.
- Authentication: middleware is `authenticate` (JWT). Some routes use `optionalAuthenticate` where anonymous access is allowed but authenticated users receive extra behavior.
- Rate limiting and file validation middlewares are applied to sensitive endpoints (auth, password reset, uploads).

Detailed request/response schemas are available in the `docs/swagger` folder — use those YAML files with Swagger UI or other OpenAPI tools to generate full API docs.

## Project structure

Top-level layout (important folders):

- `config/` — configuration (e.g., `swagger.js`)
- `controllers/` — route handlers
- `middlewares/` — auth, validation, upload, rate limiting
- `models/` — Mongoose models
- `routes/` — Express route registration (versioned under `routes/v1`)
- `schemas/` — Joi/OpenAPI validation schemas
- `services/` — business logic and integrations (email, ImageKit)
- `templates/` — email templates
- `utils/` — helpers, APIError, logger

See the full recommended structure in `final-project.md`.

## Testing

If tests are included, run:

```bash
npm test
```

Add unit and integration tests for controllers and services. Use an in-memory MongoDB (e.g., `mongodb-memory-server`) for CI-friendly tests.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Add tests for new behavior
4. Open a pull request with a clear description

## License

This project is provided as-is for educational purposes. Add an appropriate license file if you plan to publish or distribute the code.

---

If you'd like, I can also:
- add a `.env.example` file with the variables above
- generate Swagger UI static docs or a `README` section listing all endpoints in detail
- add badges (build, coverage) to the top of this README

Let me know which of these you'd like next.

