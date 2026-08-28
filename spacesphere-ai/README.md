# SpaceSphere AI — Orbit Chatbot (Full Stack)

A Java Spring Boot backend + React frontend for the Orbit space-research chatbot,
covering ISRO, DRDO, NASA, the full history of space research, and study/career paths,
plus live NASA data (APOD, Near-Earth Objects, DONKI space weather).

## How it's connected

```
React (5173)  --/api/*-->  Vite dev proxy  -->  Spring Boot (8080)  -->  Anthropic API
                                                                     -->  NASA Open APIs
```

The frontend never talks to Anthropic or NASA directly — it only calls your own backend
at `/api/...`. The backend holds the real API keys (as environment variables, never in
code or in the browser) and makes the external calls server-side. This also fixes CORS:
server-to-server calls to `api.nasa.gov` aren't blocked the way a direct browser call is.

## 1. Backend setup

Requirements: Java 17+, Maven.

```bash
cd backend

# Set your keys as environment variables (do NOT hardcode them)
export ANTHROPIC_API_KEY=sk-ant-xxxxxxxx
export NASA_API_KEY=your_nasa_key      # optional — defaults to DEMO_KEY (rate-limited)

mvn spring-boot:run
```

Backend runs at `http://localhost:8080`.

Endpoints:
- `POST /api/chat/message` — body `{ "message": "...", "history": [...] }` → `{ "reply": "..." }`
- `GET  /api/nasa/apod` — today's Astronomy Picture of the Day
- `GET  /api/nasa/neo` — near-Earth objects with a close approach today
- `GET  /api/nasa/donki?days=7` — space weather notifications from the last N days

## 2. Frontend setup

Requirements: Node.js 18+.

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at `http://localhost:5173` and proxies `/api` calls to the backend
automatically (see `vite.config.js`).

## 3. Get a NASA API key (optional but recommended)

`DEMO_KEY` works out of the box but is rate-limited (~30 requests/hour). Get a free key
in seconds at https://api.nasa.gov and set it as `NASA_API_KEY`.

## 4. Production notes

- Never expose `ANTHROPIC_API_KEY` or a real `NASA_API_KEY` to the browser — they only
  ever live in the backend's environment.
- For production, build the frontend (`npm run build`) and either serve the static files
  from Spring Boot's `src/main/resources/static`, or host them separately and update
  `app.cors.allowed-origins` in `application.properties` to match your deployed frontend URL.
- Consider adding rate limiting and authentication (per your project brief's Security
  section) before deploying publicly.
