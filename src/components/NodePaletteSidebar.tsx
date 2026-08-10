import React, { useState } from 'react';
import {
  Plus,
  Send,
  Webhook,
  Sparkles,
  TrendingUp,
  Coins,
  Zap,
  MessageSquare,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Layers
} from 'lucide-react';
import { NODE_REGISTRY } from '../data/nodeRegistry';
import { NodeCategory, NodeType } from '../types';

interface NodePaletteSidebarProps {
  onAddNode: (type: NodeType) => void;
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

export const NodePaletteSidebar: React.FC<NodePaletteSidebarProps> = ({ onAddNode }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const nodesList = Object.values(NODE_REGISTRY);

  const filteredNodes = selectedCategory === 'all'
    ? nodesList
    : nodesList.filter((n) => n.category === selectedCategory);

  return (
    <div
      className={`relative z-10 border-r border-slate-800 bg-slate-950/95 backdrop-blur-md transition-all duration-300 flex flex-col ${
        collapsed ? 'w-12' : 'w-64'
      }`}
    >
      {/* Collapse toggle button */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-4 p-1 rounded-full bg-slate-900 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors z-20"
      >
        {collapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
      </button>

      {/* Header */}
      <div className="p-3 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Layers className="w-4 h-4 text-indigo-400" />
          {!collapsed && <span className="font-semibold text-xs text-slate-200">Node Palette</span>}
        </div>
      </div>

      {!collapsed && (
        <>
          {/* Category Filters */}
          <div className="p-2 border-b border-slate-800 flex items-center space-x-1 overflow-x-auto text-[11px]">
            {['all', 'trigger', 'ai_data', 'web3_action', 'output'].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-2 py-1 rounded-md capitalize whitespace-nowrap transition-colors ${
                  selectedCategory === cat
                    ? 'bg-indigo-600 text-white font-medium'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                {cat === 'ai_data' ? 'AI / Data' : cat === 'web3_action' ? 'Web3' : cat}
              </button>
            ))}
          </div>

          {/* Node List */}
          <div className="flex-1 overflow-y-auto p-2 space-y-2">
            {filteredNodes.map((item) => {
              const Icon = ICON_MAP[item.iconName] || Sparkles;
              return (
                <div
                  key={item.type}
                  onClick={() => onAddNode(item.type)}
                  className="group relative p-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800/80 border border-slate-800 hover:border-slate-700 transition-all cursor-pointer flex items-start space-x-2.5 shadow-sm"
                >
                  <div className={`p-2 rounded-lg bg-gradient-to-br ${item.color} border border-slate-700/50`}>
                    <Icon className="w-4 h-4 text-slate-200" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-slate-200 truncate group-hover:text-indigo-300">
                        {item.label}
                      </span>
                      <Plus className="w-3.5 h-3.5 text-slate-500 group-hover:text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <p className="text-[10px] text-slate-400 line-clamp-2 mt-0.5 leading-tight">
                      {item.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {collapsed && (
        <div className="flex-1 overflow-y-auto p-2 space-y-3 flex flex-col items-center">
          {nodesList.map((item) => {
            const Icon = ICON_MAP[item.iconName] || Sparkles;
            return (
              <button
                key={item.type}
                onClick={() => onAddNode(item.type)}
                className={`p-2 rounded-lg bg-gradient-to-br ${item.color} border border-slate-700 hover:scale-105 transition-transform`}
                title={item.label}
              >
                <Icon className="w-4 h-4 text-slate-200" />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
