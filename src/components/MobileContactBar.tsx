import React from 'react';
import { MessageCircle, PhoneCall } from 'lucide-react';
import { VehicleModel } from '../types';
import { openWhatsApp, telUrl, trackCall } from '../config/contact';

interface MobileContactBarProps {
  selectedVehicle: VehicleModel | null;
}

// Phones only: the header hides the phone number below md, and most orders close on WhatsApp.
export const MobileContactBar: React.FC<MobileContactBarProps> = ({ selectedVehicle }) => {
  const handleWhatsApp = () => {
    const carText = selectedVehicle
      ? `My car: ${selectedVehicle.make} ${selectedVehicle.model} (${selectedVehicle.years})\n`
      : '';
    openWhatsApp(
      `Hello Nexo Autospares (Kirinyaga Rd),\n\n${carText}I'm looking for a part. Can you help?`,
      'mobile_bar'
    );
  };

  return (
    <div className="md:hidden fixed inset-x-0 bottom-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-3 pt-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))]">
      <div className="flex gap-2">
        <button
          onClick={handleWhatsApp}
          className="flex-1 min-h-12 bg-emerald-700 hover:bg-emerald-800 active:scale-[0.98] text-white text-sm font-bold rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer"
        >
          <MessageCircle className="w-5 h-5" />
          <span>Order on WhatsApp</span>
        </button>
        <a
          href={telUrl}
          onClick={() => trackCall('mobile_bar')}
          className="min-h-12 px-5 bg-slate-900 hover:bg-slate-800 active:scale-[0.98] text-white text-sm font-bold rounded-xl flex items-center justify-center gap-2 transition-all"
        >
          <PhoneCall className="w-5 h-5 text-[#E11D48]" />
          <span>Call</span>
        </a>
      </div>
    </div>
  );
};
