# Quick Deploy Script

## Deploy to Railway via CLI

### 1. Install Railway CLI
```bash
npm install -g @railway/cli
```

### 2. Login
```bash
railway login
```

### 3. Deploy
```bash
cd backend-socketio/
railway init
railway up
```

### 4. Get URL
```bash
railway domain
```

Done! Copy the URL and use it in Android apps.

## Alternative: Deploy via Web

1. Go to https://railway.app/new
2. "Deploy from GitHub repo"
3. Connect this repository
4. Railway auto-deploys
5. Generate domain and copy URL

## Test Backend

```bash
curl https://YOUR-RAILWAY-URL.railway.app/
```

Should return:
```json
{
  "status": "online",
  "devices": 0,
  "dashboards": 0,
  "photos": 0,
  "uptime": 123
}
```
