# Turmwacht Duell (Offline-Testversion 0.6)

Kartenduell am Schattenpass – Einzelspieler-Kampagne gegen Computergegner.
Spielbar: `index.html` (eine Datei, keine externen Abhängigkeiten, relative Pfade → später unter `/duell/` im Turmwacht-Repo).

## Aufbau (`src/`)
- `shared/tw-bestiary.js` – Kartendaten/Werte (gemeinsam nutzbar mit Turmwacht, erweiterbar)
- `shared/tw-art.js` – Vektor-Zeichenfunktionen aus Turmwacht (ohne Spielzustand)
- `shared/tw-sfx.js` – Musik (Taverne/Kaminfeuer) & Effekte (WebAudio)
- `duell-sim.js` – deterministische Spiellogik (fester 20-Hz-Tick, eigener Zufallsgenerator, Befehle `{tick,side,a,i,x,y}` → Lockstep-tauglich, `hash()` als Prüfsumme)
- `duell-ai.js` – Computergegner (Profile grimm/morvath/bot)
- `duell-campaign.js` – Szenarien, Gegner, Story-Texte
- `duell-cards.js` – Karten-Infos für die Detailkarte (Seltenheit, Werte, Fähigkeitstexte, Lore; liest alle Werte live aus `TW_BESTIARY`)
- `duell-back.js` – Rückansichten aller Einheiten/Helden/Gebäude-Figuren (`viewKey()`)
- `duell-art.js`, `duell-render.js` – Darstellung (Canvas), `duell-ui.js` – Bedienung/Menüs
- `headless-match.js` – KI-gegen-KI in Node (`node src/headless-match.js 30 morvath`)

Bauen: `python3 src/build.py` → `index.html`.

## Neu in 0.6 – Bewegung & Zielerfassung nach Clash-Royale-Vorbild
- Lenkverhalten statt eckiger Wegpunkte: Einheiten steuern einen Vorausschau-Punkt in der Brückenachse an (Abstand wächst mit dem seitlichen Versatz) und laufen in weichen Kurven über die Brücke; Geschwindigkeit wird träge nachgeführt. Türme/Gebäude werden vorausschauend umlaufen (z. B. hinter dem eigenen Turm gesetzte Truppen).
- Deutlichere Tempo-Unterschiede: Fledermäuse 50, Wölfe 48, Orks/Skelette 30, Ritter 24, Riese & Oger 15.
- Kollision mit Masse: Einheiten überlappen nicht (4 Auflösungs-Durchgänge, an Türmen eingeklemmte Einheiten gelten als schwer), schwere schieben leichte weg. Gruppen fächern sich im Halbkreis um ihr Ziel auf (seitliches Umlaufen bereits kämpfender Verbündeter). Treffer schwerer Nahkämpfer stoßen leichte Einheiten zurück.
- Zielerfassung: ungebunden wird jeden Tick neu gewählt – betritt ein Gegner den Sichtradius, dreht die Einheit sofort ab. Nach Kontakt ist sie LOCKED und bleibt am Ziel, bis es tot ist (auch ein Turm); danach sofort Retarget (z. B. Bergfried nach Turmfall). Gebäude-Zieler ignorieren Truppen.
- Fernkämpfer bleiben in maximaler Reichweite stehen (auch auf der Brücke), Nahkämpfer laufen bis zum Kontakt (Kollisionsradien berühren sich) und schlagen dann mit ihrer Reichweite.
- Schlag-Frame: Nahkampf-Schaden fällt genau 2 Ticks (0,1 s) nach dem Ausholen, die Schlaganimation hat ihren Höhepunkt exakt dort.
- Deploy: Truppen erscheinen 1 s als halbtransparente Geister mit blauem Füllbalken über dem Kopf – unverwundbar, ohne Bewegung/Angriff –, dann materialisieren sie. Formationen: 2 nebeneinander, 3 Dreieck, 4 Quadrat, 5 Kreis.
- UI: Lebensbalken über jeder Einheit (blau/rot), gleitend abnehmend mit hellem Nachlauf; Kartenname wird beim Ausspielen für beide Seiten kurz eingeblendet.
- KI rechnet die Deploy-Zeit ein (Abfangpunkt = Position des Gegners nach dem Materialisieren).
- Balance (200 Partien): Grimmzahn 90 %, Morvath 64 %.
- Tests: neuer `movement.js` (Deploy-Geister, Formationen, Kollision/Masse, Halbkreis, LOCK, Abdrehen, Retarget, Fernkampf-Stopp, Kontakt, Schlag-Frame, Rückstoß, Kurve zur Brücke, Determinismus). Alte Testversionen als `*-v05.js`.

