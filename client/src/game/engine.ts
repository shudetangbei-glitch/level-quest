import { PhysicsEngine } from "./physics";
import {
  GameObject,
  GameState,
  GameConfig,
  LevelData,
  Player,
  Platform,
  Obstacle,
  Goal,
  Collectible,
} from "./types";

/**
 * Main game engine
 */
export class GameEngine {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  config: GameConfig;
  physics: PhysicsEngine;

  // Game objects
  player: Player | null = null;
  platforms: Platform[] = [];
  obstacles: Obstacle[] = [];
  goal: Goal | null = null;
  collectibles: Collectible[] = [];

  // Game state
  state: GameState = {
    isRunning: false,
    isPaused: false,
    isCompleted: false,
    isFailed: false,
    currentTime: 0,
    score: 0,
    health: 100,
    maxHealth: 100,
  };

  // Input handling
  keys: Record<string, boolean> = {};
  lastFrameTime = 0;

  constructor(canvas: HTMLCanvasElement, config: GameConfig) {
    this.canvas = canvas;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Failed to get 2D context");
    this.ctx = ctx;
    this.config = config;
    this.physics = new PhysicsEngine(config.gravity, 0.95);

    this.setupInputHandlers();
  }

  /**
   * Load a level
   */
  loadLevel(levelData: LevelData): void {
    this.reset();

    for (const obj of levelData.objects) {
      const id = `${obj.type}-${Math.random()}`;

      switch (obj.type) {
        case "player":
          this.player = {
            ...(obj as any),
            id,
            isActive: true,
            velocity: obj.velocity || { x: 0, y: 0 },
            isJumping: false,
            isGrounded: false,
          };
          break;

        case "platform":
          this.platforms.push({
            ...(obj as any),
            id,
            isActive: true,
            velocity: obj.velocity || { x: 0, y: 0 },
            currentDistance: 0,
          });
          break;

        case "obstacle":
          this.obstacles.push({
            ...(obj as any),
            id,
            isActive: true,
            velocity: obj.velocity || { x: 0, y: 0 },
            currentDistance: 0,
          });
          break;

        case "goal":
          this.goal = {
            ...(obj as any),
            id,
            isActive: true,
            velocity: obj.velocity || { x: 0, y: 0 },
            reached: false,
          };
          break;

        case "collectible":
          this.collectibles.push({
            ...(obj as any),
            id,
            isActive: true,
            velocity: obj.velocity || { x: 0, y: 0 },
            collected: false,
          });
          break;
      }
    }

    this.state.health = this.state.maxHealth;
  }

  /**
   * Start the game
   */
  start(): void {
    this.state.isRunning = true;
    this.state.isPaused = false;
    this.state.isCompleted = false;
    this.state.isFailed = false;
    this.state.currentTime = 0;
    this.state.score = 0;
    this.lastFrameTime = Date.now();
  }

  /**
   * Pause/resume the game
   */
  togglePause(): void {
    this.state.isPaused = !this.state.isPaused;
  }

  /**
   * Update game state
   */
  update(): void {
    if (!this.state.isRunning || this.state.isPaused) return;

    const currentTime = Date.now();
    const deltaTime = Math.min((currentTime - this.lastFrameTime) / 1000, 0.016); // Cap at 60fps
    this.lastFrameTime = currentTime;

    // Update timer
    this.state.currentTime += deltaTime * 1000; // Convert to milliseconds

    // Update player
    if (this.player) {
      this.updatePlayer(deltaTime);
    }

    // Update platforms
    this.platforms.forEach((platform) => this.updateMovingObject(platform, deltaTime));

    // Update obstacles
    this.obstacles.forEach((obstacle) => this.updateMovingObject(obstacle, deltaTime));

    // Handle collisions
    this.handleCollisions();

    // Check win condition
    if (this.goal && this.checkCollision(this.player!, this.goal)) {
      this.completeLevel();
    }

    // Check fail condition
    if (this.player && this.player.position.y > this.config.canvasHeight) {
      this.failLevel();
    }
  }

