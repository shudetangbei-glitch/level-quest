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
            <CardTitle className="text-red-400">Not Authenticated</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-300 mb-4">Please sign in to view your profile.</p>
            <Button onClick={() => navigate("/")}>Back to Home</Button>
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
            ← Back to Home
          </Button>
          <h1 className="text-5xl font-bold text-white mb-2">👤 My Profile</h1>
          <p className="text-xl text-purple-200">Track your gaming progress</p>
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
                <div className="text-sm text-gray-300 mt-2">Levels Completed</div>
              </div>
              <div className="bg-slate-700 p-4 rounded-lg text-center">
                <div className="text-3xl font-bold text-yellow-400">
                  {userStats?.totalStars || 0}
                </div>
                <div className="text-sm text-gray-300 mt-2">Total Stars</div>
              </div>
              <div className="bg-slate-700 p-4 rounded-lg text-center">
                <div className="text-3xl font-bold text-green-400">
                  {userStats?.totalScore || 0}
                </div>
                <div className="text-sm text-gray-300 mt-2">Total Score</div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-600">
              <Button
                onClick={() => logout()}
                className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-bold"
              >
                🚪 Sign Out
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Stats Info */}
        <Card className="bg-slate-800 border-2 border-purple-500">
          <CardHeader>
            <CardTitle className="text-white">📊 Your Statistics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-gray-300">
            <p>
              <span className="font-semibold text-purple-300">Levels Completed:</span> You have
              completed {userStats?.completedLevels || 0} out of 6 levels.
            </p>
            <p>
              <span className="font-semibold text-purple-300">Total Stars:</span> You have earned{" "}
              {userStats?.totalStars || 0} stars across all completed levels.
            </p>
            <p>
              <span className="font-semibold text-purple-300">Total Score:</span> Your cumulative
              score is {userStats?.totalScore || 0} points.
            </p>
            <p className="pt-4 border-t border-slate-600">
              Keep playing to improve your score and earn more stars! Complete levels faster to
              unlock 3-star ratings.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
