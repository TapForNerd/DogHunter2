/**
 * Main game class for Dog Hunter 2
 * Handles game loop, initialization, and state management
 */

class Game {
    constructor() {
        // Canvas setup
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.resizeCanvas();
        
        // Game state
        this.isRunning = false;
        this.isPaused = false;
        this.score = 0;
        this.currentLevel = 1;
        this.cameraX = 0;
        
        // Game objects
        this.physics = new Physics();
        this.levelGenerator = new LevelGenerator(this.canvas.width, this.canvas.height);
        this.player = null;
        this.level = null;
        this.ui = new UI(this);
        
        // Input handling
        this.keys = {
            left: false,
            right: false,
            jump: false,
            sprint: false
        };
        
        // Animation frame ID for cancellation
        this.animationFrameId = null;
        
        // Initialize event listeners
        this.initEventListeners();
        
        // Show start menu
        this.ui.showStartMenu();
    }
    
    /**
     * Initialize event listeners
     */
    initEventListeners() {
        // Resize event
        window.addEventListener('resize', () => this.resizeCanvas());
        
        // Keyboard events
        window.addEventListener('keydown', (e) => this.handleKeyDown(e));
        window.addEventListener('keyup', (e) => this.handleKeyUp(e));
        
        // Pause game when tab/window loses focus
        window.addEventListener('blur', () => {
            if (this.isRunning && !this.isPaused) {
                this.pause();
            }
        });
    }
    
    /**
     * Resize canvas to fit container
     */
    resizeCanvas() {
        const container = document.getElementById('game-container');
        this.canvas.width = container.clientWidth;
        this.canvas.height = container.clientHeight;
    }
    
    /**
     * Handle key down events
     * @param {KeyboardEvent} e - Key event
     */
    handleKeyDown(e) {
        if (!this.isRunning || this.isPaused) {
            // Handle menu navigation
            if (e.key === 'Escape' && this.isRunning) {
                this.togglePause();
            }
            return;
        }
        
        switch (e.key) {
            case 'ArrowLeft':
            case 'a':
            case 'A':
                this.keys.left = true;
                break;
            case 'ArrowRight':
            case 'd':
            case 'D':
                this.keys.right = true;
                break;
            case 'ArrowUp':
            case 'w':
            case 'W':
            case ' ':
                this.keys.jump = true;
                break;
            case 'Shift':
                this.keys.sprint = true;
                break;
            case 'Escape':
                this.togglePause();
                break;
        }
    }
    
    /**
     * Handle key up events
     * @param {KeyboardEvent} e - Key event
     */
    handleKeyUp(e) {
        switch (e.key) {
            case 'ArrowLeft':
            case 'a':
            case 'A':
                this.keys.left = false;
                break;
            case 'ArrowRight':
            case 'd':
            case 'D':
                this.keys.right = false;
                break;
            case 'ArrowUp':
            case 'w':
            case 'W':
            case ' ':
                this.keys.jump = false;
                break;
            case 'Shift':
                this.keys.sprint = false;
                break;
        }
    }
    
    /**
     * Start a new game
     */
    start() {
        // Reset game state
        this.score = 0;
        this.currentLevel = 1;
        this.cameraX = 0;
        
        // Generate level
        this.level = this.levelGenerator.generateLevel(this.currentLevel);
        
        // Create player
        this.player = new Player(100, this.canvas.height - 150);
        
        // Start game loop
        this.isRunning = true;
        this.isPaused = false;
        
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
        }
        
