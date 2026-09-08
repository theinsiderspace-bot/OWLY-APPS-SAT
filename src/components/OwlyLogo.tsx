import React from "react";

interface OwlyLogoProps {
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
  showText?: boolean;
  textClassName?: string;
  subtextClassName?: string;
  variant?: "indigo" | "dark" | "amber" | "white" | "scifi";
  animated?: boolean;
}

export const OwlyLogoIcon: React.FC<{
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
  variant?: "indigo" | "dark" | "amber" | "white" | "scifi";
  animated?: boolean;
}> = ({ size = "md", className = "", variant = "scifi", animated = true }) => {
  const sizeMap = {
    xs: "w-6 h-6",
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-12 h-12",
    xl: "w-16 h-16",
  };

  const currentSize = sizeMap[size];

  return (
    <div
      className={`relative flex items-center justify-center shrink-0 select-none ${currentSize} ${className}`}
      title="OWLY QUANTUM SAT AI Core"
    >
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`w-full h-full drop-shadow-[0_0_12px_rgba(6,182,212,0.6)] transition-all duration-500 ${
          animated ? "hover:scale-105 hover:drop-shadow-[0_0_20px_rgba(6,182,212,0.9)]" : ""
        }`}
      >
        <defs>
          {/* Sci-Fi Obsidian Shield Gradient */}
          <linearGradient id="scifiObsidianGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#080e1e" />
            <stop offset="50%" stopColor="#0c1830" />
            <stop offset="100%" stopColor="#050a14" />
          </linearGradient>

          {/* Cyan Plasma Core Gradient */}
          <linearGradient id="cyanPlasmaGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00f0ff" />
            <stop offset="50%" stopColor="#0ea5e9" />
            <stop offset="100%" stopColor="#0284c7" />
          </linearGradient>

          {/* Golden Warp Energy Gradient */}
          <linearGradient id="warpGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fbbf24" />
            <stop offset="100%" stopColor="#f59e0b" />
          </linearGradient>

          {/* Neural Purple Gradient */}
          <linearGradient id="neuralPurpleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#c084fc" />
            <stop offset="100%" stopColor="#7c3aed" />
          </linearGradient>

          {/* Hologram Filter */}
          <filter id="scifiGlowFilter" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="2.5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Outer Tech Octagonal / Chamfered Body */}
        <polygon
          points="50,2 88,14 98,50 88,86 50,98 12,86 2,50 12,14"
          fill="url(#scifiObsidianGrad)"
          stroke="#00f0ff"
          strokeWidth="1.8"
          strokeOpacity="0.85"
        />

        {/* Inner Cyber Circuit Grid Accent */}
        <polygon
          points="50,6 84,17 93,50 84,83 50,94 16,83 7,50 16,17"
          fill="none"
          stroke="#38bdf8"
          strokeWidth="0.8"
          strokeDasharray="4 2"
          strokeOpacity="0.5"
        />

        {/* Orbital Quantum Ring 1 */}
        <ellipse
          cx="50"
          cy="50"
          rx="44"
          ry="18"
          fill="none"
          stroke="#00f0ff"
          strokeWidth="1.2"
          strokeDasharray="8 4 2 4"
          strokeOpacity="0.7"
          transform="rotate(-25 50 50)"
        />

        {/* Orbital Quantum Ring 2 */}
        <ellipse
          cx="50"
          cy="50"
          rx="44"
          ry="18"
          fill="none"
          stroke="#c084fc"
          strokeWidth="1"
          strokeDasharray="6 6"
          strokeOpacity="0.5"
          transform="rotate(35 50 50)"
        />

        {/* Owl Cyber Ears / Sensory Antennas */}
        <polygon
          points="18,22 28,38 12,34"
          fill="#0c1830"
          stroke="#00f0ff"
          strokeWidth="1.2"
        />
        <polygon
          points="82,22 72,38 88,34"
          fill="#0c1830"
          stroke="#00f0ff"
          strokeWidth="1.2"
        />

        {/* Sci-Fi Neural Visor Crest / Diamond */}
        <polygon
          points="50,12 76,22 50,32 24,22"
          fill="#050a14"
          stroke="#fbbf24"
          strokeWidth="1.5"
          filter="url(#scifiGlowFilter)"
        />
        <circle cx="50" cy="22" r="2.5" fill="#fbbf24" filter="url(#scifiGlowFilter)" />

        {/* Owl Cybernetic Eyes / Optical Scanners */}
        {/* Left Eye HUD */}
        <circle cx="34" cy="52" r="16" fill="#050a14" stroke="#00f0ff" strokeWidth="1.8" />
        <circle cx="34" cy="52" r="13" stroke="#38bdf8" strokeWidth="0.8" strokeDasharray="3 2" fill="none" />
        <circle cx="34" cy="52" r="8" fill="url(#cyanPlasmaGrad)" filter="url(#scifiGlowFilter)" />
        <circle cx="35" cy="52" r="4.5" fill="#030712" />
        <circle cx="36.5" cy="50.5" r="2" fill="#ffffff" />

        {/* Right Eye HUD */}
        <circle cx="66" cy="52" r="16" fill="#050a14" stroke="#00f0ff" strokeWidth="1.8" />
        <circle cx="66" cy="52" r="13" stroke="#38bdf8" strokeWidth="0.8" strokeDasharray="3 2" fill="none" />
        <circle cx="66" cy="52" r="8" fill="url(#cyanPlasmaGrad)" filter="url(#scifiGlowFilter)" />
        <circle cx="65" cy="52" r="4.5" fill="#030712" />
        <circle cx="67.5" cy="50.5" r="2" fill="#ffffff" />

        {/* Central Quantum Neural Core / Beak */}
        <polygon
          points="50,54 44,66 56,66"
          fill="url(#warpGoldGrad)"
          stroke="#f59e0b"
          strokeWidth="1"
          filter="url(#scifiGlowFilter)"
        />

        {/* Cyber Arc Plasma Waves (Chest) */}
        <path
          d="M32 76 Q50 88 68 76"
          fill="none"
          stroke="#00f0ff"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeOpacity="0.85"
        />
        <path
          d="M38 82 Q50 91 62 82"
          fill="none"
          stroke="#c084fc"
          strokeWidth="2"
          strokeLinecap="round"
          strokeOpacity="0.75"
        />

        {/* Micro Telemetry HUD Nodes */}
        <circle cx="50" cy="74" r="1.5" fill="#00f0ff" />
        <circle cx="20" cy="50" r="1.5" fill="#38bdf8" />
        <circle cx="80" cy="50" r="1.5" fill="#38bdf8" />
      </svg>
    </div>
  );
};

