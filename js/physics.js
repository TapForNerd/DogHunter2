/**
 * Physics system for Dog Hunter 2
 * Handles collision detection, gravity, and jumping mechanics
 */

class Physics {
    constructor(gravity = 0.5) {
        this.gravity = gravity;
    }

    /**
     * Apply gravity to an entity
     * @param {Object} entity - The entity to apply gravity to
     */
    applyGravity(entity) {
        if (!entity.isOnGround && !entity.isFlying) {
            entity.velocityY += this.gravity;
        }
    }

    /**
     * Check if an entity is on the ground
     * @param {Object} entity - The entity to check
     * @param {Array} platforms - Array of platform objects
     * @returns {boolean} - Whether the entity is on the ground
     */
    checkGroundCollision(entity, platforms) {
        // Reset ground state
        entity.isOnGround = false;
        
        for (const platform of platforms) {
            // Check if entity is above the platform
            if (entity.x + entity.width > platform.x && 
                entity.x < platform.x + platform.width) {
                
                // Check if entity is landing on the platform
                const entityBottom = entity.y + entity.height;
                const platformTop = platform.y;
                
                // If entity was above the platform in the previous frame
                // and is now colliding or below, snap to the platform
                if (entityBottom >= platformTop && 
                    entityBottom - entity.velocityY < platformTop + 5) {
                    entity.y = platformTop - entity.height;
                    entity.velocityY = 0;
                    entity.isOnGround = true;
                    return true;
                }
            }
        }
        
        return false;
    }

    /**
     * Check if an entity collides with another entity
     * @param {Object} entity1 - First entity
     * @param {Object} entity2 - Second entity
     * @returns {boolean} - Whether the entities collide
     */
    checkEntityCollision(entity1, entity2) {
        return (
            entity1.x < entity2.x + entity2.width &&
            entity1.x + entity1.width > entity2.x &&
            entity1.y < entity2.y + entity2.height &&
            entity1.y + entity1.height > entity2.y
        );
    }

    /**
     * Check if an entity is within the screen bounds
     * @param {Object} entity - The entity to check
     * @param {number} canvasWidth - Width of the canvas
     * @param {number} canvasHeight - Height of the canvas
     * @param {number} cameraX - Camera X position
     * @returns {boolean} - Whether the entity is within the screen bounds
     */
    isOnScreen(entity, canvasWidth, canvasHeight, cameraX) {
        return (
            entity.x + entity.width > cameraX &&
            entity.x < cameraX + canvasWidth &&
            entity.y + entity.height > 0 &&
            entity.y < canvasHeight
        );
    }

    /**
     * Apply horizontal movement to an entity
     * @param {Object} entity - The entity to move
     * @param {number} direction - Direction of movement (-1 for left, 1 for right)
     */
    moveHorizontal(entity, direction) {
        const speed = entity.isSprinting ? entity.sprintSpeed : entity.speed;
        entity.velocityX = direction * speed;
    }

    /**
     * Make an entity jump
     * @param {Object} entity - The entity to make jump
     */
    jump(entity) {
        if (entity.isOnGround) {
            entity.velocityY = -entity.jumpPower;
            entity.isOnGround = false;
        }
    }

    /**
     * Update entity position based on velocity
     * @param {Object} entity - The entity to update
     */
    updatePosition(entity) {
        entity.x += entity.velocityX;
        entity.y += entity.velocityY;
        
        // Apply friction to horizontal movement
        if (entity.isOnGround) {
            entity.velocityX *= 0.8; // Ground friction
        } else {
            entity.velocityX *= 0.95; // Air friction
        }
        
        // Stop very small movements
        if (Math.abs(entity.velocityX) < 0.1) {
            entity.velocityX = 0;
        }
    }
}
