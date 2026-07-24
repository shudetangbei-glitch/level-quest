import React, { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation, useRoute } from "wouter";
import { trpc } from "@/lib/trpc";
import { GameCanvas } from "@/components/GameCanvas";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { LEVEL_DEFINITIONS } from "@/game/levels";

export default function Game() {
  const { user, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const [match, params] = useRoute("/game/:levelNumber");
  const levelNumber = parseInt(params?.levelNumber || "1");

  const [gameState, setGameState] = useState({
    isRunning: false,
    isPaused: false,
    isCompleted: false,
    isFailed: false,
  });

  const [completionData, setCompletionData] = useState<{
    time: number;
    score: number;
  } | null>(null);

  const levelDef = LEVEL_DEFINITIONS[levelNumber];
  const saveLevelCompletion = trpc.game.saveLevelCompletion.useMutation();
  const unlockNextLevel = trpc.game.unlockNextLevel.useMutation();

  if (!match || !levelDef) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <Card className="bg-slate-800 border-red-500">
          <CardHeader>
            <CardTitle className="text-red-400">关卡未找到</CardTitle>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate("/levels")}>返回关卡选择</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const calculateStars = (time: number): number => {
    const targetTime = levelDef.targetTime;
    if (time <= targetTime * 0.7) return 3;
    if (time <= targetTime) return 2;
    if (time <= targetTime * 1.5) return 1;
    return 0;
  };

  const handleGameEnd = (completed: boolean, time: number, score: number) => {
    setCompletionData({ time, score });

    if (completed && isAuthenticated) {
      const stars = calculateStars(time);

      // Save level completion
      saveLevelCompletion.mutate(
        {
          levelId: levelNumber,
          completionTime: time,
          stars,
        },
        {
          onSuccess: () => {
            // Unlock next level if not the last one
            if (levelNumber < 6) {
              unlockNextLevel.mutate({
                currentLevelId: levelNumber,
              });
            }
          },
        }
      );
    }
  };

  const handleGameStateChange = (state: typeof gameState) => {
    setGameState(state);
  };

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    const centiseconds = Math.floor((ms % 1000) / 10);
    return `${minutes}:${secs.toString().padStart(2, "0")}.${centiseconds.toString().padStart(2, "0")}`;
  };

  const getStarRating = (time: number): number => {
    return calculateStars(time);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
      <div className="max-w-4xl mx-auto w-full">
        {/* Header */}
        <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex-1">
            <h1 className="text-3xl md:text-4xl font-bold text-white">
              第 {levelNumber} 关：{levelDef.name}
            </h1>
            <p className="text-purple-300 mt-2">
              难度：<span className="font-semibold">
                {levelDef.difficulty === "easy" ? "简单" :
                 levelDef.difficulty === "medium" ? "中等" :
                 levelDef.difficulty === "hard" ? "困难" : "极难"}
              </span>
            </p>
          </div>
          <Button
            onClick={() => navigate("/levels")}
            className="bg-gray-700 hover:bg-gray-600"
          >
            ← 返回
          </Button>
        </div>

        {/* Game Canvas */}
        <div className="mb-8 bg-slate-800 rounded-lg p-2 md:p-4 border-2 border-purple-500 w-full">
          <GameCanvas
            levelNumber={levelNumber}
            onGameEnd={handleGameEnd}
            onGameStateChange={handleGameStateChange}
          />
        </div>

        {/* Info */}
        <div className="hidden md:grid grid-cols-3 gap-4 mb-8">
          <Card className="bg-slate-800 border-blue-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-gray-400">目标时间</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-blue-400">
                {formatTime(levelDef.targetTime)}
              </p>
            </CardContent>
          </Card>
          <Card className="bg-slate-800 border-green-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-gray-400">状态</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-green-400">
                {gameState.isCompleted
                  ? "✅ 已完成"
                  : gameState.isFailed
                    ? "❌ 失败"
                    : gameState.isRunning
                      ? "🎮 进行中"
                      : "⏸️ 准备就绪"}
              </p>
            </CardContent>
          </Card>
          <Card className="bg-slate-800 border-yellow-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-gray-400">最佳时间</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-yellow-400">—</p>
            </CardContent>
          </Card>
        </div>

        {/* Tips */}
        <Card className="bg-slate-800 border-purple-500">
          <CardHeader>
            <CardTitle className="text-white">💡 游戏提示</CardTitle>
          </CardHeader>
          <CardContent className="text-gray-300 space-y-2">
            <p>• 使用方向键或 WASD 键左右移动</p>
            <p>• 按空格键或上方向键跳跃</p>
            <p>• 避免红色障碍物 - 会造成伤害</p>
            <p>• 到达绿色目标即可完成关卡</p>
            <p>• 完成速度越快获得的星级越多！</p>
          </CardContent>
        </Card>
      </div>

      {/* Completion Dialog */}
      <Dialog open={gameState.isCompleted || gameState.isFailed} onOpenChange={() => {}}>
        <DialogContent className="bg-slate-800 border-2 border-purple-500">
          <DialogHeader>
            <DialogTitle className="text-2xl text-white">
              {gameState.isCompleted ? "🎉 关卡完成！" : "💔 关卡失败"}
            </DialogTitle>
            <DialogDescription className="text-purple-300">
              {gameState.isCompleted
                ? "干得好！查看下面的成绩。"
                : "别放弃！再试一次。"}
            </DialogDescription>
          </DialogHeader>

          {completionData && (
            <div className="space-y-4 py-4">
              {gameState.isCompleted && (
                <>
                  <div className="bg-slate-700 p-4 rounded-lg space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">耗时：</span>
                      <span className="text-2xl font-bold text-blue-400">
                        {formatTime(completionData.time)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">星级：</span>
                      <span className="text-2xl font-bold text-yellow-400">
                        {"⭐".repeat(getStarRating(completionData.time))}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">分数：</span>
                      <span className="text-2xl font-bold text-green-400">
                        {completionData.score}
                      </span>
                    </div>
                    <div className="flex justify-between items-center pt-3 border-t border-slate-600">
                      <span className="text-gray-300">保存状态：</span>
                      <span className="text-lg font-bold text-green-400">
                        {isAuthenticated ? "✓ 已保存" : "⚠ 未保存"}
                      </span>
                    </div>
                  </div>

                  {!isAuthenticated && (
                    <div className="bg-orange-900 border border-orange-500 p-3 rounded text-orange-200 text-sm">
                      登录后可保存进度并参与全球排行榜竞争！
                    </div>
                  )}
                </>
              )}

              <div className="flex gap-3 pt-4">
                {gameState.isFailed && (
                  <Button
                    onClick={() => window.location.reload()}
                    className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold"
                  >
                    🔄 重试
                  </Button>
                )}
                <Button
                  onClick={() => navigate("/levels")}
                  className="flex-1 bg-gray-600 hover:bg-gray-700"
                >
                  返回关卡选择
                </Button>
                {gameState.isCompleted && levelNumber < 6 && (
                  <Button
                    onClick={() => navigate(`/game/${levelNumber + 1}`)}
                    className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                  >
                    下一关 →
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
