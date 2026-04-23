# 🚀 GramBazaar — Deployment Guide

Deploy the **GramBazaar** E-Commerce app using **Vercel** (frontend) and **Render** (backend) — both offer generous free tiers.

```
┌────────────────────────┐         ┌────────────────────────┐
│     VERCEL (Frontend)  │         │    RENDER (Backend)    │
│                        │         │                        │
│  React 19 + Vite 8     │──API──▶ │  Express.js API        │
│  Static SPA hosting    │         │  Auth · Products       │
│  Global CDN            │         │  Orders · Cart         │
│                        │         │  Payments · Admin      │
└────────────────────────┘         └────────────────────────┘
                                              │
                                   ┌──────────┼──────────┐
                                   ▼          ▼          ▼
                                Database  Cloudinary  Razorpay
```

---

## 📖 Table of Contents

1. [Prerequisites](#1-prerequisites)
2. [Prepare the Repository](#2-prepare-the-repository)
3. [Deploy Backend on Render](#3-deploy-backend-on-render)
4. [Deploy Frontend on Vercel](#4-deploy-frontend-on-vercel)
5. [Connect Frontend ↔ Backend](#5-connect-frontend--backend)
6. [Database Setup (MongoDB Atlas)](#6-database-setup-mongodb-atlas)
7. [Third-Party Services](#7-third-party-services)
8. [Post-Deployment Checklist](#8-post-deployment-checklist)
9. [Troubleshooting](#9-troubleshooting)
10. [Useful Commands](#10-useful-commands)

---

## 1. Prerequisites

| Requirement | Details |
|---|---|
| **Node.js** ≥ 18 | `node -v` to verify |
| **npm** ≥ 9 | `npm -v` to verify |
| **Git** | Code pushed to GitHub |
| **GitHub Account** | Both Vercel and Render connect via GitHub |
| **Vercel Account** | Free at [vercel.com](https://vercel.com) |
| **Render Account** | Free at [render.com](https://render.com) |

---

## 2. Prepare the Repository

### 2.1 Add `vercel.json` for SPA Routing

Create `client/vercel.json` so that client-side routes (like `/shop`, `/cart`) don't 404 on refresh:

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

### 2.2 Verify Environment Files

Make sure these example files exist (they do in your repo):

**`server/.env.example`**
```env
NODE_ENV=development
PORT=5000
CLIENT_URL=http://localhost:5173
```

**`client/.env.example`**
```env
VITE_API_BASE_URL=http://localhost:5000/api
```

### 2.3 Push Changes

```bash
git add .
git commit -m "chore: add vercel.json for SPA routing"
git push origin main
```

---

## 3. Deploy Backend on Render

> Deploy the backend **first** so you have a URL to give the frontend.

### Step 1 — Create a New Web Service

1. Go to [dashboard.render.com](https://dashboard.render.com)
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repo: `phulkeshwarmahto/E-Commerce`

### Step 2 — Configure Build Settings

| Setting | Value |
|---|---|
| **Name** | `grambazaar-api` (or any name you like) |
| **Region** | Choose the one closest to your users |
| **Branch** | `main` |
| **Root Directory** | `server` |
| **Runtime** | `Node` |
| **Build Command** | `npm install` |
| **Start Command** | `npm run start` |
| **Instance Type** | `Free` |

### Step 3 — Add Environment Variables

In the Render dashboard, go to **Environment** tab and add:

| Key | Value |
|---|---|
| `NODE_ENV` | `production` |
| `PORT` | `5000` |
| `CLIENT_URL` | *(leave blank for now — you'll update after deploying the frontend)* |

> Add database, Cloudinary, Razorpay, and JWT keys here too when ready (see [Section 6](#6-database-setup-mongodb-atlas) & [Section 7](#7-third-party-services)).

### Step 4 — Deploy

Click **"Create Web Service"**. Render will:
1. Clone your repo
2. Run `npm install` in the `server/` directory
3. Start the server with `node server.js`

### Step 5 — Verify

Once deployed, Render gives you a URL like:

```
https://grambazaar-api.onrender.com
```

Test the health endpoint:

```bash
curl https://grambazaar-api.onrender.com/api/health
```

Expected response:
```json
{ "success": true, "message": "GramBazaar API is running." }
```

✅ **Save this URL** — you'll need it for the frontend.

---

## 4. Deploy Frontend on Vercel

### Step 1 — Import Project

1. Go to [vercel.com/new](https://vercel.com/new)
2. Click **"Import"** next to your GitHub repo: `phulkeshwarmahto/E-Commerce`

### Step 2 — Configure Build Settings

| Setting | Value |
|---|---|
| **Framework Preset** | `Vite` |
| **Root Directory** | `client` ← Click **"Edit"** and type `client` |
| **Build Command** | `npm run build` |
| **Output Directory** | `dist` |
| **Install Command** | `npm install` |

### Step 3 — Add Environment Variable

| Key | Value |
|---|---|
| `VITE_API_BASE_URL` | `https://grambazaar-api.onrender.com/api` |

> ⚠️ Replace with your **actual Render URL** from Step 3 above. Include `/api` at the end.

### Step 4 — Deploy

Click **"Deploy"**. Vercel will:
1. Install dependencies in `client/`
2. Run `vite build`
3. Deploy the `dist/` output to its global CDN

Your frontend URL will look like:

```
https://grambazaar.vercel.app
```

✅ **Save this URL** — you need it for the next step.

---

## 5. Connect Frontend ↔ Backend

Now that both are deployed, link them together:

### 5.1 Update Render (Backend)

Go to your Render service → **Environment** → update:

| Key | Value |
|---|---|
| `CLIENT_URL` | `https://grambazaar.vercel.app` |

> This configures CORS so the frontend can call the API. **No trailing slash.**

Click **"Save Changes"** — Render will auto-redeploy.

### 5.2 Verify the Connection

1. Open your Vercel frontend URL in a browser
2. Open DevTools → **Network** tab
3. Navigate around the app — API calls should go to your Render backend
4. Check for any CORS errors in the **Console** tab

If everything works, you're live! 🎉

---

## 6. Database Setup (MongoDB Atlas)

The project currently uses an in-memory mock data store. To connect a real database:

### Step 1 — Create a Free Cluster

1. Go to [mongodb.com/atlas](https://www.mongodb.com/atlas)
2. Sign up → Create a **free shared cluster**
3. Set up a **database user** (username + password)
4. Under **Network Access**, add `0.0.0.0/0` to allow connections from Render

### Step 2 — Get Connection String

Go to **Database** → **Connect** → **Drivers** → Copy the connection string:

```
mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/grambazaar?retryWrites=true&w=majority
```

### Step 3 — Add to Render Environment

| Key | Value |
|---|---|
| `DATABASE_URL` | `mongodb+srv://user:pass@cluster0.xxxxx.mongodb.net/grambazaar?retryWrites=true&w=majority` |

### Step 4 — Update `server/config/db.js`

Replace the mock implementation:

```js
import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.DATABASE_URL);
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  }
};
```

> Don't forget to install mongoose: `npm install mongoose --prefix server`

---

## 7. Third-Party Services

### Cloudinary (Image Uploads)

1. Sign up at [cloudinary.com](https://cloudinary.com)
2. From the dashboard, copy your credentials
3. Add to **Render environment variables**:

   | Key | Value |
   |---|---|
   | `CLOUDINARY_CLOUD_NAME` | `your_cloud_name` |
   | `CLOUDINARY_API_KEY` | `your_api_key` |
   | `CLOUDINARY_API_SECRET` | `your_api_secret` |

4. Update `server/config/cloudinary.js`:

   ```js
   import { v2 as cloudinary } from "cloudinary";

   cloudinary.config({
     cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
     api_key: process.env.CLOUDINARY_API_KEY,
     api_secret: process.env.CLOUDINARY_API_SECRET,
   });

   export { cloudinary };
   ```

   > Install the SDK: `npm install cloudinary --prefix server`

### Razorpay (Payments)

1. Sign up at [razorpay.com](https://razorpay.com)
2. Get API keys (use **Test Mode** keys first)
3. Add to **Render environment variables**:

   | Key | Value |
   |---|---|
   | `RAZORPAY_KEY_ID` | `rzp_test_xxxxxxxx` |
   | `RAZORPAY_KEY_SECRET` | `your_key_secret` |

4. Update `server/config/razorpay.js`:

   ```js
   import Razorpay from "razorpay";

   export const razorpay = new Razorpay({
     key_id: process.env.RAZORPAY_KEY_ID,
     key_secret: process.env.RAZORPAY_KEY_SECRET,
   });
   ```

   > Install the SDK: `npm install razorpay --prefix server`

---

## 8. Post-Deployment Checklist

Run through this after deploying:

| # | Check | How to Verify |
|---|---|---|
| 1 | ✅ Health check | `curl https://your-api.onrender.com/api/health` |
| 2 | ✅ Frontend loads | Open Vercel URL in browser |
| 3 | ✅ API connectivity | Check Network tab in DevTools — no failed requests |
| 4 | ✅ No CORS errors | Check Console tab in DevTools |
| 5 | ✅ SPA routing works | Navigate to `/shop` directly — should not 404 |
| 6 | ✅ HTTPS active | Both URLs should be `https://` |
| 7 | ✅ Auth flow | Register → Login → Access protected routes |
| 8 | ✅ Image uploads | Upload a product image (requires Cloudinary) |
| 9 | ✅ Payment flow | Test payment with Razorpay test keys |
| 10 | ✅ Seed data loaded | Run seeders if needed |
| 11 | ✅ Rate limiting active | Rapid-fire requests should be throttled |
| 12 | ✅ Error handling | Visit `/api/nonexistent` — should return a proper error |

---

## 9. Troubleshooting

### ❌ CORS Error

```
Access to fetch has been blocked by CORS policy
```

**Cause:** `CLIENT_URL` on Render doesn't match your Vercel URL.

**Fix:**
- Go to Render → Environment → set `CLIENT_URL` to your **exact** Vercel URL
- No trailing slash: `https://grambazaar.vercel.app` ✅
- With trailing slash: `https://grambazaar.vercel.app/` ❌

---

### ❌ 404 on Page Refresh

**Cause:** Vercel doesn't know about client-side routes like `/shop`.

**Fix:** Make sure `client/vercel.json` exists with:
```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

---

### ❌ Environment Variables Not Working (Client)

**Cause:** Vite inlines `VITE_*` variables at **build time**, not runtime.

**Fix:** After changing any `VITE_*` variable on Vercel, trigger a **redeploy**:
- Go to Vercel dashboard → Deployments → click **"Redeploy"**

---

### ❌ Render Free Tier Cold Starts (~30s delay)

**Cause:** Render spins down free-tier services after 15 min of inactivity.

**Fix (free workaround):** Use [cron-job.org](https://cron-job.org) to ping your health endpoint every 14 minutes:
- URL: `https://your-api.onrender.com/api/health`
- Interval: Every 14 minutes

**Fix (paid):** Upgrade to Render's **Starter** plan ($7/month) — always-on instances.

---

### ❌ Build Fails on Vercel

**Common causes:**
1. **Root directory not set** → Make sure it's `client`
2. **Missing dependencies** → Run `npm install` locally and push the updated `package-lock.json`
3. **Lint errors blocking build** → Fix ESLint errors or add `CI=` to the build command:
   ```
   CI= npm run build
   ```

---

### ❌ Build Fails on Render

**Common causes:**
1. **Root directory not set** → Make sure it's `server`
2. **Wrong Node version** → Add a `NODE_VERSION` env var set to `18` or higher
3. **Missing `.env` values** → Check that all required env vars are set in the dashboard

---

### ❌ Port Issues on Render

**Cause:** Render assigns its own port via the `PORT` env var.

**Fix:** The server already reads `process.env.PORT`, so this should work automatically. Just make sure you're **not** hardcoding a port.

---

## 10. Useful Commands

| Command | Description |
|---|---|
| `npm run dev` | Start both client & server locally |
| `npm run build` | Build client for production |
| `npm run start` | Start server in production mode |
| `npm run seed:products --prefix server` | Seed product data |
| `npm run seed:users --prefix server` | Seed user data |
| `npm run seed:all --prefix server` | Seed all data |
| `npm run seed:clear --prefix server` | Clear all seed data |
| `npm run lint --prefix client` | Lint client code |
| `npm run preview --prefix client` | Preview production build locally |

---

<p align="center">Made with ❤️ for <strong>GramBazaar</strong></p>
