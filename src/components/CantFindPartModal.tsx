import React, { useState } from 'react';
import { MessageCircle, Camera, X, Check, Car, Send } from 'lucide-react';
import { VehicleModel } from '../types';

interface CantFindPartModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedVehicle: VehicleModel | null;
}

export const CantFindPartModal: React.FC<CantFindPartModalProps> = ({
  isOpen,
  onClose,
  selectedVehicle,
}) => {
  const [partNeeded, setPartNeeded] = useState('');
  const [chassisNumber, setChassisNumber] = useState(selectedVehicle ? selectedVehicle.chassis : '');
  const [vehicleText, setVehicleText] = useState(
    selectedVehicle ? `${selectedVehicle.make} ${selectedVehicle.model} (${selectedVehicle.years})` : ''
  );

  if (!isOpen) return null;

  const handleSendWhatsApp = () => {
    const text = encodeURIComponent(
      `Hello Nexo Autospares (Kirinyaga Rd),\n\nI can't find a specific part on your store.\n\n• Car Model: *${vehicleText || 'Not specified'}*\n• Chassis No: *${chassisNumber || 'Not specified'}*\n• Part Needed: *${partNeeded || 'See attached photo'}*\n\nCan you check your physical counter stock or incoming shipment? Thanks!`
    );
    window.open(`https://wa.me/254141088163?text=${text}`, '_blank');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/65 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="w-full sm:max-w-lg bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden border border-slate-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-200">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 tracking-tight">
                Can't find your part?
              </h2>
              <p className="text-xs text-slate-500">
                Send a photo or chassis number directly to our Kirinyaga counter.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 sm:p-6 space-y-4 overflow-y-auto">
          <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl text-xs text-emerald-950 flex items-start gap-2.5">
            <MessageCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block">Counter WhatsApp Direct: 0141088163</span>
              <span>We keep thousands of parts in our physical stores that might not be cataloged online yet. Our counter staff will check immediately!</span>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
                Your Vehicle Model & Year:
              </label>
              <input
                type="text"
                placeholder="e.g. 2015 Toyota Premio 260 or 2016 Harrier"
                value={vehicleText}
                onChange={(e) => setVehicleText(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:bg-white focus:border-slate-900"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
                Chassis / Frame Number (Optional, for 100% match):
              </label>
              <input
                type="text"
                placeholder="e.g. ZRT260-3021488 (from logbook or engine plate)"
                value={chassisNumber}
                onChange={(e) => setChassisNumber(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-mono focus:outline-none focus:bg-white focus:border-slate-900"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
                What part are you looking for?
              </label>
              <textarea
                rows={3}
                placeholder="e.g. Need the outer right tail lens with amber turn signal, or side mirror glass..."
                value={partNeeded}
                onChange={(e) => setPartNeeded(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:bg-white focus:border-slate-900 resize-none"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-3 shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2.5 text-xs font-semibold text-slate-500 hover:text-slate-800"
          >
            Cancel
          </button>
          <button
            onClick={handleSendWhatsApp}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs sm:text-sm font-bold rounded-xl transition-all flex items-center gap-2 shadow-sm cursor-pointer"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Chat with Counter on WhatsApp</span>
          </button>
        </div>
      </div>
    </div>
  );
};
