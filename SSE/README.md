## SSE (Server-Sent Events) Demo

This folder shows how to push data from a Node server to a client using **Server-Sent Events (SSE)**.

SSE is a **one-way** channel: the server can continuously send events to the client over a single long‑lived HTTP connection. The client does **not** send messages back on this channel (for that you would use WebSockets).

---

### Files in this folder

- **`server/server.js`**: Express server that exposes an `/events` endpoint and sends SSE messages.
- **`client/client.js`**: Node client that uses `fetch` to open an SSE connection and read the stream of events.

---

### Concept: How SSE works

- The client sends a normal HTTP request to an SSE endpoint (e.g. `/events`).
- The server responds with:
  - **Status**: `200`
  - **Header**: `Content-Type: text/event-stream`
  - It keeps the connection **open** and periodically sends text chunks in a special format.
- The server formats each event like:

```text
data: {"msg": "Hello", "time": "2025-12-23T15:22:29.986Z"}

```

Note the blank line at the end — that marks the end of one SSE message.

The client parses those chunks and extracts the `data:` lines.

---

### Client code syntax (Node `fetch` streaming)

In `client/client.js`:

- **Open the connection with custom headers**:

```javascript
const response = await fetch('http://localhost:3000/events', {
  headers: {
    'Accept': 'text/event-stream',
    'Authorization': 'Bearer YOUR_TOKEN'
  }
});
```

- **Read the response body as a stream**:

```javascript
const reader = response.body.getReader();
const decoder = new TextDecoder();

while (true) {
  const { value, done } = await reader.read();
  if (done) break;

  const chunk = decoder.decode(value, { stream: true });
  console.log('Received chunk:', chunk);
}
```

- **Parse SSE `data:` lines**:

```javascript
if (chunk.includes('data:')) {
  const data = chunk.replace('data: ', '').trim();
  console.log('Parsed Data:', {
    data: JSON.parse(data),
    headers: response.headers
  });
}
```

Here `response.headers` is a `Headers` object. You can read individual headers via:

```javascript
response.headers.get('content-type');
```

---

### Running the SSE example

From the `SSE/server` directory:

```bash
npm install
node server.js
```

Then from the `SSE/client` directory (Node 18+ which has built‑in `fetch`):

```bash
node client.js
```

You should see chunks being logged and parsed as SSE messages.


