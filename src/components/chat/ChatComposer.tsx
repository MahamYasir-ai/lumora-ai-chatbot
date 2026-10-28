import React, { useRef, useEffect, useState } from 'react';
import { ArrowUp, Square, Zap, Bot } from 'lucide-react';

interface ChatComposerProps {
  input: string;
  setInput: (value: string) => void;
  onSend: (messageText?: string) => void;
  onStop: () => void;
  isGenerating: boolean;
  disabled?: boolean;
  activeModel: string;
  onOpenModelSelector: () => void;
  placeholder?: string;
}

const MAX_CHARS = 4000;

export const ChatComposer: React.FC<ChatComposerProps> = ({
  input,
  setInput,
  onSend,
  onStop,
  isGenerating,
  disabled = false,
  activeModel,
  onOpenModelSelector,
  placeholder = 'Type a command or query for Lumora... (Enter to send)',
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isFocused, setIsFocused] = useState(false);

  // Auto-resize textarea height
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      const newHeight = Math.min(textarea.scrollHeight, 180);
      textarea.style.height = `${Math.max(44, newHeight)}px`;
    }
  }, [input]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!isGenerating && input.trim().length > 0 && !disabled) {
        onSend();
      }
    }
  };

  const isOverLimit = input.length > MAX_CHARS;
  const canSend = !isGenerating && input.trim().length > 0 && !isOverLimit && !disabled;
  const isPro = activeModel === 'gemini-3.8-flash';

  return (
    <div className="w-full max-w-4xl mx-auto px-3 sm:px-5 pb-4 pt-1">
      {/* Futuristic Command Input Container */}
      <div
        className={`relative rounded-2xl bg-[#090e1a]/95 border transition-all duration-300 shadow-2xl backdrop-blur-xl ${
          isFocused
            ? 'border-pink-500/60 ring-1 ring-pink-500/30 shadow-pink-500/10'
            : 'border-slate-800/80 hover:border-slate-700/80'
        }`}
      >
        {/* Animated perimeter glow line on focus */}
        {isFocused && (
          <div className="absolute inset-x-0 -top-px h-[2px] bg-gradient-to-r from-pink-500 via-orange-400 to-lime-400 rounded-t-2xl animate-pulse" />
        )}

        <div className="flex flex-col p-2.5 sm:p-3">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={placeholder}
            rows={1}
            disabled={disabled}
            aria-label="Message input"
            className="w-full bg-transparent text-slate-100 placeholder:text-slate-500 text-[14px] leading-relaxed resize-none focus:outline-none px-2 py-1 max-h-[180px] overflow-y-auto"
          />

          {/* Bottom Control Bar */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-800/60 mt-1 px-1">
            {/* Model Badge Pill button */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onOpenModelSelector}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-all cursor-pointer ${
                  isPro
                    ? 'bg-amber-500/15 text-amber-300 border-amber-500/40 hover:bg-amber-500/25'
                    : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700'
                }`}
                title="Click to switch or unlock models"
              >
                {isPro ? (
                  <Zap className="w-3 h-3 text-amber-400 fill-current" />
                ) : (
                  <Bot className="w-3 h-3 text-lime-400" />
                )}
                <span>{isPro ? 'Gemini 3.8 Flash (PRO)' : 'Gemini 3.1 Flash Lite (FREE)'}</span>
              </button>

              <span className={`text-[10px] font-mono hidden sm:inline ${isOverLimit ? 'text-rose-400 font-bold' : 'text-slate-500'}`}>
                {input.length} / {MAX_CHARS}
              </span>
            </div>

            {/* Actions: Stop or Send */}
            <div className="flex items-center gap-2">
              {isGenerating ? (
                <button
                  type="button"
                  onClick={onStop}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-600/90 hover:bg-rose-500 text-white text-xs font-semibold shadow-lg shadow-rose-950/40 transition-all cursor-pointer active:scale-95"
                  aria-label="Stop generation"
                >
                  <Square className="w-3.5 h-3.5 fill-current" />
                  <span>Stop Generating</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => onSend()}
                  disabled={!canSend}
                  className={`flex items-center justify-center w-8 h-8 rounded-xl transition-all duration-200 cursor-pointer ${
                    canSend
                      ? 'bg-gradient-to-tr from-pink-500 via-orange-500 to-lime-400 text-slate-950 shadow-md shadow-pink-500/25 hover:scale-105 active:scale-95'
                      : 'bg-slate-800/80 text-slate-600 cursor-not-allowed opacity-50'
                  }`}
                  aria-label="Send message"
                  title="Send message (Enter)"
                >
                  <ArrowUp className="w-4 h-4 stroke-[2.5]" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
