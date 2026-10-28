import React, { useState } from 'react';
import {
  Plus,
  Search,
  MessageSquare,
  Trash2,
  Edit2,
  Check,
  X,
  Settings,
  Sparkles,
  ChevronLeft,
  RotateCcw,
  Bot,
  User,
  Zap,
  LogIn,
  LogOut,
  ShieldCheck,
} from 'lucide-react';
import { Conversation, UserSettings } from '../../types/chat';
import { UserAccount } from '../../types/auth';
import { BRAND } from '../../config/brand';
import { groupConversationsByDate } from '../../utils/storage';

interface SidebarProps {
  conversations: Conversation[];
  activeConversationId: string | null;
  onSelectConversation: (id: string) => void;
  onNewChat: () => void;
  onRenameConversation: (id: string, newTitle: string) => void;
  onRequestDeleteConversation: (id: string) => void;
  onRequestClearAll: () => void;
  onOpenSettings: () => void;
  onOpenAuth: () => void;
  onOpenProModal: () => void;
  onLogout: () => void;
  user: UserAccount | null;
  isLoggedIn: boolean;
  settings: UserSettings;
  isOpenDesktop: boolean;
  onToggleDesktop: () => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  conversations,
  activeConversationId,
  onSelectConversation,
  onNewChat,
  onRenameConversation,
  onRequestDeleteConversation,
  onRequestClearAll,
  onOpenSettings,
  onOpenAuth,
  onOpenProModal,
  onLogout,
  user,
  isLoggedIn,
  settings,
  isOpenDesktop,
  onToggleDesktop,
  isOpenMobile,
  onCloseMobile,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');

  const filteredConversations = conversations.filter((c) =>
    c.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const grouped = groupConversationsByDate(filteredConversations);

  const startRename = (conv: Conversation, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(conv.id);
    setEditTitle(conv.title);
  };

  const handleSaveRename = (id: string, e?: React.FormEvent) => {
    e?.preventDefault();
    if (editTitle.trim()) {
      onRenameConversation(id, editTitle.trim());
    }
    setEditingId(null);
  };

  const handleCancelRename = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(null);
  };

