# LlamaChat — AI Chat Bot (Gemini + Clerk + ImageKit)

A full-stack AI chat application built with:

- **Frontend:** React (Vite)
- **Backend:** Express + MongoDB (Mongoose)
- **Auth:** Clerk
- **AI:** Google Gemini
- **Images:** ImageKit (upload + image serving)
- **UI/UX:** React Router + TanStack Query + React Markdown

Users can create chats, ask questions, and optionally attach images. Chat history is stored in MongoDB per user.

---

## Features

- User authentication via **Clerk**
- Create and manage multiple chat sessions
- Persist chat history in **MongoDB**
- Stream Gemini responses on the client
- Upload images through **ImageKit** and include them in chat context
- Render chat messages with **React Markdown**

---

## Tech Stack

- **Client:** React, Vite, React Router, TanStack Query, React Markdown, @imagekit/react
- **Server:** Express, Mongoose, Clerk middleware, ImageKit SDK
- **AI:** `@google/genai` (Gemini)

---

## Project Structure

```txt
LlamaChat/
  backend/
    index.js
    models/
  client/
    src/
      lib/gemini.js
      routes/
      components/
```

---

## Prerequisites

- Node.js (LTS recommended)
- MongoDB (local or hosted)
- Clerk account (publishable + secret keys)
- Gemini API key
- ImageKit account (endpoint + keys)

---

## Environment Variables

### Backend (`backend/.env`)

Create a file named `backend/.env`:

```env
PORT=3000
CLIENT_URL=http://localhost:5173

MONGO=your_mongodb_connection_string

# Clerk (used by @clerk/express)
CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key

# ImageKit
IMAGE_KIT_ENDPOINT=your_imagekit_url_endpoint
IMAGE_KIT_PUBLIC_KEY=your_imagekit_public_key
IMAGE_KIT_PRIVATE_KEY=your_imagekit_private_key
```

> Notes:
>
> - `CLIENT_URL` must match your frontend origin.
> - Backend uses `@clerk/express`’s `clerkMiddleware()` and `getAuth()`.

### Frontend (`client/.env`)

Create a file named `client/.env`:

```env
VITE_API_URL=http://localhost:3000

VITE_GEMINI_PUBLIC_KEY=your_gemini_api_key

VITE_IMAGE_KIT_ENDPOINT=your_imagekit_url_endpoint
VITE_IMAGE_KIT_PUBLIC_KEY=your_imagekit_public_key
```

---

## Setup & Run Locally

### 1) Backend

```bash
cd backend
npm install
npm run start
```

### 2) Frontend

Open a new terminal:

```bash
cd client
npm install
npm run dev
```

Then open the frontend URL shown by Vite (typically `http://localhost:5173`).

---

## API Reference (Backend)

### Create a new chat

- **POST** `/api/chats`
- Body:
  ```json
  { "text": "Your first chat message" }
  ```
- Uses Clerk auth to associate the chat with the current user.

### Get a user’s chat list

- **GET** `/api/userchats`
- Returns an array of `{ _id, title, createdAt }`

### Get chat details by id

- **GET** `/api/chats/:id`
- Returns `{ history: [...] }` with roles `user` and `model`

### Append question + answer to an existing chat

- **PUT** `/api/chats/:id`
- Body:
  ```json
  {
    "question": "user text (optional in some flows)",
    "ans": "model response text",
    "img": "optional image path from ImageKit"
  }
  ```

---

## Image Upload Flow (ImageKit)

1. Client requests auth params from the backend:
   - **GET** `/api/upload`
2. Client uploads the image directly using `@imagekit/react`
3. Image path is stored along with the chat message
4. Chat renders attached images using the ImageKit endpoint

---

## Deployment Notes

- Ensure `CLIENT_URL` matches your production frontend domain.
- Update `VITE_API_URL` to point to your deployed backend.
- Store secrets only in server environment variables (`backend/.env`)—do not commit them.

---

## Security / Privacy

- Chat history is stored per authenticated user in MongoDB.
- This app integrates external services (Clerk, Gemini, ImageKit). Use appropriate account controls and data policies.

---

## License

Add your license here (e.g., MIT).
