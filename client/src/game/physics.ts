import { GameObject, Rect, Vector2 } from "./types";

/**
 * Physics engine for handling gravity, velocity, and collisions
 */

export class PhysicsEngine {
  gravity: number;
  friction: number;

  constructor(gravity = 0.6, friction = 0.95) {
    this.gravity = gravity;
    this.friction = friction;
  }

  /**
   * Apply gravity to an object
   */
  applyGravity(obj: GameObject, deltaTime: number): void {
    if (obj.type === "player" || obj.type === "obstacle") {
      obj.velocity.y += this.gravity * deltaTime;
    }
  }

  /**
   * Update object position based on velocity
   */
  updatePosition(obj: GameObject, deltaTime: number): void {
    obj.position.x += obj.velocity.x * deltaTime;
    obj.position.y += obj.velocity.y * deltaTime;

    // Apply friction
    obj.velocity.x *= this.friction;
  }

  /**
   * Check if two rectangles collide (AABB collision detection)
   */
  checkCollision(rect1: Rect, rect2: Rect): boolean {
    return (
      rect1.x < rect2.x + rect2.width &&
      rect1.x + rect1.width > rect2.x &&
      rect1.y < rect2.y + rect2.height &&
      rect1.y + rect1.height > rect2.y
    );
  }

  /**
   * Get collision resolution (push object out of collision)
   */
  getCollisionResolution(
    rect1: Rect,
    rect2: Rect
  ): { direction: "top" | "bottom" | "left" | "right"; depth: number } | null {
    if (!this.checkCollision(rect1, rect2)) {
      return null;
    }

    const overlapLeft = rect1.x + rect1.width - rect2.x;
    const overlapRight = rect2.x + rect2.width - rect1.x;
    const overlapTop = rect1.y + rect1.height - rect2.y;
    const overlapBottom = rect2.y + rect2.height - rect1.y;

    const minOverlap = Math.min(overlapLeft, overlapRight, overlapTop, overlapBottom);

    if (minOverlap === overlapTop) {
      return { direction: "top", depth: overlapTop };
    } else if (minOverlap === overlapBottom) {
      return { direction: "bottom", depth: overlapBottom };
    } else if (minOverlap === overlapLeft) {
      return { direction: "left", depth: overlapLeft };
    } else {
      return { direction: "right", depth: overlapRight };
    }
  }

  /**
   * Resolve collision by moving object out and adjusting velocity
   */
  resolveCollision(
    obj: GameObject,
    collidingObj: GameObject,
    resolution: { direction: "top" | "bottom" | "left" | "right"; depth: number }
  ): void {
    const pushDistance = resolution.depth + 1;

    switch (resolution.direction) {
      case "top":
        obj.position.y -= pushDistance;
        if (obj.type === "player") {
          obj.velocity.y = 0;
        }
        break;
      case "bottom":
        obj.position.y += pushDistance;
        if (obj.type === "player") {
          obj.velocity.y = 0;
        }
        break;
      case "left":
        obj.position.x -= pushDistance;
        obj.velocity.x = 0;
        break;
      case "right":
        obj.position.x += pushDistance;
        obj.velocity.x = 0;
        break;
    }
  }

  /**
   * Check if object is grounded (standing on a platform)
   */
  isGrounded(
    obj: GameObject,
    platforms: GameObject[],
    tolerance = 2
  ): boolean {
    const objRect = {
      x: obj.position.x,
      y: obj.position.y + obj.height,
      width: obj.width,
      height: tolerance,
    };

    return platforms.some((platform) => {
      const platformRect = {
        x: platform.position.x,
        y: platform.position.y,
        width: platform.width,
        height: platform.height,
      };
      return this.checkCollision(objRect, platformRect);
    });
  }

  /**
   * Clamp object within world bounds
   */
  clampToBounds(obj: GameObject, worldWidth: number, worldHeight: number): void {
    if (obj.position.x < 0) {
      obj.position.x = 0;
      obj.velocity.x = 0;
    }
    if (obj.position.x + obj.width > worldWidth) {
      obj.position.x = worldWidth - obj.width;
      obj.velocity.x = 0;
    }
    if (obj.position.y < 0) {
      obj.position.y = 0;
      obj.velocity.y = 0;
    }
    if (obj.position.y + obj.height > worldHeight) {
      // Fall off the world
      obj.isActive = false;
    }
  }
}
