import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { MetaMaskProvider } from "./hooks/metamask/useMetaMaskProvider";
import { MetaMaskEthersSignerProvider } from "./hooks/metamask/useMetaMaskEthersSigner";
import { InMemoryStorageProvider } from "./hooks/useInMemoryStorage";
import { useMetaMaskEthersSigner } from "./hooks/metamask/useMetaMaskEthersSigner";
import { useFhevm } from "./fhevm/useFhevm";
import { useInMemoryStorage } from "./hooks/useInMemoryStorage";
import { usePlantQuest } from "./hooks/usePlantQuest";
import { Navbar } from "./components/Navbar";
import { Dashboard } from "./pages/Dashboard";
import { StartChallenge } from "./pages/StartChallenge";
import { ChallengeRecord } from "./pages/ChallengeRecord";
import { ProgressView } from "./pages/ProgressView";
import { Rewards } from "./pages/Rewards";
import { Community } from "./pages/Community";
import { Sparkles } from "lucide-react";

const initialMockChains: Record<number, string> = {
  31337: "http://localhost:8545",
};

function AppContent() {
  const {
    provider,
    chainId,
    accounts,
    isConnected,
    connect,
    ethersSigner,
    ethersReadonlyProvider,
    sameChain,
    sameSigner,
  } = useMetaMaskEthersSigner();

  const { storage: fhevmDecryptionSignatureStorage } = useInMemoryStorage();

  const {
    instance: fhevmInstance,
    status: fhevmStatus,
  } = useFhevm({
    provider,
    chainId,
    initialMockChains,
    enabled: true,
  });

  const plantQuest = usePlantQuest({
    instance: fhevmInstance,
    fhevmDecryptionSignatureStorage,
    eip1193Provider: provider,
    chainId,
    ethersSigner,
    ethersReadonlyProvider,
    sameChain,
    sameSigner,
  });

  // Check if quest is active
  const isQuestActive = plantQuest.questConfig?.isActive;

  if (!isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-cyber-900 to-black">
        <div className="text-center max-w-md">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-neon-purple to-neon-blue rounded-full mb-6 shadow-2xl animate-glow">
            <Sparkles className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-neon-purple via-neon-blue to-neon-cyan bg-clip-text text-transparent mb-4 neon-text">
            PlantQuest
          </h1>
          <p className="text-xl text-cyber-300 mb-8">
            Plant Challenge Encrypted Record DApp
          </p>
          <button
            onClick={connect}
            className="relative bg-gradient-to-r from-neon-purple to-neon-blue hover:from-neon-blue hover:to-neon-cyan text-white font-bold py-4 px-8 rounded-lg shadow-2xl transition-all transform hover:scale-105 cyber-border overflow-hidden"
          >
            <span className="relative z-10">Connect to MetaMask</span>
            <div className="absolute inset-0 bg-gradient-to-r from-neon-purple/50 to-neon-blue/50 opacity-0 hover:opacity-100 transition-opacity" />
          </button>
          <p className="mt-6 text-sm text-cyber-400">
            Powered by FHEVM - Your data is encrypted on-chain
          </p>
        </div>
      </div>
    );
  }

  if (!plantQuest.isDeployed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-red-900/20 to-black">
        <div className="bg-black/80 border border-red-500/50 rounded-lg shadow-2xl p-8 max-w-md">
          <h2 className="text-2xl font-bold text-red-400 mb-4">
            Contract Not Deployed
          </h2>
          <p className="text-cyber-300 mb-4">
            PlantQuest contract is not deployed on chainId={chainId}
          </p>
          <div className="bg-cyber-900/50 border border-cyber-600/50 rounded-lg p-4">
            <p className="text-sm text-cyber-400">
              Please deploy the contract first:
            </p>
            <code className="text-xs block mt-2 bg-black text-cyber-300 p-2 rounded font-mono">
              cd contracts && npx hardhat run scripts/deploy-simple.ts --network localhost
            </code>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-black via-cyber-900/50 to-black">
        <Navbar
          account={accounts?.[0]}
          chainId={chainId}
          isConnected={isConnected}
          onConnect={connect}
        />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Routes>
            <Route
              path="/"
              element={
                isQuestActive ? (
                  <Dashboard
                    plantQuest={plantQuest}
                    fhevmInstance={fhevmInstance}
                    fhevmStatus={fhevmStatus}
                  />
                ) : (
                  <StartChallenge
                    plantQuest={plantQuest}
                    onQuestStarted={async () => {
                      // Refresh config and wait a bit for state to update
                      await plantQuest.refreshQuestConfig();
                      // Force a small delay to ensure state propagation
                      await new Promise(resolve => setTimeout(resolve, 500));
                    }}
                  />
                )
              }
            />
            <Route
              path="/record"
              element={
                <ChallengeRecord
                  plantQuest={plantQuest}
                  ethersSigner={ethersSigner}
                />
              }
            />
            <Route
              path="/progress"
              element={<ProgressView plantQuest={plantQuest} />}
            />
            <Route
              path="/rewards"
              element={<Rewards plantQuest={plantQuest} />}
            />
            <Route
              path="/community"
              element={
                <Community
                  plantQuest={plantQuest}
                  fhevmInstance={fhevmInstance}
                  fhevmDecryptionSignatureStorage={fhevmDecryptionSignatureStorage}
                />
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

function App() {
  return (
    <MetaMaskProvider>
      <MetaMaskEthersSignerProvider initialMockChains={initialMockChains}>
        <InMemoryStorageProvider>
          <AppContent />
        </InMemoryStorageProvider>
      </MetaMaskEthersSignerProvider>
    </MetaMaskProvider>
  );
}

export default App;
