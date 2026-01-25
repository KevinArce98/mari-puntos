# MariPuntos API Contract

> ⚠️ **Frontend is the source of truth** - Backend adapts to frontend types

## Base URL
```
/api
```

## Response Formats

### Success Response
```json
{
  "success": true,
  "data": <payload>,
  "message": "Optional success message"
}
```

### Paginated Response
```json
{
  "success": true,
  "data": [<items>],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10
  }
}
```

### Error Response
```json
{
  "success": false,
  "error": "Human readable error message",
  "details": [
    { "field": "fieldName", "message": "Validation error" }
  ]
}
```

---

## Authentication

All endpoints (except health check) require Clerk JWT authentication.

**Header:** `Authorization: Bearer <clerk_jwt_token>`

---

## Endpoints

### Users

#### GET /users/profile
Get current user's profile.

**Response:** `UserDTO`
```typescript
{
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string;
  role: 'husband' | 'wife';
  totalPoints: number;
  currentLevel: number;
  pointsInCurrentLevel: number;
  partnerCode?: string;
  hasPartner: boolean;
  isActive: boolean;
  createdAt: string; // ISO date
  updatedAt: string; // ISO date
}
```

#### POST /users/profile
Create user profile (after Clerk signup).

**Request:**
```typescript
{
  email: string;
  firstName: string;
  lastName: string;
  clerkId: string;
  role?: 'husband' | 'wife';
  avatarUrl?: string;
}
```

**Response:** `UserDTO`

#### PUT /users/profile
Update current user's profile.

**Request:**
```typescript
{
  firstName?: string;
  lastName?: string;
  role?: 'husband' | 'wife';
}
```

**Response:** `UserDTO`

#### GET /users/stats
Get current user's statistics.

**Response:**
```typescript
{
  totalPoints: number;
  currentLevel: number;
  pointsInCurrentLevel: number;
  actionsCreated: number;
  actionsApproved: number;
  permissionsRequested: number;
  achievementsUnlocked: number;
}
```

---

### Partner

#### POST /partner/create
Create a partner link code.

**Request:**
```typescript
{
  role: 'husband' | 'wife';
}
```

**Response:**
```typescript
{
  linkCode: string; // 6 characters
  status: 'pending' | 'active';
}
```

#### POST /partner/join
Join a partner using their link code.

**Request:**
```typescript
{
  linkCode: string; // 6 characters
}
```

**Response:**
```typescript
{
  linkCode: string;
  status: 'active';
  linkedAt: string; // ISO date
}
```

#### GET /partner
Get partner information.

**Response:**
```typescript
{
  id: string;
  linkCode: string;
  status: 'pending' | 'active';
  linkedAt: string;
  partner: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    avatarUrl?: string;
    role: 'husband' | 'wife';
    totalPoints: number;
    currentLevel: number;
  };
}
```

---

### Actions

#### POST /actions
Create a new action.

**Request:**
```typescript
{
  title: string;
  description?: string;
  category: 'household' | 'childcare' | 'errands' | 'romantic' | 'personal_growth' | 'other';
  metadata?: Record<string, unknown>;
}
```

**Response:** `ActionDTO`
```typescript
{
  id: string;
  userId: string;
  title: string;
  description?: string;
  category: ActionCategory;
  status: 'pending' | 'approved' | 'rejected';
  pointsAwarded: number;
  approvedBy?: string;
  approvedAt?: string;
  rejectionReason?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}
```

#### GET /actions/my
Get current user's actions.

**Query params:**
- `page?: number` (default: 1)
- `limit?: number` (default: 10, max: 100)
- `status?: 'pending' | 'approved' | 'rejected'`

**Response:** Paginated `ActionDTO[]`

#### GET /actions/partner
Get partner's actions (for evaluation).

**Query params:** Same as above

**Response:** Paginated `ActionDTO[]`

#### POST /actions/:id/approve
Approve an action and award points.

**Request:**
```typescript
{
  pointsAwarded: number; // 0-1000
}
```

**Response:** `ActionDTO`

#### POST /actions/:id/reject
Reject an action.

**Request:**
```typescript
{
  rejectionReason: string;
}
```

**Response:** `ActionDTO`

---

### Permissions

#### POST /permissions
Request a new permission.

**Request:**
```typescript
{
  title: string;
  description?: string;
  type: 'night_out' | 'gaming_session' | 'sports_event' | 'friends_hangout' | 'hobby_time' | 'other';
  requestedDate: string; // ISO datetime
  durationHours: number; // 1-168
  pointsCost: number;
}
```

