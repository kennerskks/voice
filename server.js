const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const path = require("path");

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

let clients = [];

wss.on("connection", (ws) => {
  console.log("New client connected");
  clients.push(ws);

  ws.on("message", (message) => {
    try {
      // broadcast ไปยัง client คนอื่น
      clients.forEach((client) => {
        if (client !== ws && client.readyState === WebSocket.OPEN) {
          client.send(message);
        }
      });
    } catch (error) {
      console.error("Error broadcasting message:", error);
    }
  });

  ws.on("close", () => {
    console.log("Client disconnected");
    clients = clients.filter((c) => c !== ws);
  });

  ws.on("error", (error) => {
    console.error("WebSocket error:", error);
    clients = clients.filter((c) => c !== ws);
  });
});

// Serve static files
app.use(express.static(path.join(__dirname, "public")));

// Health check endpoint for Render
app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK", clients: clients.length });
});

// Handle all routes - serve index.html
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});