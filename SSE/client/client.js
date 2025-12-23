async function startSSE() {
    const response = await fetch('http://localhost:3000/events', {
        headers: {
            'Accept': 'text/event-stream',
            'Authorization': 'Bearer YOUR_TOKEN' // fetch allows custom headers
        }
    });

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        console.log("Received chunk:", chunk);
        
        // Logic to parse the SSE "data:" format [cite: 15]
        if (chunk.includes('data:')) {
            const data = chunk.replace('data: ', '').trim();
            console.log("Parsed Data:", JSON.parse(data));
            console.log('All headers:', Object.fromEntries(response.headers.entries()));
        }
    }
}

startSSE();