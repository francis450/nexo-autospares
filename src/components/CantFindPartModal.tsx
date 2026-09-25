import React, { useEffect, useState } from 'react';
import { MessageCircle, Camera, X, CheckCircle2, PhoneCall } from 'lucide-react';
import { VehicleModel } from '../types';
import { SHOP_CONTACT, openWhatsApp, telUrl, trackCall } from '../config/contact';

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
  const [chassisNumber, setChassisNumber] = useState('');
  const [vehicleText, setVehicleText] = useState('');
  const [sent, setSent] = useState(false);

  // Prefill the car each time the modal opens, since the car can be picked after first render.
  useEffect(() => {
    if (!isOpen) return;
    setSent(false);
    if (selectedVehicle && !vehicleText) {
      setVehicleText(`${selectedVehicle.make} ${selectedVehicle.model} (${selectedVehicle.years})`);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSendWhatsApp = () => {
    const text = (
      `Hello Nexo Autospares (Kirinyaga Rd),\n\nI can't find a specific part on your store.\n\n• Car Model: *${vehicleText || 'Not specified'}*\n• Chassis No: *${chassisNumber || 'Not specified'}*\n• Part Needed: *${partNeeded || 'I will send a photo in this chat'}*\n\nCan you check your physical counter stock or incoming shipment? Thanks!`
    );
    openWhatsApp(text, 'cant_find_form');
    setSent(true);
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
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {sent ? (
          /* Success: WhatsApp can't receive attachments from a link, so tell them to add the photo there */
          <div className="p-5 sm:p-6 space-y-4 overflow-y-auto" role="status">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-6 h-6 text-emerald-700 shrink-0" />
              <div>
                <h3 className="text-sm font-bold text-slate-900">WhatsApp is open with your details</h3>
                <p className="text-xs text-slate-600 mt-1">
                  Attach a photo of the old part, or of your logbook, in the WhatsApp chat so the counter can match it.
                </p>
              </div>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700">
              <span className="font-bold block mb-0.5">Counter hours</span>
              {SHOP_CONTACT.hours.map(line => <span key={line} className="block">{line}</span>)}
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={handleSendWhatsApp}
                className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl flex items-center gap-2 cursor-pointer"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Open WhatsApp again</span>
              </button>
              <a
                href={telUrl}
                onClick={() => trackCall('cant_find_form')}
                className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl flex items-center gap-2"
              >
                <PhoneCall className="w-4 h-4 text-[#E11D48]" />
                <span>Call {SHOP_CONTACT.phoneDisplay}</span>
              </a>
              <button
                onClick={onClose}
                className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-900"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Body */}
            <div className="p-4 sm:p-6 space-y-4 overflow-y-auto">
              <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl text-xs text-emerald-950 flex items-start gap-2.5">
                <MessageCircle className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block">Counter WhatsApp Direct: {SHOP_CONTACT.phoneDisplay}</span>
                  <span>Many parts at our counter aren't listed online yet. Send the details and our counter staff will check stock.</span>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <label htmlFor="cf-vehicle" className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
                    Your Vehicle Model & Year:
                  </label>
                  <input
                    id="cf-vehicle"
                    type="text"
                    placeholder="e.g. 2015 Toyota Premio 260 or 2016 Harrier"
                    value={vehicleText}
                    onChange={(e) => setVehicleText(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:bg-white focus:border-slate-900"
                  />
                </div>

                <div>
                  <label htmlFor="cf-chassis" className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
                    Chassis / Frame Number (optional, from your logbook):
                  </label>
                  <input
                    id="cf-chassis"
                    type="text"
                    autoCapitalize="characters"
                    placeholder="e.g. ZRT260-3021488"
                    value={chassisNumber}
                    onChange={(e) => setChassisNumber(e.target.value.toUpperCase())}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono focus:outline-none focus:bg-white focus:border-slate-900"
                  />
                </div>

                <div>
                  <label htmlFor="cf-part" className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
                    What part are you looking for?
                  </label>
                  <textarea
                    id="cf-part"
                    rows={3}
                    placeholder="e.g. Need the outer right tail lens with amber turn signal, or side mirror glass..."
                    value={partNeeded}
                    onChange={(e) => setPartNeeded(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:bg-white focus:border-slate-900 resize-none"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">
                    You can attach a photo of the part in WhatsApp after you tap send.
                  </p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-3 shrink-0">
              <button
                onClick={onClose}
                className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={handleSendWhatsApp}
                className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 active:scale-95 text-white text-xs sm:text-sm font-bold rounded-xl transition-all flex items-center gap-2 shadow-sm cursor-pointer"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Chat with Counter on WhatsApp</span>
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
