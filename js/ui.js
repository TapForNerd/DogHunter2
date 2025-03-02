/**
 * UI system for Dog Hunter 2
 * Handles score display, menus, and game state indicators
 */

class UI {
    constructor(game) {
        this.game = game;
        
        // UI elements
        this.scoreElement = document.getElementById('score');
        this.levelElement = document.getElementById('level');
        this.sprintMeterElement = document.getElementById('sprint-meter');
        
        // Menu elements
        this.menuContainer = document.getElementById('menu-container');
        this.startMenu = document.getElementById('start-menu');
        this.pauseMenu = document.getElementById('pause-menu');
        this.gameOverMenu = document.getElementById('game-over-menu');
        this.finalScoreElement = document.getElementById('final-score');
        
        // Buttons
        this.startButton = document.getElementById('start-button');
        this.continueButton = document.getElementById('continue-button');
        this.resumeButton = document.getElementById('resume-button');
        this.saveButton = document.getElementById('save-button');
        this.quitButton = document.getElementById('quit-button');
        this.restartButton = document.getElementById('restart-button');
        this.menuButton = document.getElementById('menu-button');
        
        // Status effect indicators
        this.statusEffectIndicator = null;
        
        // Initialize event listeners
        this.initEventListeners();
    }
    
    /**
     * Initialize event listeners for UI elements
     */
    initEventListeners() {
        // Start button
        this.startButton.addEventListener('click', () => {
            this.hideAllMenus();
            this.game.start();
        });
        
        // Continue button
        this.continueButton.addEventListener('click', () => {
            this.hideAllMenus();
            this.game.continue();
        });
        
        // Resume button
        this.resumeButton.addEventListener('click', () => {
            this.hideAllMenus();
            this.game.resume();
        });
        
        // Save button
        this.saveButton.addEventListener('click', () => {
            this.game.save();
        });
        
        // Quit button
        this.quitButton.addEventListener('click', () => {
            this.showStartMenu();
            this.game.quit();
        });
        
        // Restart button
        this.restartButton.addEventListener('click', () => {
            this.hideAllMenus();
            this.game.restart();
        });
        
        // Menu button
        this.menuButton.addEventListener('click', () => {
            this.showStartMenu();
            this.game.quit();
        });
    }
    
    /**
     * Update UI elements
     */
    update() {
        // Update score
        this.scoreElement.textContent = this.game.score;
        
        // Update level
        this.levelElement.textContent = this.game.currentLevel;
        
        // Update sprint meter
        if (this.game.player) {
            const sprintPercentage = (this.game.player.sprintMeter / this.game.player.maxSprintMeter) * 100;
            this.sprintMeterElement.style.setProperty('--sprint-meter', `${sprintPercentage}%`);
            
            // Update sprint cooldown indicator
            if (this.game.player.sprintCooldown) {
                this.sprintMeterElement.classList.add('sprint-cooldown');
            } else {
                this.sprintMeterElement.classList.remove('sprint-cooldown');
            }
            
            // Update status effect indicators
            this.updateStatusEffects();
        }
    }
    
    /**
     * Update status effect indicators
     */
    updateStatusEffects() {
        // Remove existing indicator if any
        if (this.statusEffectIndicator) {
            this.statusEffectIndicator.remove();
            this.statusEffectIndicator = null;
        }
        
        // Create new indicator if needed
        if (this.game.player.isPoweredUp) {
            this.createStatusEffectIndicator('Power-Up!', 'power-up');
        } else if (this.game.player.isSick) {
            this.createStatusEffectIndicator('Sick!', 'sick');
        }
    }
    
    /**
     * Create a status effect indicator
     * @param {string} text - Text to display
     * @param {string} className - CSS class for styling
     */
    createStatusEffectIndicator(text, className) {
        this.statusEffectIndicator = document.createElement('div');
        this.statusEffectIndicator.className = `status-effect ${className}`;
        this.statusEffectIndicator.textContent = text;
        document.getElementById('game-container').appendChild(this.statusEffectIndicator);
    }
    
    /**
     * Show the start menu
     */
    showStartMenu() {
        this.hideAllMenus();
        this.menuContainer.style.display = 'flex';
        this.startMenu.classList.add('active');
        
        // Check if there's a saved game
        const savedGame = localStorage.getItem('dogHunter2SaveData');
        if (savedGame) {
            this.continueButton.style.display = 'block';
        } else {
            this.continueButton.style.display = 'none';
        }
    }
    
