# Heygen STT Demo (Next.js)

This project demonstrates how to use **Heygen’s real-time Speech-to-Text (STT)** service with a Next.js app. It securely fetches a temporary streaming token from Heygen using your API key, starts a live STT session, and displays transcribed text instantly as you speak into your microphone.

No extra keys or third-party STT providers are required — only your **Heygen API key**.

---

## ✨ Features

* Secure server-side handling of the Heygen API key
* Client-side demo page with “Start Listening” and “Stop Listening” buttons
* Real-time transcription of your speech into text
* Simple UI built with React + Next.js App Router

---

## ⚙️ Installation

Clone this repository and install dependencies:

```bash
git clone https://github.com/mesepith/heygen-stt-app.git
cd heygen-stt-app
npm install
```

---

## 🔑 Environment Variables

Next.js uses `.env.local` to store secrets. Create a file named **`.env.local`** in the root of your project (same level as `package.json`).

Add the following variables:

```env
HEYGEN_API_KEY=your_heygen_api_key_here
NEXT_PUBLIC_BASE_API_URL=https://api.heygen.com
```

* `HEYGEN_API_KEY` → Your **secret Heygen API key** (never expose this in frontend code).
* `NEXT_PUBLIC_BASE_API_URL` → Defaults to Heygen’s API base. Keep as-is unless you’re testing against a different endpoint.

---

## 🚀 Running the Project

Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

You’ll see a simple UI where you can:

* Click **Start Listening** → Begin recording and live transcription.
* Click **Stop Listening** → End the session and free resources.

---

## 📂 Project Structure

```
app/
 ├─ api/
 │   └─ get-access-token/
 │       └─ route.ts   # Secure server route to fetch Heygen token
 ├─ page.tsx           # Frontend page with STT demo UI
.env.local             # Your Heygen API key
```

---

## 📝 Notes

* The API key is **never exposed to the frontend**. It stays on the server route (`/api/get-access-token`).
* The frontend requests a short-lived token from your server, which is then used by the Heygen SDK.
* By default, STT is configured to use **Deepgram** as provider with **Hindi (`hi`)** language. You can change the `sttConfiguration` in `page.tsx`.
