const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const compression = require('compression');
const helmet = require('helmet');

const app = express();

// Professional Logic: Speed & Security Middlewares
app.use(helmet()); // DDoS aur attacks se bachane ke liye
app.use(compression()); // 4000+ users ke bandwidth load ko kam karne ke liye
app.use(cors({ origin: "*" }));

const server = http.createServer(app);

// ENTERPRISE GRADE CONFIGURATION (Logic for 4000+ Concurrent Users)
const io = new Server(server, {
    cors: { origin: "*", methods: ["GET", "POST"] },
    pingTimeout: 60000, // Connection stability logic
    pingInterval: 25000,
    connectTimeout: 60000,
    transports: ['websocket'], // Sirf fast websocket use hoga
    maxHttpBufferSize: 1e8 // 100MB buffer for heavy traffic/gifts
});

// High-Speed Matching Queue using 'Set' for O(1) performance
let waitingQueue = new Set(); 

io.on('connection', (socket) => {
    console.log('User Active:', socket.id);

    // 1. TURBO MATCHING LOGIC (HD Video Ready)
    socket.on('join-room', () => {
        if (waitingQueue.size > 0) {
            const partnerSocketId = waitingQueue.values().next().value;
            waitingQueue.delete(partnerSocketId);
            
            const roomId = `HD_PRO_${socket.id}_${partnerSocketId}`;
            
            socket.join(roomId);
            const partnerSocket = io.sockets.sockets.get(partnerSocketId);
            if(partnerSocket) partnerSocket.join(roomId);

            // Signal for 50-50 Video Split
            io.to(socket.id).emit('start-call', { roomId, partnerId: partnerSocketId, role: 'caller' });
            io.to(partnerSocketId).emit('start-call', { roomId, partnerId: socket.id, role: 'receiver' });
        } else {
            waitingQueue.add(socket.id);
        }
    });

    // 2. PROFESSIONAL GIFTING SYSTEM (Instant Trigger)
    socket.on('send-gift', (gift) => {
        if (gift.roomId) {
            // Logic to broadcast gift to both users instantly
            io.to(gift.roomId).emit('gift-received', {
                sender: gift.senderId,
                type: gift.type,
                value: gift.value,
                timestamp: Date.now()
            });
        }
    });

    // 3. HD WEBRTC SIGNALING LOGIC (Zero Compression Pipeline)
    socket.on('signal', (data) => {
        if (data.to) {
            io.to(data.to).emit('signal', { 
                from: socket.id, 
                signal: data.signal 
            });
        }
    });

    socket.on('disconnect', () => {
        waitingQueue.delete(socket.id);
        console.log('User Offline');
    });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => console.log(`✅ Enterprise Server Live on Port ${PORT}`));

