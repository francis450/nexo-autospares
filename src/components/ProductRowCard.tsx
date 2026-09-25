import React, { useState } from 'react';
import { Check, ShieldAlert, CheckCircle2, MessageCircle, ShoppingBag, ChevronRight } from 'lucide-react';
import { ProductItem, PartSide, VehicleModel } from '../types';
import { unitPriceFor } from '../lib/pricing';

interface ProductRowCardProps {
  product: ProductItem;
  selectedVehicle: VehicleModel | null;
  onOpenDetails: (product: ProductItem, preselectedSide?: PartSide) => void;
  onQuickAdd: (product: ProductItem, side: PartSide) => void;
  onQuickWhatsApp: (product: ProductItem, side: PartSide) => void;
}

export const ProductRowCard: React.FC<ProductRowCardProps> = ({
  product,
  selectedVehicle,
  onOpenDetails,
  onQuickAdd,
  onQuickWhatsApp,
}) => {
  // Side state for this row
  const defaultSide: PartSide = product.sideAvailable === 'PAIR_ONLY' 
    ? 'pair' 
    : product.sideAvailable === 'LH_ONLY' 
      ? 'LH' 
      : product.sideAvailable === 'RH_ONLY'
        ? 'RH'
        : product.sideAvailable === 'UNIVERSAL'
          ? 'universal'
          : 'LH'; // default to LH when both are available

  const [activeSide, setActiveSide] = useState<PartSide>(defaultSide);

  // Fitment verification
  const isMatch = selectedVehicle 
    ? product.fitVehicles.includes(selectedVehicle.id) || product.sideAvailable === 'UNIVERSAL'
    : null;

  // Price adjustment based on side
  const currentPrice = unitPriceFor(product, activeSide);

  return (
    <div className={`group bg-white rounded-xl border transition-all duration-150 p-3 sm:p-4 hover:shadow-md ${
      isMatch === true
        ? 'border-emerald-200/90 hover:border-emerald-400 bg-emerald-50/15'
        : isMatch === false
          ? 'border-slate-200/80 opacity-90'
          : 'border-slate-200/80 hover:border-slate-300'
    }`}>
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
        {/* Photo Container */}
        <div 
          onClick={() => onOpenDetails(product, activeSide)}
          className="relative w-full sm:w-28 sm:h-24 h-40 bg-slate-100 rounded-lg overflow-hidden shrink-0 cursor-pointer border border-slate-100 flex items-center justify-center"
        >
          <img
            src={product.image}
            alt={product.cleanTitle}
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
            referrerPolicy="no-referrer"
          />
          {/* Subtle category overlay pill */}
          <span className="absolute top-1.5 left-1.5 bg-black/75 backdrop-blur-xs text-white text-[10px] font-semibold px-1.5 py-0.5 rounded">
            {product.category}
          </span>
          {product.partNo && (
            <span className="absolute bottom-1.5 right-1.5 bg-white/90 text-slate-800 text-[10px] font-mono-nums font-bold px-1.5 py-0.5 rounded border border-slate-200">
              #{product.partNo}
            </span>
          )}
        </div>

        {/* Center Details */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            {/* Fitment badge */}
            {isMatch === true && (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-800 bg-emerald-100/90 px-2 py-0.5 rounded-md">
                <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                <span>Fits your {selectedVehicle?.model}</span>
              </span>
            )}
            {isMatch === false && selectedVehicle && (
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/70">
                <ShieldAlert className="w-3 h-3 text-amber-600 shrink-0" />
                <span>Fits: {product.compatibleModelsText}</span>
              </span>
            )}
            {/* Stock is hand-entered until ERPNext sync, so no "only N left" counts. */}
            {product.inStock <= 0 ? (
              <span className="text-[11px] font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                Ask on WhatsApp for stock
              </span>
            ) : (
              <span className="text-[11px] font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                In Stock at Counter
              </span>
            )}
          </div>

          {/* Plain Product Name */}
          <h3 
            onClick={() => onOpenDetails(product, activeSide)}
            className="text-sm sm:text-base font-bold text-slate-900 hover:text-[#E11D48] transition-colors cursor-pointer leading-snug line-clamp-1"
          >
            {product.cleanTitle}
          </h3>

          {/* Fitting Years & Model Info */}
          <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">
            Years: <span className="font-semibold text-slate-700">{product.fitYears}</span>
            <span className="mx-1.5">·</span>
            <span className="text-slate-600">{product.compatibleModelsText}</span>
          </p>

          {/* Side Selector Chips (LH / RH / Pair) */}
          {product.hasSideToggle && product.sideAvailable === 'BOTH_SIDES' && (
            <div className="flex items-center gap-1.5 mt-2.5">
              <span className="text-[11px] font-medium text-slate-400 mr-1">Side:</span>
              <button
                type="button"
                onClick={() => setActiveSide('LH')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                  activeSide === 'LH'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                LH (Passenger)
              </button>
              <button
                type="button"
                onClick={() => setActiveSide('RH')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                  activeSide === 'RH'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                RH (Driver)
              </button>
              <button
                type="button"
                onClick={() => setActiveSide('pair')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                  activeSide === 'pair'
                    ? 'bg-[#E11D48] text-white shadow-xs'
                    : 'bg-red-50 text-[#BE123C] hover:bg-red-100'
                }`}
              >
                Buy Pair (LH + RH)
              </button>
            </div>
          )}

          {product.sideAvailable === 'PAIR_ONLY' && (
            <div className="mt-2 text-xs text-slate-500 flex items-center gap-1">
              <Check className="w-3.5 h-3.5 text-slate-400" />
              <span>Sold as complete set / pair</span>
            </div>
          )}
        </div>

        {/* Right: Price & Fast Counter Actions */}
        <div className="sm:text-right flex sm:flex-col items-center sm:items-end justify-between pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 shrink-0 gap-2">
          <div>
            <div className="text-base sm:text-lg font-extrabold text-slate-900 font-mono-nums">
              KSh {currentPrice.toLocaleString()}
            </div>
            {activeSide === 'pair' && product.pairPrice && (
              <div className="text-[10px] text-emerald-700 font-semibold">
                Pair discount applied
              </div>
            )}
            {product.unit && (
              <div className="text-[11px] text-slate-400 hidden sm:block">
                per {activeSide === 'pair' ? 'pair' : product.unit.toLowerCase()}
              </div>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            {/* Quick WhatsApp order button */}
            <button
              onClick={() => onQuickWhatsApp(product, activeSide)}
              title="Order directly on WhatsApp"
              className="px-2.5 py-2 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">WhatsApp</span>
            </button>

            {/* Add to order / Pay with MPesa */}
            <button
              onClick={() => onQuickAdd(product, activeSide)}
              className="px-3.5 py-2 bg-[#E11D48] hover:bg-[#BE123C] active:scale-95 text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Add to Order</span>
            </button>

            <button
              onClick={() => onOpenDetails(product, activeSide)}
              className="sm:hidden p-2 text-slate-400 hover:text-slate-700"
              aria-label="View part details"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
