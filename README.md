# ReflectOS

A premium personal productivity web application for students and professionals — plan your day, track tasks, reinforce goals, and reflect on growth.

## Architecture

| Layer     | Technology                               |
| --------- | ---------------------------------------- |
| Frontend  | Next.js 16, React 19, Tailwind CSS 4, shadcn/ui |
| Backend   | Spring Boot 3.2, Java 21, Spring Security, JWT |
| Database  | PostgreSQL 15+                           |
| DevOps    | Docker Compose, GitHub Actions CI        |

```
GrewTh/
├── backend/          # Spring Boot API
│   ├── controllers/  # Thin HTTP adapters
│   ├── services/     # Business logic (TaskService, DiaryService)
│   ├── models/       # JPA entities (User, Task, DiaryEntry)
│   ├── repositories/ # Spring Data JPA interfaces
│   ├── exceptions/   # Domain exceptions + GlobalExceptionHandler
│   ├── security/     # JWT auth, filters, user details
│   └── payload/      # Request/response DTOs
├── frontend/         # Next.js app
│   ├── src/app/      # App Router pages
│   ├── src/components/  # Reusable UI components (shadcn/ui)
│   ├── src/context/  # Auth context provider
│   └── src/lib/      # API utilities
└── docker-compose.yml
```

## Prerequisites

- **Java 21** (JDK)
- **Node.js 18+** and npm
- **Docker & Docker Compose** (for PostgreSQL)

## Quick Start

### 1. Start the Database

```bash
docker compose up -d
```

### 2. Start the Backend

```bash
cd backend
./mvnw spring-boot:run        # Linux/macOS
.\mvnw.cmd spring-boot:run    # Windows
```

The API starts at `http://localhost:8080`. Health check at `/actuator/health`.

### 3. Start the Frontend

```bash
cd frontend
cp .env.example .env.local     # First time only
npm install
npm run dev
```

The app starts at `http://localhost:3000`.

## Environment Variables

### Frontend (`frontend/.env.local`)

| Variable                    | Required | Default                        | Description                    |
| --------------------------- | -------- | ------------------------------ | ------------------------------ |
| `NEXT_PUBLIC_API_URL`       | Yes      | `http://localhost:8080/api`    | Backend API base URL           |
| `NEXT_PUBLIC_DEV_MODE_AUTH` | No       | `false`                        | Enable dev auto-login bypass   |

### Backend (`application.properties` / env vars)

| Variable          | Default                           | Description                    |
| ----------------- | --------------------------------- | ------------------------------ |
| `DB_URL`          | `jdbc:postgresql://localhost:5432/reflectos_db` | JDBC connection string |
| `DB_USERNAME`     | `reflectos_user`                  | Database username              |
| `DB_PASSWORD`     | `reflectos_password`              | Database password              |
| `JWT_SECRET`      | (dev default)                     | JWT signing key (**override in prod**) |
| `JWT_EXPIRATION_MS` | `86400000` (24h)                | Token lifetime in milliseconds |
| `DEV_MODE_AUTH`   | `true`                            | Enable dev-login endpoint      |
| `PORT`            | `8080`                            | Server port                    |

## Dev Mode Authentication

For local development, set `DEV_MODE_AUTH=true` (backend) and `NEXT_PUBLIC_DEV_MODE_AUTH=true` (frontend). This creates a `devuser` account and auto-logs you in.

**Production safety**: The frontend double-gates this behind `NODE_ENV !== 'production'`, so even if the flag is accidentally left on, production builds will never execute the dev-login path.

## Production Checklist

- [ ] Set `DEV_MODE_AUTH=false`
- [ ] Set `NEXT_PUBLIC_DEV_MODE_AUTH=false` (or remove the variable)
- [ ] Override `JWT_SECRET` with a strong, unique key
- [ ] Override `DB_PASSWORD` with a secure password
- [ ] Set `JPA_DDL_AUTO=validate` (never `update` in prod)
- [ ] Configure proper CORS origins (replace `*` in controllers)
- [ ] Enable HTTPS / TLS termination
- [ ] Set up database backups

## API Endpoints

### Auth
| Method | Endpoint              | Description          |
| ------ | --------------------- | -------------------- |
| POST   | `/api/auth/register`  | Register a new user  |
| POST   | `/api/auth/login`     | Login and get JWT    |
| POST   | `/api/auth/dev-login` | Dev-only auto-login  |

### Tasks
| Method | Endpoint                    | Description              |
| ------ | --------------------------- | ------------------------ |
| GET    | `/api/tasks/daily?date=`    | Get tasks for a date     |
| GET    | `/api/tasks/history`        | Get all task history     |
| POST   | `/api/tasks`                | Create a new task        |
| PUT    | `/api/tasks/{id}`           | Update a task            |
| PATCH  | `/api/tasks/{id}/complete`  | Toggle task completion   |
| PATCH  | `/api/tasks/{id}/priority`  | Toggle top priority      |
| DELETE | `/api/tasks/{id}`           | Delete a task            |

### Diary
| Method | Endpoint                    | Description              |
| ------ | --------------------------- | ------------------------ |
| GET    | `/api/diary/today?date=`    | Get/create today's entry |
| GET    | `/api/diary/history`        | Get diary history        |
| POST   | `/api/diary/draft?date=`    | Save draft               |
| POST   | `/api/diary/submit?date=`   | Submit and lock entry    |

### Health
| Method | Endpoint              | Description              |
| ------ | --------------------- | ------------------------ |
| GET    | `/actuator/health`    | Application health check |

## License

Private — All rights reserved.
