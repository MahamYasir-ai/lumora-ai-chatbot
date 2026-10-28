import React from 'react';
import { Cpu, Zap, Terminal, Orbit, Sparkles, ArrowUpRight } from 'lucide-react';
import { BRAND } from '../../config/brand';

interface WelcomeScreenProps {
  onSelectSuggestion: (prompt: string) => void;
  activeModel: string;
  onOpenProModal: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  onSelectSuggestion,
}) => {
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Cpu':
        return <Cpu className="w-4 h-4 text-pink-400" />;
      case 'Zap':
        return <Zap className="w-4 h-4 text-amber-400" />;
      case 'Terminal':
        return <Terminal className="w-4 h-4 text-lime-400" />;
      default:
        return <Orbit className="w-4 h-4 text-cyan-400" />;
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 py-8 max-w-4xl mx-auto w-full text-center select-none">
      {/* Holographic AI Emblem */}
      <div className="relative mb-6 group cursor-pointer">
        {/* Ambient radiant multi-color glow */}
        <div className="absolute -inset-6 bg-gradient-to-r from-pink-500/20 via-orange-500/20 to-lime-500/20 rounded-full blur-2xl opacity-60 group-hover:opacity-90 transition-opacity duration-700 animate-pulse" />

        {/* Central Geometric Core */}
        <div className="relative w-24 h-24 rounded-3xl bg-slate-950 p-[2px] shadow-2xl border border-slate-700/80 overflow-hidden">
          {/* Animated perimeter laser border */}
          <div className="absolute inset-0 bg-gradient-to-tr from-pink-500 via-orange-500 to-lime-400 opacity-70 group-hover:opacity-100 transition-opacity" />
          <div className="absolute inset-[1.5px] bg-[#070b13] rounded-[22px] flex items-center justify-center">
            {/* Orbital Rings inside */}
            <div className="absolute inset-2 border border-slate-800/80 rounded-2xl rotate-45 group-hover:rotate-90 transition-transform duration-700" />
            <div className="absolute inset-4 border border-pink-500/20 rounded-xl -rotate-12 group-hover:rotate-45 transition-transform duration-700" />
            <Sparkles className="w-10 h-10 text-white relative z-10 transition-transform duration-500 group-hover:scale-110 drop-shadow-[0_0_12px_rgba(236,72,153,0.6)]" />
          </div>
        </div>
      </div>

      {/* Futuristic Headline */}
      <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white mb-3">
        <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-100 to-slate-400">
          Lumora Neural Workspace
        </span>
      </h1>
      <p className="text-xs sm:text-sm text-slate-400 max-w-xl mb-8 leading-relaxed font-sans">
        High-velocity intelligence powered by the official Google Gen AI SDK. Choose instant free queries or toggle deep Pro neural reasoning.
      </p>

      {/* 4 Clickable Futuristic Prompt Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full text-left">
        {BRAND.suggestions.map((item) => (
          <button
            key={item.id}
            onClick={() => onSelectSuggestion(item.prompt)}
            className="group relative p-3.5 sm:p-4 rounded-2xl bg-[#090d16]/80 hover:bg-[#0e1320] border border-slate-800/80 hover:border-pink-500/40 transition-all duration-200 hover:shadow-xl hover:shadow-pink-500/5 hover:-translate-y-0.5 cursor-pointer text-left backdrop-blur-md"
          >
            {/* Top Laser Accent on Hover */}
            <div className="absolute inset-x-0 top-0 h-[1.5px] bg-gradient-to-r from-pink-500 via-orange-400 to-lime-400 opacity-0 group-hover:opacity-100 transition-opacity rounded-t-2xl" />

            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-mono tracking-widest text-slate-500 group-hover:text-pink-400 transition-colors uppercase">
                {item.tag}
              </span>
              <div className="flex items-center gap-1.5">
                <div className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300">
                  {getIcon(item.icon)}
                </div>
                <ArrowUpRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-slate-300 transition-colors" />
              </div>
            </div>

            <h3 className="text-xs sm:text-sm font-bold text-slate-200 group-hover:text-white mb-1">
              {item.title}
            </h3>
            <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
              {item.prompt}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
};
