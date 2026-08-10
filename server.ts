import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import { ethers } from 'ethers';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini AI Client
const getGeminiClient = (customKey?: string) => {
  const key = customKey || process.env.GEMINI_API_KEY;
  if (!key) {
    throw new Error('GEMINI_API_KEY is not set. Please set it in Settings > Secrets.');
  }
  return new GoogleGenAI({
    apiKey: key,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
};

// 1. HEALTH CHECK
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 2. AI GRAPH GENERATOR ENDPOINT (/api/generate-graph)
app.post('/api/generate-graph', async (req, res) => {
  try {
    const { prompt, apiVaultKeys } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const ai = getGeminiClient(apiVaultKeys?.geminiApiKey);

    const systemInstruction = `
You are an expert Web3 and AI Workflow Graph Architect.
Your task is to parse a user natural language prompt and generate a visual node graph for React Flow.

AVAILABLE NODE TYPES & SCHEMAS:
1. "trigger_telegram": Telegram Bot Listener (defaultConfig: { command: "/arbitrage", filterKeywords: "arbitrage, start" })
2. "trigger_webhook": Webhook Trigger (defaultConfig: { endpointPath: "/api/v1/trigger/custom" })
3. "data_1inch": 1inch DEX Arbitrage Scanner (defaultConfig: { pair: "WETH/USDC", chain: "Ethereum Base (ChainId: 8453)", minSpreadPercent: 0.8, scanAmountUsd: 50000 })
4. "data_gemini": Gemini AI Extractor (defaultConfig: { promptTemplate: "Analyze the price spread and output trading decision", model: "gemini-3.6-flash" })
5. "web3_balancer": Balancer Flash Loan Vault (defaultConfig: { vaultContract: "0xBA12222222228d8Ba445958a75a0704d566BF2C8", borrowAmount: "10.0 WETH", feePercent: "0.00%" })
6. "web3_pimlico": Pimlico ERC-4337 Paymaster (defaultConfig: { paymasterUrl: "https://api.pimlico.io/v2/base/rpc", entryPoint: "0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789", sponsorPolicyId: "sp_zero_gas_v1" })
7. "output_telegram": Telegram Alert Sender (defaultConfig: { messageFormat: "⚡ Arbitrage Executed! Profit: {{profitUsd}}, Gas: $0.00 Sponsored by Pimlico" })
8. "output_webhook": Webhook Dispatcher (defaultConfig: { url: "https://api.example.com/hooks/alert" })

RULES FOR GENERATION:
- Return a JSON object with "nodes" array and "edges" array.
- Each node must have:
  * "id": unique string (e.g., "node-1", "node-2")
  * "type": one of the valid node types listed above
  * "position": { "x": number, "y": number } (Layout left-to-right sequentially: x increases by 330px for each step: 50, 380, 710, 1040, 1370, 1700. Y position around 150)
  * "data": { "label": string, "category": "trigger"|"ai_data"|"web3_action"|"output", "nodeType": string, "config": object }
- Each edge must connect output of source node to input handle of target node:
  * "id": string
  * "source": source node id
  * "sourceHandle": source handle name (e.g. "message_data", "arbitrage_opportunity", "ai_analysis", "flashloan_receipt", "sponsored_user_op")
  * "target": target node id
  * "targetHandle": target handle name (e.g. "trigger_signal", "input_text", "arb_data", "transaction_payload", "execution_result")
  * "animated": true
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: `Generate a node graph for this request: "${prompt}"`,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            nodes: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  type: { type: Type.STRING },
                  position: {
                    type: Type.OBJECT,
                    properties: {
                      x: { type: Type.NUMBER },
                      y: { type: Type.NUMBER },
                    },
                    required: ['x', 'y'],
                  },
                  data: {
                    type: Type.OBJECT,
                    properties: {
                      label: { type: Type.STRING },
                      category: { type: Type.STRING },
                      nodeType: { type: Type.STRING },
                      config: { type: Type.OBJECT },
                    },
                    required: ['label', 'category', 'nodeType', 'config'],
                  },
                },
                required: ['id', 'type', 'position', 'data'],
              },
            },
            edges: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  source: { type: Type.STRING },
                  sourceHandle: { type: Type.STRING },
                  target: { type: Type.STRING },
                  targetHandle: { type: Type.STRING },
                  animated: { type: Type.BOOLEAN },
                },
                required: ['id', 'source', 'target'],
              },
            },
          },
          required: ['nodes', 'edges'],
        },
      },
    });

    const graphData = JSON.parse(response.text || '{}');
    res.json(graphData);
  } catch (error: any) {
    console.error('Error generating graph:', error);
    res.status(500).json({ error: error.message || 'Failed to generate graph' });
  }
});

// 3. WORKFLOW DAG EXECUTION ENGINE (/api/execute-workflow)
app.post('/api/execute-workflow', async (req, res) => {
  const startTime = Date.now();
  const { nodes, edges, apiVaultKeys } = req.body;

  if (!nodes || !Array.isArray(nodes)) {
    return res.status(400).json({ error: 'Nodes array is required' });
  }

  const logs: any[] = [];
  const nodeOutputs: Record<string, any> = {};

  try {
    // Topological Sort of DAG
    const inDegree: Record<string, number> = {};
    const adj: Record<string, string[]> = {};

    nodes.forEach((n: any) => {
      inDegree[n.id] = 0;
      adj[n.id] = [];
    });

    edges?.forEach((e: any) => {
      if (adj[e.source] && inDegree[e.target] !== undefined) {
        adj[e.source].push(e.target);
        inDegree[e.target] = (inDegree[e.target] || 0) + 1;
      }
    });

    const queue: string[] = [];
    Object.keys(inDegree).forEach((nodeId) => {
      if (inDegree[nodeId] === 0) queue.push(nodeId);
    });

    const topoOrder: string[] = [];
    while (queue.length > 0) {
      const u = queue.shift()!;
      topoOrder.push(u);
      (adj[u] || []).forEach((v) => {
        inDegree[v]--;
        if (inDegree[v] === 0) queue.push(v);
      });
    }

    // Execute nodes sequentially in topological order
    for (const nodeId of topoOrder) {
      const node = nodes.find((n: any) => n.id === nodeId);
      if (!node) continue;

      const nodeType = node.data?.nodeType || node.type;
      const config = node.data?.config || {};
      const nodeLabel = node.data?.label || nodeType;

      // Find input data from incoming edges
      const incomingEdges = (edges || []).filter((e: any) => e.target === nodeId);
      const inputPayloads = incomingEdges.map((e: any) => ({
        sourceNodeId: e.source,
        data: nodeOutputs[e.source],
      }));

      const stepStartTime = Date.now();

      logs.push({
        id: `log-${nodeId}-${Date.now()}`,
        nodeId,
        nodeLabel,
        nodeType,
        status: 'running',
        message: `Executing ${nodeLabel}...`,
        timestamp: new Date().toLocaleTimeString(),
        inputData: inputPayloads.length === 1 ? inputPayloads[0].data : inputPayloads,
      });

      let outputResult: any = {};

      // Execute specific node logic
      if (nodeType === 'trigger_telegram') {
        outputResult = {
          command: config.command || '/arbitrage',
          sender: '@crypto_trader_bot',
          chatId: apiVaultKeys?.telegramChatId || config.chatId || '@alerts_channel',
          timestamp: new Date().toISOString(),
          promptKeyword: config.filterKeywords || 'arbitrage',
        };
      } else if (nodeType === 'trigger_webhook') {
        outputResult = {
          event: 'WEBHOOK_RECEIVED',
          endpoint: config.endpointPath || '/api/v1/trigger/custom',
          method: 'POST',
          timestamp: new Date().toISOString(),
        };
      } else if (nodeType === 'data_1inch') {
        // 1inch DEX Arbitrage Simulator
        const buyPrice = 2842.10;
        const sellPrice = 2865.80;
        const spreadPercent = ((sellPrice - buyPrice) / buyPrice) * 100;
        const borrowAmountUsd = config.scanAmountUsd || 50000;
        const grossProfitUsd = (borrowAmountUsd * (spreadPercent / 100));

        outputResult = {
          pair: config.pair || 'WETH/USDC',
          chain: config.chain || 'Ethereum Base (8453)',
          buyDex: 'Uniswap v3 Pool (0.05%)',
          sellDex: 'Sushiswap v3 Pool',
          buyPriceUsd: buyPrice,
          sellPriceUsd: sellPrice,
          spreadPercent: parseFloat(spreadPercent.toFixed(3)),
          grossProfitUsd: parseFloat(grossProfitUsd.toFixed(2)),
          scanTimestamp: new Date().toISOString(),
          status: 'PROFITABLE_ARBITRAGE_FOUND',
        };
      } else if (nodeType === 'data_gemini') {
        // Gemini AI Extractor
        try {
          const ai = getGeminiClient(apiVaultKeys?.geminiApiKey);
          const prompt = `${config.promptTemplate || 'Analyze trading opportunity'}: ${JSON.stringify(inputPayloads)}`;
          
          const geminiRes = await ai.models.generateContent({
            model: 'gemini-3.6-flash',
            contents: prompt,
          });

          outputResult = {
            aiAnalysis: geminiRes.text,
            model: 'gemini-3.6-flash',
            confidenceScore: 0.98,
            tradeApproved: true,
          };
        } catch (err: any) {
          outputResult = {
            aiAnalysis: 'Gemini AI simulation approval: High probability arbitrage signal detected. Recommendation: EXECUTE FLASH LOAN.',
            confidenceScore: 0.95,
            tradeApproved: true,
            note: 'Fallthrough simulation',
          };
        }
      } else if (nodeType === 'web3_balancer') {
        // Balancer Flash Loan Contract Executor (0xBA12222222228d8Ba445958a75a0704d566BF2C8)
        const vaultAddress = '0xBA12222222228d8Ba445958a75a0704d566BF2C8';
        const borrowToken = config.tokenAddress || '0x4200000000000000000000000000000000000006'; // WETH Base
        const loanAmount = config.borrowAmount || '15.0 WETH';

        // Simulate Ethers interface contract call payload
        const dummyWallet = ethers.Wallet.createRandom();

        outputResult = {
          vaultContract: vaultAddress,
          borrowToken,
          borrowAmount: loanAmount,
          feePercent: '0.00%',
          collateralRequired: '0.00 USD (Zero Collateral)',
          flashLoanCalldata: '0x52bbbe29000000000000000000000000' + dummyWallet.address.slice(2),
          borrowStatus: 'FLASH_LOAN_APPROVED',
        };
      } else if (nodeType === 'web3_pimlico') {
        // Pimlico ERC-4337 Zero-Gas Paymaster
        const paymasterUrl = config.paymasterUrl || 'https://api.pimlico.io/v2/base/rpc';
        const entryPoint = '0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789';

        outputResult = {
          pimlicoPaymasterUrl: paymasterUrl,
          entryPointContract: entryPoint,
          userOpHash: '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join(''),
          gasSponsorStatus: 'SPONSORED_ZERO_GAS',
          userGasCostUsd: 0.00,
          sponsorPolicy: 'sp_zero_gas_arbitrage_v1',
          blockNumber: 18942011,
          txHash: '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join(''),
        };
      } else if (nodeType === 'output_telegram') {
        // Telegram Alert Sender
        const targetChat = apiVaultKeys?.telegramChatId || config.chatId || '@arbitrage_alerts';
        outputResult = {
          deliveryStatus: 'ALERT_DELIVERED',
          targetChat,
          sentTimestamp: new Date().toLocaleTimeString(),
          messageContent: config.messageFormat || '🚀 Arbitrage executed successfully! Profit: +$241.50, Gas: $0.00 (Pimlico Sponsored)',
        };
      } else if (nodeType === 'output_webhook') {
        outputResult = {
          webhookUrl: config.url || 'https://api.example.com/hooks/alert',
          httpStatus: 200,
          responseBody: { received: true, timestamp: Date.now() },
        };
      } else {
        outputResult = { status: 'EXECUTED', nodeType };
      }

      const stepDurationMs = Date.now() - stepStartTime;
      nodeOutputs[nodeId] = outputResult;

      // Update log to success
      const logIdx = logs.findIndex((l) => l.nodeId === nodeId && l.status === 'running');
      if (logIdx !== -1) {
        logs[logIdx] = {
          ...logs[logIdx],
          status: 'success',
          message: `Successfully executed ${nodeLabel}`,
          outputData: outputResult,
          durationMs: stepDurationMs,
        };
      }
    }

    const totalDurationMs = Date.now() - startTime;
    res.json({
      success: true,
      totalDurationMs,
      logs,
      nodeOutputs,
    });
  } catch (error: any) {
    console.error('Workflow execution error:', error);
    res.status(500).json({
      success: false,
      totalDurationMs: Date.now() - startTime,
      logs,
      nodeOutputs,
      error: error.message || 'Execution error',
    });
  }
});

// 4. TELEGRAM INTERACTIVE WEBHOOK & BOT STATE MACHINE HANDLER
app.post('/api/telegram/webhook', (req, res) => {
  const { message } = req.body;
  const text = message?.text || '';

  if (text === '/start') {
    return res.json({
      reply: '🤖 *Welcome to Visual Node Studio Telegram Bot!*\n\nUse /arbitrage to trigger a zero-gas DEX arbitrage scan on Base.',
    });
  }

  if (text === '/arbitrage') {
    return res.json({
      reply: '⚡ *Zero-Gas Arbitrage Triggered*\nScanning 1inch DEX pools -> Borrowing Balancer Flash Loan -> Sponsoring via Pimlico Paymaster...',
    });
  }

  res.json({ reply: 'Command received.' });
});

// VITE MIDDLEWARE SETUP
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
