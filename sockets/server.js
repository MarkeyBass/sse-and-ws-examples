import { WebSocketServer } from 'ws';

// Simple WebSocket chat server
const PORT = 4000;

const wss = new WebSocketServer({ port: PORT });
const clients = new Set();

wss.on('connection', (socket) => {
  clients.add(socket);
  console.log('Client connected. Total:', clients.size);

  socket.on('message', (data) => {
    const msg = data.toString();
    console.log('Received:', msg);

    // Broadcast message to all other connected clients
    for (const client of clients) {
      if (client !== socket && client.readyState === client.OPEN) {
        client.send(msg);
      }
    }
  });

  socket.on('close', () => {
    clients.delete(socket);
    console.log('Client disconnected. Total:', clients.size);
  });
});

console.log(`WebSocket server listening on ws://localhost:${PORT}`);


