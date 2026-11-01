# IMovies — Full-Stack Cinema Ticket Booking Platform

Production-oriented cinema ticket booking platform built with **React.js**, **Node.js**, **Express.js**, **MongoDB / Mongoose**, and **JWT Authentication**.

Developed for **[Ayushdev365](https://github.com/Ayushdev365)** • Contributed by **[@soulfulkushagra](https://github.com/soulfulkushagra)** • Repository: `imovies-movie-booking`.

---

## 🎬 Core Features

- **Movie Discovery**: Browse now-playing blockbusters, coming-soon titles, filter by genres (Sci-Fi, Action, Drama, Animation), search by title/director/cast.
- **Auditoriums & Formats**: Flagship complexes in New York, Los Angeles, Chicago, London with **IMAX 4K Laser**, **Dolby Atmos**, **4DX**, and **VIP Leather Recliner Loungers**.
- **Interactive Seat Map**:
  - Cinema screen curvature visualization ("ALL EYES THIS WAY").
  - Tiered seating: VIP (Rows A-B), Premium (Rows C-E), Standard (Rows F-H).
  - Real-time seat status: Available, Selected, Held, and Booked.
  - Multi-seat selection (up to 8 seats per order).
- **Atomic Concurrency & Seat Locking**:
  - Server-side atomic locks preventing duplicate bookings or race conditions.
  - 5-Minute temporary seat reservation hold policy with live countdown timer.
  - Automatic expiration and return of seats to inventory if checkout is abandoned.
  - Server-side authoritative price and subtotal calculation (zero trust in frontend pricing).
- **Digital Cinema Pass**:
  - Perforated cinema ticket pass design.
  - Unique booking references (e.g. `IMV-2026-XXXXX`).
  - Scannable barcode and QR visualization with print support.
  - Instant self-service booking cancellation with simulated refunds.
- **Authentication & Security**:
  - JWT token-based authentication (7-day validity).
  - Bcrypt password hashing.
  - Role-based authorization (`user` vs `admin`).
  - Pre-seeded 1-click test credentials for instant evaluation.
- **Admin Management Suite**:
  - Real-time gross revenue, total reservations, verified payments, and ticket counts.
  - Full CRUD for Movies, Theatres, Screens, and Showtimes.
  - Customer booking inspection and administrator cancellation overrides.

---

## 🚀 GitHub Synchronization (Ayushdev365)

To link and synchronize this project with your GitHub account:

1. Create a repository named `imovies-movie-booking` at [https://github.com/new](https://github.com/new).
2. Run the following terminal commands:
```bash
git remote add origin https://github.com/Ayushdev365/imovies-movie-booking.git
git branch -M main
git add .
git commit -m "feat: complete production IMovies cinema booking platform"
git push -u origin main
```

> **Security Note:** All database connection strings, JWT secrets, and local environment files are safeguarded by `.gitignore` and never committed to version control.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 19, TypeScript, Tailwind CSS, Lucide Icons, Canvas Confetti |
| **Backend** | Node.js, Express.js 4, REST API (`/api/v1`) |
| **Database** | MongoDB Atlas, Mongoose with Resilient In-Memory Fallback Engine |
| **Auth & Security**| JSON Web Tokens (JWT), Bcrypt.js, Role-Based Access Control |
| **Tooling** | Vite 8, TSX, Vitest |

---

## 🔑 Default Credentials for Evaluation

| Role | Email | Password | Access |
|---|---|---|---|
| **Cinema Admin** | `admin@imovies.com` | `Admin@12345` | Full Control Suite (`/admin`) |
| **Patron / Customer** | `user@imovies.com` | `User@12345` | Seat Reservation & Booking Pass |

*(Alternatively, use the 1-Click "Demo Patron" or "Cinema Admin" buttons on the Sign In page.)*

---

## ⚙️ Environment Variables

Copy `.env.example` to `.env`:

```env
# Server Port
PORT=3000
NODE_ENV=development

# MongoDB Connection String (Atlas URI or local)
# If left empty, IMovies seamlessly operates in high-performance in-memory persistence
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/imovies?retryWrites=true&w=majority

# JWT Secret
JWT_SECRET=imovies_jwt_super_secret_production_key_2026_xyz

# Client URL
CLIENT_URL=http://localhost:3000
```

---

## 📡 REST API Reference (`/api/v1`)

### Authentication
- `POST /api/v1/auth/register` — Create new patron account.
- `POST /api/v1/auth/login` — Sign in and receive JWT token.
- `GET /api/v1/auth/me` — Retrieve active user session.
- `PUT /api/v1/auth/profile` — Update patron name and contact phone.

### Movies
- `GET /api/v1/movies` — List movies (filters: `status`, `genre`, `language`, `search`).
- `GET /api/v1/movies/:id` — Get detailed movie info.
- `POST /api/v1/movies` — Add movie *(Admin only)*.
- `PUT /api/v1/movies/:id` — Update movie *(Admin only)*.
- `DELETE /api/v1/movies/:id` — Delete movie *(Admin only)*.

### Theatres & Screens
- `GET /api/v1/theatres` — List complexes (filter by `city`).
- `GET /api/v1/theatres/:id` — Get theatre details and screens.
- `POST /api/v1/theatres` — Create theatre *(Admin only)*.
- `POST /api/v1/screens` — Add auditorium screen *(Admin only)*.

### Showtimes & Seat Availability
- `GET /api/v1/showtimes` — List showtimes (filters: `movieId`, `theatreId`, `date`).
- `GET /api/v1/showtimes/:id` — Get showtime details.
- `POST /api/v1/showtimes` — Schedule new showtime *(Admin only)*.
- `GET /api/v1/showtimes/:id/seats` — Live seat matrix (clears expired holds automatically).
- `POST /api/v1/showtimes/:id/hold-seats` — Atomically lock seats for 5 minutes *(Protected)*.
- `POST /api/v1/showtimes/:id/release-seats` — Manually release held seats *(Protected)*.

### Bookings
- `POST /api/v1/bookings` — Authoritative price calculation, finalizes booking, issues reference *(Protected)*.
- `GET /api/v1/bookings/my` — Get user's active and past bookings *(Protected)*.
- `GET /api/v1/bookings/:id` — View specific booking pass *(Protected)*.
- `POST /api/v1/bookings/:id/cancel` — Cancel booking, release seats, process simulated refund *(Protected)*.

### Administration
- `GET /api/v1/admin/stats` — Revenue, bookings, catalog, and patron stats *(Admin only)*.
- `GET /api/v1/admin/bookings` — All bookings across all theatres *(Admin only)*.
- `GET /api/v1/admin/users` — List registered patrons *(Admin only)*.
