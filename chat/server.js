const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

const server = http.createServer(app);
app.use(cors({
  origin: 'http://127.0.0.1:5500',
  credentials: true
}));

const io = new Server(server, {
  cors: {
    origin: 'http://127.0.0.1:5500',
    credentials: true
  }
});

// Mock Database Storage
//const users = {}; // phone -> password
const messages = {}; // roomName -> [msgObj, ...]
//const friendsList = {}; // phone -> [friendPhone, ...]

const users = {
  "13800000000": "123456" // Default mock user (Phone: 13800000000, Pass: 123456)
};

const friendsList = {
  "13800000000": [
    "A 啊海",
    "G 公司营业执照办理1",
    "G 公司营业执照办理2",
    "J 健康无价"
  ]
};

// --- REST API Endpoints ---
app.post('/api/login', (req, res) => {
  const { phone, password } = req.body;
  if (!users[phone]) {
    return res.status(400).json({ message: '用户不存在' });
  }
  if (users[phone] !== password) {
    return res.status(400).json({ message: '密码错误' });
  }
  res.json({
    accessToken: 'mock-token-' + phone,
    phone,
    friends: friendsList[phone] || []
  });
});

app.post('/api/register', (req, res) => {
  const { phone, password } = req.body;
  if (!phone || !password) return res.status(400).json({ message: '手机号和密码不能为空' });
  if (users[phone]) return res.status(400).json({ message: '手机号已被注册' });
  
  users[phone] = password;
  friendsList[phone] = [];
  res.json({ message: '注册成功' });
});

app.get('/api/chat-history', (req, res) => {
  const room = req.query.room;
  res.json(messages[room] || []);
});

// --- Socket.io Real-Time Messaging ---
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  socket.on('join room', (room) => {
    socket.join(room);
    console.log(`Socket ${socket.id} joined room: ${room}`);
  });

  socket.on('leave room', (room) => {
    socket.leave(room);
  });

  socket.on('chat message', (data) => {
    const { room, text, clientTimestamp } = data;
    // Find sender from socket or token (simplified to mock sender)
    const msg = {
      sender: '13800000000', // Replace with verified token user in production
      text,
      timestamp: clientTimestamp || Date.now()
    };

    if (!messages[room]) messages[room] = [];
    messages[room].push(msg);

    // Broadcast to everyone in the room including sender
    io.to(room).emit('chat message', msg);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});