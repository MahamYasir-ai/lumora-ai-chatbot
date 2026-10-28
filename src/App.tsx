import React, { useState, useEffect, useRef } from 'react';
import {
  Menu,
  Plus,
  ArrowDown,
  Sparkles,
  Bot,
  SlidersHorizontal,
  Zap,
  LogIn,
  User,
  Check,
  ChevronDown,
  ShieldAlert,
} from 'lucide-react';
import { Sidebar } from './components/sidebar/Sidebar';
import { WelcomeScreen } from './components/chat/WelcomeScreen';
import { ChatMessage } from './components/chat/ChatMessage';
import { ChatComposer } from './components/chat/ChatComposer';
import { SettingsModal } from './components/settings/SettingsModal';
import { ConfirmDialog } from './components/chat/ConfirmDialog';
import { ToastContainer } from './components/ui/Toast';
import { AuthModal } from './components/auth/AuthModal';
import { ProModal } from './components/auth/ProModal';
import { BRAND } from './config/brand';
import {
  ChatMessage as ChatMessageType,
  Conversation,
  UserSettings,
  ToastMessage,
} from './types/chat';
import { AuthState, UserAccount } from './types/auth';
import {
  loadStoredConversations,
  saveStoredConversations,
  loadStoredSettings,
  saveStoredSettings,
  clearAllStoredConversations,
  generateTitleFromMessage,
} from './utils/storage';
import { loadStoredAuth, saveStoredAuth, DEFAULT_GUEST_STATE } from './utils/authStorage';
import { sendChatStream } from './services/chatApi';