**Response:** `PermissionDTO`
```typescript
{
  id: string;
  requesterId: string;
  approverId?: string;
  title: string;
  description?: string;
  type: PermissionType;
  status: 'pending' | 'approved' | 'rejected' | 'expired';
  requestedDate: string;
  durationHours: number;
  pointsCost: number;
  responseMessage?: string;
  respondedAt?: string;
  createdAt: string;
  updatedAt: string;
}
```

#### GET /permissions/my
Get current user's permission requests.

**Query params:**
- `page?: number`
- `limit?: number`
- `status?: PermissionStatus`

**Response:** Paginated `PermissionDTO[]`

#### GET /permissions/partner
Get partner's permission requests (for responding).

**Response:** Paginated `PermissionDTO[]`

#### GET /permissions/:id
Get permission by ID.

**Response:** `PermissionDTO`

#### POST /permissions/:id/respond
Respond to a permission request.

**Request:**
```typescript
{
  approved: boolean;
  responseMessage?: string;
}
```

**Response:** `PermissionDTO`

#### DELETE /permissions/:id
Cancel/delete a permission request (pending only).

**Response:** `{ success: true }`

---

### Rewards

#### POST /rewards
Create a custom reward.

**Request:**
```typescript
{
  title: string;
  description?: string;
  category: 'personal_time' | 'entertainment' | 'gifts' | 'experiences' | 'privileges' | 'other';
  pointsCost: number;
  requiredLevel: number;
  imageUrl?: string;
}
```

**Response:** `RewardDTO`
```typescript
{
  id: string;
  title: string;
  description?: string;
  category: RewardCategory;
  pointsCost: number;
  requiredLevel: number;
  imageUrl?: string;
  isActive: boolean;
  isCustom: boolean;
  createdBy?: string;
  timesRedeemed: number;
  createdAt: string;
  updatedAt: string;
}
```

#### GET /rewards
Get all rewards.

**Query params:**
- `page?: number`
- `limit?: number`
- `category?: RewardCategory`
- `isActive?: boolean`

**Response:** Paginated `RewardDTO[]`

#### GET /rewards/available
Get rewards available for current user.

**Response:** `RewardDTO[]`

#### POST /rewards/redeem
Redeem a reward.

**Request:**
```typescript
{
  rewardId: string; // UUID
}
```

**Response:** `{ success: true, message: "Reward redeemed successfully" }`

---

### Points

#### GET /points/history
Get current user's points history.

**Query params:**
- `page?: number`
- `limit?: number`

**Response:** Paginated `PointsLogDTO[]`
```typescript
{
  id: string;
  type: LogType;
  message: string;
  pointsChange: number;
  createdAt: string;
}
```

#### GET /points/leaderboard
Get points leaderboard.

**Query params:**
- `limit?: number` (default: 10, max: 50)

**Response:** `LeaderboardEntryDTO[]`
```typescript
{
  id: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string;
  totalPoints: number;
  currentLevel: number;
  role: 'husband' | 'wife';
}
```

---

## Enums

### UserRole
```typescript
'husband' | 'wife'
```

### ActionCategory
```typescript
'household' | 'childcare' | 'errands' | 'romantic' | 'personal_growth' | 'other'
```

### ActionStatus
```typescript
'pending' | 'approved' | 'rejected'
```

### PermissionType
```typescript
'night_out' | 'gaming_session' | 'sports_event' | 'friends_hangout' | 'hobby_time' | 'other'
```

### PermissionStatus
```typescript
'pending' | 'approved' | 'rejected' | 'expired'
```

### RewardCategory
```typescript
'personal_time' | 'entertainment' | 'gifts' | 'experiences' | 'privileges' | 'other'
```

### LogType
```typescript
'points_earned' | 'points_spent' | 'level_up' | 'achievement_unlocked' | 
'permission_requested' | 'permission_approved' | 'permission_rejected' |
'action_created' | 'action_approved' | 'action_rejected' |
'reward_redeemed' | 'partner_linked' | 'other'
```

---

## Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| UNAUTHORIZED | 401 | Not authenticated |
| FORBIDDEN | 403 | Not authorized |
| NOT_FOUND | 404 | Resource not found |
| VALIDATION_ERROR | 400 | Invalid input |
| INSUFFICIENT_POINTS | 400 | Not enough points |
| PARTNER_NOT_LINKED | 400 | No partner linked |
| PARTNER_ALREADY_LINKED | 409 | Already has partner |
| INVALID_LINK_CODE | 400 | Invalid partner code |
| ACTION_ALREADY_EVALUATED | 409 | Action already scored |
| PERMISSION_ALREADY_RESPONDED | 409 | Already responded |
| CANNOT_EVALUATE_OWN_ACTION | 400 | Self-evaluation not allowed |

---

## Naming Conventions

- All field names use **camelCase**
- All enum values use **snake_case**
- All dates are **ISO 8601** strings
- All IDs are **UUIDs**
