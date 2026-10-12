# Where to Eat? (Pampanga)

A restaurant finder for four Pampanga towns: **Angeles City, San Fernando, Magalang and Mabalacat**.
Travelers search and filter restaurants, book a table, and leave reviews. Restaurant owners list their
places and handle bookings. Admins approve new restaurants and reviews.

CTADWEBL Final Project (Advanced Web Programming).

## Members

| Member | Part |
|---|---|
| Nadia | Setup, accounts, login, access control |
| Andi | Restaurants and the approval flow |
| Helayn | Search, towns, landing page |
| Ashton | Reservations |
| Mhir Hankz Mariano | Reviews, design system, documentation |

## What it does and what data it processes

- **Traveler:** searches by town, cuisine, dining type, price, rating and walking distance, opens a restaurant, books a table, writes reviews.
- **Restaurant owner:** applies a restaurant for listing, edits it, confirms or declines bookings.
- **Admin:** approves or rejects restaurants and reviews, manages towns and users.

The server does more than store data:

| Computed value | How |
|---|---|
| Rating and review count | Average of **approved** reviews only, recalculated whenever a review is approved, rejected, edited or deleted |
| Best-match ranking | Combines rating, review count, price and distance |
| Walking distance and time | From the traveler's location to each restaurant (about 5 km/h) |
| Open now | Opening hours checked in Philippine time, including places that close after midnight |
| Seats left | Seats per time slot minus confirmed and pending bookings, so a table cannot be double booked |

### Approval rules

- **Restaurant:** `pending` then `approved` or `rejected`. Only approved restaurants appear in search.
- **Review:** `pending` then `approved` or `rejected`. Only approved reviews are shown and counted. Editing a review sends it back to `pending`.
- **Reservation:** `pending`, `confirmed`, `completed` or `cancelled`. Steps cannot be skipped.

## Tech

React (Vite) + TypeScript + Tailwind CSS, React Router, React Hook Form + Zod, axios,
Express, MongoDB with Mongoose, JWT login.

## Screenshots

Put the images in `docs/screenshots/` and keep these names:

| File | Page |
|---|---|
| `home.png` | Landing page with search and filters |
| `restaurant-details.png` | Restaurant details with reviews |
| `write-review.png` | Write a review form with a validation error showing |
| `my-reviews.png` | My reviews with pending, approved and rejected |
| `review-moderation.png` | Admin review moderation |
| `mobile-375.png` | Any page at 375 px wide |

## Setup

You need Node.js 18+ and a MongoDB database (Atlas or local).

```bash
# 1. Server (repo root)
npm install
cp .env.example .env        # Windows: copy .env.example .env
# edit .env: set MONGO_URI and a long random JWT_SECRET
npm run seed                # wipes the database and fills it with demo data
npm run dev                 # API on http://localhost:5000

# 2. Client (second terminal)
cd client
npm install
cp .env.example .env
npm run dev                 # app on http://localhost:5173
```

### Environment variables

| Variable | Where | Meaning |
|---|---|---|
| `PORT` | server `.env` | API port (default 5000) |
| `MONGO_URI` | server `.env` | MongoDB connection string |
| `JWT_SECRET` | server `.env` | Secret used to sign login tokens |
| `JWT_EXPIRES_IN` | server `.env` | Token lifetime, for example `7d` |
| `CLIENT_URL` | server `.env` | Allowed origin for CORS (default `http://localhost:5173`) |
| `VITE_API_URL` | `client/.env` | API address the client calls |

Never commit a real `.env` file.

### Demo accounts

| Role | Email | Password |
|---|---|---|
| Admin | `admin@wheretoeat.ph` | `admin123` |
| Owner | `owner1@wheretoeat.ph` (also 2 and 3) | `owner123` |
| Traveler | `traveler1@wheretoeat.ph` (also 2, 3 and 4) | `traveler123` |

## Database (5 collections)

`users`, `towns`, `restaurants`, `reservations`, `reviews`

## API

Errors always look like `{ "message": "..." }` with status 200, 201, 400, 401, 403, 404 or 500.
A bad ID gives 400, a missing record gives 404.

