import React, { useEffect, useRef, useState } from "react";
import { GameEngine } from "@/game/engine";
import { GameConfig } from "@/game/types";
import { LEVEL_DEFINITIONS } from "@/game/levels";
import { MobileControls } from "./MobileControls";

interface GameCanvasProps {
  levelNumber: number;
  onGameEnd?: (
    completed: boolean,
    time: number,
    score: number
  ) => void;
  onGameStateChange?: (state: {
    isRunning: boolean;
    isPaused: boolean;
    isCompleted: boolean;
    isFailed: boolean;
  }) => void;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({
  levelNumber,
  onGameEnd,
  onGameStateChange,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<GameEngine | null>(null);
  const animationIdRef = useRef<number | null>(null);
  const [gameState, setGameState] = useState({
    isRunning: false,
    isPaused: false,
    isCompleted: false,
    isFailed: false,
  });

  // Initialize game engine
  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    
    // Responsive canvas sizing
    const updateCanvasSize = () => {
      const rect = canvas.parentElement?.getBoundingClientRect();
      if (rect) {
        const width = Math.min(rect.width - 32, 800);
        const height = (width / 4) * 3; // 4:3 aspect ratio
        canvas.width = width;
        canvas.height = height;
      }
    };

    updateCanvasSize();
    window.addEventListener("resize", updateCanvasSize);

    const config: GameConfig = {
      canvasWidth: canvas.width,
      canvasHeight: canvas.height,
      gravity: 0.6,
      friction: 0.95,
    };

    // Create engine
    const engine = new GameEngine(canvas, config);
    engineRef.current = engine;

    // Load level
    const levelDef = LEVEL_DEFINITIONS[levelNumber];
    if (levelDef) {
      engine.loadLevel({
        id: levelNumber,
        ...levelDef,
      });
    }

    // Start game
    engine.start();
    setGameState({
      isRunning: true,
      isPaused: false,
      isCompleted: false,
      isFailed: false,
    });

    // Game loop
    const gameLoop = () => {
      engine.update();
      engine.render();

      // Update state
      setGameState({
        isRunning: engine.state.isRunning,
        isPaused: engine.state.isPaused,
        isCompleted: engine.state.isCompleted,
        isFailed: engine.state.isFailed,
      });

      // Check if game ended
      if (engine.state.isCompleted || engine.state.isFailed) {
        if (onGameEnd) {
          onGameEnd(
            engine.state.isCompleted,
            engine.state.currentTime,
            engine.state.score
          );
        }
      }

      animationIdRef.current = requestAnimationFrame(gameLoop);
    };

    animationIdRef.current = requestAnimationFrame(gameLoop);

    // Cleanup
    return () => {
      window.removeEventListener("resize", updateCanvasSize);
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
        animationIdRef.current = null;
      }
      engine.destroy();
      engineRef.current = null;
    };
  }, [levelNumber, onGameEnd]);

  // Update parent component when game state changes
  useEffect(() => {
    if (onGameStateChange) {
      onGameStateChange(gameState);
    }
  }, [gameState, onGameStateChange]);

  const handlePause = () => {
    if (engineRef.current) {
      engineRef.current.togglePause();
    }
  };

  const handleRestart = () => {
    if (engineRef.current) {
      const levelDef = LEVEL_DEFINITIONS[levelNumber];
      if (levelDef) {
        engineRef.current.loadLevel({
          id: levelNumber,
          ...levelDef,
        });
        engineRef.current.start();
        setGameState({
          isRunning: true,
          isPaused: false,
          isCompleted: false,
          isFailed: false,
        });
      }
    }
  };

  const handleMobileMove = (direction: "left" | "right" | "idle") => {
    if (!engineRef.current) return;
    if (direction === "left") {
      engineRef.current.keys["ArrowLeft"] = true;
      engineRef.current.keys["ArrowRight"] = false;
    } else if (direction === "right") {
      engineRef.current.keys["ArrowRight"] = true;
      engineRef.current.keys["ArrowLeft"] = false;
    } else {
      engineRef.current.keys["ArrowLeft"] = false;
      engineRef.current.keys["ArrowRight"] = false;
    }
  };

  const handleMobileJump = () => {
    if (!engineRef.current) return;
    engineRef.current.keys[" "] = true;
    setTimeout(() => {
      if (engineRef.current) {
        engineRef.current.keys[" "] = false;
      }
    }, 100);
  };

  return (
    <div className="flex flex-col items-center justify-center gap-4 w-full pb-32 md:pb-4">
      <canvas
        ref={canvasRef}
        className="border-4 border-gray-800 rounded-lg shadow-lg bg-gray-100 w-full max-w-2xl"
        style={{ maxWidth: "100%", height: "auto" }}
      />
      <div className="hidden md:flex gap-4">
        <button
          onClick={handlePause}
          disabled={!gameState.isRunning || gameState.isCompleted || gameState.isFailed}
          className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400"
        >
          {gameState.isPaused ? "继续" : "暂停"}
        </button>
        <button
          onClick={handleRestart}
          className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
        >
          重新开始
        </button>
      </div>
      <MobileControls
        onMove={handleMobileMove}
        onJump={handleMobileJump}
        onPause={handlePause}
      />
    </div>
  );
};

export default GameCanvas;
