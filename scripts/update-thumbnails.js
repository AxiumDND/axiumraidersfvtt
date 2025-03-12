// Script to update map thumbnails
Hooks.once('ready', async function() {
    console.log('Axium Raiders | Starting thumbnail update process');

    // Get the maps compendium
    const mapPack = game.packs.get("axiumraidersfvtt.maps");
    if (!mapPack) {
        ui.notifications.error("Maps compendium not found!");
        return;
    }

    // Load all maps
    await mapPack.getDocuments();
    const scenes = mapPack.contents;
    console.log(`Found ${scenes.length} maps in compendium`);

    let missingThumbs = 0;
    let updatedThumbs = 0;

    // Check each scene
    for (let scene of scenes) {
        if (!scene.thumbnail || scene.thumbnail === "") {
            missingThumbs++;
            console.log(`Missing thumbnail for: ${scene.name}`);

            // If scene has a background image, use it to generate thumbnail
            if (scene.background?.src) {
                try {
                    // Generate thumbnail path
                    const thumbPath = scene.background.src.replace(/\.[^/.]+$/, "_thumb.webp");
                    
                    // Update scene with thumbnail
                    await scene.update({
                        thumbnail: thumbPath
                    });
                    
                    updatedThumbs++;
                    console.log(`Updated thumbnail for: ${scene.name}`);
                } catch (e) {
                    console.error(`Error updating thumbnail for ${scene.name}:`, e);
                }
            }
        }
    }

    // Report results
    const message = `Thumbnail Check Complete:\n${missingThumbs} missing thumbnails found\n${updatedThumbs} thumbnails updated`;
    ui.notifications.info(message);
    console.log(message);
});

// Add a button to the scene config
Hooks.on('renderSceneConfig', (app, html, data) => {
    const button = $(`<button type="button">
        <i class="fas fa-image"></i> Generate Thumbnail
    </button>`);
    
    button.click(async () => {
        const scene = app.object;
        if (scene.background?.src) {
            const thumbPath = scene.background.src.replace(/\.[^/.]+$/, "_thumb.webp");
            await scene.update({
                thumbnail: thumbPath
            });
            ui.notifications.info(`Updated thumbnail for ${scene.name}`);
        } else {
            ui.notifications.warn("Scene needs a background image first!");
        }
    });
    
    html.find('button[type="submit"]').before(button);
}); 