  const renderConversationGroup = (title: string, list: Conversation[]) => {
    if (list.length === 0) return null;

    return (
      <div className="mb-4">
        <div className="px-3 mb-1.5 flex items-center justify-between text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest">
          <span>{title}</span>
          <span className="px-1.5 py-0.2 rounded bg-slate-900 text-slate-400">{list.length}</span>
        </div>
        <div className="space-y-1">
          {list.map((conv) => {
            const isActive = conv.id === activeConversationId;
            const isEditing = conv.id === editingId;

            return (
              <div
                key={conv.id}
                onClick={() => {
                  onSelectConversation(conv.id);
                  onCloseMobile();
                }}
                className={`group relative flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-all cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-slate-800 to-slate-850 text-white font-medium shadow-sm border border-pink-500/30'
                    : 'text-slate-400 hover:bg-slate-900/90 hover:text-slate-200'
                }`}
              >
                {isEditing ? (
                  <form
                    onSubmit={(e) => handleSaveRename(conv.id, e)}
                    onClick={(e) => e.stopPropagation()}
                    className="flex items-center gap-1.5 w-full"
                  >
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      autoFocus
                      className="w-full bg-slate-950 text-white px-2 py-1 rounded text-xs border border-pink-500 focus:outline-none"
                    />
                    <button
                      type="submit"
                      className="p-1 hover:text-lime-400 text-slate-300 transition-colors"
                      title="Save"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={handleCancelRename}
                      className="p-1 hover:text-rose-400 text-slate-400 transition-colors"
                      title="Cancel"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </form>
                ) : (
                  <>
                    <div className="flex items-center gap-2.5 min-w-0 pr-1">
                      <MessageSquare
                        className={`w-3.5 h-3.5 shrink-0 ${
                          isActive ? 'text-pink-400' : 'text-slate-600 group-hover:text-slate-400'
                        }`}
                      />
                      <span className="truncate">{conv.title}</span>
                    </div>

                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => startRename(conv, e)}
                        className="p-1 rounded-md hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
                        title="Rename"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onRequestDeleteConversation(conv.id);
                        }}
                        className="p-1 rounded-md hover:bg-rose-950/80 text-slate-400 hover:text-rose-400 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const isPro = settings.model === 'gemini-3.8-flash';

  const sidebarContent = (
    <div className="flex flex-col h-full bg-[#060a12] border-r border-slate-800/80 select-none">
      {/* Brand Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-800/70">
        <div className="flex items-center gap-2.5">
          <div className="relative w-8 h-8 rounded-xl bg-slate-950 p-[1.5px] border border-slate-700/80 shadow-md">
            <div className="absolute inset-0 bg-gradient-to-tr from-pink-500 via-orange-500 to-lime-400 opacity-80 rounded-xl" />
            <div className="relative w-full h-full bg-[#070b14] rounded-[10px] flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-pink-300" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-sm tracking-tight text-white">LUMORA</span>
              <span className="text-[9px] uppercase font-black px-1.5 py-0.2 rounded bg-pink-500/20 text-pink-300 border border-pink-500/30">
                NEURAL
              </span>
            </div>
            <p className="text-[10px] text-slate-500 font-mono">v2.0 • PROXY ACTIVE</p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={onToggleDesktop}
            className="hidden md:flex p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-slate-800 transition-colors"
            title="Collapse sidebar"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={onCloseMobile}
            className="md:hidden p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-slate-800 transition-colors"
            title="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* New Session Action */}
      <div className="p-3">
        <button
          onClick={() => {
            onNewChat();
            onCloseMobile();
          }}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-pink-500/15 via-orange-500/15 to-lime-500/15 hover:from-pink-500/25 hover:via-orange-500/25 hover:to-lime-500/25 border border-pink-500/30 text-white font-semibold text-xs tracking-wide shadow-sm hover:shadow-pink-500/10 transition-all duration-200 cursor-pointer active:scale-98"
        >
          <Plus className="w-4 h-4 text-pink-400" />
          <span>New Neural Chat</span>
        </button>
      </div>

      {/* Search Input */}
      {conversations.length > 0 && (
        <div className="px-3 pb-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-500" />
            <input
              type="text"
              placeholder="Search past memories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-950/80 text-xs text-slate-200 placeholder:text-slate-500 border border-slate-800 focus:outline-none focus:border-pink-500/60 font-sans"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-2 text-slate-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Conversation List */}
      <div className="flex-1 overflow-y-auto px-2 py-1">
        {conversations.length === 0 ? (
          <div className="h-36 flex flex-col items-center justify-center text-center px-4 text-slate-500 text-xs">
            <MessageSquare className="w-6 h-6 mb-2 stroke-1 opacity-40 text-pink-400" />
            <p className="font-medium text-slate-400">Zero active sessions</p>
            <p className="text-[10px] text-slate-600 mt-0.5">Click &lsquo;New Neural Chat&rsquo; to start</p>
          </div>
        ) : filteredConversations.length === 0 ? (
          <div className="h-32 flex flex-col items-center justify-center text-center text-slate-500 text-xs">
            <p>No results for &ldquo;{searchQuery}&rdquo;</p>
          </div>
        ) : (
          <>
            {renderConversationGroup('Today', grouped.today)}
            {renderConversationGroup('Yesterday', grouped.yesterday)}
            {renderConversationGroup('Earlier', grouped.earlier)}
          </>
        )}
      </div>

      {/* Clear all action */}
      {conversations.length > 0 && (
        <div className="px-3 py-1 border-t border-slate-800/40">
          <button
            onClick={onRequestClearAll}
            className="w-full flex items-center justify-center gap-1.5 py-1 text-[10px] text-slate-500 hover:text-rose-400 rounded-lg transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Clear local history</span>
          </button>
        </div>
      )}

      {/* Account & Model Status Footer */}
      <div className="p-3 border-t border-slate-800/80 bg-[#070b14]/90 space-y-2">
        {/* User Auth Card: Guest vs Logged In */}
        <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
          {isLoggedIn && user ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-pink-500 to-orange-400 flex items-center justify-center text-slate-950 font-bold text-xs shrink-0">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="truncate">
                  <div className="text-xs font-bold text-white truncate">{user.name}</div>
                  <div className="text-[10px] text-slate-400 flex items-center gap-1">
                    <span
                      className={`font-mono uppercase font-bold text-[9px] px-1 rounded ${
                        user.tier === 'pro'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {user.tier.toUpperCase()} TIER
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={onLogout}
                className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-slate-900 rounded-lg transition-colors cursor-pointer"
                title="Log Out"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
                  <span>Stayed Logged Out</span>
                </div>
                <p className="text-[10px] text-slate-500">Guest mode active</p>
              </div>
              <button
                onClick={onOpenAuth}
                className="px-2.5 py-1 rounded-lg bg-pink-500/20 hover:bg-pink-500/30 text-pink-300 border border-pink-500/40 text-[11px] font-semibold transition-all cursor-pointer"
              >
                Sign In
              </button>
            </div>
          )}
        </div>

        {/* Model Indicator & Pro Unlock Pill */}
        <div
          onClick={onOpenProModal}
          className={`flex items-center justify-between px-2.5 py-2 rounded-xl border text-xs cursor-pointer transition-all ${
            isPro
              ? 'bg-amber-500/10 border-amber-500/30 text-amber-200'
              : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center gap-2">
            {isPro ? (
              <Zap className="w-3.5 h-3.5 text-amber-400 fill-current" />
            ) : (
              <Bot className="w-3.5 h-3.5 text-lime-400" />
            )}
            <span className="font-semibold text-[11px]">
              {isPro ? 'Gemini 3.8 Flash (PRO)' : 'Gemini 3.1 Flash Lite'}
            </span>
          </div>
          <span
            className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-bold ${
              isPro
                ? 'bg-amber-400/20 text-amber-300 border border-amber-400/40'
                : 'bg-slate-800 text-slate-400'
            }`}
          >
            {isPro ? 'ACTIVE' : 'FREE'}
          </span>
        </div>

        {/* Settings button */}
        <button
          onClick={onOpenSettings}
          className="w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-900 text-xs transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <Settings className="w-3.5 h-3.5 text-slate-400" />
            <span>Workspace Settings</span>
          </div>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {isOpenMobile && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 md:hidden animate-in fade-in duration-200"
          onClick={onCloseMobile}
        />
      )}

      <div
        className={`fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] transform transition-transform duration-300 ease-in-out md:hidden shadow-2xl ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {sidebarContent}
      </div>

      <aside
        className={`hidden md:flex flex-col transition-all duration-300 shrink-0 ${
          isOpenDesktop ? 'w-72' : 'w-0 overflow-hidden border-none'
        }`}
      >
        {isOpenDesktop && sidebarContent}
      </aside>
    </>
  );
};
