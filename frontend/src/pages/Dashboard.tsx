import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Calendar, TrendingUp, Award, Sparkles, Clock, Zap } from "lucide-react";
import { CircularProgress } from "@/components/CircularProgress";

interface DashboardProps {
  plantQuest: any;
  fhevmInstance: any;
  fhevmStatus: string;
}

export function Dashboard({ plantQuest, fhevmInstance, fhevmStatus }: DashboardProps) {
  const [currentDay, setCurrentDay] = useState(0);
  const [progress, setProgress] = useState(0);
  const [remainingDays, setRemainingDays] = useState(0);

  // If quest not active, show message
  if (!plantQuest.questConfig?.isActive) {
    return (
      <div className="space-y-8">
        <div className="bg-gradient-to-br from-cyber-900/50 via-purple-900/30 to-cyber-900/50 rounded-lg border border-cyber-600/50 shadow-2xl p-8 text-center glow-effect">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-neon-purple to-neon-blue rounded-full mb-6 animate-pulse-neon">
            <Sparkles className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-4xl font-bold mb-4 neon-text text-neon-cyan">⚡ No Active Quest</h1>
          <p className="text-cyber-300 text-lg mb-6">
            Initialize your mission to begin tracking
          </p>
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

  useEffect(() => {
    if (plantQuest.questConfig && plantQuest.clearDays !== undefined) {
      const completedDays = Number(plantQuest.clearDays);
      const totalDays = plantQuest.questConfig.duration;
      setProgress((completedDays / totalDays) * 100);
      setRemainingDays(Math.max(0, totalDays - completedDays));

      // Calculate current day
      if (plantQuest.questConfig.startTime) {
        const daysSinceStart = Math.floor(
          (Date.now() / 1000 - plantQuest.questConfig.startTime) / 86400
        );
        setCurrentDay(Math.min(daysSinceStart + 1, totalDays));
      }
    }
  }, [plantQuest.questConfig, plantQuest.clearDays]);

  const stats = [
    {
      icon: Calendar,
      label: "Completed Days",
      value: plantQuest.isDecrypted
        ? Number(plantQuest.clearDays)
        : "---",
      color: "text-neon-purple",
      bgGradient: "from-neon-purple/20 to-purple-900/20",
    },
    {
      icon: Clock,
      label: "Remaining Days",
      value: remainingDays,
      color: "text-neon-blue",
      bgGradient: "from-neon-blue/20 to-cyan-900/20",
    },
    {
      icon: TrendingUp,
      label: "Current Day",
      value: currentDay,
      color: "text-neon-cyan",
      bgGradient: "from-neon-cyan/20 to-blue-900/20",
    },
    {
      icon: Award,
      label: "Quest Status",
      value: plantQuest.questStatus?.questCompleted ? "✓ COMPLETE" : "ACTIVE",
      color: plantQuest.questStatus?.questCompleted
        ? "text-green-400"
        : "text-yellow-400",
      bgGradient: plantQuest.questStatus?.questCompleted
        ? "from-green-500/20 to-emerald-900/20"
        : "from-yellow-500/20 to-orange-900/20",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Hero Section - Cyberpunk Style */}
      <div className="relative bg-gradient-to-br from-black via-cyber-900/50 to-black rounded-lg border border-cyber-600/50 shadow-2xl p-8 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-neon-purple/10 via-transparent to-neon-blue/10 animate-pulse-neon" />
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between">
          <div className="mb-6 md:mb-0">
            <h1 className="text-4xl md:text-5xl font-bold mb-2 neon-text bg-gradient-to-r from-neon-purple via-neon-blue to-neon-cyan bg-clip-text text-transparent">
              ⚡ PlantQuest Command Center
            </h1>
            <p className="text-cyber-300 text-lg">
              Encrypted progress tracking system
            </p>
            <div className="mt-4 flex items-center space-x-2">
              <div className="px-3 py-1 bg-cyber-800/50 border border-cyber-600/50 rounded-full text-sm text-cyber-300">
                FHEVM: {fhevmStatus}
              </div>
              {fhevmInstance && (
                <div className="px-3 py-1 bg-green-500/20 border border-green-500/50 rounded-full text-sm text-green-400">
                  ✓ ENCRYPTED
                </div>
              )}
            </div>
          </div>
          <div className="relative bg-black/50 backdrop-blur-sm rounded-lg border border-cyber-600/50 p-6 glow-effect">
            <CircularProgress
              percentage={progress}
              size={180}
              strokeWidth={14}
              label="Progress"
            />
          </div>
        </div>
      </div>

      {/* Stats Grid - Cyberpunk Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className={`relative bg-gradient-to-br ${stat.bgGradient} border border-cyber-600/50 rounded-lg p-6 hover:border-cyber-500 transition-all group`}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-transparent to-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg" />
              <div className="relative z-10">
                <div className={`inline-flex p-3 rounded-lg bg-gradient-to-br ${stat.bgGradient} mb-4`}>
                  <Icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <div className="text-sm text-cyber-400 mb-1 uppercase tracking-wider">{stat.label}</div>
                <div className={`text-3xl font-bold ${stat.color} neon-text`}>
                  {stat.value}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Actions - Cyberpunk Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          to="/record"
          className="group relative bg-black/50 border border-cyber-600/50 rounded-lg p-6 hover:border-neon-purple transition-all overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-neon-purple/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="relative flex items-center space-x-4">
            <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-neon-purple/30 to-purple-900/30 flex items-center justify-center border border-neon-purple/50">
              <Calendar className="w-8 h-8 text-neon-purple" />
            </div>
            <div>
              <h3 className="font-semibold text-lg text-white">Record Today</h3>
              <p className="text-sm text-cyber-400">Log daily progress</p>
            </div>
          </div>
        </Link>

        <Link
          to="/progress"
          className="group relative bg-black/50 border border-cyber-600/50 rounded-lg p-6 hover:border-neon-blue transition-all overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-neon-blue/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="relative flex items-center space-x-4">
            <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-neon-blue/30 to-cyan-900/30 flex items-center justify-center border border-neon-blue/50">
              <TrendingUp className="w-8 h-8 text-neon-blue" />
            </div>
            <div>
              <h3 className="font-semibold text-lg text-white">View Stats</h3>
              <p className="text-sm text-cyber-400">Analytics dashboard</p>
            </div>
          </div>
        </Link>

        <Link
          to="/rewards"
          className="group relative bg-black/50 border border-cyber-600/50 rounded-lg p-6 hover:border-neon-cyan transition-all overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-neon-cyan/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="relative flex items-center space-x-4">
            <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-neon-cyan/30 to-blue-900/30 flex items-center justify-center border border-neon-cyan/50">
              <Award className="w-8 h-8 text-neon-cyan" />
            </div>
            <div>
              <h3 className="font-semibold text-lg text-white">Claim Rewards</h3>
              <p className="text-sm text-cyber-400">Get achievements</p>
            </div>
          </div>
        </Link>
      </div>

      {/* Quest Info */}
      {plantQuest.questConfig && (
        <div className="bg-black/50 border border-cyber-600/50 rounded-lg p-6">
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center space-x-2">
            <Zap className="w-6 h-6 text-neon-cyan" />
            <span>Mission Parameters</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex justify-between">
              <span className="text-sm text-cyber-400">Duration:</span>
              <span className="font-semibold text-white">
                {plantQuest.questConfig.duration} days
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-cyber-400">Started:</span>
              <span className="font-semibold text-white">
                {new Date(
                  plantQuest.questConfig.startTime * 1000
                ).toLocaleDateString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-cyber-400">Status:</span>
              <span
                className={`font-semibold ${
                  plantQuest.questConfig.isActive
                    ? "text-green-400"
                    : "text-cyber-400"
                }`}
              >
                {plantQuest.questConfig.isActive ? "ACTIVE" : "INACTIVE"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-cyber-400">Organizer:</span>
              <span className="font-mono text-sm text-cyber-300">
                {plantQuest.questConfig.organizer?.slice(0, 10)}...
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Debug Info */}
      {plantQuest.message && (
        <div className="bg-cyber-900/50 border border-cyber-600/50 rounded-lg p-4">
          <p className="text-sm text-cyber-300">
            <span className="font-semibold text-neon-cyan">System:</span> {plantQuest.message}
          </p>
        </div>
      )}
    </div>
  );
}
