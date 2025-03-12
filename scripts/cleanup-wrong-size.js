const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const EXPECTED_WIDTH = 450;
const EXPECTED_HEIGHT = 150;

async function main() {
    const scenesDir = 'assets/scenes';
    const files = fs.readdirSync(scenesDir)
        .filter(f => f.endsWith('-thumb.webp'));
    
    const toDelete = [];
    
    // First pass: check dimensions
    for (const file of files) {
        const filepath = path.join(scenesDir, file);
        try {
            const metadata = await sharp(filepath).metadata();
            
            if (metadata.width !== EXPECTED_WIDTH || metadata.height !== EXPECTED_HEIGHT) {
                toDelete.push({ file, filepath, dimensions: `${metadata.width}x${metadata.height}` });
            } else {
                console.log(`Kept ${file} (${metadata.width}x${metadata.height})`);
            }
        } catch (error) {
            console.error(`Error checking ${file}:`, error);
        }
    }
    
    // Second pass: delete files
    if (toDelete.length > 0) {
        console.log('\nFiles to delete:');
        for (const { file, filepath, dimensions } of toDelete) {
            try {
                fs.unlinkSync(filepath);
                console.log(`Deleted ${file} (${dimensions})`);
            } catch (error) {
                console.error(`Could not delete ${file}:`, error.code);
            }
        }
    }
}

main().catch(console.error); 