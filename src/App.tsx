import React, { useState, useEffect, useMemo, useCallback, memo } from 'react';
import { 
  Users, 
  Skull, 
  Search, 
  Sun, 
  Moon, 
  ExternalLink, 
  AlertTriangle,
  RefreshCw,
  Globe, 
  ChevronLeft,
  ChevronRight,
  MessageSquareText,
  Copy,
  Check,
  ArrowUpDown,
  ChevronUp,
  ChevronDown,
  History,
  Link,
  X,
  Download,
  ChevronsLeft,
  ChevronsRight
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { cn } from './utils/cn';
import { motion, AnimatePresence } from 'framer-motion';

// Types
interface Player {
  steamid: string;
  steam64: string;
  legacySteamId: string;
  attributes: string[];
  proof?: string[];
  last_seen?: {
    player_name?: string;
    time?: number;
  };
}

interface PlayerList {
  players: Player[];
}

const RAW_URL_MASTER = 'https://raw.githubusercontent.com/Garou3299/tf2bd-database/master/playerlist.garou3299.json';
const RAW_URL_MAIN = 'https://raw.githubusercontent.com/Garou3299/tf2bd-database/main/playerlist.garou3299.json';

const TF2Shield = memo(({ className, size = 20, logoColor }: { className?: string; size?: number; logoColor?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" fill="currentColor" />
    <g transform="translate(12, 11)">
      <path d="M-0.8,-6.5 A6.5,6.5 0 0,0 -6.5,-0.8 L-3.5,-0.8 A3.5,3.5 0 0,1 -0.8,-3.5 Z" fill={logoColor || "white"} />
      <path d="M0.8,-6.5 A6.5,6.5 0 0,1 6.5,-0.8 L3.5,-0.8 A3.5,3.5 0 0,0 0.8,-3.5 Z" fill={logoColor || "white"} />
      <path d="M6.5,0.8 A6.5,6.5 0 0,1 0.8,6.5 L0.8,3.5 A3.5,3.5 0 0,0 3.5,0.8 Z" fill={logoColor || "white"} />
      <path d="M-0.8,6.5 A6.5,6.5 0 0,1 -6.5,0.8 L-3.5,0.8 A3.5,3.5 0 0,0 -0.8,3.5 Z" fill={logoColor || "white"} />
    </g>
  </svg>
));

const AnimatedBarChart = memo(({ className, size = 22 }: { className?: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    {/* Dark, Bold Axis Line (No Gaps) */}
    <path 
      d="M1.5 2v20.5h20.5" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2.8" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
    />
    
    {/* Smooth Increasing/Decreasing Bars - Perfectly Snapped to Axis */}
    {/* Bar 1 */}
    <motion.rect 
      x="6.5" width="4" rx="1"
      animate={{ height: [6, 15, 6], y: [16.5, 7.5, 16.5] }} 
      transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }} 
    />
    {/* Bar 2 */}
    <motion.rect 
      x="12" width="4" rx="1"
      animate={{ height: [15, 8, 15], y: [7.5, 14.5, 7.5] }} 
      transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut", delay: 0.3 }} 
    />
    {/* Bar 3 */}
    <motion.rect 
      x="17.5" width="4" rx="1"
      animate={{ height: [10, 16, 10], y: [12.5, 6.5, 12.5] }} 
      transition={{ repeat: Infinity, duration: 3.5, ease: "easeInOut", delay: 0.6 }} 
    />
  </svg>
));

const StatCard = memo(({ title, value, icon: Icon, theme, active, onClick, isDark, ...motionProps }: { title: string; value: number | string; icon: any; theme: 'blue' | 'red' | 'yellow' | 'purple'; active?: boolean; onClick?: () => void; isDark: boolean; [key: string]: any }) => {
  const themes = {
    blue: {
      bg: isDark ? "bg-blue-500/10" : "bg-blue-200/50",
      border: isDark ? "border-blue-500/20" : "border-blue-300",
      text: isDark ? "text-blue-400" : "text-blue-800",
      icon: isDark ? "bg-blue-500/20 text-blue-400" : "bg-blue-200 text-blue-600",
      active: "ring-blue-600 shadow-[0_0_30px_rgba(59,130,246,0.3)]",
      gloss: "from-blue-500/5"
    },
    red: {
      bg: isDark ? "bg-red-500/10" : "bg-red-200/50",
      border: isDark ? "border-red-500/20" : "border-red-300",
      text: isDark ? "text-red-400" : "text-red-800",
      icon: isDark ? "bg-red-500/20 text-red-400" : "bg-red-200 text-red-600",
      active: "ring-red-600 shadow-[0_0_30px_rgba(239,68,68,0.3)]",
      gloss: "from-red-500/5"
    },
    yellow: {
      bg: isDark ? "bg-yellow-500/10" : "bg-yellow-200/50",
      border: isDark ? "border-yellow-500/20" : "border-yellow-300",
      text: isDark ? "text-yellow-600 dark:text-yellow-400" : "text-yellow-900",
      icon: isDark ? "bg-yellow-500/20 text-yellow-400" : "bg-yellow-200 text-yellow-900",
      active: "ring-yellow-600 shadow-[0_0_30px_rgba(234,179,8,0.3)]",
      gloss: "from-yellow-500/5"
    },
    purple: {
      bg: isDark ? "bg-purple-500/10" : "bg-purple-200/50",
      border: isDark ? "border-purple-500/20" : "border-purple-300",
      text: isDark ? "text-purple-400" : "text-purple-800",
      icon: isDark ? "bg-purple-500/20 text-purple-400" : "bg-purple-200 text-purple-700",
      active: "ring-purple-600 shadow-[0_0_30px_rgba(168,85,247,0.3)]",
      gloss: "from-purple-500/5"
    }
  };

  const currentTheme = themes[theme];

    return (
      <motion.button 
        whileHover={{ y: -2 }}
        whileTap={{ scale: 0.99 }}
        onClick={onClick}
        {...motionProps}
        className={cn(
          "p-5 rounded-2xl border transition-all duration-300 text-left w-full relative group backdrop-blur-sm",
          currentTheme.bg,
          currentTheme.border,
          active ? `ring-2 ${currentTheme.active}` : "shadow-sm hover:shadow-lg"
        )}
      >
      <div className={cn("absolute inset-0 bg-gradient-to-br to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl", currentTheme.gloss)} />
      <div className="flex items-center justify-between relative z-10">
        <div>
          <p className={cn("text-xs font-bold uppercase tracking-widest opacity-80 transition-colors", currentTheme.text)}>{title}</p>
          <p className={cn("text-3xl font-black mt-1 transition-colors tracking-tight", isDark ? "text-white" : "text-slate-950")}>{value}</p>
        </div>
        <div className={cn("p-3 rounded-xl transition-all duration-500 group-hover:rotate-12 group-hover:scale-125 shadow-sm", currentTheme.icon)}>
          <Icon size={24} />
        </div>
      </div>
      {active && (
        <div className="absolute top-3 right-3 w-2 h-2">
          <div className={cn("absolute inset-0 rounded-full animate-pulse shadow-[0_0_15px_currentColor] z-10", 
            theme === 'yellow' ? 'text-yellow-500 bg-yellow-500' : 
            (theme === 'blue' ? 'text-blue-500 bg-blue-500' : 
            (theme === 'purple' ? 'text-purple-500 bg-purple-500' : 'text-red-500 bg-red-500'))
          )} />
          <motion.div
            initial={{ scale: 1, opacity: 0.5 }}
            animate={{ scale: 2.5, opacity: 0 }}
            transition={{ repeat: Infinity, duration: 1.5, ease: "easeOut" }}
            className={cn("absolute inset-0 rounded-full border border-current", 
              theme === 'yellow' ? 'text-yellow-500' : 
              (theme === 'blue' ? 'text-blue-500' : 
              (theme === 'purple' ? 'text-purple-500' : 'text-red-500'))
            )}
          />
        </div>
      )}
    </motion.button>
  );
});

const StatsVisualization = memo(({ stats, filterAttribute, isDark, onPointClick }: { stats: { total: number; cheaters: number; suspicious: number; racist: number }; filterAttribute: string | null; isDark: boolean; onPointClick: (id: string) => void }) => {
  const dataPoints = useMemo(() => [
    { id: 'cheater', label: 'Cheaters', value: stats.cheaters, color: 'bg-red-500', hoverColor: 'hover:bg-red-400', activeRing: 'ring-red-600', activeBg: isDark ? 'bg-red-500/10' : 'bg-red-200/50' },
    { id: 'suspicious', label: 'Suspicious', value: stats.suspicious, color: 'bg-yellow-500', hoverColor: 'hover:bg-yellow-400', activeRing: 'ring-yellow-600', activeBg: isDark ? 'bg-yellow-500/10' : 'bg-yellow-200/50' },
    { id: 'racist', label: 'Racists', value: stats.racist, color: 'bg-purple-500', hoverColor: 'hover:bg-purple-400', activeRing: 'ring-purple-600', activeBg: isDark ? 'bg-purple-500/10' : 'bg-purple-200/50' },
  ], [stats, isDark]);

  // Calculate Pie Chart slices using trigonometry
  const slices = useMemo(() => {
    let accumulatedPercentage = 0;
    return dataPoints.map((dp) => {
      const percentage = stats.total > 0 ? dp.value / stats.total : 0;
      const startPercentage = accumulatedPercentage;
      accumulatedPercentage += percentage;
      
      const getCoordinatesForPercent = (percent: number) => {
        const x = Math.cos(2 * Math.PI * percent - Math.PI / 2) * 80 + 100;
        const y = Math.sin(2 * Math.PI * percent - Math.PI / 2) * 80 + 100;
        return [x, y];
      };

      const [startX, startY] = getCoordinatesForPercent(startPercentage);
      const [endX, endY] = getCoordinatesForPercent(accumulatedPercentage);
      
      const largeArcFlag = percentage > 0.5 ? 1 : 0;
      
      const pathData = percentage === 1 
        ? `M 100 20 A 80 80 0 1 1 99.99 20 Z` 
        : `M 100 100 L ${startX} ${startY} A 80 80 0 ${largeArcFlag} 1 ${endX} ${endY} Z`;

      // Leader Line Math (Horizontal Elbow pointers linking slices to external labels)
      const midAngle = 2 * Math.PI * (startPercentage + percentage / 2) - Math.PI / 2;
      const lineStartX = 100 + Math.cos(midAngle) * 72;
      const lineStartY = 100 + Math.sin(midAngle) * 72;
      const lineBendX = 100 + Math.cos(midAngle) * 92;
      const lineBendY = 100 + Math.sin(midAngle) * 92;
      const lineEndX = lineBendX + (Math.cos(midAngle) >= 0 ? 12 : -12);
      const lineEndY = lineBendY;

      // Curving elbow shape path
      const linePath = `M ${lineStartX} ${lineStartY} Q ${lineBendX} ${lineBendY} ${lineEndX} ${lineEndY}`;
      
      // Text Alignment calculations based on coordinates
      const textX = lineEndX + (Math.cos(midAngle) >= 0 ? 6 : -6);
      const textY = lineEndY + 3;
      const textAnchor = (Math.cos(midAngle) >= 0 ? "start" : "end") as "start" | "end";

      return {
        ...dp,
        pathData,
        percentage,
        startPercentage,
        midAngle,
        linePath,
        textX,
        textY,
        textAnchor
      };
    });
  }, [dataPoints, stats]);

  return (
    <div className={cn(
      "p-4 sm:p-5 rounded-3xl border-2 shadow-2xl mb-4 backdrop-blur-2xl relative overflow-hidden transition-all duration-700",
      isDark ? "bg-slate-900/40 border-slate-800/50 shadow-black/20" : "bg-slate-200/60 border-slate-400/50 shadow-slate-400/20"
    )}>
      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent pointer-events-none" />
      <div className="relative z-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2.5">
            <div className={cn(
              "p-1.5 rounded-xl shrink-0 transition-colors duration-500",
              !filterAttribute && "bg-blue-500/10",
              filterAttribute === 'cheater' && "bg-red-500/10",
              filterAttribute === 'suspicious' && "bg-yellow-500/10",
              filterAttribute === 'racist' && "bg-purple-500/10"
            )}>
              <AnimatedBarChart className={cn(
                "transition-colors duration-500",
                !filterAttribute && "text-blue-500",
                filterAttribute === 'cheater' && "text-red-500",
                filterAttribute === 'suspicious' && (isDark ? "text-yellow-400" : "text-yellow-600"),
                filterAttribute === 'racist' && "text-purple-500"
              )} size={18} />
            </div>
            <h2 className="font-black text-lg tracking-tight uppercase tracking-wider">Database Composition</h2>
          </div>
          <div className="flex justify-start sm:justify-end">
            <p className={cn("text-[10px] font-bold px-2.5 py-1 rounded-lg border-2 uppercase tracking-widest backdrop-blur-xl transition-all duration-500 shadow-sm whitespace-nowrap", 
              isDark ? "bg-slate-950 border-slate-800 text-slate-300" : "bg-slate-100 border-slate-400 text-slate-700")}>
              Total Entries: {stats.total.toLocaleString()}
            </p>
          </div>
        </div>
        
        <div className="flex flex-col md:flex-row items-center justify-around gap-6 py-2">
          {/* Premium 3D Exploded Pie Chart with floating labels */}
          <div className="relative w-full max-w-[360px] sm:max-w-[380px] md:max-w-[380px] lg:max-w-[420px] aspect-[370/220] flex-shrink-0 my-1">
            <svg viewBox="-85 -10 370 220" className="w-full h-full overflow-visible">
              <defs>
                {/* Clockwise filling sweep mask */}
                <mask id="clockwise-reveal-mask">
                  <motion.circle
                    cx="100"
                    cy="100"
                    r="100"
                    fill="none"
                    stroke="white"
                    strokeWidth="220"
                    strokeDasharray="629"
                    initial={{ strokeDashoffset: 629 }}
                    animate={{ strokeDashoffset: 0 }}
                    transition={{ duration: 1.8, ease: "easeInOut", delay: 0.35 }}
                    transform="rotate(-90 100 100)"
                  />
                </mask>
                {/* Soft Drop Shadows for 3D floating effect */}
                <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
                  <feDropShadow dx="0" dy="8" stdDeviation="8" floodOpacity={isDark ? "0.5" : "0.15"} floodColor="#000" />
                </filter>
                <filter id="badge-shadow" x="-30%" y="-30%" width="160%" height="160%">
                  <feDropShadow dx="0" dy="4" stdDeviation="3" floodOpacity={isDark ? "0.3" : "0.1"} floodColor="#000" />
                </filter>
                {/* Premium Multi-Stop Linear Gradients */}
                <linearGradient id="grad-cheater" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#ff6b6b" />
                  <stop offset="50%" stopColor="#dc2626" />
                  <stop offset="100%" stopColor="#991b1b" />
                </linearGradient>
                <linearGradient id="grad-suspicious" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#fbbf24" />
                  <stop offset="50%" stopColor="#d97706" />
                  <stop offset="100%" stopColor="#92400e" />
                </linearGradient>
                <linearGradient id="grad-racist" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#d8b4fe" />
                  <stop offset="50%" stopColor="#9333ea" />
                  <stop offset="100%" stopColor="#6b21a8" />
                </linearGradient>
                {/* Extrusion Gradients for 3D depth effect */}
                <linearGradient id="depth-cheater" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#991b1b" />
                  <stop offset="100%" stopColor="#450a0a" />
                </linearGradient>
                <linearGradient id="depth-suspicious" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#92400e" />
                  <stop offset="100%" stopColor="#451a03" />
                </linearGradient>
                <linearGradient id="depth-racist" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#6b21a8" />
                  <stop offset="100%" stopColor="#3b0764" />
                </linearGradient>
              </defs>

              {/* Dynamic reveal group wrapper */}
              <g mask="url(#clockwise-reveal-mask)">

              {/* Leader Connector pointer Elbow Lines */}
              {slices.map((slice) => {
                if (slice.percentage === 0) return null;
                const isSelected = filterAttribute === slice.id;
                const isAnySelected = filterAttribute !== null;

                return (
                  <g key={`label-${slice.id}`} className="pointer-events-none">
                    {/* Elbow connector pointer line */}
                    <motion.path
                      d={slice.linePath}
                      fill="none"
                      animate={{
                        stroke: isSelected 
                          ? (slice.id === 'cheater' ? '#ff6b6b' : slice.id === 'suspicious' ? '#fbbf24' : '#d8b4fe')
                          : (isDark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.15)"),
                        strokeWidth: isSelected ? 2 : 1.2,
                        opacity: isAnySelected && !isSelected ? 0.4 : 1
                      }}
                      transition={{ type: "spring", stiffness: 300, damping: 25 }}
                    />
                    {/* Elbow Joint Circle Node on Slice Edge */}
                    <motion.circle
                      cx={100 + Math.cos(slice.midAngle) * 68}
                      cy={100 + Math.sin(slice.midAngle) * 68}
                      r="3"
                      animate={{
                        fill: isSelected 
                          ? (slice.id === 'cheater' ? '#ff6b6b' : slice.id === 'suspicious' ? '#fbbf24' : '#d8b4fe')
                          : (isDark ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.3)"),
                        opacity: isAnySelected && !isSelected ? 0.4 : 1
                      }}
                      transition={{ type: "spring", stiffness: 300, damping: 25 }}
                    />
                    {/* Percentage and label callout overlay matching template */}
                    <motion.g
                      animate={{
                        opacity: isAnySelected && !isSelected ? 0.4 : 1,
                        scale: isSelected ? 1.08 : 1
                      }}
                      transition={{ type: "spring", stiffness: 300, damping: 25 }}
                    >
                      {/* Bold Percentage Callout */}
                      <text
                        x={slice.textX}
                        y={slice.textY - 6}
                        textAnchor={slice.textAnchor}
                        fill={isDark ? "#f8fafc" : "#0f172a"}
                        className="font-black text-sm font-mono"
                      >
                        {`${(slice.percentage * 100).toFixed(1)}%`}
                      </text>
                      {/* Category Label Callout */}
                      <text
                        x={slice.textX}
                        y={slice.textY + 7}
                        textAnchor={slice.textAnchor}
                        fill={isDark ? "#94a3b8" : "#64748b"}
                        className="font-black text-[8px] uppercase tracking-widest"
                      >
                        {slice.label}
                      </text>
                    </motion.g>
                  </g>
                );
              })}

              {/* 3D Slices - Lower extrusions for 3D thickness */}
              {slices.map((slice) => {
                if (slice.percentage === 0) return null;
                const isSelected = filterAttribute === slice.id;
                const isAnySelected = filterAttribute !== null;
                
                // Explode offset
                const dx = Math.cos(slice.midAngle) * (isSelected ? 10 : 0);
                const dy = Math.sin(slice.midAngle) * (isSelected ? 10 : 0);

                return (
                  <g key={`3d-${slice.id}`} className="pointer-events-none">
                    {/* Dark 3D Shadow Extrusion layer offset by 6px downwards */}
                    <motion.path
                      d={slice.pathData}
                      animate={{
                        x: dx,
                        y: dy + 6, // 3D Extrusion offset
                        filter: isAnySelected && !isSelected ? "grayscale(45%) opacity(0.2)" : "grayscale(0%) opacity(1)",
                      }}
                      transition={{ type: "spring", stiffness: 300, damping: 22 }}
                      fill={`url(#depth-${slice.id})`}
                      className={cn(
                        "transition-all stroke-1",
                        isDark ? "stroke-slate-950" : "stroke-transparent"
                      )}
                    />
                  </g>
                );
              })}

              {/* 3D Slices - Bright top layers */}
              {slices.map((slice) => {
                if (slice.percentage === 0) return null;
                const isSelected = filterAttribute === slice.id;
                const isAnySelected = filterAttribute !== null;
                
                // Explode offset
                const dx = Math.cos(slice.midAngle) * (isSelected ? 10 : 0);
                const dy = Math.sin(slice.midAngle) * (isSelected ? 10 : 0);

                return (
                  <g key={slice.id} onClick={() => onPointClick(slice.id)} className="cursor-pointer focus:outline-none">
                    <motion.path
                      d={slice.pathData}
                      animate={{
                        x: dx,
                        y: dy,
                        filter: isAnySelected && !isSelected ? "grayscale(45%) opacity(0.35)" : "grayscale(0%) opacity(1)",
                      }}
                      whileHover={{
                        scale: 1.03,
                        x: Math.cos(slice.midAngle) * 4 + dx,
                        y: Math.sin(slice.midAngle) * 4 + dy,
                        transition: { duration: 0.2 }
                      }}
                      transition={{ type: "spring", stiffness: 300, damping: 22 }}
                      fill={`url(#grad-${slice.id})`}
                      className={cn(
                        "transition-all stroke-1.5",
                        isDark ? "stroke-slate-900" : "stroke-white/15"
                      )}
                    />
                  </g>
                );
              })}
              </g>

              {/* Static center doughnut hole cover, completely unaffected by the mask sweep */}
              <circle
                cx="100"
                cy="100"
                r="30"
                fill={isDark ? "#020617" : "#ffffff"}
                stroke={isDark ? "#1e293b" : "#cbd5e1"}
                strokeWidth="2.5"
                className="transition-colors duration-500 drop-shadow-lg"
              />
            </svg>
            

          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-1 gap-2.5 md:gap-3.5 w-full max-w-[300px] md:max-w-[360px] lg:max-w-[380px]">
              {dataPoints.map((dp) => (
                <button 
                  key={dp.id} 
                  onClick={() => onPointClick(dp.id)}
                  className={cn(
                    "flex items-center gap-2.5 md:gap-3.5 p-2.5 md:p-3.5 rounded-xl md:rounded-2xl transition-all text-left group/btn border-2",
                    filterAttribute === dp.id 
                      ? cn(dp.activeBg, "ring-2", dp.activeRing, "border-transparent shadow-lg") 
                      : isDark ? "bg-slate-950/30 border-slate-800 hover:border-slate-700" : "bg-slate-100 border-slate-300 hover:border-slate-400"
                  )}
                >
                <div className="relative w-4.5 h-4.5 md:w-5 md:h-5 shrink-0">
                  <div className={cn(
                    "w-full h-full rounded-full shadow-md transition-all duration-500 group-hover/btn:scale-125 group-hover/btn:rotate-90", 
                    dp.color,
                    filterAttribute === dp.id && "animate-pulse shadow-[0_0_12px_currentColor]",
                    dp.id === 'cheater' ? 'text-red-500' : (dp.id === 'suspicious' ? 'text-yellow-500' : 'text-purple-500')
                  )} />
                  {filterAttribute === dp.id && (
                    <motion.div
                      initial={{ scale: 1, opacity: 0.5 }}
                      animate={{ scale: 2.2, opacity: 0 }}
                      transition={{ repeat: Infinity, duration: 1.5, ease: "easeOut" }}
                      className={cn("absolute inset-0 rounded-full border border-current", 
                        dp.id === 'cheater' ? 'text-red-500' : (dp.id === 'suspicious' ? 'text-yellow-500' : 'text-purple-500')
                      )}
                    />
                  )}
                </div>
                  <div className="flex flex-col gap-0.5">
                    <span className={cn("text-xs md:text-sm font-black uppercase tracking-wider", 
                      filterAttribute === dp.id ? (isDark ? "text-white" : "text-slate-950") : (isDark ? "text-slate-300" : "text-slate-700")
                    )}>{dp.label}</span>
                    <span className={cn("text-[9px] md:text-[11px] font-mono font-bold transition-all", 
                      filterAttribute === dp.id ? (isDark ? "text-slate-200" : "text-slate-900") : (isDark ? "text-slate-500" : "text-slate-600")
                    )}>
                      {dp.value.toLocaleString()} ({((dp.value / stats.total) * 100).toFixed(1)}%)
                    </span>
                  </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
});

export default function App() {
  const [currentDb, setCurrentDb] = useState<'garou' | 'vorobey'>('garou');
  const [isDbDropdownOpen, setIsDbDropdownOpen] = useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);
  const currentDbRef = React.useRef(currentDb);

  useEffect(() => {
    currentDbRef.current = currentDb;
  }, [currentDb]);

  const [data, setData] = useState<PlayerList | null>(null);
  const [rawJsonText, setRawJsonText] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [minLoadingPassed, setMinLoadingPassed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastFetchTime, setLastFetchTime] = useState<Date | null>(null);
  const [fileLastUpdated, setFileLastUpdated] = useState<Date | null>(() => {
    const cached = localStorage.getItem('tf2bd_last_mod');
    return cached ? new Date(cached) : null;
  });
  const [fileSize, setFileSize] = useState<string | null>(() => localStorage.getItem('tf2bd_file_size'));
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [filterAttribute, setFilterAttribute] = useState<string | null>(null);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>({ key: 'last_seen', direction: 'desc' });
  const [currentPage, setCurrentPage] = useState(1);
  const [pageInputValue, setPageInput] = useState('1');
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [tick, setTick] = useState(0);
  const itemsPerPage = 20;



  // Dropdown click outside handler
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDbDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Refresh relative timestamps every 60s
  useEffect(() => {
    const timer = setInterval(() => setTick(prev => prev + 1), 60000);
    return () => clearInterval(timer);
  }, []);

  // Listen for system theme changes
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      setIsDark(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  useEffect(() => {
    setPageInput(currentPage.toString());
  }, [currentPage]);

  const scrollToTable = useCallback(() => {
    document.getElementById('player-directory')?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  const fetchData = useCallback(async (isInitial = false, dbToFetch?: 'garou' | 'vorobey') => {
    const activeDb = dbToFetch || currentDbRef.current;
    if (isInitial) setLoading(true);
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      
      let response;
      if (activeDb === 'vorobey') {
        response = await fetch(`https://raw.githubusercontent.com/Nocrex/Tom/main/playerlist.vorobey-hackerpolice.json?t=${Date.now()}`, { signal: controller.signal });
      } else {
        response = await fetch(`${RAW_URL_MASTER}?t=${Date.now()}`, { signal: controller.signal });
        if (!response.ok) response = await fetch(`${RAW_URL_MAIN}?t=${Date.now()}`, { signal: controller.signal });
      }
      
      clearTimeout(timeoutId);
      if (!response.ok) throw new Error(`Database fetch failed (Status: ${response.status})`);

      const lastModHeader = response.headers.get('last-modified');
      if (lastModHeader) {
        const date = new Date(lastModHeader);
        if (!isNaN(date.getTime())) {
          setFileLastUpdated(date);
          localStorage.setItem('tf2bd_last_mod', date.toISOString());
        }
      }
      
      const text = await response.text();
      
      // Calculate file size
      const bytes = new Blob([text]).size;
      let sizeStr = '';
      if (bytes >= 1048576) {
        sizeStr = `${(bytes / 1048576).toFixed(2)} MB`;
      } else if (bytes >= 1024) {
        sizeStr = `${(bytes / 1024).toFixed(2)} KB`;
      } else {
        sizeStr = `${bytes} B`;
      }
      setFileSize(sizeStr);
      localStorage.setItem('tf2bd_file_size', sizeStr);

      let jsonData;
      try {
        jsonData = JSON.parse(text);
      } catch (e) {
        throw new Error('Database JSON is malformed.');
      }
      
      if (!jsonData.players || !Array.isArray(jsonData.players)) {
        throw new Error('JSON missing "players" array.');
      }

      // Store raw text for download
      setRawJsonText(text);

      // Final sanitization & performance prep for UI
      const sanitizedPlayers = jsonData.players.map((p: any) => {
        const steamid = String(p.steamid || '');
        
        // Precompute steam conversions for instant O(1) search matching
        let steam64 = '';
        let legacySteamId = '';
        const match = steamid.match(/\[U:1:(\d+)\]/);
        if (match) {
          try {
            const accountId = BigInt(match[1]);
            steam64 = (76561197960265728n + accountId).toString();
            legacySteamId = `STEAM_0:${accountId % 2n}:${accountId / 2n}`.toLowerCase();
          } catch (e) {}
        }

        return {
          steamid,
          steam64,
          legacySteamId,
          attributes: Array.isArray(p.attributes) ? p.attributes : [],
          proof: Array.isArray(p.proof) ? p.proof : [],
          last_seen: {
            player_name: String(p.last_seen?.player_name || 'Unknown'),
            time: Number(p.last_seen?.time || 0)
          }
        };
      });

      setData({ players: sanitizedPlayers });
      setLastFetchTime(new Date());

      if (!lastModHeader) {
        try {
          const fetchCommit = async (repo: string, filename: string, branch: string) => {
            return fetch(`https://api.github.com/repos/${repo}/commits?path=${filename}&sha=${branch}&page=1&per_page=1&t=${Date.now()}`);
          };
          
          let commitResponse;
          if (activeDb === 'vorobey') {
            commitResponse = await fetchCommit('Nocrex/Tom', 'playerlist.vorobey-hackerpolice.json', 'main');
          } else {
            commitResponse = await fetchCommit('Garou3299/tf2bd-database', 'playerlist.garou3299.json', 'master');
            if (!commitResponse.ok) commitResponse = await fetchCommit('Garou3299/tf2bd-database', 'playerlist.garou3299.json', 'main');
          }
          
          if (commitResponse.ok) {
            const commitData = await commitResponse.json();
            if (Array.isArray(commitData) && commitData.length > 0) {
              const dateStr = commitData[0].commit.committer.date || commitData[0].commit.author.date;
              const date = new Date(dateStr);
              if (!isNaN(date.getTime())) {
                setFileLastUpdated(date);
                localStorage.setItem('tf2bd_last_mod', date.toISOString());
              }
            }
          }
        } catch (e) {}
      }
      setError(null);
    } catch (err) {
      if (isInitial) setError(err instanceof Error ? err.message : 'Connection failed');
    } finally {
      if (isInitial) setLoading(false);
    }
  }, []);

  const switchDatabase = useCallback((db: 'garou' | 'vorobey') => {
    setCurrentDb(db);
    localStorage.setItem('tf2bd_active_db', db);
    fetchData(true, db);
    setSearchTerm('');
    setFilterAttribute(null);
    setSortConfig({ key: 'last_seen', direction: 'desc' });
    setCurrentPage(1);
  }, [fetchData]);

  useEffect(() => {
    fetchData(true);
    
    // Ensure loading screen is visible for at least 3 seconds for visibility
    const timer = setTimeout(() => setMinLoadingPassed(true), 3000);

    const intervalId = setInterval(() => fetchData(false), 600000);
    const handleScroll = () => setShowScrollTop(window.scrollY > 400);
    window.addEventListener('scroll', handleScroll);
    return () => {
      clearTimeout(timer);
      clearInterval(intervalId);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [fetchData]);

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.toggle('dark', isDark);
    root.style.colorScheme = isDark ? 'dark' : 'light';
  }, [isDark]);

  const handleSort = useCallback((key: string) => {
    setSortConfig(current => {
      let direction: 'asc' | 'desc' = 'asc';
      if (current && current.key === key && current.direction === 'asc') direction = 'desc';
      return { key, direction };
    });
    setCurrentPage(1);
  }, []);

  const handleCategoryFilter = useCallback((id: string) => {
    setFilterAttribute(prev => prev === id ? null : id);
    setCurrentPage(1);
    scrollToTable();
  }, [scrollToTable]);

  const handleDownload = useCallback(() => {
    if (!rawJsonText) return;
    const blob = new Blob([rawJsonText], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = currentDb === 'garou' ? 'playerlist.garou3299.json' : 'playerlist.vorobey-hackerpolice.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [rawJsonText, currentDb]);

  const stats = useMemo(() => {
    if (!data) return { total: 0, cheaters: 0, suspicious: 0, racist: 0 };
    return data.players.reduce((acc, player) => {
      acc.total++;
      if (player.attributes.includes('cheater')) acc.cheaters++;
      if (player.attributes.includes('suspicious')) acc.suspicious++;
      if (player.attributes.includes('racist')) acc.racist++;
      return acc;
    }, { total: 0, cheaters: 0, suspicious: 0, racist: 0 });
  }, [data]);

  const getPlayerPriorityColor = useCallback((attributes: string[]) => {
    if (attributes.includes('cheater')) return 'red';
    if (attributes.includes('racist')) return 'purple';
    if (attributes.includes('suspicious')) return 'yellow';
    return 'blue';
  }, []);

  const sortedPlayers = useMemo(() => {
    if (!data) return [];
    const searchLower = searchTerm.trim().toLowerCase();
    
    const filtered = data.players.filter(player => {
      if (!searchLower) {
        return !filterAttribute || player.attributes.includes(filterAttribute);
      }
      
      const nameMatch = player.last_seen?.player_name?.toLowerCase().includes(searchLower);
      const steamId32Match = player.steamid.toLowerCase().includes(searchLower);
      const steam64Match = player.steam64.includes(searchLower);
      const legacyMatch = player.legacySteamId.includes(searchLower);
      
      const attrMatch = !filterAttribute || player.attributes.includes(filterAttribute);
      return (nameMatch || steamId32Match || steam64Match || legacyMatch) && attrMatch;
    });

    if (sortConfig) {
      return [...filtered].sort((a, b) => {
        let aValue: any, bValue: any;
        const key = sortConfig.key;
        
        switch (key) {
          case 'name':
            aValue = a.last_seen?.player_name?.toLowerCase() || '';
            bValue = b.last_seen?.player_name?.toLowerCase() || '';
            break;
          case 'steamid':
            aValue = a.steamid.toLowerCase();
            bValue = b.steamid.toLowerCase();
            break;
          case 'attributes':
            aValue = [...a.attributes].sort().join(',');
            bValue = [...b.attributes].sort().join(',');
            break;
          case 'last_seen':
            aValue = a.last_seen?.time || 0;
            bValue = b.last_seen?.time || 0;
            break;
          default:
            return 0;
        }
        
        if (aValue === bValue) return 0;
        const multiplier = sortConfig.direction === 'asc' ? 1 : -1;
        return aValue < bValue ? -1 * multiplier : 1 * multiplier;
      });
    }
    return filtered;
  }, [data, searchTerm, filterAttribute, sortConfig]);

  const totalPages = Math.ceil(sortedPlayers.length / itemsPerPage);
  const paginatedPlayers = sortedPlayers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const getThemeColor = useCallback(() => {
    if (currentDb === 'vorobey') return { base: "red-500", light: "red-600", dark: "red-400", rgb: "239, 68, 68", tailwind: "red" };
    if (!filterAttribute) return { base: "blue-500", light: "blue-600", dark: "blue-400", rgb: "59, 130, 246", tailwind: "blue" };
    if (filterAttribute === 'cheater') return { base: "red-500", light: "red-600", dark: "red-400", rgb: "239, 68, 68", tailwind: "red" };
    if (filterAttribute === 'suspicious') return { base: "yellow-500", light: "yellow-600", dark: "yellow-400", rgb: "234, 179, 8", tailwind: "yellow" };
    if (filterAttribute === 'racist') return { base: "purple-500", light: "purple-600", dark: "purple-400", rgb: "168, 85, 247", tailwind: "purple" };
    return { base: "red-500", light: "red-600", dark: "red-400", rgb: "239, 68, 68", tailwind: "red" };
  }, [filterAttribute, currentDb]);

  const getThemeHoverColor = useCallback(() => {
    const { tailwind } = getThemeColor();
    switch (tailwind) {
      case 'blue': return "hover:text-blue-600 dark:hover:text-blue-400";
      case 'red': return "hover:text-red-600 dark:hover:text-red-400";
      case 'yellow': return "hover:text-yellow-600 dark:hover:text-yellow-400";
      case 'purple': return "hover:text-purple-600 dark:hover:text-purple-400";
      default: return "hover:text-red-600 dark:hover:text-red-400";
    }
  }, [getThemeColor]);

  const getHeaderTitleColor = useCallback((columnKey: string) => {
    const isSorted = sortConfig?.key === columnKey;
    if (!isSorted) return isDark ? "text-slate-400" : "text-slate-500";
    
    if (currentDb === 'vorobey') return isDark ? "text-red-400 font-black" : "text-red-600 font-black";
    
    if (!filterAttribute) return isDark ? "text-blue-400 font-black" : "text-blue-600 font-black";
    if (filterAttribute === 'cheater') return isDark ? "text-red-400 font-black" : "text-red-600 font-black";
    if (filterAttribute === 'suspicious') return isDark ? "text-yellow-400 font-black" : "text-yellow-600 font-black";
    return isDark ? "text-purple-400 font-black" : "text-purple-600 font-black";
  }, [sortConfig, currentDb, filterAttribute, isDark]);

  const getAttributeBadge = useCallback((attr: string) => {
    const lower = attr.toLowerCase();
    const commonClasses = "px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm transition-all duration-300";
    if (lower === 'cheater') return <span className={cn(commonClasses, isDark ? "bg-red-600/20 text-red-400 border border-red-500/30 shadow-red-500/5" : "bg-red-600 text-white border-red-700")}>Cheater</span>;
    if (lower === 'suspicious') return <span className={cn(commonClasses, isDark ? "bg-yellow-600/20 text-yellow-400 border border-yellow-500/30 shadow-yellow-500/5" : "bg-yellow-500 text-white border-yellow-600")}>Suspicious</span>;
    if (lower === 'racist') return <span className={cn(commonClasses, isDark ? "bg-purple-600/20 text-purple-400 border border-purple-500/30 shadow-purple-500/5" : "bg-purple-600 text-white border-purple-700")}>Racist</span>;
    return <span className={cn(commonClasses, isDark ? "bg-slate-800 text-slate-400 border border-slate-700" : "bg-slate-100 text-slate-700 border border-slate-200")}>{attr}</span>;
  }, [isDark]);

  const CopyButton = memo(({ text }: { text: string }) => {
    const [copied, setCopied] = useState(false);
    const handleCopy = (e: React.MouseEvent) => {
      e.stopPropagation();
      navigator.clipboard.writeText(text).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    };
    return (
      <button 
        onClick={handleCopy} 
        className={cn(
          "p-1.5 rounded-md transition-all duration-200 group/copy relative active:scale-90", 
          isDark 
            ? "hover:bg-slate-700 text-slate-400 hover:text-slate-100" 
            : "hover:bg-slate-300 text-slate-500 hover:text-slate-900"
        )} 
        title="Copy SteamID32"
      >
        {copied ? (
          <Check size={14} className="text-green-500" />
        ) : (
          <Copy size={14} className="group-hover/copy:scale-110 transition-transform opacity-60 group-hover/copy:opacity-100" />
        )}
      </button>
    );
  });

  return (
    <div 
      data-tick={tick}
      className={cn("min-h-screen transition-colors duration-700 font-sans pb-20 md:pb-0 selection:bg-red-600 selection:text-white relative overflow-x-hidden", isDark ? "bg-[#020617] text-slate-100" : "bg-[#cbd5e1] text-slate-900")}
    >
      {/* Decorative Ambient Background - Performance Optimized */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className={cn("absolute -top-24 -left-24 w-96 h-96 rounded-full blur-[120px] transition-colors duration-1000", isDark ? "bg-red-900/10" : "bg-red-500/5")} />
        <div className={cn("absolute bottom-0 right-0 w-80 h-80 rounded-full blur-[100px] transition-colors duration-1000", isDark ? "bg-blue-900/10" : "bg-blue-500/5")} />
      </div>

      {loading && (
        <div className="fixed top-0 left-0 right-0 h-1 z-[100] overflow-hidden bg-red-600/10">
          <motion.div animate={{ scaleX: [0, 1, 0], originX: [0, 0, 1] }} transition={{ repeat: Infinity, duration: 1.5, times: [0, 0.5, 1], ease: "easeInOut" }} className="h-full w-full bg-red-600 shadow-[0_0_10px_#dc2626]" />
        </div>
      )}

      <nav className={cn("sticky top-0 z-50 backdrop-blur-xl border-b transition-all duration-300", isDark ? "bg-slate-900/70 border-slate-800" : "bg-slate-300/80 border-slate-400/50")}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="relative" ref={dropdownRef}>
            <div 
              className="flex items-center gap-2 group cursor-pointer select-none" 
              onClick={() => setIsDbDropdownOpen(prev => !prev)}
            >
              <div className="p-1 bg-red-600 rounded-lg shadow-lg shadow-red-600/20 group-hover:scale-110 transition-transform duration-300 shrink-0">
                <TF2Shield className="text-white" size={26} logoColor="#dc2626" />
              </div>
              <div className="flex items-center gap-1">
                <span className={cn(
                  "font-black text-xl tracking-tighter transition-colors duration-300",
                  !filterAttribute ? "group-hover:text-blue-500" : 
                  filterAttribute === 'cheater' ? "group-hover:text-red-500" : 
                  filterAttribute === 'suspicious' ? (isDark ? "group-hover:text-yellow-400" : "group-hover:text-yellow-600") : 
                  "group-hover:text-purple-500"
                )}>
                  {currentDb === 'garou' ? 'GAROU3299 TF2BD DATABASE' : 'VOROBEY HACKER POLICE'}
                </span>
                <ChevronDown 
                  size={16} 
                  className={cn(
                    "transition-transform duration-300 shrink-0",
                    isDbDropdownOpen ? "rotate-180" : "",
                    isDark ? "text-slate-400" : "text-slate-600"
                  )} 
                />
              </div>
            </div>

            <AnimatePresence>
              {isDbDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.15, ease: "easeOut" }}
                  className={cn(
                    "absolute top-full left-0 mt-2 w-64 rounded-2xl border-2 shadow-2xl p-2 z-[100] backdrop-blur-2xl overflow-hidden",
                    isDark 
                      ? "bg-slate-950/95 border-slate-800 shadow-black/40 text-slate-100" 
                      : "bg-white/95 border-slate-300 shadow-slate-400/20 text-slate-900"
                  )}
                >
                  <div className="px-3 py-2 text-[10px] font-black tracking-[0.2em] uppercase opacity-55">
                    Select Database
                  </div>
                  
                  <button
                    onClick={() => {
                      switchDatabase('garou');
                      setIsDbDropdownOpen(false);
                    }}
                    className={cn(
                      "w-full flex items-center justify-between p-2.5 rounded-xl text-left transition-all duration-300 group/item",
                      currentDb === 'garou'
                        ? (isDark ? "bg-blue-500/10 text-blue-400" : "bg-blue-500/5 text-blue-700")
                        : (isDark ? "hover:bg-white/5 text-slate-300" : "hover:bg-slate-100 text-slate-700")
                    )}
                  >
                    <div className="font-black text-xs tracking-tight uppercase">GAROU3299 TF2BD DATABASE</div>
                    {currentDb === 'garou' && <Check size={14} className="shrink-0 text-blue-500 ml-2" />}
                  </button>

                  <button
                    onClick={() => {
                      switchDatabase('vorobey');
                      setIsDbDropdownOpen(false);
                    }}
                    className={cn(
                      "w-full flex items-center justify-between p-2.5 rounded-xl text-left transition-all duration-300 group/item mt-1",
                      currentDb === 'vorobey'
                        ? (isDark ? "bg-red-500/10 text-red-400" : "bg-red-500/5 text-red-700")
                        : (isDark ? "hover:bg-white/5 text-slate-300" : "hover:bg-slate-100 text-slate-700")
                    )}
                  >
                    <div className="font-black text-xs tracking-tight uppercase">VOROBEY HACKER POLICE</div>
                    {currentDb === 'vorobey' && <Check size={14} className="shrink-0 text-red-500 ml-2" />}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <a href={currentDb === 'garou' ? "https://github.com/Garou3299/tf2bd-database" : "https://github.com/Nocrex/Tom"} target="_blank" rel="noopener noreferrer" className={cn("p-2 transition-all flex items-center gap-2 text-xs font-bold uppercase tracking-widest rounded-xl", isDark ? "text-slate-400 hover:text-white hover:bg-white/5" : "text-slate-600 hover:text-slate-900 hover:bg-black/5")}><Globe size={18} /><span className="hidden md:inline">GitHub</span></a>
            <button onClick={() => setIsDark(!isDark)} className={cn("p-2.5 rounded-xl transition-all active:scale-95 border-2", isDark ? "bg-slate-800 text-yellow-400 border-slate-700 hover:bg-slate-700 shadow-lg shadow-yellow-400/10" : "bg-white text-slate-700 border-slate-400 hover:bg-slate-50 shadow-xl shadow-slate-900/10")}>{isDark ? <Sun size={20} strokeWidth={2.5} /> : <Moon size={20} strokeWidth={2.5} />}</button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-4">
            <h1 className={cn("text-4xl font-black tracking-tighter sm:text-5xl", isDark ? "text-white" : "text-slate-950")}>
              {currentDb === 'garou' ? 'Cheaters Database' : 'Vorobey Hacker Police'}
            </h1>
            <div className={cn("max-w-4xl space-y-3", isDark ? "text-slate-400" : "text-slate-600")}>
              {currentDb === 'garou' ? (
                <>
                  <p className="text-lg leading-relaxed font-medium">Tracking of known cheaters, bots, and suspicious players in Team Fortress 2. This list is maintained for use with the <a href="https://github.com/PazerOP/tf2_bot_detector" target="_blank" rel="noopener noreferrer" className="text-red-600 hover:underline font-bold inline-flex items-center gap-1.5 transition-all">TF2 Bot Detector<ExternalLink size={14} /></a> and its forks, like <a href="https://github.com/surepy/tf2_bot_detector" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline font-medium transition-colors">this one</a>.</p>
                  <div className="p-4 rounded-2xl bg-red-600/5 border border-red-500/10 backdrop-blur-sm">
                    <p className="text-sm italic leading-relaxed"><span className="font-black not-italic mr-2 text-red-600 uppercase tracking-tighter text-xs px-2 py-0.5 rounded bg-red-600/10">Contribute</span>If you have a cheater’s permanent Steam profile link or ID along with video evidence, please submit it <a href="https://github.com/Garou3299/tf2bd-database/discussions/1" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline font-bold inline-flex items-center gap-1 transition-all">here<ExternalLink size={12} /></a>.</p>
                  </div>
                </>
              ) : (
                <>
                  <p className="text-lg leading-relaxed font-medium">List of cheaters reported in the <code className="px-1.5 py-0.5 rounded bg-slate-500/15 text-red-500 font-mono font-black text-base">#hacker-police-reports</code> channel on the official <a href="https://discord.com/invite/EMZhDXV" target="_blank" rel="noopener noreferrer" className="text-red-600 hover:underline font-bold inline-flex items-center gap-1 transition-all">Vorobey Discord server<ExternalLink size={14} /></a>. This database only logs verified cheaters in Team Fortress 2.</p>
                </>
              )}
            </div>
          </div>
          <div className="flex flex-col items-center md:items-end gap-3 shrink-0">
            {loading && !error && (<div className={cn("flex items-center gap-2 px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest animate-pulse border shadow-lg", isDark ? "bg-blue-600/10 text-blue-400 border-blue-500/20 shadow-blue-500/5" : "bg-blue-600/5 text-blue-700 border-blue-500/20 shadow-blue-600/5")}><RefreshCw size={14} className="animate-spin" />Syncing Data...</div>)}
            {!loading && lastFetchTime && (<div className={cn("flex items-center gap-3 px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all duration-700 shadow-xl backdrop-blur-md", isDark ? "bg-slate-900/50 text-slate-400 border-slate-800" : "bg-slate-100/50 text-slate-600 border-slate-300")}><div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.5)]" /><span>Live Sync Active</span></div>)}
          </div>
        </div>

        {currentDb === 'garou' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12 py-2">
            <StatCard 
              title="Total Entries" 
              value={loading ? '...' : stats.total.toLocaleString()} 
              icon={Users} 
              theme="blue" 
              active={filterAttribute === null} 
              onClick={() => { setFilterAttribute(null); setCurrentPage(1); }} 
              isDark={isDark} 
              initial={{ x: -20, opacity: 0 }} 
              animate={{ x: 0, opacity: 1 }} 
              transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }} 
            />
            <StatCard 
              title="Cheaters" 
              value={loading ? '...' : stats.cheaters.toLocaleString()} 
              icon={Skull} 
              theme="red" 
              active={filterAttribute === 'cheater'} 
              onClick={() => handleCategoryFilter('cheater')} 
              isDark={isDark} 
              initial={{ x: 20, opacity: 0 }} 
              animate={{ x: 0, opacity: 1 }} 
              transition={{ duration: 0.5, delay: 0.15, ease: "easeOut" }} 
            />
            <StatCard 
              title="Suspicious" 
              value={loading ? '...' : stats.suspicious.toLocaleString()} 
              icon={AlertTriangle} 
              theme="yellow" 
              active={filterAttribute === 'suspicious'} 
              onClick={() => handleCategoryFilter('suspicious')} 
              isDark={isDark} 
              initial={{ x: -20, opacity: 0 }} 
              animate={{ x: 0, opacity: 1 }} 
              transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }} 
            />
            <StatCard 
              title="Racists" 
              value={loading ? '...' : stats.racist.toLocaleString()} 
              icon={MessageSquareText} 
              theme="purple" 
              active={filterAttribute === 'racist'} 
              onClick={() => handleCategoryFilter('racist')} 
              isDark={isDark} 
              initial={{ x: 20, opacity: 0 }} 
              animate={{ x: 0, opacity: 1 }} 
              transition={{ duration: 0.5, delay: 0.25, ease: "easeOut" }} 
            />
          </div>
        )}

        {!loading && !error && currentDb === 'garou' && <StatsVisualization stats={stats} filterAttribute={filterAttribute} isDark={isDark} onPointClick={handleCategoryFilter} />}

        <div 
          id="player-directory" 
          style={{
            ['--scrollbar-color' as any]: `rgba(${getThemeColor().rgb}, 0.3)`,
            ['--scrollbar-hover' as any]: `rgba(${getThemeColor().rgb}, 0.5)`
          }}
          className={cn(
            "rounded-3xl border-2 shadow-2xl transition-all duration-700 backdrop-blur-md overflow-hidden", 
            isDark ? "bg-slate-900/50" : "bg-slate-200/60",
            // Dynamic border and glow
            (currentDb === 'vorobey' || filterAttribute === 'cheater') && (isDark ? "border-red-500/30 shadow-red-500/10" : "border-red-400 shadow-red-500/10"),
            currentDb === 'garou' && !filterAttribute && (isDark ? "border-blue-500/20 shadow-blue-500/5" : "border-blue-400 shadow-blue-500/10"),
            currentDb === 'garou' && filterAttribute === 'suspicious' && (isDark ? "border-yellow-500/30 shadow-yellow-500/10" : "border-yellow-400 shadow-yellow-500/10"),
            currentDb === 'garou' && filterAttribute === 'racist' && (isDark ? "border-purple-500/30 shadow-purple-500/10" : "border-purple-400 shadow-purple-500/10")
          )}
        >
          <div className={cn("p-6 sm:p-8 flex flex-col lg:flex-row sm:items-center justify-between gap-6 transition-all duration-500")}>
            <div className="space-y-1">
              <h2 className="text-2xl font-black tracking-tight flex flex-wrap items-center gap-3">
                <span>Player Directory</span>
                {currentDb === 'vorobey' ? (
                  <span className={cn(
                    "text-[10px] uppercase px-3 py-1.5 rounded-full border-2 tracking-widest font-black shadow-md animate-in fade-in zoom-in duration-500", 
                    isDark ? "bg-red-950/30 text-red-400 border-red-500/30 shadow-red-500/5" : "bg-red-50 text-red-600 border-red-200"
                  )}>
                    Verified Cheaters Logged: {loading ? '...' : stats.cheaters.toLocaleString()}
                  </span>
                ) : filterAttribute ? (
                  <span className={cn("text-[10px] uppercase px-3 py-1 rounded-full border tracking-widest font-black shadow-lg animate-in fade-in zoom-in duration-500", filterAttribute === 'cheater' && "bg-red-600 text-white border-red-400", filterAttribute === 'suspicious' && "bg-yellow-500 text-white border-yellow-300", filterAttribute === 'racist' && "bg-purple-600 text-white border-purple-400")}>FILTER: {filterAttribute}</span>
                ) : null}
              </h2>
              <div className="flex items-center gap-3 mt-0.5">
                <p className={cn("text-sm transition-all duration-300", isDark ? "text-slate-400" : "text-slate-500")}>
                  {currentDb === 'vorobey' ? (<>Explore the full Vorobey Hacker Police database</>) : filterAttribute ? (<>Showing <span className={cn("font-black", filterAttribute === 'cheater' && "text-red-600", filterAttribute === 'suspicious' && (isDark ? "text-yellow-400" : "text-yellow-600"), filterAttribute === 'racist' && "text-purple-600")}>{sortedPlayers.length.toLocaleString()}</span> results matching category</>) : (<>Explore the full database</>)}
                </p>
              </div>
            </div>
            <div 
              className={cn(
                "relative max-w-md w-full group/search rounded-2xl border-2 transition-all duration-300 shadow-sm flex items-center overflow-hidden sm:overflow-visible",
                isDark ? "bg-slate-950/50 text-white" : "bg-white/50 text-slate-900",
                // Dynamic border and hardware-accelerated focus-within glow shadow (100% guarantees no corner peak-through or triangle artifacts!)
                (currentDb === 'vorobey' || filterAttribute === 'cheater') && (isDark ? "border-red-500/30 focus-within:border-red-500 focus-within:shadow-[0_0_15px_rgba(239,68,68,0.25)]" : "border-red-300 focus-within:border-red-600 focus-within:shadow-[0_0_15px_rgba(239,68,68,0.2)]"),
                currentDb === 'garou' && !filterAttribute && (isDark ? "border-blue-500/30 focus-within:border-blue-500 focus-within:shadow-[0_0_15px_rgba(59,130,246,0.25)]" : "border-blue-300 focus-within:border-blue-600 focus-within:shadow-[0_0_15px_rgba(59,130,246,0.2)]"),
                currentDb === 'garou' && filterAttribute === 'suspicious' && (isDark ? "border-yellow-500/30 focus-within:border-yellow-500 focus-within:shadow-[0_0_15px_rgba(234,179,8,0.25)]" : "border-yellow-300 focus-within:border-yellow-600 focus-within:shadow-[0_0_15px_rgba(234,179,8,0.2)]"),
                currentDb === 'garou' && filterAttribute === 'racist' && (isDark ? "border-purple-500/30 focus-within:border-purple-500 focus-within:shadow-[0_0_15px_rgba(168,85,247,0.25)]" : "border-purple-300 focus-within:border-purple-600 focus-within:shadow-[0_0_15px_rgba(168,85,247,0.2)]")
              )}
            >
              <Search className={cn(
                "absolute left-4 top-1/2 -translate-y-1/2 transition-all duration-300 z-20", 
                currentDb === 'vorobey' ? "text-red-500" : (!filterAttribute ? "text-blue-500" : (filterAttribute === 'cheater' ? "text-red-500" : (filterAttribute === 'suspicious' ? "text-yellow-500" : "text-purple-500"))),
                "group-focus-within/search:scale-110"
              )} size={20} />
              
              <input 
                type="text" 
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setIsSearchFocused(false)}
                className={cn(
                  "w-full pl-12 pr-12 py-3.5 bg-transparent border-none outline-none focus:outline-none text-sm font-bold tracking-tight relative z-10",
                  isDark ? "text-white" : "text-slate-900"
                )} 
                value={searchTerm} 
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }} 
              />

              {!searchTerm && !isSearchFocused && (
                <div className="absolute left-14 right-12 top-0 bottom-0 pointer-events-none overflow-hidden h-full flex items-center select-none z-0">
                  <motion.div
                    animate={{ 
                      x: [0, 0, -330, -330],
                      opacity: [1, 1, 1, 0]
                    }}
                    transition={{
                      duration: 12,
                      repeat: Infinity,
                      ease: "linear",
                      times: [0, 0.3, 0.9, 1]
                    }}
                    className={cn(
                      "whitespace-nowrap font-bold text-sm tracking-tight sm:animate-none sm:translate-x-0",
                      isDark ? "text-slate-300" : "text-slate-700"
                    )}
                  >
                    {currentDb === 'garou' ? "Search by Name, SteamID, SteamID32 or SteamID64" : "Search by SteamID, SteamID32 or SteamID64"}
                  </motion.div>
                </div>
              )}

              {searchTerm && (
                <button 
                  onClick={() => { setSearchTerm(''); setCurrentPage(1); }} 
                  className={cn(
                    "absolute right-4 top-1/2 -translate-y-1/2 p-1.5 rounded-xl transition-all hover:scale-125 active:scale-95 z-20",
                    currentDb === 'vorobey' ? "text-red-500 hover:text-red-600" : (
                      !filterAttribute ? "text-blue-500 hover:text-blue-600" : 
                      filterAttribute === 'cheater' ? "text-red-500 hover:text-red-600" : 
                      filterAttribute === 'suspicious' ? (isDark ? "text-yellow-400 hover:text-yellow-300" : "text-yellow-600 hover:text-yellow-700") : 
                      "text-purple-500 hover:text-purple-600"
                    )
                  )} 
                  title="Clear search"
                >
                  <X size={18} strokeWidth={3} />
                </button>
              )}
            </div>
          </div>

          <div className="custom-scrollbar">
            {(!minLoadingPassed || (loading && !data)) ? (
              <div className="flex flex-col items-center justify-center py-48 space-y-12">
                <motion.div 
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="relative flex items-center justify-center w-64 h-64"
                >
                  {/* Heartbeat Rings */}
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0.3, scale: 1 }}
                      animate={{ 
                        opacity: 0, 
                        scale: 2,
                      }}
                      transition={{ 
                        repeat: Infinity, 
                        duration: 2, 
                        delay: i * 0.6, 
                        ease: "easeOut" 
                      }}
                      className="absolute w-32 h-32 rounded-full border-4 border-red-600"
                    />
                  ))}
                  
                  {/* Central Shield Icon */}
                  <motion.div
                    animate={{ 
                      scale: [1, 1.1, 1],
                    }}
                    transition={{ 
                      repeat: Infinity, 
                      duration: 1, 
                      ease: "easeInOut" 
                    }}
                    className="relative z-10 drop-shadow-[0_0_30px_rgba(220,38,38,0.6)]"
                  >
                    <TF2Shield className="text-red-600" size={120} logoColor="white" />
                  </motion.div>

                  {/* High Intensity Glow Background */}
                  <div className="absolute inset-0 bg-red-600/10 blur-[100px] rounded-full animate-pulse" />
                </motion.div>


              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-20 text-center px-4"><div className="p-6 bg-red-600/10 rounded-full mb-6 text-red-600 shadow-xl shadow-red-600/5"><AlertTriangle size={48} /></div><h3 className="text-xl font-black tracking-tight">Access Error</h3><p className="text-slate-500 max-sm mt-2 mb-8 font-medium">{error}</p><button onClick={() => window.location.reload()} className="px-8 py-3 bg-red-600 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-red-700 transition-all shadow-xl shadow-red-600/20 active:scale-95">Re-establish Link</button></div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className={cn(
                      isDark ? "bg-slate-950/30" : "bg-slate-300/50", 
                      "whitespace-nowrap border-y transition-all duration-500",
                      (currentDb === 'vorobey' || filterAttribute === 'cheater') && (isDark ? "border-red-500/20" : "border-red-300"),
                      currentDb === 'garou' && !filterAttribute && (isDark ? "border-blue-500/20" : "border-blue-300"),
                      currentDb === 'garou' && filterAttribute === 'suspicious' && (isDark ? "border-yellow-500/20" : "border-yellow-300"),
                      currentDb === 'garou' && filterAttribute === 'racist' && (isDark ? "border-purple-500/20" : "border-purple-300")
                    )}>
                      {currentDb === 'garou' && (
                        <th className={cn("px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] cursor-pointer transition-all duration-300 group/th", getThemeHoverColor(), getHeaderTitleColor('name'))} onClick={() => handleSort('name')}><div className="flex items-center gap-2 transition-all duration-300 transform hover:scale-105 hover:-translate-y-0.5 active:scale-95 origin-left select-none">Player Name{sortConfig?.key === 'name' ? (sortConfig.direction === 'asc' ? <ChevronUp size={14} className={isDark ? `text-${getThemeColor().dark}` : `text-${getThemeColor().light}`} /> : <ChevronDown size={14} className={isDark ? `text-${getThemeColor().dark}` : `text-${getThemeColor().light}`} />) : <ArrowUpDown size={14} className="opacity-40 group-hover/th:opacity-100 transition-opacity" />}</div></th>
                      )}
                      <th className={cn("px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] cursor-pointer transition-all duration-300 group/th text-center", getThemeHoverColor(), getHeaderTitleColor('steamid'))} onClick={() => handleSort('steamid')}>
                        <div className="inline-flex items-center justify-center gap-1.5 transition-all duration-300 transform hover:scale-105 hover:-translate-y-0.5 active:scale-95 origin-center select-none">
                          <span>SteamID32</span>
                          {sortConfig?.key === 'steamid' ? (
                            sortConfig.direction === 'asc' 
                              ? <ChevronUp size={14} className={isDark ? `text-${getThemeColor().dark}` : `text-${getThemeColor().light}`} /> 
                              : <ChevronDown size={14} className={isDark ? `text-${getThemeColor().dark}` : `text-${getThemeColor().light}`} />
                          ) : <ArrowUpDown size={14} className="opacity-40 group-hover/th:opacity-100 transition-opacity" />}
                        </div>
                      </th>
                      {currentDb === 'garou' && (
                        <th className={cn("px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 text-center", filterAttribute ? "cursor-default opacity-50" : cn("cursor-pointer", getThemeHoverColor()), getHeaderTitleColor('attributes'))} onClick={() => !filterAttribute && handleSort('attributes')}>
                          <div className="inline-flex items-center justify-center gap-1.5 transition-all duration-300 transform hover:scale-105 hover:-translate-y-0.5 active:scale-95 origin-center select-none">
                            <span>Attributes</span>
                            {!filterAttribute && (
                              sortConfig?.key === 'attributes' ? (
                                sortConfig.direction === 'asc' 
                                  ? <ChevronUp size={14} className={isDark ? `text-${getThemeColor().dark}` : `text-${getThemeColor().light}`} /> 
                                  : <ChevronDown size={14} className={isDark ? `text-${getThemeColor().dark}` : `text-${getThemeColor().light}`} />
                              ) : <ArrowUpDown size={14} className="opacity-40 group-hover/th:opacity-100 transition-opacity" />
                            )}
                          </div>
                        </th>
                      )}
                      {currentDb === 'vorobey' && (
                        <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] text-center select-none">PROOF / EVIDENCE</th>
                      )}
                      <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] text-center select-none">LINKS</th>
                      <th className={cn("px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] cursor-pointer transition-all duration-300 group/th text-right", getThemeHoverColor(), getHeaderTitleColor('last_seen'))} onClick={() => handleSort('last_seen')}><div className="flex items-center gap-2 justify-end transition-all duration-300 transform hover:scale-105 hover:-translate-y-0.5 active:scale-95 origin-right select-none font-sans">Last Seen{sortConfig?.key === 'last_seen' ? (sortConfig.direction === 'asc' ? <ChevronUp size={14} className={isDark ? `text-${getThemeColor().dark}` : `text-${getThemeColor().light}`} /> : <ChevronDown size={14} className={isDark ? `text-${getThemeColor().dark}` : `text-${getThemeColor().light}`} />) : <ArrowUpDown size={14} className="opacity-40 group-hover/th:opacity-100 transition-opacity" />}</div></th>
                    </tr>
                  </thead>
                  <tbody className={cn("divide-y", isDark ? "divide-slate-800" : "divide-slate-300")}>
                      {paginatedPlayers.length > 0 ? (
                        paginatedPlayers.map((player) => (
                          <tr key={player.steamid} className={cn("transition-all duration-300 group/row", (() => { const pColor = getPlayerPriorityColor(player.attributes); if (pColor === 'red') return isDark ? "hover:bg-red-500/10" : "hover:bg-red-500/10"; if (pColor === 'yellow') return isDark ? "hover:bg-yellow-500/10" : "hover:bg-yellow-500/10"; if (pColor === 'purple') return isDark ? "hover:bg-purple-500/10" : "hover:bg-purple-500/10"; return isDark ? "hover:bg-blue-500/10" : "hover:bg-blue-500/10"; })())}>
                            {currentDb === 'garou' && (
                              <td className="px-8 py-5 whitespace-nowrap"><a href={(() => { const match = player.steamid.match(/\[U:1:(\d+)\]/); if (match) { const accountId = BigInt(match[1]); return `https://steamcommunity.com/profiles/${76561197960265728n + accountId}`; } return `https://steamcommunity.com/search/users/#text=${player.steamid}`; })()} target="_blank" rel="noopener noreferrer" className="font-bold text-base group/link inline-flex items-center gap-2.5 text-blue-600 dark:text-blue-400 hover:text-red-600 dark:hover:text-red-400 transition-all underline decoration-transparent hover:decoration-current underline-offset-4">{player.last_seen?.player_name || 'Unknown'}<ExternalLink size={14} className="opacity-0 group-hover/link:opacity-100 transition-all -translate-x-2 group-hover/link:translate-x-0" /></a></td>
                            )}
                            <td className="px-8 py-5 whitespace-nowrap">
                              <div className="flex items-center justify-center gap-2.5">
                                <code className={cn(
                                  "text-xs font-black font-mono px-2.5 py-1.5 rounded-lg border-2 shadow-sm transition-all duration-300", 
                                  isDark ? "bg-slate-950 border-slate-800 text-slate-300" : "bg-white border-slate-300 text-slate-700",
                                  (() => {
                                    const pColor = getPlayerPriorityColor(player.attributes);
                                    if (pColor === 'red') return cn(isDark ? "group-hover/row:border-red-500/40" : "group-hover/row:border-red-200", "hover:border-red-500 hover:text-red-500");
                                    if (pColor === 'yellow') return cn(isDark ? "group-hover/row:border-yellow-500/40" : "group-hover/row:border-yellow-200", "hover:border-yellow-500 hover:text-yellow-500");
                                    if (pColor === 'purple') return cn(isDark ? "group-hover/row:border-purple-500/40" : "group-hover/row:border-purple-200", "hover:border-purple-500 hover:text-purple-500");
                                    return cn(isDark ? "group-hover/row:border-blue-500/40" : "group-hover/row:border-blue-200", "hover:border-blue-500 hover:text-blue-500");
                                  })()
                                )}>
                                  {player.steamid}
                                </code>
                                <CopyButton text={player.steamid} />
                              </div>
                            </td>
                            {currentDb === 'garou' && (
                              <td className="px-8 py-5 whitespace-nowrap">
                                <div className="flex flex-wrap justify-center gap-2">
                                  {player.attributes.map((attr, i) => (<React.Fragment key={i}>{getAttributeBadge(attr)}</React.Fragment>))}
                                </div>
                              </td>
                            )}
                            {currentDb === 'vorobey' && (
                              <td className="px-8 py-5 whitespace-nowrap text-center">
                                <div className="flex flex-wrap justify-center gap-2">
                                  {player.proof && player.proof.length > 0 ? (
                                    player.proof.map((proofLink, pIdx) => (
                                      <a
                                        key={pIdx}
                                        href={proofLink}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={cn(
                                          "px-3 py-1.5 text-xs font-black uppercase tracking-widest rounded-xl border-2 shadow-sm inline-flex items-center gap-1.5 transition-all duration-300 hover:scale-105 active:scale-95",
                                          isDark
                                            ? "bg-red-500/10 hover:bg-red-500/20 text-red-400 border-red-500/20 hover:border-red-500/40"
                                            : "bg-red-500/5 hover:bg-red-500/10 text-red-600 border-red-500/20 hover:border-red-500/30"
                                        )}
                                        title="View Proof of Hack"
                                      >
                                        <MessageSquareText size={12} strokeWidth={3} />
                                        <span>Report #{pIdx + 1}</span>
                                      </a>
                                    ))
                                  ) : (
                                    <span className="text-xs font-bold opacity-40">NO PROOF LOGGED</span>
                                  )}
                                </div>
                              </td>
                            )}
                            <td className="px-8 py-5 whitespace-nowrap">
                              <div className="flex items-center justify-center gap-4">
                                <a href={(() => { const match = player.steamid.match(/\[U:1:(\d+)\]/); if (match) { return `https://steamhistory.net/id/${76561197960265728n + BigInt(match[1])}`; } return "#"; })()} target="_blank" rel="noopener noreferrer" className={cn("p-2 rounded-xl transition-all hover:scale-110 shadow-sm", isDark ? "bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white" : "bg-slate-100 hover:bg-slate-300 text-slate-600 hover:text-slate-900")} title="Steam History"><History size={18} /></a>
                                <a href={(() => { const match = player.steamid.match(/\[U:1:(\d+)\]/); if (match) { return `https://steamid.xyz/64/${76561197960265728n + BigInt(match[1])}`; } return "#"; })()} target="_blank" rel="noopener noreferrer" className={cn("p-2 rounded-xl transition-all hover:scale-110 shadow-sm", isDark ? "bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white" : "bg-slate-100 hover:bg-slate-300 text-slate-600 hover:text-slate-900")} title="SteamID.xyz"><Link size={18} /></a>
                              </div>
                            </td>
                            <td className={cn("px-8 py-5 text-sm text-right", isDark ? "text-slate-400" : "text-slate-500")}><div className="flex flex-col items-end whitespace-nowrap font-mono"><span className={cn("font-black tracking-tighter text-base", isDark ? "text-slate-300" : "text-slate-800")}>{player.last_seen?.time ? format(new Date(player.last_seen.time * 1000), 'MMM d, yyyy') : 'Never'}</span><span className="text-[10px] font-black opacity-40 uppercase tracking-widest">{player.last_seen?.time ? `${format(new Date(player.last_seen.time * 1000), 'hh:mm a')} • ${formatDistanceToNow(new Date(player.last_seen.time * 1000), { addSuffix: true })}` : ''}</span></div></td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={currentDb === 'garou' ? 5 : 4} className="px-6 py-32 text-center">
                            <div className="flex flex-col items-center">
                              <div className="p-8 rounded-full bg-slate-500/5 mb-6 animate-pulse">
                                <Search size={64} className="text-slate-400 dark:text-slate-600" />
                              </div>
                              <p className="text-sm font-bold text-slate-400 mt-1 uppercase tracking-widest">No matching players found in the database</p>
                              <button 
                                onClick={() => { setSearchTerm(''); setFilterAttribute(null); }} 
                                className={cn(
                                  "mt-8 px-6 py-2 rounded-full text-xs font-black uppercase tracking-widest transition-all shadow-lg",
                                  !filterAttribute && (isDark ? "bg-blue-600/20 text-blue-400 border border-blue-500/30 hover:bg-blue-600 hover:text-white" : "bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-600 hover:text-white"),
                                  filterAttribute === 'cheater' && (isDark ? "bg-red-600/20 text-red-400 border border-red-500/30 hover:bg-red-600 hover:text-white" : "bg-red-50 text-red-600 border border-red-200 hover:bg-red-600 hover:text-white"),
                                  filterAttribute === 'suspicious' && (isDark ? "bg-yellow-600/20 text-yellow-400 border border-yellow-500/30 hover:bg-yellow-600 hover:text-white" : "bg-yellow-50 text-yellow-600 border border-yellow-200 hover:bg-yellow-600 hover:text-white"),
                                  filterAttribute === 'racist' && (isDark ? "bg-purple-600/20 text-purple-400 border border-purple-500/30 hover:bg-purple-600 hover:text-white" : "bg-purple-50 text-purple-600 border border-purple-200 hover:bg-purple-600 hover:text-white")
                                )}
                              >
                                Reset All Filters
                              </button>
                            </div>
                          </td>
                        </tr>
                      )}
                  </tbody>
                </table>
              </div>

                {totalPages > 1 && (
                  <div 
                    className={cn(
                      "p-6 border-t flex flex-col sm:flex-row items-center justify-between gap-6 backdrop-blur-xl transition-all duration-700", 
                      isDark ? "bg-slate-950/30" : "bg-slate-300/30",
                      (currentDb === 'vorobey' || filterAttribute === 'cheater') && (isDark ? "border-red-500/20 shadow-red-500/5" : "border-red-300 shadow-red-500/5"),
                      currentDb === 'garou' && !filterAttribute && (isDark ? "border-blue-500/20 shadow-blue-500/5" : "border-blue-300 shadow-blue-500/5"),
                      currentDb === 'garou' && filterAttribute === 'suspicious' && (isDark ? "border-yellow-500/20 shadow-yellow-500/5" : "border-yellow-300 shadow-yellow-500/5"),
                      currentDb === 'garou' && filterAttribute === 'racist' && (isDark ? "border-purple-500/20 shadow-purple-500/5" : "border-purple-300 shadow-purple-500/5")
                    )}
                  >
                    <div className="flex items-center gap-4">
                      <p className={cn(
                        "text-[10px] font-black uppercase tracking-[0.2em] whitespace-nowrap transition-colors duration-500",
                        currentDb === 'vorobey' ? (isDark ? "text-red-400/60" : "text-red-600/60") : (
                          !filterAttribute ? (isDark ? "text-blue-400/60" : "text-blue-600/60") : 
                          filterAttribute === 'cheater' ? (isDark ? "text-red-400/60" : "text-red-600/60") : 
                          filterAttribute === 'suspicious' ? (isDark ? "text-yellow-400/60" : "text-yellow-600/60") : 
                          (isDark ? "text-purple-400/60" : "text-purple-600/60")
                        )
                      )}>
                        Jump to Page
                      </p>
                      <div className="relative group/page">
                        <select 
                          value={currentPage}
                          onChange={(e) => { setCurrentPage(Number(e.target.value)); scrollToTable(); }}
                          className={cn(
                            "appearance-none pl-4 pr-10 py-2 rounded-xl border-2 font-black text-sm cursor-pointer outline-none transition-all duration-300 shadow-sm",
                            isDark ? "bg-slate-900 border-slate-800 text-white" : "bg-white border-slate-300 text-slate-900",
                            // Use explicit class names to ensure tailwind picks them up correctly
                            (currentDb === 'vorobey' || filterAttribute === 'cheater') && (isDark ? "hover:border-red-500/50 focus:ring-4 focus:ring-red-500/10" : "hover:border-red-600/50 focus:ring-4 focus:ring-red-600/5"),
                            currentDb === 'garou' && !filterAttribute && (isDark ? "hover:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10" : "hover:border-blue-600/50 focus:ring-4 focus:ring-blue-600/5"),
                            currentDb === 'garou' && filterAttribute === 'suspicious' && (isDark ? "hover:border-yellow-500/50 focus:ring-4 focus:ring-yellow-500/10" : "hover:border-yellow-600/50 focus:ring-4 focus:ring-yellow-600/5"),
                            currentDb === 'garou' && filterAttribute === 'racist' && (isDark ? "hover:border-purple-500/50 focus:ring-4 focus:ring-purple-500/10" : "hover:border-purple-600/50 focus:ring-4 focus:ring-purple-600/5")
                          )}
                        >
                          {[...Array(totalPages)].map((_, i) => (
                            <option key={i + 1} value={i + 1} className={isDark ? "bg-slate-900 text-white" : "bg-white text-slate-900"}>
                              Page {i + 1}
                            </option>
                          ))}
                        </select>
                        <div className={cn(
                          "absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none transition-colors",
                          isDark ? `group-hover/page:text-${getThemeColor().dark}` : `group-hover/page:text-${getThemeColor().light}`
                        )}>
                          <ChevronDown size={14} strokeWidth={3} />
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => { if (currentPage !== 1) { setCurrentPage(1); scrollToTable(); } }} 
                        disabled={currentPage === 1} 
                        className={cn(
                          "p-2 rounded-xl border-2 transition-all active:scale-90 disabled:opacity-30", 
                          isDark ? "border-slate-800 text-white" : "border-slate-300 text-slate-900",
                          currentDb === 'vorobey' ? "hover:border-red-500/50 hover:bg-red-500/5" : (
                            !filterAttribute ? "hover:border-blue-500/50 hover:bg-blue-500/5" : 
                            filterAttribute === 'cheater' ? "hover:border-red-500/50 hover:bg-red-500/5" : 
                            filterAttribute === 'suspicious' ? "hover:border-yellow-500/50 hover:bg-yellow-500/5" : 
                            "hover:border-purple-500/50 hover:bg-purple-500/5"
                          )
                        )}
                        title="First Page"
                      >
                        <ChevronsLeft size={18} strokeWidth={3} className={cn(
                          "transition-colors",
                          currentDb === 'vorobey' ? (isDark ? "text-red-400" : "text-red-600") : (
                            !filterAttribute ? (isDark ? "text-blue-400" : "text-blue-600") : 
                            filterAttribute === 'cheater' ? (isDark ? "text-red-400" : "text-red-600") : 
                            filterAttribute === 'suspicious' ? (isDark ? "text-yellow-400" : "text-yellow-600") : 
                            (isDark ? "text-purple-400" : "text-purple-600")
                          )
                        )} />
                      </button>

                      <button 
                        onClick={() => { if (currentPage > 1) { setCurrentPage(p => p - 1); scrollToTable(); } }} 
                        disabled={currentPage === 1} 
                        className={cn(
                          "p-2 rounded-xl border-2 transition-all active:scale-90 disabled:opacity-30", 
                          isDark ? "border-slate-800 text-white" : "border-slate-300 text-slate-900",
                          currentDb === 'vorobey' ? "hover:border-red-500/50 hover:bg-red-500/5" : (
                            !filterAttribute ? "hover:border-blue-500/50 hover:bg-blue-500/5" : 
                            filterAttribute === 'cheater' ? "hover:border-red-500/50 hover:bg-red-500/5" : 
                            filterAttribute === 'suspicious' ? "hover:border-yellow-500/50 hover:bg-yellow-500/5" : 
                            "hover:border-purple-500/50 hover:bg-purple-500/5"
                          )
                        )}
                        title="Previous Page"
                      >
                        <ChevronLeft size={18} strokeWidth={3} className={cn(
                          "transition-colors",
                          currentDb === 'vorobey' ? (isDark ? "text-red-400" : "text-red-600") : (
                            !filterAttribute ? (isDark ? "text-blue-400" : "text-blue-600") : 
                            filterAttribute === 'cheater' ? (isDark ? "text-red-400" : "text-red-600") : 
                            filterAttribute === 'suspicious' ? (isDark ? "text-yellow-400" : "text-yellow-600") : 
                            (isDark ? "text-purple-400" : "text-purple-600")
                          )
                        )} />
                      </button>
                      
                      <div className={cn(
                        "flex items-center rounded-xl border-2 font-black text-xs uppercase tracking-widest transition-all duration-500 shadow-inner overflow-hidden",
                        isDark ? "bg-slate-900/50 border-slate-800" : "bg-white/50 border-slate-300",
                        currentDb === 'vorobey' ? "focus-within:border-red-500/50" : cn(
                          !filterAttribute && "focus-within:border-blue-500/50",
                          filterAttribute === 'cheater' && "focus-within:border-red-500/50",
                          filterAttribute === 'suspicious' && "focus-within:border-yellow-500/50",
                          filterAttribute === 'racist' && "focus-within:border-purple-500/50"
                        )
                      )}>
                        <input 
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          value={pageInputValue}
                          onChange={(e) => {
                            const val = e.target.value.replace(/\D/g, '');
                            setPageInput(val);
                            if (val) {
                              const num = parseInt(val, 10);
                              if (num >= 1 && num <= totalPages) {
                                setCurrentPage(num);
                                scrollToTable();
                              }
                            }
                          }}
                          onBlur={() => setPageInput(currentPage.toString())}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') scrollToTable();
                          }}
                          className={cn(
                            "w-10 text-center bg-transparent outline-none py-2 transition-colors",
                            currentDb === 'vorobey' ? (isDark ? "text-red-400" : "text-red-600") : (
                              !filterAttribute ? (isDark ? "text-blue-400" : "text-blue-600") : 
                              filterAttribute === 'cheater' ? (isDark ? "text-red-400" : "text-red-600") : 
                              filterAttribute === 'suspicious' ? (isDark ? "text-yellow-400" : "text-yellow-600") : 
                              (isDark ? "text-purple-400" : "text-purple-600")
                            )
                          )}
                        />
                        <span className={cn(
                          "pr-3 opacity-40 transition-colors",
                          currentDb === 'vorobey' ? (isDark ? "text-red-400" : "text-red-600") : (
                            !filterAttribute ? (isDark ? "text-blue-400" : "text-blue-600") : 
                            filterAttribute === 'cheater' ? (isDark ? "text-red-400" : "text-red-600") : 
                            filterAttribute === 'suspicious' ? (isDark ? "text-yellow-400" : "text-yellow-600") : 
                            (isDark ? "text-purple-400" : "text-purple-600")
                          )
                        )}>/ {totalPages}</span>
                      </div>

                      <button 
                        onClick={() => { if (currentPage < totalPages) { setCurrentPage(p => p + 1); scrollToTable(); } }} 
                        disabled={currentPage === totalPages} 
                        className={cn(
                          "p-2 rounded-xl border-2 transition-all active:scale-90 disabled:opacity-30", 
                          isDark ? "border-slate-800 text-white" : "border-slate-300 text-slate-900",
                          currentDb === 'vorobey' ? "hover:border-red-500/50 hover:bg-red-500/5" : cn(
                            !filterAttribute && "hover:border-blue-500/50 hover:bg-blue-500/5",
                            filterAttribute === 'cheater' && "hover:border-red-500/50 hover:bg-red-500/5",
                            filterAttribute === 'suspicious' && "hover:border-yellow-500/50 hover:bg-yellow-500/5",
                            filterAttribute === 'racist' && "hover:border-purple-500/50 hover:bg-purple-500/5"
                          )
                        )}
                        title="Next Page"
                      >
                        <ChevronRight size={18} strokeWidth={3} className={cn(
                          "transition-colors",
                          currentDb === 'vorobey' ? (isDark ? "text-red-400" : "text-red-600") : (
                            !filterAttribute ? (isDark ? "text-blue-400" : "text-blue-600") : 
                            filterAttribute === 'cheater' ? (isDark ? "text-red-400" : "text-red-600") : 
                            filterAttribute === 'suspicious' ? (isDark ? "text-yellow-400" : "text-yellow-600") : 
                            (isDark ? "text-purple-400" : "text-purple-600")
                          )
                        )} />
                      </button>

                      <button 
                        onClick={() => { if (currentPage !== totalPages) { setCurrentPage(totalPages); scrollToTable(); } }} 
                        disabled={currentPage === totalPages} 
                        className={cn(
                          "p-2 rounded-xl border-2 transition-all active:scale-90 disabled:opacity-30", 
                          isDark ? "border-slate-800 text-white" : "border-slate-300 text-slate-900",
                          currentDb === 'vorobey' ? "hover:border-red-500/50 hover:bg-red-500/5" : cn(
                            !filterAttribute && "hover:border-blue-500/50 hover:bg-blue-500/5",
                            filterAttribute === 'cheater' && "hover:border-red-500/50 hover:bg-red-500/5",
                            filterAttribute === 'suspicious' && "hover:border-yellow-500/50 hover:bg-yellow-500/5",
                            filterAttribute === 'racist' && "hover:border-purple-500/50 hover:bg-purple-500/5"
                          )
                        )}
                        title="Last Page"
                      >
                        <ChevronsRight size={18} strokeWidth={3} className={cn(
                          "transition-colors",
                          currentDb === 'vorobey' ? (isDark ? "text-red-400" : "text-red-600") : (
                            !filterAttribute ? (isDark ? "text-blue-400" : "text-blue-600") : 
                            filterAttribute === 'cheater' ? (isDark ? "text-red-400" : "text-red-600") : 
                            filterAttribute === 'suspicious' ? (isDark ? "text-yellow-400" : "text-yellow-600") : 
                            (isDark ? "text-purple-400" : "text-purple-600")
                          )
                        )} />
                      </button>
                    </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>

      <footer className={cn("max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t mt-20 text-center sm:text-left transition-all duration-500", isDark ? "border-slate-800" : "border-slate-400/50")}>
        <div className="flex flex-col md:flex-row items-center justify-between gap-12">
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-4 justify-center sm:justify-start group cursor-pointer" onClick={() => { setFilterAttribute(null); setSearchTerm(''); setCurrentPage(1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}><TF2Shield className="text-red-600 group-hover:rotate-[360deg] transition-transform duration-700 shrink-0" size={24} logoColor="white" /><span className={cn(
  "font-black text-2xl tracking-tighter transition-colors duration-300",
  isDark ? "text-white" : "text-slate-950",
  !filterAttribute ? "group-hover:text-blue-500" : 
  filterAttribute === 'cheater' ? "group-hover:text-red-500" : 
  filterAttribute === 'suspicious' ? (isDark ? "group-hover:text-yellow-400" : "group-hover:text-yellow-600") : 
  "group-hover:text-purple-500"
)}>
  {currentDb === 'garou' ? 'GAROU3299 TF2BD DATABASE' : 'VOROBEY HACKER POLICE'}