    /**
     * Show the pause menu
     */
    showPauseMenu() {
        this.hideAllMenus();
        this.menuContainer.style.display = 'flex';
        this.pauseMenu.classList.add('active');
    }
    
    /**
     * Show the game over menu
     */
    showGameOverMenu() {
        this.hideAllMenus();
        this.menuContainer.style.display = 'flex';
        this.gameOverMenu.classList.add('active');
        this.finalScoreElement.textContent = `Score: ${this.game.score}`;
    }
    
    /**
     * Hide all menus
     */
    hideAllMenus() {
        this.menuContainer.style.display = 'none';
        this.startMenu.classList.remove('active');
        this.pauseMenu.classList.remove('active');
        this.gameOverMenu.classList.remove('active');
    }
    
    /**
     * Show a notification message
     * @param {string} message - Message to display
     * @param {number} duration - Duration in milliseconds
     */
    showNotification(message, duration = 2000) {
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        document.getElementById('game-container').appendChild(notification);
        
        // Fade in
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);
        
        // Fade out and remove
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                notification.remove();
            }, 500);
        }, duration);
    }
    
    /**
     * Draw background elements
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {number} cameraX - Camera X position
     */
    drawBackground(ctx, cameraX) {
        // Sky gradient
        const gradient = ctx.createLinearGradient(0, 0, 0, this.game.canvas.height);
        gradient.addColorStop(0, '#87CEEB'); // Sky blue
        gradient.addColorStop(1, '#E0F7FA'); // Light blue
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, this.game.canvas.width, this.game.canvas.height);
        
        // Draw clouds
        this.drawClouds(ctx, cameraX);
        
        // Draw distant hills
        this.drawDistantHills(ctx, cameraX);
    }
    
    /**
     * Draw clouds in the background
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {number} cameraX - Camera X position
     */
    drawClouds(ctx, cameraX) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        
        // Generate clouds based on camera position
        const cloudSeed = Math.floor(cameraX / 500);
        const cloudCount = 5;
        
        for (let i = 0; i < cloudCount; i++) {
            const seed = (cloudSeed + i) * 1000;
            const x = (seed % 1000) + (i * 500) - (cameraX * 0.2); // Parallax effect
            const y = ((seed * 7) % 100) + 50;
            const width = ((seed * 13) % 100) + 100;
            const height = ((seed * 17) % 50) + 30;
            
            // Draw cloud as a collection of circles
            const centerX = x + width / 2;
            const centerY = y + height / 2;
            const radiusX = width / 2;
            const radiusY = height / 2;
            
            ctx.beginPath();
            ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, Math.PI * 2);
            ctx.fill();
            
            // Add some smaller circles for fluffiness
            const smallCircleCount = 5;
            for (let j = 0; j < smallCircleCount; j++) {
                const angle = (j / smallCircleCount) * Math.PI * 2;
                const distance = radiusX * 0.7;
                const smallX = centerX + Math.cos(angle) * distance;
                const smallY = centerY + Math.sin(angle) * distance;
                const smallRadius = ((seed * (j + 1) * 19) % 20) + 20;
                
                ctx.beginPath();
                ctx.arc(smallX, smallY, smallRadius, 0, Math.PI * 2);
                ctx.fill();
            }
        }
    }
    
    /**
     * Draw distant hills in the background
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {number} cameraX - Camera X position
     */
    drawDistantHills(ctx, cameraX) {
        ctx.fillStyle = '#9CCC65'; // Light green
        
        // Generate hills based on camera position
        const hillSeed = Math.floor(cameraX / 800);
        const hillCount = 4;
        
        for (let i = 0; i < hillCount; i++) {
            const seed = (hillSeed + i) * 1000;
            const x = (seed % 1000) + (i * 800) - (cameraX * 0.5); // Parallax effect
            const width = ((seed * 13) % 200) + 400;
            const height = ((seed * 17) % 100) + 100;
            
            // Draw hill as a semi-ellipse
            const centerX = x + width / 2;
            const bottomY = this.game.canvas.height - 50;
            
            ctx.beginPath();
            ctx.moveTo(x, bottomY);
            
            // Draw the top curve of the hill
            for (let j = 0; j <= width; j += 10) {
                const curveX = x + j;
                const normalizedX = j / width;
                const curveY = bottomY - height * Math.sin(normalizedX * Math.PI);
                ctx.lineTo(curveX, curveY);
            }
            
            ctx.lineTo(x + width, bottomY);
            ctx.closePath();
            ctx.fill();
        }
    }
}
