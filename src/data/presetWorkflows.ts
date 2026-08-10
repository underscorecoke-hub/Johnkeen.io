import { Node, Edge } from '@xyflow/react';

export interface PresetWorkflow {
  id: string;
  title: string;
  description: string;
  nodes: Node[];
  edges: Edge[];
}

export const PRESET_WORKFLOWS: PresetWorkflow[] = [
  {
    id: 'full_gasless_arbitrage',
    title: 'Zero-Gas Balancer + Pimlico Telegram Arbitrage',
    description: 'Listen on Telegram -> Scan 1inch DEX spreads -> Borrow Balancer Flash Loan -> Sponsor via Pimlico Paymaster -> Dispatch Telegram Alert',
    nodes: [
      {
        id: 'node-tg-trigger',
        type: 'trigger_telegram',
        position: { x: 50, y: 150 },
        data: {
          label: 'Telegram Bot Listener',
          category: 'trigger',
          nodeType: 'trigger_telegram',
          config: {
            command: '/arbitrage',
            filterKeywords: 'start, scan, arbitrage',
          },
        },
      },
      {
        id: 'node-pdf-instructions',
        type: 'data_instruction',
        position: { x: 380, y: 20 },
        data: {
          label: 'PDF & System Instructions',
          category: 'ai_data',
          nodeType: 'data_instruction',
          config: {
            instructionTitle: 'Telegram Bot & System Master Instructions',
            pdfFileName: 'Telegram_System_Instructions.pdf',
            rulesText: '1. Execute zero-gas flash loans when arbitrage spread > 0.5%.\n2. Apply Pimlico ERC-4337 paymaster sponsorship.\n3. Send execution summary alerts to Telegram.',
            strictEnforcement: true,
          },
        },
      },
      {
        id: 'node-1inch-scanner',
        type: 'data_1inch',
        position: { x: 380, y: 250 },
        data: {
          label: '1inch DEX Arbitrage Scanner',
          category: 'ai_data',
          nodeType: 'data_1inch',
          config: {
            pair: 'WETH/USDC',
            chain: 'Ethereum Base (ChainId: 8453)',
            minSpreadPercent: 0.75,
            scanAmountUsd: 50000,
          },
        },
      },
      {
        id: 'node-gemini-ai',
        type: 'data_gemini',
        position: { x: 710, y: 50 },
        data: {
          label: 'Gemini AI Opportunity Analyzer',
          category: 'ai_data',
          nodeType: 'data_gemini',
          config: {
            promptTemplate: 'Analyze the 1inch price arbitrage spread. Verify profitability after pool slippage and output executable trade parameters.',
            model: 'gemini-3.6-flash',
          },
        },
      },
      {
        id: 'node-balancer-loan',
        type: 'web3_balancer',
        position: { x: 1040, y: 150 },
        data: {
          label: 'Balancer Flash Loan Vault',
          category: 'web3_action',
          nodeType: 'web3_balancer',
          config: {
            vaultContract: '0xBA12222222228d8Ba445958a75a0704d566BF2C8',
            borrowAmount: '15.0 WETH',
            feePercent: '0.00%',
          },
        },
      },
      {
        id: 'node-pimlico-paymaster',
        type: 'web3_pimlico',
        position: { x: 1370, y: 150 },
        data: {
          label: 'Pimlico Zero-Gas Paymaster',
          category: 'web3_action',
          nodeType: 'web3_pimlico',
          config: {
            paymasterUrl: 'https://api.pimlico.io/v2/base/rpc',
            entryPoint: '0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789',
            sponsorPolicyId: 'sp_zero_gas_arbitrage_v1',
          },
        },
      },
      {
        id: 'node-tg-alert',
        type: 'output_telegram',
        position: { x: 1700, y: 150 },
        data: {
          label: 'Telegram Alert Sender',
          category: 'output',
          nodeType: 'output_telegram',
          config: {
            messageFormat: '⚡ *Arbitrage Executed!*\n\nProfit: +$241.50\nGas Fee: $0.00 (Sponsored by Pimlico)\nBalancer Loan: 15.0 WETH (0% fee)',
          },
        },
      },
    ],
    edges: [
      {
        id: 'e-pdf-ai',
        source: 'node-pdf-instructions',
        sourceHandle: 'instruction_rules',
        target: 'node-gemini-ai',
        targetHandle: 'input_text',
        animated: true,
        style: { stroke: '#06b6d4', strokeWidth: 2 },
      },
      {
        id: 'e1',
        source: 'node-tg-trigger',
        sourceHandle: 'message_data',
        target: 'node-1inch-scanner',
        targetHandle: 'trigger_signal',
        animated: true,
        style: { stroke: '#0284c7', strokeWidth: 2 },
      },
      {
        id: 'e2',
        source: 'node-1inch-scanner',
        sourceHandle: 'arbitrage_opportunity',
        target: 'node-gemini-ai',
        targetHandle: 'input_text',
        animated: true,
        style: { stroke: '#9333ea', strokeWidth: 2 },
      },
      {
        id: 'e3',
        source: 'node-1inch-scanner',
        sourceHandle: 'arbitrage_opportunity',
        target: 'node-balancer-loan',
        targetHandle: 'arb_data',
        animated: true,
        style: { stroke: '#06b6d4', strokeWidth: 2 },
      },
      {
        id: 'e4',
        source: 'node-balancer-loan',
        sourceHandle: 'flashloan_receipt',
        target: 'node-pimlico-paymaster',
        targetHandle: 'transaction_payload',
        animated: true,
        style: { stroke: '#eab308', strokeWidth: 2 },
      },
      {
        id: 'e5',
        source: 'node-pimlico-paymaster',
        sourceHandle: 'sponsored_user_op',
        target: 'node-tg-alert',
        targetHandle: 'execution_result',
        animated: true,
        style: { stroke: '#10b981', strokeWidth: 2 },
      },
    ],
  },
  {
    id: 'webhook_ai_gemini_filter',
    title: 'Gemini Webhook Market Sentiment Filter',
    description: 'Listen to Webhook -> Send to Gemini AI for sentiment score -> Dispatch result to Webhook & Telegram',
    nodes: [
      {
        id: 'n-webhook-trig',
        type: 'trigger_webhook',
        position: { x: 50, y: 150 },
        data: {
          label: 'Webhook Trigger',
          category: 'trigger',
          nodeType: 'trigger_webhook',
          config: {
            endpointPath: '/api/v1/trigger/custom',
          },
        },
      },
      {
        id: 'n-gemini-data',
        type: 'data_gemini',
        position: { x: 380, y: 150 },
        data: {
          label: 'Gemini AI Sentiment Filter',
          category: 'ai_data',
          nodeType: 'data_gemini',
          config: {
            promptTemplate: 'Score the market sentiment from 0 to 100 based on the incoming webhook payload.',
            model: 'gemini-3.6-flash',
          },
        },
      },
      {
        id: 'n-out-tg',
        type: 'output_telegram',
        position: { x: 710, y: 80 },
        data: {
          label: 'Telegram Alert Sender',
          category: 'output',
          nodeType: 'output_telegram',
          config: {
            messageFormat: '📊 *Gemini AI Sentiment Alert*\n\nScore: {{sentimentScore}}/100\nAction: {{recommendedAction}}',
          },
        },
      },
      {
        id: 'n-out-webhook',
        type: 'output_webhook',
        position: { x: 710, y: 250 },
        data: {
          label: 'Webhook Dispatcher',
          category: 'output',
          nodeType: 'output_webhook',
          config: {
            url: 'https://api.example.com/hooks/sentiment',
          },
        },
      },
    ],
    edges: [
      {
        id: 'e-wh1',
        source: 'n-webhook-trig',
        sourceHandle: 'payload',
        target: 'n-gemini-data',
        targetHandle: 'input_text',
        animated: true,
        style: { stroke: '#a855f7', strokeWidth: 2 },
      },
      {
        id: 'e-wh2',
        source: 'n-gemini-data',
        sourceHandle: 'ai_analysis',
        target: 'n-out-tg',
        targetHandle: 'execution_result',
        animated: true,
        style: { stroke: '#0284c7', strokeWidth: 2 },
      },
      {
        id: 'e-wh3',
        source: 'n-gemini-data',
        sourceHandle: 'ai_analysis',
        target: 'n-out-webhook',
        targetHandle: 'data_to_send',
        animated: true,
        style: { stroke: '#f43f5e', strokeWidth: 2 },
      },
    ],
  },
];
