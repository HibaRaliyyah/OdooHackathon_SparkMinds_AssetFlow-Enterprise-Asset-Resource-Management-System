# Deployment Guide
## AssetFlow

## Backend — Render.com

1. Push backend to GitHub
2. Create new Web Service on Render
3. Build Command: `npm install && npm run build`
4. Start Command: `npm start`
5. Add environment variables from `.env.example`

## Frontend — Vercel

1. Push frontend to GitHub
2. Import project on Vercel
3. Framework: Vite
4. Build Command: `npm run build`
5. Output Directory: `dist`
6. Add `VITE_API_URL` environment variable

## Database — MongoDB Atlas

1. Create Atlas cluster (M0 free tier)
2. Create database user
3. Whitelist IP: `0.0.0.0/0` for cloud deployment
4. Get connection string and add to backend `.env`

## Environment Variables

### Backend `.env`
```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your-jwt-secret
JWT_REFRESH_SECRET=your-refresh-secret
JWT_EXPIRES_IN=7d
GMAIL_USER=your@gmail.com
GMAIL_PASS=your-app-password
OPENROUTER_API_KEY=sk-or-v1-...
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1
FRONTEND_URL=https://your-app.vercel.app
UPLOAD_DIR=uploads
MAX_FILE_SIZE=5242880
```

### Frontend `.env`
```env
VITE_API_URL=https://your-backend.onrender.com/api
VITE_APP_NAME=AssetFlow
```
