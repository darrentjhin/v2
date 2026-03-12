# AI Live Tutor – MVP

A simple web app that lets you speak into your microphone, send the audio to a backend, and see a text response (mock for now) – like a private tutor session.

## What’s included

- **Frontend:** React + Vite – “Start Talking” button, microphone recording, send audio, show response.
- **Backend:** Node.js + Express – receives audio, returns a mock text response.

## Prerequisites

- Node.js 18+ (for `npm` and `--watch`)

## Setup

From the project root:

```bash
npm run install:all
```

This installs dependencies in the root, `server`, and `client` folders.

## Run the app

**Option 1 – Run both at once (recommended):**

```bash
npm run dev
```

This starts:

- Backend: http://localhost:3001  
- Frontend: http://localhost:5173  

**Option 2 – Run separately:**

- Terminal 1 (backend): `npm run dev:server`
- Terminal 2 (frontend): `npm run dev:client`

Then open http://localhost:5173 in your browser.

## How to use

1. Open http://localhost:5173.
2. Click **Start Talking** and allow microphone access.
3. Speak into the microphone.
4. Click **Stop & Send**.
5. The app sends the audio to the backend and shows the mock tutor response on screen.

## Project structure

```
ai-live-tutor/
├── client/                 # React + Vite frontend
│   ├── src/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   ├── index.css
│   │   └── components/
│   │       └── TutorInterface.jsx
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── server/                 # Node.js + Express backend
│   ├── index.js
│   └── package.json
├── package.json
└── README.md
```

## Next steps (when you’re ready)

- Replace the mock response in `server/index.js` with a real AI API (e.g. speech-to-text + LLM, or a voice API).
- Add real voice playback (text-to-speech) for the tutor response.
- Improve error handling and loading states.

## Notes

- The backend uses **multer** to accept audio as a file upload; the frontend sends the recording as `multipart/form-data`.
- Vite proxies `/api` to the backend in development, so the frontend can call `/api/tutor` without CORS issues.
