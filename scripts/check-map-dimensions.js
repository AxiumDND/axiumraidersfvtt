const fs = require('fs');
const sharp = require('sharp');

async function main() {
    const maps = [
        'frozen north wave 2',
        'frozen north wave 1 option 1',
        'Icey Ravine tunnels copy',
        'Far Landing under Siege Map 50x50',
        'Battle map frozen north wave 3'
    ];

    for (const mapName of maps) {
        const path = `maps/Chapter 6/${mapName}.webp`;
        if (!fs.existsSync(path)) {
            console.error(`Map not found: ${path}`);
            continue;
        }
        const metadata = await sharp(path).metadata();
        console.log(`${mapName}: ${metadata.width}x${metadata.height}`);
    }
}

main().catch(console.error); 