const { ClassicLevel } = require('classic-level');
const path = require('path');

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
    // Scenes that need to be updated
    const scenesToUpdate = {
      '!scenes!4RW2DojSIMqjVp0E': 'bQpv7mcDPRsJ4gDY-thumb.webp',
      '!scenes!MFrs54blaNmn0YiZ': 'DGwlHI1inUU0hbAO-thumb.webp',
      '!scenes!Q3SPLO9Sda9JHe8G': 'ib2lQcbCnyeiDXBR-thumb.webp',
      '!scenes!oW8ks46j9L37s7YG': 'J7k67yobZyNpbiL1-thumb.webp'
    };

    // Update each scene
    for (const [sceneKey, thumbFilename] of Object.entries(scenesToUpdate)) {
      try {
        // Get the scene data
        const sceneData = JSON.parse(await db.get(sceneKey));
        
        // Update the thumbnail path
        const oldPath = sceneData.thumb;
        const newPath = 'modules/axiumraidersfvtt/assets/scenes/' + thumbFilename;
        sceneData.thumb = newPath;
        
        // Save the updated scene data
        await db.put(sceneKey, JSON.stringify(sceneData));
        
        console.log(`\nUpdated scene ${sceneKey}:`);
        console.log('Old path:', oldPath);
        console.log('New path:', newPath);
      } catch (err) {
        console.error(`Error updating scene ${sceneKey}:`, err);
      }
    }

    console.log('\nFinished updating thumbnail paths');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await db.close();
    console.log('\nDatabase closed');
  }
}

main().catch(console.error); 