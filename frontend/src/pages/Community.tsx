import { useState } from "react";
import { Users, Trophy, TrendingUp, Award, RefreshCw, Lock, Unlock } from "lucide-react";
import { ethers } from "ethers";
import { useLeaderboard } from "@/hooks/useLeaderboard";
import { useMetaMaskEthersSigner } from "@/hooks/metamask/useMetaMaskEthersSigner";
import { FhevmInstance } from "@/fhevm/fhevmTypes";
import { FhevmDecryptionSignature } from "@/fhevm/FhevmDecryptionSignature";
import { GenericStringStorage } from "@/fhevm/GenericStringStorage";
import { PlantQuestABI } from "@/abi/PlantQuestABI";
import { PlantQuestAddresses } from "@/abi/PlantQuestAddresses";

interface CommunityProps {
  plantQuest: any;
  fhevmInstance?: FhevmInstance;
  fhevmDecryptionSignatureStorage?: GenericStringStorage;
}

function formatAddress(address: string): string {
  if (!address) return "";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function getPlantQuestByChainId(chainId: number | undefined) {
  if (!chainId) {
    return null;
  }
  const entry = PlantQuestAddresses[chainId.toString() as keyof typeof PlantQuestAddresses];
  if (!entry || !("address" in entry) || entry.address === ethers.ZeroAddress) {
    return null;
  }
  return {
    address: entry.address as `0x${string}`,
    abi: PlantQuestABI.abi,
  };
}

export function Community({ plantQuest, fhevmInstance, fhevmDecryptionSignatureStorage }: CommunityProps) {
  const { ethersReadonlyProvider, chainId, ethersSigner, accounts } = useMetaMaskEthersSigner();
  const { leaderboard, stats, isLoading, error, refresh } = useLeaderboard(
    chainId,
    ethersReadonlyProvider,
    plantQuest.questConfig
  );

  const [decryptedDays, setDecryptedDays] = useState<Map<string, bigint | string>>(new Map());
  const [decryptingAddress, setDecryptingAddress] = useState<string | null>(null);
  const currentUserAddress = accounts?.[0]?.toLowerCase();

  // Decrypt specified user's completed days
  const decryptUserDays = async (userAddress: string, encDaysHandle: string) => {
    if (!fhevmInstance || !ethersSigner || !fhevmDecryptionSignatureStorage || !chainId) {
      return;
    }

    const contractInfo = getPlantQuestByChainId(chainId);
    if (!contractInfo?.address) {
      return;
    }

    // Only current user can decrypt their own data
    if (userAddress.toLowerCase() !== currentUserAddress?.toLowerCase()) {
      return;
    }

    setDecryptingAddress(userAddress);

    try {
      const sig = await FhevmDecryptionSignature.loadOrSign(
        fhevmInstance,
        [contractInfo.address],
        ethersSigner,
        fhevmDecryptionSignatureStorage
      );

      if (!sig) {
        console.error("Unable to build FHEVM decryption signature");
        return;
      }

      const res = await fhevmInstance.userDecrypt(
        [{ handle: encDaysHandle, contractAddress: contractInfo.address }],
        sig.privateKey,
        sig.publicKey,
        sig.signature,
        sig.contractAddresses,
        sig.userAddress,
        sig.startTimestamp,
        sig.durationDays
      );

      const days = (res as unknown as Record<string, number>)[encDaysHandle] ?? 0;
      setDecryptedDays((prev) => {
        const newMap = new Map(prev);
        newMap.set(userAddress, String(days));
        return newMap;
      });
    } catch (error: any) {
      console.error("Failed to decrypt user days:", error);
    } finally {
      setDecryptingAddress(null);
    }
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="bg-gradient-to-br from-black via-purple-900/30 to-cyber-900/50 rounded-lg border border-cyber-600/50 shadow-2xl p-8 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-transparent to-cyan-500/10 animate-pulse-neon" />
        <div className="relative z-10">
          <h1 className="text-4xl font-bold mb-2 neon-text bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">Network</h1>
          <p className="text-cyber-300">Join the plant champions</p>
        </div>
      </div>

      {/* Community Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-black/50 border border-cyber-600/50 rounded-lg shadow-lg p-6">
          <div className="flex items-center space-x-4">
            <div className="bg-neon-purple/30 w-14 h-14 rounded-full flex items-center justify-center border border-neon-purple/50">
              <Users className="w-7 h-7 text-neon-purple" />
            </div>
            <div>
              <div className="text-sm text-cyber-400 uppercase tracking-wider">Total Participants</div>
              <div className="text-3xl font-bold text-white">
                {isLoading ? (
                  <div className="animate-pulse">...</div>
                ) : (
                  stats.totalParticipants
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-black/50 border border-cyber-600/50 rounded-lg shadow-lg p-6">
          <div className="flex items-center space-x-4">
            <div className="bg-yellow-500/30 w-14 h-14 rounded-full flex items-center justify-center border border-yellow-500/50">
              <Trophy className="w-7 h-7 text-yellow-400" />
            </div>
            <div>
              <div className="text-sm text-cyber-400 uppercase tracking-wider">Champions</div>
              <div className="text-3xl font-bold text-white">
                {isLoading ? (
                  <div className="animate-pulse">...</div>
                ) : (
                  stats.champions
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-black/50 border border-cyber-600/50 rounded-lg shadow-lg p-6">
          <div className="flex items-center space-x-4">
            <div className="bg-green-500/30 w-14 h-14 rounded-full flex items-center justify-center border border-green-500/50">
              <TrendingUp className="w-7 h-7 text-green-400" />
            </div>
            <div>
              <div className="text-sm text-cyber-400 uppercase tracking-wider">Success Rate</div>
              <div className="text-3xl font-bold text-white">
                {isLoading ? (
                  <div className="animate-pulse">...</div>
                ) : (
                  `${stats.successRate}%`
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Leaderboard */}
      <div className="bg-black/50 border border-cyber-600/50 rounded-lg shadow-xl p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white flex items-center space-x-2">
            <Trophy className="w-6 h-6 text-yellow-400" />
            <span>Leaderboard</span>
          </h2>
          <button
            onClick={refresh}
            disabled={isLoading}
            className="flex items-center space-x-2 px-4 py-2 bg-cyber-900/50 hover:bg-cyber-800/50 disabled:bg-cyber-900/30 text-cyber-300 disabled:text-gray-600 rounded-lg transition-colors border border-cyber-600/50"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
            <span className="text-sm font-semibold">Refresh</span>
          </button>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-300 text-sm">
            Error: {error}
          </div>
        )}

        {isLoading && leaderboard.length === 0 ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-neon-cyan mx-auto mb-4"></div>
            <p className="text-cyber-300">Loading leaderboard...</p>
          </div>
        ) : leaderboard.length === 0 ? (
          <div className="text-center py-12">
            <Trophy className="w-16 h-16 text-gray-500 mx-auto mb-4" />
            <p className="text-cyber-300">No participants yet. Be the first to join!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {leaderboard.map((entry, index) => {
              const rank = index + 1;
              const isCurrentUser = entry.address.toLowerCase() === currentUserAddress?.toLowerCase();
              const hasEncHandle = entry.encDaysHandle && entry.encDaysHandle !== ethers.ZeroHash;
              const isDecrypted = decryptedDays.has(entry.address);
              const decryptedDaysValue = decryptedDays.get(entry.address);
              const isDecrypting = decryptingAddress === entry.address;

              return (
                <div
                  key={entry.address}
                  className={`flex items-center justify-between p-4 rounded-lg border ${
                    rank === 1
                      ? "bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-yellow-500/50 glow-effect"
                      : "bg-cyber-900/30 border-cyber-600/30 hover:bg-cyber-900/50"
                  } transition-all`}
                >
                  <div className="flex items-center space-x-4 flex-1">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-bold border-2 ${
                        rank === 1
                          ? "bg-yellow-500 text-black border-yellow-400"
                          : rank === 2
                          ? "bg-gray-400 text-white border-gray-300"
                          : rank === 3
                          ? "bg-orange-600 text-white border-orange-500"
                          : "bg-cyber-800 text-cyber-300 border-cyber-600"
                      }`}
                    >
                      {rank}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <div className="font-mono text-sm text-white">
                          {formatAddress(entry.address)}
                        </div>
                        {isCurrentUser && (
                          <span className="text-xs bg-neon-purple/30 text-neon-purple px-2 py-0.5 rounded border border-neon-purple/50">
                            You
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-cyber-400 mt-1">
                        {entry.recordCount || 0} records
                        {entry.questCompleted && " • Quest Completed"}
                        {isDecrypted && decryptedDaysValue !== undefined && (
                          <span className="ml-2 font-semibold text-neon-cyan">
                            • {Number(decryptedDaysValue)} days completed
                          </span>
                        )}
                        {!isDecrypted && hasEncHandle && isCurrentUser && (
                          <span className="ml-2 text-cyber-500 flex items-center space-x-1">
                            <Lock className="w-3 h-3" />
                            <span>Encrypted</span>
                          </span>
                        )}
                        {!isDecrypted && !hasEncHandle && (
                          <span className="ml-2 text-cyber-500">No progress yet</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {isCurrentUser && hasEncHandle && !isDecrypted && (
                      <button
                        onClick={() => decryptUserDays(entry.address, entry.encDaysHandle!)}
                        disabled={isDecrypting || !fhevmInstance}
                        className="flex items-center space-x-1 px-3 py-1.5 bg-neon-blue hover:bg-cyan-700 disabled:bg-gray-700 text-white text-xs font-semibold rounded-lg transition-colors border border-cyan-500/50"
                      >
                        {isDecrypting ? (
                          <>
                            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                            <span>Decrypting...</span>
                          </>
                        ) : (
                          <>
                            <Unlock className="w-3 h-3" />
                            <span>Decrypt</span>
                          </>
                        )}
                      </button>
                    )}
                    {isDecrypted && (
                      <div className="flex items-center space-x-1 px-3 py-1.5 bg-green-500/20 text-green-300 text-xs font-semibold rounded-lg border border-green-500/50">
                        <Unlock className="w-3 h-3" />
                        <span>Decrypted</span>
                      </div>
                    )}
                    {entry.badgeMinted && (
                      <div className="flex items-center space-x-2 bg-yellow-500/20 px-3 py-1 rounded-full border border-yellow-500/50">
                        <Award className="w-4 h-4 text-yellow-400" />
                        <span className="text-sm font-semibold text-yellow-300">
                          Champion
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-6 text-center text-sm text-cyber-400">
          Note: Progress data is encrypted. Rankings are based on quest completion status and record counts.
        </div>
      </div>

      {/* Privacy Notice */}
      <div className="bg-gradient-to-br from-cyber-900/50 to-black/50 rounded-lg p-6 border-2 border-cyber-600/50">
        <div className="flex items-start space-x-4">
          <div className="bg-neon-purple/30 rounded-full p-3 border border-neon-purple/50">
            <Award className="w-6 h-6 text-neon-purple" />
          </div>
          <div>
            <h4 className="font-semibold text-white mb-2">
              Privacy Protected
            </h4>
            <p className="text-sm text-cyber-300">
              Your daily progress is encrypted using FHEVM technology. Only you can decrypt and view your detailed records. Community stats show aggregated data without revealing individual details.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
