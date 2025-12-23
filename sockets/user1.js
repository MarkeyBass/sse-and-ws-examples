import WebSocket from 'ws';
import { createInput } from './readline.js';

const ws = new WebSocket('ws://localhost:4000');

ws.on('open', () => {
  console.log('user1 connected to ws://localhost:4000');
  createInput('user1> ', (line) => {
    if (line.trim().length === 0) return;
    ws.send(`user1: ${line}`);
  });
});

ws.on('message', (data) => {
  console.log(`\n[recv] ${data.toString()}`);
  // Like console.log, but without a new line
  process.stdout.write('user1> ');
});

ws.on('close', () => {
  console.log('Connection closed');
  process.exit(0);
});

ws.on('error', (err) => {
  console.error('WebSocket error:', err.message);
});