        this.gameLoop();
    }
    
    /**
     * Continue a saved game
     */
    continue() {
        const savedData = localStorage.getItem('dogHunter2SaveData');
        
        if (savedData) {
            try {
                const gameData = JSON.parse(savedData);
                
                // Restore game state
                this.score = gameData.score;
                this.currentLevel = gameData.level;
                
                // Generate level
                this.level = this.levelGenerator.generateLevel(this.currentLevel);
                
                // Create player with saved position
                this.player = new Player(gameData.playerX, gameData.playerY);
                
                // Start game loop
                this.isRunning = true;
                this.isPaused = false;
                
                if (this.animationFrameId) {
                    cancelAnimationFrame(this.animationFrameId);
                }
                
                this.gameLoop();
            } catch (error) {
                console.error('Error loading saved game:', error);
                this.start(); // Fall back to starting a new game
            }
        } else {
            this.start(); // No saved game, start a new one
        }
    }
    
    /**
     * Save the current game state
     */
    save() {
        if (!this.isRunning) return;
        
        const gameData = {
            score: this.score,
            level: this.currentLevel,
            playerX: this.player.x,
            playerY: this.player.y
        };
        
        localStorage.setItem('dogHunter2SaveData', JSON.stringify(gameData));
        this.ui.showNotification('Game saved!');
    }
    
    /**
     * Pause the game
     */
    pause() {
        if (!this.isRunning || this.isPaused) return;
        
        this.isPaused = true;
        this.ui.showPauseMenu();
        
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }
    }
    
    /**
     * Resume the game
     */
    resume() {
        if (!this.isRunning || !this.isPaused) return;
        
        this.isPaused = false;
        this.gameLoop();
    }
    
    /**
     * Toggle pause state
     */
    togglePause() {
        if (this.isPaused) {
            this.resume();
        } else {
            this.pause();
        }
    }
    
    /**
     * Quit the current game
     */
    quit() {
        this.isRunning = false;
        this.isPaused = false;
        
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }
    }
    
    /**
     * Restart the game
     */
    restart() {
        this.start();
    }
    
    /**
     * Game over
     */
    gameOver() {
        this.isRunning = false;
        
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }
        
        this.ui.showGameOverMenu();
    }
    
    /**
     * Advance to the next level
     */
    nextLevel() {
        this.currentLevel++;
        this.level = this.levelGenerator.generateLevel(this.currentLevel);
        
        // Reset player position but keep score
        this.player.x = 100;
        this.player.y = this.canvas.height - 150;
        this.cameraX = 0;
        
        // Reset player status effects
        this.player.resetStatusEffects();
        
        this.ui.showNotification(`Level ${this.currentLevel}!`, 3000);
    }
    
    /**
     * Main game loop
     */
    gameLoop() {
        if (!this.isRunning || this.isPaused) return;
        
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Update game state
        this.update();
        
        // Render game
        this.render();
        
        // Schedule next frame
        this.animationFrameId = requestAnimationFrame(() => this.gameLoop());
    }
    
    /**
     * Update game state
     */
    update() {
        // Update player
        this.player.update(this.physics, this.level.platforms, this.keys);
        
        // Update camera position to follow player
        this.updateCamera();
        
        // Update animals
        for (const animal of this.level.animals) {
            if (animal.isActive) {
                animal.update(this.physics, this.level.platforms);
                
                // Check collision with player
                if (this.physics.checkEntityCollision(this.player, animal)) {
                    // Catch animal
                    animal.isActive = false;
                    this.score += animal.points;
                    
                    // Check for sickness from pig
                    if (animal.type === 'pig' && Math.random() < animal.sicknessChance) {
                        this.player.applySickness();
                    }
                    
                    // Chance to drop collectible
                    if (Math.random() < 0.3) { // 30% chance for bone
                        this.level.collectibles.push(
                            this.levelGenerator.spawnCollectible(animal.x, animal.y, 'bone')
                        );
                    } else if (Math.random() < 0.1) { // 10% chance for treat
                        this.level.collectibles.push(
                            this.levelGenerator.spawnCollectible(animal.x, animal.y, 'treat')
                        );
                    }
                }
            }
        }
        
        // Update collectibles
        for (let i = this.level.collectibles.length - 1; i >= 0; i--) {
            const collectible = this.level.collectibles[i];
            
            if (collectible.isActive) {
                collectible.update(this.physics, this.level.platforms);
                
                // Check collision with player
                if (this.physics.checkEntityCollision(this.player, collectible)) {
                    // Collect item
                    collectible.isActive = false;
                    this.score += collectible.points;
                    
                    // Apply effect for treats
                    if (collectible.type === 'treat') {
                        this.player.applyPowerUp();
                    }
                    
                    // Remove from array
                    this.level.collectibles.splice(i, 1);
                }
            }
        }
        
        // Check if player fell off the level
        if (this.player.y > this.canvas.height + 100) {
            this.gameOver();
            return;
        }
        
        // Check if player reached the end of the level
        if (this.player.x > this.level.width - 100) {
            this.nextLevel();
            return;
        }
        
        // Check if player has enough points to advance
        if (this.score >= this.level.pointsToAdvance) {
            this.nextLevel();
            return;
        }
        
        // Update UI
        this.ui.update();
    }
    
    /**
     * Update camera position to follow player
     */
    updateCamera() {
        // Target camera position (centered on player)
        const targetX = this.player.x - this.canvas.width / 2 + this.player.width / 2;
        
        // Smooth camera movement
        this.cameraX += (targetX - this.cameraX) * 0.1;
        
        // Clamp camera to level bounds
        this.cameraX = Math.max(0, Math.min(this.cameraX, this.level.width - this.canvas.width));
    }
    
    /**
     * Render game
     */
    render() {
        // Draw background
        this.ui.drawBackground(this.ctx, this.cameraX);
        
        // Draw platforms
        for (const platform of this.level.platforms) {
            if (this.physics.isOnScreen(platform, this.canvas.width, this.canvas.height, this.cameraX)) {
                platform.draw(this.ctx, this.cameraX);
            }
        }
        
        // Draw collectibles
        for (const collectible of this.level.collectibles) {
            if (collectible.isActive && this.physics.isOnScreen(collectible, this.canvas.width, this.canvas.height, this.cameraX)) {
                collectible.draw(this.ctx, this.cameraX);
            }
        }
        
        // Draw animals
        for (const animal of this.level.animals) {
            if (animal.isActive && this.physics.isOnScreen(animal, this.canvas.width, this.canvas.height, this.cameraX)) {
                animal.draw(this.ctx, this.cameraX);
            }
        }
        
        // Draw player
        this.player.draw(this.ctx, this.cameraX);
        
        // Draw level completion indicator
        this.drawLevelCompletion();
    }
    
    /**
     * Draw level completion indicator
     */
    drawLevelCompletion() {
        // Draw progress bar at the top of the screen
        const progressWidth = 200;
        const progressHeight = 10;
        const progressX = this.canvas.width - progressWidth - 10;
        const progressY = 10;
        
        // Background
        this.ctx.fillStyle = '#333';
        this.ctx.fillRect(progressX, progressY, progressWidth, progressHeight);
        
        // Progress
        const progress = Math.min(this.score / this.level.pointsToAdvance, 1);
        this.ctx.fillStyle = '#4CAF50';
        this.ctx.fillRect(progressX, progressY, progressWidth * progress, progressHeight);
        
        // Border
        this.ctx.strokeStyle = '#fff';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(progressX, progressY, progressWidth, progressHeight);
    }
}

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const game = new Game();
});
