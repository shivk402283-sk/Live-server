const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());

const server = http.createServer(app);

// High-Speed Socket Configuration
const io = new Server(server, { 
    cors: { origin: "*", methods: ["GET", "POST"] },
    pingTimeout: 60000, // Connection fast rakhne ke liye
});

let waitingUsers = []; // Fast Queue

io.on('connection', (socket) => {
    console.log('User Online:', socket.id);

    // 1. TURBO VIDEO CALLING (Match 2 people instantly)
    socket.on('join-room', () => {
        if (waitingUsers.length > 0) {
            const partner = waitingUsers.shift();
            const roomId = `HD_ROOM_${socket.id}_${partner.id}`;
            
            socket.join(roomId);
            partner.join(roomId);

            // Send HD Peer Signals
            io.to(socket.id).emit('start-call', { roomId, partnerId: partner.id, role: 'caller' });
            io.to(partner.id).emit('start-call', { roomId, partnerId: socket.id, role: 'receiver' });
        } else {
            waitingUsers.push(socket);
        }
    });

    // 2. PROFESSIONAL GIFT SYSTEM (Real-time trigger)
    socket.on('send-gift', (giftData) => {
        // giftData: { roomId, giftType, senderName, animationEffect }
        io.to(giftData.roomId).emit('gift-received', giftData);
    });

    // WEBRTC HD SIGNALING (The core of high-quality video)
    socket.on('signal', (data) => {
        io.to(data.to).emit('signal', { 
            from: socket.id, 
            signal: data.signal 
        });
    });

    socket.on('disconnect', () => {
        waitingUsers = waitingUsers.filter(u => u.id !== socket.id);
    });
});

// Server Setup
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
    console.log(`🚀 Professional HD Server Running on Port ${PORT}`);
});
