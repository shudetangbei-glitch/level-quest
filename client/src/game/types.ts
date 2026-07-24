/**
 * Game type definitions
 */

export type GameObjectType = "player" | "platform" | "obstacle" | "goal" | "collectible";

export interface Vector2 {
  x: number;
  y: number;
}

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface GameObject {
  id: string;
  type: GameObjectType;
  position: Vector2;
  velocity: Vector2;
  width: number;
  height: number;
  color: string;
  isActive: boolean;
}

export interface Player extends GameObject {
  type: "player";
  isJumping: boolean;
  jumpPower: number;
  moveSpeed: number;
  health: number;
  maxHealth: number;
  isGrounded: boolean;
}

export interface Platform extends GameObject {
  type: "platform";
  isMoving: boolean;
  moveDirection?: "left" | "right" | "up" | "down";
  moveSpeed?: number;
  moveDistance?: number;
  currentDistance?: number;
}

export interface Obstacle extends GameObject {
  type: "obstacle";
  isMoving: boolean;
  moveDirection?: "left" | "right" | "up" | "down";
  moveSpeed?: number;
  moveDistance?: number;
  currentDistance?: number;
}

export interface Goal extends GameObject {
  type: "goal";
  reached: boolean;
}

export interface Collectible extends GameObject {
  type: "collectible";
  collected: boolean;
}

export interface LevelData {
  id: number;
  levelNumber: number;
  name: string;
  difficulty: string;
  targetTime: number;
  width: number;
  height: number;
  gravity: number;
  objects: Array<
    | (Omit<Player, "id"> & { isActive?: boolean })
    | (Omit<Platform, "id"> & { isActive?: boolean })
    | (Omit<Obstacle, "id"> & { isActive?: boolean })
    | (Omit<Goal, "id"> & { isActive?: boolean })
    | (Omit<Collectible, "id"> & { isActive?: boolean })
  >;
}

export interface GameState {
  isRunning: boolean;
  isPaused: boolean;
  isCompleted: boolean;
  isFailed: boolean;
  currentTime: number;
  score: number;
  health: number;
  maxHealth: number;
}

export interface GameConfig {
  canvasWidth: number;
  canvasHeight: number;
  gravity: number;
  friction: number;
}
