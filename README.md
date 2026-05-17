# Slack Clone Backend

Production-grade REST API for a Slack-like collaboration platform built with **TypeScript**, **Express 5**, **MongoDB**, **Socket.IO**, and **Bull** queues.

## Architecture

```
src/
├── config/          # Environment, database, Redis, AWS, CORS configs
├── constants/       # Application constants (socket events, etc.)
├── controllers/     # Thin HTTP & Socket.IO controllers
├── helpers/         # Reusable helper functions (JWT, password, pagination, mail)
├── lib/             # Infrastructure libraries (Winston logger)
├── middlewares/     # Express middleware (auth, error, validation, rate limit, logging)
├── models/          # Mongoose models with TypeScript interfaces
├── producers/       # Bull queue producers
├── processors/      # Bull queue processors
├── queues/          # Bull queue definitions
├── repositories/    # Data access layer (generic CRUD + domain-specific)
├── routes/          # Express route definitions with API versioning
├── services/        # Business logic layer
├── types/           # TypeScript type definitions and interfaces
├── utils/           # Utility classes (ApiResponse, ApiError, asyncHandler)
├── validators/      # Zod validation schemas
├── app.ts           # Express application setup
└── server.ts        # Server bootstrap & graceful shutdown
```

## Key Features

- **Full TypeScript** with strict mode (`noImplicitAny`, `strictNullChecks`, etc.)
- **Clean Architecture**: Controller → Service → Repository → Database
- **Standardized API Responses**: `ApiResponse` / `ApiError` classes
- **Zero try-catch in controllers**: `asyncHandler` middleware
- **Global Error Handler**: Covers Mongoose, JWT, MongoDB, and unknown errors
- **Zod Validation**: Request body, params, and query validation
- **Security**: Helmet, CORS, rate limiting, secure headers
- **Structured Logging**: Winston with dev/prod formats
- **Real-time**: Socket.IO for messaging and channel events
- **Job Queue**: Bull + Redis for async email processing
- **Environment Validation**: Zod-based fail-fast validation at startup
- **Graceful Shutdown**: SIGTERM/SIGINT handlers with timeout
- **Process Error Handling**: `uncaughtException` / `unhandledRejection`

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB
- Redis

### Installation

```bash
npm install
```

### Environment Variables

Copy the example environment file and configure it:

```bash
cp .env.example .env
```

### Development

```bash
npm run dev
```

### Build & Production

```bash
npm run build
npm start
```

### Type Checking

```bash
npm run type-check
```

### Linting & Formatting

```bash
npm run lint
npm run lint:fix
npm run format
```

## API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/users/signup` | Register a new user |
| POST | `/api/v1/users/signin` | Login user |

### Workspaces
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/workspaces` | Create workspace |
| GET | `/api/v1/workspaces` | Get user's workspaces |
| GET | `/api/v1/workspaces/:id` | Get workspace by ID |
| PUT | `/api/v1/workspaces/:id` | Update workspace |
| DELETE | `/api/v1/workspaces/:id` | Delete workspace |
| GET | `/api/v1/workspaces/join/:code` | Get workspace by join code |
| PUT | `/api/v1/workspaces/:id/join` | Join workspace |
| PUT | `/api/v1/workspaces/:id/members` | Add member |
| PUT | `/api/v1/workspaces/:id/channels` | Add channel |
| PUT | `/api/v1/workspaces/:id/joinCode/reset` | Reset join code |

### Channels
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/channels/:id` | Get channel with messages |

### Messages
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/messages/:channelId` | Get paginated messages |
| GET | `/api/v1/messages/pre-signed-url` | Get S3 upload URL |

### Members
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/members/workspace/:id` | Check membership |

### System
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| GET | `/ping` | Ping/pong |
| GET | `/verify/:token` | Verify email |
| GET | `/ui` | Bull Board dashboard |

## API Response Format

### Success
```json
{
  "success": true,
  "message": "User fetched successfully",
  "data": {},
  "statusCode": 200
}
```

### Error
```json
{
  "success": false,
  "message": "User not found",
  "errors": [],
  "statusCode": 404
}
```

## Socket.IO Events

| Event | Direction | Description |
|-------|-----------|-------------|
| `JoinChannel` | Client → Server | Join a channel room |
| `NewMessage` | Client → Server | Send a message |
| `NewMessageReceived` | Server → Client | Receive a message |

## License

ISC