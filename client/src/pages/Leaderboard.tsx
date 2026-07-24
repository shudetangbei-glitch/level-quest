import React, { useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LEVEL_DEFINITIONS } from "@/game/levels";

export default function Leaderboard() {
  const [, navigate] = useLocation();
  const [selectedLevel, setSelectedLevel] = useState(1);

  // Fetch level-specific leaderboard
  const { data: levelLeaderboard, isLoading: levelLoading } =
    trpc.game.getLeaderboard.useQuery(
      { levelId: selectedLevel, limit: 10 },
      { enabled: true }
    );

  // Fetch global leaderboard
  const { data: globalLeaderboard, isLoading: globalLoading } =
    trpc.game.getGlobalLeaderboard.useQuery(
      { limit: 10 },
      { enabled: true }
    );

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    const centiseconds = Math.floor((ms % 1000) / 10);
    return `${minutes}:${secs.toString().padStart(2, "0")}.${centiseconds.toString().padStart(2, "0")}`;
  };

  const getMedalEmoji = (rank: number) => {
    switch (rank) {
      case 1:
        return "🥇";
      case 2:
        return "🥈";
      case 3:
        return "🥉";
      default:
        return `#${rank}`;
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
            ← 返回主菜单
          </Button>
          <h1 className="text-5xl font-bold text-white mb-2">🏆 排行榜</h1>
          <p className="text-xl text-purple-200">
            与全球玩家竞争，争夺榜单顶端
          </p>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="level" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-slate-800 border-2 border-purple-500">
            <TabsTrigger
              value="level"
              className="text-white data-[state=active]:bg-purple-600"
            >
              关卡排行
            </TabsTrigger>
            <TabsTrigger
              value="global"
              className="text-white data-[state=active]:bg-purple-600"
            >
              全球排行
            </TabsTrigger>
          </TabsList>

          {/* Level Rankings Tab */}
          <TabsContent value="level" className="space-y-6">
            {/* Level Selector */}
            <div className="bg-slate-800 border-2 border-purple-500 rounded-lg p-6">
              <h2 className="text-xl font-bold text-white mb-4">选择关卡</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
                {Object.entries(LEVEL_DEFINITIONS).map(([levelNum]) => {
                  const levelNumber = parseInt(levelNum);
                  const isSelected = selectedLevel === levelNumber;
                  return (
                    <Button
                      key={levelNumber}
                      onClick={() => setSelectedLevel(levelNumber)}
                      className={`${
                        isSelected
                          ? "bg-gradient-to-r from-blue-500 to-purple-600"
                          : "bg-slate-700 hover:bg-slate-600"
                      } text-white font-bold`}
                    >
                      第 {levelNumber} 关
                    </Button>
                  );
                })}
              </div>
            </div>

            {/* Level Leaderboard */}
            <Card className="bg-slate-800 border-2 border-purple-500">
              <CardHeader>
                <CardTitle className="text-white">
                  {LEVEL_DEFINITIONS[selectedLevel]?.name} - 前 10 名
                </CardTitle>
                <CardDescription className="text-purple-300">
                  最快完成时间排行
                </CardDescription>
              </CardHeader>
              <CardContent>
                {levelLoading ? (
                  <div className="text-center text-gray-400 py-8">加载中...</div>
                ) : levelLeaderboard && levelLeaderboard.length > 0 ? (
                  <div className="space-y-2">
                    {levelLeaderboard.map((entry, index) => (
                      <div
                        key={entry.id}
                        className="flex items-center justify-between bg-slate-700 p-4 rounded-lg hover:bg-slate-600 transition-colors"
                      >
                        <div className="flex items-center gap-4 flex-1">
                          <span className="text-2xl font-bold text-yellow-400 w-12">
                            {getMedalEmoji(index + 1)}
                          </span>
                          <div>
                            <p className="text-white font-semibold">{entry.userName}</p>
                            <p className="text-gray-400 text-sm">第 {selectedLevel} 关</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-blue-400">
                            {formatTime(entry.bestTime)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-gray-400 py-8">
                    暂无数据。成为第一个完成此关卡的玩家吧！
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Global Rankings Tab */}
          <TabsContent value="global" className="space-y-6">
            <Card className="bg-slate-800 border-2 border-purple-500">
              <CardHeader>
                <CardTitle className="text-white">全球排行 - 前 10 名</CardTitle>
                <CardDescription className="text-purple-300">
                  基于总星级和完成关卡数
                </CardDescription>
              </CardHeader>
              <CardContent>
                {globalLoading ? (
                  <div className="text-center text-gray-400 py-8">加载中...</div>
                ) : globalLeaderboard && globalLeaderboard.length > 0 ? (
                  <div className="space-y-2">
                    {globalLeaderboard.map((entry, index) => (
                      <div
                        key={entry.id}
                        className="flex items-center justify-between bg-slate-700 p-4 rounded-lg hover:bg-slate-600 transition-colors"
                      >
                        <div className="flex items-center gap-4 flex-1">
                          <span className="text-2xl font-bold text-yellow-400 w-12">
                            {getMedalEmoji(index + 1)}
                          </span>
                          <div>
                            <p className="text-white font-semibold">玩家 {entry.userId}</p>
                            <p className="text-gray-400 text-sm">
                              已完成 {entry.completedLevels} 个关卡
                            </p>
                          </div>
                        </div>
                        <div className="text-right space-y-1">
                          <p className="text-2xl font-bold text-yellow-400">
                            {"⭐".repeat(Math.min(entry.totalStars, 18))}
                          </p>
                          <p className="text-gray-400 text-sm">{entry.totalStars} 颗星</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-gray-400 py-8">
                    暂无玩家。完成关卡即可登上排行榜！
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Info Card */}
        <Card className="bg-slate-800 border-2 border-purple-500 mt-8">
          <CardHeader>
            <CardTitle className="text-white">📊 排行榜说明</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-gray-300">
            <p>
              <span className="font-semibold text-purple-300">关卡排行：</span> 显示各个关卡上最快的玩家。
            </p>
            <p>
              <span className="font-semibold text-purple-300">全球排行：</span> 根据获得的总星级和完成的关卡数排名玩家。
            </p>
            <p>
              <span className="font-semibold text-purple-300">星级系统：</span> 在目标时间的 70% 内完成获得 3 颗星，100% 内获得 2 颗星，150% 内获得 1 颗星。
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
