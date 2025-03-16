# Database and File Structure Notes

## Database Overview
- Main scene database location: `axiumraidersfvtt/packs/maps`
- Uses ClassicLevel (LevelDB) for scene storage
- Scene entries are stored with keys prefixed with `!scenes!`

## Scene Data Structure
- Scene entries in database contain:
  - `name`: Scene name
  - `background`: Object containing map image path
    - `src`: Path to main map image (format: `modules/axiumraidersfvtt/maps/Chapter 6/[filename].webp`)
  - `thumb`: Path to thumbnail (format: `modules/axiumraidersfvtt/assets/scenes/[id]-thumb.webp`)
  - `_id`: Unique scene identifier

## File Locations
1. Map Files:
   - Physical location: `axiumraidersfvtt/maps/Chapter 6/`
   - Referenced in DB as: `modules/axiumraidersfvtt/maps/Chapter 6/`

2. Thumbnail Files:
   - Physical location: `axiumraidersfvtt/assets/scenes/`
   - Referenced in DB as: `modules/axiumraidersfvtt/assets/scenes/`
   - Format: `[id]-thumb.webp`

## Important Scripts
1. `generate-thumbnails.js`:
   - Creates thumbnails from map files
   - Uses sharp for image processing
   - Maintains aspect ratio with max width/height of 400px
   - Saves thumbnails to assets/scenes directory

2. `check-scene-data.js`:
   - Reads scene data from LevelDB database
   - Useful for verifying scene entries and paths

## Common Issues & Solutions
1. 404 Errors for Thumbnails:
   - Check database path references match physical file locations
   - Verify thumbnail IDs in database match generated files
   - Ensure paths use forward slashes and proper URL encoding
   - Check module.json manifest paths are correct

2. Database Access:
   ```javascript
   const db = new ClassicLevel(path.join(__dirname, '..', 'packs', 'maps'), { 
     createIfMissing: false,
     valueEncoding: 'utf8'
   });
   ```

## Path Conventions
1. Database References:
   - Always use format: `modules/axiumraidersfvtt/[asset_type]/[filename]`
   - Use forward slashes (/) even on Windows
   - URL encode special characters in paths

2. Physical Files:
   - Maps: `axiumraidersfvtt/maps/Chapter 6/`
   - Thumbnails: `axiumraidersfvtt/assets/scenes/`
   - Database: `axiumraidersfvtt/packs/maps/`

## Thumbnail ID System
- Format: `[16 character hex]-thumb.webp`
- Examples:
  - `bQpv7mcDPRsJ4gDY-thumb.webp`
  - `DGwlHI1inUU0hbAO-thumb.webp`
  - `J7k67yobZyNpbiL1-thumb.webp`

## Module Structure
- Module ID: `axiumraidersfvtt`
- All assets must be referenced relative to module root
- Manifest URL: Check module.json for correct GitHub raw URLs 