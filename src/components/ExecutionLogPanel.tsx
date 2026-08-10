import React, { useState } from 'react';
import {
  Terminal,
  ChevronUp,
  ChevronDown,
  CheckCircle2,
  XCircle,
  Clock,
  Code2,
  Trash2,
  Zap,
  Activity
} from 'lucide-react';
import { ExecutionLogItem } from '../types';

interface ExecutionLogPanelProps {
  logs: ExecutionLogItem[];
  totalDurationMs?: number;
  isRunning: boolean;
  onClearLogs: () => void;
}

export const ExecutionLogPanel: React.FC<ExecutionLogPanelProps> = ({
  logs,
  totalDurationMs,
  isRunning,
  onClearLogs,
}) => {
  const [expanded, setExpanded] = useState(true);
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

  const toggleJsonData = (id: string) => {
    setExpandedLogId(expandedLogId === id ? null : id);
  };

  const hasError = logs.some((l) => l.status === 'error');
  const successCount = logs.filter((l) => l.status === 'success').length;

  return (
    <div className="border-t border-slate-800 bg-slate-950/95 backdrop-blur-md text-slate-200 z-20 flex flex-col transition-all duration-300">
      {/* Header Bar */}
      <div className="h-10 px-4 flex items-center justify-between border-b border-slate-800/80 bg-slate-900/60">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center space-x-2 text-xs font-semibold text-slate-200 hover:text-white transition-colors"
          >
            <Terminal className="w-4 h-4 text-emerald-400" />
            <span>Workflow Execution Console</span>
            {logs.length > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-slate-800 text-slate-300 border border-slate-700">
                {logs.length} steps
              </span>
            )}
          </button>

          {isRunning && (
            <span className="flex items-center text-[11px] font-mono text-amber-400 animate-pulse gap-1">
              <Activity className="w-3.5 h-3.5" /> Running DAG topological engine...
            </span>
          )}

          {!isRunning && logs.length > 0 && (
            <div className="flex items-center space-x-2 text-[11px] font-mono">
              {hasError ? (
                <span className="text-rose-400 flex items-center gap-1">
                  <XCircle className="w-3.5 h-3.5" /> Execution Failed
                </span>
              ) : (
                <span className="text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Workflow Completed ({successCount}/{logs.length} steps)
                </span>
              )}
              {totalDurationMs !== undefined && (
                <span className="text-slate-500 flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {totalDurationMs}ms
                </span>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center space-x-2">
          {logs.length > 0 && (
            <button
              onClick={onClearLogs}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors text-xs flex items-center gap-1"
              title="Clear Logs"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            onClick={() => setExpanded(!expanded)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            {expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Expanded Logs Content */}
      {expanded && (
        <div className="max-h-56 overflow-y-auto p-3 space-y-2 font-mono text-xs">
          {logs.length === 0 ? (
            <div className="py-6 text-center text-slate-500 text-xs italic">
              No execution logs yet. Click "Run Workflow" or test an AI prompt above.
            </div>
          ) : (
            logs.map((log) => {
              const isDetailsOpen = expandedLogId === log.id;

              return (
                <div
                  key={log.id}
                  className={`rounded-lg p-2.5 border transition-all ${
                    log.status === 'success'
                      ? 'bg-emerald-950/20 border-emerald-900/40 text-emerald-200'
                      : log.status === 'error'
                      ? 'bg-rose-950/30 border-rose-900/50 text-rose-200'
                      : 'bg-amber-950/20 border-amber-900/40 text-amber-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 truncate">
                      {log.status === 'success' && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      )}
                      {log.status === 'error' && (
                        <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                      )}
                      {log.status === 'running' && (
                        <div className="w-3.5 h-3.5 border-2 border-amber-400/30 border-t-amber-400 rounded-full animate-spin shrink-0" />
                      )}

                      <span className="font-semibold text-slate-100">{log.nodeLabel}</span>
                      <span className="text-[10px] text-slate-400">({log.timestamp})</span>
                      <span className="text-slate-300 truncate">{log.message}</span>
                    </div>

                    <div className="flex items-center space-x-3 shrink-0">
                      {log.durationMs !== undefined && (
                        <span className="text-[10px] text-slate-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {log.durationMs}ms
                        </span>
                      )}

                      {(log.inputData || log.outputData) && (
                        <button
                          onClick={() => toggleJsonData(log.id)}
                          className="px-2 py-0.5 rounded bg-slate-900 hover:bg-slate-800 text-[10px] text-indigo-300 border border-slate-700 flex items-center gap-1"
                        >
                          <Code2 className="w-3 h-3" />
                          <span>{isDetailsOpen ? 'Hide Payload' : 'View Payload'}</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* JSON Payload Inspector */}
                  {isDetailsOpen && (
                    <div className="mt-2 pt-2 border-t border-slate-800 grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px]">
                      {log.inputData && (
                        <div className="bg-slate-950 p-2 rounded border border-slate-800 overflow-x-auto">
                          <span className="text-slate-500 font-semibold block mb-1">
                            Input Payload:
                          </span>
                          <pre className="text-sky-300">
                            {JSON.stringify(log.inputData, null, 2)}
                          </pre>
                        </div>
                      )}

                      {log.outputData && (
                        <div className="bg-slate-950 p-2 rounded border border-slate-800 overflow-x-auto">
                          <span className="text-emerald-500 font-semibold block mb-1">
                            Step Output Result:
                          </span>
                          <pre className="text-emerald-300">
                            {JSON.stringify(log.outputData, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};
