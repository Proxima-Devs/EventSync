<div align="center">

# 📅 EventSync

**Real-time event management and attendee engagement platform**

</div>

A full-stack web application for managing tech events, scheduling sessions with speakers, and enabling live Q&A interactions with voting.

---

## 🚀 Technologies Used

| Frontend | Backend | Database | Tools |
|---|---|---|---|
| Next.js 16 (App Router) | API Routes (Next.js) | PostgreSQL | Tailwind CSS v4 |
| React 19 | Prisma ORM | Supabase (storage) | TypeScript |
| React Admin v5 | better-auth (JWT) | | framer-motion |
| next-intl (i18n) | Resend (emails) | | Lottie |

---

## 👥 Project Team

| Reference | Last Name | First Name | Role |
|---|---|---|---|
| STD24060 | RAKOTOARISON | Irina Stéphane | Backend Developer |
| STD24011 | RANDRIANASOLO | Antso Mendrika Hajaina | Frontend Developer |
| STD24093 | FENOMANANJARA | Harena Sarobidy | Frontend Developer |
| STD24012 | RABEMANANJARA | Nomenjanahary Yves | React Admin Developer |

---

## 📌 Features

- **Secure Authentication** (JWT via better-auth — Google, GitHub, magic link)
- **Event Management** (CRUD, slug, cover image upload)
- **Session Scheduling** with time slots, rooms, and speakers
- **Interactive Planning Grid** (room/time view)
- **Speaker Profiles** with photo, bio, social links
- **Live Q&A** during sessions (questions, upvotes, replies)
- **Favorites** (locally saved sessions)
- **Global Search** (events, sessions, speakers)
- **Internationalization** (English / French)
- **Dark Mode**
- **Admin Dashboard** (full CRUD via react-admin)
- **Question Moderation** (hide/delete)
- **Photo Upload** (Supabase Storage)

---

## 🚀 Setup & Run

### Prerequisites

- Node.js >= 18
- PostgreSQL
- Supabase account (for image storage)
- Resend API key (for emails)

### Backend & Frontend (Next.js monorepo)

> [!IMPORTANT]  
> Create a `.env` file at the project root and configure the required variables.  
> See the **Environment Variables** section below.

```bash
npm install
npx prisma db push
npm run dev
```

The app will be available at `http://localhost:3000`.

### Environment Variables

```env
DATABASE_URL="postgresql://user:password@localhost:5432/eventsync"
BETTER_AUTH_SECRET="your-secret"
BETTER_AUTH_URL="http://localhost:3000"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."
GITHUB_CLIENT_ID="..."
GITHUB_CLIENT_SECRET="..."
RESEND_API_KEY="..."
SUPABASE_URL="..."
SUPABASE_SERVICE_ROLE_KEY="..."
```

---

## 📂 Project Structure

```
EventSync/
│
├── app/                          # Next.js App Router
│   ├── (main)/                   # Main layout group
│   │   ├── (public)/             # Public pages
│   │   │   ├── events/[slug]/           # Event detail
│   │   │   │   └── sessions/[sessionId] # Session detail
│   │   │   ├── speakers/                # Speakers listing
│   │   │   │   └── [speakerId]          # Speaker profile
│   │   │   ├── favorites/              # Favorites
│   │   │   └── page.tsx                # Home page
│   │   ├── admin/dashboard/            # Admin panel
│   │   └── layout.tsx
│   ├── api/                     # API routes
│   │   ├── auth/[...all]/       # better-auth
│   │   ├── events/
│   │   │   ├── [eventId]/
│   │   │   │   ├── rooms/
│   │   │   │   └── sessions/
│   │   │   └── slug/[slug]/
│   │   ├── sessions/
│   │   │   ├── [sessionId]/questions/
│   │   │   └── live/
│   │   ├── speakers/[speakerId]/
│   │   ├── rooms/[roomId]/
│   │   ├── questions/[questionId]/
│   │   │   ├── comments/
│   │   │   └── upvote/
│   │   ├── search/
│   │   ├── upload/
│   │   └── admin/stats/
│   ├── auth/login/              # Login page
│   └── not-found.tsx            # 404 page
│
├── prisma/
│   └── schema.prisma            # Data model
│
├── src/
│   ├── components/              # React components
│   │   ├── adminResources/      # react-admin resources
│   │   ├── EventCard.tsx
│   │   ├── SpeakerCard.tsx
│   │   ├── SessionSchedule.tsx
│   │   ├── QuestionSection.tsx
│   │   └── ...
│   ├── hooks/                   # Custom hooks
│   ├── lib/                     # Utilities (Prisma, auth, API, email)
│   ├── providers/               # Providers (theme)
│   ├── translation/             # i18n files (fr.json, en.json)
│   └── types/                   # TypeScript types
│
├── public/                      # Static assets
├── package.json
├── next.config.ts
├── tailwind.config.ts
└── tsconfig.json
```