## Neu in 0.5
- Freie Bewegung wie bei Clash Royale (ersetzt die feste Spurtreue aus 0.2): Kreaturen laufen zum Turm ihrer Spur, greifen aber jeden Gegner in Sichtweite an – auch auf der anderen Spur oder über die Mitte – und fangen Angreifer vom Turm weg ab. Nach einem Kill suchen sie das nächste Ziel; wer dabei auf die andere Seite gewechselt ist, läuft dort weiter. Ohne Gegner in Sicht geht es geradeaus. Gefallener Außenturm → weiter zum Bergfried.
- Gebäude-Zieler (Oger, Zeppelin) bleiben bei Gebäuden. Über den Fluss nur an den Brücken (bei Verfolgung die günstigere Brücke), Türme und Gebäude sind Hindernisse.
- Mittelzone (60 px ≈ 17 % der Feldbreite, gold markiert): Gruppenkarten (Anzahl > 1) teilen sich dort auf beide Spuren auf, bei ungerader Anzahl bekommt die nähere Seite den Rest. Einzeleinheiten wählen dort die Spur mit dem schwächeren Turm (bei Gleichstand die nähere Seite).
- Drag-Vorschau zeigt beim Aufteilen zwei Pfeile/Pfadlinien mit „← ×2“ / „×1 →“.
- KI setzt Gruppen gezielt mittig (Druck auf beide Spuren, Verteidigung bei Angriffen auf beiden Seiten oder in der Mitte).
- Logik weiterhin deterministisch (20 Ticks/s, getrennt vom Renderer). Balance geprüft, unverändert im Zielbereich.
- Tests: `lanes.js` neu (Abfangen, Aufteilen, Geradeaus, Brücken, Gebäude-Zieler, Heldensprung, Determinismus); alter Test als `lanes-v04.js`. `balance.js` misst die Siegquoten.

## Neu in 0.4
- Neues Hauptmenü: Wappen, aktives Deck (8 Symbole, Ø-Mana, Held) und große Kacheln für Kampagne, Freier Kampf, Deck & Sammlung, Einstellungen.
- Deck-Editor neu: 8 Plätze (2×4) mit eigenem goldenen Held-Platz, Sammlung mit Filter (Typ) und Sortierung (Kosten/Typ/Name), „Im Deck“-Markierung, Ø-Mana und Prüfung live.
- Antippen einer Karte öffnet die Detailkarte mit „Ins Deck“ / „Entfernen“ / „Tauschen“ bzw. „Als Held einsetzen“; Tauschen: Karte wählen → Platz antippen. Am PC zusätzlich Drag & Drop.
- Detailkarte für jede Kreatur (aus Sammlung, Kampagne, Story und Gegnerdeck): große animierte Figur, Seltenheit/Typ, Mana, Leben, Schaden, DPS, Angriffstempo, Reichweite, Tempo, Ziel, Anzahl, Fähigkeiten, Lore, Vergleichsbalken. Schließen per ✕, Tipp daneben oder Esc.
- Kampagne/Freier Kampf: Szenario-Karten mit Gegnerporträt, Schwierigkeit, Siegel (offen/geschafft/gesperrt) und Gegnerdeck.
- Keine Änderung an Spiellogik/Balance; Speicherstände (`turmwacht_duell_deck`, `turmwacht_duell_progress`) kompatibel. Neu: `turmwacht_duell_view` (Filter/Sortierung).

