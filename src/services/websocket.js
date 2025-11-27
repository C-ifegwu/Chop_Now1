const WebSocket = require('ws');

let wss;

function initWebSocket(server) {
    wss = new WebSocket.Server({ server });

    wss.on('connection', (ws, req) => {
        // userId and userType are now set during verifyClient in server.js
        // No need for client to send a 'register' message
        
        ws.on('message', (message) => {
            try {
                const data = JSON.parse(message);
                // Handle different message types if needed, excluding 'register'
                // The main broadcasting logic is in server.js global functions now.
                // This service could add specific logic for message processing if required.
                console.log(`[WS] Message from userId ${ws.userId}:`, data);
            } catch (e) {
                console.error('[WS] Error processing message:', e);
            }
        });

        ws.on('close', () => {
            console.log(`[WS] Client disconnected for userId: ${ws.userId}`);
        });

        ws.on('error', (error) => {
            console.error('[WS] WebSocket error:', error);
        });
    });

    console.log('[WS] WebSocket server initialized.');
}

function sendNotificationToVendor(vendorId, notification) {
    if (global.broadcastToUser) {
        global.broadcastToUser(vendorId, notification);
        console.log(`[WS] Sent notification to vendor: ${vendorId} via global broadcast`);
        return true;
    } else {
        console.error('[WS] global.broadcastToUser is not available. Cannot send notification.');
        return false;
    }
}

module.exports = {
    initWebSocket,
    sendNotificationToVendor
};
