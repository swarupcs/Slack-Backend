# Linkly — Backend Planning Document
### Node.js + Express.js + TypeScript

---

## 1. Frontend Feature Summary

The frontend is a **Slack-clone** called **"Linkly"** built with React + TypeScript. Below are all the features identified from the codebase:

### 🔐 Authentication
- Email + password Sign Up / Sign In - done
- "Remember me" (persistent session)
- Forgot password / request reset link
- OAuth buttons (Google, GitHub) — UI only for now
- Demo login (instant guest session)
- Username availability check (real-time)
- Password strength meter
- JWT-based session management via `sessionStorage` / `localStorage`

### 👤 User & Profile
- View own profile and others' profiles (full-page view + side panel)
- Edit profile: displayName, username, bio, title, timezone, social links (GitHub, Twitter, LinkedIn, Website)
- Avatar display (auto-generated via DiceBear)
- Custom status: emoji + text with presets (Focusing, Away, Lunch break, etc.)
- Clear status
- User presence/status indicator: `online`, `away`, `dnd`, `offline`
- Change password
- View user's shared files, channel memberships
- Notification preferences (desktop, mobile, email, sound toggles)
- Appearance settings (dark/light theme)
- Language/locale preference
- User search

### 🏢 Workspace
- List workspaces the user belongs to
- Create a new workspace (name, icon emoji, description, first channel)
- Join a workspace via invite code (e.g. `LNK-2026`)
- Switch between workspaces
- Update workspace info (name, icon, description)
- Leave a workspace

### 📢 Channels
- List joined channels (public/private/announcement types)
- Browse all channels in a workspace
- Create a channel (name, type, description, private flag)
- Join / leave a channel
- Channel members list
- Mute/unmute a channel
- Pinned messages per channel

### 💬 Messages (Channel & DM)
- Send a message (text, with attachments)
- Edit a message
- Delete a message
- Infinite scroll / pagination (load older messages)
- Emoji reactions (add/remove/toggle)
- Pin / unpin a message
- Reply in a thread
- Bookmarks/Save a message (toggle)
- Typing indicator (broadcast while composing)
- Message search with filters (author, channel, date range, has attachments, has links, has reactions)

### 🧵 Threads
- View thread replies for a message
- Post a reply in a thread
- Thread reply count + preview in channel view

### 📩 Direct Messages (DMs)
- List DMs for the user
- Open or create a DM with another user
- Send/receive messages in a DM
- Unread DM count badge

### 🔔 Notifications
- Notification list per user
- Mark single notification as read
- Mark all notifications as read
- Unread notification count

### 📌 Saved Items (Bookmarks)
- Save / unsave a message
- List all saved messages (with channel name and timestamp)
- Check if a message is bookmarked

### 🔍 Global Search
- Search across: messages, channels, people, files
- Filters: type, channelId, authorId, dateFrom, dateTo, hasFiles, hasLinks, hasReactions
- Search history per user (save, fetch, clear individual item)

### 📊 Read States (Unread Counts)
- Mark a channel as read (track last read message ID)
- Get unread message count per channel per user

### 📁 File Uploads & Attachments
- Upload a file (attached to a message)
- List all files uploaded by a user (across channels)
- Attachment metadata: name, URL, size, type

### 📊 Polls
- Create a poll (question, options, anonymous flag, end date, linked to channel + message)
- Get poll by ID
- Vote on a poll option (single vote per user, replaces previous)

### 📅 Calendar Panel (UI only — no backend in mock)
- Display calendar events (hardcoded mock data)
- Will need: CRUD for calendar events per workspace

### 📝 Docs Panel (UI only — no backend in mock)
- Create / view rich-text documents per workspace
- Will need: CRUD for workspace docs

### 🎯 Goals & OKRs (localStorage-based in mock)
- Create a goal (title, description, due date, owner)
- Add subtasks to a goal
- Toggle subtask done/undone
- Update goal progress (0–100%)
- Delete a goal
- Persisted per workspace in `localStorage` — needs real DB storage

### 📈 Analytics Dashboard (UI only — computed from mock data)
- Message counts by channel
- Active members count
- Messages per day chart (7-day trend)
- Will need: aggregation queries / analytics endpoints

### 🎨 Canvas Panel (UI only — no backend)
- Freehand drawing tool
- Share canvas as image to channel

### 😊 Custom Emoji Manager
- Add custom emoji (name + URL/upload)
- List custom emoji per workspace
- Delete custom emoji

