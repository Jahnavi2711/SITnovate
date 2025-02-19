const WebSocket = require('ws');
const server = new WebSocket.Server({ port: 8080 });

const clients = new Map();

server.on('connection', (ws) => {
    console.log('New client connected');

    ws.on('message', (messageData) => {
        const data = JSON.parse(messageData);
        
        switch(data.action) {
            case 'setName':
                // Store client name
                clients.set(ws, data.name);
                // Send updated user list to all clients
                broadcastUserList();
                break;
            
            case 'sendPublic':
                broadcast({
                    publicMessage: `${clients.get(ws)}: ${data.message}`
                });
                break;
                
            case 'sendPrivate':
                sendPrivateMessage(ws, data);
                break;
        }
    });

    ws.on('close', () => {
        clients.delete(ws);
        broadcastUserList();
    });

    function broadcastUserList() {
        const userList = Array.from(clients.values());
        broadcast({ members: userList });
    }
});

function broadcast(message) {
    server.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(message));
        }
    });
}

function sendPrivateMessage(sender, data) {
    server.clients.forEach(client => {
        if (clients.get(client) === data.to) {
            client.send(JSON.stringify({
                privateMessage: `Private from ${clients.get(sender)}: ${data.message}`
            }));
        }
    });
}

console.log('WebSocket server running on ws://localhost:8080'); 