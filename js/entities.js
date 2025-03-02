/**
 * Entities for Dog Hunter 2
 * Handles animals, collectibles, and obstacles
 */

/**
 * Base Entity class
 */
class Entity {
    constructor(x, y, width, height, type) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.type = type;
        this.velocityX = 0;
        this.velocityY = 0;
        this.isOnGround = false;
        this.isFlying = false;
        this.isActive = true;
        this.sprite = new Image();
        
        // Animation properties
        this.frameX = 0;
        this.frameY = 0;
        this.frameCount = 1;
        this.frameTimer = 0;
        this.frameInterval = 10;
    }
    
    /**
     * Update entity state
     * @param {Object} physics - Physics system
     * @param {Array} platforms - Array of platform objects
     */
    update(physics, platforms) {
        // Apply physics
        physics.applyGravity(this);
        physics.updatePosition(this);
        
        if (!this.isFlying) {
            physics.checkGroundCollision(this, platforms);
        }
        
        // Update animation
        this.updateAnimation();
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
     * Draw the entity
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {number} cameraX - Camera X position
     */
    draw(ctx, cameraX) {
        ctx.drawImage(this.sprite, this.x - cameraX, this.y, this.width, this.height);
    }
}

/**
 * Rabbit class - runs along the ground
 */
class Rabbit extends Entity {
    constructor(x, y) {
        super(x, y, 40, 30, 'rabbit');
        this.sprite.src = 'rabbit.png';
        this.speed = 3;
        this.jumpProbability = 0.01;
        this.jumpPower = 8;
        this.direction = Math.random() > 0.5 ? 1 : -1;
        this.directionChangeTimer = 0;
        this.directionChangeCooldown = 120;
        this.points = 10;
    }
    
    update(physics, platforms) {
        // Random direction change
        this.directionChangeTimer++;
        if (this.directionChangeTimer >= this.directionChangeCooldown) {
            this.directionChangeTimer = 0;
            this.direction = -this.direction;
        }
        
        // Random jumping
        if (this.isOnGround && Math.random() < this.jumpProbability) {
            this.velocityY = -this.jumpPower;
            this.isOnGround = false;
        }
        
        // Apply movement
        this.velocityX = this.direction * this.speed;
        
        // Call parent update
        super.update(physics, platforms);
        
        // Change direction if hitting a wall or edge of platform
        if (this.x <= 0) {
            this.direction = 1;
        }
        
        // Check if at edge of platform
        let onPlatformEdge = true;
        for (const platform of platforms) {
            if (this.direction > 0) {
                // Check if there's a platform ahead
                if (this.x + this.width + 10 >= platform.x && 
                    this.x <= platform.x + platform.width &&
                    this.y + this.height >= platform.y &&
                    this.y <= platform.y + 10) {
                    onPlatformEdge = false;
                    break;
                }
            } else {
                // Check if there's a platform behind
                if (this.x - 10 <= platform.x + platform.width && 
                    this.x + this.width >= platform.x &&
                    this.y + this.height >= platform.y &&
                    this.y <= platform.y + 10) {
                    onPlatformEdge = false;
                    break;
                }
            }
        }
        
        if (onPlatformEdge && this.isOnGround) {
            this.direction = -this.direction;
        }
    }
    
    draw(ctx, cameraX) {
        ctx.save();
        
        // Flip horizontally based on direction
        if (this.direction === -1) {
            ctx.translate(this.x + this.width - cameraX, this.y);
            ctx.scale(-1, 1);
            ctx.drawImage(this.sprite, 0, 0, this.width, this.height);
        } else {
            ctx.drawImage(this.sprite, this.x - cameraX, this.y, this.width, this.height);
        }
        
        ctx.restore();
    }
}

/**
 * Bird class - flies in patterns
 */
class Bird extends Entity {
    constructor(x, y) {
        super(x, y, 40, 30, 'bird');
        this.sprite.src = 'bird.png';
        this.isFlying = true;
        this.speed = 4;
        this.direction = Math.random() > 0.5 ? 1 : -1;
        this.verticalDirection = Math.random() > 0.5 ? 1 : -1;
        this.directionChangeTimer = 0;
        this.directionChangeCooldown = 180;
        this.points = 10;
        
        // Flying pattern
        this.baseY = y;
        this.amplitude = 50;
        this.frequency = 0.02;
        this.time = Math.random() * 100;
    }
    
    update(physics, platforms) {
        // Update time for flying pattern
        this.time++;
        
        // Random direction change
        this.directionChangeTimer++;
        if (this.directionChangeTimer >= this.directionChangeCooldown) {
            this.directionChangeTimer = 0;
            this.direction = -this.direction;
        }
        
        // Apply horizontal movement
        this.velocityX = this.direction * this.speed;
        
        // Apply vertical movement based on sine wave
        this.y = this.baseY + Math.sin(this.time * this.frequency) * this.amplitude;
        
        // Update position based on velocity (horizontal only)
        this.x += this.velocityX;
        
        // Change direction if hitting a wall
        if (this.x <= 0) {
            this.direction = 1;
        }
        
        // Update animation
        this.updateAnimation();
    }
    
