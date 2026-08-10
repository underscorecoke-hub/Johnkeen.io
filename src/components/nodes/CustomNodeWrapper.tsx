import React from 'react';
import { Handle, Position } from '@xyflow/react';
import {
  Send,
  Webhook,
  Sparkles,
  TrendingUp,
  Coins,
  Zap,
  MessageSquare,
  ExternalLink,
  Settings2,
  CheckCircle2,
  XCircle,
  Loader2,
  Play
} from 'lucide-react';
import { NODE_REGISTRY } from '../../data/nodeRegistry';
import { WorkflowNodeData } from '../../types';

interface CustomNodeWrapperProps {
  id: string;
  data: WorkflowNodeData;
  selected?: boolean;
  onOpenConfig?: (id: string) => void;
}

const ICON_MAP: Record<string, React.FC<{ className?: string }>> = {
  Send,
  Webhook,
  Sparkles,
  TrendingUp,
  Coins,
  Zap,
  MessageSquare,
  ExternalLink,
};

export const CustomNodeWrapper: React.FC<CustomNodeWrapperProps> = ({
  id,
  data,
  selected,
  onOpenConfig,
}) => {
  const meta = NODE_REGISTRY[data.nodeType] || {
    label: data.label || 'Custom Node',
    iconName: 'Sparkles',
    color: 'from-gray-700/30 to-gray-800/30',
    borderColor: 'border-gray-600',
    inputs: [{ id: 'in', label: 'Input', type: 'any' }],
    outputs: [{ id: 'out', label: 'Output', type: 'any' }],
  };

  const Icon = ICON_MAP[meta.iconName] || Sparkles;
  const status = data.status || 'idle';

  // Status border styles
  let statusBorder = meta.borderColor;
  let statusGlow = '';
  if (status === 'running') {
    statusBorder = 'border-amber-400 ring-2 ring-amber-400/50';
    statusGlow = 'animate-pulse shadow-[0_0_20px_rgba(251,191,36,0.3)]';
  } else if (status === 'success') {
    statusBorder = 'border-emerald-500 ring-2 ring-emerald-500/30';
    statusGlow = 'shadow-[0_0_18px_rgba(16,185,129,0.25)]';
  } else if (status === 'error') {
    statusBorder = 'border-rose-500 ring-2 ring-rose-500/40';
    statusGlow = 'shadow-[0_0_18px_rgba(244,63,94,0.3)]';
  } else if (selected) {
    statusBorder = 'border-indigo-400 ring-2 ring-indigo-400/50';
  }

  return (
    <div
      className={`relative min-w-[260px] max-w-[310px] rounded-xl border bg-slate-900/90 backdrop-blur-md text-slate-100 shadow-2xl transition-all duration-200 ${statusBorder} ${statusGlow}`}
    >
      {/* Category Header Bar */}
      <div
        className={`flex items-center justify-between px-3 py-2 rounded-t-xl bg-gradient-to-r ${meta.color} border-b border-slate-800`}
      >
        <div className="flex items-center space-x-2 truncate">
          <div className="p-1 rounded-lg bg-slate-950/60 text-slate-200 border border-slate-700/50">
            <Icon className="w-4 h-4 text-slate-200" />
          </div>
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-200 truncate">
            {meta.label}
          </span>
        </div>

        <div className="flex items-center space-x-1">
          {/* Status Badge */}
          {status === 'running' && (
            <span className="flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono bg-amber-500/20 text-amber-300 border border-amber-500/30">
              <Loader2 className="w-3 h-3 animate-spin mr-1" />
              RUNNING
            </span>
          )}
          {status === 'success' && (
            <span className="flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              <CheckCircle2 className="w-3 h-3 mr-1" />
              OK
            </span>
          )}
          {status === 'error' && (
            <span className="flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono bg-rose-500/20 text-rose-300 border border-rose-500/30">
              <XCircle className="w-3 h-3 mr-1" />
              FAIL
            </span>
          )}
          {status === 'idle' && (
            <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-400 border border-slate-700">
              IDLE
            </span>
          )}

          {/* Settings button */}
          <button
            onClick={() => onOpenConfig?.(id)}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Configure Node Parameters"
          >
            <Settings2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Node Content Body */}
      <div className="p-3 text-xs space-y-2">
        {/* Dynamic Key Configuration Previews */}
        <div className="bg-slate-950/80 rounded-lg p-2 font-mono text-[11px] text-slate-300 space-y-1 border border-slate-800/80">
          {Object.entries(data.config || {})
            .slice(0, 3)
            .map(([key, value]) => {
              const valStr = typeof value === 'object' ? JSON.stringify(value) : String(value);
              return (
                <div key={key} className="flex items-center justify-between gap-2 truncate">
                  <span className="text-slate-500 text-[10px]">{key}:</span>
                  <span className="text-indigo-300 truncate max-w-[170px]" title={valStr}>
                    {valStr || '<empty>'}
                  </span>
                </div>
              );
            })}
        </div>

        {/* Execution Output Preview if available */}
        {data.lastOutput && (
          <div className="bg-emerald-950/40 border border-emerald-800/50 rounded-lg p-2 text-[10px] font-mono text-emerald-300 truncate">
            <span className="text-emerald-500 font-semibold mr-1">out:</span>
            {JSON.stringify(data.lastOutput)}
          </div>
        )}

        {/* Execution Error Preview */}
        {data.errorMsg && (
          <div className="bg-rose-950/50 border border-rose-800/60 rounded-lg p-2 text-[10px] font-mono text-rose-300">
            <span className="text-rose-400 font-semibold mr-1">err:</span>
            {data.errorMsg}
          </div>
        )}
      </div>

      {/* Input Handles (Left Side) */}
      {meta.inputs.map((inp, idx) => (
        <React.Fragment key={inp.id}>
          <Handle
            type="target"
            position={Position.Left}
            id={inp.id}
            style={{
              top: `${((idx + 1) * 100) / (meta.inputs.length + 1)}%`,
              background: '#38bdf8',
              width: '10px',
              height: '10px',
              border: '2px solid #0f172a',
            }}
          />
          <div
            className="absolute text-[9px] font-mono text-slate-400 pointer-events-none"
            style={{
              left: '12px',
              top: `calc(${((idx + 1) * 100) / (meta.inputs.length + 1)}% - 6px)`,
            }}
          >
            {inp.label}
          </div>
        </React.Fragment>
      ))}

      {/* Output Handles (Right Side) */}
      {meta.outputs.map((out, idx) => (
        <React.Fragment key={out.id}>
          <Handle
            type="source"
            position={Position.Right}
            id={out.id}
            style={{
              top: `${((idx + 1) * 100) / (meta.outputs.length + 1)}%`,
              background: '#10b981',
              width: '10px',
              height: '10px',
              border: '2px solid #0f172a',
            }}
          />
          <div
            className="absolute text-[9px] font-mono text-slate-400 pointer-events-none"
            style={{
              right: '12px',
              top: `calc(${((idx + 1) * 100) / (meta.outputs.length + 1)}% - 6px)`,
            }}
          >
            {out.label}
          </div>
        </React.Fragment>
      ))}
    </div>
  );
};