export default function App() {
  // Persistence state
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [settings, setSettings] = useState<UserSettings>(loadStoredSettings);
  const [authState, setAuthState] = useState<AuthState>(DEFAULT_GUEST_STATE);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // UI state
  const [input, setInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [sidebarOpenDesktop, setSidebarOpenDesktop] = useState(true);
  const [sidebarOpenMobile, setSidebarOpenMobile] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [proModalOpen, setProModalOpen] = useState(false);
  const [modelDropdownOpen, setModelDropdownOpen] = useState(false);
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
    const storedConvs = loadStoredConversations();
    setConversations(storedConvs);
    if (storedConvs.length > 0) {
      setActiveConversationId(storedConvs[0].id);
    }
    const initialSettings = loadStoredSettings();
    setSettings(initialSettings);
    setSidebarOpenDesktop(initialSettings.sidebarOpenDesktop);

    const initialAuth = loadStoredAuth();
    setAuthState(initialAuth);
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

  // Auth Handlers
  const handleLoginSuccess = (account: UserAccount) => {
    const nextAuth: AuthState = { isLoggedIn: true, user: account };
    setAuthState(nextAuth);
    saveStoredAuth(nextAuth);

    // If account is Pro, enable Pro model
    if (account.tier === 'pro') {
      const nextSettings = { ...settings, model: 'gemini-3.8-flash' };
      setSettings(nextSettings);
      saveStoredSettings(nextSettings);
    }

    addToast('success', `Welcome, ${account.name}! Session established.`);
  };

  const handleStayLoggedOut = () => {
    setAuthState(DEFAULT_GUEST_STATE);
    saveStoredAuth(DEFAULT_GUEST_STATE);
    addToast('info', 'Browsing in Guest Mode (Stayed Logged Out). Chats persist locally.');
  };

  const handleLogout = () => {
    setAuthState(DEFAULT_GUEST_STATE);
    saveStoredAuth(DEFAULT_GUEST_STATE);
    // Switch to free model
    const nextSettings = { ...settings, model: 'gemini-3.1-flash-lite' };
    setSettings(nextSettings);
    saveStoredSettings(nextSettings);
    addToast('info', 'Logged out. Now in Guest Mode.');
  };

  const handleActivatePro = () => {
    if (authState.isLoggedIn && authState.user) {
      const updatedUser: UserAccount = { ...authState.user, tier: 'pro' };
      const nextAuth = { isLoggedIn: true, user: updatedUser };
      setAuthState(nextAuth);
      saveStoredAuth(nextAuth);
    }
    const nextSettings = { ...settings, model: 'gemini-3.8-flash' };
    setSettings(nextSettings);
    saveStoredSettings(nextSettings);
    addToast('success', 'Gemini 3.8 Flash Neural (PRO) Activated!');
  };

  const handleSelectModel = (modelId: string) => {
    setModelDropdownOpen(false);
    if (modelId === 'gemini-3.8-flash') {
      const isUserPro = authState.isLoggedIn && authState.user?.tier === 'pro';
      if (!isUserPro) {
        setProModalOpen(true);
        return;
      }
    }
    const nextSettings = { ...settings, model: modelId };
    setSettings(nextSettings);
    saveStoredSettings(nextSettings);
    addToast('info', `Switched to ${modelId === 'gemini-3.8-flash' ? 'Gemini 3.8 Flash (PRO)' : 'Gemini 3.1 Flash Lite (FREE)'}`);
  };

  // Scroll handler
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

  const currentConversation = conversations.find((c) => c.id === activeConversationId) || null;

  const updateConversations = (newConvs: Conversation[]) => {
    setConversations(newConvs);
    saveStoredConversations(newConvs);
  };

  const handleSaveSettings = (newSettings: UserSettings) => {
    setSettings(newSettings);
    saveStoredSettings(newSettings);
    addToast('success', 'Preferences updated');
  };

  const handleNewChat = () => {
    if (isGenerating) {
      handleStopGeneration();
    }
    setActiveConversationId(null);
    setInput('');
  };

  const handleRenameConversation = (id: string, newTitle: string) => {
    const updated = conversations.map((c) =>
      c.id === id ? { ...c, title: newTitle, updatedAt: Date.now() } : c
    );
    updateConversations(updated);
    addToast('info', 'Chat renamed');
  };

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

  const handleConfirmClearAll = () => {
    clearAllStoredConversations();
    setConversations([]);
    setActiveConversationId(null);
    setConfirmClearAllOpen(false);
    addToast('info', 'All conversation history cleared');
  };

  const handleStopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsGenerating(false);

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

  // Message Sender
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
      modelUsed: settings.model,
    };

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
      const current = conversations.find((c) => c.id === convId)!;
      targetConversation = {
        ...current,
        messages: [...current.messages, userMessage, assistantPlaceholder],
        updatedAt: now,
        model: settings.model,
      };
      const updatedList = [
        targetConversation,
        ...conversations.filter((c) => c.id !== convId),
      ];
      updateConversations(updatedList);
    }

    setIsGenerating(true);
    abortControllerRef.current = new AbortController();

    setTimeout(() => scrollToBottom('smooth'), 50);

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

  // Regenerate
  const handleRegenerate = async () => {
    if (!currentConversation || isGenerating) return;
    const messages = currentConversation.messages;
    if (messages.length < 2) return;

    const lastMsg = messages[messages.length - 1];
    if (lastMsg.role !== 'assistant') return;

    const assistantId = lastMsg.id;
    const historyBeforeAssistant = messages.slice(0, messages.length - 1);

    setConversations((prev) =>
      prev.map((c) => {
        if (c.id !== currentConversation.id) return c;
        const updatedMessages = c.messages.map((m) =>
          m.id === assistantId ? { ...m, content: '', isStreaming: true, error: undefined, modelUsed: settings.model } : m
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

  // Edit and resend
  const handleEditAndResend = async (messageIndex: number, newContent: string) => {
    if (!currentConversation || isGenerating) return;

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
      modelUsed: settings.model,
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
  const isPro = settings.model === 'gemini-3.8-flash';

  return (
    <div
      className={`flex h-screen w-screen overflow-hidden ${
        isLight ? 'bg-slate-50 text-slate-900' : 'bg-[#040711] text-slate-100'
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
        onOpenAuth={() => setAuthModalOpen(true)}
        onOpenProModal={() => setProModalOpen(true)}
        onLogout={handleLogout}
        user={authState.user}
        isLoggedIn={authState.isLoggedIn}
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
        {/* Futuristic Top Header HUD */}
        <header
          className={`h-14 px-3 sm:px-6 flex items-center justify-between border-b shrink-0 z-20 backdrop-blur-xl transition-colors ${
            isLight
              ? 'bg-white/90 border-slate-200'
              : 'bg-[#060a14]/90 border-slate-800/80 shadow-sm'
          }`}
        >
          <div className="flex items-center gap-3 min-w-0">
            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setSidebarOpenMobile(true)}
              className="md:hidden p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              aria-label="Open navigation"
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

            {/* Title / Active Session */}
            <div className="flex items-center gap-2 truncate">
              <span className="font-bold text-sm tracking-tight text-white hidden sm:inline">
                {currentConversation ? currentConversation.title : BRAND.name}
              </span>
              <span className="font-bold text-sm tracking-tight text-white sm:hidden truncate max-w-[140px]">
                {currentConversation ? currentConversation.title : BRAND.shortName}
              </span>
            </div>
          </div>

          {/* Header Controls: Free/Pro Model Switcher + Auth Chip + Settings */}
          <div className="flex items-center gap-2">
            {/* Model Selector Dropdown */}
            <div className="relative">
              <button
                onClick={() => setModelDropdownOpen((prev) => !prev)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                  isPro
                    ? 'bg-amber-500/15 border-amber-500/40 text-amber-300 hover:bg-amber-500/25 shadow-sm shadow-amber-500/10'
                    : 'bg-slate-900 border-slate-800 text-slate-200 hover:border-slate-700'
                }`}
                title="Switch AI Engine"
              >
                {isPro ? (
                  <Zap className="w-3.5 h-3.5 text-amber-400 fill-current" />
                ) : (
                  <Bot className="w-3.5 h-3.5 text-lime-400" />
                )}
                <span>{isPro ? 'Gemini 3.8 Flash PRO' : 'Gemini 3.1 Flash Lite'}</span>
                <ChevronDown className="w-3.5 h-3.5 opacity-60 ml-0.5" />
              </button>

              {/* Model Dropdown Menu */}
              {modelDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-30"
                    onClick={() => setModelDropdownOpen(false)}
                  />
                  <div className="absolute right-0 top-full mt-2 w-64 rounded-2xl bg-slate-950/95 border border-slate-800 shadow-2xl p-2 z-40 animate-in fade-in zoom-in-95 backdrop-blur-xl">
                    <div className="text-[10px] font-mono uppercase font-bold text-slate-500 px-2 py-1 tracking-wider">
                      Select Neural Model
                    </div>

                    {/* Free Model */}
                    <button
                      onClick={() => handleSelectModel('gemini-3.1-flash-lite')}
                      className={`w-full text-left p-2 rounded-xl text-xs flex items-center justify-between transition-colors cursor-pointer ${
                        !isPro ? 'bg-slate-800/80 text-white font-medium' : 'text-slate-300 hover:bg-slate-900'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Bot className="w-4 h-4 text-lime-400" />
                        <div>
                          <div className="font-semibold text-white">Gemini 3.1 Flash Lite</div>
                          <div className="text-[10px] text-slate-400">Instant speed • Free for all</div>
                        </div>
                      </div>
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-lime-500/20 text-lime-300 border border-lime-500/30 font-mono font-bold">
                        FREE
                      </span>
                    </button>

                    {/* Pro Model */}
                    <button
                      onClick={() => handleSelectModel('gemini-3.8-flash')}
                      className={`w-full text-left p-2 rounded-xl text-xs flex items-center justify-between transition-colors mt-1 cursor-pointer ${
                        isPro ? 'bg-amber-950/60 border border-amber-500/40 text-white font-medium' : 'text-slate-300 hover:bg-slate-900'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Zap className="w-4 h-4 text-amber-400 fill-current" />
                        <div>
                          <div className="font-semibold text-amber-300">Gemini 3.8 Flash Neural</div>
                          <div className="text-[10px] text-slate-400">Deep reasoning & coding</div>
                        </div>
                      </div>
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 font-mono font-bold">
                        PRO ✨
                      </span>
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Auth Pill: Guest vs Logged In */}
            {authState.isLoggedIn && authState.user ? (
              <div
                onClick={() => setAuthModalOpen(true)}
                className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 cursor-pointer hover:border-slate-700"
                title="Account Profile"
              >
                <div className="w-5 h-5 rounded-md bg-gradient-to-tr from-pink-500 to-orange-400 text-slate-950 font-bold text-[10px] flex items-center justify-center">
                  {authState.user.name.charAt(0).toUpperCase()}
                </div>
                <span className="font-semibold text-xs truncate max-w-[100px]">{authState.user.name}</span>
                <span
                  className={`text-[9px] font-mono px-1 rounded font-bold ${
                    authState.user.tier === 'pro'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {authState.user.tier.toUpperCase()}
                </span>
              </div>
            ) : (
              <button
                onClick={() => setAuthModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-pink-500/15 hover:bg-pink-500/25 border border-pink-500/30 text-pink-300 text-xs font-semibold transition-all cursor-pointer shadow-sm shadow-pink-500/10"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Sign In / Join</span>
                <span className="sm:hidden">Join</span>
              </button>
            )}

            {/* Settings shortcut */}
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
          {/* Subtle Cyberpunk Ambient Glow */}
          <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-[650px] h-[380px] bg-gradient-to-br from-pink-500/15 via-orange-500/10 to-lime-400/10 rounded-full blur-3xl opacity-50" />

          {/* Welcome Screen or Message Feed */}
          {!currentConversation || currentConversation.messages.length === 0 ? (
            <WelcomeScreen
              onSelectSuggestion={(prompt) => handleSendMessage(prompt)}
              activeModel={settings.model}
              onOpenProModal={() => setProModalOpen(true)}
            />
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

          {/* Floating Scroll to Bottom button - only shown during active chat */}
          {showScrollBottom && currentConversation && currentConversation.messages.length > 0 && (
            <button
              onClick={() => scrollToBottom('smooth')}
              className="absolute bottom-6 right-6 p-2.5 rounded-full bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 hover:border-pink-500 shadow-2xl text-slate-200 hover:text-white transition-all duration-200 cursor-pointer flex items-center gap-1.5 text-xs font-semibold z-30 backdrop-blur-md"
              aria-label="Scroll to bottom"
              title="Scroll to latest message"
            >
              <ArrowDown className="w-4 h-4 text-pink-400" />
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
          activeModel={settings.model}
          onOpenModelSelector={() => setModelDropdownOpen(true)}
        />
      </main>

      {/* Auth Modal (Login / Signup / Stay Logged Out) */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
        onStayLoggedOut={handleStayLoggedOut}
      />

      {/* Pro Tier Upgrade / Unlock Modal */}
      <ProModal
        isOpen={proModalOpen}
        onClose={() => setProModalOpen(false)}
        onActivatePro={handleActivatePro}
        onOpenAuth={() => setAuthModalOpen(true)}
        isLoggedIn={authState.isLoggedIn}
      />

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
        message="Are you sure you want to delete this conversation memory? This action cannot be undone."
        confirmLabel="Delete Memory"
        isDestructive={true}
      />

      {/* Clear All Chats Confirmation */}
      <ConfirmDialog
        isOpen={confirmClearAllOpen}
        onClose={() => setConfirmClearAllOpen(false)}
        onConfirm={handleConfirmClearAll}
        title="Wipe Neural Memories"
        message="Are you sure you want to permanently delete all conversations from your browser LocalStorage?"
        confirmLabel="Wipe All History"
        isDestructive={true}
      />

      {/* Toast Notification Container */}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </div>
  );
}