### Auth and users
| Method | Endpoint | Purpose | Access |
|---|---|---|---|
| POST | `/auth/register` | Create an account | Public |
| POST | `/auth/login` | Log in | Public |
| GET | `/auth/me` | Logged-in user | Logged in |
| PUT | `/users/me` | Update own profile | Logged in |
| GET | `/users` | List users | Admin |
| DELETE | `/users/:id` | Remove a user | Admin |

### Restaurants
| Method | Endpoint | Purpose | Access |
|---|---|---|---|
| GET | `/restaurants` | List restaurants | Public |
| GET | `/restaurants/mine` | Owner's restaurants | Owner |
| GET | `/restaurants/:id` | One restaurant | Public |
| POST | `/restaurants` | Apply a restaurant (starts pending) | Owner |
| PUT | `/restaurants/:id` | Edit | Owner or admin |
| DELETE | `/restaurants/:id` | Delete | Owner or admin |
| PATCH | `/restaurants/:id/status` | Approve or reject | Admin |

### Search and towns
| Method | Endpoint | Purpose | Access |
|---|---|---|---|
| GET | `/restaurants/search` | Filter and sort | Public |
| GET | `/restaurants/nearby` | Within a 5-10 minute walk | Public |
| GET | `/restaurants/top-rated` | Best-match ranking | Public |
| GET | `/restaurants/open-now` | Open right now | Public |
| GET | `/towns` | List towns | Public |
| GET | `/towns/:id` | One town | Public |
| POST | `/towns` | Add a town | Admin |
| PUT | `/towns/:id` | Edit a town | Admin |
| DELETE | `/towns/:id` | Remove a town | Admin |
| GET | `/towns/:id/restaurants` | Approved restaurants in a town | Public |

### Reservations
| Method | Endpoint | Purpose | Access |
|---|---|---|---|
| POST | `/reservations` | Book a table | Traveler |
| GET | `/reservations` | All reservations | Admin |
| GET | `/reservations/mine` | My bookings | Traveler |
| GET | `/reservations/restaurant/:restaurantId` | Incoming bookings | Owner |
| GET | `/reservations/:id` | One reservation | Owner of booking or restaurant |
| PUT | `/reservations/:id` | Change date, time or party size | Traveler |
| PATCH | `/reservations/:id/status` | Confirm, decline or complete | Owner |
| DELETE | `/reservations/:id` | Cancel | Traveler |
| GET | `/restaurants/:id/availability` | Seats left for a date and time | Public |

### Reviews
| Method | Endpoint | Purpose | Access |
|---|---|---|---|
| GET | `/restaurants/:id/reviews` | Approved reviews of a restaurant | Public |
| GET | `/reviews/mine` | My reviews, every status | Logged in |
| GET | `/reviews/pending` | Reviews waiting for approval | Admin |
| GET | `/reviews/:id` | One review | Author or admin |
| POST | `/reviews` | Write a review (starts pending) | Traveler |
| PUT | `/reviews/:id` | Edit own review (goes back to pending) | Author |
| DELETE | `/reviews/:id` | Delete a review | Author or admin |
| PATCH | `/reviews/:id/status` | Approve or reject | Admin |

Review rules: rating is a whole number 1 to 5, comment is 10 to 1000 characters, the visit date cannot be in the future,
and a traveler can review a restaurant only once.

## Pages

Home, Towns, Town details, Restaurant details, Search results, Write or edit a review, My reviews,
Book a table, My reservations, Owner dashboard, Owner reservations, Restaurant form, Manage restaurants,
Restaurant approval, Manage towns, Review moderation, Register, Login, 404.

## Features

- Search with filters and sorting, walking distance, and an "open now" badge
- Booking that checks seats left before it saves
- Three roles with protected pages and a role-aware navbar
- Admin approval for restaurants and reviews
- Ratings that are always computed from approved reviews
- Forms validated with React Hook Form and Zod, with an error under each field
- Loading, error and empty states on every page that loads data
- Delete confirmations and success messages
- Works at 375 px wide

## Limitations

- No compare page, no currency conversion, and no full menu (prices are an average meal cost).
- Restaurant details and coordinates in the seed data were entered by hand and should be double checked.
- Reviews are not tied to a confirmed booking, so any traveler can review an approved restaurant.
- Sample reviews in the seed are made-up demo text.
- Opening hours and "open now" use Philippine time only.
