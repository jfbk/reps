# Reps

Persoonlijke web-app voor dagelijkse sociale reps (graded exposure). Je scoort op de actie, nooit op de uitkomst.

## Gratis en privé
- 100% statisch: alleen HTML, CSS, JS. Geen account, geen backend, geen API, geen kosten.
- Alle data staat lokaal in je browser (`localStorage`, sleutel `social_app_v1`). Niets verlaat je telefoon.
- Werkt offline (service worker). Installeerbaar als PWA op je iPhone-beginscherm.
- **Backup:** sectie "Data" onderaan exporteert je voortgang als één JSON-bestand en importeert het terug. Maak af en toe een backup — iOS Safari kan lokale data van een PWA wissen na ~7 dagen inactiviteit. Dat JSON-bestand is meteen het portable formaat voor een latere database (bv. je eigen OS).

## Gebruiken op je iPhone (gratis, drie opties)

**Optie A — GitHub Pages (aanrader, gratis, blijft staan)**
1. Maak een gratis repo op github.com, upload de inhoud van deze map.
2. Settings → Pages → branch `main`, map `/root` → Save.
3. Je krijgt een URL. Open die in Safari → deel-knop → "Zet op beginscherm".

**Optie B — Netlify drop (gratis, sleep-en-klaar)**
1. Ga naar app.netlify.com/drop, sleep deze map erin.
2. Open de URL in Safari → "Zet op beginscherm".

**Optie C — lokaal testen op je Mac**
```bash
cd projects/reps-app
python3 -m http.server 8731
# open http://localhost:8731 in je browser
```
> PWA-installatie en service worker vereisen `https` of `localhost`. Direct een `index.html` openen via `file://` werkt voor de app zelf, maar dan zonder offline-cache en zonder home-screen-install.

## Bestanden
| Bestand | Doel |
|---|---|
| `index.html` | Structuur (één pagina, losse secties) |
| `styles.css` | Apple-stijl (wit + groen) |
| `content.js` | Vaste inhoud: challenge-ladder, losse quests, theorie-curriculum |
| `app.js` | Logica: state, dagrollover, streak, tier-ontgrendeling, rendering |
| `manifest.json` + `sw.js` | PWA: installeerbaar + offline |
| `icons/` | App-iconen (groene tegel, wit vinkje) |

## Hoe het werkt (kort)
- **Kalibratie** bij eerste start bepaalt je focus-tier (begin / verder / gevorderd).
- **Daily** wordt geserveerd (~70% focus-tier, 30% lagere tiers voor variatie). "Gedaan" = rep. "Nog een" serveert direct een volgende, zonder push. "Andere opdracht" rerollt.
- **Tier-ontgrendeling:** na 10 daily-reps in je focus-tier ontgrendelt de volgende tier. Alleen focus-tier daily-reps tellen hiervoor.
- **Losse quests** tellen mee voor totaal, streak en activiteit, maar niet voor tier-ontgrendeling.
- **Streak** = dagen op rij met ≥1 rep. Gemiste dag → droog terug op 0, geen straf-taal.
- **Bewijs** = logboek tegen het oude idee "niemand wil iets van me horen".

## Inhoud aanpassen
Alle teksten staan in `content.js` (challenges per tier, losse quests, theorie). Pas daar aan; verander geen bestaande `id`'s zonder je opgeslagen `history` mee te migreren.
