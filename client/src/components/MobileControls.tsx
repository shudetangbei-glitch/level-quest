import React, { useEffect, useRef, useState } from "react";

interface MobileControlsProps {
  onMove: (direction: "left" | "right" | "idle") => void;
  onJump: () => void;
  onPause: () => void;
}

export const MobileControls: React.FC<MobileControlsProps> = ({
  onMove,
  onJump,
  onPause,
}) => {
  const [isMobile, setIsMobile] = useState(false);
  const [currentDirection, setCurrentDirection] = useState<"left" | "right" | "idle">("idle");
  const touchStartRef = useRef<number>(0);

  // Detect if device is mobile
  useEffect(() => {
    const checkMobile = () => {
      const isMobileDevice =
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
          navigator.userAgent
        ) || window.innerWidth < 768;
      setIsMobile(isMobileDevice);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Handle touch events for movement
  const handleLeftPointerDown = () => {
    setCurrentDirection("left");
    onMove("left");
  };

  const handleRightPointerDown = () => {
    setCurrentDirection("right");
    onMove("right");
  };

  const handleMovePointerUp = () => {
    setCurrentDirection("idle");
    onMove("idle");
  };

  // Handle device orientation for tilt controls (optional)
  useEffect(() => {
    const handleDeviceOrientation = (event: DeviceOrientationEvent) => {
      if (!isMobile) return;

      const gamma = event.gamma || 0; // Left-right tilt
      const threshold = 15;

      if (gamma < -threshold && currentDirection !== "left") {
        setCurrentDirection("left");
        onMove("left");
      } else if (gamma > threshold && currentDirection !== "right") {
        setCurrentDirection("right");
        onMove("right");
      } else if (Math.abs(gamma) <= threshold && currentDirection !== "idle") {
        setCurrentDirection("idle");
        onMove("idle");
      }
    };

    if (isMobile && "DeviceOrientationEvent" in window) {
      window.addEventListener("deviceorientation", handleDeviceOrientation);
      return () => window.removeEventListener("deviceorientation", handleDeviceOrientation);
    }
  }, [isMobile, currentDirection, onMove]);

  if (!isMobile) {
    return null; // Don't show mobile controls on desktop
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 z-40">
      <div className="flex items-end justify-between max-w-md mx-auto gap-4">
        {/* Left Movement Button */}
        <button
          onPointerDown={handleLeftPointerDown}
          onPointerUp={handleMovePointerUp}
          onPointerLeave={handleMovePointerUp}
          className="w-16 h-16 bg-blue-500 hover:bg-blue-600 active:bg-blue-700 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg transition-all"
        >
          ◀
        </button>

        {/* Jump Button */}
        <button
          onPointerDown={onJump}
          className="flex-1 bg-green-500 hover:bg-green-600 active:bg-green-700 rounded-lg py-4 text-white font-bold text-lg shadow-lg transition-all"
        >
          🔼 跳跃
        </button>

        {/* Right Movement Button */}
        <button
          onPointerDown={handleRightPointerDown}
          onPointerUp={handleMovePointerUp}
          onPointerLeave={handleMovePointerUp}
          className="w-16 h-16 bg-blue-500 hover:bg-blue-600 active:bg-blue-700 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg transition-all"
        >
          ▶
        </button>

        {/* Pause Button */}
        <button
          onPointerDown={onPause}
          className="w-14 h-14 bg-yellow-500 hover:bg-yellow-600 active:bg-yellow-700 rounded-full flex items-center justify-center text-white text-xl font-bold shadow-lg transition-all"
        >
          ⏸
        </button>
      </div>

      {/* Keyboard hint for desktop */}
      <div className="hidden md:block text-center text-gray-400 text-xs mt-4">
        💡 使用方向键或 WASD 移动，空格键跳跃
      </div>
    </div>
  );
};

export default MobileControls;