    draw(ctx, cameraX) {
        ctx.save();
        
        // Flip horizontally based on direction
        if (this.direction === -1) {
            ctx.translate(this.x + this.width - cameraX, this.y);
            ctx.scale(-1, 1);
            ctx.drawImage(this.sprite, 0, 0, this.width, this.height);
        } else {
            ctx.drawImage(this.sprite, this.x - cameraX, this.y, this.width, this.height);
        }
        
        ctx.restore();
    }
}

/**
 * Squirrel class - moves along platforms and can climb
 */
class Squirrel extends Entity {
    constructor(x, y) {
        super(x, y, 35, 35, 'squirrel');
        this.sprite.src = 'squirrel.png';
        this.speed = 3.5;
        this.direction = Math.random() > 0.5 ? 1 : -1;
        this.directionChangeTimer = 0;
        this.directionChangeCooldown = 150;
        this.isClimbing = false;
        this.climbSpeed = 2;
        this.points = 10;
    }
    
    update(physics, platforms) {
        // Random direction change
        this.directionChangeTimer++;
        if (this.directionChangeTimer >= this.directionChangeCooldown) {
            this.directionChangeTimer = 0;
            this.direction = -this.direction;
        }
        
        // Check if can climb
        this.isClimbing = false;
        for (const platform of platforms) {
            // Check if at edge of platform and there's another platform above/below
            if (Math.abs(this.x - platform.x) < 10 || 
                Math.abs(this.x + this.width - (platform.x + platform.width)) < 10) {
                
                for (const otherPlatform of platforms) {
                    if (platform !== otherPlatform) {
                        // Check if other platform is above/below and aligned
                        if (Math.abs(this.x - otherPlatform.x) < 50 || 
                            Math.abs(this.x + this.width - (otherPlatform.x + otherPlatform.width)) < 50) {
                            
                            if (otherPlatform.y < this.y && this.y - otherPlatform.y < 150) {
                                // Platform above, can climb up
                                this.isClimbing = true;
                                this.velocityY = -this.climbSpeed;
                                break;
                            } else if (otherPlatform.y > this.y + this.height && 
                                      otherPlatform.y - (this.y + this.height) < 150) {
                                // Platform below, can climb down
                                this.isClimbing = true;
                                this.velocityY = this.climbSpeed;
                                break;
                            }
                        }
                    }
                }
                
                if (this.isClimbing) {
                    break;
                }
            }
        }
        
        // Apply movement
        if (!this.isClimbing) {
            this.velocityX = this.direction * this.speed;
        } else {
            this.velocityX = 0;
        }
        
        // Call parent update if not climbing
        if (!this.isClimbing) {
            super.update(physics, platforms);
        } else {
            // Just update position for climbing
            this.x += this.velocityX;
            this.y += this.velocityY;
            this.updateAnimation();
        }
        
        // Change direction if hitting a wall or edge of platform
        if (this.x <= 0) {
            this.direction = 1;
        }
        
        // Check if at edge of platform
        if (!this.isClimbing) {
            let onPlatformEdge = true;
            for (const platform of platforms) {
                if (this.direction > 0) {
                    // Check if there's a platform ahead
                    if (this.x + this.width + 10 >= platform.x && 
                        this.x <= platform.x + platform.width &&
                        this.y + this.height >= platform.y &&
                        this.y <= platform.y + 10) {
                        onPlatformEdge = false;
                        break;
                    }
                } else {
                    // Check if there's a platform behind
                    if (this.x - 10 <= platform.x + platform.width && 
                        this.x + this.width >= platform.x &&
                        this.y + this.height >= platform.y &&
                        this.y <= platform.y + 10) {
                        onPlatformEdge = false;
                        break;
                    }
                }
            }
            
            if (onPlatformEdge && this.isOnGround) {
                this.direction = -this.direction;
            }
        }
    }
    
    draw(ctx, cameraX) {
        ctx.save();
        
        // Flip horizontally based on direction
        if (this.direction === -1) {
            ctx.translate(this.x + this.width - cameraX, this.y);
            ctx.scale(-1, 1);
            ctx.drawImage(this.sprite, 0, 0, this.width, this.height);
        } else {
            ctx.drawImage(this.sprite, this.x - cameraX, this.y, this.width, this.height);
        }
        
        ctx.restore();
    }
}

/**
 * Pig class - slower but worth more points, chance to cause sickness
 */
class Pig extends Entity {
    constructor(x, y) {
        super(x, y, 50, 40, 'pig');
        this.sprite.src = 'pig.png';
        this.speed = 2;
        this.direction = Math.random() > 0.5 ? 1 : -1;
        this.directionChangeTimer = 0;
        this.directionChangeCooldown = 200;
        this.points = 20;
        this.sicknessChance = 1/3;
    }
    
