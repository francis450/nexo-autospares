import React from 'react';
import { Sparkles, ArrowRight, ShieldCheck, Eye, Layers, CheckCircle2, MessageCircle } from 'lucide-react';
import { heroHarrierImg } from '../data/products';
import { ProductItem } from '../types';

interface PromoPosterBannerProps {
  onSelectPromoPart: (partId: string) => void;
  onOpenWhatsApp: () => void;
}

export const PromoPosterBanner: React.FC<PromoPosterBannerProps> = ({
  onSelectPromoPart,
  onOpenWhatsApp,
}) => {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-[#0C0D0F] text-white border border-slate-800 shadow-xl my-6">
      {/* Background Graphic & Subtle Ambient Red Flare */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#E11D48]/15 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
      <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-slate-800/40 rounded-full blur-2xl pointer-events-none"></div>

      <div className="relative z-10 grid grid-cols-1 md:grid-cols-12 gap-6 p-5 sm:p-8 items-center">
        {/* Left Poster Typographic Energy */}
        <div className="md:col-span-7 space-y-4">
          <div className="flex items-center gap-2">
            <span className="bg-[#E11D48] text-white text-[11px] font-black uppercase tracking-wider px-2.5 py-1 rounded shadow-xs">
              AVAILABLE NOW
            </span>
            <span className="text-xs font-mono font-bold text-slate-400">
              PART NO. 47-148
            </span>
          </div>

          <div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold italic tracking-tight font-display text-white uppercase leading-none">
              HARRIER <span className="text-[#E11D48]">HEAD LENS</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 font-medium mt-2 max-w-lg">
              Fresh Kirinyaga Road counter arrival. Crystal clear replacement lenses for 2014–2019 Toyota Harrier. Restore OEM clarity and beam projection.
            </p>
          </div>

          {/* 4 Feature Badges from the WhatsApp Poster */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
            <div className="flex items-center gap-1.5 p-2 bg-white/5 border border-white/10 rounded-lg text-left">
              <Eye className="w-4 h-4 text-[#E11D48] shrink-0" />
              <div>
                <div className="text-[11px] font-bold text-white leading-tight">Clear Vision</div>
                <div className="text-[9px] text-slate-400">Restores brightness</div>
              </div>
            </div>

            <div className="flex items-center gap-1.5 p-2 bg-white/5 border border-white/10 rounded-lg text-left">
              <ShieldCheck className="w-4 h-4 text-[#E11D48] shrink-0" />
              <div>
                <div className="text-[11px] font-bold text-white leading-tight">Durable</div>
                <div className="text-[9px] text-slate-400">UV non-yellowing</div>
              </div>
            </div>

            <div className="flex items-center gap-1.5 p-2 bg-white/5 border border-white/10 rounded-lg text-left">
              <CheckCircle2 className="w-4 h-4 text-[#E11D48] shrink-0" />
              <div>
                <div className="text-[11px] font-bold text-white leading-tight">Perfect Fit</div>
                <div className="text-[9px] text-slate-400">Harrier 2014–19</div>
              </div>
            </div>

            <div className="flex items-center gap-1.5 p-2 bg-white/5 border border-white/10 rounded-lg text-left">
              <Layers className="w-4 h-4 text-[#E11D48] shrink-0" />
              <div>
                <div className="text-[11px] font-bold text-white leading-tight">OEM Style</div>
                <div className="text-[9px] text-slate-400">Factory specs</div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              onClick={() => onSelectPromoPart('nx-harrier-head-lens')}
              className="px-5 py-3 bg-[#E11D48] hover:bg-[#BE123C] text-white font-bold text-xs sm:text-sm rounded-xl transition-all flex items-center gap-2 cursor-pointer shadow-lg active:scale-95"
            >
              <span>View Harrier Lenses (KSh 4,025)</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={onOpenWhatsApp}
              className="px-4 py-3 bg-white/10 hover:bg-white/15 text-white font-semibold text-xs sm:text-sm rounded-xl transition-all flex items-center gap-2 cursor-pointer"
            >
              <MessageCircle className="w-4 h-4 text-emerald-400" />
              <span>Inquire: 0141088163</span>
            </button>
          </div>
        </div>

        {/* Right Photo Presentation */}
        <div className="md:col-span-5 relative">
          <div className="relative aspect-4/3 rounded-xl overflow-hidden border border-slate-700/80 shadow-2xl group">
            <img
              src={heroHarrierImg}
              alt="Harrier Head Lens counter stock"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
            <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-white">
              <span className="font-semibold">Nexo Kirinyaga Rd Stock</span>
              <span className="font-mono bg-[#E11D48] px-2 py-0.5 rounded text-[11px] font-bold">
                KSh 4,025 / Pc
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
