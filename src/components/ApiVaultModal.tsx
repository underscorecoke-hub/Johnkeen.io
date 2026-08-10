import React, { useState } from 'react';
import { ShieldCheck, Eye, EyeOff, Save, Lock, X, Check, FileText, Upload, Cpu } from 'lucide-react';
import { ApiVaultKeys } from '../types';

interface ApiVaultModalProps {
  isOpen: boolean;
  onClose: () => void;
  keys: ApiVaultKeys;
  onSaveKeys: (newKeys: ApiVaultKeys) => void;
}

export const ApiVaultModal: React.FC<ApiVaultModalProps> = ({
  isOpen,
  onClose,
  keys,
  onSaveKeys,
}) => {
  const [formData, setFormData] = useState<ApiVaultKeys>(keys);
  const [showMasked, setShowMasked] = useState<Record<string, boolean>>({});
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const toggleVisibility = (field: string) => {
    setShowMasked((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveKeys(formData);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setFormData((prev) => ({
        ...prev,
        pdfInstructionName: file.name,
        pdfInstructionText: text || `[Uploaded PDF Instructions from ${file.name}]`,
      }));
    };
    reader.readAsText(file);
  };

  const fields = [
    { key: 'nvidiaApiKey', label: 'NVIDIA NIM API Key (Llama 3.3, DeepSeek R1)', placeholder: 'nvapi-...' },
    { key: 'geminiApiKey', label: 'Gemini AI API Key', placeholder: 'AIzaSy...' },
    { key: 'telegramBotToken', label: 'Telegram Bot Token', placeholder: '123456789:ABCdefGHIjklMNOpqrSTUvwxyz' },
    { key: 'telegramChatId', label: 'Telegram Target Chat ID', placeholder: '@my_crypto_alerts or 987654321' },
    { key: 'oneInchApiKey', label: '1inch Aggregator API Key', placeholder: '1inch_live_sec_...' },
    { key: 'pimlicoApiKey', label: 'Pimlico Paymaster API Key / URL', placeholder: 'https://api.pimlico.io/v2/base/rpc?apikey=...' },
    { key: 'walletAddress', label: 'Payout / Trading Wallet Address', placeholder: '0x1234...5678' },
    { key: 'walletPrivateKey', label: 'Web3 Wallet Private Key (Local Encrypted)', placeholder: '0xabcdef...' },
    { key: 'webhookUrl', label: 'Custom Outbound Webhook URL', placeholder: 'https://api.mybot.com/webhook' },
  ];

  const AI_MODELS = [
    { value: 'gemini-3.6-flash', label: '⚡ Google Gemini 3.6 Flash (Fast)' },
    { value: 'gemini-2.5-pro', label: '🧠 Google Gemini 2.5 Pro (Reasoning)' },
    { value: 'meta/llama-3.3-70b-instruct', label: '🟢 NVIDIA Llama 3.3 70B Instruct' },
    { value: 'deepseek-ai/deepseek-r1', label: '🐋 NVIDIA DeepSeek R1 (Deep Reasoning)' },
    { value: 'mistralai/mistral-large-2-instruct', label: '🔮 NVIDIA Mistral Large 2 Instruct' },
    { value: 'nvidia/llama-3.1-nemotron-70b-instruct', label: '⚡ NVIDIA Nemotron 70B' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4">
      <div className="w-full max-w-xl bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden text-slate-100 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-base text-slate-100 flex items-center gap-2">
                Secure API Vault & AI Model Engine
                <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-300 font-mono border border-emerald-500/30">
                  256-bit AES Encrypted
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Encrypted credentials, NVIDIA NIM AI keys, Telegram PDF instructions
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* AI Model Selection Dropdown */}
          <div className="space-y-1.5 p-3 rounded-xl bg-indigo-950/30 border border-indigo-500/30">
            <label className="text-xs font-semibold text-indigo-300 flex items-center gap-1.5">
              <Cpu className="w-4 h-4 text-indigo-400" />
              <span>Preferred AI Model Engine (Gemini & NVIDIA NIM)</span>
            </label>
            <select
              value={formData.preferredModel || 'gemini-3.6-flash'}
              onChange={(e) => setFormData({ ...formData, preferredModel: e.target.value })}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl py-2 px-3 text-xs text-slate-100 font-medium focus:outline-none focus:border-indigo-500"
            >
              {AI_MODELS.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
            <p className="text-[11px] text-slate-400">
              Selected model will be used for AI prompt extraction, decision brain, and graph generation.
            </p>
          </div>

          {/* PDF Instructions Attachment */}
          <div className="space-y-2 p-3 rounded-xl bg-slate-900/80 border border-slate-800">
            <label className="text-xs font-semibold text-sky-300 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-sky-400" />
                Telegram & AI PDF Instruction Manual
              </span>
              {formData.pdfInstructionName && (
                <span className="text-[10px] text-emerald-400 font-mono">
                  ✓ {formData.pdfInstructionName}
                </span>
              )}
            </label>

            <div className="flex items-center gap-2">
              <label className="cursor-pointer px-3 py-1.5 rounded-xl bg-sky-950/80 border border-sky-800 hover:bg-sky-900/80 text-sky-200 text-xs font-medium flex items-center gap-1.5 transition-colors">
                <Upload className="w-3.5 h-3.5" />
                <span>Upload PDF / Text File</span>
                <input
                  type="file"
                  accept=".pdf,.txt,.md,.json"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
              <span className="text-[11px] text-slate-500">
                {formData.pdfInstructionName || 'No PDF uploaded yet'}
              </span>
            </div>

            <textarea
              rows={3}
              value={formData.pdfInstructionText || ''}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  pdfInstructionText: e.target.value,
                  pdfInstructionName: formData.pdfInstructionName || 'Custom_Instructions.pdf',
                })
              }
              placeholder="Paste or type Telegram operating instructions here (e.g. '1. Start bot with /start\n2. Only execute flashloan if spread > 0.5%\n3. Alert if disconnected')..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs font-mono text-slate-200 placeholder-slate-600 focus:outline-none focus:border-sky-500"
            />
          </div>

          {/* Credentials Inputs */}
          {fields.map((f) => {
            const val = (formData as any)[f.key] || '';
            const isVisible = showMasked[f.key];

            return (
              <div key={f.key} className="space-y-1">
                <label className="text-xs font-medium text-slate-300 flex items-center justify-between">
                  <span>{f.label}</span>
                  {val && (
                    <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
                      <Lock className="w-2.5 h-2.5" /> Configured
                    </span>
                  )}
                </label>

                <div className="relative flex items-center">
                  <input
                    type={isVisible ? 'text' : 'password'}
                    value={val}
                    onChange={(e) =>
                      setFormData({ ...formData, [f.key]: e.target.value })
                    }
                    placeholder={f.placeholder}
                    className="w-full bg-slate-900 border border-slate-800 focus:border-indigo-500 rounded-xl py-2 pl-3 pr-10 text-xs font-mono text-slate-200 placeholder-slate-600 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => toggleVisibility(f.key)}
                    className="absolute right-3 text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    {isVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            );
          })}

          <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
            <span className="text-[11px] text-slate-500">
              Keys and rules are stored in your secure encrypted session.
            </span>

            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs transition-colors"
              >
                Close
              </button>

              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white font-semibold text-xs flex items-center space-x-1.5 shadow-lg shadow-amber-500/20 transition-all active:scale-95 cursor-pointer"
              >
                {savedSuccess ? (
                  <>
                    <Check className="w-4 h-4 text-white" />
                    <span>Vault Saved!</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Save Encrypted Keys</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
