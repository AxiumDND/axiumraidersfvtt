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

function checkThumbnails() {
    console.log('Starting thumbnail check process...');
    
    // Get all map files
    const mapsDir = path.join(__dirname, '..', 'maps');
    const mapFiles = getAllFiles(mapsDir)
        .filter(file => file.toLowerCase().endsWith('.webp'))
        .filter(file => !file.includes('thumb'));

    console.log(`Found ${mapFiles.length} map files`);

    // Get all thumbnail files
    const thumbsDir = path.join(__dirname, '..', 'assets', 'scenes');
    const thumbFiles = fs.readdirSync(thumbsDir)
        .filter(file => file.toLowerCase().endsWith('-thumb.webp'))
        .map(file => path.join(thumbsDir, file));

    console.log(`Found ${thumbFiles.length} thumbnail files`);

    // Check each map file
    const missingThumbs = [];
    const inconsistentThumbs = [];

    mapFiles.forEach(mapFile => {
        const relativePath = path.relative(mapsDir, mapFile);
        const expectedThumbName = path.basename(mapFile).replace('.webp', '-thumb.webp');
        const expectedThumbPath = path.join(thumbsDir, expectedThumbName);
        
        if (!fs.existsSync(expectedThumbPath)) {
            missingThumbs.push({
                map: relativePath,
                expectedThumb: expectedThumbName
            });
        }
    });

    // Check for orphaned thumbnails
    const orphanedThumbs = thumbFiles.filter(thumbFile => {
        const baseName = path.basename(thumbFile).replace('-thumb.webp', '.webp');
        return !mapFiles.some(mapFile => path.basename(mapFile) === baseName);
    });

    // Print results
    console.log('\nResults:');
    console.log('--------');
    
    if (missingThumbs.length > 0) {
        console.log('\nMaps missing thumbnails:');
        missingThumbs.forEach(item => {
            console.log(`- ${item.map}`);
            console.log(`  Expected thumbnail: ${item.expectedThumb}`);
        });
    }

    if (orphanedThumbs.length > 0) {
        console.log('\nOrphaned thumbnails (no corresponding map):');
        orphanedThumbs.forEach(thumb => {
            console.log(`- ${path.basename(thumb)}`);
        });
    }

    if (missingThumbs.length === 0 && orphanedThumbs.length === 0) {
        console.log('All thumbnails are present and correctly named!');
    }

    return {
        missingThumbs,
        orphanedThumbs
    };
}

// Run the check
checkThumbnails(); 