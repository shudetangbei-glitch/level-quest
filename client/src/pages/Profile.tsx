import React from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Profile() {
  const { user, isAuthenticated, logout } = useAuth();
  const [, navigate] = useLocation();

  // Fetch user stats
  const { data: userStats } = trpc.game.getUserStats.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <Card className="bg-slate-800 border-red-500">
          <CardHeader>
            <CardTitle className="text-red-400">未登录</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-300 mb-4">请登录后查看个人资料。</p>
            <Button onClick={() => navigate("/")}>返回主菜单</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button
            onClick={() => navigate("/")}
            className="mb-6 bg-gray-700 hover:bg-gray-600"
          >
            ← 返回主菜单
          </Button>
          <h1 className="text-5xl font-bold text-white mb-2">👤 我的资料</h1>
          <p className="text-xl text-purple-200">追踪你的游戏进度</p>
        </div>

        {/* User Info Card */}
        <Card className="bg-slate-800 border-2 border-purple-500 mb-8">
          <CardHeader>
            <CardTitle className="text-white text-2xl">{user?.name}</CardTitle>
            <CardDescription className="text-purple-300">
              {user?.email}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-slate-700 p-4 rounded-lg text-center">
                <div className="text-3xl font-bold text-blue-400">
                  {userStats?.completedLevels || 0}
                </div>
                <div className="text-sm text-gray-300 mt-2">已完成关卡</div>
              </div>
              <div className="bg-slate-700 p-4 rounded-lg text-center">
                <div className="text-3xl font-bold text-yellow-400">
                  {userStats?.totalStars || 0}
                </div>
                <div className="text-sm text-gray-300 mt-2">总星级</div>
              </div>
              <div className="bg-slate-700 p-4 rounded-lg text-center">
                <div className="text-3xl font-bold text-green-400">
                  {userStats?.totalScore || 0}
                </div>
                <div className="text-sm text-gray-300 mt-2">总分数</div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-600">
              <Button
                onClick={() => logout()}
                className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-bold"
              >
                🚪 退出登录
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Stats Info */}
        <Card className="bg-slate-800 border-2 border-purple-500">
          <CardHeader>
            <CardTitle className="text-white">📊 你的统计数据</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-gray-300">
            <p>
              <span className="font-semibold text-purple-300">已完成关卡：</span> 你已完成了
              {userStats?.completedLevels || 0} 个关卡（共 6 个）。
            </p>
            <p>
              <span className="font-semibold text-purple-300">总星级：</span> 你在所有已完成的关卡中获得了
              {userStats?.totalStars || 0} 颗星。
            </p>
            <p>
              <span className="font-semibold text-purple-300">总分数：</span> 你的累计分数为
              {userStats?.totalScore || 0} 分。
            </p>
            <p className="pt-4 border-t border-slate-600">
              继续游戏以提高分数和获得更多星级！完成关卡的速度越快，获得的星级越多。
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
