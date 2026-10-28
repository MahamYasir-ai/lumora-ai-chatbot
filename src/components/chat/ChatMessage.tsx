import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Copy, Check, RotateCcw, Edit3, Sparkles, User, AlertCircle, CheckSquare, X } from 'lucide-react';
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

  return (
    <div
      className={`w-full py-3.5 px-3 sm:px-6 flex gap-3 sm:gap-4 transition-colors group ${
        isUser ? 'justify-end' : 'justify-start'
      }`}
    >
      {/* AI Avatar */}
      {!isUser && (
        <div className="shrink-0 pt-0.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-pink-500 via-orange-400 to-lime-400 p-[1.5px] shadow-md shadow-pink-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-pink-300" />
            </div>
          </div>
        </div>
      )}

      {/* Message Body Container */}
      <div className={`flex flex-col max-w-[88%] sm:max-w-[78%] ${isUser ? 'items-end' : 'items-start'}`}>
        {/* Author & Timestamp */}
        <div className="flex items-center gap-2 mb-1 px-1 text-xs text-slate-400 font-medium">
          <span>{isUser ? 'You' : 'Lumora AI'}</span>
          <span className="text-[10px] opacity-60">•</span>
          <span className="text-[11px] opacity-75">{formattedTime}</span>
        </div>

        {/* Content Box */}
        {isEditing ? (
          <div className="w-full min-w-[280px] sm:min-w-[400px] p-3 rounded-2xl bg-slate-900 border border-pink-500/50 shadow-xl space-y-2.5">
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="w-full min-h-[90px] p-2.5 bg-slate-950 text-slate-100 rounded-xl text-sm border border-slate-700 focus:outline-none focus:border-pink-500 resize-y"
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
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-white bg-gradient-to-r from-pink-500 to-orange-500 hover:opacity-95 shadow-md transition-all cursor-pointer"
              >
                <CheckSquare className="w-3.5 h-3.5" />
                Save & Resend
              </button>
            </div>
          </div>
        ) : (
          <div
            className={`relative rounded-2xl text-[14.5px] leading-relaxed transition-all shadow-md ${
              isUser
                ? 'px-4 py-3 bg-gradient-to-br from-pink-600 via-rose-600 to-orange-600 text-white shadow-pink-900/20'
                : 'px-5 py-4 bg-slate-900/90 border border-slate-800/90 text-slate-200 shadow-slate-950/40 backdrop-blur-sm'
            }`}
          >
            {/* Error banner if present */}
            {message.error && (
              <div className="mb-3 p-3 rounded-xl bg-rose-950/70 border border-rose-500/40 text-rose-200 text-xs flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">Generation interrupted</p>
                  <p className="mt-0.5 opacity-90">{message.error}</p>
                </div>
              </div>
            )}

            {/* Markdown rendered text for AI */}
            {!isUser ? (
              <div className="prose prose-invert max-w-none prose-p:my-2 prose-pre:my-1 prose-headings:text-slate-100 prose-a:text-pink-400 hover:prose-a:text-pink-300 prose-strong:text-white prose-code:text-pink-300 prose-code:bg-slate-800/70 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-xs prose-ul:my-2 prose-ol:my-2 prose-li:my-0.5 prose-table:border-collapse prose-th:border prose-th:border-slate-700 prose-th:p-2 prose-td:border prose-td:border-slate-800 prose-td:p-2">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    code({ className, children, ...props }) {
                      const match = /language-(\w+)/.exec(className || '');
                      const codeString = String(children).replace(/\n$/, '');
                      const isInline = !match && !codeString.includes('\n');

                      if (isInline) {
                        return (
                          <code className="px-1.5 py-0.5 rounded bg-slate-800/80 text-pink-300 font-mono text-[13px] border border-slate-700/50" {...props}>
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

            {/* Live streaming cursor / pulsing indicator */}
            {message.isStreaming && (
              <span className="inline-flex items-center gap-1 ml-1 text-pink-400">
                <span className="w-2 h-2 rounded-full bg-pink-400 animate-ping inline-block" />
                <span className="text-xs text-pink-300 font-medium animate-pulse">Generating...</span>
              </span>
            )}
          </div>
        )}

        {/* Action bar (Copy, Edit, Regenerate) */}
        {!isEditing && (
          <div className="flex items-center gap-1 mt-1.5 px-1 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity text-slate-400">
            {/* Copy button */}
            <button
              onClick={handleCopy}
              className="p-1 rounded-md hover:bg-slate-800 hover:text-slate-200 transition-colors text-xs flex items-center gap-1 cursor-pointer"
              title="Copy message"
              aria-label="Copy message"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-lime-400" />
                  <span className="text-[11px] text-lime-400">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span className="text-[11px] hidden sm:inline">Copy</span>
                </>
              )}
            </button>

            {/* User Edit button */}
            {isUser && onEditAndResend && !isGenerating && (
              <button
                onClick={() => {
                  setEditContent(message.content);
                  setIsEditing(true);
                }}
                className="p-1 rounded-md hover:bg-slate-800 hover:text-slate-200 transition-colors text-xs flex items-center gap-1 cursor-pointer"
                title="Edit and resend"
                aria-label="Edit and resend"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span className="text-[11px] hidden sm:inline">Edit</span>
              </button>
            )}

            {/* AI Regenerate button */}
            {!isUser && onRegenerate && isLastMessage && !isGenerating && (
              <button
                onClick={onRegenerate}
                className="p-1 rounded-md hover:bg-slate-800 hover:text-slate-200 transition-colors text-xs flex items-center gap-1 cursor-pointer"
                title="Regenerate response"
                aria-label="Regenerate response"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="text-[11px] hidden sm:inline">Regenerate</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* User Avatar */}
      {isUser && (
        <div className="shrink-0 pt-0.5">
          <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 shadow-sm">
            <User className="w-4 h-4" />
          </div>
        </div>
      )}
    </div>
  );
};
