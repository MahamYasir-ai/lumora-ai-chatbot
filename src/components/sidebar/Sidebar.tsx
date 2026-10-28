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
  ChevronRight,
  RotateCcw,
  Bot,
} from 'lucide-react';
import { Conversation, UserSettings } from '../../types/chat';
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
  settings,
  isOpenDesktop,
  onToggleDesktop,
  isOpenMobile,
  onCloseMobile,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');

  // Filter conversations by search term
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
        <div className="px-3 mb-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
          {title}
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
                className={`group relative flex items-center justify-between px-3 py-2 rounded-xl text-sm transition-all cursor-pointer ${
                  isActive
                    ? 'bg-slate-800 text-white font-medium shadow-sm border border-slate-700/60'
                    : 'text-slate-300 hover:bg-slate-850 hover:text-white'
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
                      className="w-full bg-slate-900 text-white px-2 py-0.5 rounded text-xs border border-pink-500 focus:outline-none"
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
                        className={`w-4 h-4 shrink-0 ${
                          isActive ? 'text-pink-400' : 'text-slate-500 group-hover:text-slate-400'
                        }`}
                      />
                      <span className="truncate text-xs font-normal">{conv.title}</span>
                    </div>

                    {/* Action buttons (Rename, Delete) */}
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => startRename(conv, e)}
                        className="p-1 rounded-md hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors"
                        title="Rename chat"
                        aria-label="Rename chat"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onRequestDeleteConversation(conv.id);
                        }}
                        className="p-1 rounded-md hover:bg-rose-950/80 text-slate-400 hover:text-rose-400 transition-colors"
                        title="Delete chat"
                        aria-label="Delete chat"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
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

  const sidebarContent = (
    <div className="flex flex-col h-full bg-[#0d121c] border-r border-slate-800/80 select-none">
      {/* Brand Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-800/80">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-pink-500 via-orange-500 to-lime-400 p-[1.5px] shadow-md shadow-pink-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-pink-300" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-base tracking-tight text-white">{BRAND.name}</span>
              <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded-full bg-pink-500/20 text-pink-300 border border-pink-500/30">
                PRO
              </span>
            </div>
          </div>
        </div>

        {/* Mobile close button or Desktop collapse toggle */}
        <div className="flex items-center gap-1">
          <button
            onClick={onToggleDesktop}
            className="hidden md:flex p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title={isOpenDesktop ? 'Collapse sidebar' : 'Expand sidebar'}
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={onCloseMobile}
            className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Action: New Chat */}
      <div className="p-3">
        <button
          onClick={() => {
            onNewChat();
            onCloseMobile();
          }}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-pink-500/15 via-orange-500/15 to-lime-500/15 hover:from-pink-500/25 hover:via-orange-500/25 hover:to-lime-500/25 border border-pink-500/30 text-white font-medium text-xs tracking-wide shadow-sm hover:shadow-pink-500/10 transition-all duration-200 cursor-pointer active:scale-98"
        >
          <Plus className="w-4 h-4 text-pink-400" />
          <span>New Chat</span>
        </button>
      </div>

      {/* Search Input */}
      {conversations.length > 0 && (
        <div className="px-3 pb-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-500" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-slate-900/90 text-xs text-slate-200 placeholder:text-slate-500 border border-slate-800 focus:outline-none focus:border-pink-500/60"
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
            <MessageSquare className="w-6 h-6 mb-2 stroke-1 opacity-50" />
            <p>No conversations yet.</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Start one with New Chat</p>
          </div>
        ) : filteredConversations.length === 0 ? (
          <div className="h-32 flex flex-col items-center justify-center text-center text-slate-500 text-xs">
            <p>No chats match &ldquo;{searchQuery}&rdquo;</p>
          </div>
        ) : (
          <>
            {renderConversationGroup('Today', grouped.today)}
            {renderConversationGroup('Yesterday', grouped.yesterday)}
            {renderConversationGroup('Earlier', grouped.earlier)}
          </>
        )}
      </div>

      {/* History Clear action if list exists */}
      {conversations.length > 0 && (
        <div className="px-3 py-1.5 border-t border-slate-800/40">
          <button
            onClick={onRequestClearAll}
            className="w-full flex items-center justify-center gap-1.5 py-1.5 text-[11px] text-slate-500 hover:text-rose-400 hover:bg-slate-900 rounded-lg transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Clear all history</span>
          </button>
        </div>
      )}

      {/* Footer: Selected Model & Settings */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-950/60 space-y-2">
        {/* Model Indicator Badge */}
        <div className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-slate-900/90 border border-slate-800 text-xs">
          <div className="flex items-center gap-2">
            <Bot className="w-3.5 h-3.5 text-lime-400" />
            <span className="font-medium text-slate-300 text-[11px]">
              {settings.model === 'gemini-3.1-flash-lite' ? 'Gemini 3.1 Flash Lite' : 'Gemini 3.8 Flash'}
            </span>
          </div>
          <span className="w-1.5 h-1.5 rounded-full bg-lime-400 animate-pulse" title="Active" />
        </div>

        {/* Settings button */}
        <button
          onClick={onOpenSettings}
          className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-850 text-xs transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <Settings className="w-4 h-4 text-slate-400" />
            <span className="font-medium">Settings & Preferences</span>
          </div>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 md:hidden animate-in fade-in duration-200"
          onClick={onCloseMobile}
        />
      )}

      {/* Mobile Drawer */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] transform transition-transform duration-300 ease-in-out md:hidden shadow-2xl ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {sidebarContent}
      </div>

      {/* Desktop Sidebar */}
      <aside
        className={`hidden md:flex flex-col transition-all duration-300 shrink-0 ${
          isOpenDesktop ? 'w-68' : 'w-0 overflow-hidden border-none'
        }`}
      >
        {isOpenDesktop && sidebarContent}
      </aside>
    </>
  );
};