export const OwlyLogo: React.FC<OwlyLogoProps> = ({
  size = "md",
  className = "",
  showText = true,
  textClassName = "",
  subtextClassName = "",
  variant = "scifi",
  animated = true,
}) => {
  return (
    <div className={`inline-flex items-center gap-3 select-none ${className}`}>
      <OwlyLogoIcon size={size} variant={variant} animated={animated} />
      {showText && (
        <div className="flex flex-col">
          <div className="flex items-center gap-2 leading-none">
            <span
              className={`font-orbitron font-black tracking-wider text-white ${
                size === "xs"
                  ? "text-xs"
                  : size === "sm"
                  ? "text-sm"
                  : size === "md"
                  ? "text-base"
                  : size === "lg"
                  ? "text-lg"
                  : "text-xl"
              } ${textClassName}`}
            >
              OWLY <span className="text-cyan-400 font-black drop-shadow-[0_0_8px_rgba(6,182,212,0.8)]">SAT</span>
            </span>
            <span className="inline-flex items-center px-2 py-0.5 rounded-sm text-[9px] font-mono font-black uppercase tracking-widest bg-cyan-950/80 text-cyan-300 border border-cyan-500/50 shadow-[0_0_8px_rgba(6,182,212,0.4)]">
              v4.2 PRO
            </span>
          </div>
          <p
            className={`text-[9px] font-mono font-bold text-cyan-400/80 uppercase tracking-widest mt-1 flex items-center gap-1.5 ${subtextClassName}`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping inline-block" />
            <span>QUANTUM ADAPTIVE AI ENGINE</span>
          </p>
        </div>
      )}
    </div>
  );
};
