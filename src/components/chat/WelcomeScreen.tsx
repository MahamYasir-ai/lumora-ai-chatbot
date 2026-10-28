import React from 'react';
import { Atom, PenTool, Code2, Sparkles, ArrowUpRight } from 'lucide-react';
import { BRAND } from '../../config/brand';

interface WelcomeScreenProps {
  onSelectSuggestion: (prompt: string) => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onSelectSuggestion }) => {
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Atom':
        return <Atom className="w-5 h-5 text-pink-400 group-hover:rotate-12 transition-transform duration-300" />;
      case 'PenTool':
        return <PenTool className="w-5 h-5 text-orange-400 group-hover:-translate-y-0.5 transition-transform duration-300" />;
      case 'Code2':
        return <Code2 className="w-5 h-5 text-lime-400 group-hover:scale-110 transition-transform duration-300" />;
      default:
        return <Sparkles className="w-5 h-5 text-pink-400 group-hover:scale-110 transition-transform duration-300" />;
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 py-8 max-w-3xl mx-auto w-full text-center">
      {/* Animated AI Emblem */}
      <div className="relative mb-6 group cursor-default">
        {/* Outer glowing aura with vibrant pink, orange, lime */}
        <div className="absolute -inset-4 bg-gradient-to-r from-pink-500 via-orange-500 to-lime-400 rounded-full blur-2xl opacity-40 group-hover:opacity-75 transition-opacity duration-700 animate-pulse" />
        
        {/* Core emblem container */}
        <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-tr from-pink-500 via-orange-500 to-lime-400 p-[2px] shadow-2xl shadow-pink-500/30">
          <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center relative overflow-hidden">
            {/* Ambient internal light */}
            <div className="absolute inset-0 bg-gradient-to-br from-pink-500/20 via-transparent to-lime-500/20" />
            <Sparkles className="w-10 h-10 text-white relative z-10 animate-bounce transition-transform duration-500" style={{ animationDuration: '3s' }} />
          </div>
        </div>
      </div>

      {/* Headline & Description */}
      <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-3">
        {BRAND.tagline}
      </h1>
      <p className="text-sm sm:text-base text-slate-400 max-w-xl mb-8 leading-relaxed">
        {BRAND.subtitle}
      </p>

      {/* 4 Clickable Suggestion Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 w-full text-left">
        {BRAND.suggestions.map((suggestion) => (
          <button
            key={suggestion.id}
            onClick={() => onSelectSuggestion(suggestion.prompt)}
            className="group relative p-4 rounded-2xl bg-slate-900/60 hover:bg-slate-850/90 border border-slate-800/90 hover:border-slate-700 transition-all duration-200 hover:shadow-xl hover:shadow-pink-500/5 hover:-translate-y-0.5 cursor-pointer text-left backdrop-blur-sm"
          >
            {/* Subtle card top glow on hover */}
            <div className="absolute inset-x-0 top-0 h-[1.5px] bg-gradient-to-r from-pink-500/0 via-pink-500/50 to-lime-400/0 opacity-0 group-hover:opacity-100 transition-opacity rounded-t-2xl" />

            <div className="flex items-start justify-between gap-3 mb-2">
              <div className="p-2 rounded-xl bg-slate-800/70 border border-slate-700/60">
                {getIcon(suggestion.icon)}
              </div>
              <span className="p-1 text-slate-500 group-hover:text-slate-300 transition-colors">
                <ArrowUpRight className="w-4 h-4" />
              </span>
            </div>

            <h3 className="text-sm font-semibold text-slate-200 group-hover:text-white mb-1">
              {suggestion.title}
            </h3>
            <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
              {suggestion.prompt}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
};