---

## 🔌 API Endpoints

### Authentication

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/*` | Login, signup, magic link (better-auth) |

### Events

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/events` | List all events (paginated, filterable) |
| POST | `/api/events` | Create an event (admin) |
| GET | `/api/events/slug/:slug` | Get event by slug |
| GET | `/api/events/:id` | Get event detail |
| PUT | `/api/events/:id` | Update an event (admin) |
| DELETE | `/api/events/:id` | Delete an event (admin) |
| GET | `/api/events/:id/sessions` | List sessions for an event |
| POST | `/api/events/:id/sessions` | Create a session (admin) |
| GET | `/api/events/:id/rooms` | List rooms used in an event |

### Sessions

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/sessions` | List all sessions (paginated, filterable) |
| POST | `/api/sessions` | Create a session (admin) |
| GET | `/api/sessions/live` | Currently live sessions |
| GET | `/api/sessions/:id` | Get session detail (slug or ID) |
| PUT | `/api/sessions/:id` | Update a session (admin) |
| DELETE | `/api/sessions/:id` | Delete a session (admin) |
| GET | `/api/sessions/:id/questions` | Get questions for a session |
| POST | `/api/sessions/:id/questions` | Post a question (live only) |

### Speakers

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/speakers` | List all speakers |
| POST | `/api/speakers` | Create a speaker (admin) |
| GET | `/api/speakers/:id` | Get speaker detail (slug or ID) |
| PUT | `/api/speakers/:id` | Update a speaker (admin) |
| DELETE | `/api/speakers/:id` | Delete a speaker (admin) |

### Rooms

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/rooms` | List all rooms |
| POST | `/api/rooms` | Create a room (admin) |
| GET | `/api/rooms/:id` | Get room detail |
| PUT | `/api/rooms/:id` | Update a room (admin) |
| DELETE | `/api/rooms/:id` | Delete a room (admin) |

### Questions & Upvotes

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/questions` | List questions (admin) |
| POST | `/api/questions` | Create a question (admin) |
| GET | `/api/questions/:id` | Get question detail |
| PUT | `/api/questions/:id` | Update a question (admin) |
| PATCH | `/api/questions/:id` | Moderate (hide/show) a question |
| DELETE | `/api/questions/:id` | Delete a question |
| POST | `/api/questions/:id/upvote` | Upvote a question |
| DELETE | `/api/questions/:id/upvote` | Remove upvote |
| POST | `/api/questions/:id/comments` | Reply to a question |

### Search & Stats

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/search?q=...` | Global search (events, sessions, speakers) |
| GET | `/api/admin/stats` | Admin dashboard statistics |
| POST | `/api/upload` | Upload image (Supabase) |

---

## 📄 Frontend Pages

| Route | Page | Description |
|---|---|---|
| `/` | Home | Hero section, search, event grid with filters |
| `/events/:slug` | Event Detail | Cover, info, planning grid, list view, favorites |
| `/events/:slug/sessions/:sessionId` | Session Detail | Info, speakers, live Q&A |
| `/speakers` | Speakers | Speaker card grid with search |
| `/speakers/:speakerId` | Speaker Profile | Photo, bio, social links, sessions |
| `/favorites` | Favorites | Saved sessions, filters, search |
| `/admin/dashboard` | Admin | react-admin panel (full CRUD) |
| `/auth/login` | Login | better-auth login |
