import https from 'node:https';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(root, 'assets', 'products', 'photos');
fs.mkdirSync(outDir, { recursive: true });
const ids = {
  'phone-1.jpg':'photo-1511707171634-5f897ff02aa9',
  'phone-2.jpg':'photo-1512499617640-c74ae3a79d37',
  'phone-3.jpg':'photo-1598327105666-5b89351aff97',
  'headphones-1.jpg':'photo-1505740420928-5e560c06d30e',
  'headphones-2.jpg':'photo-1484704849700-f032a568e944',
  'headphones-3.jpg':'photo-1546435770-a3e426bf472b',
  'charger-1.jpg':'photo-1609592806596-b43bada2f7e5',
  'charger-2.jpg':'photo-1583863788434-e58a36330cf0',
  'charger-3.jpg':'photo-1615526675159-e248c3021d3f',
  'watch-1.jpg':'photo-1523275335684-37898b6baf30',
  'watch-2.jpg':'photo-1434493789847-2f02dc6ca35d',
  'watch-3.jpg':'photo-1544117519-31a4b719223d',
  'accessory-1.jpg':'photo-1601524909162-ae8725290836',
  'accessory-2.jpg':'photo-1583394838336-acd977736f90',
  'accessory-3.jpg':'photo-1519389950473-47ba0277781c'
};
function download(id, dest) {
  return new Promise((resolve, reject) => {
    const url = `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1000&q=82`;
    const request = https.get(url, response => {
      if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
        response.resume();
        https.get(response.headers.location, finalResponse => save(finalResponse, dest, resolve, reject)).on('error', reject);
        return;
      }
      save(response, dest, resolve, reject);
    });
    request.setTimeout(20000, () => request.destroy(new Error('timeout')));
    request.on('error', reject);
  });
}
function save(response, dest, resolve, reject) {
  if (response.statusCode !== 200 || !String(response.headers['content-type'] || '').startsWith('image/')) {
    response.resume(); reject(new Error(`HTTP ${response.statusCode}; not an image`)); return;
  }
  const file = fs.createWriteStream(dest);
  response.pipe(file);
  file.on('finish', () => file.close(resolve));
  file.on('error', err => { fs.rm(dest, { force: true }, () => reject(err)); });
}
let ok = 0, failed = 0;
for (const [name, id] of Object.entries(ids)) {
  const dest = path.join(outDir, name);
  if (fs.existsSync(dest) && fs.statSync(dest).size > 1000) { ok++; continue; }
  try { await download(id, dest); ok++; console.log(`Downloaded ${name}`); }
  catch (err) { failed++; console.warn(`Could not download ${name}: ${err.message}`); }
}
console.log(`Product photos: ${ok} available, ${failed} failed.`);
if (failed) console.warn('Check your internet connection and run "npm run photos" again.');
