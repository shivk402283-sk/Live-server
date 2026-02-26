const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const app = express();
const server = http.createServer(app);
const io = new Server(server, { 
    cors: { origin: "*" },
    transports: ['websocket'], // Fast speed ke liye only websocket
    maxHttpBufferSize: 1e8 // Large data/gift handle karne ke liye
});

// Database on Server (Memory-efficient for 4000 users)
let activeUsers = new Map();
let waitingQueue = [];
let serverLogs = []; // Call & Chat History

io.on('connection', (socket) => {
    socket.on('join-shiv-network', (user) => {
        activeUsers.set(socket.id, { ...user, status: 'idle' });
        
        // Matchmaking Logic (Ultra Fast)
        if (waitingQueue.length > 0) {
            let partner = waitingQueue.shift();
            const room = `HD_ROOM_${socket.id}_${partner.id}`;
            
            // Call History Record
            serverLogs.push({ type: 'CALL', users: [user.name, partner.name], time: new Date() });
            
            io.to(socket.id).emit('match-ready', { partnerId: partner.id, room, role: 'caller' });
            io.to(partner.id).emit('match-ready', { partnerId: socket.id, room, role: 'receiver' });
        } else {
            waitingQueue.push({ id: socket.id, name: user.name });
        }
    });

    // Chat & History Logic (Server-side)
    socket.on('message', (data) => {
        const msgLog = { from: data.from, msg: data.msg, time: new Date() };
        serverLogs.push({ type: 'CHAT', ...msgLog });
        io.to(data.to).emit('message-receive', msgLog);
    });

    // Gift Logic with Animation Trigger
    socket.on('send-gift', (data) => {
        io.to(data.to).emit('animate-gift', { type: data.giftType });
    });

    socket.on('disconnect', () => {
        activeUsers.delete(socket.id);
        waitingQueue = waitingQueue.filter(u => u.id !== socket.id);
    });
});

server.listen(process.env.PORT || 10000, () => console.log('🚀 Shiv HD Enterprise Server Live'));

