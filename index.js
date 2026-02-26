const io = require("socket.io")(process.env.PORT || 3000, { cors: { origin: "*" } });

// Aapka Database (Minutes aur AppID store karne ke liye) [cite: 2026-02-24]
let infraRegistry = {
    "SHIV_786": { 
        secret: "MASTER_KEY", 
        totalMinutes: 10000, 
        activeUsers: 0,
        status: "Premium"
    }
};

io.on("connection", (socket) => {
    console.log("Infrastructure Node Connected:", socket.id);

    // AppID Validation (No Token Needed) [cite: 2026-02-25]
    socket.on("connect-to-infra", (data) => {
        const app = infraRegistry[data.appId];
        if(app && app.secret === data.serverSecret) {
            socket.join(data.appId);
            socket.emit("infra-connected", { 
                success: true, 
                minutesLeft: app.totalMinutes,
                provider: "Shiv Cloud"
            });
        }
    });

    // P2P Video Signaling (Full HD 1080p) [cite: 2026-02-25]
    socket.on("signal-exchange", (payload) => {
        io.to(payload.to).emit("receive-signal", {
            from: socket.id,
            signal: payload.signal
        });
    });

    // Minute Deducting & Gift Logic [cite: 2026-02-24, 2026-02-25]
    socket.on("call-duration-sync", ({ appId, secondsUsed }) => {
        if(infraRegistry[appId]) {
            infraRegistry[appId].totalMinutes -= (secondsUsed / 60);
            io.to(appId).emit("minutes-updated", infraRegistry[appId].totalMinutes);
        }
    });
});
            
