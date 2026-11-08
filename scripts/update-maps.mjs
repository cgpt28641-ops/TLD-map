// Odświeża katalog adresów map regionów (data/maps.json) z poradników na Steamie.
// Każda sekcja poradnika = jedna mapa; pierwszy obrazek to wersja Pilgrim–Stalker,
// drugi (jeśli jest) to Interloper–Misery. Uruchamiane codziennie przez GitHub Actions.
import { readFile, writeFile } from 'node:fs/promises';

const GUIDES = [
  'https://steamcommunity.com/sharedfiles/filedetails/?id=3255435617', // HokuOwl – Updated Region Maps
  'https://steamcommunity.com/sharedfiles/filedetails/?id=2899955301', // Krueger – Far Territory map locations
];
const OUT = new URL('../data/maps.json', import.meta.url);
const FALLBACK = new URL('../data/maps-fallback.js', import.meta.url);

const decode = s => s.replace(/&amp;/g, '&').replace(/&#39;/g, "'").replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
const slug = s => decode(s).trim().toLowerCase()
  .replace(/^\|dlc\|\s*/i, '').replace(/\s+v\d+(\.\d+)*$/, '').replace(/\s+map$/, '')
  .replace(/'/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');

function sections(html) {
  // Dzielimy stronę na sekcje po nagłówkach "subSectionTitle"
  const parts = html.split(/class="subSectionTitle"[^>]*>/).slice(1);
  return parts.map(p => {
    const title = p.slice(0, p.indexOf('</div>')).replace(/<[^>]+>/g, '').trim();
    const links = [...p.matchAll(/<a\s[^>]*modalContentLink[^>]*href="([^"]+)"|<a\s[^>]*href="([^"]+)"[^>]*modalContentLink/g)]
      .map(m => (m[1] || m[2]).trim());
    return { title, links: [...new Set(links)] };
  });
}

const maps = {};
for (const url of GUIDES) {
  const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 TLD-map updater', 'Accept-Language': 'en-US' } });
  if (!res.ok) throw new Error(`HTTP ${res.status} dla ${url}`);
  for (const { title, links } of sections(await res.text())) {
    const key = slug(title);
    if (!key || !links.length) continue;
    maps[key] = { pilgrim: links[0], interloper: links[1] || links[0] };
  }
}
if (Object.keys(maps).length < 10) throw new Error('Za mało map – struktura poradnika mogła się zmienić, nie nadpisuję.');

const old = JSON.parse(await readFile(OUT, 'utf8').catch(() => '{}'));
const merged = { ...old, ...maps };
await writeFile(OUT, JSON.stringify(merged, null, 2) + '\n');
await writeFile(FALLBACK, 'window.TLD_MAPS_FALLBACK=' + JSON.stringify(merged) + ';\n');
console.log(`Zapisano ${Object.keys(merged).length} map.`);
