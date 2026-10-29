# Turmwacht Duell (Offline-Testversion 0.1)

Kartenduell am Schattenpass – Einzelspieler-Kampagne gegen Computergegner.
Spielbar: `index.html` (eine Datei, keine externen Abhängigkeiten, relative Pfade → später unter `/duell/` im Turmwacht-Repo).

## Aufbau (`src/`)
- `shared/tw-bestiary.js` – Kartendaten/Werte (gemeinsam nutzbar mit Turmwacht, erweiterbar)
- `shared/tw-art.js` – Vektor-Zeichenfunktionen aus Turmwacht (ohne Spielzustand)
- `shared/tw-sfx.js` – Musik (Taverne/Kaminfeuer) & Effekte (WebAudio)
- `duell-sim.js` – deterministische Spiellogik (fester 20-Hz-Tick, eigener Zufallsgenerator, Befehle `{tick,side,a,i,x,y}` → Lockstep-tauglich, `hash()` als Prüfsumme)
- `duell-ai.js` – Computergegner (Profile grimm/morvath/bot)
- `duell-campaign.js` – Szenarien, Gegner, Story-Texte
- `duell-art.js`, `duell-render.js` – Darstellung (Canvas), `duell-ui.js` – Bedienung/Menüs
- `headless-match.js` – KI-gegen-KI in Node (`node src/headless-match.js 30 morvath`)

Bauen: `python3 src/build.py` → `index.html`.
