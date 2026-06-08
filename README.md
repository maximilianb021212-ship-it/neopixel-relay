# 🎨 NeoPixel Relay Server

Ein **minimalistischer WebSocket-Relay-Server** zur Fernsteuerung von WS2812B RGB-LED-Streifen (NeoPixel) über ein Web-Interface. Der ESP32 verbindet sich persistent mit dem Server und empfängt Live-Befehle – perfekt für Smart Home, Raumdekoration oder Musikreaktivität.

**Läuft problemlos auf** Render.com (kostenlos), Heroku, oder jedem Node.js-Host.

---

## 🚀 Features

- ✅ **Echtzeit-Steuerung**: WebSocket-basiert für minimale Latenz
- ✅ **Mehrere Effekt-Modi**: Verschiedene LED-Animationen
- ✅ **Farbanpassung**: RGB-Farbwahl in Echtzeit
- ✅ **Helligkeits- & Geschwindigkeitskontrolle**: Werte von 0-255
- ✅ **Musik-Daten-Integration**: Optional Spotify-Metadaten (BPM, Energie, Valenz)
- ✅ **Einfache REST-API**: GET-Requests für alle Befehle
- ✅ **Cross-Origin Support**: CORS aktiviert für Web-Interfaces

---

## 🔧 Wie es funktioniert

```
┌─────────────────────────────────────────────────────────┐
│                   NeoPixel Relay Server                 │
│                    (Node.js + Express)                  │
└─────────────┬───────────────────────────┬───────────────┘
              │                           │
      WebSocket (/ws)             HTTP GET Requests
              │                           │
         ┌────▼────┐              ┌──────▼──────┐
         │  ESP32   │              │ Web-Client  │
         │(NeoPixel)│              │ (Browser)   │
         └──────────┘              └─────────────┘
```

### Ablauf:

1. **ESP32-Verbindung**: Der ESP32 verbindet sich mit `/ws` und hält die Verbindung offen
2. **Status-Update**: ESP32 sendet regelmäßig seinen Status (LED-Zustand, Metadaten)
3. **Befehle empfangen**: Server empfängt Befehle vom Web-Interface via HTTP-GET
4. **Echtzeit-Steuerung**: Server leitet Befehle sofort via WebSocket an ESP32 weiter

---

## 📋 API-Endpoints

### Status & Info

| Endpoint | Methode | Beschreibung | Beispiel |
|----------|---------|-------------|----------|
| `/` | GET | Health-Check & Uptime | `GET /` |
| `/api/status` | GET | Aktueller LED-Status als JSON | `GET /api/status` |

### LED-Steuerung

| Endpoint | Methode | Parameter | Beschreibung |
|----------|---------|-----------|-------------|
| `/setMode` | GET | `mode=<int>` | Effekt-Modus (z.B. 0-10) |
| `/setColor` | GET | `r=<0-255>&g=<0-255>&b=<0-255>` | RGB-Farbe setzen |
| `/setBright` | GET | `v=<0-255>` | Helligkeit anpassen |
| `/setSpeed` | GET | `v=<0-255>` | Effekt-Geschwindigkeit |

### Beispiele

```bash
# Mode 3 (z.B. Rainbow)
curl "http://localhost:3000/setMode?mode=3"

# Rot mit voller Helligkeit
curl "http://localhost:3000/setColor?r=255&g=0&b=0&setBright?v=255"

# Schnelle Animation
curl "http://localhost:3000/setSpeed?v=200"

# Status abrufen
curl "http://localhost:3000/api/status"
```

---

## 🛠️ Installation

### Voraussetzungen