    update(physics, platforms) {
        // Random direction change
        this.directionChangeTimer++;
        if (this.directionChangeTimer >= this.directionChangeCooldown) {
            this.directionChangeTimer = 0;
            this.direction = -this.direction;
        }
        
        // Apply movement
        this.velocityX = this.direction * this.speed;
        
        // Call parent update
        super.update(physics, platforms);
        
        // Change direction if hitting a wall or edge of platform
        if (this.x <= 0) {
            this.direction = 1;
        }
        
        // Check if at edge of platform
        let onPlatformEdge = true;
        for (const platform of platforms) {
            if (this.direction > 0) {
                // Check if there's a platform ahead
                if (this.x + this.width + 10 >= platform.x && 
                    this.x <= platform.x + platform.width &&
                    this.y + this.height >= platform.y &&
                    this.y <= platform.y + 10) {
                    onPlatformEdge = false;
                    break;
                }
            } else {
                // Check if there's a platform behind
                if (this.x - 10 <= platform.x + platform.width && 
                    this.x + this.width >= platform.x &&
                    this.y + this.height >= platform.y &&
                    this.y <= platform.y + 10) {
                    onPlatformEdge = false;
                    break;
                }
            }
        }
        
        if (onPlatformEdge && this.isOnGround) {
            this.direction = -this.direction;
        }
    }
    
    draw(ctx, cameraX) {
        ctx.save();
        
        // Flip horizontally based on direction
        if (this.direction === -1) {
            ctx.translate(this.x + this.width - cameraX, this.y);
            ctx.scale(-1, 1);
            ctx.drawImage(this.sprite, 0, 0, this.width, this.height);
        } else {
            ctx.drawImage(this.sprite, this.x - cameraX, this.y, this.width, this.height);
        }
        
        ctx.restore();
    }
}

/**
 * Collectible class - base class for bones and treats
 */
class Collectible extends Entity {
    constructor(x, y, width, height, type) {
        super(x, y, width, height, type);
        this.velocityY = -5; // Initial upward velocity
        this.rotationAngle = 0;
        this.rotationSpeed = 0.05;
    }
    
    update(physics, platforms) {
        // Apply physics
        physics.applyGravity(this);
        physics.updatePosition(this);
        physics.checkGroundCollision(this, platforms);
        
        // Update rotation
        this.rotationAngle += this.rotationSpeed;
        if (this.rotationAngle > Math.PI * 2) {
            this.rotationAngle -= Math.PI * 2;
        }
    }
    
    draw(ctx, cameraX) {
        ctx.save();
        
        // Apply rotation
        ctx.translate(this.x + this.width / 2 - cameraX, this.y + this.height / 2);
        ctx.rotate(this.rotationAngle);
        ctx.drawImage(this.sprite, -this.width / 2, -this.height / 2, this.width, this.height);
        
        ctx.restore();
    }
}

/**
 * Bone class - dropped by animals when caught
 */
class Bone extends Collectible {
    constructor(x, y) {
        super(x, y, 30, 15, 'bone');
        this.sprite.src = 'bone.png';
        this.points = 5;
    }
}

/**
 * Treat class - provides temporary speed boost
 */
class Treat extends Collectible {
    constructor(x, y) {
        super(x, y, 25, 25, 'treat');
        this.sprite.src = 'treat.png';
        this.points = 10;
    }
}

/**
 * Platform class - terrain for entities to stand on
 */
class Platform {
    constructor(x, y, width, height, type = 'normal') {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.type = type;
    }
    
    /**
     * Draw the platform
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {number} cameraX - Camera X position
     */
    draw(ctx, cameraX) {
        ctx.fillStyle = '#8BC34A'; // Green color for platforms
        
        if (this.type === 'rounded') {
            // Draw rounded rectangle
            const radius = 20;
            ctx.beginPath();
            ctx.moveTo(this.x - cameraX + radius, this.y);
            ctx.lineTo(this.x - cameraX + this.width - radius, this.y);
            ctx.quadraticCurveTo(this.x - cameraX + this.width, this.y, this.x - cameraX + this.width, this.y + radius);
            ctx.lineTo(this.x - cameraX + this.width, this.y + this.height - radius);
            ctx.quadraticCurveTo(this.x - cameraX + this.width, this.y + this.height, this.x - cameraX + this.width - radius, this.y + this.height);
            ctx.lineTo(this.x - cameraX + radius, this.y + this.height);
            ctx.quadraticCurveTo(this.x - cameraX, this.y + this.height, this.x - cameraX, this.y + this.height - radius);
            ctx.lineTo(this.x - cameraX, this.y + radius);
            ctx.quadraticCurveTo(this.x - cameraX, this.y, this.x - cameraX + radius, this.y);
            ctx.closePath();
            ctx.fill();
        } else {
            // Draw regular rectangle
            ctx.fillRect(this.x - cameraX, this.y, this.width, this.height);
        }
        
        // Draw grass on top
        ctx.fillStyle = '#9CCC65';
        ctx.fillRect(this.x - cameraX, this.y, this.width, 5);
    }
}
