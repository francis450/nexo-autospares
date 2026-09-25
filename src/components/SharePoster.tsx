import React from 'react';
import { ProductItem } from '../types';
import { SHOP_CONTACT } from '../config/contact';

export const POSTER_WIDTH = 1080;
export const POSTER_HEIGHT = 1350;

interface SharePosterProps {
  product: ProductItem;
}

// Rendered off-screen at full size and captured with html-to-image.
// Keep claims factual: only show what the catalogue data says (no guarantees).
export const SharePoster = React.forwardRef<HTMLDivElement, SharePosterProps>(({ product }, ref) => {
  const fitsText = product.compatibleModelsText.includes(product.fitYears)
    ? product.compatibleModelsText
    : `${product.compatibleModelsText} · ${product.fitYears}`;

  // "Head lens – Harrier 2014–2019" → part type on one line, the car on the next (in red).
  const [titleType, titleCar] = product.cleanTitle.includes(' – ')
    ? product.cleanTitle.split(' – ', 2)
    : [product.cleanTitle, ''];

  const hasPairPrice = product.sideAvailable === 'BOTH_SIDES' && !!product.pairPrice;
  const unitLabel = product.sideAvailable === 'PAIR_ONLY' ? 'per pair' : `per ${product.unit.toLowerCase()}`;

  return (
    <div
      ref={ref}
      style={{ width: POSTER_WIDTH, height: POSTER_HEIGHT }}
      className="relative overflow-hidden bg-[#0F1012] text-white font-sans flex flex-col"
    >
      {/* Diagonal red accents */}
      <div className="absolute -top-[260px] -right-[150px] w-[520px] h-[520px] rotate-[35deg] bg-[#E11D48]" />
      <div className="absolute -top-[260px] right-[250px] w-[36px] h-[480px] rotate-[35deg] bg-[#E11D48]/50" />
      <div className="absolute bottom-[190px] -left-20 w-[700px] h-[14px] -rotate-[4deg] bg-[#E11D48]" />

      {/* Header */}
      <div className="relative flex items-start justify-between px-[64px] pt-[56px]">
        <div className="bg-white rounded-[20px] px-[22px] py-[12px] shadow-2xl">
          <img src="/nexo-autospare.png" alt="" className="h-[108px] w-auto" />
        </div>
        <div className="mt-[18px] text-right">
          <div className="font-display text-[34px] font-extrabold uppercase tracking-[0.08em] text-white">
            {product.category}
          </div>
          <div className="text-[22px] font-semibold text-white/85">{SHOP_CONTACT.addressShort}</div>
        </div>
      </div>

      {/* Title */}
      <div className="relative px-[64px] mt-[40px]">
        <div className="inline-block bg-[#E11D48] px-[26px] py-[6px] -skew-x-[8deg] shadow-lg">
          <span className="block skew-x-[8deg] font-display italic text-[40px] font-extrabold uppercase tracking-wide">
            {product.inStock > 0 ? 'Available now' : 'Ask for stock'}
          </span>
        </div>
        <h1 className="mt-[18px] font-display italic font-black uppercase leading-[0.95] tracking-tight">
          <span className={`block line-clamp-2 ${titleType.length > 18 ? 'text-[80px]' : 'text-[100px]'}`}>{titleType}</span>
          {titleCar && <span className="block text-[76px] text-[#FB7185] truncate">{titleCar}</span>}
        </h1>
      </div>

      {/* Photo + part number */}
      <div className="relative mx-[64px] mt-[32px] flex-1 min-h-0 rounded-[28px] overflow-hidden border-[3px] border-white/10 bg-slate-800">
        <img src={product.image} alt="" className="w-full h-full object-cover object-center" />
        <div className="absolute top-[24px] left-[24px] bg-[#E11D48] rounded-[16px] px-[26px] py-[12px] shadow-2xl border-[3px] border-white/90">
          <div className="text-[22px] font-bold uppercase tracking-wider leading-none">Part No.</div>
          <div className="font-mono text-[52px] font-bold leading-tight">{product.partNo}</div>
        </div>
        <div className="absolute bottom-0 inset-x-0 bg-linear-to-t from-black/90 via-black/60 to-transparent pt-[90px] pb-[24px] px-[28px]">
          <div className="text-[22px] font-bold uppercase tracking-wider text-[#FB7185]">Fits</div>
          <div className="text-[34px] font-bold leading-tight line-clamp-2">{fitsText}</div>
        </div>
      </div>

      {/* Price */}
      <div className="relative px-[64px] mt-[28px] flex items-end justify-between gap-6">
        <div>
          <div className="font-mono text-[84px] font-bold leading-none">
            KSh {product.price.toLocaleString()}
          </div>
          <div className="text-[26px] text-white/75 mt-[6px]">{unitLabel}</div>
        </div>
        {hasPairPrice && (
          <div className="text-right bg-white/10 rounded-[18px] px-[26px] py-[14px] border-[2px] border-white/15">
            <div className="text-[24px] font-bold uppercase tracking-wider text-[#FB7185]">Pair (LH + RH)</div>
            <div className="font-mono text-[50px] font-bold leading-tight">
              KSh {product.pairPrice?.toLocaleString()}
            </div>
          </div>
        )}
      </div>

      {/* Contact strip */}
      <div className="relative mt-[36px] bg-white text-[#0F1012] px-[64px] py-[26px] flex items-center justify-between">
        <div>
          <div className="text-[22px] font-bold uppercase tracking-wider text-[#E11D48]">Call / WhatsApp</div>
          <div className="font-mono text-[54px] font-bold leading-tight">{SHOP_CONTACT.phoneDisplay}</div>
        </div>
        <div className="text-right max-w-[480px]">
          <div className="font-display text-[40px] font-extrabold uppercase leading-none">{SHOP_CONTACT.name}</div>
          <div className="text-[24px] font-semibold text-slate-600 mt-[6px]">{SHOP_CONTACT.addressLong}</div>
        </div>
      </div>
      <div className="relative bg-[#E11D48] py-[14px] text-center text-[22px] font-bold uppercase tracking-[0.14em]">
        Counter pickup · Nairobi courier · Upcountry parcel
      </div>
    </div>
  );
});

SharePoster.displayName = 'SharePoster';
