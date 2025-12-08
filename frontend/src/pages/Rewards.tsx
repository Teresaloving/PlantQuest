import { Award, Gift, Sparkles, Trophy, CheckCircle, Lock } from "lucide-react";

interface RewardsProps {
  plantQuest: any;
}

function PlantIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M17 8C8 10 5.9 16.17 3.82 21.34l1.89.66.67-2.1C8.15 20.67 10 20 11 20s2.85.67 4.62 1.9l.67 2.1 1.89-.66C16.1 16.17 14 10 5 8c0-4 3-7 8-7s8 3 8 7z" />
    </svg>
  );
}

export function Rewards({ plantQuest }: RewardsProps) {
  // If quest not active, show message
  if (!plantQuest.questConfig?.isActive) {
    return (
      <div className="space-y-8">
        <div className="bg-gradient-to-br from-cyber-900/50 via-yellow-900/30 to-orange-900/30 rounded-lg border border-cyber-600/50 shadow-2xl p-8 text-center glow-effect">
          <h1 className="text-4xl font-bold mb-2 neon-text text-neon-cyan">Rewards & Achievements</h1>
          <p className="text-cyber-300 mb-6">Please start a quest first to earn rewards</p>
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

  const isCompleted = plantQuest.questStatus?.questCompleted;
  const isBadgeMinted = plantQuest.questStatus?.badgeMinted;
  const isFirstCheckInBadgeMinted = plantQuest.questStatus?.firstCheckInBadgeMinted;
  const hasRecorded = plantQuest.questStatus?.lastRecordTime > 0;

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="bg-gradient-to-br from-black via-yellow-900/20 to-orange-900/20 rounded-lg border border-yellow-500/50 shadow-2xl p-8 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/10 via-transparent to-orange-500/10 animate-pulse-neon" />
        <div className="relative z-10">
          <h1 className="text-4xl font-bold mb-2 neon-text bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 bg-clip-text text-transparent">Rewards & Achievements</h1>
          <p className="text-cyber-300">Claim your plant champion badge</p>
        </div>
      </div>

      {/* Completion Status */}
      <div className="bg-black/50 border border-cyber-600/50 rounded-lg shadow-xl p-8">
        {isCompleted ? (
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-green-400 to-green-600 rounded-full mb-6 animate-pulse-neon border-2 border-green-400/50">
              <Trophy className="w-12 h-12 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-2 neon-text">
              🎉 Congratulations!
            </h2>
            <p className="text-lg text-cyber-300 mb-6">
              You've successfully completed the PlantQuest Challenge!
            </p>
            <div className="inline-flex items-center space-x-2 bg-green-500/20 border border-green-500/50 text-green-300 px-6 py-3 rounded-full">
              <CheckCircle className="w-5 h-5" />
              <span className="font-semibold">Quest Completed</span>
            </div>
          </div>
        ) : (
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-cyber-900/50 rounded-full mb-6 border border-cyber-600/50">
              <Award className="w-12 h-12 text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">
              Keep Going!
            </h2>
            <p className="text-cyber-300 mb-4">
              Complete the quest to unlock your rewards
            </p>
            {plantQuest.isDecrypted && (
              <div className="text-lg text-neon-cyan">
                Progress: {Number(plantQuest.clearDays)} /{" "}
                {plantQuest.questConfig?.duration || 0} days
              </div>
            )}
          </div>
        )}
      </div>

      {/* First Check-In Badge */}
      <div className="bg-black/50 border border-cyber-600/50 rounded-lg shadow-xl p-8">
        <h3 className="text-2xl font-bold text-white mb-6 flex items-center space-x-2">
          <Award className="w-6 h-6 text-neon-blue" />
          <span>First Check-In Badge</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Badge Card */}
          <div className="relative">
            <div
              className={`relative aspect-square rounded-lg shadow-2xl overflow-hidden border-2 ${
                isFirstCheckInBadgeMinted
                  ? "bg-gradient-to-br from-neon-blue via-cyan-600 to-blue-600 border-neon-blue glow-effect"
                  : hasRecorded
                  ? "bg-gradient-to-br from-blue-700 via-cyan-700 to-blue-800 opacity-75 border-cyan-600/50"
                  : "bg-gradient-to-br from-gray-700 via-gray-800 to-gray-900 opacity-50 border-gray-600"
              }`}
            >
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center text-white">
                  <Award className="w-24 h-24 mx-auto mb-4" />
                  <div className="text-2xl font-bold">First Check-In</div>
                  <div className="text-lg">Participation Badge</div>
                  {isFirstCheckInBadgeMinted && (
                    <div className="mt-4 text-sm opacity-80">
                      Claimed:{" "}
                      {new Date().toLocaleDateString("en-US", {
                        month: "short",
                        year: "numeric",
                      })}
                    </div>
                  )}
                </div>
              </div>
              {!hasRecorded && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/70">
                  <div className="text-white text-center">
                    <Lock className="w-16 h-16 mx-auto mb-2 text-gray-400" />
                    <div className="text-lg font-semibold">Locked</div>
                    <div className="text-sm">Record your first check-in</div>
                  </div>
                </div>
              )}
            </div>
            {isFirstCheckInBadgeMinted && (
              <div className="absolute -top-2 -right-2 bg-neon-blue text-white px-3 py-1 rounded-full text-sm font-semibold shadow-lg border border-cyan-400/50">
                ✓ Claimed
              </div>
            )}
          </div>

          {/* Badge Info */}
          <div className="space-y-6">
            <div>
              <h4 className="font-semibold text-white mb-3 text-lg">
                Badge Description
              </h4>
              <p className="text-cyber-300 mb-4">
                Claim this special badge after your first check-in! This badge celebrates your commitment to starting your plant journey.
              </p>
              <ul className="space-y-3">
                <li className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-neon-blue mt-0.5 flex-shrink-0" />
                  <span className="text-cyber-300">
                    Available after your first check-in
                  </span>
                </li>
                <li className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-neon-blue mt-0.5 flex-shrink-0" />
                  <span className="text-cyber-300">
                    On-chain proof of participation
                  </span>
                </li>
                <li className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-neon-blue mt-0.5 flex-shrink-0" />
                  <span className="text-cyber-300">
                    Transferable NFT on Ethereum
                  </span>
                </li>
              </ul>
            </div>

            {hasRecorded && !isFirstCheckInBadgeMinted && (
              <div className="space-y-3">
                <button
                  className="w-full bg-gradient-to-r from-neon-blue to-cyan-600 hover:from-cyan-600 hover:to-neon-blue text-white font-bold py-4 px-8 rounded-lg shadow-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none cyber-border"
                  onClick={async () => {
                    try {
                      console.log("[Rewards] Claiming first check-in badge...");
                      if (!plantQuest.claimFirstCheckInBadge) {
                        console.error("[Rewards] claimFirstCheckInBadge function not found");
                        alert("Function not available. Please refresh the page.");
                        return;
                      }
                      await plantQuest.claimFirstCheckInBadge();
                      // Wait for transaction to be mined
                      setTimeout(() => {
                        plantQuest.refreshQuestStatus();
                      }, 3000);
                    } catch (error: any) {
                      console.error("[Rewards] Failed to claim badge:", error);
                      alert(`Failed to claim badge: ${error.message || error}`);
                    }
                  }}
                  disabled={plantQuest.isRecording}
                >
                  <div className="flex items-center justify-center space-x-2">
                    {plantQuest.isRecording ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        <span>Claiming...</span>
                      </>
                    ) : (
                      <>
                        <Gift className="w-5 h-5" />
                        <span>Claim First Check-In Badge</span>
                      </>
                    )}
                  </div>
                </button>
                {plantQuest.message && (
                  <div className="text-sm text-cyber-400 text-center">
                    {plantQuest.message}
                  </div>
                )}
              </div>
            )}

            {isFirstCheckInBadgeMinted && (
              <div className="bg-blue-500/20 border-2 border-blue-500/50 rounded-lg p-4">
                <div className="flex items-center space-x-2 text-blue-300">
                  <Trophy className="w-5 h-5" />
                  <span className="font-semibold">First Check-In Badge Claimed!</span>
                </div>
              </div>
            )}

            {!hasRecorded && (
              <div className="bg-cyber-900/50 border-2 border-cyber-600/50 rounded-lg p-4">
                <div className="flex items-center space-x-2 text-cyber-400">
                  <Award className="w-5 h-5" />
                  <span className="text-sm">
                    Record your first check-in to unlock this badge
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Completion Badge */}
      <div className="bg-black/50 border border-cyber-600/50 rounded-lg shadow-xl p-8">
        <h3 className="text-2xl font-bold text-white mb-6 flex items-center space-x-2">
          <Sparkles className="w-6 h-6 text-yellow-400" />
          <span>PlantQuest Champion Badge</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* NFT Card */}
          <div className="relative">
            <div
              className={`relative aspect-square rounded-lg shadow-2xl overflow-hidden border-2 ${
                isCompleted
                  ? "bg-gradient-to-br from-green-500 via-emerald-600 to-green-700 border-green-400 glow-effect"
                  : "bg-gradient-to-br from-gray-700 via-gray-800 to-gray-900 opacity-50 border-gray-600"
              }`}
            >
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center text-white">
                  <PlantIcon className="w-24 h-24 mx-auto mb-4" />
                  <div className="text-2xl font-bold">PlantQuest</div>
                  <div className="text-lg">Champion Badge</div>
                  {isCompleted && (
                    <div className="mt-4 text-sm opacity-80">
                      Completed:{" "}
                      {new Date().toLocaleDateString("en-US", {
                        month: "short",
                        year: "numeric",
                      })}
                    </div>
                  )}
                </div>
              </div>
              {!isCompleted && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/70">
                  <div className="text-white text-center">
                    <Lock className="w-16 h-16 mx-auto mb-2 text-gray-400" />
                    <div className="text-lg font-semibold">Locked</div>
                    <div className="text-sm">Complete quest to unlock</div>
                  </div>
                </div>
              )}
            </div>
            {isBadgeMinted && (
              <div className="absolute -top-2 -right-2 bg-yellow-500 text-white px-3 py-1 rounded-full text-sm font-semibold shadow-lg border border-yellow-400/50">
                ✓ Minted
              </div>
            )}
          </div>

          {/* Badge Info */}
          <div className="space-y-6">
            <div>
              <h4 className="font-semibold text-white mb-3 text-lg">
                Badge Features
              </h4>
              <ul className="space-y-3">
                <li className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                  <span className="text-cyber-300">
                    On-chain proof of your plant commitment
                  </span>
                </li>
                <li className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                  <span className="text-cyber-300">
                    Transferable NFT on Ethereum
                  </span>
                </li>
                <li className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                  <span className="text-cyber-300">
                    Showcase in your digital wallet
                  </span>
                </li>
                <li className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                  <span className="text-cyber-300">
                    Join the PlantQuest Champions community
                  </span>
                </li>
              </ul>
            </div>

            {isCompleted && !isBadgeMinted && (
              <button
                className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-bold py-4 px-8 rounded-lg shadow-lg transition-all transform hover:scale-105 cyber-border"
                onClick={() => {
                  alert("Badge minting feature coming soon!");
                }}
              >
                <div className="flex items-center justify-center space-x-2">
                  <Gift className="w-5 h-5" />
                  <span>Claim Your Badge NFT</span>
                </div>
              </button>
            )}

            {isBadgeMinted && (
              <div className="bg-green-500/20 border-2 border-green-500/50 rounded-lg p-4">
                <div className="flex items-center space-x-2 text-green-300">
                  <Trophy className="w-5 h-5" />
                  <span className="font-semibold">Badge Successfully Minted!</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Achievement Timeline */}
      {plantQuest.isDecrypted && (
        <div className="bg-black/50 border border-cyber-600/50 rounded-lg shadow-xl p-8">
          <h3 className="text-2xl font-bold text-white mb-6">
            Your Journey
          </h3>
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <div className="bg-neon-purple/30 w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 border border-neon-purple/50">
                <Award className="w-6 h-6 text-neon-purple" />
              </div>
              <div>
                <div className="font-semibold text-white">
                  Completed {Number(plantQuest.clearDays)} plant-based days
                </div>
                <div className="text-sm text-cyber-400">
                  Keep up the great work!
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
