const fs = require('fs');
const path = require('path');

function getAllFiles(dirPath, arrayOfFiles = []) {
    const files = fs.readdirSync(dirPath);

    files.forEach(file => {
        const fullPath = path.join(dirPath, file);
        if (fs.statSync(fullPath).isDirectory()) {
            getAllFiles(fullPath, arrayOfFiles);
        } else {
            arrayOfFiles.push(fullPath);
        }
    });

    return arrayOfFiles;
}

async function fixThumbnails() {
    console.log('Starting thumbnail fix process...');
    
    // Get all map files
    const mapsDir = path.join(__dirname, '..', 'maps');
    const mapFiles = getAllFiles(mapsDir)
        .filter(file => file.toLowerCase().endsWith('.webp'))
        .filter(file => !file.includes('thumb'));

    // Get all thumbnail files
    const thumbsDir = path.join(__dirname, '..', 'assets', 'scenes');
    const thumbFiles = fs.readdirSync(thumbsDir)
        .filter(file => file.toLowerCase().endsWith('-thumb.webp'))
        .map(file => path.join(thumbsDir, file));

    // For each map file
    mapFiles.forEach(mapFile => {
        const expectedThumbName = path.basename(mapFile).replace('.webp', '-thumb.webp');
        const expectedThumbPath = path.join(thumbsDir, expectedThumbName);
        
        // If thumbnail doesn't exist with correct name
        if (!fs.existsSync(expectedThumbPath)) {
            // Copy the map file as a thumbnail
            try {
                fs.copyFileSync(mapFile, expectedThumbPath);
                console.log(`Created thumbnail for: ${path.relative(mapsDir, mapFile)}`);
            } catch (e) {
                console.error(`Error creating thumbnail for ${path.relative(mapsDir, mapFile)}:`, e);
            }
        }
    });

    // Remove orphaned thumbnails
    const validThumbNames = mapFiles.map(file => path.basename(file).replace('.webp', '-thumb.webp'));
    thumbFiles.forEach(thumbFile => {
        const thumbName = path.basename(thumbFile);
        if (!validThumbNames.includes(thumbName)) {
            try {
                fs.unlinkSync(thumbFile);
                console.log(`Removed orphaned thumbnail: ${thumbName}`);
            } catch (e) {
                console.error(`Error removing orphaned thumbnail ${thumbName}:`, e);
            }
        }
    });

    console.log('\nThumbnail fix process complete!');
}

// Run the fix
fixThumbnails(); 