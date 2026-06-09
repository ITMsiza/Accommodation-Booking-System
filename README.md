# StayEase — Hotel & Accommodation Booking System

A full-stack hotel booking platform built with **Next.js 15** (App Router) + **Spring Boot 3** + **PostgreSQL** + **Redis** + **WebSockets**.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 15 (App Router), TypeScript, Tailwind CSS |
| State | Zustand (global auth) + TanStack Query (server state) |
| Forms | React Hook Form + Zod |
| Backend | Spring Boot 3, Spring Security 6, Spring Data JPA |
| Auth | JWT (JJWT 0.12) + Refresh Tokens + Redis blacklist |
| Real-time | Spring WebSocket (STOMP) |
| Database | PostgreSQL 15 + Flyway migrations |
| Cache | Redis 7 |
| Emails | Spring Mail (MailHog in dev) |
| Build | Maven 3.9 / npm |
| Infra | Docker + Docker Compose + NGINX |
| CI/CD | GitHub Actions |

---

## Quick Start (Docker Compose)

### Prerequisites
- Docker Desktop ≥ 4.x
- Docker Compose V2

### Run Everything

```bash
# Clone the repository
git clone https://github.com/yourorg/stayease.git
cd stayease

# Copy and edit environment variables
cp .env.example .env

# Start all services
docker compose up --build
```

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| API | http://localhost:8080/api/v1 |
| Swagger UI | http://localhost:8080/api/v1/swagger-ui.html |
| MailHog | http://localhost:8025 |

### Default Admin Account

```
Email:    admin@stayease.com
Password: Admin@123
```

---

## Local Development

### Backend

```bash
cd backend

# Start PostgreSQL & Redis only
docker compose up postgres redis -d

# Run the Spring Boot app
./mvnw spring-boot:run \
  -Dspring-boot.run.arguments="--DB_URL=jdbc:postgresql://localhost:5432/stayease"
```

### Frontend

```bash
cd frontend

# Install dependencies
npm install

# Copy environment
cp .env.example .env.local
# Edit NEXT_PUBLIC_API_BASE_URL=http://localhost:8080/api/v1

# Start dev server
npm run dev
```

---

## Project Structure

```
stayease/
├── backend/                    # Spring Boot API
│   ├── src/main/java/com/stayease/
│   │   ├── config/             # Security, WebSocket, Redis, OpenAPI
│   │   ├── controller/         # REST controllers
│   │   ├── service/            # Business logic
│   │   ├── repository/         # Spring Data JPA
│   │   ├── entity/             # JPA entities
│   │   ├── dto/                # Request / Response DTOs
│   │   ├── exception/          # Global error handling
│   │   ├── security/           # JWT filter, UserDetailsService
│   │   └── scheduler/          # Check-in reminders, no-show detection
│   └── src/main/resources/
│       ├── application.yml
│       └── db/migration/       # Flyway SQL scripts
│
├── frontend/                   # Next.js 15 App
│   ├── app/                    # App Router pages & layouts
│   │   ├── (public)/           # Public routes
│   │   ├── (protected)/        # Auth-required routes
│   │   └── admin/              # Admin routes
│   ├── features/               # Feature-scoped components
│   │   ├── auth/               # Login, Register forms
│   │   ├── rooms/              # Search, cards, detail, availability
│   │   ├── booking/            # Booking form, My Bookings
│   │   ├── admin/              # Dashboard, rooms, bookings, users
│   │   └── notifications/      # Notification bell & WebSocket
│   ├── components/             # Shared UI & layout
│   ├── api/                    # Axios client + API functions
│   ├── store/                  # Zustand auth store
│   ├── types/                  # TypeScript type definitions
│   └── utils/                  # Helpers (dates, currency, cn)
│
├── docker-compose.yml
├── nginx.conf
└── .env.example
```

---

## API Documentation

Interactive Swagger UI: `http://localhost:8080/api/v1/swagger-ui.html`

### Key Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/auth/register` | Public | Register |
| POST | `/auth/login` | Public | Login, get JWT |
| GET | `/rooms` | Public | Search rooms |
| GET | `/rooms/{id}` | Public | Room details |
| POST | `/reservations` | USER | Create booking |
| GET | `/reservations/my` | USER | My bookings |
| DELETE | `/reservations/{id}` | USER | Cancel booking |
| GET | `/admin/dashboard/stats` | ADMIN | Dashboard stats |
| PATCH | `/reservations/{id}/status` | ADMIN | Update status |

---

## Running Tests

```bash
# Backend
cd backend && mvn test

# Frontend
cd frontend && npm test
```

---

## Environment Variables

See `.env.example` for all required environment variables.

---

## Deployment

1. Build Docker images: `docker compose build`
2. Push to registry (see `.github/workflows/ci.yml`)
3. Deploy using Docker Compose or Kubernetes
4. Set production environment variables
5. NGINX handles TLS termination (add cert to `nginx.conf`)

---

## Features

- ✅ JWT + Refresh token authentication
- ✅ Role-based access (GUEST / USER / ADMIN)
- ✅ Real-time room availability search
- ✅ Full booking lifecycle (PENDING → CONFIRMED → CHECKED_IN → CHECKED_OUT)
- ✅ Optimistic locking for double-booking prevention
- ✅ Cancellation with 24h policy enforcement
- ✅ Admin dashboard with KPI cards and revenue chart
- ✅ Ratings & reviews with moderation
- ✅ WebSocket push notifications (STOMP)
- ✅ Email notifications (check-in reminders)
- ✅ Reservation audit log
- ✅ Flyway database migrations
- ✅ OpenAPI 3.0 documentation
- ✅ Docker Compose orchestration
- ✅ GitHub Actions CI/CD
