# ArcaneMath

**AI math concept builder powered by Gemini and GeoGebra.**

- **Live demo:** https://wizmath-gdghacks2026.vercel.app/
- **Devpost:** https://devpost.com/software/signly-s8901m

Built at GDG Hacks 2026. ArcaneMath turns a plain-English math prompt
("draw a tangent line to a parabola at x = 2") into a live, interactive
construction inside an embedded GeoGebra applet, so teachers can author
visual math activities without writing GeoGebra commands by hand and
students can play, ask follow-up questions, and earn XP for completing them.

## How it works

1. The author types a prompt in the **Create** page.
2. The frontend sends it to the Node/Express backend at `POST /api/generate`.
3. The backend calls Google Gemini, parses the response, and returns a list
   of GeoGebra commands plus suggested viewport settings.
4. The frontend executes the commands in the embedded GeoGebra applet.
5. If any commands fail to execute, the frontend calls `POST /api/repair`
   with the failures and Gemini returns corrected commands.
6. Authors publish the construction (the full GeoGebra construction XML is
   stored, so the saved activity replays exactly as built), and students
   open it on the **Activity** page where an in-page AI tutor (`/api/tutor`)
   answers questions about that specific activity.

## Features

- **Prompt-to-construction** — Gemini generates executable GeoGebra
  commands from natural language, with an automatic repair pass for
  invalid commands.
- **Publish round-trip** — the full GeoGebra construction XML is stored
  in Firestore, so published activities replay exactly as the author built
  them, not as a rough re-render from the prompt.
- **In-context AI tutor** — students can ask questions on any activity
  page; the tutor is grounded in the activity's title, description, and
  current construction state.
- **Auto-generated descriptions and challenge questions** — Gemini
  drafts activity descriptions (`/api/describe`) and challenge questions
  (`/api/challenge`) from the construction itself.
- **Google sign-in** via Firebase Auth, with a dedicated `/signin` page.
- **Firestore-backed activity library** — browse all activities, star
  favorites, and (as the author) edit the title/description or delete
  the activity. Firestore rules enforce author-only writes.
- **XP and leaderboards** — playing and creating activities earns XP and
  levels; the **Leaderboard** page ranks contributors with **Top Creators**
  and **Top Students** tabs.
- **Hextech UI** — custom League-of-Legends-inspired component set
  (BrandMark, GoldButton, GhostButton, ParticleField, TopNav, etc.)
  layered on top of Tailwind.

## Tech stack

**Frontend:** React 18, Vite, Tailwind CSS, React Router, Firebase JS SDK,
GeoGebra Apps API
**Backend:** Node.js, Express 5, `@google/genai` (Gemini API), CORS, dotenv
**Data and auth:** Firebase Authentication (Google provider), Cloud Firestore
**Deploy:** Vercel (frontend), with `vercel.json` SPA rewrite

## Run locally

You will need:

- Node.js 20+
- A Firebase project with Google sign-in enabled and Firestore in native mode
- A Gemini API key (https://aistudio.google.com/apikey)

### 1. Backend

```bash
cd backend
npm install
```

Create `backend/.env`:

```env
GEMINI_API_KEY=your_gemini_api_key
PORT=3000
```

Start it:

```bash
npm run dev
```

### 2. Frontend

```bash
cd frontend
npm install
cp .env.example .env
```

Fill in `frontend/.env` with your Firebase web-app config and the backend URL:

```env
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...

VITE_BACKEND_URL=http://localhost:3000
```

Start it:

```bash
npm run dev
```

Open http://localhost:5173 (Vite's default).

### 3. Firestore rules

Deploy `backend/firestore.rules` to your Firebase project so that authors
can only modify their own activities.

## API

| Method | Path             | Purpose                                                                  |
| ------ | ---------------- | ------------------------------------------------------------------------ |
| GET    | `/api/health`    | Health check.                                                            |
| POST   | `/api/generate`  | Prompt → GeoGebra commands and viewport settings.                        |
| POST   | `/api/repair`    | Re-prompt Gemini to fix commands that GeoGebra failed to execute.        |
| POST   | `/api/tutor`     | Answer a student question, grounded in the current activity.             |
| POST   | `/api/describe`  | Generate a polished activity description from the construction.          |
| POST   | `/api/challenge` | Generate challenge questions tied to the construction.                   |

## Project layout

```
backend/
  index.js                  # Express app + API routes
  services/geminiService.js # Gemini prompt orchestration
  firestore.rules           # Author-only write rules
frontend/
  src/
    pages/                  # Home, Create, Activity, Activities, Leaderboard, SignIn, ...
    components/wizmath/     # Feature components (AskAISidebar, StarButton, AuthButton, ...)
    components/wizmath/hextech/  # Hextech UI kit
    lib/                    # firebase, activities, xp, leaderboard, userProfile, AuthContext
    api/                    # backend client
```