### 😌 Mood Check-In (localStorage-based in mock)
- Daily mood check-in (emoji + optional note)
- Stored per day per workspace

### 🔊 Huddle (UI only — no real WebRTC yet)
- Join/leave a huddle in a channel
- Mute/unmute, video toggle, screen share toggle (UI state only)
- Will need: WebRTC signaling server (e.g. via Socket.IO)

### ⚙️ Settings Modal
- Profile tab
- Status tab
- Notifications tab
- Appearance tab (dark/light)
- Language tab
- Custom Emoji tab

---

## 2. Backend Requirements — Feature by Feature

Below is every frontend feature mapped to the type of backend needed.

---

### 🔐 AUTH — REST + JWT

| Feature | Endpoint | Type |
|---|---|---|
| Sign up | `POST /api/auth/signup` | REST |
| Sign in | `POST /api/auth/signin` | REST |
| Sign out | `POST /api/auth/signout` | REST |
| Get session | `GET /api/auth/me` | REST |
| Forgot password | `POST /api/auth/forgot-password` | REST + Email |
| Reset password | `POST /api/auth/reset-password` | REST |
| Change password | `POST /api/auth/change-password` | REST |
| Check username availability | `GET /api/auth/username-available?username=` | REST |
| OAuth (Google/GitHub) | Passport.js OAuth routes | REST + OAuth2 |

**Middleware:** JWT auth middleware on all protected routes. Tokens stored as HTTP-only cookies or Authorization header.

---

### 👤 USERS — REST

| Feature | Endpoint | Type |
|---|---|---|
| Get user by ID | `GET /api/users/:userId` | REST |
| Get all users | `GET /api/users` | REST |
| Search users | `GET /api/users/search?q=` | REST |
| Update profile | `PATCH /api/users/:userId` | REST |
| Update status | `PATCH /api/users/:userId/status` | REST |
| Get user preferences | `GET /api/users/:userId/prefs` | REST |
| Save preferences | `PUT /api/users/:userId/prefs` | REST |
| Get user files | `GET /api/users/:userId/files` | REST |

---

### 🏢 WORKSPACES — REST

| Feature | Endpoint | Type |
|---|---|---|
| List workspaces for user | `GET /api/workspaces` | REST |
| Get workspace by ID | `GET /api/workspaces/:workspaceId` | REST |
| Create workspace | `POST /api/workspaces` | REST |
| Update workspace | `PATCH /api/workspaces/:workspaceId` | REST |
| Join workspace by code | `POST /api/workspaces/join` | REST |
| Leave workspace | `DELETE /api/workspaces/:workspaceId/members/me` | REST |

---

### 📢 CHANNELS — REST

| Feature | Endpoint | Type |
|---|---|---|
| List channels in workspace | `GET /api/workspaces/:wsId/channels` | REST |
| Get channel by ID | `GET /api/workspaces/:wsId/channels/:channelId` | REST |
| Create channel | `POST /api/workspaces/:wsId/channels` | REST |
| Join channel | `POST /api/workspaces/:wsId/channels/:channelId/join` | REST |
| Leave channel | `DELETE /api/workspaces/:wsId/channels/:channelId/members/me` | REST |
| Get channel members | `GET /api/workspaces/:wsId/channels/:channelId/members` | REST |
| Get pinned messages | `GET /api/workspaces/:wsId/channels/:channelId/pins` | REST |
| Mute/unmute channel | `PATCH /api/workspaces/:wsId/channels/:channelId/mute` | REST |

---

### 💬 MESSAGES — REST + WebSocket (Socket.IO)

This is the **core real-time feature**. Messages need both REST (initial load, history) and WebSocket (live delivery).

| Feature | Endpoint / Event | Type |
|---|---|---|
| Load messages (paginated) | `GET /api/channels/:channelId/messages?before=&limit=` | REST |
| Send message | `socket.emit('message:send', {...})` → `socket.on('message:new', {...})` | **WebSocket** |
| Edit message | `PATCH /api/messages/:messageId` + socket broadcast | REST + WebSocket |
| Delete message | `DELETE /api/messages/:messageId` + socket broadcast | REST + WebSocket |
| Toggle reaction | `POST /api/messages/:messageId/reactions` | REST + WebSocket |
| Pin/unpin message | `PATCH /api/messages/:messageId/pin` | REST + WebSocket |

**Socket.IO Events needed:**
- `channel:join` / `channel:leave` (room management)
- `message:new` — broadcast new message to channel room
- `message:edited` — broadcast edit
- `message:deleted` — broadcast deletion
- `message:reaction` — broadcast reaction update
- `typing:start` / `typing:stop` — broadcast typing indicator

