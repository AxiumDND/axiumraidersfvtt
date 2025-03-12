const fs = require('fs');
const path = require('path');
const { ClassicLevel } = require('classic-level');

async function main() {
    console.log('Starting scene thumbnail check...');
    
    // Open the maps database
    const dbPath = path.join(__dirname, '..', 'packs', 'maps');
    console.log(`Opening database at: ${dbPath}`);
    
    const db = new ClassicLevel(dbPath, { 
        createIfMissing: false,
        valueEncoding: 'utf8'
    });
    
    try {
        // Get all entries
        console.log('\nReading database entries...');
        let processedEntries = 0;
        let foundScenes = 0;
        
        for await (const [key, value] of db.iterator()) {
          processedEntries++;
          
          // Only process main scene entries (keys that are just !scenes!ID)
          if (!key.match(/^!scenes![^.]+$/)) {
            continue;
          }

          try {
            const sceneData = JSON.parse(value);
            foundScenes++;
            
            console.log(`\nScene ${foundScenes}:`);
            console.log(`Key: ${key}`);
            console.log(`Name: ${sceneData.name}`);
            console.log(`Background: ${sceneData.img}`);
            console.log(`Thumbnail path in DB: ${sceneData.thumb}`);
            
            // Check if thumbnail exists
            if (sceneData.thumb) {
              // Extract just the filename from the path
              const thumbFilename = path.basename(sceneData.thumb);
              const localThumbPath = path.join(__dirname, '..', 'assets', 'scenes', thumbFilename);
              
              if (fs.existsSync(localThumbPath)) {
                console.log('Thumbnail exists at:', localThumbPath);
                
                // Check if the path in the database matches our local path
                const expectedPath = 'modules/axiumraidersfvtt/assets/scenes/' + thumbFilename;
                if (sceneData.thumb !== expectedPath) {
                  console.log('WARNING: Thumbnail path in database should be updated to:', expectedPath);
                }
              } else {
                console.log('WARNING: Thumbnail file not found at:', localThumbPath);
              }
            }
          } catch (err) {
            console.error('Error processing entry:', err);
          }
        }
        
        console.log(`\nProcessed ${processedEntries} entries, found ${foundScenes} scenes`);
    } catch (error) {
        console.error('Error reading database:', error);
    } finally {
        await db.close();
        console.log('\nDatabase closed');
    }
}

main().catch(console.error); 