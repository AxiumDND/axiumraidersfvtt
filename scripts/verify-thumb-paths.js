const fs = require('fs');
const path = require('path');
const { ClassicLevel } = require('classic-level');

const TARGET_IDS = ['6Bt9VwVZz11SnoK8','CNtjBhkVlJjY4cmI','EkLJDas9dsu3UnNo','Xr84LfKh7lE0zkxB','mxeVmUKJXwOKPATf'];

(async () => {
  const dbPath = path.resolve(__dirname, '..', 'packs', 'maps');
  const thumbsDir = path.resolve(__dirname, '..', 'assets', 'scenes');
  const db = new ClassicLevel(dbPath, { createIfMissing: false, valueEncoding: 'utf8' });
  await db.open();

  const seen = new Set();
  let scanned = 0;
  let badPrefixCount = 0;

  for await (const [key, value] of db.iterator()) {
    if (!key.match(/^!scenes![^.]+$/)) continue;
    let s; try { s = JSON.parse(value); } catch { continue; }
    scanned++;
    if (TARGET_IDS.includes(s._id)) {
      seen.add(s._id);
      const filename = s.thumb ? path.basename(s.thumb) : null;
      const fileExists = filename ? fs.existsSync(path.join(thumbsDir, filename)) : false;
      console.log(`[${s.name}]  id=${s._id}`);
      console.log(`  thumb=${s.thumb}`);
      console.log(`  file ${filename}: ${fileExists ? 'OK' : 'MISSING'}`);
    }
    if (s.thumb && s.thumb.startsWith('worlds/')) badPrefixCount++;
  }
  await db.close();

  const missing = TARGET_IDS.filter(id => !seen.has(id));
  console.log(`\nScanned ${scanned} scenes total.`);
  console.log(`Target scenes seen: ${seen.size}/${TARGET_IDS.length}`);
  if (missing.length) console.log(`MISSING IDs: ${missing.join(', ')}`);
  console.log(`Scenes still with worlds/ prefix in thumb: ${badPrefixCount}`);
})().catch(e => { console.error(e); process.exit(1); });
