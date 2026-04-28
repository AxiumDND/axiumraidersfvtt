const fs = require('fs');
const path = require('path');
const { ClassicLevel } = require('classic-level');

(async () => {
  const dbPath = path.resolve(__dirname, '..', 'packs', 'maps').split(path.sep).join('/');
  const thumbsDir = path.resolve(__dirname, '..', 'assets', 'scenes');
  const db = new ClassicLevel(dbPath, { createIfMissing: false, valueEncoding: 'utf8' });
  await db.open();

  const scenes = [];
  for await (const [key, value] of db.iterator()) {
    if (!key.match(/^!scenes![^.]+$/)) continue;
    try { scenes.push(JSON.parse(value)); } catch {}
  }
  await db.close();

  const missing = [];
  const noThumbField = [];
  const wrongPathPrefix = [];

  for (const s of scenes) {
    if (!s.thumb) {
      noThumbField.push({ id: s._id, name: s.name });
      continue;
    }
    if (!s.thumb.startsWith('modules/axiumraidersfvtt/')) {
      wrongPathPrefix.push({ id: s._id, name: s.name, thumb: s.thumb });
    }
    const filename = path.basename(s.thumb);
    const localPath = path.join(thumbsDir, filename);
    if (!fs.existsSync(localPath)) {
      missing.push({ id: s._id, name: s.name, thumb: s.thumb, expectedFile: filename });
    }
  }

  console.log(`Total scenes: ${scenes.length}`);
  console.log(`Scenes with no \`thumb\` field: ${noThumbField.length}`);
  console.log(`Scenes whose thumb path does not start with modules/axiumraidersfvtt/: ${wrongPathPrefix.length}`);
  console.log(`Scenes whose thumb file is missing on disk: ${missing.length}`);

  if (noThumbField.length) {
    console.log('\n=== No thumb field ===');
    noThumbField.forEach(s => console.log(`  ${s.name}  [${s.id}]`));
  }
  if (wrongPathPrefix.length) {
    console.log('\n=== Wrong path prefix ===');
    wrongPathPrefix.forEach(s => console.log(`  ${s.name}  [${s.id}]\n    thumb: ${s.thumb}`));
  }
  if (missing.length) {
    console.log('\n=== Missing on disk ===');
    missing.forEach(s => console.log(`  ${s.name}  [${s.id}]\n    expects: ${s.expectedFile}`));
  }

  // Orphans: thumb files on disk not referenced by any scene
  const referencedFilenames = new Set(scenes.filter(s => s.thumb).map(s => path.basename(s.thumb)));
  const onDisk = fs.readdirSync(thumbsDir).filter(f => f.endsWith('-thumb.webp'));
  const orphans = onDisk.filter(f => !referencedFilenames.has(f));
  console.log(`\nThumb files on disk: ${onDisk.length}`);
  console.log(`Orphan thumb files (not referenced by any scene): ${orphans.length}`);
  if (orphans.length) {
    console.log('\n=== Orphan files ===');
    orphans.forEach(f => console.log(`  ${f}`));
  }
})().catch(e => { console.error(e); process.exit(1); });
