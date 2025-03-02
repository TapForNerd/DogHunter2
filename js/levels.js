/**
 * Level generation and progression for Dog Hunter 2
 */

class LevelGenerator {
    constructor(canvasWidth, canvasHeight) {
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;
        this.levelWidth = 5000; // Default level width
        this.groundHeight = canvasHeight - 50; // Default ground height
        this.platformMinWidth = 100;
        this.platformMaxWidth = 300;
        this.platformMinHeight = 20;
        this.platformMaxHeight = 40;
        this.platformGapMin = 50;
        this.platformGapMax = 200;
        this.platformHeightVariation = 150;
        this.currentLevel = 1;
        
        // Level difficulty parameters
        this.difficultyParams = {
            // Animal spawn rates (per 1000px of level width)
            rabbitSpawnRate: 3,
            birdSpawnRate: 2,
            squirrelSpawnRate: 2,
            pigSpawnRate: 1,
            
            // Platform parameters
            platformDensity: 0.7, // 0-1, higher means more platforms
            gapFrequency: 0.2, // 0-1, higher means more gaps in the ground
            maxGapWidth: 150,
            
            // Points required to advance to next level
            pointsToAdvance: 100
        };
    }
    
    /**
     * Generate a new level
     * @param {number} level - Level number
     * @returns {Object} - Level data
     */
    generateLevel(level) {
        this.currentLevel = level;
        
        // Adjust difficulty based on level
        this.adjustDifficulty(level);
        
        // Generate platforms
        const platforms = this.generatePlatforms();
        
        // Generate animals
        const animals = this.generateAnimals(platforms);
        
        return {
            level,
            platforms,
            animals,
            collectibles: [],
            width: this.levelWidth,
            pointsToAdvance: this.difficultyParams.pointsToAdvance
        };
    }
    
    /**
     * Adjust difficulty parameters based on level
     * @param {number} level - Level number
     */
    adjustDifficulty(level) {
        // Increase level width with level
        this.levelWidth = 5000 + (level - 1) * 1000;
        
        // Increase animal spawn rates with level
        this.difficultyParams.rabbitSpawnRate = 3 + (level - 1) * 0.5;
        this.difficultyParams.birdSpawnRate = 2 + (level - 1) * 0.5;
        this.difficultyParams.squirrelSpawnRate = 2 + (level - 1) * 0.3;
        this.difficultyParams.pigSpawnRate = 1 + (level - 1) * 0.2;
        
        // Increase platform density and gap frequency with level
        this.difficultyParams.platformDensity = Math.min(0.7 + (level - 1) * 0.05, 0.9);
        this.difficultyParams.gapFrequency = Math.min(0.2 + (level - 1) * 0.05, 0.4);
        
        // Increase gap width with level
        this.difficultyParams.maxGapWidth = 150 + (level - 1) * 20;
        
        // Increase points required to advance with level
        this.difficultyParams.pointsToAdvance = 100 + (level - 1) * 50;
    }
    
    /**
     * Generate platforms for the level
     * @returns {Array} - Array of platform objects
     */
    generatePlatforms() {
        const platforms = [];
        
        // Generate ground with occasional gaps
        let x = 0;
        while (x < this.levelWidth) {
            // Decide if this should be a gap
            const isGap = Math.random() < this.difficultyParams.gapFrequency;
            
            if (isGap) {
                // Create a gap
                const gapWidth = Math.random() * this.difficultyParams.maxGapWidth + 50;
                x += gapWidth;
            } else {
                // Create a ground segment
                const segmentWidth = Math.random() * 500 + 200;
                platforms.push(new Platform(x, this.groundHeight, segmentWidth, 50));
                x += segmentWidth;
            }
        }
        
        // Generate elevated platforms
        const platformCount = Math.floor(this.levelWidth / 500 * this.difficultyParams.platformDensity);
        
        for (let i = 0; i < platformCount; i++) {
            const platformX = Math.random() * (this.levelWidth - this.platformMaxWidth);
            const platformWidth = Math.random() * (this.platformMaxWidth - this.platformMinWidth) + this.platformMinWidth;
            const platformHeight = Math.random() * (this.platformMaxHeight - this.platformMinHeight) + this.platformMinHeight;
            
            // Vary platform height, but keep it above ground level
            const platformY = this.groundHeight - Math.random() * this.platformHeightVariation - 50;
            
            // Decide if platform should be rounded
            const isRounded = Math.random() < 0.3;
            const platformType = isRounded ? 'rounded' : 'normal';
            
            platforms.push(new Platform(platformX, platformY, platformWidth, platformHeight, platformType));
        }
        
        return platforms;
    }
    
