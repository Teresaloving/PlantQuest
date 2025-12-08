import { useState } from "react";
import { Rocket, Calendar, Info } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface StartChallengeProps {
  plantQuest: any;
  onQuestStarted: () => void;
}

export function StartChallenge({ plantQuest, onQuestStarted }: StartChallengeProps) {
  const [duration, setDuration] = useState(7);
  const navigate = useNavigate();

  const handleStart = async () => {
    try {
      await plantQuest.initiateQuest(duration);
      // Wait a bit for the transaction to be mined and state to update
      setTimeout(async () => {
        await plantQuest.refreshQuestConfig();
        onQuestStarted();
        // Force navigation to dashboard after state update
        setTimeout(() => {
          navigate("/");
        }, 500);
      }, 3000);
    } catch (error) {
      console.error("Failed to start quest:", error);
    }
  };

  const durationOptions = [
    { days: 3, label: "3 Days", description: "Quick Mission" },
    { days: 7, label: "7 Days", description: "Standard Quest" },
    { days: 14, label: "14 Days", description: "Extended Challenge" },
    { days: 30, label: "30 Days", description: "Full Campaign" },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <div className="max-w-2xl w-full">
        <div className="relative bg-black/80 border border-cyber-600/50 rounded-lg shadow-2xl p-10 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-neon-purple/10 via-transparent to-neon-blue/10 animate-pulse-neon" />
          <div className="relative z-10">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-neon-purple to-neon-blue rounded-full mb-6 animate-glow">
                <Rocket className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-4xl font-bold text-white mb-3 neon-text">
                Initialize Quest
              </h1>
              <p className="text-lg text-cyber-300">
                Select mission duration and begin your encrypted journey
              </p>
            </div>

            {/* Duration Selection */}
            <div className="mb-8">
              <label className="block text-sm font-semibold text-cyber-300 mb-4 uppercase tracking-wider">
                Select Mission Duration
              </label>
              <div className="grid grid-cols-2 gap-4">
                {durationOptions.map((option) => (
                  <button
                    key={option.days}
                    onClick={() => setDuration(option.days)}
                    className={`relative p-6 rounded-lg border-2 transition-all overflow-hidden ${
                      duration === option.days
                        ? "border-neon-purple bg-gradient-to-br from-neon-purple/20 to-purple-900/20 glow-effect"
                        : "border-cyber-600/50 hover:border-cyber-500 hover:bg-cyber-900/30"
                    }`}
                  >
                    {duration === option.days && (
                      <div className="absolute inset-0 bg-gradient-to-r from-neon-purple/20 to-neon-blue/20 animate-pulse-neon" />
                    )}
                    <div className="relative flex items-center space-x-3 mb-2">
                      <Calendar
                        className={`w-5 h-5 ${
                          duration === option.days ? "text-neon-purple" : "text-cyber-400"
                        }`}
                      />
                      <span
                        className={`text-2xl font-bold ${
                          duration === option.days ? "text-neon-cyan" : "text-white"
                        }`}
                      >
                        {option.label}
                      </span>
                    </div>
                    <div className="text-sm text-cyber-400">{option.description}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Info Box */}
            <div className="bg-cyber-900/50 border border-neon-blue/30 rounded-lg p-6 mb-8">
              <div className="flex items-start space-x-3">
                <Info className="w-5 h-5 text-neon-blue mt-0.5 flex-shrink-0" />
                <div className="text-sm text-cyber-300">
                  <p className="mb-2">
                    <strong className="text-neon-cyan">System Protocol:</strong>
                  </p>
                  <ul className="space-y-1 ml-4 list-disc">
                    <li>Daily progress logging enabled</li>
                    <li>All data encrypted using FHEVM technology</li>
                    <li>Complete quest to earn NFT achievements</li>
                    <li>Privacy protected on-chain</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Start Button */}
            <button
              onClick={handleStart}
              disabled={plantQuest.isRecording}
              className="relative w-full bg-gradient-to-r from-neon-purple via-neon-blue to-neon-cyan hover:from-neon-blue hover:via-neon-cyan hover:to-neon-purple disabled:from-gray-700 disabled:to-gray-800 text-white font-bold py-5 px-8 rounded-lg shadow-2xl transition-all transform hover:scale-105 disabled:transform-none disabled:cursor-not-allowed overflow-hidden cyber-border"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
              {plantQuest.isRecording ? (
                <span className="relative flex items-center justify-center space-x-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Initializing...</span>
                </span>
              ) : (
                <span className="relative flex items-center justify-center space-x-2">
                  <Rocket className="w-5 h-5" />
                  <span>Start {duration}-Day Quest</span>
                </span>
              )}
            </button>

            {plantQuest.message && (
              <div className="mt-4 text-center text-sm text-cyber-400">
                {plantQuest.message}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
