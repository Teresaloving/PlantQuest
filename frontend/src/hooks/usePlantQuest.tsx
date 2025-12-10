import { ethers } from "ethers";
import {
  RefObject,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { FhevmInstance } from "@/fhevm/fhevmTypes";
import { FhevmDecryptionSignature } from "@/fhevm/FhevmDecryptionSignature";
import { GenericStringStorage } from "@/fhevm/GenericStringStorage";
import { PlantQuestAddresses } from "@/abi/PlantQuestAddresses";
import { PlantQuestABI } from "@/abi/PlantQuestABI";

export type ClearValueType = {
  handle: string;
  clear: string | bigint | boolean;
};

type PlantQuestInfoType = {
  abi: typeof PlantQuestABI.abi;
  address?: `0x${string}`;
  chainId?: number;
  chainName?: string;
};

function getPlantQuestByChainId(
  chainId: number | undefined
): PlantQuestInfoType {
  if (!chainId) {
    return { abi: PlantQuestABI.abi };
  }

  const entry =
    PlantQuestAddresses[chainId.toString() as keyof typeof PlantQuestAddresses];

  if (!("address" in entry) || entry.address === ethers.ZeroAddress) {
    return { abi: PlantQuestABI.abi, chainId };
  }

  return {
    address: entry?.address as `0x${string}` | undefined,
    chainId: entry?.chainId ?? chainId,
    chainName: entry?.chainName,
    abi: PlantQuestABI.abi,
  };
}

export const usePlantQuest = (parameters: {
  instance: FhevmInstance | undefined;
  fhevmDecryptionSignatureStorage: GenericStringStorage;
  eip1193Provider: ethers.Eip1193Provider | undefined;
  chainId: number | undefined;
  ethersSigner: ethers.JsonRpcSigner | undefined;
  ethersReadonlyProvider: ethers.ContractRunner | undefined;
  sameChain: RefObject<(chainId: number | undefined) => boolean>;
  sameSigner: RefObject<
    (ethersSigner: ethers.JsonRpcSigner | undefined) => boolean
  >;
}) => {
  const {
    instance,
    fhevmDecryptionSignatureStorage,
    chainId,
    ethersSigner,
    ethersReadonlyProvider,
    sameChain,
    sameSigner,
  } = parameters;

  const [encDaysHandle, setEncDaysHandle] = useState<string | undefined>(undefined);
  const [clearDays, setClearDays] = useState<ClearValueType | undefined>(undefined);
  const clearDaysRef = useRef<ClearValueType | undefined>(undefined);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isDecrypting, setIsDecrypting] = useState<boolean>(false);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");
  const [questConfig, setQuestConfig] = useState<any>(null);
  const [questStatus, setQuestStatus] = useState<any>(null);

  const plantQuestRef = useRef<PlantQuestInfoType | undefined>(undefined);
  const isRefreshingRef = useRef<boolean>(isRefreshing);
  const isDecryptingRef = useRef<boolean>(isDecrypting);
  const isRecordingRef = useRef<boolean>(isRecording);

  const isDecrypted = encDaysHandle && encDaysHandle === clearDays?.handle;

  const plantQuest = useMemo(() => {
    const c = getPlantQuestByChainId(chainId);
    plantQuestRef.current = c;

    if (!c.address) {
      setMessage(`PlantQuest deployment not found for chainId=${chainId}.`);
    }

    return c;
  }, [chainId]);

  const isDeployed = useMemo(() => {
    if (!plantQuest) {
      return undefined;
    }
    return Boolean(plantQuest.address) && plantQuest.address !== ethers.ZeroAddress;
  }, [plantQuest]);

  const canGetProgress = useMemo(() => {
    return plantQuest.address && ethersReadonlyProvider && !isRefreshing;
  }, [plantQuest.address, ethersReadonlyProvider, isRefreshing]);

  // Refresh quest configuration
  const refreshQuestConfig = useCallback(async () => {
    if (!plantQuest.address || !ethersReadonlyProvider) {
      return;
    }

    const contract = new ethers.Contract(
      plantQuest.address,
      plantQuest.abi,
      ethersReadonlyProvider
    );

    try {
      const config: any = await contract.getQuestConfig();
      setQuestConfig({
        duration: Number(config.duration),
        startTime: Number(config.startTime),
        isActive: config.isActive,
        organizer: config.organizer,
      });
      console.log("[usePlantQuest] Quest config refreshed:", {
        duration: Number(config.duration),
        startTime: Number(config.startTime),
        isActive: config.isActive,
        organizer: config.organizer,
      });
    } catch (e: any) {
      console.error("Failed to get quest config:", e);
      setMessage(`Failed to refresh quest config: ${e.message}`);
    }
  }, [plantQuest.address, plantQuest.abi, ethersReadonlyProvider]);

  // Refresh user quest status
  const refreshQuestStatus = useCallback(() => {
    if (!plantQuest.address || !ethersReadonlyProvider || !ethersSigner) {
      return;
    }

    const contract = new ethers.Contract(
      plantQuest.address,
      plantQuest.abi,
      ethersReadonlyProvider
    );

    ethersSigner.getAddress().then((userAddress) => {
      contract
        .getQuestStatus(userAddress)
        .then((status: any) => {
          setQuestStatus({
            questCompleted: status.questCompleted,
            badgeMinted: status.badgeMinted,
            lastRecordTime: Number(status.lastRecordTime),
            firstCheckInBadgeMinted: status.firstCheckInBadgeMinted || false,
          });
        })
        .catch((e: any) => {
          console.error("Failed to get quest status:", e);
        });
    });
  }, [plantQuest.address, ethersReadonlyProvider, ethersSigner]);

  // Refresh encrypted days handle
  const refreshEncDays = useCallback(() => {
    console.log("[usePlantQuest] call refreshEncDays()");
    if (isRefreshingRef.current) {
      return;
    }

    if (
      !plantQuestRef.current ||
      !plantQuestRef.current?.chainId ||
      !plantQuestRef.current?.address ||
      !ethersReadonlyProvider ||
      !ethersSigner
    ) {
      setEncDaysHandle(undefined);
      return;
    }

    isRefreshingRef.current = true;
    setIsRefreshing(true);

    const thisChainId = plantQuestRef.current.chainId;
    const thisPlantQuestAddress = plantQuestRef.current.address;

    const thisPlantQuestContract = new ethers.Contract(
      thisPlantQuestAddress,
      plantQuestRef.current.abi,
      ethersReadonlyProvider
    );

    ethersSigner
      ?.getAddress()
      .then((userAddress) => {
        return thisPlantQuestContract.fetchUserProgress(userAddress);
      })
      .then((value: any) => {
        console.log("[usePlantQuest] fetchUserProgress() encDaysHandle=" + value[0]);
        if (
          sameChain.current?.(thisChainId) &&
          thisPlantQuestAddress === plantQuestRef.current?.address
        ) {
          setEncDaysHandle(value[0]);
        }

        isRefreshingRef.current = false;
        setIsRefreshing(false);
      })
      .catch((e: any) => {
        setMessage("PlantQuest.fetchUserProgress() call failed! error=" + e);

        isRefreshingRef.current = false;
        setIsRefreshing(false);
      });
  }, [ethersReadonlyProvider, ethersSigner, sameChain]);

  useEffect(() => {
    refreshEncDays();
    refreshQuestConfig();
    refreshQuestStatus();
  }, [refreshEncDays, refreshQuestConfig, refreshQuestStatus]);

  const canDecrypt = useMemo(() => {
    return (
      plantQuest.address &&
      instance &&
      ethersSigner &&
      !isRefreshing &&
      !isDecrypting &&
      encDaysHandle &&
      encDaysHandle !== ethers.ZeroHash &&
      encDaysHandle !== clearDays?.handle
    );
  }, [
    plantQuest.address,
    instance,
    ethersSigner,
    isRefreshing,
    isDecrypting,
    encDaysHandle,
    clearDays,
  ]);

  // Decrypt encrypted days
  const decryptEncDays = useCallback(() => {
    if (isRefreshingRef.current || isDecryptingRef.current) {
      return;
    }

    if (!plantQuest.address || !instance || !ethersSigner) {
      return;
    }

    if (encDaysHandle === clearDaysRef.current?.handle) {
      return;
    }

    if (!encDaysHandle) {
      setClearDays(undefined);
      clearDaysRef.current = undefined;
      return;
    }

    if (encDaysHandle === ethers.ZeroHash) {
      setClearDays({ handle: encDaysHandle, clear: BigInt(0) });
      clearDaysRef.current = { handle: encDaysHandle, clear: BigInt(0) };
      return;
    }

    const thisChainId = chainId;
    const thisPlantQuestAddress = plantQuest.address;
    const thisEncDaysHandle = encDaysHandle;
    const thisEthersSigner = ethersSigner;

    isDecryptingRef.current = true;
    setIsDecrypting(true);
    setMessage("Start decrypt");

    const run = async () => {
      const isStale = () =>
        thisPlantQuestAddress !== plantQuestRef.current?.address ||
        !sameChain.current?.(thisChainId) ||
        !sameSigner.current?.(thisEthersSigner);

      try {
        const sig: FhevmDecryptionSignature | null =
          await FhevmDecryptionSignature.loadOrSign(
            instance,
            [plantQuest.address as `0x${string}`],
            ethersSigner,
            fhevmDecryptionSignatureStorage
          );

        if (!sig) {
          setMessage("Unable to build FHEVM decryption signature");
          return;
        }

        if (isStale()) {
          setMessage("Ignore FHEVM decryption");
          return;
        }

        setMessage("Call FHEVM userDecrypt...");

        const res = await instance.userDecrypt(
          [{ handle: thisEncDaysHandle, contractAddress: thisPlantQuestAddress }],
          sig.privateKey,
          sig.publicKey,
          sig.signature,
          sig.contractAddresses,
          sig.userAddress,
          sig.startTimestamp,
          sig.durationDays
        );

        setMessage("FHEVM userDecrypt completed!");

        if (isStale()) {
          setMessage("Ignore FHEVM decryption");
          return;
        }

        const clearValue = (res as unknown as Record<string, number>)[thisEncDaysHandle] ?? 0;
        setClearDays({ handle: thisEncDaysHandle, clear: String(clearValue) });
        clearDaysRef.current = {
          handle: thisEncDaysHandle,
          clear: String(clearValue),
        };

        setMessage("Encrypted days clear value is " + (clearDaysRef.current?.clear ?? "0"));
      } finally {
        isDecryptingRef.current = false;
        setIsDecrypting(false);
      }
    };

    run();
  }, [
    fhevmDecryptionSignatureStorage,
    ethersSigner,
    plantQuest.address,
    instance,
    encDaysHandle,
    chainId,
    sameChain,
    sameSigner,
  ]);

  const canRecord = useMemo(() => {
    return (
      plantQuest.address &&
      instance &&
      ethersSigner &&
      !isRefreshing &&
      !isRecording &&
      questConfig?.isActive
    );
  }, [
    plantQuest.address,
    instance,
    ethersSigner,
    isRefreshing,
    isRecording,
    questConfig,
  ]);

  // Log daily progress
  const logDailyProgress = useCallback(
    (completed: boolean) => {
      if (isRefreshingRef.current || isRecordingRef.current) {
        return;
      }

      if (!plantQuest.address || !instance || !ethersSigner) {
        return;
      }

      const thisChainId = chainId;
      const thisPlantQuestAddress = plantQuest.address;
      const thisEthersSigner = ethersSigner;
      const thisPlantQuestContract = new ethers.Contract(
        thisPlantQuestAddress,
        plantQuest.abi,
        thisEthersSigner
      );

      isRecordingRef.current = true;
      setIsRecording(true);
      setMessage(`Recording progress (completed: ${completed})...`);

      const run = async () => {
        const isStale = () =>
          thisPlantQuestAddress !== plantQuestRef.current?.address ||
          !sameChain.current?.(thisChainId) ||
          !sameSigner.current?.(thisEthersSigner);

        try {
          setMessage(`Call logDailyProgress(${completed})...`);

          const tx: ethers.TransactionResponse =
            await thisPlantQuestContract.logDailyProgress(completed);

          setMessage(`Wait for tx:${tx.hash}...`);

          const receipt = await tx.wait();

          setMessage(`Record progress completed status=${receipt?.status}`);

          if (isStale()) {
            setMessage(`Ignore record progress`);
            return;
          }

          refreshEncDays();
          refreshQuestStatus();
        } catch (error: any) {
          setMessage(`Record progress failed: ${error.message}`);
        } finally {
          isRecordingRef.current = false;
          setIsRecording(false);
        }
      };

      run();
    },
    [
      ethersSigner,
      plantQuest.address,
      plantQuest.abi,
      instance,
      chainId,
      refreshEncDays,
      refreshQuestStatus,
      sameChain,
      sameSigner,
    ]
  );

  // Initiate quest
  const initiateQuest = useCallback(
    (duration: number) => {
      if (isRefreshingRef.current || isRecordingRef.current) {
        return;
      }

      if (!plantQuest.address || !ethersSigner) {
        return;
      }

      const thisPlantQuestContract = new ethers.Contract(
        plantQuest.address,
        plantQuest.abi,
        ethersSigner
      );

      setIsRecording(true);
      setMessage(`Starting quest (duration: ${duration} days)...`);

      const run = async () => {
        try {
          const tx: ethers.TransactionResponse =
            await thisPlantQuestContract.initiateQuest(duration);

          setMessage(`Wait for tx:${tx.hash}...`);
          const receipt = await tx.wait();
          setMessage(`Quest started! status=${receipt?.status}`);

          refreshQuestConfig();
        } catch (error: any) {
          setMessage(`Start quest failed: ${error.message}`);
        } finally {
          setIsRecording(false);
        }
      };

      run();
    },
    [ethersSigner, plantQuest.address, plantQuest.abi, refreshQuestConfig]
  );

  // Claim first check-in badge
  const claimFirstCheckInBadge = useCallback(async () => {
    if (!plantQuest.address || !ethersSigner) {
      setMessage("Please connect your wallet first");
      console.error("[usePlantQuest] Missing address or signer");
      return;
    }

    console.log("[usePlantQuest] claimFirstCheckInBadge called", {
      address: plantQuest.address,
      hasSigner: !!ethersSigner,
    });

    const thisPlantQuestContract = new ethers.Contract(
      plantQuest.address,
      plantQuest.abi,
      ethersSigner
    );

    // Check if contract has this function
    if (!thisPlantQuestContract.claimFirstCheckInBadge) {
      const errorMsg = "Contract does not have claimFirstCheckInBadge function. Please redeploy the contract.";
      setMessage(errorMsg);
      console.error("[usePlantQuest]", errorMsg);
      throw new Error(errorMsg);
    }

    setIsRecording(true);
    setMessage("Claiming first check-in badge...");

    const run = async () => {
      try {
        console.log("[usePlantQuest] Calling claimFirstCheckInBadge()...");
        const tx: ethers.TransactionResponse =
          await thisPlantQuestContract.claimFirstCheckInBadge();

        console.log("[usePlantQuest] Transaction sent:", tx.hash);
        setMessage(`Transaction sent! Hash: ${tx.hash}. Waiting for confirmation...`);
        
        const receipt = await tx.wait();
        console.log("[usePlantQuest] Transaction confirmed:", receipt);
        setMessage(`First check-in badge claimed successfully! Status: ${receipt?.status === 1 ? "Success" : "Failed"}`);

        // Refresh status
        await refreshQuestStatus();
      } catch (error: any) {
        const errorMsg = error.message || "Unknown error";
        console.error("[usePlantQuest] Claim failed:", error);
        setMessage(`Claim failed: ${errorMsg}`);
        throw error; // Re-throw error for UI handling
      } finally {
        setIsRecording(false);
      }
    };

    await run();
  }, [ethersSigner, plantQuest.address, plantQuest.abi, refreshQuestStatus]);

  return {
    contractAddress: plantQuest.address,
    canDecrypt,
    canGetProgress: canGetProgress,
    canRecord,
    logDailyProgress,
    initiateQuest,
    decryptEncDays,
    refreshEncDays,
    refreshQuestConfig,
    refreshQuestStatus,
    claimFirstCheckInBadge,
    isDecrypted,
    message,
    clearDays: clearDays?.clear,
    encDaysHandle: encDaysHandle,
    isDecrypting,
    isRefreshing,
    isRecording,
    isDeployed,
    questConfig,
    questStatus,
  };
};
