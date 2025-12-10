import { ethers } from "ethers";
import { useCallback, useEffect, useState, useMemo } from "react";
import { PlantQuestABI } from "@/abi/PlantQuestABI";
import { PlantQuestAddresses } from "@/abi/PlantQuestAddresses";

export interface LeaderboardEntry {
  address: string;
  questCompleted: boolean;
  badgeMinted: boolean;
  lastRecordTime: number;
  recordCount?: number; // Record count from event statistics
  encDaysHandle?: string; // Encrypted days handle for decryption
}

export interface LeaderboardStats {
  totalParticipants: number;
  champions: number; // Number of users who completed the quest
  successRate: number; // Success rate (completed users / total participants)
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
    chainId: entry.chainId ?? chainId,
    chainName: entry.chainName,
    abi: PlantQuestABI.abi,
  };
}

export function useLeaderboard(
  chainId: number | undefined,
  ethersReadonlyProvider: ethers.ContractRunner | undefined,
  questConfig: any
) {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const contractInfo = useMemo(() => {
    return getPlantQuestByChainId(chainId);
  }, [chainId]);

  // Fetch all participants from events
  const fetchLeaderboardFromEvents = useCallback(async () => {
    if (!contractInfo?.address || !ethersReadonlyProvider || !questConfig?.isActive) {
      setLeaderboard([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const contract = new ethers.Contract(
        contractInfo.address,
        contractInfo.abi,
        ethersReadonlyProvider
      );

      // Get quest start time
      const startTime = questConfig.startTime;
      const endTime = startTime + questConfig.duration * 24 * 60 * 60;

      // Query DailyProgressLogged events
      const filter = contract.filters.DailyProgressLogged();
      const events = await contract.queryFilter(filter, 0, "latest");

      // Extract all unique participant addresses
      const participantAddresses = new Set<string>();
      const recordCounts = new Map<string, number>();

      events.forEach((event: any) => {
        if (event.args) {
          const userAddress = event.args.user?.toLowerCase();
          const timestamp = Number(event.args.timestamp || 0);
          
          // Only count events within current quest period
          if (timestamp >= startTime && timestamp <= endTime) {
            participantAddresses.add(userAddress);
            recordCounts.set(
              userAddress,
              (recordCounts.get(userAddress) || 0) + 1
            );
          }
        }
      });

      // Query QuestCompleted events to get completers
      const completedFilter = contract.filters.QuestCompleted();
      const completedEvents = await contract.queryFilter(completedFilter, 0, "latest");
      const completedAddresses = new Set<string>();
      
      completedEvents.forEach((event: any) => {
        if (event.args) {
          const userAddress = event.args.user?.toLowerCase();
          const completedTime = Number(event.args.completedTime || 0);
          if (completedTime >= startTime && completedTime <= endTime) {
            completedAddresses.add(userAddress);
          }
        }
      });

      // Query BadgeMinted events to get badge holders
      const badgeFilter = contract.filters.BadgeMinted();
      const badgeEvents = await contract.queryFilter(badgeFilter, 0, "latest");
      const badgeAddresses = new Set<string>();
      
      badgeEvents.forEach((event: any) => {
        if (event.args) {
          const userAddress = event.args.user?.toLowerCase();
          badgeAddresses.add(userAddress);
        }
      });

      // Get detailed information for each participant
      const entries: LeaderboardEntry[] = [];
      const addressArray = Array.from(participantAddresses);

      for (const address of addressArray) {
        try {
          const [status, progress] = await Promise.all([
            contract.getQuestStatus(address),
            contract.fetchUserProgress(address).catch(() => [null, null]),
          ]);
          
          entries.push({
            address,
            questCompleted: status.questCompleted || completedAddresses.has(address),
            badgeMinted: status.badgeMinted || badgeAddresses.has(address),
            lastRecordTime: Number(status.lastRecordTime || 0),
            recordCount: recordCounts.get(address) || 0,
            encDaysHandle: progress[0] && progress[0] !== ethers.ZeroHash ? progress[0] : undefined,
          });
        } catch (e) {
          // If query fails, use event data
          entries.push({
            address,
            questCompleted: completedAddresses.has(address),
            badgeMinted: badgeAddresses.has(address),
            lastRecordTime: 0,
            recordCount: recordCounts.get(address) || 0,
            encDaysHandle: undefined,
          });
        }
      }

      // Sort: by completion status first, then by record count, finally by last record time
      entries.sort((a, b) => {
        // Completed quests first
        if (a.questCompleted !== b.questCompleted) {
          return a.questCompleted ? -1 : 1;
        }
        // Then by record count
        if ((a.recordCount || 0) !== (b.recordCount || 0)) {
          return (b.recordCount || 0) - (a.recordCount || 0);
        }
        // Finally by last record time
        return (b.lastRecordTime || 0) - (a.lastRecordTime || 0);
      });

      setLeaderboard(entries);
    } catch (err: any) {
      console.error("Failed to fetch leaderboard:", err);
      setError(err.message || "Failed to fetch leaderboard");
      setLeaderboard([]);
    } finally {
      setIsLoading(false);
    }
  }, [contractInfo, ethersReadonlyProvider, questConfig]);

  // Calculate statistics
  const stats = useMemo<LeaderboardStats>(() => {
    const total = leaderboard.length;
    const champions = leaderboard.filter((entry) => entry.questCompleted).length;
    const successRate = total > 0 ? Math.round((champions / total) * 100) : 0;

    return {
      totalParticipants: total,
      champions,
      successRate,
    };
  }, [leaderboard]);

  // Auto refresh
  useEffect(() => {
    fetchLeaderboardFromEvents();
    
    // Set interval refresh (every 30 seconds)
    const interval = setInterval(() => {
      fetchLeaderboardFromEvents();
    }, 30000);

    return () => clearInterval(interval);
  }, [fetchLeaderboardFromEvents]);

  return {
    leaderboard,
    stats,
    isLoading,
    error,
    refresh: fetchLeaderboardFromEvents,
  };
}
