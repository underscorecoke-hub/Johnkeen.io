export type NodeCategory = 'trigger' | 'ai_data' | 'web3_action' | 'output';

export type NodeType =
  | 'trigger_telegram'
  | 'trigger_webhook'
  | 'data_gemini'
  | 'data_1inch'
  | 'web3_balancer'
  | 'web3_pimlico'
  | 'output_telegram'
  | 'output_webhook';

export type NodeStatus = 'idle' | 'running' | 'success' | 'error';

export interface WorkflowNodeData {
  [key: string]: any;
  label: string;
  category: NodeCategory;
  nodeType: NodeType;
  status?: NodeStatus;
  config: Record<string, any>;
  lastOutput?: Record<string, any>;
  errorMsg?: string;
  execTimeMs?: number;
}

export interface ApiVaultKeys {
  telegramBotToken: string;
  telegramChatId: string;
  oneInchApiKey: string;
  geminiApiKey: string;
  walletAddress: string;
  walletPrivateKey: string;
  pimlicoApiKey: string;
  webhookUrl: string;
}

export interface ExecutionLogItem {
  id: string;
  nodeId: string;
  nodeLabel: string;
  nodeType: NodeType;
  status: NodeStatus;
  message: string;
  timestamp: string;
  inputData?: any;
  outputData?: any;
  durationMs?: number;
}

export interface WorkflowExecutionResult {
  success: boolean;
  totalDurationMs: number;
  logs: ExecutionLogItem[];
  nodeOutputs: Record<string, any>;
  error?: string;
}

export interface NodeRegistryItem {
  type: NodeType;
  label: string;
  category: NodeCategory;
  description: string;
  iconName: string;
  color: string;
  borderColor: string;
  defaultConfig: Record<string, any>;
  inputs: Array<{ id: string; label: string; type: string }>;
  outputs: Array<{ id: string; label: string; type: string }>;
}
