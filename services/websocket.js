const WebSocket = require('ws');

let wss;
const clients = new Map(); // Map to store connections by userId

function initWebSocket(server) {
    wss = new WebSocket.Server({ server });

    wss.on('connection', (ws, req) => {
        // For now, we'll rely on the client sending their userId after connection.
        // A more robust solution would use authentication tokens.
        ws.on('message', (message) => {
            try {
                const data = JSON.parse(message);
                if (data.type === 'register' && data.userId) {
                    ws.userId = data.userId;
                    clients.set(data.userId, ws);
                    console.log(`[WS] Client registered for userId: ${data.userId}`);
                }
            } catch (e) {
                console.error('[WS] Error processing message:', e);
            }
        });

        ws.on('close', () => {
            if (ws.userId) {
                clients.delete(ws.userId);
                console.log(`[WS] Client disconnected for userId: ${ws.userId}`);
            }
        });

        ws.on('error', (error) => {
            console.error('[WS] WebSocket error:', error);
        });
    });

    console.log('[WS] WebSocket server initialized.');
}

function sendNotificationToVendor(vendorId, notification) {
    const vendorSocket = clients.get(vendorId);
    if (vendorSocket && vendorSocket.readyState === WebSocket.OPEN) {
        vendorSocket.send(JSON.stringify(notification));
        console.log(`[WS] Sent notification to vendor: ${vendorId}`);
        return true;
    }
    console.log(`[WS] Vendor not connected or socket not open: ${vendorId}`);
    return false;
}

module.exports = {
    initWebSocket,
    sendNotificationToVendor
};
