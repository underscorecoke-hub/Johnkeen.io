import React, { useState, useCallback, useEffect } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node,
  ReactFlowProvider,
  BackgroundVariant,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { Header } from './components/Header';
import { CopilotPromptBar } from './components/CopilotPromptBar';
import { NodePaletteSidebar } from './components/NodePaletteSidebar';
import { NodeConfigDrawer } from './components/NodeConfigDrawer';
import { ApiVaultModal } from './components/ApiVaultModal';
import { ExecutionLogPanel } from './components/ExecutionLogPanel';
import { nodeTypes } from './components/nodes/nodeTypes';
import { PRESET_WORKFLOWS } from './data/presetWorkflows';
import { NODE_REGISTRY } from './data/nodeRegistry';
import { ApiVaultKeys, ExecutionLogItem, NodeType, WorkflowNodeData } from './types';

const INITIAL_VAULT_KEYS: ApiVaultKeys = {
  nvidiaApiKey: '',
  telegramBotToken: '',
  telegramChatId: '@crypto_alerts_channel',
  oneInchApiKey: '',
  geminiApiKey: '',
  walletAddress: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
  walletPrivateKey: '',
  pimlicoApiKey: 'https://api.pimlico.io/v2/base/rpc',
  webhookUrl: 'https://api.mybot.com/webhook',
  preferredModel: 'gemini-3.6-flash',
};

const DEFAULT_WORKFLOW = PRESET_WORKFLOWS[0];

