import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const target = path.resolve(here, '../client/public/kerala-districts.geojson');
const sources = [
  'https://raw.githubusercontent.com/geohacker/kerala/master/geojsons/district.geojson',
  'https://cdn.jsdelivr.net/gh/geohacker/kerala@master/geojsons/district.geojson'
];
const districts = new Set(['Kasaragod','Kannur','Wayanad','Kozhikode','Malappuram','Palakkad','Thrissur','Ernakulam','Idukki','Kottayam','Alappuzha','Pathanamthitta','Kollam','Thiruvananthapuram']);
if (existsSync(target)) {
  try {
    const local = JSON.parse(await readFile(target, 'utf8'));
    if ((local.features || []).filter(f => districts.has(String(f.properties?.DISTRICT || f.properties?.district || ''))).length >= 10) {
      console.log('Kerala GIS: using existing local district boundaries.');
      process.exit(0);
    }
  } catch {}
}
await mkdir(path.dirname(target), { recursive: true });
for (const url of sources) {
  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(15000) });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const geo = await response.json();
    const features = (geo.features || []).filter(f => districts.has(String(f.properties?.DISTRICT || f.properties?.district || '')));
    if (features.length < 10) throw new Error(`Only ${features.length} Kerala districts found`);
    const localGeo = { type: 'FeatureCollection', name: 'Kerala District Boundaries', features };
    await writeFile(target, JSON.stringify(localGeo));
    console.log(`Kerala GIS: cached ${features.length} district polygons locally.`);
    process.exit(0);
  } catch (error) {
    console.warn(`Kerala GIS source unavailable: ${url} (${error.message})`);
  }
}
console.warn('Kerala GIS: could not download boundaries. The scene will use its clearly labelled fallback until the asset is added.');
