import React, { useState, useEffect, useRef } from 'react';
import {
  Menu,
  Plus,
  ArrowDown,
  Sparkles,
  Bot,
  SlidersHorizontal,
} from 'lucide-react';
import { Sidebar } from './components/sidebar/Sidebar';
import { WelcomeScreen } from './components/chat/WelcomeScreen';
import { ChatMessage } from './components/chat/ChatMessage';
import { ChatComposer } from './components/chat/ChatComposer';
import { SettingsModal } from './components/settings/SettingsModal';
import { ConfirmDialog } from './components/chat/ConfirmDialog';
import { ToastContainer } from './components/ui/Toast';
import { BRAND } from './config/brand';
import {
  ChatMessage as ChatMessageType,
  Conversation,
  UserSettings,
  ToastMessage,
} from './types/chat';
import {
  loadStoredConversations,
  saveStoredConversations,
  loadStoredSettings,
  saveStoredSettings,
  clearAllStoredConversations,
  generateTitleFromMessage,
} from './utils/storage';
import { sendChatStream } from './services/chatApi';

export default function App() {
  // Persistence state
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [settings, setSettings] = useState<UserSettings>(loadStoredSettings);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // UI state
  const [input, setInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [sidebarOpenDesktop, setSidebarOpenDesktop] = useState(true);
  const [sidebarOpenMobile, setSidebarOpenMobile] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [showScrollBottom, setShowScrollBottom] = useState(false);

  // Dialog state
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [confirmClearAllOpen, setConfirmClearAllOpen] = useState(false);

  // References
  const chatScrollRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const isUserScrolledUpRef = useRef(false);

  // 1. Initial Load from LocalStorage
  useEffect(() => {
    const stored = loadStoredConversations();
    setConversations(stored);
    if (stored.length > 0) {
      setActiveConversationId(stored[0].id);
    }
    const initialSettings = loadStoredSettings();
    setSettings(initialSettings);
    setSidebarOpenDesktop(initialSettings.sidebarOpenDesktop);
  }, []);

  // 2. Synchronize theme class on root
  useEffect(() => {
    const root = document.documentElement;
    const isDark =
      settings.theme === 'dark' ||
      (settings.theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

    if (isDark) {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
    }
  }, [settings.theme]);

  // Toast Helper
  const addToast = (type: ToastMessage['type'], message: string) => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 6);
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Scroll handler for auto-scroll vs scroll-to-bottom button
  const handleScroll = () => {
    const container = chatScrollRef.current;
    if (!container) return;

    const distanceFromBottom = container.scrollHeight - container.scrollTop - container.clientHeight;
    const isScrolledUp = distanceFromBottom > 150;
    isUserScrolledUpRef.current = isScrolledUp;
    setShowScrollBottom(isScrolledUp);
  };

  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    const container = chatScrollRef.current;
    if (container) {
      container.scrollTo({
        top: container.scrollHeight,
        behavior,
      });
      isUserScrolledUpRef.current = false;
      setShowScrollBottom(false);
    }
  };

  // Active conversation helper
  const currentConversation = conversations.find((c) => c.id === activeConversationId) || null;

  // Save conversations to localStorage whenever they change
  const updateConversations = (newConvs: Conversation[]) => {
    setConversations(newConvs);
    saveStoredConversations(newConvs);
  };

  // Save Settings
  const handleSaveSettings = (newSettings: UserSettings) => {
    setSettings(newSettings);
    saveStoredSettings(newSettings);
    addToast('success', 'Settings updated successfully');
  };

  // 3. New Chat
  const handleNewChat = () => {
    if (isGenerating) {
      handleStopGeneration();
    }
    setActiveConversationId(null);
    setInput('');
  };

  // 4. Rename Conversation
  const handleRenameConversation = (id: string, newTitle: string) => {
    const updated = conversations.map((c) =>
      c.id === id ? { ...c, title: newTitle, updatedAt: Date.now() } : c
    );
    updateConversations(updated);
    addToast('info', 'Chat renamed');
  };

  // 5. Delete Single Conversation
  const handleConfirmDeleteConversation = () => {
    if (!confirmDeleteId) return;
    const updated = conversations.filter((c) => c.id !== confirmDeleteId);
    updateConversations(updated);

    if (activeConversationId === confirmDeleteId) {
      if (updated.length > 0) {
        setActiveConversationId(updated[0].id);
      } else {
        setActiveConversationId(null);
      }
    }
    setConfirmDeleteId(null);
    addToast('info', 'Conversation deleted');
  };

  // 6. Clear All History
  const handleConfirmClearAll = () => {
    clearAllStoredConversations();
    setConversations([]);
    setActiveConversationId(null);
    setConfirmClearAllOpen(false);
    addToast('info', 'All conversation history cleared');
  };

  // 7. Stop Generation
  const handleStopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsGenerating(false);

    // Turn off streaming on any active message
    if (activeConversationId) {
      setConversations((prev) =>
        prev.map((c) => {
          if (c.id !== activeConversationId) return c;
          const messages = c.messages.map((m) => (m.isStreaming ? { ...m, isStreaming: false } : m));
          return { ...c, messages, updatedAt: Date.now() };
        })
      );
    }
    addToast('info', 'Generation stopped');
  };

  // 8. Core Message Sender with Gemini Streaming
  const handleSendMessage = async (textToSend?: string) => {
    const messageContent = (textToSend !== undefined ? textToSend : input).trim();
    if (!messageContent || isGenerating) return;

    setInput('');

    let convId = activeConversationId;
    let targetConversation: Conversation;
    const now = Date.now();

    const userMessage: ChatMessageType = {
      id: 'msg_' + now + '_user',
      role: 'user',
      content: messageContent,
      timestamp: now,
    };

    const assistantPlaceholder: ChatMessageType = {
      id: 'msg_' + (now + 1) + '_assistant',
      role: 'assistant',
      content: '',
      timestamp: now + 1,
      isStreaming: true,
    };

    // If no active conversation, create a fresh one!
    if (!convId || !conversations.some((c) => c.id === convId)) {
      convId = 'conv_' + now;
      const title = generateTitleFromMessage(messageContent);
      targetConversation = {
        id: convId,
        title,
        messages: [userMessage, assistantPlaceholder],
        createdAt: now,
        updatedAt: now,
        model: settings.model,
      };
      const updatedList = [targetConversation, ...conversations];
      updateConversations(updatedList);
      setActiveConversationId(convId);
    } else {
      // Append to current conversation
      const current = conversations.find((c) => c.id === convId)!;
      targetConversation = {
        ...current,
        messages: [...current.messages, userMessage, assistantPlaceholder],
        updatedAt: now,
      };
      const updatedList = [
        targetConversation,
        ...conversations.filter((c) => c.id !== convId),
      ];
      updateConversations(updatedList);
    }

    setIsGenerating(true);
    abortControllerRef.current = new AbortController();

    // Scroll to bottom immediately on send
    setTimeout(() => scrollToBottom('smooth'), 50);

    // Prepare message history to send to Gemini
    const apiMessages = targetConversation.messages
      .filter((m) => m.id !== assistantPlaceholder.id)
      .map((m) => ({
        role: m.role,
        content: m.content,
      }));

    let accumulatedContent = '';

    await sendChatStream({
      messages: apiMessages,
      model: settings.model,
      systemInstruction: settings.systemInstruction,
      temperature: settings.temperature,
      signal: abortControllerRef.current.signal,
      onChunk: (chunk: string) => {
        accumulatedContent += chunk;
        setConversations((prev) => {
          const updated = prev.map((c) => {
            if (c.id !== convId) return c;
            const updatedMessages = c.messages.map((m) => {
              if (m.id === assistantPlaceholder.id) {
                return {
                  ...m,
                  content: accumulatedContent,
                  isStreaming: true,
                };
              }
              return m;
            });
            return { ...c, messages: updatedMessages, updatedAt: Date.now() };
          });
          return updated;
        });

        // Auto-scroll if user has not scrolled up
        if (!isUserScrolledUpRef.current) {
          scrollToBottom('auto');
        }
      },
      onComplete: () => {
        setIsGenerating(false);
        abortControllerRef.current = null;
        setConversations((prev) => {
          const updated = prev.map((c) => {
            if (c.id !== convId) return c;
            const updatedMessages = c.messages.map((m) => {
              if (m.id === assistantPlaceholder.id) {
                return {
                  ...m,
                  content: accumulatedContent,
                  isStreaming: false,
                };
              }
              return m;
            });
            return { ...c, messages: updatedMessages, updatedAt: Date.now() };
          });
          saveStoredConversations(updated);
          return updated;
        });
      },
      onError: (errorMessage: string) => {
        setIsGenerating(false);
        abortControllerRef.current = null;
        setConversations((prev) => {
          const updated = prev.map((c) => {
            if (c.id !== convId) return c;
            const updatedMessages = c.messages.map((m) => {
              if (m.id === assistantPlaceholder.id) {
                return {
                  ...m,
                  content: accumulatedContent,
                  isStreaming: false,
                  error: errorMessage,
                };
              }
              return m;
            });
            return { ...c, messages: updatedMessages, updatedAt: Date.now() };
          });
          saveStoredConversations(updated);
          return updated;
        });
        addToast('error', errorMessage);
      },
    });
  };

  // 9. Regenerate last message
  const handleRegenerate = async () => {
    if (!currentConversation || isGenerating) return;
    const messages = currentConversation.messages;
    if (messages.length < 2) return;

    // Find the last assistant message
    const lastMsg = messages[messages.length - 1];
    if (lastMsg.role !== 'assistant') return;

    const assistantId = lastMsg.id;
    const historyBeforeAssistant = messages.slice(0, messages.length - 1);

    // Reset last assistant message content and mark isStreaming
    setConversations((prev) =>
      prev.map((c) => {
        if (c.id !== currentConversation.id) return c;
        const updatedMessages = c.messages.map((m) =>
          m.id === assistantId ? { ...m, content: '', isStreaming: true, error: undefined } : m
        );
        return { ...c, messages: updatedMessages, updatedAt: Date.now() };
      })
    );

    setIsGenerating(true);
    abortControllerRef.current = new AbortController();

    const apiMessages = historyBeforeAssistant.map((m) => ({
      role: m.role,
      content: m.content,
    }));

    let accumulatedContent = '';

    await sendChatStream({
      messages: apiMessages,
      model: settings.model,
      systemInstruction: settings.systemInstruction,
      temperature: settings.temperature,
      signal: abortControllerRef.current.signal,
      onChunk: (chunk: string) => {
        accumulatedContent += chunk;
        setConversations((prev) =>
          prev.map((c) => {
            if (c.id !== currentConversation.id) return c;
            const updatedMessages = c.messages.map((m) =>
              m.id === assistantId ? { ...m, content: accumulatedContent, isStreaming: true } : m
            );
            return { ...c, messages: updatedMessages, updatedAt: Date.now() };
          })
        );
        if (!isUserScrolledUpRef.current) {
          scrollToBottom('auto');
        }
      },
      onComplete: () => {
        setIsGenerating(false);
        abortControllerRef.current = null;
        setConversations((prev) => {
          const updated = prev.map((c) => {
            if (c.id !== currentConversation.id) return c;
            const updatedMessages = c.messages.map((m) =>
              m.id === assistantId ? { ...m, content: accumulatedContent, isStreaming: false } : m
            );
            return { ...c, messages: updatedMessages, updatedAt: Date.now() };
          });
          saveStoredConversations(updated);
          return updated;
        });
        addToast('success', 'Response regenerated');
      },
      onError: (err) => {
        setIsGenerating(false);
        abortControllerRef.current = null;
        setConversations((prev) => {
          const updated = prev.map((c) => {
            if (c.id !== currentConversation.id) return c;
            const updatedMessages = c.messages.map((m) =>
              m.id === assistantId
                ? { ...m, content: accumulatedContent, isStreaming: false, error: err }
                : m
            );
            return { ...c, messages: updatedMessages, updatedAt: Date.now() };
          });
          saveStoredConversations(updated);
          return updated;
        });
        addToast('error', err);
      },
    });
  };

  // 10. Edit and resend user message
  const handleEditAndResend = async (messageIndex: number, newContent: string) => {
    if (!currentConversation || isGenerating) return;

    // Truncate conversation to this user message index
    const messagesUpToEdit = currentConversation.messages.slice(0, messageIndex);
    const now = Date.now();
    const updatedUserMsg: ChatMessageType = {
      id: 'msg_' + now + '_user',
      role: 'user',
      content: newContent,
      timestamp: now,
    };
    const assistantPlaceholder: ChatMessageType = {
      id: 'msg_' + (now + 1) + '_assistant',
      role: 'assistant',
      content: '',
      timestamp: now + 1,
      isStreaming: true,
    };

    const newMessages = [...messagesUpToEdit, updatedUserMsg, assistantPlaceholder];

    setConversations((prev) =>
      prev.map((c) =>
        c.id === currentConversation.id
          ? { ...c, messages: newMessages, updatedAt: Date.now() }
          : c
      )
    );

    setIsGenerating(true);
    abortControllerRef.current = new AbortController();

    const apiMessages = [...messagesUpToEdit, updatedUserMsg].map((m) => ({
      role: m.role,
      content: m.content,
    }));

    let accumulatedContent = '';

    await sendChatStream({
      messages: apiMessages,
      model: settings.model,
      systemInstruction: settings.systemInstruction,
      temperature: settings.temperature,
      signal: abortControllerRef.current.signal,
      onChunk: (chunk: string) => {
        accumulatedContent += chunk;
        setConversations((prev) =>
          prev.map((c) => {
            if (c.id !== currentConversation.id) return c;
            const updatedMessages = c.messages.map((m) =>
              m.id === assistantPlaceholder.id
                ? { ...m, content: accumulatedContent, isStreaming: true }
                : m
            );
            return { ...c, messages: updatedMessages, updatedAt: Date.now() };
          })
        );
        if (!isUserScrolledUpRef.current) {
          scrollToBottom('auto');
        }
      },
      onComplete: () => {
        setIsGenerating(false);
        abortControllerRef.current = null;
        setConversations((prev) => {
          const updated = prev.map((c) => {
            if (c.id !== currentConversation.id) return c;
            const updatedMessages = c.messages.map((m) =>
              m.id === assistantPlaceholder.id
                ? { ...m, content: accumulatedContent, isStreaming: false }
                : m
            );
            return { ...c, messages: updatedMessages, updatedAt: Date.now() };
          });
          saveStoredConversations(updated);
          return updated;
        });
        addToast('success', 'Message updated & response generated');
      },
      onError: (err) => {
        setIsGenerating(false);
        abortControllerRef.current = null;
        setConversations((prev) => {
          const updated = prev.map((c) => {
            if (c.id !== currentConversation.id) return c;
            const updatedMessages = c.messages.map((m) =>
              m.id === assistantPlaceholder.id
                ? { ...m, content: accumulatedContent, isStreaming: false, error: err }
                : m
            );
            return { ...c, messages: updatedMessages, updatedAt: Date.now() };
          });
          saveStoredConversations(updated);
          return updated;
        });
        addToast('error', err);
      },
    });
  };

  const isLight = settings.theme === 'light';

  return (
    <div
      className={`flex h-screen w-screen overflow-hidden ${
        isLight ? 'bg-slate-50 text-slate-900' : 'bg-[#0b0f17] text-slate-100'
      }`}
    >
      {/* Sidebar Navigation */}
      <Sidebar
        conversations={conversations}
        activeConversationId={activeConversationId}
        onSelectConversation={(id) => setActiveConversationId(id)}
        onNewChat={handleNewChat}
        onRenameConversation={handleRenameConversation}
        onRequestDeleteConversation={(id) => setConfirmDeleteId(id)}
        onRequestClearAll={() => setConfirmClearAllOpen(true)}
        onOpenSettings={() => setSettingsOpen(true)}
        settings={settings}
        isOpenDesktop={sidebarOpenDesktop}
        onToggleDesktop={() => {
          const nextState = !sidebarOpenDesktop;
          setSidebarOpenDesktop(nextState);
          setSettings((prev) => ({ ...prev, sidebarOpenDesktop: nextState }));
          saveStoredSettings({ ...settings, sidebarOpenDesktop: nextState });
        }}
        isOpenMobile={sidebarOpenMobile}
        onCloseMobile={() => setSidebarOpenMobile(false)}
      />

      {/* Main Chat Workspace */}
      <main className="flex-1 flex flex-col h-full min-w-0 relative overflow-hidden">
        {/* Top Header Bar */}
        <header
          className={`h-14 px-3 sm:px-5 flex items-center justify-between border-b shrink-0 z-20 backdrop-blur-md transition-colors ${
            isLight
              ? 'bg-white/80 border-slate-200'
              : 'bg-[#0d121c]/80 border-slate-800/80'
          }`}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setSidebarOpenMobile(true)}
              className="md:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              aria-label="Open conversation menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Desktop Expand Sidebar button if collapsed */}
            {!sidebarOpenDesktop && (
              <button
                onClick={() => {
                  setSidebarOpenDesktop(true);
                  setSettings((prev) => ({ ...prev, sidebarOpenDesktop: true }));
                  saveStoredSettings({ ...settings, sidebarOpenDesktop: true });
                }}
                className="hidden md:flex p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                title="Expand sidebar"
              >
                <Menu className="w-4 h-4" />
              </button>
            )}

            {/* Active Chat Title or Brand Title */}
            <div className="flex items-center gap-2 truncate">
              <span className="font-bold text-sm tracking-tight text-white hidden sm:inline">
                {currentConversation ? currentConversation.title : BRAND.name}
              </span>
              <span className="font-bold text-sm tracking-tight text-white sm:hidden truncate max-w-[160px]">
                {currentConversation ? currentConversation.title : BRAND.shortName}
              </span>
            </div>
          </div>

          {/* Header Right Actions */}
          <div className="flex items-center gap-2">
            {/* Active Model Pill */}
            <div
              className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
                isLight
                  ? 'bg-slate-100 border-slate-200 text-slate-700'
                  : 'bg-slate-900 border-slate-800 text-slate-300'
              }`}
            >
              <Bot className="w-3.5 h-3.5 text-pink-400" />
              <span>{settings.model === 'gemini-3.1-flash-lite' ? '3.1 Flash Lite' : '3.8 Flash'}</span>
            </div>

            {/* New Chat shortcut in header */}
            <button
              onClick={handleNewChat}
              className="p-1.5 sm:px-3 sm:py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1.5 border border-slate-700/60 transition-all cursor-pointer"
              title="Start New Chat"
            >
              <Plus className="w-4 h-4 text-pink-400" />
              <span className="hidden sm:inline">New Chat</span>
            </button>

            {/* Quick Settings shortcut */}
            <button
              onClick={() => setSettingsOpen(true)}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              title="Settings"
              aria-label="Settings"
            >
              <SlidersHorizontal className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Chat Scroll Container */}
        <div
          ref={chatScrollRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto overflow-x-hidden relative flex flex-col"
        >
          {/* Subtle radiant background aura */}
          <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-gradient-to-br from-pink-500/10 via-orange-500/5 to-lime-400/10 rounded-full blur-3xl opacity-60" />

          {/* Welcome Screen when no messages in conversation */}
          {!currentConversation || currentConversation.messages.length === 0 ? (
            <WelcomeScreen onSelectSuggestion={(prompt) => handleSendMessage(prompt)} />
          ) : (
            <div className="py-6 space-y-1 w-full max-w-4xl mx-auto flex-1">
              {currentConversation.messages.map((message, index) => {
                const isLast = index === currentConversation.messages.length - 1;
                return (
                  <ChatMessage
                    key={message.id}
                    message={message}
                    isLastMessage={isLast}
                    isGenerating={isGenerating}
                    onRegenerate={handleRegenerate}
                    onEditAndResend={
                      message.role === 'user'
                        ? (newText) => handleEditAndResend(index, newText)
                        : undefined
                    }
                    onCopySuccess={() => addToast('success', 'Copied to clipboard')}
                  />
                );
              })}
            </div>
          )}

          {/* Scroll to bottom floating button */}
          {showScrollBottom && (
            <button
              onClick={() => scrollToBottom('smooth')}
              className="sticky bottom-4 left-1/2 -translate-x-1/2 p-2.5 rounded-full bg-slate-900 border border-slate-700 shadow-2xl text-slate-200 hover:text-white hover:border-pink-500 transition-all duration-200 cursor-pointer flex items-center gap-1.5 text-xs font-medium z-30"
              aria-label="Scroll to bottom"
            >
              <ArrowDown className="w-4 h-4 text-pink-400" />
              <span>Scroll to bottom</span>
            </button>
          )}
        </div>

        {/* Message Input Composer */}
        <ChatComposer
          input={input}
          setInput={setInput}
          onSend={(customText) => handleSendMessage(customText)}
          onStop={handleStopGeneration}
          isGenerating={isGenerating}
        />
      </main>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        settings={settings}
        onSaveSettings={handleSaveSettings}
        onClearHistory={() => setConfirmClearAllOpen(true)}
      />

      {/* Delete Single Chat Confirmation */}
      <ConfirmDialog
        isOpen={Boolean(confirmDeleteId)}
        onClose={() => setConfirmDeleteId(null)}
        onConfirm={handleConfirmDeleteConversation}
        title="Delete Conversation"
        message="Are you sure you want to delete this conversation? This action cannot be undone."
        confirmLabel="Delete"
        isDestructive={true}
      />

      {/* Clear All Chats Confirmation */}
      <ConfirmDialog
        isOpen={confirmClearAllOpen}
        onClose={() => setConfirmClearAllOpen(false)}
        onConfirm={handleConfirmClearAll}
        title="Clear All Chat History"
        message="Are you sure you want to permanently delete all conversations from your browser LocalStorage?"
        confirmLabel="Clear All"
        isDestructive={true}
      />

      {/* Toast Notification Container */}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </div>
  );
}
