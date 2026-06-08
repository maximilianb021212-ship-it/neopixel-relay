# NeoPixel Relay Server

Ein minimalistischer WebSocket-Relay-Server, um einen ESP32 (NeoPixel LED-Streifen) über ein Web-Interface fernzusteuern. 

Läuft perfekt auf **Render.com** (im Free Tier) oder jedem anderen Node.js-Server.

---

## Wie es funktioniert

1. **Der ESP32** verbindet sich per WebSocket dauerhaft mit diesem Server (`/ws`).
2. **Das Web-Interface** schickt einfache HTTP-GET-Requests (z.B. bei einem Klick auf eine Farbe) an diesen Server.
3. **Der Server** leitet die Befehle sofort via WebSocket live an den ESP32 weiter.

Kein kompliziertes Routing, kein Overhead, minimale Latenz.

---

## Endpoints (API)

Wenn der Server läuft, kannst du ihn über folgende Routen ansteuern:

* `GET /` — Status-Check (Zeigt ob der ESP32 verbunden ist und die Uptime).
* `GET /api/status` — Gibt den aktuellen LED-Status, Modus und optionale Spotify/BPM-Metadaten als JSON zurück.
* `GET /setMode?mode=1` — Wechselt den Lichteffekt-Modus.
* `GET /setBright?v=128` — Helligkeit anpassen (0-255).
* `GET /setSpeed?v=40` — Effekt-Geschwindigkeit anpassen.
* `GET /setColor?r=255&g=0&b=0` — Statische RGB-Farbe setzen.

---

## Lokal starten

Falls du den Server lokal testen willst:

```bash
# 1. Abhängigkeiten installieren
npm install

# 2. Server starten
npm start
