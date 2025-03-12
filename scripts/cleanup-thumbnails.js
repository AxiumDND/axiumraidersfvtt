const fs = require('fs');
const path = require('path');

const MAPS = [
    'frozen north wave 2',
    'frozen north wave 1 option 1',
    'Icey Ravine tunnels copy',
    'Far Landing under Siege Map 50x50',
    'Battle map frozen north wave 3'
];

// Get the latest thumbnail for each map
async function main() {
    const scenesDir = 'assets/scenes';
    const files = fs.readdirSync(scenesDir);
    
    // Get all thumbnails
    const thumbnails = files.filter(f => f.endsWith('-thumb.webp'));
    
    // Sort by creation time, newest first
    const sortedThumbnails = thumbnails.map(filename => ({
        filename,
        ctime: fs.statSync(path.join(scenesDir, filename)).ctime
    }))
    .sort((a, b) => b.ctime - a.ctime);

    // Keep track of which maps we've found the latest thumbnail for
    const latestThumbnails = new Set();
    
    // First 5 thumbnails should be our latest ones
    const toKeep = sortedThumbnails.slice(0, 5).map(t => t.filename);
    console.log('Keeping these thumbnails:');
    toKeep.forEach(t => console.log(`- ${t}`));
    
    // Delete all other thumbnails
    console.log('\nDeleting old thumbnails:');
    for (const thumbnail of thumbnails) {
        if (!toKeep.includes(thumbnail)) {
            const filepath = path.join(scenesDir, thumbnail);
            fs.unlinkSync(filepath);
            console.log(`- Deleted ${thumbnail}`);
        }
    }
}

main().catch(console.error); 