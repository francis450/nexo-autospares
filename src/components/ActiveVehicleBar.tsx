import React from 'react';
import { Car, CheckCircle2, ChevronRight, X } from 'lucide-react';
import { VehicleModel } from '../types';

interface ActiveVehicleBarProps {
  selectedVehicle: VehicleModel | null;
  onOpenSelector: () => void;
  onClearVehicle: () => void;
  filteredCount?: number;
}

export const ActiveVehicleBar: React.FC<ActiveVehicleBarProps> = ({
  selectedVehicle,
  onOpenSelector,
  onClearVehicle,
  filteredCount,
}) => {
  if (!selectedVehicle) {
    return (
      <div className="bg-slate-900 text-white px-3 sm:px-4 py-2 border-b border-slate-800 transition-all">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-xs">
            <span className="w-2 h-2 rounded-full bg-[#E11D48] animate-pulse"></span>
            <span className="text-slate-300 hidden sm:inline">Kirinyaga Road Parts Counter:</span>
            <span className="text-slate-100 font-medium">Select your car to see guaranteed fitting parts</span>
          </div>
          <button
            onClick={onOpenSelector}
            className="flex items-center gap-1.5 px-3 py-1 bg-[#E11D48] hover:bg-[#BE123C] text-white text-xs font-bold rounded-lg transition-colors cursor-pointer shrink-0"
          >
            <Car className="w-3.5 h-3.5" />
            <span>Select My Car</span>
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-900 text-white px-3 sm:px-4 py-2 shadow-xs border-b border-slate-800 transition-all">
      <div className="max-w-5xl mx-auto flex items-center justify-between gap-3">
        {/* Left: Active Vehicle Chip */}
        <div className="flex items-center gap-2 min-w-0">
          <div className="flex items-center gap-1.5 bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 px-2.5 py-1 rounded-md text-xs font-semibold shrink-0">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span className="tracking-wide">MY CAR:</span>
          </div>

          <div className="flex items-center gap-1.5 truncate">
            <button
              onClick={onOpenSelector}
              className="text-xs sm:text-sm font-bold text-white hover:text-[#E11D48] truncate transition-colors text-left flex items-center gap-1 cursor-pointer"
            >
              <span className="truncate">{selectedVehicle.make} {selectedVehicle.model}</span>
              <span className="text-slate-400 text-xs font-normal">({selectedVehicle.years})</span>
            </button>
            {filteredCount !== undefined && (
              <span className="hidden md:inline-block text-[11px] text-slate-400 border-l border-slate-700 pl-2">
                {filteredCount} matching {filteredCount === 1 ? 'part' : 'parts'}
              </span>
            )}
          </div>
        </div>

        {/* Right: Change / Clear */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={onOpenSelector}
            className="px-2.5 py-1 text-xs font-semibold bg-white/10 hover:bg-white/20 text-white rounded-md transition-colors cursor-pointer"
          >
            Change
          </button>
          <button
            onClick={onClearVehicle}
            className="p-1 text-slate-400 hover:text-white rounded-md transition-colors cursor-pointer"
            title="Clear vehicle filter"
            aria-label="Clear vehicle filter"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
