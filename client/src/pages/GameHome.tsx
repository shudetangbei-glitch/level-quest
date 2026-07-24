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
            🎮 Level Quest
          </h1>
          <p className="text-xl text-purple-200">
            A challenging platformer adventure awaits you
          </p>
        </div>

        {/* Main Card */}
        <Card className="bg-slate-800 border-purple-500 border-2 shadow-2xl">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl text-white">Welcome to Level Quest</CardTitle>
            <CardDescription className="text-purple-300 text-lg mt-2">
              Test your skills across 6 challenging levels
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Game Info */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="bg-slate-700 p-4 rounded-lg text-center">
                <div className="text-3xl font-bold text-blue-400">6</div>
                <div className="text-sm text-gray-300 mt-2">Levels</div>
              </div>
              <div className="bg-slate-700 p-4 rounded-lg text-center">
                <div className="text-3xl font-bold text-green-400">∞</div>
                <div className="text-sm text-gray-300 mt-2">Players</div>
              </div>
              <div className="bg-slate-700 p-4 rounded-lg text-center">
                <div className="text-3xl font-bold text-yellow-400">🏆</div>
                <div className="text-sm text-gray-300 mt-2">Rankings</div>
              </div>
            </div>

            {/* Features */}
            <div className="space-y-3 mb-8">
              <div className="flex items-center gap-3 text-gray-300">
                <span className="text-2xl">🎯</span>
                <span>Progressive difficulty from easy to extreme</span>
              </div>
              <div className="flex items-center gap-3 text-gray-300">
                <span className="text-2xl">⏱️</span>
                <span>Speed-run challenges with star ratings</span>
              </div>
              <div className="flex items-center gap-3 text-gray-300">
                <span className="text-2xl">🌍</span>
                <span>Global leaderboards to compete worldwide</span>
              </div>
              <div className="flex items-center gap-3 text-gray-300">
                <span className="text-2xl">💾</span>
                <span>Save your progress and track your best times</span>
              </div>
            </div>

            {/* Auth Section */}
            {!isAuthenticated ? (
              <div className="bg-slate-700 p-6 rounded-lg text-center space-y-4">
                <p className="text-gray-300">Sign in to save your progress and compete on leaderboards</p>
                <Button
                  onClick={() => startLogin()}
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold py-3 rounded-lg text-lg"
                >
                  🔐 Sign in with Manus
                </Button>
              </div>
            ) : (
              <div className="bg-slate-700 p-6 rounded-lg text-center space-y-4">
                <p className="text-green-300 font-semibold">✓ Signed in as {user?.name}</p>
                <p className="text-gray-300 text-sm">Your progress will be automatically saved</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-4 pt-4">
              <Button
                onClick={() => navigate("/levels")}
                className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-3 rounded-lg"
              >
                🎮 Play Now
              </Button>
              <Button
                onClick={() => navigate("/leaderboard")}
                className="bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-white font-bold py-3 rounded-lg"
              >
                🏆 Leaderboard
              </Button>
            </div>

            {isAuthenticated && (
              <Button
                onClick={() => navigate("/profile")}
                className="w-full mt-4 bg-slate-700 hover:bg-slate-600 text-white font-bold py-2 rounded-lg"
              >
                👤 My Profile
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8 text-gray-400 text-sm">
          <p>© 2026 Level Quest. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}