function AppContent() {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>(
    DEFAULT_WORKFLOW.nodes as Node[]
  );
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>(
    DEFAULT_WORKFLOW.edges
  );

  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [isVaultOpen, setIsVaultOpen] = useState(false);
  const [isGeneratingGraph, setIsGeneratingGraph] = useState(false);
  const [isRunningWorkflow, setIsRunningWorkflow] = useState(false);

  const [vaultKeys, setVaultKeys] = useState<ApiVaultKeys>(() => {
    const saved = localStorage.getItem('visual_node_vault');
    return saved ? JSON.parse(saved) : INITIAL_VAULT_KEYS;
  });

  const [executionLogs, setExecutionLogs] = useState<ExecutionLogItem[]>([]);
  const [totalDurationMs, setTotalDurationMs] = useState<number | undefined>(undefined);

  // Save Vault keys to local storage
  const handleSaveVaultKeys = (newKeys: ApiVaultKeys) => {
    setVaultKeys(newKeys);
    localStorage.setItem('visual_node_vault', JSON.stringify(newKeys));
  };

  // Connect handles
  const onConnect = useCallback(
    (params: Connection) =>
      setEdges((eds) =>
        addEdge(
          {
            ...params,
            animated: true,
          },
          eds
        )
      ),
    [setEdges]
  );

  // Handle Node Click
  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    setSelectedNodeId(node.id);
  }, []);

  // Handle Adding New Node manually from Palette
  const handleAddNode = (type: NodeType) => {
    const registryItem = NODE_REGISTRY[type];
    const newId = `node-${type}-${Date.now().toString().slice(-4)}`;

    const newNode: Node = {
      id: newId,
      type,
      position: {
        x: 250 + (nodes.length * 40) % 400,
        y: 150 + (nodes.length * 30) % 300,
      },
      data: {
        label: registryItem ? registryItem.label : type,
        category: registryItem ? registryItem.category : 'trigger',
        nodeType: type,
        status: 'idle',
        config: registryItem ? { ...registryItem.defaultConfig } : {},
      },
    };

    setNodes((nds) => [...nds, newNode]);
  };

  // Load Preset Workflow
  const handleLoadPreset = (presetId: string) => {
    const preset = PRESET_WORKFLOWS.find((p) => p.id === presetId);
    if (preset) {
      setNodes(preset.nodes as Node[]);
      setEdges(preset.edges);
      setExecutionLogs([]);
      setSelectedNodeId(null);
    }
  };

  // Auto Layout Nodes horizontally
  const handleAutoLayout = () => {
    setNodes((nds) =>
      nds.map((n, idx) => ({
        ...n,
        position: {
          x: 50 + idx * 330,
          y: 150 + (idx % 2 === 0 ? 0 : 60),
        },
      }))
    );
  };

  // Clear Canvas
  const handleResetCanvas = () => {
    setNodes([]);
    setEdges([]);
    setExecutionLogs([]);
    setSelectedNodeId(null);
  };

  // Save Node Configuration from Drawer
  const handleSaveNodeConfig = (nodeId: string, newConfig: Record<string, any>) => {
    setNodes((nds) =>
      nds.map((n) => {
        if (n.id === nodeId) {
          return {
            ...n,
            data: {
              ...n.data,
              config: newConfig,
            },
          };
        }
        return n;
      })
    );
  };

  // Delete Node
  const handleDeleteNode = (nodeId: string) => {
    setNodes((nds) => nds.filter((n) => n.id !== nodeId));
    setEdges((eds) => eds.filter((e) => e.source !== nodeId && e.target !== nodeId));
    if (selectedNodeId === nodeId) setSelectedNodeId(null);
  };

  // AI Graph Generation via Gemini or NVIDIA NIM
  const handleGenerateGraph = async (promptText: string, modelOverride?: string) => {
    setIsGeneratingGraph(true);
    try {
      const chosenModel = modelOverride || vaultKeys.preferredModel || 'gemini-3.6-flash';
      const res = await fetch('/api/generate-graph', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: promptText,
          model: chosenModel,
          apiVaultKeys: vaultKeys,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to generate graph');
      }

      const graphData = await res.json();
      if (graphData.nodes && Array.isArray(graphData.nodes)) {
        setNodes(graphData.nodes);
        setEdges(graphData.edges || []);
        setExecutionLogs([]);
      }
    } catch (err: any) {
      alert(`AI Graph Generation Error: ${err.message}`);
    } finally {
      setIsGeneratingGraph(false);
    }
  };

  // Run Workflow Execution Engine
  const handleRunWorkflow = async () => {
    if (nodes.length === 0) {
      alert('Canvas is empty! Add nodes or load a preset first.');
      return;
    }

    setIsRunningWorkflow(true);

    // Reset node statuses to 'running' visually
    setNodes((nds) =>
      nds.map((n) => ({
        ...n,
        data: { ...n.data, status: 'running', errorMsg: undefined, lastOutput: undefined },
      }))
    );

    try {
      const res = await fetch('/api/execute-workflow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nodes,
          edges,
          apiVaultKeys: vaultKeys,
        }),
      });

      const data = await res.json();

      setExecutionLogs(data.logs || []);
      setTotalDurationMs(data.totalDurationMs);

      // Update individual node statuses and outputs on canvas
      if (data.nodeOutputs) {
        setNodes((nds) =>
          nds.map((n) => {
            const out = data.nodeOutputs[n.id];
            return {
              ...n,
              data: {
                ...n.data,
                status: data.success ? 'success' : 'error',
                lastOutput: out,
              },
            };
          })
        );
      }
    } catch (err: any) {
      console.error('Workflow execution error:', err);
      setNodes((nds) =>
        nds.map((n) => ({
          ...n,
          data: { ...n.data, status: 'error', errorMsg: err.message },
        }))
      );
    } finally {
      setIsRunningWorkflow(false);
    }
  };

  const selectedNode = nodes.find((n) => n.id === selectedNodeId);

  return (
    <div className="h-screen w-screen flex flex-col bg-slate-950 text-slate-100 font-sans overflow-hidden select-none">
      {/* Top Navigation Header */}
      <Header
        onLoadPreset={handleLoadPreset}
        onOpenVault={() => setIsVaultOpen(true)}
        onRunWorkflow={handleRunWorkflow}
        onResetCanvas={handleResetCanvas}
        onAutoLayout={handleAutoLayout}
        isRunning={isRunningWorkflow}
        vaultKeys={vaultKeys}
      />

      {/* Main Workspace Area */}
      <div className="flex-1 flex relative overflow-hidden">
        {/* Left Node Palette Sidebar */}
        <NodePaletteSidebar onAddNode={handleAddNode} />

        {/* Center Canvas with React Flow */}
        <div className="flex-1 h-full relative">
          {/* Floating AI Copilot Prompt Bar */}
          <CopilotPromptBar
            onGenerateGraph={handleGenerateGraph}
            isGenerating={isGeneratingGraph}
            selectedModel={vaultKeys.preferredModel || 'gemini-3.6-flash'}
            onModelChange={(model) => handleSaveVaultKeys({ ...vaultKeys, preferredModel: model })}
          />

          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={onNodeClick}
            nodeTypes={nodeTypes}
            fitView
            colorMode="dark"
            className="bg-slate-950"
          >
            <Background variant={BackgroundVariant.Dots} gap={24} size={1.5} color="#334155" />
            <Controls className="bg-slate-900 border-slate-800 text-slate-200 fill-slate-200" />
            <MiniMap
              nodeStrokeColor="#475569"
              nodeColor="#1e293b"
              className="bg-slate-900/80 border-slate-800 rounded-xl overflow-hidden"
            />
          </ReactFlow>
        </div>

        {/* Right Node Configuration Inspector Drawer */}
        {selectedNode && (
          <NodeConfigDrawer
            nodeId={selectedNode.id}
            nodeData={selectedNode.data}
            onSaveConfig={handleSaveNodeConfig}
            onDeleteNode={handleDeleteNode}
            onClose={() => setSelectedNodeId(null)}
          />
        )}
      </div>

      {/* Bottom Execution Log Runner Panel */}
      <ExecutionLogPanel
        logs={executionLogs}
        totalDurationMs={totalDurationMs}
        isRunning={isRunningWorkflow}
        onClearLogs={() => setExecutionLogs([])}
      />

      {/* Secure API Vault Modal */}
      <ApiVaultModal
        isOpen={isVaultOpen}
        onClose={() => setIsVaultOpen(false)}
        keys={vaultKeys}
        onSaveKeys={handleSaveVaultKeys}
      />
    </div>
  );
}

export default function App() {
  return (
    <ReactFlowProvider>
      <AppContent />
    </ReactFlowProvider>
  );
}
