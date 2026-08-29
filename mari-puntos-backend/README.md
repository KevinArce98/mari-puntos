# MariPuntos Backend API

A professional gamified relationship points system backend built with Node.js, Express, TypeORM, Neon Postgres, and Clerk authentication.

## 🚀 Features

- **User Authentication**: Secure authentication with Clerk
- **Partner Linking**: Unique code-based partner connection system
- **Actions System**: Users create actions, partners approve and award points
- **Permissions System**: Request and approve permissions with point costs
- **Streak System**: Weekly streak tracking — both partners must complete actions each week to extend the streak
- **Points & Levels**: Automatic level calculation and progression
- **Achievements**: Unlock achievements based on milestones
- **Activity Logs**: Complete history of all point transactions
- **Leaderboard**: Track top performers
- **📚 Swagger Documentation**: Interactive API documentation at `/api-docs`

## 📋 Prerequisites

- Node.js >= 22.13.0
- pnpm >= 11
- PostgreSQL database (Neon recommended)
- Clerk account for authentication

## 🛠️ Installation

1. **Clone the repository**

```bash
git clone <repository-url>
cd mari-puntos-backend
```

2. **Install dependencies**

```bash
pnpm install
```

3. **Configure environment variables**

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://user:password@host:5432/database?sslmode=require
CLERK_SECRET_KEY=sk_test_your_secret_key_here
CLERK_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
PARTNER_CODE_LENGTH=6
POINTS_PER_LEVEL=100
```

4. **Run database migrations**

```bash
pnpm run migration:run
```

5. **Seed initial data (optional)**

```bash
# Seed system permission templates
psql $DATABASE_URL < scripts/seed-permission-templates.sql

# Seed achievement levels
psql $DATABASE_URL < scripts/seed-achievements.sql

# Seed user levels
psql $DATABASE_URL < scripts/seed-levels.sql
```

6. **Run the development server**

```bash
pnpm dev
```

## 📦 Scripts

- `pnpm dev` - Start development server with hot reload
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm migration:generate` - Generate new migration
- `pnpm migration:run` - Run pending migrations
- `pnpm migration:revert` - Revert last migration
- `pnpm typecheck` - Run TypeScript type checking
- `pnpm lint` - Lint code with ESLint
- `pnpm format` - Format code with Prettier

## 🏗️ Project Structure

```
mari-puntos-backend/
├── src/
│   ├── config/           # Configuration files
│   │   ├── env.ts        # Environment variables validation
│   │   ├── db.ts         # Database configuration
│   │   └── clerk.ts      # Clerk authentication setup
│   ├── entities/         # TypeORM entities
│   │   ├── User.ts
│   │   ├── PartnerLink.ts  # includes streak columns
│   │   ├── Action.ts
│   │   ├── Permission.ts
│   │   ├── Log.ts
│   │   ├── Level.ts
│   │   └── Achievement.ts
│   ├── services/         # Business logic layer
│   │   ├── users.service.ts
│   │   ├── partner.service.ts
│   │   ├── actions.service.ts
│   │   ├── permissions.service.ts
│   │   ├── permission-templates.service.ts
│   │   ├── streak.service.ts
│   │   ├── points.service.ts
│   │   ├── achievements.service.ts
│   │   ├── audit-log.service.ts
│   │   └── push-notification.service.ts
│   ├── controllers/      # Request handlers
│   │   ├── users.controller.ts
│   │   ├── partner.controller.ts
│   │   ├── actions.controller.ts
│   │   ├── permissions.controller.ts
│   │   ├── permission-templates.controller.ts
│   │   ├── streak.controller.ts
│   │   ├── points.controller.ts
│   │   └── webhooks.controller.ts
│   ├── routes/           # API routes
│   │   ├── users.routes.ts
│   │   ├── partner.routes.ts
│   │   ├── actions.routes.ts
│   │   ├── permissions.routes.ts
│   │   ├── permission-templates.routes.ts
│   │   ├── streak.routes.ts
│   │   ├── points.routes.ts
│   │   ├── webhooks.routes.ts
│   │   └── index.ts
│   ├── middlewares/      # Express middlewares
│   │   ├── authMiddleware.ts
│   │   ├── errorMiddleware.ts
│   │   └── rateLimitMiddleware.ts
│   ├── validators/       # Zod schemas
│   │   └── schemas.ts
│   ├── utils/            # Helpers (logger, mappers, response, ...)
│   │   ├── helpers.ts
│   │   ├── logger.ts
│   │   ├── mappers.ts
│   │   ├── response.ts
│   │   └── partnerLink.ts
│   ├── i18n/             # Server-side i18n (ES/EN)
│   ├── migrations/       # TypeORM migrations
│   ├── shared/           # Constants & DTOs
│   ├── app.ts            # Express app setup
│   └── server.ts         # Server entry point
├── .env.example          # Environment variables template
├── .gitignore
├── package.json
├── tsconfig.json
└── README.md
```

