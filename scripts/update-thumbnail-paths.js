const { ClassicLevel } = require('classic-level');
const path = require('path');
const fs = require('fs');

async function main() {
  console.log('Starting thumbnail path updates...');
  
  // Open the database
  const dbPath = path.join(__dirname, '..', 'packs', 'maps');
  console.log('Opening database at:', dbPath);
  const db = new ClassicLevel(dbPath, { 
    createIfMissing: false,
    valueEncoding: 'utf8'
  });

  try {
    // Get all thumbnails
    const thumbsDir = path.join(__dirname, '..', 'assets', 'scenes');
    const thumbnails = fs.readdirSync(thumbsDir)
      .filter(file => file.endsWith('-thumb.webp'));

    // Get all scenes from database
    let updatedCount = 0;
    for await (const [key, value] of db.iterator()) {
      if (!key.startsWith('!scenes!')) continue;

      try {
        const sceneData = JSON.parse(value);
        if (!sceneData.thumb) continue;

        // Extract thumbnail filename from current path
        const currentThumb = path.basename(sceneData.thumb);
        
        // If thumbnail exists in our assets directory
        if (thumbnails.includes(currentThumb)) {
          const newPath = 'modules/axiumraidersfvtt/assets/scenes/' + currentThumb;
          if (sceneData.thumb !== newPath) {
            sceneData.thumb = newPath;
            await db.put(key, JSON.stringify(sceneData));
            console.log(`Updated scene ${key}: ${newPath}`);
            updatedCount++;
          }
        }
      } catch (err) {
        console.error(`Error updating scene ${key}:`, err);
      }
    }

    console.log(`\nFinished updating ${updatedCount} thumbnail paths`);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await db.close();
    console.log('\nDatabase closed');
  }
}

main().catch(console.error); 