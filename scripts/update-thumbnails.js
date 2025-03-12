// Script to update map thumbnails
class ThumbnailManager {
    static async checkThumbnails() {
        console.log('Axium Raiders | Starting thumbnail check process');

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

        // Get maps without thumbnails
        const missingThumbs = scenes.filter(scene => !scene.thumbnail || scene.thumbnail === "");
        
        if (missingThumbs.length === 0) {
            const message = "All maps have thumbnails!";
            ui.notifications.info(message);
            return [];
        }

        console.log(`Found ${missingThumbs.length} maps without thumbnails:`);
        missingThumbs.forEach(scene => console.log(`- ${scene.name}`));
        
        return missingThumbs;
    }

    static async updateThumbnails(scenes) {
        let updatedCount = 0;

        for (let scene of scenes) {
            if (scene.background?.src) {
                try {
                    // Generate thumbnail path
                    const thumbPath = scene.background.src.replace(/\.[^/.]+$/, "_thumb.webp");
                    
                    // Update scene with thumbnail
                    await scene.update({
                        thumbnail: thumbPath
                    });
                    
                    updatedCount++;
                    console.log(`Updated thumbnail for: ${scene.name}`);
                } catch (e) {
                    console.error(`Error updating thumbnail for ${scene.name}:`, e);
                }
            } else {
                console.warn(`No background image for: ${scene.name}`);
            }
        }

        const message = `Update Complete: ${updatedCount} thumbnails updated`;
        ui.notifications.info(message);
        console.log(message);
    }

    static async validateMapFiles() {
        console.log('Axium Raiders | Starting map file validation');
        const issues = [];

        // Get the maps compendium
        const mapPack = game.packs.get("axiumraidersfvtt.maps");
        if (!mapPack) {
            ui.notifications.error("Maps compendium not found!");
            return;
        }

        // Load all maps
        await mapPack.getDocuments();
        const scenes = mapPack.contents;
        console.log(`Validating ${scenes.length} maps in compendium`);

        for (let scene of scenes) {
            const sceneIssues = [];
            
            // Check background image
            if (!scene.background?.src) {
                sceneIssues.push("Missing background image source");
            } else {
                try {
                    const response = await fetch(scene.background.src);
                    if (!response.ok) {
                        sceneIssues.push(`Background image file not found: ${scene.background.src}`);
                    }
                } catch (e) {
                    sceneIssues.push(`Error accessing background image: ${e.message}`);
                }
            }

            // Check thumbnail
            if (!scene.thumbnail) {
                sceneIssues.push("Missing thumbnail path");
            } else {
                try {
                    const response = await fetch(scene.thumbnail);
                    if (!response.ok) {
                        sceneIssues.push(`Thumbnail file not found: ${scene.thumbnail}`);
                    }
                } catch (e) {
                    sceneIssues.push(`Error accessing thumbnail: ${e.message}`);
                }
            }

            if (sceneIssues.length > 0) {
                issues.push({
                    name: scene.name,
                    issues: sceneIssues
                });
            }
        }

        // Report results
        if (issues.length === 0) {
            const message = "All map files validated successfully!";
            ui.notifications.info(message);
            console.log(message);
        } else {
            console.log("Found issues with the following maps:");
            issues.forEach(item => {
                console.log(`\n${item.name}:`);
                item.issues.forEach(issue => console.log(`- ${issue}`));
            });
            ui.notifications.warn(`Found issues with ${issues.length} maps. Check console for details.`);
        }

        return issues;
    }

    static registerSettings() {
        game.settings.registerMenu("axiumraidersfvtt", "thumbnailManager", {
            name: "Map Thumbnail Manager",
            label: "Check & Update Thumbnails",
            icon: "fas fa-image",
            type: ThumbnailManagerForm,
            restricted: true
        });
    }
}

class ThumbnailManagerForm extends FormApplication {
    constructor(object = {}, options = {}) {
        super(object, options);
        this.missingThumbs = [];
    }

    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            id: "thumbnail-manager",
            title: "Map Thumbnail Manager",
            template: `modules/axiumraidersfvtt/templates/thumbnail-manager.html`,
            width: 500,
            height: "auto"
        });
    }

    async getData() {
        this.missingThumbs = await ThumbnailManager.checkThumbnails();
        return {
            message: "Use the buttons below to manage map thumbnails.",
            missingThumbs: this.missingThumbs,
            hasMissingThumbs: this.missingThumbs.length > 0
        };
    }

    activateListeners(html) {
        super.activateListeners(html);
        html.find('button[name="check"]').click(this._onCheckThumbnails.bind(this));
        html.find('button[name="update-all"]').click(this._onUpdateAll.bind(this));
        html.find('button[name="update-selected"]').click(this._onUpdateSelected.bind(this));
        html.find('button[name="validate"]').click(this._onValidate.bind(this));
    }

    async _onCheckThumbnails(event) {
        event.preventDefault();
        this.render(true);
    }

    async _onUpdateAll(event) {
        event.preventDefault();
        await ThumbnailManager.updateThumbnails(this.missingThumbs);
        this.render(true);
    }

    async _onUpdateSelected(event) {
        event.preventDefault();
        const selected = this.element.find('input:checked').map(function() {
            return this.value;
        }).get();
        
        const scenesToUpdate = this.missingThumbs.filter(scene => selected.includes(scene.id));
        await ThumbnailManager.updateThumbnails(scenesToUpdate);
        this.render(true);
    }
}

// Register the tool in module settings
Hooks.once('init', () => {
    ThumbnailManager.registerSettings();
});

// Add a button to the scene config for individual scenes
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