// Script to generate thumbnails for missing maps
const fs = require('fs');
const sharp = require('sharp');
const crypto = require('crypto');

async function generateThumbnail(inputPath, outputPath) {
    try {
        await sharp(inputPath)
            .resize(400, 300, {
                fit: 'inside',
                withoutEnlargement: true
            })
            .webp({ quality: 80 })
            .toFile(outputPath);
        
        console.log(`Generated thumbnail: ${outputPath}`);
    } catch (error) {
        console.error(`Error generating thumbnail for ${inputPath}:`, error);
    }
}

async function generateId() {
    return crypto.randomBytes(8).toString('hex');
}

async function main() {
    const mapsToProcess = [
        { path: 'maps/Chapter 9/Tree_Yellow_D6_3x3.png', name: 'Tree Yellow' },
        { path: 'maps/Chapter 9/Tree_Battlemap.webp', name: 'Tree Battlemap' },
        { path: 'maps/Chapter 9/Stump_Light_A3_4x4.png', name: 'Stump Light' },
        { path: 'maps/Chapter 9/Lair of Frost.webp', name: 'Lair of Frost' }
    ];

    for (const map of mapsToProcess) {
        const id = await generateId();
        const thumbnailPath = `assets/scenes/${id}-thumb.webp`;
        await generateThumbnail(map.path, thumbnailPath);
        console.log(`Map "${map.name}" -> Thumbnail ID: ${id}`);
    }
}

main().catch(console.error); 