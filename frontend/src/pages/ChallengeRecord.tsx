import { useState, useEffect } from "react";
import { CheckCircle2, XCircle, Calendar, Clock, Lock, Unlock } from "lucide-react";

interface ChallengeRecordProps {
  plantQuest: any;
  ethersSigner: any;
}

export function ChallengeRecord({ plantQuest }: ChallengeRecordProps) {
  const [currentDayIndex, setCurrentDayIndex] = useState(0);

  // If quest not active, show message
  if (!plantQuest.questConfig?.isActive) {
    return (
      <div className="space-y-8">
        <div className="bg-gradient-to-br from-cyber-900/50 via-purple-900/30 to-cyber-900/50 rounded-lg border border-cyber-600/50 shadow-2xl p-8 text-center glow-effect">
          <h1 className="text-4xl font-bold mb-2 neon-text text-neon-cyan">Daily Log</h1>
          <p className="text-cyber-300 mb-6">Please start a quest first</p>
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
    if (plantQuest.questConfig && plantQuest.questConfig.startTime) {
      const dayIndex = Math.floor(
        (Date.now() / 1000 - plantQuest.questConfig.startTime) / 86400
      );
      setCurrentDayIndex(dayIndex);
    }
  }, [plantQuest.questConfig]);

  const handleRecord = (completed: boolean) => {
    plantQuest.logDailyProgress(completed);
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="bg-gradient-to-br from-black via-cyber-900/50 to-black rounded-lg border border-cyber-600/50 shadow-2xl p-8 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-neon-purple/10 via-transparent to-neon-blue/10 animate-pulse-neon" />
        <div className="relative z-10">
          <h1 className="text-4xl font-bold mb-2 neon-text bg-gradient-to-r from-neon-purple via-neon-blue to-neon-cyan bg-clip-text text-transparent">Daily Log</h1>
          <p className="text-cyber-300">Track your plant journey every day</p>
        </div>
      </div>

      {/* Today's Record Card */}
      <div className="bg-black/50 border border-cyber-600/50 rounded-lg shadow-xl p-8">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-neon-purple/30 to-purple-900/30 border border-neon-purple/50 flex items-center justify-center">
            <Calendar className="w-6 h-6 text-neon-purple" />
          </div>
          <h2 className="text-2xl font-bold text-white">Today's Record</h2>
        </div>

        <div className="bg-gradient-to-br from-cyber-900/50 to-black/50 rounded-lg border border-cyber-600/30 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-sm text-cyber-400 uppercase tracking-wider">Current Day</div>
              <div className="text-3xl font-bold text-neon-cyan neon-text">
                Day {currentDayIndex + 1}
              </div>
            </div>
            <Clock className="w-12 h-12 text-neon-blue opacity-50" />
          </div>
          <div className="text-sm text-cyber-300">
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </div>
        </div>

        <div className="space-y-4">
          <p className="text-cyber-200 mb-4">
            Did you complete a full plant-based day today?
          </p>

          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => handleRecord(true)}
              disabled={!plantQuest.canRecord || plantQuest.isRecording}
              className="group relative bg-gradient-to-br from-green-600 via-green-500 to-emerald-600 hover:from-green-700 hover:via-green-600 hover:to-emerald-700 disabled:from-gray-700 disabled:to-gray-800 text-white font-semibold py-6 px-8 rounded-lg shadow-lg transition-all transform hover:scale-105 disabled:transform-none disabled:cursor-not-allowed overflow-hidden cyber-border"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative flex flex-col items-center space-y-2">
                <CheckCircle2 className="w-12 h-12" />
                <span className="text-lg">Yes, I Did! 🌱</span>
              </div>
            </button>

            <button
              onClick={() => handleRecord(false)}
              disabled={!plantQuest.canRecord || plantQuest.isRecording}
              className="group relative bg-gradient-to-br from-gray-600 via-gray-500 to-gray-600 hover:from-gray-700 hover:via-gray-600 hover:to-gray-700 disabled:from-gray-700 disabled:to-gray-800 text-white font-semibold py-6 px-8 rounded-lg shadow-lg transition-all transform hover:scale-105 disabled:transform-none disabled:cursor-not-allowed overflow-hidden border border-gray-500/50"
            >
              <div className="flex flex-col items-center space-y-2">
                <XCircle className="w-12 h-12" />
                <span className="text-lg">Not Today</span>
              </div>
            </button>
          </div>

          {plantQuest.isRecording && (
            <div className="text-center py-4">
              <div className="inline-flex items-center space-x-2 text-neon-cyan">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-neon-cyan"></div>
                <span>Recording...</span>
              </div>
            </div>
          )}

          {!plantQuest.canRecord && !plantQuest.isRecording && (
            <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-lg p-4">
              <p className="text-yellow-300 text-sm text-center">
                {!plantQuest.questConfig?.isActive
                  ? "⚠️ Quest not active. Please start a quest first."
                  : "⚠️ You have already logged for today or quest has ended."}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Decrypt Section */}
      <div className="bg-black/50 border border-cyber-600/50 rounded-lg shadow-xl p-8">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center space-x-2">
          <Lock className="w-5 h-5 text-neon-blue" />
          <span>View Your Encrypted Progress</span>
        </h3>
        <p className="text-cyber-300 mb-4">
          Your completed days are encrypted on-chain. Click below to decrypt and view.
        </p>

        <div className="flex flex-col space-y-4">
          <div className="bg-cyber-900/50 border border-cyber-600/30 rounded-lg p-4">
            <div className="text-sm text-cyber-400 mb-1 uppercase tracking-wider">Encrypted Handle:</div>
            <div className="font-mono text-xs text-cyber-300 break-all">
              {plantQuest.encDaysHandle || "No data yet"}
            </div>
          </div>

          {plantQuest.isDecrypted ? (
            <div className="bg-green-500/20 border-2 border-green-500/50 rounded-lg p-6">
              <div className="flex items-center space-x-3 mb-2">
                <Unlock className="w-6 h-6 text-green-400" />
                <span className="text-lg font-semibold text-green-300">
                  Decrypted Successfully
                </span>
              </div>
              <div className="text-4xl font-bold text-green-400 neon-text">
                {Number(plantQuest.clearDays)} days completed
              </div>
            </div>
          ) : (
            <button
              onClick={plantQuest.decryptEncDays}
              disabled={!plantQuest.canDecrypt || plantQuest.isDecrypting}
              className="bg-gradient-to-r from-neon-purple via-neon-blue to-neon-cyan hover:from-neon-blue hover:via-neon-cyan hover:to-neon-purple disabled:from-gray-700 disabled:to-gray-800 text-white font-semibold py-4 px-8 rounded-lg shadow-lg transition-all transform hover:scale-105 disabled:transform-none disabled:cursor-not-allowed cyber-border overflow-hidden"
            >
              <div className="flex items-center justify-center space-x-2">
                {plantQuest.isDecrypting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Decrypting...</span>
                  </>
                ) : plantQuest.canDecrypt ? (
                  <>
                    <Unlock className="w-5 h-5" />
                    <span>🔓 Decrypt My Progress</span>
                  </>
                ) : (
                  <span>Nothing to decrypt yet</span>
                )}
              </div>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
