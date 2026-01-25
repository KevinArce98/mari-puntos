# MariPuntos Backend API

A professional gamified relationship points system backend built with Node.js, Express, TypeORM, Neon Postgres, and Clerk authentication.

## 🚀 Features

- **User Authentication**: Secure authentication with Clerk
- **Partner Linking**: Unique code-based partner connection system
- **Actions System**: Husbands create actions, wives approve and award points
- **Permissions System**: Request and approve permissions with point costs
- **Rewards System**: Redeem points for rewards with level requirements
- **Points & Levels**: Automatic level calculation and progression
- **Achievements**: Unlock achievements based on milestones
- **Activity Logs**: Complete history of all point transactions
- **Leaderboard**: Track top performers
- **📚 Swagger Documentation**: Interactive API documentation at `/api-docs`

## 📋 Prerequisites

- Node.js >= 18.0.0
- pnpm >= 8.0.0
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

4. **Run the development server**
```bash
pnpm dev
```

## 📦 Scripts

- `pnpm dev` - Start development server with hot reload
- `pnpm build` - Build for production
- `pnpm start` - Start production server
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
│   │   ├── PartnerLink.ts
│   │   ├── Action.ts
│   │   ├── Permission.ts
│   │   ├── Reward.ts
│   │   ├── Log.ts
│   │   ├── Level.ts
│   │   └── Achievement.ts
│   ├── services/         # Business logic layer
│   │   ├── users.service.ts
│   │   ├── partner.service.ts
│   │   ├── actions.service.ts
│   │   ├── permissions.service.ts
│   │   ├── rewards.service.ts
│   │   └── points.service.ts
│   ├── controllers/      # Request handlers
│   │   ├── users.controller.ts
│   │   ├── partner.controller.ts
│   │   ├── actions.controller.ts
│   │   ├── permissions.controller.ts
│   │   ├── rewards.controller.ts
│   │   └── points.controller.ts
│   ├── routes/           # API routes
│   │   ├── users.routes.ts
│   │   ├── partner.routes.ts
│   │   ├── actions.routes.ts
│   │   ├── permissions.routes.ts
│   │   ├── rewards.routes.ts
│   │   ├── points.routes.ts
│   │   └── index.ts
│   ├── middlewares/      # Express middlewares
│   │   ├── authMiddleware.ts
│   │   └── errorMiddleware.ts
│   ├── validators/       # Zod schemas
│   │   └── schemas.ts
│   ├── utils/            # Helper functions
│   │   └── helpers.ts
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
- `POST /api/actions` - Create action (husband only)
- `GET /api/actions/my` - Get my actions
- `GET /api/actions/partner` - Get partner's actions (wife only)
- `GET /api/actions/:id` - Get action by ID
- `PUT /api/actions/:id` - Update action
- `POST /api/actions/:id/approve` - Approve action (wife only)
- `POST /api/actions/:id/reject` - Reject action (wife only)
- `DELETE /api/actions/:id` - Delete action

### Permissions
- `POST /api/permissions` - Request permission (husband only)
- `GET /api/permissions/my` - Get my permission requests
- `GET /api/permissions/partner` - Get partner's requests (wife only)
- `GET /api/permissions/:id` - Get permission by ID
- `POST /api/permissions/:id/respond` - Approve/reject permission (wife only)
- `DELETE /api/permissions/:id` - Delete permission request

### Rewards
- `POST /api/rewards` - Create custom reward
- `GET /api/rewards` - Get all rewards
- `GET /api/rewards/available` - Get available rewards for user
- `GET /api/rewards/:id` - Get reward by ID
- `POST /api/rewards/redeem` - Redeem a reward
- `PUT /api/rewards/:id` - Update reward
- `DELETE /api/rewards/:id` - Delete reward

### Points
- `GET /api/points/history` - Get points history
- `GET /api/points/leaderboard` - Get leaderboard

## 🗄️ Database Schema

### User
- Stores user information from Clerk
- Tracks total points, current level, and role (husband/wife)
- Unique partner code for linking

### PartnerLink
- Manages relationship between husband and wife
- Unique link code for joining
- Status tracking (pending/active/inactive)

### Action
- Actions created by husband
- Approved/rejected by wife with points awarded
- Categories: household, childcare, errands, romantic, etc.

### Permission
- Permission requests from husband
- Approved/rejected by wife
- Optional point cost and duration

### Reward
- Redeemable items with point costs
- Level requirements
- Default and custom rewards

### Log
- Complete audit trail of all activities
- Points changes, level ups, achievements

### Level
- Level definitions with point requirements
- Rewards and badges per level

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
- Husbands earn points by completing actions
- Wives award points when approving actions
- Points can be spent on rewards and permissions
- Default: 100 points per level

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
4. **Logging**: Morgan for HTTP request logging
5. **Type Safety**: Full TypeScript coverage
6. **Architecture**: Clean separation of concerns (routes → controllers → services → entities)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

For issues and questions:
- Create an issue on GitHub
- Check existing documentation
- Review API endpoint documentation

## 🎯 Roadmap

- [ ] Add unit tests
- [ ] Add integration tests
- [ ] Add API documentation (Swagger/OpenAPI)
- [ ] Add rate limiting
- [ ] Add caching layer
- [ ] Add real-time notifications (WebSockets)
- [ ] Add email notifications
- [ ] Add analytics dashboard

---

Built with ❤️ for couples who gamify their relationship
