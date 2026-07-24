import React, { useEffect, useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LEVEL_DEFINITIONS } from "@/game/levels";

interface LevelProgress {
  levelId: number;
  isUnlocked: boolean;
  isCompleted: boolean;
  bestTime: number | null | undefined;
  stars: number;
}

export default function LevelSelect() {
  const { user, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const [levelProgress, setLevelProgress] = useState<Record<number, LevelProgress>>({});

  // Fetch user progress
  const { data: progressData } = trpc.game.getUserProgress.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  useEffect(() => {
    if (progressData) {
      const progressMap: Record<number, LevelProgress> = {};
      progressData.forEach((p) => {
        progressMap[p.levelId] = {
          levelId: p.levelId,
          isUnlocked: p.isUnlocked === 1,
          isCompleted: p.isCompleted === 1,
          bestTime: p.bestTime || undefined,
          stars: p.stars || 0,
        };
      });
      setLevelProgress(progressMap);
    }
  }, [progressData]);

  // Initialize first level as unlocked for new players
  useEffect(() => {
    if (isAuthenticated && Object.keys(levelProgress).length === 0) {
      // First level should be unlocked by default
      setLevelProgress((prev) => ({
        ...prev,
        1: {
          levelId: 1,
          isUnlocked: true,
          isCompleted: false,
          bestTime: null,
          stars: 0,
        },
      }));
    }
  }, [isAuthenticated, levelProgress]);

  const getLevelStatus = (levelNumber: number): "locked" | "unlocked" | "completed" => {
    const progress = levelProgress[levelNumber];
    if (!progress) {
      // First level is always unlocked
      if (levelNumber === 1) return "unlocked";
      // Other levels are locked if previous level not completed
      const prevProgress = levelProgress[levelNumber - 1];
      return prevProgress?.isCompleted ? "unlocked" : "locked";
    }
    if (progress.isCompleted) return "completed";
    if (progress.isUnlocked) return "unlocked";
    return "locked";
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "bg-green-500";
      case "medium":
        return "bg-yellow-500";
      case "hard":
        return "bg-orange-500";
      case "extreme":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, "0")}`;
  };

  const handlePlayLevel = (levelNumber: number) => {
    const status = getLevelStatus(levelNumber);
    if (status !== "locked") {
      navigate(`/game/${levelNumber}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <Button
            onClick={() => navigate("/")}
            className="mb-6 bg-gray-700 hover:bg-gray-600"
          >
            ← Back to Home
          </Button>
          <h1 className="text-5xl font-bold text-white mb-2">Select a Level</h1>
          <p className="text-xl text-purple-200">
            {isAuthenticated ? `Welcome, ${user?.name}!` : "Sign in to save your progress"}
          </p>
        </div>

        {/* Levels Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Object.entries(LEVEL_DEFINITIONS).map(([levelNum, levelDef]) => {
            const levelNumber = parseInt(levelNum);
            const status = getLevelStatus(levelNumber);
            const progress = levelProgress[levelNumber];
            const isLocked = status === "locked";

            return (
              <Card
                key={levelNumber}
                className={`border-2 transition-all cursor-pointer ${
                  isLocked
                    ? "bg-slate-800 border-gray-600 opacity-50"
                    : status === "completed"
                      ? "bg-slate-800 border-green-500 shadow-lg shadow-green-500/20"
                      : "bg-slate-800 border-purple-500 hover:border-purple-400 hover:shadow-lg hover:shadow-purple-500/20"
                }`}
                onClick={() => handlePlayLevel(levelNumber)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-2xl text-white">
                        Level {levelNumber}
                      </CardTitle>
                      <CardDescription className="text-purple-300">
                        {levelDef.name}
                      </CardDescription>
                    </div>
                    <Badge className={`${getDifficultyColor(levelDef.difficulty)} text-white`}>
                      {levelDef.difficulty.toUpperCase()}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Status */}
                  <div className="flex items-center gap-2">
                    {isLocked ? (
                      <>
                        <span className="text-2xl">🔒</span>
                        <span className="text-gray-400">Locked</span>
                      </>
                    ) : status === "completed" ? (
                      <>
                        <span className="text-2xl">✅</span>
                        <span className="text-green-400">Completed</span>
                      </>
                    ) : (
                      <>
                        <span className="text-2xl">🎮</span>
                        <span className="text-blue-400">Ready to Play</span>
                      </>
                    )}
                  </div>

                  {/* Stats */}
                  {progress && !isLocked && (
                    <div className="space-y-2 pt-2 border-t border-slate-700">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Best Time:</span>
                        <span className="text-white font-semibold">
                          {progress.bestTime ? formatTime(progress.bestTime) : "—"}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Stars:</span>
                        <span className="text-yellow-400 font-semibold">
                          {"⭐".repeat(progress.stars)}
                          {progress.stars === 0 && "—"}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Target Time */}
                  <div className="text-sm text-gray-400 pt-2 border-t border-slate-700">
                    Target Time: {formatTime(levelDef.targetTime)}
                  </div>

                  {/* Play Button */}
                  <Button
                    className={`w-full mt-4 ${
                      isLocked
                        ? "bg-gray-600 cursor-not-allowed"
                        : "bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                    } text-white font-bold`}
                    disabled={isLocked}
                  >
                    {isLocked ? "🔒 Locked" : status === "completed" ? "🔄 Replay" : "▶️ Play"}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Info Section */}
        <div className="mt-12 bg-slate-800 border-2 border-purple-500 rounded-lg p-6">
          <h2 className="text-2xl font-bold text-white mb-4">📋 How to Play</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-300">
            <div>
              <p className="font-semibold text-purple-300 mb-2">Controls:</p>
              <ul className="space-y-1 text-sm">
                <li>• Arrow Keys or WASD to move</li>
                <li>• Space or Up Arrow to jump</li>
                <li>• P to pause/resume</li>
              </ul>
            </div>
            <div>
              <p className="font-semibold text-purple-300 mb-2">Star Ratings:</p>
              <ul className="space-y-1 text-sm">
                <li>• ⭐⭐⭐ Complete within 70% of target time</li>
                <li>• ⭐⭐ Complete within 100% of target time</li>
                <li>• ⭐ Complete within 150% of target time</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