---

### 🧵 THREADS — REST + WebSocket

| Feature | Endpoint / Event | Type |
|---|---|---|
| Get thread replies | `GET /api/messages/:messageId/thread` | REST |
| Post thread reply | `POST /api/messages/:messageId/thread` + socket broadcast | REST + WebSocket |

Socket event: `thread:new-reply`

---

### 📩 DIRECT MESSAGES — REST + WebSocket

| Feature | Endpoint / Event | Type |
|---|---|---|
| List DMs for user | `GET /api/workspaces/:wsId/dms` | REST |
| Get or create DM | `POST /api/workspaces/:wsId/dms` | REST |
| Get DM messages | `GET /api/dms/:dmId/messages` | REST |
| Send DM message | `socket.emit('dm:send')` → `socket.on('dm:new')` | **WebSocket** |

Socket event: `dm:new` (delivered to the specific DM room or user socket room)

---

### 🔔 NOTIFICATIONS — REST + WebSocket

| Feature | Endpoint / Event | Type |
|---|---|---|
| List notifications | `GET /api/notifications` | REST |
| Mark one as read | `PATCH /api/notifications/:id/read` | REST |
| Mark all as read | `POST /api/notifications/read-all` | REST |
| Unread count | `GET /api/notifications/unread-count` | REST |
| Push new notification | `socket.on('notification:new')` | **WebSocket** |

---

### 📌 SAVED ITEMS (BOOKMARKS) — REST

| Feature | Endpoint | Type |
|---|---|---|
| List bookmarks | `GET /api/bookmarks` | REST |
| Toggle bookmark | `POST /api/bookmarks/toggle` | REST |
| Check if bookmarked | `GET /api/bookmarks/check?messageId=` | REST |

---

### 🔍 SEARCH — REST

| Feature | Endpoint | Type |
|---|---|---|
| Global search | `GET /api/search?q=&type=&channelId=&authorId=...` | REST |
| Get search history | `GET /api/search/history` | REST |
| Add to history | `POST /api/search/history` | REST |
| Clear history item | `DELETE /api/search/history/:query` | REST |

---

### 📊 READ STATES — REST + WebSocket

| Feature | Endpoint | Type |
|---|---|---|
| Mark channel as read | `POST /api/read-states` `{ channelId, lastMessageId }` | REST |
| Get unread count | `GET /api/read-states/unread?channelId=` | REST |

Unread counts can also be pushed via WebSocket when a new message arrives.

---

### 📁 FILE UPLOADS — REST (Multipart)

| Feature | Endpoint | Type |
|---|---|---|
| Upload file | `POST /api/files/upload` | REST (multipart/form-data) |
| Get user's files | `GET /api/users/:userId/files` | REST |

**Storage:** Use `multer` for file handling. Store files on disk locally (dev) or S3-compatible storage (prod). Return a public URL.

---

### 📊 POLLS — REST

| Feature | Endpoint | Type |
|---|---|---|
| Create poll | `POST /api/polls` | REST |
| Get poll | `GET /api/polls/:pollId` | REST |
| Vote on poll | `POST /api/polls/:pollId/vote` | REST + WebSocket (broadcast updated poll) |

Socket event: `poll:updated`

---

### 📅 CALENDAR EVENTS — REST

| Feature | Endpoint | Type |
|---|---|---|
| List events | `GET /api/workspaces/:wsId/events` | REST |
| Create event | `POST /api/workspaces/:wsId/events` | REST |
| Update event | `PATCH /api/workspaces/:wsId/events/:eventId` | REST |
| Delete event | `DELETE /api/workspaces/:wsId/events/:eventId` | REST |

---

### 📝 WORKSPACE DOCS — REST

| Feature | Endpoint | Type |
|---|---|---|
| List docs | `GET /api/workspaces/:wsId/docs` | REST |
| Get doc | `GET /api/workspaces/:wsId/docs/:docId` | REST |
| Create doc | `POST /api/workspaces/:wsId/docs` | REST |
| Update doc | `PATCH /api/workspaces/:wsId/docs/:docId` | REST |
| Delete doc | `DELETE /api/workspaces/:wsId/docs/:docId` | REST |

---

### 🎯 GOALS & OKRs — REST

