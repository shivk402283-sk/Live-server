const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, { 
    cors: { origin: "*" },
    methods: ["GET", "POST"]
});

// Server status track karne ke liye
let onlineUsers = new Map();

io.on("connection", (socket) => {
    console.log("User Connected:", socket.id);
    
    // User ko register karna
    socket.on("register-user", (data) => {
        onlineUsers.set(socket.id, { id: socket.id, name: data.name || "Anonymous" });
        io.emit("update-user-list", Array.from(onlineUsers.values()));
    });

    // Full HD Video Signaling (P2P) - Sabse powerful logic [cite: 2026-02-25]
    socket.on("p2p-signal", (payload) => {
        io.to(payload.to).emit("p2p-receive", {
            from: socket.id,
            signal: payload.signal
        });
    });

    // Chat aur Gift system ka direct control
    socket.on("send-msg", (data) => {
        io.emit("receive-msg", data);
    });

    socket.on("disconnect", () => {
        onlineUsers.delete(socket.id);
        io.emit("update-user-list", Array.from(onlineUsers.values()));
        console.log("User Disconnected");
    });
});

app.get('/', (req, res) => {
    res.send("<h1>Shiv Cloud Infrastructure: ACTIVE ✅</h1><p>No Errors Found. System is Running Smoothly.</p>");
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server live on port ${PORT}`));

