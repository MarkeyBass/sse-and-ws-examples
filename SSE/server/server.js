import express from 'express';
const app = express();
import colors from 'colors';

console.log(colors.red('Hello from fetch SSE'));    

app.get('/events', (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream'); // [cite: 15]
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    setInterval(() => {
        console.log(colors.blue('Sending message to client'));
        res.write(`data: ${JSON.stringify({ msg: "Hello from fetch SSE", time: new Date().toISOString() })}\n\n`);
    }, 5000);
});

app.listen(3000, () => {
    console.log(colors.green('SSE Server running at http://localhost:3000'));
});