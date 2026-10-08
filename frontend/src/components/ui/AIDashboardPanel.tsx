"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Sparkles, Brain, TrendingUp, AlertTriangle, RefreshCw, Zap, ShieldAlert } from 'lucide-react';
import { fetchApi } from '@/lib/api';

interface AIDashboardPanelProps {
  emergencies: any[];
  volunteers: any[];
  resources?: any[];
}

export const AIDashboardPanel = ({ emergencies, volunteers, resources = [] }: AIDashboardPanelProps) => {
  const [insight, setInsight] = useState<string>('');
  const [priorities, setPriorities] = useState<string>('');
  const [prediction, setPrediction] = useState<string>('');
  const [isLoadingInsight, setIsLoadingInsight] = useState(false);
  const [isLoadingPriorities, setIsLoadingPriorities] = useState(false);
  const [isLoadingPrediction, setIsLoadingPrediction] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchInsight = useCallback(async () => {
    if (emergencies.length === 0 && volunteers.length === 0) return;
    setIsLoadingInsight(true);
    try {
      const res = await fetchApi<{ insight: string }>('/ai/dashboard-insights', {
        method: 'POST',
        body: JSON.stringify({ emergencies, volunteers, resources })
      });
      setInsight(res.insight);
      setLastUpdated(new Date());
    } catch {
      setInsight('Unable to generate insights at this time.');
    } finally {
      setIsLoadingInsight(false);
    }
  }, [emergencies, volunteers, resources]);

  const fetchPriorities = useCallback(async () => {
    if (emergencies.length === 0) return;
    setIsLoadingPriorities(true);
    try {
      const res = await fetchApi<{ priorities: string }>('/ai/emergency-priorities', {
        method: 'POST',
        body: JSON.stringify({ emergencies })
      });
      setPriorities(res.priorities);
    } catch {
      setPriorities('Unable to rank priorities.');
    } finally {
      setIsLoadingPriorities(false);
    }
  }, [emergencies]);

  const fetchPrediction = useCallback(async () => {
    if (resources.length === 0) return;
    setIsLoadingPrediction(true);
    try {
      const res = await fetchApi<{ prediction: string }>('/ai/resource-prediction', {
        method: 'POST',
        body: JSON.stringify({ resources })
      });
      setPrediction(res.prediction);
    } catch {
      setPrediction('Unable to predict resource shortages.');
    } finally {
      setIsLoadingPrediction(false);
    }
  }, [resources]);

  const runAllAnalysis = useCallback(() => {
    fetchInsight();
    fetchPriorities();
    fetchPrediction();
  }, [fetchInsight, fetchPriorities, fetchPrediction]);

  useEffect(() => {
    if (emergencies.length > 0 || volunteers.length > 0) {
      runAllAnalysis();
    }
  }, [emergencies.length, volunteers.length]);

  const ShimmerLoader = () => (
    <div className="space-y-2">
      <div className="h-3 bg-base-300/50 rounded-full w-full ai-shimmer"></div>
      <div className="h-3 bg-base-300/50 rounded-full w-4/5 ai-shimmer" style={{ animationDelay: '0.15s' }}></div>
      <div className="h-3 bg-base-300/50 rounded-full w-3/5 ai-shimmer" style={{ animationDelay: '0.3s' }}></div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-500/10 ai-glow">
            <Brain size={22} className="text-indigo-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight text-base-content/90">AI Intelligence Center</h2>
            <p className="text-xs text-base-content/50 mt-0.5">
              {lastUpdated ? `Last updated ${lastUpdated.toLocaleTimeString()}` : 'Initializing AI analysis...'}
            </p>
          </div>
        </div>
        <button
          onClick={runAllAnalysis}
          disabled={isLoadingInsight || isLoadingPriorities || isLoadingPrediction}
          className="btn btn-sm bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 hover:bg-indigo-500 hover:text-white transition-all gap-2 group"
        >
          <RefreshCw size={14} className={`group-hover:rotate-180 transition-transform duration-500 ${(isLoadingInsight || isLoadingPriorities || isLoadingPrediction) ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Three AI panels in a grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

        {/* Situation Overview */}
        <div className="glass-panel ai-gradient-border rounded-2xl p-5 ai-card-reveal ai-stagger-1 flex flex-col">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-1.5 rounded-lg bg-emerald-500/10">
              <Sparkles size={16} className="text-emerald-400" />
            </div>
            <h3 className="text-sm font-semibold text-base-content/80 uppercase tracking-wider">Situation Overview</h3>
          </div>
          <div className="flex-1">
            {isLoadingInsight ? (
              <ShimmerLoader />
            ) : (
              <p className="text-sm text-base-content/70 leading-relaxed whitespace-pre-wrap">{insight}</p>
            )}
          </div>
          <div className="mt-4 pt-3 border-t border-base-300/30">
            <div className="flex items-center gap-1.5 text-xs text-emerald-400/70">
              <Zap size={10} />
              <span>Powered by Gemini AI</span>
            </div>
          </div>
        </div>

        {/* Emergency Priority Ranking */}
        <div className="glass-panel ai-gradient-border rounded-2xl p-5 ai-card-reveal ai-stagger-2 flex flex-col">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-1.5 rounded-lg bg-rose-500/10">
              <ShieldAlert size={16} className="text-rose-400" />
            </div>
            <h3 className="text-sm font-semibold text-base-content/80 uppercase tracking-wider">Priority Ranking</h3>
          </div>
          <div className="flex-1">
            {isLoadingPriorities ? (
              <ShimmerLoader />
            ) : priorities ? (
              <div className="text-sm text-base-content/70 leading-relaxed whitespace-pre-wrap">{priorities}</div>
            ) : (
              <p className="text-sm text-base-content/50 italic">No emergencies to prioritize.</p>
            )}
          </div>
          <div className="mt-4 pt-3 border-t border-base-300/30">
            <div className="flex items-center gap-1.5 text-xs text-rose-400/70">
              <AlertTriangle size={10} />
              <span>{emergencies.length} incidents analyzed</span>
            </div>
          </div>
        </div>

        {/* Resource Shortage Prediction */}
        <div className="glass-panel ai-gradient-border rounded-2xl p-5 ai-card-reveal ai-stagger-3 flex flex-col">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-1.5 rounded-lg bg-amber-500/10">
              <TrendingUp size={16} className="text-amber-400" />
            </div>
            <h3 className="text-sm font-semibold text-base-content/80 uppercase tracking-wider">Resource Forecast</h3>
          </div>
          <div className="flex-1">
            {isLoadingPrediction ? (
              <ShimmerLoader />
            ) : prediction ? (
              <p className="text-sm text-base-content/70 leading-relaxed whitespace-pre-wrap">{prediction}</p>
            ) : (
              <p className="text-sm text-base-content/50 italic">No resource data available.</p>
            )}
          </div>
          <div className="mt-4 pt-3 border-t border-base-300/30">
            <div className="flex items-center gap-1.5 text-xs text-amber-400/70">
              <TrendingUp size={10} />
              <span>Predictive analysis</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
