# WebChat Messenger setup

The messenger uses MongoDB for permanent history, Socket.IO for live chat and ringing, and LiveKit for call media.

Durable actions use authenticated REST APIs:

- `POST /api/messages/:conversationId` sends and stores a message.
- `PUT /api/messages/:conversationId/read` records read receipts.
- `POST /api/calls` starts a call.
- `PATCH /api/calls/:callId/respond` accepts or rejects a call.
- `PATCH /api/calls/:callId/end` ends a call.
- `POST /api/calls/:callId/token` creates a short-lived LiveKit participant token.

Socket.IO only delivers realtime notifications, presence, and typing state. This means messages still save successfully during a temporary socket reconnection.

## Local configuration

1. Copy `backend/.env.example` to `backend/.env` and keep your existing MongoDB and JWT values.
2. Add a LiveKit project URL, API key, and API secret to `backend/.env`.
3. Optionally copy `frontend/.env.example` to `frontend/.env` when using non-default local URLs.
4. Start the backend with `npm run dev` inside `backend`.
5. Start the frontend with `npm run dev` inside `frontend`.
6. Register two accounts and open `/messages` in two browser profiles to test live messaging and calls.

Never put `LIVEKIT_API_SECRET` in the frontend environment. The browser receives a short-lived participant token from the protected backend endpoint instead.

## Production configuration

Set these backend environment variables in the hosting dashboard:

- `MONGODB_URI`
- `JWT_SECRET`
- `FRONTEND_URL`
- `LIVEKIT_URL`
- `LIVEKIT_API_KEY`
- `LIVEKIT_API_SECRET`

Set `VITE_API_URL` and `VITE_SOCKET_URL` in the frontend deployment if the backend is hosted separately. Both frontend and backend must use HTTPS/WSS in production for camera and microphone access.
