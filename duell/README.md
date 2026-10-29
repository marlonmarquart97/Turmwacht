# Turmwacht Duell (Offline-Testversion 0.2)

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

## Neu in 0.2
- **Finger-Platzierung mit Live-Vorschau:** Karte antippen oder ziehen → über dem Feld erscheint ein Geist der Einheit (bzw. der Zauberradius) ca. 48 px über dem Finger, grün = gültig, rot = ungültig (mit Grund). Gesperrte Hälfte ist schraffiert, die gestrichelte Linie zeigt den Weg entlang der Spur. Loslassen setzt nur auf gültigem Feld; ungültig oder zurück auf die Hand = Abbruch. Tippen-dann-Ziehen und Maus funktionieren genauso.
- **Feste Spuren:** Jede Einheit gehört zur Spur, auf deren Seite (x < 180 links, sonst rechts) sie gesetzt wurde, und läuft über ihre eigene Brücke zum Turm ihrer Spur, danach zum Bergfried. Kein Spurwechsel, auch nicht nach Turmfall. Aggro nur in der eigenen Spur oder im direkten Nahkontakt (≤ 14). Gilt für Spieler, KI, Flieger, Schleuder-Orks, beschworene Skelette und Helden; der Heldensprung darf die Spur wechseln, danach gilt die Landespur. Die KI verteidigt in der Spur der Bedrohung und splittet gelegentlich (Morvath öfter als Grimmzahn).
- **Kampf-Animationen (nur Darstellung):** Ausholen und Hieb mit Schweif (Schwert, Axt, Keule), Krallen- und Bissspuren, Orks springen an, Bogenschützen spannen sichtbar, Magier laden eine Kugel auf, Schrittbewegung, Treffer-Blitz und Rückstoß, Fallen bzw. Zerfallen beim Tod, dezente Schadenszahlen.
- Tests: `duelltest/lanes.js` (Spurtreue), `duelltest/drag.js` (Vorschau), `duelltest/anim.js` (Animation, Sim-Hash unverändert).
