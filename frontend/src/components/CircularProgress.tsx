interface CircularProgressProps {
  percentage: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
}

export function CircularProgress({
  percentage,
  size = 200,
  strokeWidth = 12,
  label,
}: CircularProgressProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(176, 38, 255, 0.2)"
          strokeWidth={strokeWidth}
        />
        {/* Progress circle with neon glow */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="url(#cyberGradient)"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
          style={{
            filter: "drop-shadow(0 0 8px rgba(176, 38, 255, 0.8))",
          }}
        />
        <defs>
          <linearGradient id="cyberGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#b026ff" />
            <stop offset="50%" stopColor="#00d9ff" />
            <stop offset="100%" stopColor="#ff00ff" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-4xl font-bold bg-gradient-to-r from-neon-purple via-neon-blue to-neon-cyan bg-clip-text text-transparent neon-text">
          {Math.round(percentage)}%
        </span>
        {label && <span className="text-sm text-cyber-400 mt-1">{label}</span>}
      </div>
    </div>
  );
}
