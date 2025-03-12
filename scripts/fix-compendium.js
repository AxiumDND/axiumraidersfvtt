// Script to update compendium entries with correct thumbnail paths
class CompendiumFixer {
    static async updateThumbnailPaths() {
        console.log('Starting compendium thumbnail path update...');

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

        let updatedCount = 0;
        for (let scene of scenes) {
            if (scene.background?.src) {
                try {
                    // Generate correct thumbnail path based on background image path
                    const thumbPath = scene.background.src
                        .replace('/maps/', '/assets/scenes/')
                        .replace('.webp', '-thumb.webp');
                    
                    // Update scene with new thumbnail path
                    await scene.update({
                        thumbnail: thumbPath
                    });
                    
                    updatedCount++;
                    console.log(`Updated thumbnail path for: ${scene.name}`);
                } catch (e) {
                    console.error(`Error updating thumbnail path for ${scene.name}:`, e);
                }
            }
        }

        const message = `Update Complete: ${updatedCount} thumbnail paths updated`;
        ui.notifications.info(message);
        console.log(message);
    }
}

// Add a button to the module settings
Hooks.once('init', () => {
    game.settings.registerMenu("axiumraidersfvtt", "compendiumFixer", {
        name: "Fix Compendium Thumbnails",
        label: "Update Thumbnail Paths",
        icon: "fas fa-wrench",
        type: CompendiumFixerForm,
        restricted: true
    });
});

class CompendiumFixerForm extends FormApplication {
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            id: "compendium-fixer",
            title: "Fix Compendium Thumbnails",
            template: "templates/apps/form-application.html",
            width: 400
        });
    }

    getData() {
        return {
            message: "Click the button below to update all thumbnail paths in the maps compendium."
        };
    }

    activateListeners(html) {
        super.activateListeners(html);
        html.find('button[type="submit"]').click(this._onSubmit.bind(this));
    }

    async _updateObject(event, formData) {
        await CompendiumFixer.updateThumbnailPaths();
    }
} 