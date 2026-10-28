import React from 'react';
import { Sparkles, Zap, CheckCircle2, Bot, ArrowRight, ShieldCheck, Flame } from 'lucide-react';
import { Modal } from '../ui/Modal';

interface ProModalProps {
  isOpen: boolean;
  onClose: () => void;
  onActivatePro: () => void;
  onOpenAuth: () => void;
  isLoggedIn: boolean;
}

export const ProModal: React.FC<ProModalProps> = ({
  isOpen,
  onClose,
  onActivatePro,
  onOpenAuth,
  isLoggedIn,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Unlock Lumora Pro Neural Tier"
      description="Elevate your intelligence workspace with Gemini 3.8 Flash extended reasoning."
      maxWidth="max-w-lg"
    >
      <div className="space-y-4">
        {/* Holographic Header Banner */}
        <div className="relative p-4 rounded-2xl bg-gradient-to-br from-amber-500/10 via-pink-500/10 to-lime-500/10 border border-amber-500/30 overflow-hidden">
          <div className="absolute top-0 right-0 p-3 opacity-20">
            <Flame className="w-24 h-24 text-amber-400" />
          </div>
          <div className="relative z-10 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-400 to-pink-500 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-amber-500/20">
              <Zap className="w-5 h-5 fill-current" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-white text-base">Gemini 3.8 Flash Neural</span>
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/40">
                  PRO MODEL
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">High-capacity reasoning engine for engineering and deep exploration.</p>
            </div>
          </div>
        </div>

        {/* Feature Comparison Grid */}
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-slate-400 font-semibold uppercase text-[10px] tracking-wider">
              <span>Free Tier</span>
              <span className="text-lime-400 font-mono">Current</span>
            </div>
            <div className="font-bold text-white text-sm">Gemini 3.1 Flash Lite</div>
            <ul className="space-y-1.5 text-slate-400 text-[11px]">
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-lime-400 shrink-0" />
                <span>Instant sub-second replies</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-lime-400 shrink-0" />
                <span>Unlimited standard chatting</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-lime-400 shrink-0" />
                <span>Markdown & syntax blocks</span>
              </li>
            </ul>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/90 border border-amber-500/40 shadow-lg shadow-amber-500/5 space-y-2">
            <div className="flex items-center justify-between text-amber-400 font-semibold uppercase text-[10px] tracking-wider">
              <span>Pro Neural</span>
              <span className="text-amber-300 font-mono font-bold">Recommended</span>
            </div>
            <div className="font-bold text-amber-300 text-sm">Gemini 3.8 Flash PRO</div>
            <ul className="space-y-1.5 text-slate-200 text-[11px]">
              <li className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>Deep multi-step reasoning</span>
              </li>
              <li className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>Complex code & architecture</span>
              </li>
              <li className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>Extended context window</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2 pt-2">
          <button
            type="button"
            onClick={() => {
              onActivatePro();
              onClose();
            }}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-400 via-pink-500 to-lime-400 text-slate-950 font-bold text-xs uppercase tracking-wider shadow-lg shadow-amber-500/25 hover:opacity-95 transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-98"
          >
            <Zap className="w-4 h-4 fill-current" />
            <span>Activate 1-Click Free Pro Access</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          {!isLoggedIn && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenAuth();
              }}
              className="w-full py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white bg-slate-950/70 hover:bg-slate-900 border border-slate-800 transition-colors cursor-pointer"
            >
              Already have an account? Sign In
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
};
