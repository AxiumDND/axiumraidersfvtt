const fs = require('fs');
const sharp = require('sharp');

async function main() {
    const files = fs.readdirSync('assets/scenes')
        .filter(f => f.endsWith('-thumb.webp'))
        .slice(0, 5); // Check first 5 thumbnails

    for (const file of files) {
        const metadata = await sharp(`assets/scenes/${file}`).metadata();
        console.log(`${file}: ${metadata.width}x${metadata.height}`);
    }
}

main().catch(console.error); 