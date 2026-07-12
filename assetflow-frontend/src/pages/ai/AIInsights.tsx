import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Brain, Search, Zap, RefreshCw, AlertTriangle, CheckCircle, Info, TrendingUp } from 'lucide-react';
import { aiService } from '../../services';
import { AIInsight } from '../../types';
import toast from 'react-hot-toast';

const AIInsights: React.FC = () => {
  const queryClient = useQueryClient();
  const [query, setQuery] = useState('');
  const [searchResult, setSearchResult] = useState<string | null>(null);
  const [searching, setSearching] = useState(false);

  const { data: insightsData, isLoading } = useQuery({
    queryKey: ['ai-insights-full'],
    queryFn: aiService.getInsights,
  });

  const { data: healthData } = useQuery({
    queryKey: ['ai-health'],
    queryFn: aiService.getHealthScores,
  });

  const { data: predictData } = useQuery({
    queryKey: ['ai-predictions'],
    queryFn: aiService.getPredictions,
  });

  const insights: AIInsight[] = (insightsData as { data: { data: AIInsight[] } })?.data?.data || [];
  const healthAssets = (healthData as { data: { data: unknown[] } })?.data?.data || [];
  const predictions = (predictData as { data: { data: unknown[] } })?.data?.data || [];

  const handleSearch = async () => {
    if (!query.trim()) return;
    setSearching(true);
    try {
      const res = await aiService.naturalLanguageSearch(query);
      setSearchResult((res as { data: { data: { answer?: string; summary?: string } } }).data?.data?.answer || (res as { data: { data: { summary?: string } } }).data?.data?.summary || 'No results found.');
    } catch {
      toast.error('AI search failed');
    }
    setSearching(false);
  };

  const insightIcon = (type: string) => {
    if (type === 'warning') return <AlertTriangle size={16} className="text-amber-500" />;
    if (type === 'error') return <AlertTriangle size={16} className="text-red-500" />;
    if (type === 'success') return <CheckCircle size={16} className="text-green-500" />;
    return <Info size={16} className="text-blue-500" />;
  };

  const insightBg = (type: string) => {
    if (type === 'warning') return 'bg-amber-50 dark:bg-amber-900/10 border-amber-100 dark:border-amber-800/30';
    if (type === 'error') return 'bg-red-50 dark:bg-red-900/10 border-red-100 dark:border-red-800/30';
    if (type === 'success') return 'bg-green-50 dark:bg-green-900/10 border-green-100 dark:border-green-800/30';
    return 'bg-blue-50 dark:bg-blue-900/10 border-blue-100 dark:border-blue-800/30';
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <Brain className="text-secondary-500" size={22} /> AI Insights
        </h1>
        <p className="text-slate-500 text-sm mt-1">AI-powered analysis and recommendations for your assets</p>
      </div>

      {/* Natural language search */}
      <div className="glass-card p-5">
        <h3 className="font-semibold text-slate-700 dark:text-slate-200 mb-3 text-sm flex items-center gap-2">
          <Zap size={16} className="text-primary-500" /> Ask AI about your assets
        </h3>
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input value={query} onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
              placeholder="e.g. 'Show all laptops in poor condition' or 'Assets with expired warranty'"
              className="w-full pl-9 pr-4 py-2.5 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-primary-400" />
          </div>
          <button onClick={handleSearch} disabled={searching || !query}
            className="px-4 py-2.5 bg-gradient-to-r from-primary-500 to-secondary-500 text-white text-sm font-semibold rounded-lg hover:from-primary-600 disabled:opacity-70 flex items-center gap-2">
            {searching ? <RefreshCw size={14} className="animate-spin" /> : <Brain size={14} />}
            {searching ? 'Analyzing...' : 'Ask AI'}
          </button>
        </div>
        {searchResult && (
          <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-4 bg-primary-50 dark:bg-primary-900/10 border border-primary-100 dark:border-primary-800/30 rounded-lg">
            <p className="text-sm text-primary-800 dark:text-primary-200 whitespace-pre-wrap">{searchResult}</p>
          </motion.div>
        )}
        <div className="mt-3 flex flex-wrap gap-2">
          {['Assets with expired warranty', 'Low health score assets', 'Overdue maintenance', 'Available vehicles'].map(q => (
            <button key={q} onClick={() => { setQuery(q); }}
              className="text-xs px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-full hover:bg-primary-50 dark:hover:bg-primary-900/20 hover:text-primary-600 transition-colors">
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Insights grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Insights list */}
        <div className="glass-card p-5">
          <h3 className="font-semibold text-slate-700 dark:text-slate-200 mb-3 text-sm flex items-center gap-2">
            <TrendingUp size={16} className="text-primary-500" /> Proactive Recommendations
          </h3>
          {isLoading ? <div className="space-y-2">{[1,2,3].map(i => <div key={i} className="h-16 skeleton rounded-lg" />)}</div>
            : insights.length === 0 ? <p className="text-sm text-slate-400 py-4 text-center">All systems healthy ✓</p>
            : (
            <div className="space-y-2">
              {insights.map((ins, i) => (
                <div key={i} className={`flex items-start gap-3 p-3 rounded-lg border ${insightBg(ins.type)}`}>
                  {insightIcon(ins.type)}
                  <p className="text-xs text-slate-700 dark:text-slate-300 flex-1">{ins.message}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Health scores */}
        <div className="glass-card p-5">
          <h3 className="font-semibold text-slate-700 dark:text-slate-200 mb-3 text-sm flex items-center gap-2">
            <Brain size={16} className="text-secondary-500" /> Asset Health Scores
          </h3>
          {healthAssets.length === 0 ? <p className="text-sm text-slate-400 py-4 text-center">No health data available</p>
            : (
            <div className="space-y-2 max-h-64 overflow-y-auto custom-scrollbar">
              {(healthAssets as { name: string; healthScore: number; assetId: string }[]).slice(0, 10).map((a, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="flex-1">
                    <p className="text-xs font-medium text-slate-700 dark:text-slate-300">{a.name}</p>
                    <p className="text-[10px] text-slate-400">{a.assetId}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-20 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${a.healthScore >= 80 ? 'bg-green-500' : a.healthScore >= 60 ? 'bg-yellow-500' : 'bg-red-500'}`}
                        style={{ width: `${a.healthScore}%` }} />
                    </div>
                    <span className={`text-xs font-bold ${a.healthScore >= 80 ? 'text-green-600' : a.healthScore >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>
                      {a.healthScore}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIInsights;