</span></div>
            <p className={cn("text-base max-w-sm font-medium leading-relaxed", isDark ? "text-slate-500" : "text-slate-700")}>
              {currentDb === 'garou' 
                ? 'A community-driven database dedicated to identifying and tracking cheaters and bots in Team Fortress 2.' 
                : 'List of cheaters reported in the #hacker-police-reports channel on the Vorobey discord server.'}
            </p>
            <div className="flex flex-col gap-1">
              <p className={cn("text-[10px] font-black uppercase tracking-[0.3em]", isDark ? "text-slate-700" : "text-slate-500")}>
                &copy; {new Date().getFullYear()} {currentDb === 'garou' ? 'GAROU3299 REGISTRY' : 'VOROBEY REGISTRY'}
              </p>
              <p className={cn("text-[10px] font-bold uppercase tracking-widest", isDark ? "text-slate-800" : "text-slate-500")}>Not affiliated with Valve Corporation</p>
            </div>
          </div>
          <div className="flex flex-col items-center md:items-end gap-3 text-center md:text-right md:pr-14">
            <div className={cn(
              "p-6 rounded-[2.5rem] border-2 flex flex-col gap-4 transition-all duration-500 shadow-2xl backdrop-blur-2xl relative overflow-hidden group",
              isDark ? "bg-slate-950/50 shadow-black/40" : "bg-slate-200/60 shadow-slate-400/20",
              // Dynamic border and glow
              (currentDb === 'vorobey' || filterAttribute === 'cheater') && (isDark ? "border-red-500/30 shadow-red-500/10" : "border-red-400 shadow-red-500/10"),
              currentDb === 'garou' && !filterAttribute && (isDark ? "border-blue-500/20 shadow-blue-500/5" : "border-blue-400 shadow-blue-500/10"),
              currentDb === 'garou' && filterAttribute === 'suspicious' && (isDark ? "border-yellow-500/30 shadow-yellow-500/10" : "border-yellow-400 shadow-yellow-500/10"),
              currentDb === 'garou' && filterAttribute === 'racist' && (isDark ? "border-purple-500/30 shadow-purple-500/10" : "border-purple-400 shadow-purple-500/10")
            )}>
              <div className="absolute top-0 right-0 w-32 h-32 bg-red-600/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
              <div className="flex items-center justify-between gap-8 relative z-10">
                <span className={cn(
                  "text-[10px] font-black uppercase tracking-[0.2em] transition-colors duration-500",
                  currentDb === 'vorobey' ? "text-red-500" : (
                    !filterAttribute && (isDark ? "text-blue-500/60" : "text-blue-600/60")
                  ),
                  currentDb === 'garou' && filterAttribute === 'cheater' && "text-red-500",
                  currentDb === 'garou' && filterAttribute === 'suspicious' && (isDark ? "text-yellow-500" : "text-yellow-600"),
                  currentDb === 'garou' && filterAttribute === 'racist' && "text-purple-500"
                )}>
                  SYSTEM STATUS
                </span>
                <div className="flex items-center gap-2.5">
                  {loading && <span className="text-[10px] font-black text-orange-500 animate-pulse uppercase tracking-widest">Updating Array...</span>}
                  <button 
                    onClick={handleDownload}
                    className={cn(
                      "p-2 rounded-xl transition-all shadow-inner border-2",
                      isDark ? "bg-slate-950 border-slate-800 hover:bg-slate-900/50" : "bg-white border-slate-300 hover:bg-slate-50",
                      currentDb === 'vorobey' ? "text-red-500 hover:border-red-500/50" : cn(
                        !filterAttribute && "text-blue-500 hover:border-blue-500/50",
                        filterAttribute === 'cheater' && "text-red-500 hover:border-red-500/50",
                        filterAttribute === 'suspicious' && "text-yellow-500 hover:border-yellow-500/50",
                        filterAttribute === 'racist' && "text-purple-500 hover:border-purple-500/50"
                      )
                    )}
                    title="Download JSON Database"
                  >
                    <Download size={14} strokeWidth={3} />
                  </button>
                  <button 
                    onClick={() => fetchData(true)} 
                    disabled={loading} 
                    className={cn(
                      "p-2 rounded-xl transition-all shadow-inner border-2 hover:rotate-180 duration-500", 
                      isDark ? "bg-slate-950 border-slate-800 hover:bg-slate-900/50" : "bg-white border-slate-300 hover:bg-slate-50", 
                      loading ? "animate-spin text-orange-500 border-orange-500/50" : (
                        currentDb === 'vorobey' ? "text-red-500 hover:border-red-500/50" : cn(
                          !filterAttribute && "text-blue-500 hover:border-blue-500/50",
                          filterAttribute === 'cheater' && "text-red-500 hover:border-red-500/50",
                          filterAttribute === 'suspicious' && "text-yellow-500 hover:border-yellow-500/50",
                          filterAttribute === 'racist' && "text-purple-500 hover:border-purple-500/50"
                        )
                      )
                    )} 
                    title="Manual Refresh"
                  >
                    <RefreshCw size={14} strokeWidth={3} />
                  </button>
                </div>
              </div>
              <div className="flex flex-col gap-2 relative z-10">
                <div className="flex items-center gap-3 justify-center md:justify-end">
                  <div className={cn("w-2 h-2 rounded-full shrink-0", loading ? "bg-orange-500 animate-pulse" : "bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.4)]")} />
                  <span className={cn("text-xs font-black font-mono tracking-tight", isDark ? "text-slate-300" : "text-slate-800")}>
                    SYNCED: {lastFetchTime ? format(lastFetchTime, 'hh:mm:ss a') : 'INITIALIZING...'}
                  </span>
                </div>
                <div className="flex items-center gap-3 justify-center md:justify-end">
                  <span className={cn("text-xs font-black font-mono tracking-tight", isDark ? "text-slate-300" : "text-slate-800")}>
                    DATABASE SIZE: {fileSize || 'CALCULATING...'}
                  </span>
                </div>
                <div className="flex items-center gap-3 justify-center md:justify-end" title="The last time the JSON file was actually changed on GitHub">
                  <span className={cn("text-xs font-black font-mono tracking-tight", isDark ? "text-slate-300" : "text-slate-800")}>
                    {fileLastUpdated ? `MODIFIED: ${format(fileLastUpdated, 'MMM d • hh:mm a')} (${formatDistanceToNow(fileLastUpdated, { addSuffix: true }).toUpperCase()})` : 'CHECKING HISTORY...'}
                  </span>
                </div>
              </div>
              <a href={currentDb === 'garou' ? "https://github.com/Garou3299/tf2bd-database/blob/master/playerlist.garou3299.json" : "https://github.com/Nocrex/Tom/blob/main/playerlist.vorobey-hackerpolice.json"} target="_blank" rel="noopener noreferrer" className="text-[10px] font-black text-blue-500 hover:text-red-600 hover:scale-105 transition-all flex items-center gap-2 justify-center md:justify-end mt-4 pt-4 border-t border-slate-300 dark:border-slate-800 uppercase tracking-widest relative z-10">DATABASE SOURCE<ExternalLink size={12} strokeWidth={3} /></a>
            </div>
            <p className={cn("text-[10px] font-bold opacity-40 uppercase tracking-widest mt-2", isDark ? "text-slate-500" : "text-slate-600")}>DATABASE AUTO-UPDATES EVERY 10 MINUTES</p>
          </div>
        </div>
      </footer>

      {showScrollTop && (
        <motion.button 
          initial={{ opacity: 0, scale: 0.5 }} 
          animate={{ opacity: 1, scale: 1 }} 
          whileHover={{ scale: 1.1, y: -3 }} 
          whileTap={{ scale: 0.9 }} 
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} 
          className={cn(
            "fixed bottom-6 right-6 p-2 rounded-xl shadow-[0_10px_25px_rgba(0,0,0,0.2)] z-[100] transition-all duration-300 group border-2 backdrop-blur-2xl", 
            isDark ? "bg-slate-900/80 text-white" : "bg-white/80 text-slate-900", 
            (currentDb === 'vorobey' || filterAttribute === 'cheater') && "border-red-500 shadow-red-500/10",
            currentDb === 'garou' && !filterAttribute && "border-blue-500 shadow-blue-500/10",
            currentDb === 'garou' && filterAttribute === 'suspicious' && "border-yellow-500 shadow-yellow-500/10",
            currentDb === 'garou' && filterAttribute === 'racist' && "border-purple-500 shadow-purple-500/10"
          )}
        >
          <ChevronUp size={18} strokeWidth={3} className="group-hover:-translate-y-0.5 transition-transform duration-300" />
        </motion.button>
      )}
    </div>
  );
}
