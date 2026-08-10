import React, { useState } from 'react';
import { Sparkles, ArrowRight, Wand2, Loader2, Lightbulb } from 'lucide-react';

interface CopilotPromptBarProps {
  onGenerateGraph: (prompt: string) => Promise<void>;
  isGenerating: boolean;
}

const SAMPLE_PROMPTS = [
  'Connect Telegram trigger to Balancer Flash Loan using Pimlico Zero-Gas Paymaster and notify me in Telegram',
  'Build 1inch DEX arbitrage bot with Gemini AI opportunity analysis and $0 gas execution',
  'Create Webhook trigger with Gemini AI market sentiment filter and output Telegram alert',
];

export const CopilotPromptBar: React.FC<CopilotPromptBarProps> = ({
  onGenerateGraph,
  isGenerating,
}) => {
  const [prompt, setPrompt] = useState('');
  const [showSamples, setShowSamples] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isGenerating) return;
    onGenerateGraph(prompt);
  };

  const handleSelectSample = (sample: string) => {
    setPrompt(sample);
    setShowSamples(false);
    onGenerateGraph(sample);
  };

  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 w-full max-w-2xl px-4 pointer-events-auto">
      <div className="relative rounded-2xl bg-slate-900/90 backdrop-blur-xl border border-indigo-500/30 p-2 shadow-2xl shadow-indigo-950/50">
        <form onSubmit={handleSubmit} className="flex items-center space-x-2">
          <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>

          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Type prompt (e.g., 'Connect Telegram trigger to Balancer Flash Loan using Pimlico Paymaster')..."
            className="flex-1 bg-transparent text-slate-100 text-xs sm:text-sm placeholder-slate-400 focus:outline-none px-2 py-1"
            disabled={isGenerating}
          />

          <button
            type="button"
            onClick={() => setShowSamples(!showSamples)}
            className="p-2 text-slate-400 hover:text-slate-200 transition-colors text-xs flex items-center space-x-1"
            title="Sample AI Prompts"
          >
            <Lightbulb className="w-4 h-4 text-amber-400" />
            <span className="hidden sm:inline text-[11px]">Ideas</span>
          </button>

          <button
            type="submit"
            disabled={!prompt.trim() || isGenerating}
            className={`px-4 py-2 rounded-xl text-xs font-semibold text-white flex items-center space-x-1.5 transition-all ${
              !prompt.trim() || isGenerating
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:brightness-110 shadow-lg shadow-indigo-500/20 active:scale-95 cursor-pointer'
            }`}
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>AI Building...</span>
              </>
            ) : (
              <>
                <Wand2 className="w-4 h-4" />
                <span>Generate Graph</span>
              </>
            )}
          </button>
        </form>

        {/* Preset Prompt Suggestions Dropdown */}
        {showSamples && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-slate-900 border border-slate-700 rounded-xl p-3 shadow-2xl space-y-2 z-30">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center justify-between">
              <span>Suggested Workflow Prompts</span>
              <button
                onClick={() => setShowSamples(false)}
                className="text-slate-500 hover:text-slate-300 text-xs"
              >
                Close
              </button>
            </div>
            <div className="space-y-1.5">
              {SAMPLE_PROMPTS.map((sample, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelectSample(sample)}
                  className="w-full text-left p-2 rounded-lg bg-slate-950/60 hover:bg-indigo-950/50 hover:border-indigo-500/40 border border-slate-800 text-xs text-slate-200 transition-colors flex items-center justify-between group"
                >
                  <span className="truncate pr-2">{sample}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