## Neu in 0.3
- **Turm-Lebensanzeigen:** Jeder Turm hat eine immer sichtbare Plakette mit Zahl unter dem Sockel (rot = Gegner, blau = eigen, pulsiert unter 33 %), auch der gegnerische Bergfried. Oben zusätzlich die Leiste „Gegner-Türme“ (linker Turm · Bergfried · rechter Turm) und der Kronenstand „Du : Gegner“. Geprüft bei 390×844 und 360×740.
- **Türme im WC3-Stil:** Teamfarben, Banner und Wappen; Risse ab 66 % und Feuer/Rauch ab 33 % Leben. Ein ruhender Bergfried hat dunkle Fenster, Fensterläden und Ketten sowie ein Schloss mit „Zz“. Wird er getroffen oder fällt ein Wachturm, erscheint „Bergfried erwacht!“.
- **Perspektive:** Eigene Truppen sieht man von hinten, gegnerische von vorne. Das gilt für alle Einheiten, Helden und Gebäude-Figuren, die Platzierungs-Vorschau und die Leichen. Animationen laufen in beiden Ansichten.
- **Phasen-Zähler:** Oben steht „×2 Mana in 1:59“, ab Doppel-Mana das ×2-Badge mit „Spielende in“ und danach „Sudden Death 0:59“, jeweils mit Fortschrittsbalken. Banner erscheinen für „Doppel-Mana!“, „Letzte 10 Sekunden“, „Sudden Death!“, Sieg und Niederlage. In den letzten 10 Sekunden läuft ein großer Countdown.
- **Phasen-Klänge:** Kriegshorn bei Doppel-Mana, Glocke mit Trommelwirbel bei Sudden Death, Ticks in den letzten 10 Sekunden (die letzten 3 höher), Fanfare bei Sieg, dunkles Horn bei Niederlage, dazu Klänge für Turmsturz und das Erwachen des Bergfrieds. Das Musiktempo bleibt unverändert, alle Klänge lassen sich mit dem Effekte-Schalter stummschalten.
- **Korrekturen:** Die Spielfläche passt sich beim Wechsel Menü ↔ Spiel neu an, vorher wurde sie leicht gestaucht. Nach Spielende werden keine alten Ereignisse mehr wiederholt, vorher erklang die Fanfare mehrfach.
- Spiellogik und Balance sind unverändert (Grimmzahn ≈ 92 % / Morvath ≈ 63 % Bot-Siege), der Ablauf ist deterministisch.
- Neuer Test: `duelltest/phase.js` (Turm-HP per Pixel und DOM, Phasen-Zähler, Phasen-Klänge, Stummschaltung, Rück- und Frontansicht).

## Neu in 0.2
- **Finger-Platzierung mit Live-Vorschau:** Karte antippen oder ziehen → über dem Feld erscheint ein Geist der Einheit (bzw. der Zauberradius) ca. 48 px über dem Finger, grün = gültig, rot = ungültig (mit Grund). Gesperrte Hälfte ist schraffiert, die gestrichelte Linie zeigt den Weg entlang der Spur. Loslassen setzt nur auf gültigem Feld; ungültig oder zurück auf die Hand = Abbruch. Tippen-dann-Ziehen und Maus funktionieren genauso.
- **Feste Spuren:** Jede Einheit gehört zur Spur, auf deren Seite (x < 180 links, sonst rechts) sie gesetzt wurde, und läuft über ihre eigene Brücke zum Turm ihrer Spur, danach zum Bergfried. Kein Spurwechsel, auch nicht nach Turmfall. Aggro nur in der eigenen Spur oder im direkten Nahkontakt (≤ 14). Gilt für Spieler, KI, Flieger, Schleuder-Orks, beschworene Skelette und Helden; der Heldensprung darf die Spur wechseln, danach gilt die Landespur. Die KI verteidigt in der Spur der Bedrohung und splittet gelegentlich (Morvath öfter als Grimmzahn).
- **Kampf-Animationen (nur Darstellung):** Ausholen und Hieb mit Schweif (Schwert, Axt, Keule), Krallen- und Bissspuren, Orks springen an, Bogenschützen spannen sichtbar, Magier laden eine Kugel auf, Schrittbewegung, Treffer-Blitz und Rückstoß, Fallen bzw. Zerfallen beim Tod, dezente Schadenszahlen.
- Tests: `duelltest/lanes.js` (Spurtreue), `duelltest/drag.js` (Vorschau), `duelltest/anim.js` (Animation, Sim-Hash unverändert).
