import React, { useState } from 'react';
import { ShieldCheck, Eye, EyeOff, Save, Lock, Key, X, Check, RefreshCw } from 'lucide-react';
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

  const fields = [
    { key: 'telegramBotToken', label: 'Telegram Bot Token', placeholder: '123456789:ABCdefGHIjklMNOpqrSTUvwxyz' },
    { key: 'telegramChatId', label: 'Telegram Target Chat ID', placeholder: '@my_crypto_alerts or 987654321' },
    { key: 'oneInchApiKey', label: '1inch Aggregator API Key', placeholder: '1inch_live_sec_...' },
    { key: 'geminiApiKey', label: 'Gemini AI API Key (Server Override)', placeholder: 'AIzaSy...' },
    { key: 'pimlicoApiKey', label: 'Pimlico Paymaster API Key / URL', placeholder: 'https://api.pimlico.io/v2/base/rpc?apikey=...' },
    { key: 'walletAddress', label: 'Payout / Trading Wallet Address', placeholder: '0x1234...5678' },
    { key: 'walletPrivateKey', label: 'Web3 Wallet Private Key (Local Encrypted)', placeholder: '0xabcdef...' },
    { key: 'webhookUrl', label: 'Custom Outbound Webhook URL', placeholder: 'https://api.mybot.com/webhook' },
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
                Secure API Vault
                <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-300 font-mono border border-emerald-500/30">
                  256-bit AES Encrypted
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Encrypted exchange credentials, bot tokens, and zero-gas Web3 payout keys
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
        <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-4 space-y-3">
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
              Keys are stored in your secure local session.
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
