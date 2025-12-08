import { useMemo } from "react";
import { TrendingUp, Calendar, Zap, Lock, Unlock } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface ProgressViewProps {
  plantQuest: any;
}

export function ProgressView({ plantQuest }: ProgressViewProps) {
  // If quest not active, show message
  if (!plantQuest.questConfig?.isActive) {
    return (
      <div className="space-y-8">
        <div className="bg-gradient-to-br from-cyber-900/50 via-purple-900/30 to-cyber-900/50 rounded-lg border border-cyber-600/50 shadow-2xl p-8 text-center glow-effect">
          <h1 className="text-4xl font-bold mb-2 neon-text text-neon-cyan">Progress Tracking</h1>
          <p className="text-cyber-300 mb-6">Please start a quest first to track progress</p>
          <a
            href="/"
            className="inline-block bg-gradient-to-r from-neon-purple to-neon-blue text-white font-semibold py-3 px-6 rounded-lg hover:from-neon-blue hover:to-neon-cyan transition-all cyber-border"
          >
            Start Quest
          </a>
        </div>
      </div>
    );
  }

  const isDecrypted = plantQuest.isDecrypted;
  const canDecrypt = plantQuest.canDecrypt;
  const isDecrypting = plantQuest.isDecrypting;

  const chartData = useMemo(() => {
    if (!plantQuest.questConfig) return [];

    const duration = plantQuest.questConfig.duration;
    const completedDays = plantQuest.isDecrypted
      ? Number(plantQuest.clearDays)
      : 0;

    return Array.from({ length: duration }, (_, i) => ({
      day: i + 1,
      completed: i < completedDays ? 1 : 0,
      target: 1,
    }));
  }, [plantQuest.questConfig, plantQuest.clearDays, plantQuest.isDecrypted]);

  const progressPercentage = useMemo(() => {
    if (!plantQuest.questConfig || !plantQuest.isDecrypted) return 0;
    const completedDays = Number(plantQuest.clearDays);
    const totalDays = plantQuest.questConfig.duration;
    return Math.round((completedDays / totalDays) * 100);
  }, [plantQuest.questConfig, plantQuest.clearDays, plantQuest.isDecrypted]);

  return (
    <div className="space-y-8">
      {/* Page Header with Decrypt Button */}
      <div className="bg-gradient-to-br from-black via-cyber-900/50 to-black rounded-lg border border-cyber-600/50 shadow-2xl p-8 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-neon-blue/10 via-transparent to-neon-cyan/10 animate-pulse-neon" />
        <div className="relative z-10 flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-bold mb-2 neon-text bg-gradient-to-r from-neon-blue via-neon-cyan to-neon-purple bg-clip-text text-transparent">Progress Tracking</h1>
            <p className="text-cyber-300">Visualize your plant journey</p>
          </div>
          {!isDecrypted && (
            <button
              onClick={plantQuest.decryptEncDays}
              disabled={!canDecrypt || isDecrypting}
              className="bg-cyber-900/50 hover:bg-cyber-800/50 disabled:bg-cyber-900/30 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg shadow-lg transition-all transform hover:scale-105 disabled:transform-none flex items-center space-x-2 border border-cyber-600/50"
            >
              {isDecrypting ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Decrypting...</span>
                </>
              ) : (
                <>
                  <Unlock className="w-5 h-5" />
                  <span>Decrypt Progress</span>
                </>
              )}
            </button>
          )}
          {isDecrypted && (
            <div className="bg-green-500/20 border border-green-500/50 text-white font-semibold py-3 px-6 rounded-lg flex items-center space-x-2">
              <Unlock className="w-5 h-5" />
              <span>Decrypted</span>
            </div>
          )}
        </div>
      </div>

      {/* Decrypt Warning Banner */}
      {!isDecrypted && (
        <div className="bg-amber-500/20 border-2 border-amber-500/50 rounded-lg shadow-lg p-6">
          <div className="flex items-start space-x-4">
            <div className="bg-amber-500/30 rounded-full p-3 flex-shrink-0 border border-amber-500/50">
              <Lock className="w-6 h-6 text-amber-300" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-amber-300 mb-2 text-lg">
                🔒 Data is Encrypted
              </h3>
              <p className="text-sm text-amber-200 mb-4">
                Your progress data is protected by FHEVM encryption. Click the "Decrypt Progress" button above to view your detailed statistics and charts.
              </p>
              {!canDecrypt && (
                <p className="text-xs text-amber-300 italic">
                  Waiting for encryption handle...
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Progress Overview */}
      <div className="bg-black/50 border border-cyber-600/50 rounded-lg shadow-xl p-8">
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center space-x-2">
          <Zap className="w-6 h-6 text-neon-cyan" />
          <span>Quest Overview</span>
        </h2>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-semibold text-cyber-300">
              Overall Progress
            </span>
            <span className="text-sm font-semibold text-neon-cyan">
              {isDecrypted ? `${progressPercentage}%` : "🔒 Encrypted"}
            </span>
          </div>
          <div className="w-full bg-cyber-900/50 rounded-full h-4 overflow-hidden relative border border-cyber-600/30">
            {isDecrypted ? (
              <div
                className="h-full bg-gradient-to-r from-neon-purple via-neon-blue to-neon-cyan rounded-full transition-all duration-1000 ease-out relative"
                style={{ width: `${progressPercentage}%` }}
              >
                <div className="w-full h-full bg-white/20 animate-pulse-neon"></div>
              </div>
            ) : (
              <div className="h-full bg-gradient-to-r from-gray-700 to-gray-600 rounded-full flex items-center justify-center">
                <Lock className="w-4 h-4 text-gray-400" />
              </div>
            )}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className={`bg-gradient-to-br from-neon-purple/20 to-purple-900/20 border border-neon-purple/30 rounded-lg p-6 ${!isDecrypted ? 'opacity-60' : ''}`}>
            <div className="flex items-center space-x-3 mb-2">
              <div className="bg-neon-purple/30 w-10 h-10 rounded-lg flex items-center justify-center border border-neon-purple/50">
                {isDecrypted ? (
                  <Calendar className="w-5 h-5 text-neon-purple" />
                ) : (
                  <Lock className="w-5 h-5 text-gray-400" />
                )}
              </div>
              <span className="text-sm text-cyber-300 uppercase tracking-wider">Completed Days</span>
            </div>
            <div className="text-3xl font-bold text-neon-purple flex items-center space-x-2">
              {isDecrypted ? (
                <span className="neon-text">{Number(plantQuest.clearDays)}</span>
              ) : (
                <>
                  <Lock className="w-5 h-5" />
                  <span className="text-gray-400">Encrypted</span>
                </>
              )}
            </div>
          </div>

          <div className="bg-gradient-to-br from-neon-blue/20 to-cyan-900/20 border border-neon-blue/30 rounded-lg p-6">
            <div className="flex items-center space-x-3 mb-2">
              <div className="bg-neon-blue/30 w-10 h-10 rounded-lg flex items-center justify-center border border-neon-blue/50">
                <TrendingUp className="w-5 h-5 text-neon-blue" />
              </div>
              <span className="text-sm text-cyber-300 uppercase tracking-wider">Total Days</span>
            </div>
            <div className="text-3xl font-bold text-neon-blue">
              {plantQuest.questConfig?.duration || 0}
            </div>
          </div>

          <div className={`bg-gradient-to-br from-yellow-500/20 to-orange-900/20 border border-yellow-500/30 rounded-lg p-6 ${!isDecrypted ? 'opacity-60' : ''}`}>
            <div className="flex items-center space-x-3 mb-2">
              <div className="bg-yellow-500/30 w-10 h-10 rounded-lg flex items-center justify-center border border-yellow-500/50">
                {isDecrypted ? (
                  <Zap className="w-5 h-5 text-yellow-400" />
                ) : (
                  <Lock className="w-5 h-5 text-gray-400" />
                )}
              </div>
              <span className="text-sm text-cyber-300 uppercase tracking-wider">Success Rate</span>
            </div>
            <div className="text-3xl font-bold text-yellow-400 flex items-center space-x-2">
              {isDecrypted ? (
                <span className="neon-text">{progressPercentage}%</span>
              ) : (
                <>
                  <Lock className="w-5 h-5" />
                  <span className="text-gray-400">Encrypted</span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Chart */}
      {isDecrypted && chartData.length > 0 ? (
        <div className="bg-black/50 border border-cyber-600/50 rounded-lg shadow-xl p-8">
          <h3 className="text-xl font-bold text-white mb-6">
            Progress Timeline
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis
                dataKey="day"
                label={{ value: "Day", position: "insideBottom", offset: -5 }}
                stroke="#9ca3af"
              />
              <YAxis
                label={{ value: "Status", angle: -90, position: "insideLeft" }}
                stroke="#9ca3af"
                domain={[0, 1]}
                ticks={[0, 1]}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#111827",
                  border: "1px solid #4b5563",
                  borderRadius: "8px",
                  color: "#f3f4f6",
                }}
                formatter={(value: number) => [value === 1 ? "Completed" : "Not completed", "Status"]}
              />
              <Line
                type="stepAfter"
                dataKey="completed"
                stroke="#00d9ff"
                strokeWidth={3}
                dot={{ fill: "#00d9ff", r: 5 }}
                activeDot={{ r: 7 }}
              />
              <Line
                type="monotone"
                dataKey="target"
                stroke="#6b7280"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      ) : !isDecrypted ? (
        <div className="bg-black/50 border-2 border-dashed border-cyber-600/50 rounded-lg shadow-xl p-8">
          <div className="flex flex-col items-center justify-center py-12">
            <div className="bg-cyber-900/50 rounded-full p-6 mb-4 border border-cyber-600/50">
              <Lock className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">
              Chart is Encrypted
            </h3>
            <p className="text-sm text-cyber-400 mb-4 text-center max-w-md">
              Decrypt your progress data to view the detailed timeline chart
            </p>
            <button
              onClick={plantQuest.decryptEncDays}
              disabled={!canDecrypt || isDecrypting}
              className="bg-gradient-to-r from-neon-blue to-neon-cyan hover:from-neon-cyan hover:to-neon-blue disabled:bg-gray-700 text-white font-semibold py-3 px-8 rounded-lg shadow-lg transition-all transform hover:scale-105 disabled:transform-none flex items-center space-x-2 cyber-border"
            >
              {isDecrypting ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Decrypting...</span>
                </>
              ) : (
                <>
                  <Unlock className="w-5 h-5" />
                  <span>Decrypt to View Chart</span>
                </>
              )}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
