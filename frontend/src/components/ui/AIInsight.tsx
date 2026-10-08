import React, { useState } from 'react';
import { Sparkles, ChevronDown, ChevronUp, Zap } from 'lucide-react';

interface AIInsightProps {
  title?: string;
  insight: string | React.ReactNode;
  confidence?: number;
  loading?: boolean;
  collapsible?: boolean;
  variant?: 'default' | 'warning' | 'success' | 'info';
}

const variantStyles = {
  default: {
    border: 'border-indigo-500/30',
    bg: 'bg-indigo-500/5',
    icon: 'text-indigo-400',
    badge: 'text-indigo-400',
    glow: 'shadow-indigo-500/5',
  },
  warning: {
    border: 'border-amber-500/30',
    bg: 'bg-amber-500/5',
    icon: 'text-amber-400',
    badge: 'text-amber-400',
    glow: 'shadow-amber-500/5',
  },
  success: {
    border: 'border-emerald-500/30',
    bg: 'bg-emerald-500/5',
    icon: 'text-emerald-400',
    badge: 'text-emerald-400',
    glow: 'shadow-emerald-500/5',
  },
  info: {
    border: 'border-cyan-500/30',
    bg: 'bg-cyan-500/5',
    icon: 'text-cyan-400',
    badge: 'text-cyan-400',
    glow: 'shadow-cyan-500/5',
  },
};

export const AIInsight = ({ 
  title = "AI INSIGHT", 
  insight, 
  confidence, 
  loading = false, 
  collapsible = false,
  variant = 'default'
}: AIInsightProps) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const styles = variantStyles[variant];

  return (
    <div className={`glass-panel ${styles.border} ${styles.bg} rounded-xl p-4 my-4 ai-card-reveal ai-gradient-border shadow-lg ${styles.glow}`}>
      <div 
        className={`flex items-center justify-between mb-2 ${collapsible ? 'cursor-pointer' : ''}`}
        onClick={collapsible ? () => setIsExpanded(!isExpanded) : undefined}
      >
        <div className={`flex items-center gap-2 ${styles.icon} font-semibold text-xs tracking-wider`}>
          <Sparkles size={14} className={loading ? "animate-spin" : "animate-pulse"} />
          {title}
          {loading && (
            <span className="flex gap-0.5 ml-1">
              <span className="w-1 h-1 rounded-full bg-current ai-typing-dot"></span>
              <span className="w-1 h-1 rounded-full bg-current ai-typing-dot"></span>
              <span className="w-1 h-1 rounded-full bg-current ai-typing-dot"></span>
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {confidence !== undefined && (
            <div className="text-xs text-base-content/50 ai-badge-pop">
              Confidence: <span className={`${styles.badge} font-medium`}>{confidence}%</span>
            </div>
          )}
          {collapsible && (
            isExpanded ? <ChevronUp size={14} className="text-base-content/40" /> : <ChevronDown size={14} className="text-base-content/40" />
          )}
        </div>
      </div>
      
      {isExpanded && (
        <div className="text-sm text-base-content/80 leading-relaxed animate-in fade-in slide-in-from-top-2 duration-300">
          {loading ? (
            <div className="space-y-2">
              <div className="h-3 bg-base-300/50 rounded-full w-full ai-shimmer"></div>
              <div className="h-3 bg-base-300/50 rounded-full w-3/4 ai-shimmer" style={{ animationDelay: '0.15s' }}></div>
            </div>
          ) : (
            insight
          )}
        </div>
      )}

      {isExpanded && !loading && (
        <div className="flex items-center gap-1.5 mt-3 pt-2 border-t border-base-300/20">
          <Zap size={9} className={styles.icon} />
          <span className={`text-[10px] ${styles.icon} opacity-60`}>Gemini AI Analysis</span>
        </div>
      )}
    </div>
  );
};
