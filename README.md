# TLD-map – Wielki Niedźwiedź

Interaktywne mapy wszystkich regionów **The Long Dark** po polsku – aplikacja mapowa na pełny ekran.

## Co potrafi
- **Szczegółowe mapy** każdego regionu, strefy przejściowej, całego świata, połączeń i Kopalni Langston – płynne przybliżanie (kółko, szczypanie, dwuklik), przesuwanie, minimapa, pełny ekran.
- **Wersje Pilgrim–Stalker i Interloper–Misery** oraz **porównanie suwakiem** na jednej mapie.
- **Narzędzia**: pinezki z podpisami (schronienie, zasoby, niebezpieczeństwo, notatka), rysowanie tras, **mgła wojny** odkrywana pędzlem, gumka.
- **Wyszukiwarka (Ctrl K)** po regionach, strefach i ważnych miejscach (PL i EN).
- **Szkic połączeń** w stylu mapy świata z gry i **planer trasy** między regionami.
- Postępy: odwiedzone regiony, odhaczone miejsca; **eksport/import** danych.
- **PWA** – można zainstalować; raz obejrzane mapy działają offline.

Skróty: `V` przesuwanie, `P` pinezka, `R` trasa, `F` mgła, `E` gumka, `C` porównanie, `+`/`−`/`0` zoom, `[` `]` poprzednia/następna mapa.

## Mapy i autorzy
Szczegółowe mapy są dziełem społeczności Steam i są wyświetlane bezpośrednio z ich poradników:
- HokuOwl – [Updated Region Maps [2024]](https://steamcommunity.com/sharedfiles/filedetails/?id=3255435617)
- Krueger – [Tales from the Far Territory map locations](https://steamcommunity.com/sharedfiles/filedetails/?id=2899955301)

Adresy obrazków są w `data/maps.json`; codziennie odświeża je akcja `Odśwież adresy map` (`scripts/update-maps.mjs`).

## Struktura
`index.html` · `assets/app.css` · `assets/app.js` (aplikacja) · `assets/data.js` (regiony, połączenia) · `assets/sketch.js` (szkic tuszem) · `sw.js` (offline) · `manifest.webmanifest`

Strona statyczna – Netlify publikuje katalog główny (`netlify.toml`), bez builda.