## 🔌 API Endpoints

### Authentication

All endpoints require authentication via Clerk token in `Authorization: Bearer <token>` header.

### Users

- `GET /api/users/profile` - Get current user profile
- `PUT /api/users/profile` - Update user profile
- `GET /api/users/stats` - Get user statistics
- `POST /api/users/deactivate` - Deactivate account

### Partner

- `POST /api/partner/create` - Create partner link (generates code)
- `POST /api/partner/join` - Join partner link with code
- `GET /api/partner` - Get partner information
- `POST /api/partner/unlink` - Unlink from partner

### Actions

- `POST /api/actions` - Create action
- `GET /api/actions/my` - Get my actions
- `GET /api/actions/partner` - Get partner's actions
- `GET /api/actions/:id` - Get action by ID
- `PUT /api/actions/:id` - Update action
- `POST /api/actions/:id/approve` - Approve partner's action
- `POST /api/actions/:id/reject` - Reject partner's action
- `DELETE /api/actions/:id` - Delete action

### Permissions

- `POST /api/permissions` - Request permission
- `GET /api/permissions/my` - Get my permission requests
- `GET /api/permissions/partner` - Get partner's requests
- `GET /api/permissions/:id` - Get permission by ID
- `POST /api/permissions/:id/respond` - Approve/reject partner's permission
- `DELETE /api/permissions/:id` - Delete permission request

### Permission Templates

- `GET /api/permission-templates` - Get all templates (system + custom)
- `GET /api/permission-templates/system` - Get system templates only
- `GET /api/permission-templates/:id` - Get template by ID
- `POST /api/permission-templates` - Create custom template
- `PATCH /api/permission-templates/:id` - Update custom template
- `DELETE /api/permission-templates/:id` - Delete custom template

### Streak

- `GET /api/streak` - Get current streak info for the authenticated user's partner link

### Points

- `GET /api/points/history` - Get points history
- `GET /api/points/leaderboard` - Get leaderboard

## 🗄️ Database Schema

### User

- Stores user information from Clerk
- Tracks total points and current level
- Unique partner code for linking

### PartnerLink

- Manages the relationship between two partners
- Unique link code for joining
- Status tracking (pending/active/inactive)

### Action

- Actions created by a user
- Approved/rejected by their partner with points awarded
- Categories: household, childcare, errands, romantic, etc.

### Permission

- Permission requests from a user
- Approved/rejected by their partner
- Optional point cost and duration

### PartnerLink (streak columns)

- `currentStreak` — consecutive weeks both partners completed actions
- `longestStreak` — all-time record streak
- `currentWeekId` — ISO week identifier for current tracking window (e.g. `2026-W17`)
- `user1WeekDone` / `user2WeekDone` — whether each partner completed an action this week

### Log

- Complete audit trail of all activities
- Points changes, level ups, achievements

### Level

- Level definitions with point requirements

### Achievement

- Milestone-based achievements
- Automatic unlocking with bonus points

## 🔐 Authentication Flow

1. User authenticates with Clerk on frontend
2. Frontend sends Clerk token in Authorization header
3. Backend verifies token with Clerk
4. User is created/retrieved from database
5. User ID attached to request for authorization

## 🎮 Game Mechanics

### Points System

- Users earn points by completing actions approved by their partner
- Points can be spent on permissions
- Default: 100 points per level

### Streak System

