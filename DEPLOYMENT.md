# Deploying OnboardHub

Since OnboardHub has both a **Frontend** (Next.js) and a **Backend** (Node.js/Express), you need to deploy them separately.

## Prerequisites
1.  **GitHub Account**: You must push this project to a GitHub Repository.
2.  **Vercel Account** (Free): For hosting the Frontend.
3.  **Render/Railway Account** (Free): For hosting the Backend.

---

## Step 1: Push to GitHub
1.  Initialize git in the project root:
    ```bash
    git init
    git add .
    git commit -m "Initial commit"
    ```
2.  Create a new repository on GitHub.
3.  Link and push:
    ```bash
    git remote add origin https://github.com/YOUR_USERNAME/OnboardHub.git
    git push -u origin main
    ```

---

## Step 2: Deploy Backend (Render.com)
The backend needs to be alive for the frontend to fetch data.

1.  Log in to [Render](https://render.com/).
2.  Click **New +** -> **Web Service**.
3.  Connect your GitHub repository.
4.  **Settings**:
    *   **Root Directory**: `backend`
    *   **Build Command**: `npm install`
    *   **Start Command**: `node server.js`
5.  Click **Deploy**.
6.  **Copy the URL** provided by Render (e.g., `https://onboardhub-backend.onrender.com`).

---

## Step 3: Configure Frontend
You need to tell the Frontend where the Backend lives.

1.  Open `frontend/app/dashboard/page.tsx` (and `frontend/services/api.ts` if you made one).
2.  Replace `http://localhost:5000` with your new **Render Backend URL**.
    *   *Tip: It's better to use an Environment Variable for this.*
3.  Commit and push the change to GitHub:
    ```bash
    git add .
    git commit -m "Update backend URL"
    git push
    ```

---

## Step 4: Deploy Frontend (Vercel)
1.  Log in to [Vercel](https://vercel.com/).
2.  Click **Add New...** -> **Project**.
3.  Import your `OnboardHub` repository.
4.  **Settings**:
    *   **Framework Preset**: Next.js (should auto-detect).
    *   **Root Directory**: `frontend` (Click 'Edit' and select the `frontend` folder).
5.  Click **Deploy**.

🎉 **Done!** Vercel will give you a public URL (e.g., `https://onboardhub.vercel.app`) that you can share with anyone!