  /**
   * Update player movement
   */
  private updatePlayer(deltaTime: number): void {
    if (!this.player) return;

    // Handle input
    if (this.keys["ArrowLeft"] || this.keys["a"]) {
      this.player.velocity.x = -this.player.moveSpeed;
    } else if (this.keys["ArrowRight"] || this.keys["d"]) {
      this.player.velocity.x = this.player.moveSpeed;
    } else {
      this.player.velocity.x *= 0.9; // Decelerate
    }

    // Check if grounded
    this.player.isGrounded = this.physics.isGrounded(
      this.player,
      [...this.platforms, ...(this.goal ? [this.goal] : [])]
    );

    // Handle jumping
    if ((this.keys["ArrowUp"] || this.keys["w"] || this.keys[" "]) && this.player.isGrounded) {
      this.player.velocity.y = -this.player.jumpPower;
      this.player.isJumping = true;
      this.keys["ArrowUp"] = false;
      this.keys["w"] = false;
      this.keys[" "] = false;
    }

    // Apply physics
    this.physics.applyGravity(this.player, deltaTime);
    this.physics.updatePosition(this.player, deltaTime);
    this.physics.clampToBounds(this.player, this.config.canvasWidth, this.config.canvasHeight);
  }

  /**
   * Update moving objects (platforms, obstacles)
   */
  private updateMovingObject(obj: Platform | Obstacle, deltaTime: number): void {
    if (!obj.isMoving || !obj.moveDirection || !obj.moveSpeed) return;

    const speed = obj.moveSpeed * deltaTime;
    const maxDistance = obj.moveDistance || 100;

    switch (obj.moveDirection) {
      case "left":
        obj.position.x -= speed;
        obj.currentDistance! += speed;
        break;
      case "right":
        obj.position.x += speed;
        obj.currentDistance! += speed;
        break;
      case "up":
        obj.position.y -= speed;
        obj.currentDistance! += speed;
        break;
      case "down":
        obj.position.y += speed;
        obj.currentDistance! += speed;
        break;
    }

    // Reverse direction if reached max distance
    if (obj.currentDistance! >= maxDistance) {
      obj.currentDistance = 0;
      obj.moveDirection =
        obj.moveDirection === "left"
          ? "right"
          : obj.moveDirection === "right"
            ? "left"
            : obj.moveDirection === "up"
              ? "down"
              : "up";
    }
  }

  /**
   * Handle all collisions
   */
  private handleCollisions(): void {
    if (!this.player) return;

    const playerRect = {
      x: this.player.position.x,
      y: this.player.position.y,
      width: this.player.width,
      height: this.player.height,
    };

    // Platform collisions
    for (const platform of this.platforms) {
      const platformRect = {
        x: platform.position.x,
        y: platform.position.y,
        width: platform.width,
        height: platform.height,
      };

      const resolution = this.physics.getCollisionResolution(playerRect, platformRect);
      if (resolution) {
        this.physics.resolveCollision(this.player, platform, resolution);
      }
    }

    // Obstacle collisions
    for (const obstacle of this.obstacles) {
      const obstacleRect = {
        x: obstacle.position.x,
        y: obstacle.position.y,
        width: obstacle.width,
        height: obstacle.height,
      };

      if (this.physics.checkCollision(playerRect, obstacleRect)) {
        this.state.health -= 10;
        if (this.state.health <= 0) {
          this.failLevel();
        }
      }
    }

    // Collectible collisions
    for (const collectible of this.collectibles) {
      if (!collectible.collected && this.checkCollision(this.player, collectible)) {
        collectible.collected = true;
        this.state.score += 10;
      }
    }
  }