| Feature | Endpoint | Type |
|---|---|---|
| List goals | `GET /api/workspaces/:wsId/goals` | REST |
| Create goal | `POST /api/workspaces/:wsId/goals` | REST |
| Update goal (progress, subtasks) | `PATCH /api/workspaces/:wsId/goals/:goalId` | REST |
| Delete goal | `DELETE /api/workspaces/:wsId/goals/:goalId` | REST |
| Add subtask | `POST /api/workspaces/:wsId/goals/:goalId/subtasks` | REST |
| Toggle subtask | `PATCH /api/workspaces/:wsId/goals/:goalId/subtasks/:taskId` | REST |

---

### 😊 MOOD CHECK-INS — REST

| Feature | Endpoint | Type |
|---|---|---|
| Submit mood | `POST /api/workspaces/:wsId/moods` | REST |
| Get today's mood | `GET /api/workspaces/:wsId/moods/today` | REST |

---

### 😀 CUSTOM EMOJI — REST

| Feature | Endpoint | Type |
|---|---|---|
| List custom emoji | `GET /api/workspaces/:wsId/emoji` | REST |
| Add custom emoji | `POST /api/workspaces/:wsId/emoji` | REST (multipart or URL) |
| Delete custom emoji | `DELETE /api/workspaces/:wsId/emoji/:emojiId` | REST |

---

### 📈 ANALYTICS — REST (Aggregations)

| Feature | Endpoint | Type |
|---|---|---|
| Message volume per channel | `GET /api/workspaces/:wsId/analytics/messages` | REST |
| Active members | `GET /api/workspaces/:wsId/analytics/members` | REST |
| Daily message trend | `GET /api/workspaces/:wsId/analytics/daily?days=7` | REST |

---

### 🔊 HUDDLE (Audio/Video) — WebSocket / WebRTC Signaling

| Feature | Event | Type |
|---|---|---|
| Join huddle | `socket.emit('huddle:join', { channelId })` | WebSocket |
| Leave huddle | `socket.emit('huddle:leave')` | WebSocket |
| WebRTC offer/answer/ICE | `socket.emit('webrtc:signal', { to, signal })` | WebSocket (signaling) |
| Broadcast huddle participants | `socket.on('huddle:participants')` | WebSocket |

---

## 3. Backend Tech Stack Summary

| Layer | Technology |
|---|---|
| Runtime | Node.js 20+ |
| Framework | Express.js |
| Language | TypeScript |
| Real-time | Socket.IO (WebSocket) |
| Authentication | JWT (`jsonwebtoken`) + bcrypt |
| File Upload | Multer + local disk / AWS S3 |
| Email | Nodemailer (for password reset) |
| OAuth | Passport.js (Google + GitHub strategies) |
| Validation | Zod or express-validator |
| Database | PostgreSQL (recommended) with Prisma ORM |
| Caching | Redis (for sessions, unread counts, typing indicators) |
| Rate Limiting | `express-rate-limit` |

---

## 4. Recommended Folder Structure

```
src/
├── config/          # env vars, db config
├── middlewares/     # auth, error handler, rate limiter
├── modules/
│   ├── auth/        # routes, controller, service
│   ├── users/
│   ├── workspaces/
│   ├── channels/
│   ├── messages/
│   ├── threads/
│   ├── dms/
│   ├── notifications/
│   ├── bookmarks/
│   ├── search/
│   ├── files/
│   ├── polls/
│   ├── goals/
│   ├── docs/
│   ├── calendar/
│   ├── moods/
│   ├── emoji/
│   └── analytics/
├── socket/          # Socket.IO event handlers
│   ├── index.ts
│   ├── messageHandler.ts
│   ├── dmHandler.ts
│   ├── typingHandler.ts
│   └── huddleHandler.ts
├── prisma/          # schema.prisma + migrations
├── lib/             # shared utilities, helpers
├── types/           # shared TypeScript types
└── app.ts           # Express app setup
```

---

## 5. Priority Order for Implementation

1. **Auth** (signup, signin, JWT middleware)
2. **Users** (profile CRUD, status)
3. **Workspaces + Channels** (CRUD + join/leave)
4. **Messages** (REST list/send/edit/delete)
5. **Socket.IO** (real-time message delivery, typing indicators)
6. **DMs** (get/create + real-time)
7. **Threads** (replies)
8. **Notifications + Read States**
9. **Search** (global search with filters)
10. **File Uploads**
11. **Bookmarks, Reactions, Pinned messages**
12. **Polls**
13. **Goals, Docs, Calendar, Moods, Analytics** (secondary features)
14. **Huddle / WebRTC signaling** (advanced, last)