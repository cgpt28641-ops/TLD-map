# TLD-map

Samodzielna mapa regionów **The Long Dark** w stylu mapy świata z gry.

- szkic wyspy z regionami i strefami przejściowymi (nazwy jak w polskiej wersji gry),
- **szczegółowa mapa każdego regionu i strefy** – przybliżanie, przesuwanie, wersje Pilgrim–Stalker / Interloper–Misery, warstwa lokacji opowieści dla Far Territory,
- mapy całego świata, połączeń regionów i Kopalni Langston,
- własne pinezki z podpisami, „Byłem tu”, lista ważnych miejsc, planer trasy.

## Mapy i autorzy
Szczegółowe mapy pochodzą z poradników na Steamie i są wyświetlane bezpośrednio z serwerów Steama:
- HokuOwl – [Updated Region Maps [2024]](https://steamcommunity.com/sharedfiles/filedetails/?id=3255435617)
- Krueger – [Tales from the Far Territory map locations](https://steamcommunity.com/sharedfiles/filedetails/?id=2899955301)

Adresy obrazków są w `data/maps.json`. Odświeża je codziennie akcja `Odśwież adresy map` (`scripts/update-maps.mjs`), a Netlify wdraża zmiany automatycznie.

Strona statyczna – Netlify publikuje katalog główny (`netlify.toml`), bez builda.
