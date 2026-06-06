// ═══════════════════════════════════════════════════
//  NeoPixel Relay Server
//  Läuft auf Render.com (kostenlos)
//  ESP32 verbindet sich per WebSocket hierher
//  Website schickt HTTP-Befehle hierher
// ═══════════════════════════════════════════════════

const express    = require('express');
const { WebSocketServer } = require('ws');
const http       = require('http');

const app    = express();
const server = http.createServer(app);
const wss    = new WebSocketServer({ server, path: '/ws' });

// ── Zustand ──────────────────────────────────────
let espSocket  = null;   // aktive WebSocket-Verbindung zum ESP32
let lastStatus = {       // letzter bekannter Status
    mode: 0, leds: '0'.repeat(600),
    playing: false, track: '', artist: '',
    bpm: 120, device: '', energy: 50, valence: 50, pct: 0
};

// ── CORS ─────────────────────────────────────────
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin',  '*');
    res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') return res.sendStatus(204);
    next();
});

// ── WebSocket — ESP32 verbindet sich hier ────────
wss.on('connection', (ws, req) => {
    console.log('[ESP32] Verbunden von', req.socket.remoteAddress);
    espSocket = ws;

    ws.on('message', (data) => {
        try {
            const msg = JSON.parse(data);
            if (msg.type === 'status') {
                lastStatus = msg;
            }
        } catch (e) {}
    });

    ws.on('close', () => {
        console.log('[ESP32] Getrennt');
        if (espSocket === ws) espSocket = null;
    });

    ws.on('error', (err) => {
        console.error('[ESP32] Fehler:', err.message);
    });
});

// Befehl an ESP32 senden
function sendCmd(cmd) {
    if (espSocket && espSocket.readyState === 1) {
        espSocket.send(JSON.stringify(cmd));
        return true;
    }
    return false;
}

// ── HTTP API — Website ruft diese auf ────────────
app.get('/api/status', (req, res) => {
    res.json({ ...lastStatus, esp_connected: espSocket !== null });
});

app.get('/setMode', (req, res) => {
    sendCmd({ type: 'cmd', action: 'setMode', mode: parseInt(req.query.mode) || 0 });
    res.send('ok');
});

app.get('/setBright', (req, res) => {
    sendCmd({ type: 'cmd', action: 'setBright', v: parseInt(req.query.v) || 128 });
    res.send('ok');
});

app.get('/setSpeed', (req, res) => {
    sendCmd({ type: 'cmd', action: 'setSpeed', v: parseInt(req.query.v) || 40 });
    res.send('ok');
});

app.get('/setColor', (req, res) => {
    sendCmd({ type: 'cmd', action: 'setColor',
        r: parseInt(req.query.r) || 0,
        g: parseInt(req.query.g) || 0,
        b: parseInt(req.query.b) || 0
    });
    res.send('ok');
});

// Health check für Render
app.get('/', (req, res) => {
    res.json({
        status: 'ok',
        esp_connected: espSocket !== null,
        uptime: Math.floor(process.uptime()) + 's'
    });
});

// ── Server starten ────────────────────────────────
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`NeoPixel Relay läuft auf Port ${PORT}`);
});