    /**
     * Generate animals for the level
     * @param {Array} platforms - Array of platform objects
     * @returns {Array} - Array of animal objects
     */
    generateAnimals(platforms) {
        const animals = [];
        
        // Calculate spawn counts based on level width
        const rabbitCount = Math.floor(this.levelWidth / 1000 * this.difficultyParams.rabbitSpawnRate);
        const birdCount = Math.floor(this.levelWidth / 1000 * this.difficultyParams.birdSpawnRate);
        const squirrelCount = Math.floor(this.levelWidth / 1000 * this.difficultyParams.squirrelSpawnRate);
        const pigCount = Math.floor(this.levelWidth / 1000 * this.difficultyParams.pigSpawnRate);
        
        // Generate rabbits (on ground)
        for (let i = 0; i < rabbitCount; i++) {
            const x = Math.random() * (this.levelWidth - 100) + 50;
            
            // Find a ground platform at this x position
            const groundPlatform = this.findPlatformAt(x, this.groundHeight - 10, platforms);
            
            if (groundPlatform) {
                animals.push(new Rabbit(x, groundPlatform.y - 30));
            }
        }
        
        // Generate birds (in air)
        for (let i = 0; i < birdCount; i++) {
            const x = Math.random() * (this.levelWidth - 100) + 50;
            const y = Math.random() * (this.groundHeight - 200) + 50;
            
            animals.push(new Bird(x, y));
        }
        
        // Generate squirrels (on elevated platforms)
        for (let i = 0; i < squirrelCount; i++) {
            const x = Math.random() * (this.levelWidth - 100) + 50;
            
            // Find an elevated platform at this x position
            const elevatedPlatform = this.findElevatedPlatformAt(x, platforms);
            
            if (elevatedPlatform) {
                animals.push(new Squirrel(x, elevatedPlatform.y - 35));
            }
        }
        
        // Generate pigs (on ground, less common)
        for (let i = 0; i < pigCount; i++) {
            const x = Math.random() * (this.levelWidth - 100) + 50;
            
            // Find a ground platform at this x position
            const groundPlatform = this.findPlatformAt(x, this.groundHeight - 10, platforms);
            
            if (groundPlatform) {
                animals.push(new Pig(x, groundPlatform.y - 40));
            }
        }
        
        return animals;
    }
    
    /**
     * Find a platform at the specified position
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {Array} platforms - Array of platform objects
     * @returns {Object|null} - Platform object or null if not found
     */
    findPlatformAt(x, y, platforms) {
        for (const platform of platforms) {
            if (x >= platform.x && x <= platform.x + platform.width &&
                y >= platform.y - 5 && y <= platform.y + 5) {
                return platform;
            }
        }
        
        return null;
    }
    
    /**
     * Find an elevated platform at the specified x position
     * @param {number} x - X position
     * @param {Array} platforms - Array of platform objects
     * @returns {Object|null} - Platform object or null if not found
     */
    findElevatedPlatformAt(x, platforms) {
        // Filter for elevated platforms
        const elevatedPlatforms = platforms.filter(platform => 
            platform.y < this.groundHeight - 10 && 
            x >= platform.x && 
            x <= platform.x + platform.width
        );
        
        if (elevatedPlatforms.length > 0) {
            // Return a random platform from the filtered list
            return elevatedPlatforms[Math.floor(Math.random() * elevatedPlatforms.length)];
        }
        
        return null;
    }
    
    /**
     * Spawn a collectible at the specified position
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {string} type - Type of collectible ('bone' or 'treat')
     * @returns {Object} - Collectible object
     */
    spawnCollectible(x, y, type) {
        if (type === 'bone') {
            return new Bone(x, y);
        } else if (type === 'treat') {
            return new Treat(x, y);
        }
        
        // Default to bone
        return new Bone(x, y);
    }
}
