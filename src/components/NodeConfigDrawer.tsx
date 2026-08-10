import React, { useState, useEffect } from 'react';
import { X, Save, Sliders, Info, Trash2 } from 'lucide-react';
import { NODE_REGISTRY } from '../data/nodeRegistry';
import { WorkflowNodeData } from '../types';

interface NodeConfigDrawerProps {
  nodeId: string | null;
  nodeData: WorkflowNodeData | null;
  onSaveConfig: (nodeId: string, newConfig: Record<string, any>) => void;
  onDeleteNode: (nodeId: string) => void;
  onClose: () => void;
}

export const NodeConfigDrawer: React.FC<NodeConfigDrawerProps> = ({
  nodeId,
  nodeData,
  onSaveConfig,
  onDeleteNode,
  onClose,
}) => {
  const [formData, setFormData] = useState<Record<string, any>>({});

  useEffect(() => {
    if (nodeData) {
      setFormData(nodeData.config || {});
    }
  }, [nodeData]);

  if (!nodeId || !nodeData) return null;

  const meta = NODE_REGISTRY[nodeData.nodeType] || {
    label: nodeData.label,
    description: 'Configure node settings',
  };

  const handleFieldChange = (key: string, value: any) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveConfig(nodeId, formData);
    onClose();
  };

  return (
    <div className="fixed inset-y-0 right-0 z-30 w-full max-w-md bg-slate-950 border-l border-slate-800 shadow-2xl flex flex-col text-slate-100">
      {/* Header */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
        <div className="flex items-center space-x-2">
          <Sliders className="w-4 h-4 text-indigo-400" />
          <h2 className="font-bold text-sm text-slate-100">{meta.label}</h2>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Description */}
      <div className="p-3 bg-indigo-950/30 border-b border-indigo-900/40 text-xs text-indigo-200 flex items-start space-x-2">
        <Info className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
        <p>{meta.description}</p>
      </div>

      {/* Form Fields */}
      <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 space-y-4">
        {Object.entries(formData).map(([key, val]) => {
          const isLongText = typeof val === 'string' && (val.length > 50 || key.toLowerCase().includes('prompt') || key.toLowerCase().includes('format'));

          return (
            <div key={key} className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300 capitalize flex items-center justify-between">
                <span>{key.replace(/([A-Z])/g, ' $1')}</span>
                <span className="text-[10px] font-mono text-slate-500">{typeof val}</span>
              </label>

              {isLongText ? (
                <textarea
                  rows={4}
                  value={String(val)}
                  onChange={(e) => handleFieldChange(key, e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs font-mono text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              ) : (
                <input
                  type={typeof val === 'number' ? 'number' : 'text'}
                  value={String(val)}
                  onChange={(e) =>
                    handleFieldChange(
                      key,
                      typeof val === 'number' ? Number(e.target.value) : e.target.value
                    )
                  }
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs font-mono text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              )}
            </div>
          );
        })}

        <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
          <button
            type="button"
            onClick={() => {
              onDeleteNode(nodeId);
              onClose();
            }}
            className="px-3 py-2 rounded-lg bg-rose-950/50 hover:bg-rose-900/80 border border-rose-800 text-rose-300 text-xs flex items-center space-x-1.5 transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete Node</span>
          </button>

          <button
            type="submit"
            className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs flex items-center space-x-1.5 transition-colors cursor-pointer"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Configuration</span>
          </button>
        </div>
      </form>
    </div>
  );
};
