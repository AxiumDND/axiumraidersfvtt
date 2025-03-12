const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

async function checkThumbnails(directory) {
    console.log(`\nChecking thumbnails in ${directory}:`);
    const files = fs.readdirSync(directory)
        .filter(f => f.endsWith('-thumb.webp'));

    for (const file of files) {
        const filepath = path.join(directory, file);
        const metadata = await sharp(filepath).metadata();
        console.log(`${file}: ${metadata.width}x${metadata.height}`);
    }
}

async function main() {
    await checkThumbnails('assets/scenes');
    await checkThumbnails('backup/axiumraidersfvtt/assets/scenes');
}

main().catch(console.error); 