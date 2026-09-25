import React, { useState } from 'react';
import { Car, X, Check, Search, ShieldCheck } from 'lucide-react';
import { VEHICLE_DATABASE } from '../data/vehicles';
import { VehicleModel } from '../types';

interface VehicleSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedVehicle: VehicleModel | null;
  onSelectVehicle: (vehicle: VehicleModel | null) => void;
}

export const VehicleSelectorModal: React.FC<VehicleSelectorModalProps> = ({
  isOpen,
  onClose,
  selectedVehicle,
  onSelectVehicle,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMake, setSelectedMake] = useState<string>('Toyota');

  if (!isOpen) return null;

  const makes = Array.from(new Set(VEHICLE_DATABASE.map(v => v.make)));

  const filteredVehicles = VEHICLE_DATABASE.filter(v => {
    const matchesSearch =
      v.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.chassis.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.years.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (searchQuery.trim().length > 0) {
      return matchesSearch;
    }
    return v.make === selectedMake;
  });

  const popularVehicles = VEHICLE_DATABASE.filter(v => v.popular);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="w-full sm:max-w-xl bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col max-h-[90vh] sm:max-h-[85vh] overflow-hidden border border-slate-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-white">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center shrink-0">
              <Car className="w-5 h-5 text-[#E11D48]" />
            </div>
            <div>
              <h2 className="text-base font-bold tracking-tight text-slate-900">
                What car do you drive?
              </h2>
              <p className="text-xs text-slate-500">
                Kirinyaga Rd counter will filter only parts that fit your exact model.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-700 transition-colors"
            aria-label="Close vehicle selector"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Search */}
        <div className="p-3 sm:p-4 border-b border-slate-100 bg-slate-50/70">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="e.g. Premio 260, Harrier, NZE, Probox, Axio..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm placeholder:text-slate-400 focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900 transition-all"
              autoFocus
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 font-medium"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Quick Tap Popular Kenyan Cars */}
        {!searchQuery && (
          <div className="px-4 py-3 bg-white border-b border-slate-100">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
              Popular at the Counter
            </span>
            <div className="flex flex-wrap gap-1.5">
              {popularVehicles.slice(0, 7).map(v => (
                <button
                  key={v.id}
                  onClick={() => {
                    onSelectVehicle(v);
                    onClose();
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                    selectedVehicle?.id === v.id
                      ? 'bg-slate-900 text-white font-semibold'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200 active:scale-95'
                  }`}
                >
                  {v.model}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Brand Tabs (if not searching) */}
        {!searchQuery && (
          <div className="flex items-center px-4 pt-2.5 gap-2 border-b border-slate-100 overflow-x-auto no-scrollbar">
            {makes.map(make => (
              <button
                key={make}
                onClick={() => setSelectedMake(make)}
                className={`pb-2 px-1 text-xs font-semibold whitespace-nowrap transition-colors border-b-2 cursor-pointer ${
                  selectedMake === make
                    ? 'border-[#E11D48] text-slate-900'
                    : 'border-transparent text-slate-400 hover:text-slate-700'
                }`}
              >
                {make}
              </button>
            ))}
          </div>
        )}

        {/* Vehicle Results List */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-1.5">
          {filteredVehicles.length === 0 ? (
            <div className="text-center py-10 px-4">
              <Car className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-medium text-slate-700">No matching model found</p>
              <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                Don't worry, you can browse all parts or send your logbook/chassis on WhatsApp to check our stock!
              </p>
              <button
                onClick={() => {
                  onSelectVehicle(null);
                  onClose();
                }}
                className="mt-4 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-xs font-semibold rounded-lg text-slate-700 transition-colors"
              >
                Browse All Spares Without Filter
              </button>
            </div>
          ) : (
            filteredVehicles.map(vehicle => {
              const isSelected = selectedVehicle?.id === vehicle.id;
              return (
                <button
                  key={vehicle.id}
                  onClick={() => {
                    onSelectVehicle(vehicle);
                    onClose();
                  }}
                  className={`w-full text-left p-3 rounded-xl border transition-all flex items-center justify-between cursor-pointer ${
                    isSelected
                      ? 'border-slate-900 bg-slate-900 text-white shadow-sm'
                      : 'border-slate-200/80 bg-white hover:border-slate-300 hover:bg-slate-50/70 text-slate-800'
                  }`}
                >
                  <div className="min-w-0 pr-2">
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-bold tracking-tight truncate ${isSelected ? 'text-white' : 'text-slate-900'}`}>
                        {vehicle.make} {vehicle.model}
                      </span>
                      <span className={`text-[11px] px-1.5 py-0.5 rounded font-mono ${
                        isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                      }`}>
                        {vehicle.years}
                      </span>
                    </div>
                    <div className={`text-xs mt-0.5 truncate ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>
                      Chassis: {vehicle.chassis}
                    </div>
                  </div>
                  {isSelected ? (
                    <div className="w-6 h-6 rounded-full bg-[#E11D48] text-white flex items-center justify-center shrink-0">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                  ) : (
                    <span className="text-xs font-medium text-[#E11D48] group-hover:underline shrink-0">
                      Select
                    </span>
                  )}
                </button>
              );
            })
          )}
        </div>

        {/* Footer actions */}
        <div className="p-3 sm:p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          {selectedVehicle ? (
            <button
              onClick={() => {
                onSelectVehicle(null);
                onClose();
              }}
              className="text-xs font-medium text-slate-500 hover:text-red-600 transition-colors"
            >
              Clear vehicle filter
            </button>
          ) : (
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>We confirm fitment on WhatsApp before you pay</span>
            </div>
          )}
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 text-white hover:bg-slate-800 text-xs font-medium rounded-lg transition-colors"
          >
            {selectedVehicle ? 'Apply Vehicle' : 'Done'}
          </button>
        </div>
      </div>
    </div>
  );
};
