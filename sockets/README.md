## WebSocket Terminal Chat Demo

This folder shows how to build a **two‑way** chat using WebSockets between two terminal clients (`user1` and `user2`) and a single WebSocket server.

Unlike SSE (which is one‑way: server ➜ client), **WebSockets are full‑duplex**:
- Clients can send messages to the server.
- The server can send messages to any connected client at any time.

---

### Files in this folder

- **`package.json`**: Node project config, sets `"type": "module"` and adds the `ws` dependency.
- **`server.js`**: WebSocket server that listens on `ws://localhost:4000` and broadcasts messages between clients.
- **`readline.js`**: Helper to read lines from the terminal using Node’s `readline` module.
- **`user1.js`**: WebSocket client representing user 1; reads terminal input and sends it to the server.
- **`user2.js`**: WebSocket client representing user 2; same idea as `user1` but with a different prompt.

---

### Concept: How this WebSocket chat works

1. **Server** listens on port `4000` using the `ws` library:
   - Keeps track of all connected sockets in a `Set`.
   - On `message`, it broadcasts the data to all other connected clients.
2. **Clients (user1 / user2)**:
   - Connect to `ws://localhost:4000`.
   - Use `readline` to read text from the terminal.
   - Wrap each line with a label (`user1: ...` or `user2: ...`) and send it to the server.
   - Print any received messages from other users.

This gives you a simple multi‑user chat between terminal windows.

---

### Server code syntax (`server.js`)

- **Create a WebSocket server**:

```javascript
import { WebSocketServer } from 'ws';

const PORT = 4000;
const wss = new WebSocketServer({ port: PORT });
const clients = new Set();
```

- **Handle new connections**:

```javascript
wss.on('connection', (socket) => {
  clients.add(socket);
  console.log('Client connected. Total:', clients.size);

  socket.on('message', (data) => {
    const msg = data.toString();
    console.log('Received:', msg);

    // broadcast to all other clients
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
```

- **WebSocket states**: Each WebSocket connection has a `readyState` property that indicates its current state:
  - `CONNECTING` (0) - Connection is being established
  - `OPEN` (1) - Connection is open and ready to send/receive data
  - `CLOSING` (2) - Connection is in the process of closing
  - `CLOSED` (3) - Connection is closed

  In the broadcast loop, we check `client.readyState === client.OPEN` to ensure we only send messages to connections that are actually open and ready. This prevents errors from trying to send to closing or closed connections.

---

### Client code syntax (`user1.js` / `user2.js`)

- **Connect to the WebSocket server**:

```javascript
import WebSocket from 'ws';
import { createInput } from './readline.js';

const ws = new WebSocket('ws://localhost:4000');
```

- **On open, start reading terminal input**:

```javascript
ws.on('open', () => {
  console.log('user1 connected to ws://localhost:4000');

  createInput('user1> ', (line) => {
    if (line.trim().length === 0) return;
    ws.send(`user1: ${line}`);
  });
});
```

- **Handle incoming messages**:

```javascript
ws.on('message', (data) => {
  console.log(`\n[recv] ${data.toString()}`);
});
```

The same pattern is used in `user2.js`, just with `user2` labels and prompt.

---

### How `readline.js` works

The `readline.js` file provides a helper function that makes it easy to read user input from the terminal. Here's a step-by-step explanation:

#### The Problem
In a terminal chat app, you need to:
1. Display a prompt (like `user1> `)
2. Wait for the user to type something and press Enter
3. Do something with that input (send it via WebSocket)
4. Show the prompt again for the next message
5. Repeat forever

#### The Solution: Node's `readline` Module

Node.js has a built-in `readline` module that handles all of this. Our `createInput()` function wraps it in a simple, reusable way.

#### How It Works Step-by-Step

1. **Create the interface**:
   ```javascript
   const rl = readline.createInterface({
     input: process.stdin,   // Where to read from (keyboard)
     output: process.stdout  // Where to write to (screen)
   });
   ```
   This creates a connection between your program and the terminal.

2. **Set and show the prompt**:
   ```javascript
   rl.setPrompt('user1> ');  // Set what text appears before input
   rl.prompt();               // Actually display it on screen
   ```
   Now the user sees `user1> ` and can start typing.

3. **Listen for completed lines**:
   ```javascript
   rl.on('line', (line) => {
     onLine(line);    // Call your callback with what they typed
     rl.prompt();     // Show the prompt again for next input
   });
   ```
   When the user presses Enter, the `'line'` event fires. The callback receives the text they typed (without the Enter key). After processing it, we show the prompt again so they can type another message.

4. **Handle cleanup**:
   ```javascript
   rl.on('close', () => {
     process.exit(0);  // Exit the program when readline closes
   });
   ```
   If the user presses Ctrl+C or Ctrl+D, the interface closes and we exit the program.

5. **Return the interface**:
   ```javascript
   return rl;
   ```
   This lets the caller (like `user1.js`) control the readline interface if needed (e.g., to display messages without disrupting the prompt).

#### Why This Matters

- **Non-blocking**: Unlike `readline-sync`, this doesn't freeze your program. While waiting for input, your WebSocket can still receive messages from other users.
- **Event-driven**: Uses Node's event system, so it works well with other async operations like WebSockets.
- **User-friendly**: Automatically handles the prompt display, cursor positioning, and line editing.

#### Example Flow

```
1. Program starts → createInput('user1> ', callback)
2. Screen shows: user1> _
3. User types: "Hello"
4. User presses Enter
5. 'line' event fires → callback('Hello') runs
6. Your code sends "Hello" via WebSocket
7. Prompt shows again: user1> _
8. Repeat from step 3
```

---

### Running the WebSocket chat

From the `sockets` directory:

```bash
npm install
```

Then open three terminals, all in the `sockets` folder:

1. **Terminal 1 – start the server**

```bash
node server.js
```

2. **Terminal 2 – start user1**

```bash
node user1.js
```

3. **Terminal 3 – start user2**

```bash
node user2.js
```

Now type messages after the `user1>` or `user2>` prompt and watch them appear in the other user's terminal.


