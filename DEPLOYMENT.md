# Deployment Guide for OnboardHub 🚀

This repository is set up as a **Monorepo** containing both the Frontend (Next.js) and Backend (Express).

## 1. Deploy Frontend (Vercel)
Vercel is the best place to host the Next.js frontend.

1.  Go to [Vercel](https://vercel.com) and click **"Add New" > "Project"**.
2.  Import your GitHub Repository: `OnboardHub`.
3.  **Configure Project**:
    *   **Framework Preset**: Next.js (Automatic).
    *   **Root Directory**: Click "Edit" and select `frontend`.
4.  **Environment Variables**:
    *   Add `NEXT_PUBLIC_BACKEND_URL`.
    *   **Value**: Logic dictates you don't have this URL yet until you deploy the backend. You can deploy first, then come back and update this.
5.  Click **Deploy**.

## 2. Deploy Backend (Render / Railway)
Since the backend is a Node.js Express server, you need a host that runs persistent processes. [Render](https://render.com) has a free tier.

1.  Go to [Render Dashboard](https://dashboard.render.com).
2.  Click **"New +" -> "Web Service"**.
3.  Connect your GitHub Repository `OnboardHub`.
4.  **Configure**:
    *   **Root Directory**: `backend` (Important!)
    *   **Build Command**: `npm install`
    *   **Start Command**: `node server.js`
    *   **Instance Type**: Free
5.  **Environment Variables**:
    *   `GITHUB_TOKEN`: (Optional, but recommended for higher rate limits). Create one at GitHub Settings -> Developer Settings -> Personal Access Tokens.
6.  Click **Create Web Service**.

## 3. Connect Them
1.  Once Render finishes deploying, copy the URL (e.g., `https://onboardhub-backend.onrender.com`).
2.  Go back to your **Vercel Project Settings -> Environment Variables**.
3.  Add/Update `NEXT_PUBLIC_BACKEND_URL` with your Render URL (no trailing slash).
4.  **Redeploy** your Vercel project (Go to Deployments -> Redeploy) for the changes to take effect.

## Universal Link 🌐
Your application will be live at your Vercel URL (e.g., `https://onboardhub.vercel.app`).
