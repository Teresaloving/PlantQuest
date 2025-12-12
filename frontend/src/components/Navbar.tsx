import { Link, useLocation } from "react-router-dom";
import { Sparkles, Calendar, TrendingUp, Award, Users } from "lucide-react";

interface NavbarProps {
  account?: string;
  chainId?: number;
  isConnected: boolean;
  onConnect: () => void;
}

export function Navbar({ account, chainId, isConnected, onConnect }: NavbarProps) {
  const location = useLocation();

  const navItems = [
    { path: "/", icon: Sparkles, label: "Command Center" },
    { path: "/record", icon: Calendar, label: "Daily Log" },
    { path: "/progress", icon: TrendingUp, label: "Stats" },
    { path: "/rewards", icon: Award, label: "Rewards" },
    { path: "/community", icon: Users, label: "Network" },
  ];

  return (
    <nav className="bg-black/80 backdrop-blur-lg border-b border-cyber-600/30 sticky top-0 z-50 scan-line">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="relative">
                <Sparkles className="w-8 h-8 text-neon-purple group-hover:text-neon-cyan transition-colors" />
                <div className="absolute inset-0 bg-neon-purple blur-md opacity-50 group-hover:opacity-75 transition-opacity" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-neon-purple via-neon-blue to-neon-cyan bg-clip-text text-transparent neon-text">
                PlantQuest
              </span>
            </Link>

            <div className="hidden md:flex space-x-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all relative ${
                      isActive
                        ? "bg-cyber-600/30 text-neon-cyan glow-effect"
                        : "text-gray-400 hover:bg-cyber-900/50 hover:text-neon-purple"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-sm font-medium">{item.label}</span>
                    {isActive && (
                      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-neon-purple to-neon-cyan" />
                    )}
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {isConnected ? (
              <div className="flex items-center space-x-3">
                <div className="hidden sm:block text-right">
                  <div className="text-xs text-cyber-400">Chain: {chainId}</div>
                  <div className="text-sm font-mono text-neon-cyan">
                    {account?.slice(0, 6)}...{account?.slice(-4)}
                  </div>
                </div>
                <div className="relative">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse-neon" />
                  <div className="absolute inset-0 bg-green-500 blur-md opacity-50" />
                </div>
              </div>
            ) : (
              <button
                onClick={onConnect}
                className="relative px-6 py-2 bg-gradient-to-r from-neon-purple to-neon-blue text-white font-semibold rounded-lg overflow-hidden group cyber-border"
              >
                <span className="relative z-10">Connect Wallet</span>
                <div className="absolute inset-0 bg-gradient-to-r from-neon-purple/50 to-neon-blue/50 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden border-t border-cyber-600/30">
        <div className="flex justify-around py-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center space-y-1 px-3 py-2 rounded-lg transition-all ${
                  isActive
                    ? "text-neon-cyan"
                    : "text-gray-400 hover:text-neon-purple"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-xs">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
