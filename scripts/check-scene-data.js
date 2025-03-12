const { ClassicLevel } = require('classic-level');
const path = require('path');

async function main() {
  console.log('Starting scene data check...');
  
  // Open the database
  const dbPath = path.join(__dirname, '..', 'packs', 'maps');
  console.log('Opening database at:', dbPath);
  const db = new ClassicLevel(dbPath, { 
    createIfMissing: false,
    valueEncoding: 'utf8'
  });

  // Scenes to check
  const scenesToCheck = [
    '!scenes!4RW2DojSIMqjVp0E',  // Frozen North Wave 1 Option 2
    '!scenes!MFrs54blaNmn0YiZ',  // Frozen North Wave 3
    '!scenes!oW8ks46j9L37s7YG'   // Frozen North Wave 2
  ];

  try {
    for (const sceneKey of scenesToCheck) {
      try {
        // Get the scene data
        const sceneData = JSON.parse(await db.get(sceneKey));
        console.log(`\nScene: ${sceneData.name}`);
        console.log('Full data:', JSON.stringify(sceneData, null, 2));
      } catch (err) {
        console.error(`Error checking scene ${sceneKey}:`, err);
      }
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await db.close();
    console.log('\nDatabase closed');
  }
}

main().catch(console.error); 