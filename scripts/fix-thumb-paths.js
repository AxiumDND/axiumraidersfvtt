const path = require('path');
const { ClassicLevel } = require('classic-level');

const DRY_RUN = process.argv.includes('--dry-run');

(async () => {
  const dbPath = path.resolve(__dirname, '..', 'packs', 'maps');
  const db = new ClassicLevel(dbPath, { createIfMissing: false, valueEncoding: 'utf8' });
  await db.open();

  const updates = [];
  const skipped = [];
  for await (const [key, value] of db.iterator()) {
    if (!key.match(/^!scenes![^.]+$/)) continue;
    let scene;
    try { scene = JSON.parse(value); } catch { continue; }
    if (!scene.thumb) continue;
    if (!scene.thumb.startsWith('worlds/')) {
      continue;
    }
    const newThumb = scene.thumb.replace(/^worlds\/[^/]+\/assets\/scenes\//, 'modules/axiumraidersfvtt/assets/scenes/');
    if (newThumb === scene.thumb) {
      skipped.push({ id: scene._id, name: scene.name, thumb: scene.thumb, reason: 'regex did not match' });
      continue;
    }
    updates.push({ key, scene, oldThumb: scene.thumb, newThumb });
  }

  console.log(`Found ${updates.length} scenes to update.`);
  for (const u of updates) {
    console.log(`  [${u.scene.name}]`);
    console.log(`    ${u.oldThumb}`);
    console.log(`    -> ${u.newThumb}`);
  }
  if (skipped.length) {
    console.log(`\nSkipped (worlds/ prefix but no match): ${skipped.length}`);
    skipped.forEach(s => console.log(`  ${s.name}: ${s.thumb}`));
  }

  if (DRY_RUN) {
    console.log('\n--dry-run: no changes written');
    await db.close();
    return;
  }

  for (const u of updates) {
    u.scene.thumb = u.newThumb;
    await db.put(u.key, JSON.stringify(u.scene));
  }
  console.log(`\nWrote ${updates.length} updated scene records.`);

  await db.close();
})().catch(e => { console.error(e); process.exit(1); });