- Both partners must have at least one approved action per ISO week
- When both complete their week, `currentStreak` increments
- If a week is skipped, streak resets to 0
- `longestStreak` tracks the all-time record

### Levels

- Automatic calculation based on total points
- Level = floor(totalPoints / pointsPerLevel) + 1
- Track progress within current level

### Achievements

- Automatically unlocked based on milestones
- Award bonus points when unlocked
- Types: points milestones, level milestones, action counts, etc.

## 🚀 Deployment

### Production Build

```bash
pnpm build
pnpm start
```

### Environment Variables (Production)

- Set `NODE_ENV=production`
- Use production database URL
- Configure `ALLOWED_ORIGINS` for CORS
- Use production Clerk keys

### Recommended Platforms

- **Backend**: Railway, Render, Fly.io, Heroku
- **Database**: Neon, Supabase, Railway Postgres
- **Authentication**: Clerk

## 🔧 Development

### Database Migrations

```bash
# Generate migration
pnpm migration:generate src/migrations/MigrationName

# Run migrations
pnpm migration:run

# Revert migration
pnpm migration:revert
```

### Code Quality

```bash
# Type checking
pnpm typecheck

# Linting
pnpm lint

# Formatting
pnpm format
```

## 📝 Best Practices

1. **Error Handling**: All errors are centralized through error middleware
2. **Validation**: All inputs validated with Zod schemas
3. **Security**: Helmet for security headers, CORS configured
4. **Logging**: Pino for structured logging with pretty output in development - **FULLY IMPLEMENTED** across all controllers, services, middlewares, and server startup
5. **Type Safety**: Full TypeScript coverage
6. **Architecture**: Clean separation of concerns (routes → controllers → services → entities)

## 📊 Logging

The application uses **Pino** for structured logging throughout the entire codebase.

### Features

- **Structured Logging**: All logs are JSON objects for easy parsing and analysis
- **Pretty Output**: Human-readable logs in development with colors and formatting
- **HTTP Request Logging**: Automatic logging of all HTTP requests with response times
- **Error Tracking**: Comprehensive error logging with stack traces
- **Performance**: High-performance logging that doesn't block the event loop

### Log Levels

- `debug`: Detailed information for development
- `info`: General information about application operation
- `warn`: Warning messages for potential issues
- `error`: Error messages for failures

### Usage in Code

```typescript
import { logger } from '../utils/logger';

// Log information
logger.info({ message: 'User created', userId: '123' });

// Log errors
logger.error({ err: error }, 'Failed to create user');

// Log debug information
logger.debug({ message: 'Processing request', data });
```

### Log Output

**Development** (with pino-pretty):

```
[2024-01-15 10:30:45] INFO: User created
    userId: "123"
[2024-01-15 10:30:46] ERROR: Failed to create user
    err: {
      "message": "Validation failed",
      "stack": "..."
    }
```

**Production** (JSON):

```json
{
  "level": 30,
  "time": 1705312245000,
  "msg": "User created",
  "userId": "123",
  "pid": 1234,
  "hostname": "server"
}
```

### Coverage

Logging is **FULLY IMPLEMENTED** across:

- **Server startup/shutdown**: Database initialization, server start, graceful shutdown
- **HTTP requests**: Automatic logging via pino-http middleware
- **Authentication**: JWT verification, user attachment
- **All controllers**: Request handling, success/error responses (7 controllers)
- **All services**: Business logic operations, database interactions (7 services)
- **Error handling**: Centralized error logging with context

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

Proprietary — © 2026 Kevin Arias, all rights reserved. See the LICENSE file for details.

## 🆘 Support

For issues and questions:

- Create an issue on GitHub
- Check existing documentation
- Review API endpoint documentation

## 🎯 Roadmap

- [x] Add API documentation (Swagger/OpenAPI) — live at `/api-docs`
- [x] Add rate limiting — `rateLimitMiddleware`
- [ ] Add unit tests
- [ ] Add integration tests
- [ ] Add caching layer
- [ ] Add real-time notifications (WebSockets)
- [ ] Add email notifications
- [ ] Add analytics dashboard

---

Built with ❤️ for couples who gamify their relationship