  /**
   * Check if two objects collide
   */
  private checkCollision(obj1: GameObject, obj2: GameObject): boolean {
    return this.physics.checkCollision(
      {
        x: obj1.position.x,
        y: obj1.position.y,
        width: obj1.width,
        height: obj1.height,
      },
      {
        x: obj2.position.x,
        y: obj2.position.y,
        width: obj2.width,
        height: obj2.height,
      }
    );
  }

  /**
   * Complete the level
   */
  private completeLevel(): void {
    this.state.isRunning = false;
    this.state.isCompleted = true;
  }

  /**
   * Fail the level
   */
  private failLevel(): void {
    this.state.isRunning = false;
    this.state.isFailed = true;
  }

  /**
   * Render the game
   */
  render(): void {
    // Clear canvas
    this.ctx.fillStyle = "#f0f4f8";
    this.ctx.fillRect(0, 0, this.config.canvasWidth, this.config.canvasHeight);

    // Render platforms
    this.platforms.forEach((platform) => this.renderObject(platform));

    // Render obstacles
    this.obstacles.forEach((obstacle) => this.renderObject(obstacle));

    // Render collectibles
    this.collectibles.forEach((collectible) => {
      if (!collectible.collected) {
        this.renderObject(collectible);
      }
    });

    // Render goal
    if (this.goal) {
      this.renderObject(this.goal);
    }

    // Render player
    if (this.player) {
      this.renderObject(this.player);
    }

    // Render HUD
    this.renderHUD();
  }

  /**
   * Render a game object
   */
  private renderObject(obj: GameObject): void {
    if (!obj.isActive) return;

    this.ctx.fillStyle = obj.color;
    this.ctx.fillRect(obj.position.x, obj.position.y, obj.width, obj.height);

    // Add border
    this.ctx.strokeStyle = "rgba(0, 0, 0, 0.2)";
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(obj.position.x, obj.position.y, obj.width, obj.height);
  }

  /**
   * Render HUD (heads-up display)
   */
  private renderHUD(): void {
    this.ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
    this.ctx.font = "16px Arial";
    this.ctx.fillText(`Time: ${(this.state.currentTime / 1000).toFixed(1)}s`, 10, 25);
    this.ctx.fillText(`Health: ${this.state.health}/${this.state.maxHealth}`, 10, 50);
    this.ctx.fillText(`Score: ${this.state.score}`, 10, 75);

    if (this.state.isPaused) {
      this.ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
      this.ctx.fillRect(0, 0, this.config.canvasWidth, this.config.canvasHeight);
      this.ctx.fillStyle = "white";
      this.ctx.font = "bold 32px Arial";
      this.ctx.textAlign = "center";
      this.ctx.fillText("PAUSED", this.config.canvasWidth / 2, this.config.canvasHeight / 2);
      this.ctx.textAlign = "left";
    }
  }

  /**
   * Setup input handlers
   */
  private setupInputHandlers(): void {
    this.handleKeyDown = (e: KeyboardEvent) => {
      this.keys[e.key] = true;
    };
    this.handleKeyUp = (e: KeyboardEvent) => {
      this.keys[e.key] = false;
    };
    window.addEventListener("keydown", this.handleKeyDown);
    window.addEventListener("keyup", this.handleKeyUp);
  }

  private handleKeyDown?: (e: KeyboardEvent) => void;
  private handleKeyUp?: (e: KeyboardEvent) => void;

  /**
   * Reset the game
   */
  private reset(): void {
    this.player = null;
    this.platforms = [];
    this.obstacles = [];
    this.goal = null;
    this.collectibles = [];
    this.state = {
      isRunning: false,
      isPaused: false,
      isCompleted: false,
      isFailed: false,
      currentTime: 0,
      score: 0,
      health: 100,
      maxHealth: 100,
    };
  }

  /**
   * Cleanup
   */
  destroy(): void {
    if (this.handleKeyDown) {
      window.removeEventListener("keydown", this.handleKeyDown);
    }
    if (this.handleKeyUp) {
      window.removeEventListener("keyup", this.handleKeyUp);
    }
    this.state.isRunning = false;
  }
}
