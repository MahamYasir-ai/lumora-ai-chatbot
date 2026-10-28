import React, { useState } from 'react';
import { Moon, Sun, Monitor, Bot, Sliders, ShieldCheck, RefreshCw, Trash2, Info } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { UserSettings, ThemeMode } from '../../types/chat';
import { BRAND } from '../../config/brand';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: UserSettings;
  onSaveSettings: (newSettings: UserSettings) => void;
  onClearHistory: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
  onClearHistory,
}) => {
  const [activeTab, setActiveTab] = useState<'general' | 'model' | 'about'>('general');
  const [tempSettings, setTempSettings] = useState<UserSettings>(settings);

  // Sync state whenever modal opens
  React.useEffect(() => {
    if (isOpen) {
      setTempSettings(settings);
    }
  }, [isOpen, settings]);

  const handleSave = () => {
    onSaveSettings(tempSettings);
    onClose();
  };

  const handleResetInstruction = () => {
    setTempSettings((prev) => ({
      ...prev,
      systemInstruction: BRAND.defaultSystemInstruction,
    }));
  };

  const themes: { id: ThemeMode; label: string; icon: React.ReactNode }[] = [
    { id: 'dark', label: 'Dark', icon: <Moon className="w-4 h-4" /> },
    { id: 'light', label: 'Light', icon: <Sun className="w-4 h-4" /> },
    { id: 'system', label: 'System', icon: <Monitor className="w-4 h-4" /> },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Lumora Settings"
      description="Configure your workspace, AI personality, and local preferences."
      maxWidth="max-w-xl"
    >
      <div className="space-y-5">
        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-800 text-xs font-medium">
          <button
            onClick={() => setActiveTab('general')}
            className={`pb-2.5 px-3 transition-colors border-b-2 cursor-pointer ${
              activeTab === 'general'
                ? 'border-pink-500 text-pink-400 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            General & Theme
          </button>
          <button
            onClick={() => setActiveTab('model')}
            className={`pb-2.5 px-3 transition-colors border-b-2 cursor-pointer ${
              activeTab === 'model'
                ? 'border-pink-500 text-pink-400 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            AI Model & System Prompt
          </button>
          <button
            onClick={() => setActiveTab('about')}
            className={`pb-2.5 px-3 transition-colors border-b-2 cursor-pointer ${
              activeTab === 'about'
                ? 'border-pink-500 text-pink-400 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            About Lumora
          </button>
        </div>

        {/* Tab 1: General & Theme */}
        {activeTab === 'general' && (
          <div className="space-y-5 py-1">
            {/* Theme Selection */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Appearance
              </label>
              <div className="grid grid-cols-3 gap-2.5">
                {themes.map((theme) => (
                  <button
                    key={theme.id}
                    type="button"
                    onClick={() => setTempSettings((prev) => ({ ...prev, theme: theme.id }))}
                    className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-medium transition-all cursor-pointer ${
                      tempSettings.theme === theme.id
                        ? 'bg-slate-800 border-pink-500 text-white shadow-md shadow-pink-500/10'
                        : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                    }`}
                  >
                    {theme.icon}
                    <span>{theme.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Data & Privacy notice */}
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-400 space-y-1.5">
              <div className="flex items-center gap-1.5 text-slate-300 font-medium">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Local Privacy First</span>
              </div>
              <p className="leading-relaxed">
                All conversations are securely persisted in your browser&apos;s LocalStorage. They are never shared, uploaded to third-party databases, or synchronized across devices.
              </p>
            </div>

            {/* Clear All Data */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => {
                  onClearHistory();
                  onClose();
                }}
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-rose-400 hover:bg-rose-950/50 border border-rose-900/40 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear all conversation history</span>
              </button>
            </div>
          </div>
        )}

        {/* Tab 2: Model & System Prompt */}
        {activeTab === 'model' && (
          <div className="space-y-5 py-1">
            {/* Model Selection */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Active Gemini Model
              </label>
              <div className="space-y-2">
                {BRAND.models.map((model) => (
                  <button
                    key={model.id}
                    type="button"
                    onClick={() => setTempSettings((prev) => ({ ...prev, model: model.id }))}
                    className={`w-full text-left p-3 rounded-xl border transition-all cursor-pointer ${
                      tempSettings.model === model.id
                        ? 'bg-slate-800 border-pink-500/80 shadow-md shadow-pink-500/10'
                        : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <Bot className="w-4 h-4 text-pink-400" />
                        <span className="text-sm font-semibold text-white">{model.name}</span>
                      </div>
                      <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                        {model.badge}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">{model.description}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Temperature Slider */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-orange-400" />
                  Creativity / Temperature
                </span>
                <span className="font-mono text-pink-400 font-bold">{tempSettings.temperature.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={tempSettings.temperature}
                onChange={(e) =>
                  setTempSettings((prev) => ({ ...prev, temperature: parseFloat(e.target.value) }))
                }
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-pink-500"
              />
              <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                <span>0.0 (Precise & Factual)</span>
                <span>0.7 (Balanced)</span>
                <span>1.0 (Creative & Exploratory)</span>
              </div>
            </div>

            {/* Custom System Instruction */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Custom System Persona
                </label>
                <button
                  type="button"
                  onClick={handleResetInstruction}
                  className="text-[11px] text-slate-400 hover:text-pink-400 flex items-center gap-1 cursor-pointer"
                >
                  <RefreshCw className="w-3 h-3" />
                  Reset to default
                </button>
              </div>
              <textarea
                rows={4}
                value={tempSettings.systemInstruction}
                onChange={(e) =>
                  setTempSettings((prev) => ({ ...prev, systemInstruction: e.target.value }))
                }
                className="w-full p-2.5 rounded-xl bg-slate-950 text-slate-200 text-xs border border-slate-800 focus:outline-none focus:border-pink-500/80 resize-y font-mono leading-relaxed"
                placeholder="Instruct how Lumora should behave..."
              />
            </div>
          </div>
        )}

        {/* Tab 3: About */}
        {activeTab === 'about' && (
          <div className="space-y-4 py-1 text-xs text-slate-300 leading-relaxed">
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-pink-500 via-orange-400 to-lime-400 p-[1px]">
                  <div className="w-full h-full bg-slate-950 rounded-[7px] flex items-center justify-center">
                    <span className="text-[10px] font-bold text-pink-300">L</span>
                  </div>
                </div>
                <span className="font-bold text-white text-sm">{BRAND.name}</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
                  v{BRAND.version}
                </span>
              </div>
              <p className="text-slate-400 text-xs">
                Lumora is an AI chatbot and thought-partnership workspace engineered with TypeScript, Tailwind CSS, Motion animations, and the official Google Gen AI SDK.
              </p>
            </div>

            <div className="space-y-2 text-slate-400">
              <div className="flex items-center gap-2 text-slate-200 font-medium">
                <Info className="w-4 h-4 text-pink-400" />
                <span>Architecture Highlights:</span>
              </div>
              <ul className="list-disc pl-5 space-y-1">
                <li>Server-side secure API proxying: Your Gemini API Key is never exposed to browser bundles.</li>
                <li>Progressive SSE streaming: Real-time chunked responses with smooth cancellation (Stop Generation).</li>
                <li>Multi-turn conversation history sent with appropriate role mapping.</li>
                <li>Syntax-highlighted code blocks with copy utilities.</li>
                <li>Full responsive support across mobile devices, tablets, and desktops.</li>
              </ul>
            </div>
          </div>
        )}

        {/* Modal Actions */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-pink-500 via-orange-500 to-lime-500 hover:opacity-95 shadow-md shadow-pink-500/20 transition-all cursor-pointer"
          >
            Save Changes
          </button>
        </div>
      </div>
    </Modal>
  );
};
