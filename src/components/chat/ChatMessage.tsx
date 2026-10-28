import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Copy, Check, RotateCcw, Edit3, Sparkles, User, AlertCircle, CheckSquare, X, Zap, Bot } from 'lucide-react';
import { ChatMessage as ChatMessageType } from '../../types/chat';
import { CodeBlock } from './CodeBlock';

interface ChatMessageProps {
  message: ChatMessageType;
  isLastMessage: boolean;
  isGenerating: boolean;
  onRegenerate?: () => void;
  onEditAndResend?: (newContent: string) => void;
  onCopySuccess?: () => void;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({
  message,
  isLastMessage,
  isGenerating,
  onRegenerate,
  onEditAndResend,
  onCopySuccess,
}) => {
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(message.content);

  const isUser = message.role === 'user';

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      onCopySuccess?.();
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  const handleSaveEdit = () => {
    if (editContent.trim() && editContent.trim() !== message.content) {
      onEditAndResend?.(editContent.trim());
      setIsEditing(false);
    } else {
      setIsEditing(false);
    }
  };

  const formattedTime = new Date(message.timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  const isPro = message.modelUsed === 'gemini-3.8-flash';

  return (
    <div
      className={`w-full py-2.5 px-3 sm:px-6 flex gap-3 transition-colors group ${
        isUser ? 'justify-end' : 'justify-start'
      }`}
    >
      {/* AI Cyber Avatar */}
      {!isUser && (
        <div className="shrink-0 pt-1">
          <div className="relative w-8 h-8 rounded-xl bg-slate-950 p-[1.5px] border border-slate-700/80 shadow-md">
            <div className="absolute inset-0 bg-gradient-to-tr from-pink-500 via-orange-500 to-lime-400 opacity-60 rounded-xl" />
            <div className="relative w-full h-full bg-[#080d17] rounded-[10px] flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-pink-300" />
            </div>
          </div>
        </div>
      )}

      {/* Message Body Container */}
      <div className={`flex flex-col max-w-[92%] sm:max-w-[80%] ${isUser ? 'items-end' : 'items-start'}`}>
        {/* Header Metadata */}
        <div className="flex items-center gap-2 mb-1 px-1 text-[11px] font-mono text-slate-400">
          <span className="font-semibold text-slate-300">{isUser ? 'YOU' : 'LUMORA NEURAL'}</span>
          <span className="text-[9px] opacity-40">•</span>
          <span className="text-[10px] opacity-75">{formattedTime}</span>
          {!isUser && message.modelUsed && (
            <span
              className={`text-[9px] px-1.5 py-0.2 rounded font-sans uppercase font-bold tracking-wider ${
                isPro
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  : 'bg-slate-800 text-slate-400 border border-slate-700'
              }`}
            >
              {isPro ? 'PRO 3.8' : '3.1 LITE'}
            </span>
          )}
        </div>

        {/* Content Box */}
        {isEditing ? (
          <div className="w-full min-w-[280px] sm:min-w-[440px] p-3 rounded-2xl bg-[#0d121e] border border-pink-500/60 shadow-2xl space-y-2.5">
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="w-full min-h-[90px] p-3 bg-slate-950 text-slate-100 rounded-xl text-xs sm:text-sm border border-slate-800 focus:outline-none focus:border-pink-500 resize-y"
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setIsEditing(false)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-950 bg-gradient-to-r from-pink-500 to-orange-400 hover:opacity-95 shadow-md transition-all cursor-pointer"
              >
                <CheckSquare className="w-3.5 h-3.5" />
                Save & Resend
              </button>
            </div>
          </div>
        ) : (
          <div
            className={`relative rounded-2xl text-[14px] leading-relaxed transition-all shadow-md ${
              isUser
                ? 'px-4 py-2.5 bg-gradient-to-r from-[#182032] to-[#1e293b] border border-slate-700/80 text-slate-100 shadow-slate-950/40'
                : 'px-5 py-4 bg-[#0a0f1b]/90 border border-slate-800/90 text-slate-200 shadow-slate-950/60 backdrop-blur-md'
            }`}
          >
            {/* Error banner if present */}
            {message.error && (
              <div className="mb-3 p-3 rounded-xl bg-rose-950/80 border border-rose-500/40 text-rose-200 text-xs flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-rose-300">Generation Interrupted</p>
                  <p className="mt-0.5 opacity-90 leading-relaxed">{message.error}</p>
                </div>
              </div>
            )}

            {/* Markdown rendered text for AI */}
            {!isUser ? (
              <div className="prose prose-invert max-w-none text-[13.5px] sm:text-[14px] prose-p:my-2 prose-pre:my-1 prose-headings:text-slate-100 prose-a:text-pink-400 hover:prose-a:text-pink-300 prose-strong:text-white prose-code:text-pink-300 prose-code:bg-slate-800/70 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-xs prose-ul:my-2 prose-ol:my-2 prose-li:my-0.5 prose-table:border-collapse prose-th:border prose-th:border-slate-700 prose-th:p-2 prose-td:border prose-td:border-slate-800 prose-td:p-2">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    code({ className, children, ...props }) {
                      const match = /language-(\w+)/.exec(className || '');
                      const codeString = String(children).replace(/\n$/, '');
                      const isInline = !match && !codeString.includes('\n');

                      if (isInline) {
                        return (
                          <code className="px-1.5 py-0.5 rounded bg-slate-800/80 text-pink-300 font-mono text-[12.5px] border border-slate-700/50" {...props}>
                            {children}
                          </code>
                        );
                      }

                      return <CodeBlock language={match ? match[1] : ''} value={codeString} />;
                    },
                  }}
                >
                  {message.content}
                </ReactMarkdown>
              </div>
            ) : (
              <div className="whitespace-pre-wrap break-words">{message.content}</div>
            )}

            {/* Live streaming cursor */}
            {message.isStreaming && (
              <span className="inline-flex items-center gap-1.5 ml-1 text-pink-400">
                <span className="w-1.5 h-1.5 rounded-full bg-pink-400 animate-ping inline-block" />
                <span className="text-[11px] font-mono text-pink-300 font-medium">streaming...</span>
              </span>
            )}
          </div>
        )}

        {/* Action bar (Copy, Edit, Regenerate) */}
        {!isEditing && (
          <div className="flex items-center gap-1.5 mt-1 px-1 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity text-slate-500">
            <button
              onClick={handleCopy}
              className="p-1 rounded-md hover:bg-slate-800 hover:text-slate-300 transition-colors text-xs flex items-center gap-1 cursor-pointer"
              title="Copy message"
            >
              {copied ? (
                <>
                  <Check className="w-3 h-3 text-lime-400" />
                  <span className="text-[10px] text-lime-400">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" />
                  <span className="text-[10px] hidden sm:inline">Copy</span>
                </>
              )}
            </button>

            {isUser && onEditAndResend && !isGenerating && (
              <button
                onClick={() => {
                  setEditContent(message.content);
                  setIsEditing(true);
                }}
                className="p-1 rounded-md hover:bg-slate-800 hover:text-slate-300 transition-colors text-xs flex items-center gap-1 cursor-pointer"
                title="Edit and resend"
              >
                <Edit3 className="w-3 h-3" />
                <span className="text-[10px] hidden sm:inline">Edit</span>
              </button>
            )}

            {!isUser && onRegenerate && isLastMessage && !isGenerating && (
              <button
                onClick={onRegenerate}
                className="p-1 rounded-md hover:bg-slate-800 hover:text-slate-300 transition-colors text-xs flex items-center gap-1 cursor-pointer"
                title="Regenerate response"
              >
                <RotateCcw className="w-3 h-3" />
                <span className="text-[10px] hidden sm:inline">Regenerate</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* User Cyber Avatar */}
      {isUser && (
        <div className="shrink-0 pt-1">
          <div className="w-8 h-8 rounded-xl bg-slate-900 border border-slate-700/80 flex items-center justify-center text-slate-300 shadow-sm">
            <User className="w-4 h-4" />
          </div>
        </div>
      )}
    </div>
  );
};
