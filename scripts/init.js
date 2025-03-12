// Module specific code goes here. See https://foundryvtt.com/article/module-development/ for help.

// Module validation and initialization system
class AxiumRaidersValidator {
    static MODULE_ID = 'axiumraidersfvtt';
    
    static requiredModules = {
        'monks-active-tiles': 'Monk\'s Active Tile Triggers',
        'tagger': 'Tagger',
        'JB2A_DnD5e': 'JB2A',
        'tile-scroll': 'Tile Scroll'
    };

    static requiredDirectories = [
        'assets',
        'maps',
        'packs',
        'scripts',
        'tiles',
        'tokens'
    ];

    static async validateModule() {
        console.log('Axium Raiders | Starting module validation');
        
        let issues = [];
        
        // Check module dependencies
        const missingModules = this.checkRequiredModules();
        if (missingModules.length > 0) {
            issues.push(`Missing required modules: ${missingModules.join(', ')}`);
        }

        // Check required directories
        const missingDirs = await this.checkRequiredDirectories();
        if (missingDirs.length > 0) {
            issues.push(`Missing required directories: ${missingDirs.join(', ')}`);
        }

        // Check compendium packs
        const packIssues = await this.validateCompendiumPacks();
        issues = issues.concat(packIssues);

        // Report validation results
        if (issues.length > 0) {
            ui.notifications.warn(`Axium Raiders: Found ${issues.length} issue(s). Check console for details.`);
            console.warn('Axium Raiders | Validation issues found:');
            issues.forEach(issue => console.warn(`- ${issue}`));
        } else {
            console.log('Axium Raiders | Module validation successful');
        }

        return issues.length === 0;
    }

    static checkRequiredModules() {
        const missingModules = [];
        for (let [key, name] of Object.entries(this.requiredModules)) {
            if (!game.modules.get(key)?.active) {
                missingModules.push(name);
            }
        }
        return missingModules;
    }

    static async checkRequiredDirectories() {
        const missingDirs = [];
        for (const dir of this.requiredDirectories) {
            try {
                const dirExists = await FilePicker.browse('data', `modules/${this.MODULE_ID}/${dir}`);
                if (!dirExists) missingDirs.push(dir);
            } catch (e) {
                missingDirs.push(dir);
            }
        }
        return missingDirs;
    }

    static async validateCompendiumPacks() {
        const issues = [];
        const packs = game.modules.get(this.MODULE_ID)?.packs;
        
        if (!packs) {
            issues.push('No compendium packs found in module');
            return issues;
        }

        for (let pack of packs) {
            try {
                const packContent = await pack.getDocuments();
                if (packContent.length === 0) {
                    issues.push(`Empty compendium pack: ${pack.metadata.label}`);
                }
            } catch (e) {
                issues.push(`Error accessing pack ${pack.metadata.label}: ${e.message}`);
            }
        }

        return issues;
    }
}

// Initialize module
Hooks.once('init', async function() {
    console.log('Axium Raiders | Initializing module');
});

// Setup module and run validation
Hooks.once('ready', async function() {
    console.log('Axium Raiders | Module ready');
    
    // Run validation checks
    await AxiumRaidersValidator.validateModule();
});

// Handle scene creation
Hooks.on('createScene', async function(scene, data, options, userId) {
    console.log('Axium Raiders | New scene created');
    
    // Validate scene data
    if (!scene.background) {
        ui.notifications.warn(`Scene "${scene.name}" is missing a background image`);
    }
    
    // Check for required scene flags
    const requiredFlags = ['gridType', 'gridDistance'];
    const missingFlags = requiredFlags.filter(flag => !scene.getFlag('core', flag));
    if (missingFlags.length > 0) {
        ui.notifications.warn(`Scene "${scene.name}" is missing required flags: ${missingFlags.join(', ')}`);
    }
});

// Handle scene preload
Hooks.on('canvasReady', async function() {
    console.log('Axium Raiders | Canvas ready');
    
    // Validate current scene
    const scene = game.scenes.current;
    if (scene) {
        // Check for required tiles
        const tiles = scene.tiles.contents;
        if (tiles.length === 0) {
            console.log(`Scene "${scene.name}" has no tiles`);
        }
        
        // Check for tokens
        const tokens = scene.tokens.contents;
        if (tokens.length === 0) {
            console.log(`Scene "${scene.name}" has no tokens`);
        }
    }
});