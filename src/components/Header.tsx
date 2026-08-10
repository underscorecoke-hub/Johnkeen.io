import React from 'react';
import {
  Workflow,
  Play,
  Key,
  RotateCcw,
  Sparkles,
  Zap,
  LayoutGrid,
  ShieldCheck,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { PRESET_WORKFLOWS } from '../data/presetWorkflows';
import { ApiVaultKeys } from '../types';

interface HeaderProps {
  onLoadPreset: (presetId: string) => void;
  onOpenVault: () => void;
  onRunWorkflow: () => void;
  onResetCanvas: () => void;
  onAutoLayout: () => void;
  isRunning: boolean;
  vaultKeys: ApiVaultKeys;
}

export const Header: React.FC<HeaderProps> = ({
  onLoadPreset,
  onOpenVault,
  onRunWorkflow,
  onResetCanvas,
  onAutoLayout,
  isRunning,
  vaultKeys,
}) => {
  const configuredKeysCount = Object.values(vaultKeys).filter((v) => typeof v === 'string' && Boolean(v.trim())).length;

  return (
    <header className="h-16 border-b border-slate-800 bg-slate-950/90 backdrop-blur-md px-4 flex items-center justify-between z-20">
      {/* Brand & App Title */}
      <div className="flex items-center space-x-3">
        <div className="p-2 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 text-white shadow-lg shadow-indigo-500/20">
          <Workflow className="w-5 h-5" />
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="font-bold text-slate-100 text-base tracking-tight">
              Visual Node Studio
            </h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center gap-1">
              <Zap className="w-3 h-3 text-amber-400" />
              Pimlico $0-Gas
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-purple-400" />
              Gemini AI
            </span>
          </div>
          <p className="text-[11px] text-slate-400">
            Web3 DAG Engine & Gasless Flash Loan Automation
          </p>
        </div>
      </div>

      {/* Control Actions */}
      <div className="flex items-center space-x-3">
        {/* Preset Selector */}
        <div className="relative">
          <select
            onChange={(e) => {
              if (e.target.value) {
                onLoadPreset(e.target.value);
                e.target.value = '';
              }
            }}
            defaultValue=""
            className="bg-slate-900 border border-slate-700 hover:border-slate-600 text-slate-200 text-xs rounded-lg px-3 py-2 pr-8 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer transition-colors"
          >
            <option value="" disabled>
              ⚡ Load Preset Template...
            </option>
            {PRESET_WORKFLOWS.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title}
              </option>
            ))}
          </select>
        </div>

        {/* Auto Layout */}
        <button
          onClick={onAutoLayout}
          className="p-2 rounded-lg bg-slate-900 border border-slate-700 hover:border-slate-600 text-slate-300 hover:text-white text-xs flex items-center space-x-1.5 transition-colors"
          title="Auto arrange visual node grid"
        >
          <LayoutGrid className="w-4 h-4 text-slate-400" />
          <span className="hidden sm:inline">Auto Layout</span>
        </button>

        {/* API Vault Button */}
        <button
          onClick={onOpenVault}
          className="px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 hover:border-slate-600 text-slate-200 text-xs flex items-center space-x-2 transition-colors relative"
        >
          <Key className="w-4 h-4 text-amber-400" />
          <span>API Vault</span>
          {configuredKeysCount > 0 ? (
            <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-500/20 text-emerald-300 font-mono border border-emerald-500/30">
              {configuredKeysCount} keys
            </span>
          ) : (
            <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-slate-800 text-slate-400">
              0 configured
            </span>
          )}
        </button>

        {/* Reset Canvas */}
        <button
          onClick={onResetCanvas}
          className="p-2 rounded-lg bg-slate-900 border border-slate-700 hover:border-slate-600 text-slate-400 hover:text-rose-400 transition-colors"
          title="Clear all nodes"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        {/* Run / Execute Workflow Button */}
        <button
          onClick={onRunWorkflow}
          disabled={isRunning}
          className={`px-4 py-2 rounded-lg font-semibold text-xs text-white flex items-center space-x-2 shadow-lg transition-all ${
            isRunning
              ? 'bg-amber-600/80 cursor-wait animate-pulse'
              : 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 shadow-emerald-500/20 cursor-pointer active:scale-95'
          }`}
        >
          {isRunning ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Executing DAG...</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-current" />
              <span>Run Workflow</span>
            </>
          )}
        </button>
      </div>
    </header>
  );
};
