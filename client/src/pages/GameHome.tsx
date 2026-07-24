import React from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { startLogin } from "@/const";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function GameHome() {
  const { user, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-6xl font-bold text-white mb-4 drop-shadow-lg">
            🎮 闯关冒险
          </h1>
          <p className="text-xl text-purple-200">
            一场充满挑战的平台跳跃冒险等待你
          </p>
        </div>

        {/* Main Card */}
        <Card className="bg-slate-800 border-purple-500 border-2 shadow-2xl">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl text-white">欢迎来到闯关冒险</CardTitle>
            <CardDescription className="text-purple-300 text-lg mt-2">
              在 6 个充满挑战的关卡中测试你的技能
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Game Info */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="bg-slate-700 p-4 rounded-lg text-center">
                <div className="text-3xl font-bold text-blue-400">6</div>
                <div className="text-sm text-gray-300 mt-2">个关卡</div>
              </div>
              <div className="bg-slate-700 p-4 rounded-lg text-center">
                <div className="text-3xl font-bold text-green-400">∞</div>
                <div className="text-sm text-gray-300 mt-2">玩家</div>
              </div>
              <div className="bg-slate-700 p-4 rounded-lg text-center">
                <div className="text-3xl font-bold text-yellow-400">🏆</div>
                <div className="text-sm text-gray-300 mt-2">排行榜</div>
              </div>
            </div>

            {/* Features */}
            <div className="space-y-3 mb-8">
              <div className="flex items-center gap-3 text-gray-300">
                <span className="text-2xl">🎯</span>
                <span>从简单到极难的递进难度设计</span>
              </div>
              <div className="flex items-center gap-3 text-gray-300">
                <span className="text-2xl">⏱️</span>
                <span>速度挑战，获得星级评分</span>
              </div>
              <div className="flex items-center gap-3 text-gray-300">
                <span className="text-2xl">🌍</span>
                <span>全球排行榜，与世界玩家竞争</span>
              </div>
              <div className="flex items-center gap-3 text-gray-300">
                <span className="text-2xl">💾</span>
                <span>保存进度，追踪最佳成绩</span>
              </div>
            </div>

            {/* Auth Section */}
            {!isAuthenticated ? (
              <div className="bg-slate-700 p-6 rounded-lg text-center space-y-4">
                <p className="text-gray-300">登录后可保存进度并参与全球排行榜竞争</p>
                <Button
                  onClick={() => startLogin()}
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold py-3 rounded-lg text-lg"
                >
                  🔐 使用 Manus 登录
                </Button>
              </div>
            ) : (
              <div className="bg-slate-700 p-6 rounded-lg text-center space-y-4">
                <p className="text-green-300 font-semibold">✓ 已登录为 {user?.name}</p>
                <p className="text-gray-300 text-sm">你的进度将自动保存</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-4 pt-4">
              <Button
                onClick={() => navigate("/levels")}
                className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-3 rounded-lg"
              >
                🎮 开始游戏
              </Button>
              <Button
                onClick={() => navigate("/leaderboard")}
                className="bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-white font-bold py-3 rounded-lg"
              >
                🏆 排行榜
              </Button>
            </div>

            {isAuthenticated && (
              <Button
                onClick={() => navigate("/profile")}
                className="w-full mt-4 bg-slate-700 hover:bg-slate-600 text-white font-bold py-2 rounded-lg"
              >
                👤 我的资料
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8 text-gray-400 text-sm">
          <p>© 2026 闯关冒险。保留所有权利。</p>
        </div>
      </div>
    </div>
  );
}