- Node.js 18+ ([download](https://nodejs.org))
- Git (optional)

### Lokal installieren

```bash
# Repository clonen
git clone https://github.com/maximilianb021212-ship-it/neopixel-relay.git
cd neopixel-relay

# Dependencies installieren
npm install

# Server starten
npm start
```

Server läuft dann unter `http://localhost:3000`

### Auf Render.com deployen (kostenlos)

1. Dieses Repo forken oder in dein GitHub-Konto pushen
2. [Render.com](https://render.com) öffnen und anmelden
3. **New** → **Web Service** → GitHub-Repo auswählen
4. Build Command: `npm install`
5. Start Command: `npm start`
6. Deploy – fertig! 🎉

Die öffentliche URL erhältst du nach dem Deploy und kannst sie in deinen ESP32-Sketch verwenden.

---

## 🔌 ESP32-Integration

Dein ESP32-Sketch sollte sich wie folgt verbinden:

```cpp
#include <WebSocketsClient.h>

WebSocketsClient webSocket;

void setup() {
  Serial.begin(115200);
  
  // Verbindung zum Server (z.B. "neopixel-relay.onrender.com")
  webSocket.begin("neopixel-relay.onrender.com", 80, "/ws");
  webSocket.onEvent(webSocketEvent);
}

void webSocketEvent(WStype_t type, uint8_t * payload, size_t length) {
  if (type == WStype_TEXT) {
    // Befehl vom Server erhalten, z.B. {"type":"cmd", "action":"setColor", "r":255, ...}
    handleCommand((char*)payload);
  }
}

void loop() {
  webSocket.loop();
  
  // Regelmäßig Status senden
  delay(5000);
  String status = "{\"type\":\"status\", \"mode\":1, \"leds\":\"...\"}";
  webSocket.sendTXT(status);
}
```

---

## 📊 Status-Format

Der ESP32 sendet periodisch einen Status-JSON:

```json
{
  "type": "status",
  "mode": 2,
  "leds": "0xff0000ff00ff...",
  "playing": true,
  "track": "Song Name",
  "artist": "Artist Name",
  "bpm": 128,
  "device": "Speaker Name",
  "energy": 75,
  "valence": 60,
  "pct": 45
}
```

---

## 🎮 Kommando-Format

Der Server sendet folgende Befehle an den ESP32:

```json
// Mode wechseln
{"type": "cmd", "action": "setMode", "mode": 3}

// Farbe setzen
{"type": "cmd", "action": "setColor", "r": 255, "g": 128, "b": 0}

// Helligkeit
{"type": "cmd", "action": "setBright", "v": 200}

// Geschwindigkeit
{"type": "cmd", "action": "setSpeed", "v": 100}
```

---

## 📁 Projekt-Struktur

```
neopixel-relay/
├── server.js           # Hauptserver (Express + WebSocket)
├── package.json        # Dependencies (express, ws)
├── README.md           # Diese Datei
└── .gitignore          # (optional)
```

---

## 🐛 Debugging

### Server-Logs ansehen

```bash
npm start
# Ausgabe:
# NeoPixel Relay läuft auf Port 3000
# [ESP32] Verbunden von 192.168.1.50
# [API] Befehl erhalten: setColor r=255 g=0 b=0
```

### Probleme beheben

**ESP32 verbindet sich nicht?**
- Prüfe die Server-URL (mit `http://` oder Bare URL)
- Firewall/Port freigeben wenn nötig
- Server läuft? → `curl http://localhost:3000`

**Befehle werden nicht empfangen?**
- Prüfe WebSocket-Verbindung: `esp_connected` im Status sollte `true` sein
- ESP32-Logs ansehen

**CORS-Fehler?**
- CORS ist bereits aktiviert – sollte kein Problem sein
- Prüfe Browser-Konsole auf genauen Fehler

---

## 📦 Dependencies

| Paket | Version | Zweck |
|-------|---------|-------|
| `express` | ^4.18.2 | HTTP-Server & Routing |
| `ws` | ^8.16.0 | WebSocket-Kommunikation |

---

## 📝 Lizenz

Kein spezialisierte Lizenz – frei verwendbar. 🎉

---

## 🤝 Beitragen

Fehler gefunden oder Ideen? Öffne ein Issue oder Pull Request!

---

**Viel Spaß beim LED-Programmieren!** 🌈✨
