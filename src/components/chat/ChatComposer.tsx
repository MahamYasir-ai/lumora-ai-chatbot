import React, { useRef, useEffect, useState } from 'react';
import { ArrowUp, Square, Sparkles } from 'lucide-react';

interface ChatComposerProps {
  input: string;
  setInput: (value: string) => void;
  onSend: (messageText?: string) => void;
  onStop: () => void;
  isGenerating: boolean;
  disabled?: boolean;
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
  placeholder = 'Ask Lumora anything... (Shift+Enter for newline)',
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isFocused, setIsFocused] = useState(false);

  // Auto-resize textarea height
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      const newHeight = Math.min(textarea.scrollHeight, 180);
      textarea.style.height = `${Math.max(48, newHeight)}px`;
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

  return (
    <div className="w-full max-w-3xl mx-auto px-3 sm:px-4 pb-4 pt-2">
      {/* Container with radiant border glow on focus */}
      <div
        className={`relative rounded-2xl bg-slate-900/90 border transition-all duration-300 shadow-2xl backdrop-blur-md ${
          isFocused
            ? 'border-transparent ring-2 ring-pink-500/50 shadow-pink-500/10'
            : 'border-slate-800/90 hover:border-slate-700/80'
        }`}
      >
        {/* Subtle top rainbow line when focused */}
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
            className="w-full bg-transparent text-slate-100 placeholder:text-slate-500 text-[14.5px] leading-relaxed resize-none focus:outline-none px-2 py-1 max-h-[180px] overflow-y-auto"
          />

          {/* Bottom Bar: Character count + Send/Stop Controls */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-800/60 mt-1 px-1">
            <div className="flex items-center gap-3 text-xs text-slate-500">
              <span className={`text-[11px] font-mono ${isOverLimit ? 'text-rose-400 font-semibold' : ''}`}>
                {input.length} / {MAX_CHARS}
              </span>
              {input.length > 0 && !isOverLimit && (
                <span className="hidden sm:inline-block text-[11px] text-slate-500">
                  Press <kbd className="px-1 py-0.5 rounded bg-slate-800 text-[10px] text-slate-400">Enter</kbd> to send
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {isGenerating ? (
                <button
                  type="button"
                  onClick={onStop}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-600/90 hover:bg-rose-500 text-white text-xs font-semibold shadow-lg shadow-rose-950/40 transition-all cursor-pointer active:scale-95"
                  aria-label="Stop generation"
                >
                  <Square className="w-3.5 h-3.5 fill-current" />
                  <span>Stop</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => onSend()}
                  disabled={!canSend}
                  className={`flex items-center justify-center w-8 h-8 rounded-xl transition-all duration-200 cursor-pointer ${
                    canSend
                      ? 'bg-gradient-to-tr from-pink-500 via-orange-500 to-lime-400 text-slate-950 shadow-md shadow-pink-500/25 hover:scale-105 active:scale-95'
                      : 'bg-slate-800 text-slate-600 cursor-not-allowed opacity-60'
                  }`}
                  aria-label="Send message"
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
