/**
 * Player class for Dog Hunter 2
 * Handles dog character controls and states
 */

class Player {
    constructor(x, y) {
        // Position and dimensions
        this.x = x;
        this.y = y;
        this.width = 50;
        this.height = 50;
        
        // Movement properties
        this.velocityX = 0;
        this.velocityY = 0;
        this.speed = 5;
        this.sprintSpeed = 8;
        this.jumpPower = 12;
        this.isOnGround = false;
        this.isFlying = false;
        this.direction = 1; // 1 for right, -1 for left
        
        // Sprint properties
        this.isSprinting = false;
        this.sprintMeter = 100;
        this.maxSprintMeter = 100;
        this.sprintDrainRate = 2;
        this.sprintRechargeRate = 1;
        this.sprintCooldown = false;
        
        // Status effects
        this.isPoweredUp = false;
        this.isSick = false;
        this.statusEffectTimer = 0;
        
        // Visual properties
        this.sprite = new Image();
        this.sprite.src = 'dog.png';
        this.pooSprite = new Image();
        this.pooSprite.src = 'poo.png';
        this.pooOrbitAngle = 0;
        this.pooOrbitRadius = 30;
        
        // Animation properties
        this.frameX = 0;
        this.frameY = 0;
        this.frameCount = 1; // Will be updated when sprite is loaded
        this.frameTimer = 0;
        this.frameInterval = 10; // Update frame every 10 game ticks
    }
    
    /**
     * Update player state
     * @param {Object} physics - Physics system
     * @param {Array} platforms - Array of platform objects
     * @param {Object} keys - Keyboard state
     */
    update(physics, platforms, keys) {
        // Handle movement
        if (keys.left) {
            physics.moveHorizontal(this, -1);
            this.direction = -1;
        } else if (keys.right) {
            physics.moveHorizontal(this, 1);
            this.direction = 1;
        }
        
        // Handle jumping
        if (keys.jump && this.isOnGround) {
            physics.jump(this);
        }
        
        // Handle sprinting
        this.handleSprint(keys.sprint);
        
        // Apply status effects
        this.updateStatusEffects();
        
        // Apply physics
        physics.applyGravity(this);
        physics.updatePosition(this);
        physics.checkGroundCollision(this, platforms);
        
        // Update animation
        this.updateAnimation();
    }
    
    /**
     * Handle sprint mechanics
     * @param {boolean} sprintKeyPressed - Whether the sprint key is pressed
     */
    handleSprint(sprintKeyPressed) {
        // Can't sprint if on cooldown or sick
        if (this.sprintCooldown || this.isSick) {
            this.isSprinting = false;
            return;
        }
        
        // Start/continue sprinting
        if (sprintKeyPressed && this.sprintMeter > 0) {
            this.isSprinting = true;
            this.sprintMeter -= this.sprintDrainRate;
            
            // Apply power-up effect if active
            if (this.isPoweredUp) {
                this.sprintMeter -= this.sprintDrainRate * 0.5; // Drain slower when powered up
            }
            
            // Enter cooldown if meter is depleted
            if (this.sprintMeter <= 0) {
                this.sprintMeter = 0;
                this.sprintCooldown = true;
                this.isSprinting = false;
                
                // Set timeout to exit cooldown
                setTimeout(() => {
                    this.sprintCooldown = false;
                }, 2000);
            }
        } else {
            // Not sprinting, recharge meter
            this.isSprinting = false;
            if (!this.sprintCooldown && this.sprintMeter < this.maxSprintMeter) {
                this.sprintMeter += this.sprintRechargeRate;
                if (this.sprintMeter > this.maxSprintMeter) {
                    this.sprintMeter = this.maxSprintMeter;
                }
            }
        }
    }
    
    /**
     * Update status effects
     */
    updateStatusEffects() {
        // Update status effect timer
        if (this.isPoweredUp || this.isSick) {
            this.statusEffectTimer--;
            
            if (this.statusEffectTimer <= 0) {
                this.isPoweredUp = false;
                this.isSick = false;
            }
        }
        
        // Update poo orbit angle for sick effect
        if (this.isSick) {
            this.pooOrbitAngle += 0.05;
            if (this.pooOrbitAngle > Math.PI * 2) {
                this.pooOrbitAngle -= Math.PI * 2;
            }
        }
    }
    
    /**
     * Apply power-up effect
     * @param {number} duration - Duration of the effect in frames
     */
    applyPowerUp(duration = 300) { // 5 seconds at 60 FPS
        this.isPoweredUp = true;
        this.isSick = false; // Power-up cures sickness
        this.statusEffectTimer = duration;
        this.speed = 7; // Increased base speed
        this.sprintSpeed = 11; // Increased sprint speed
    }
    
    /**
     * Apply sickness effect
     * @param {number} duration - Duration of the effect in frames
     */
    applySickness(duration = 900) { // 15 seconds at 60 FPS
        this.isSick = true;
        this.isPoweredUp = false; // Sickness overrides power-up
        this.statusEffectTimer = duration;
        this.speed = 3; // Reduced base speed
        this.sprintSpeed = 5; // Reduced sprint speed
    }
    
    /**
     * Reset status effects
     */
    resetStatusEffects() {
        this.isPoweredUp = false;
        this.isSick = false;
        this.statusEffectTimer = 0;
        this.speed = 5; // Reset to default speed
        this.sprintSpeed = 8; // Reset to default sprint speed
    }
    
    /**
     * Update animation frame
     */
    updateAnimation() {
        this.frameTimer++;
        
        if (this.frameTimer >= this.frameInterval) {
            this.frameTimer = 0;
            
            // Update animation frame
            this.frameX++;
            if (this.frameX >= this.frameCount) {
                this.frameX = 0;
            }
        }
    }
    
    /**
     * Draw the player
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {number} cameraX - Camera X position
     */
    draw(ctx, cameraX) {
        // Draw the dog sprite
        ctx.save();
        
        // Flip horizontally if facing left
        if (this.direction === -1) {
            ctx.translate(this.x + this.width - cameraX, this.y);
            ctx.scale(-1, 1);
            ctx.drawImage(this.sprite, 0, 0, this.width, this.height);
        } else {
            ctx.drawImage(this.sprite, this.x - cameraX, this.y, this.width, this.height);
        }
        
        ctx.restore();
        
        // Draw poo orbiting if sick
        if (this.isSick) {
            const pooX = this.x + this.width / 2 + Math.cos(this.pooOrbitAngle) * this.pooOrbitRadius - cameraX;
            const pooY = this.y + this.height / 2 + Math.sin(this.pooOrbitAngle) * this.pooOrbitRadius;
            const pooSize = 20;
            
            ctx.drawImage(this.pooSprite, pooX - pooSize / 2, pooY - pooSize / 2, pooSize, pooSize);
        }
        
        // Visual indicator for power-up
        if (this.isPoweredUp) {
            ctx.save();
            ctx.globalAlpha = 0.3;
            ctx.fillStyle = '#4CAF50';
            ctx.beginPath();
            ctx.arc(this.x + this.width / 2 - cameraX, this.y + this.height / 2, this.width * 0.7, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
    }
}
