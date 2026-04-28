const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const repoRoot = path.resolve(__dirname, '..');

const jobs = [
  { name: 'The Sun Sea',       src: 'maps/Chapter 9/the_sun_sea.webp',                 dst: 'assets/scenes/cg1JOhfMY4D1gTrj-thumb.webp', w: 400, h: 400 },
  { name: 'Home - Runes',      src: 'maps/Generic/Game_Environment_Runes.webp',        dst: 'assets/scenes/CNtjBhkVlJjY4cmI-thumb.webp', w: 450, h: 150 },
  { name: 'Home - Clans',      src: 'maps/Generic/Game_Environment_Clans.webp',        dst: 'assets/scenes/EkLJDas9dsu3UnNo-thumb.webp', w: 450, h: 150 },
  { name: 'Home - Characters', src: 'maps/Generic/Game_Environment_Characters.webp',   dst: 'assets/scenes/Xr84LfKh7lE0zkxB-thumb.webp', w: 450, h: 150 },
  { name: 'Home - map',        src: 'maps/Generic/Game_Environment_Map.webp',          dst: 'assets/scenes/mxeVmUKJXwOKPATf-thumb.webp', w: 450, h: 150 },
];

(async () => {
  for (const j of jobs) {
    const srcPath = path.join(repoRoot, j.src);
    const dstPath = path.join(repoRoot, j.dst);
    if (!fs.existsSync(srcPath)) {
      console.error(`MISSING SOURCE: ${j.name} - ${srcPath}`);
      continue;
    }
    await sharp(srcPath)
      .resize(j.w, j.h, { fit: 'cover', position: 'centre' })
      .webp({ quality: 80 })
      .toFile(dstPath);
    const meta = await sharp(dstPath).metadata();
    console.log(`Wrote ${j.dst}  ${meta.width}x${meta.height}  for "${j.name}"`);
  }
})().catch(e => { console.error(e); process.exit(1); });
