// ==========================
// ✅ Environment Config
// ==========================
const dotenv = require("dotenv");
dotenv.config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const helmet = require("helmet");
const fs = require("fs");
const http = require("http");
const { Server } = require("socket.io");

// ==========================
// ✅ Models
// ==========================
const Conversation = require("./models/Conversation");
const Message = require("./models/message");
const Status = require("./models/Status");

// ==========================
// ✅ Express + HTTP Server
// ==========================
const app = express();
const server = http.createServer(app);

// ==========================
// ✅ Allowed Origins (dynamic)
// ==========================
const allowedOrigins = [
  "https://let-connect-skt.vercel.app", // Production domain
  "https://let-connect-skt-66s3.vercel.app", // Preview domain
  "https://let-connect-o77rtmuo5-sanchari80s-projects.vercel.app" // Current preview domain
];

if (process.env.NODE_ENV === "development") {
  allowedOrigins.push(
    "http://localhost:3000",
    "http://localhost:3001",
    "http://192.168.0.104:3000",
    "http://192.168.0.104:3001"
  );
}

// ==========================
// ✅ Middleware
// ==========================
app.use(
  cors({
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);
app.use(express.json());
app.use(
  helmet({
    crossOriginResourcePolicy: false,
    contentSecurityPolicy: false,
  })
);

// ==========================
// ✅ Upload folder ensure
// ==========================
const uploadPath = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}
app.use("/uploads", express.static(uploadPath));

// ==========================
// ✅ MongoDB connect
// ==========================
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB error:", err.message));

// ==========================
// ✅ Default route
// ==========================
app.get("/", (req, res) => {
  res.json({ status: "LetConnect.SKT backend running" });
});

// ==========================
// ✅ API Routes
// ==========================
app.use("/api/auth", require("./routes/auth"));
app.use("/api/profile", require("./routes/profile"));
app.use("/api/cv", require("./routes/cv"));
app.use("/api/chat", require("./routes/chat"));
app.use("/api/message", require("./routes/message"));
app.use("/api/status", require("./routes/statusRoutes"));
app.use("/api/connect", require("./routes/connectRoutes"));
app.use("/api/conversation", require("./routes/conversation"));
app.use("/api/post", require("./routes/post"));

// 🔔 Notifications (user-specific + admin control)
app.use("/api/notifications", require("./routes/notification"));
app.use("/api/admin", require("./routes/adminControl"));

// 📢 Advertise system
app.use("/api/advertise", require("./routes/advertise"));

// ==========================
// ✅ Error handler
// ==========================
app.use((err, req, res, next) => {
  console.error("❌ Error:", err.stack);
  res.status(500).json({
    error: "Something went wrong on the server!",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
});

// ==========================
// ✅ Socket.io setup
// ==========================
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
  },
});
app.set("io", io);

io.on("connection", (socket) => {
  console.log("🔌 User connected:", socket.id);

  socket.on("joinRoom", (roomId) => {
    socket.join(roomId);
    console.log(`✅ Socket ${socket.id} joined room ${roomId}`);
  });

  socket.on("sendMessage", async (msg) => {
    try {
      let convo = await Conversation.findOne({
        participants: { $all: [msg.sender, msg.to] },
      });

      if (!convo) {
        convo = new Conversation({
          participants: [msg.sender, msg.to],
          status: "pending",
        });
        await convo.save();
        console.log("🕒 New conversation created, status pending...");
        return;
      }

      if (convo.status === "accepted") {
        const newMessage = new Message({
          conversationId: convo._id,
          sender: msg.sender,
          receiver: msg.to,
          text: msg.text,
        });
        await newMessage.save();

        io.to(convo._id.toString()).emit("receiveMessage", newMessage);
        console.log(`📩 Message sent in room ${convo._id}`);
      } else {
        console.log("🕒 Conversation not accepted yet, message pending...");
      }
    } catch (err) {
      console.error("❌ Socket error:", err.message);
      socket.emit("errorMessage", err.message);
    }
  });

  socket.on("disconnect", () => {
    console.log("❌ User disconnected:", socket.id);
  });
});

// ==========================
// ✅ Server start
// ==========================
const PORT = process.env.PORT || 4000;
server.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on port ${PORT}`);
});