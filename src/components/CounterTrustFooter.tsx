import React from 'react';
import { MapPin, PhoneCall, Clock, ShieldCheck, Truck, MessageCircle, ExternalLink, Car } from 'lucide-react';
import { NexoLogo } from './NexoLogo';
import { SHOP_CONTACT, telUrl, trackCall, whatsappUrl } from '../config/contact';
import { track } from '../lib/track';

export const CounterTrustFooter: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-white mt-12 border-t border-slate-800">
      {/* Top Shop Highlights Bar */}
      <div className="border-b border-slate-800/80">
        <div className="max-w-6xl mx-auto px-4 py-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0 text-[#E11D48]">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-white block">Kirinyaga Road Shop</span>
              <span className="text-slate-400">120m from Shell Globe roundabout, Nairobi CBD</span>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0 text-[#E11D48]">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-white block">Opening Hours</span>
              <span className="text-slate-400">{SHOP_CONTACT.hours.map(line => <span key={line} className="block">{line}</span>)}</span>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0 text-[#E11D48]">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-white block">Physical Counter Guarantee</span>
              <span className="text-slate-400">Test-fit and exchange at the shop if fitment differs</span>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0 text-[#E11D48]">
              <Truck className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-white block">Boda & Country Parcels</span>
              <span className="text-slate-400">Boda delivery in Nairobi, bus and matatu parcels upcountry</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Body with Map Representation */}
      <div className="max-w-6xl mx-auto px-4 py-8 sm:py-10 grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Brand & Mission */}
        <div className="md:col-span-5 space-y-4">
          <NexoLogo variant="white" className="h-10" />
          <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
            Nexo Autospares is your Kirinyaga Road parts counter in your pocket. We supply genuine automotive head lenses, tail lamps, fog covers, custom TPE mats, windbreakers, and LED upgrades.
          </p>

          <div className="pt-2 flex flex-wrap gap-2 text-xs">
            <a
              href={telUrl}
              onClick={() => trackCall('footer')}
              className="px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg font-semibold flex items-center gap-1.5 transition-colors"
            >
              <PhoneCall className="w-3.5 h-3.5 text-[#E11D48]" />
              <span>Call: {SHOP_CONTACT.phoneDisplay}</span>
            </a>
            <a
              href={whatsappUrl()}
              onClick={() => track('generate_lead', { method: 'whatsapp', source: 'footer' })}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-bold flex items-center gap-1.5 transition-colors"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>WhatsApp Counter</span>
            </a>
          </div>
        </div>

        {/* Map / Directions Card */}
        <div className="md:col-span-7 bg-slate-800/80 rounded-xl p-4 border border-slate-700/80 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#E11D48]" />
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                Store Location Map & Directions
              </span>
            </div>
            <a
              href="https://maps.google.com/?q=Kirinyaga+Road+Nairobi"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] text-slate-300 hover:text-white flex items-center gap-1 font-medium"
            >
              <span>Google Maps</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          {/* Interactive Stylized Kirinyaga Road Street Map Grid */}
          <div className="relative h-32 bg-slate-950 rounded-lg overflow-hidden border border-slate-800 p-3 flex flex-col justify-between">
            {/* Grid street layout */}
            <div className="absolute inset-0 opacity-20">
              <div className="h-full w-full bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
            </div>

            {/* Street names representation */}
            <div className="relative z-10 flex items-center justify-between text-[10px] font-mono text-slate-400">
              <span className="bg-slate-900/90 px-1.5 py-0.5 rounded border border-slate-800">
                To Shell Globe Roundabout (120m) ➔
              </span>
              <span className="text-emerald-400 font-bold">● OPEN NOW</span>
            </div>

            <div className="relative z-10 flex items-center gap-2 bg-slate-900/95 p-2 rounded-lg border border-slate-700/90 max-w-sm">
              <div className="w-6 h-6 rounded-full bg-[#E11D48] text-white flex items-center justify-center shrink-0 font-bold text-[10px]">
                NX
              </div>
              <div className="text-[11px] min-w-0">
                <span className="font-bold text-white block truncate">Nexo Autospares Shop Counter</span>
                <span className="text-slate-400 text-[10px]">Kirinyaga Road, Opp. Auto House</span>
              </div>
            </div>

            <div className="relative z-10 text-[9px] font-mono text-slate-500">
              Kirinyaga Rd · River Rd Corridor · Nairobi Central
            </div>
          </div>

          <p className="text-[11px] text-slate-400">
            Mechanics and vehicle owners are welcome to walk into our shop counter. Free inspection of old lenses & direct advice.
          </p>
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t border-slate-800/80 py-4 px-4 text-center text-xs text-slate-500">
        © {new Date().getFullYear()} Nexo Autospares Nairobi. Quality Spare Parts, Better Drives.
      </div>
    </footer>
  );
};
