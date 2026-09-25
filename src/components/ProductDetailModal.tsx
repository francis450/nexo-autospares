import React, { useEffect, useRef, useState } from 'react';
import { 
  X, 
  CheckCircle2, 
  ShieldAlert, 
  ShieldCheck, 
  MessageCircle, 
  ShoppingBag, 
  PhoneCall, 
  MapPin, 
  Truck, 
  Check, 
  Share2,
  Sparkles,
  Download,
  Loader2
} from 'lucide-react';
import { ProductItem, PartSide, VehicleModel } from '../types';
import { SHOP_CONTACT, openWhatsApp, telUrl, trackCall, whatsappUrl } from '../config/contact';
import { sideLabel, unitPriceFor } from '../lib/pricing';
import { SharePoster } from './SharePoster';

// html-to-image is only needed for the share poster; keep it out of the main bundle.
const loadPosterLib = () => import('../lib/posterImage');

interface ProductDetailModalProps {
  product: ProductItem | null;
  preselectedSide?: PartSide;
  selectedVehicle: VehicleModel | null;
  onClose: () => void;
  onAddToCart: (product: ProductItem, side: PartSide, quantity: number) => void;
  onDirectCheckout: (product: ProductItem, side: PartSide, quantity: number) => void;
}

// Keyed by product so side/quantity/poster state never leaks between products,
// and hooks inside the content always run unconditionally.
export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({ product, ...rest }) =>
  product ? <ProductDetailModalContent key={product.id} product={product} {...rest} /> : null;

const ProductDetailModalContent: React.FC<ProductDetailModalProps & { product: ProductItem }> = ({
  product,
  preselectedSide = 'LH',
  selectedVehicle,
  onClose,
  onAddToCart,
  onDirectCheckout,
}) => {
  const defaultSide: PartSide = product.sideAvailable === 'PAIR_ONLY'
    ? 'pair'
    : product.sideAvailable === 'LH_ONLY'
      ? 'LH'
      : product.sideAvailable === 'RH_ONLY'
        ? 'RH'
        : product.sideAvailable === 'UNIVERSAL'
          ? 'universal'
          : preselectedSide;

  const [side, setSide] = useState<PartSide>(defaultSide);
  const [quantity, setQuantity] = useState<number>(1);
  const [shareFeedback, setShareFeedback] = useState<string | null>(null);
  const [posterBusy, setPosterBusy] = useState(false);
  const posterRef = useRef<HTMLDivElement>(null);
  const posterFileRef = useRef<Promise<File> | null>(null);

  const getPosterFile = () => {
    if (!posterFileRef.current && posterRef.current) {
      const fileName = `nexo-${product.partNo.replace(/[^\w-]+/g, '_')}.jpg`;
      const node = posterRef.current;
      posterFileRef.current = loadPosterLib().then(lib => lib.renderPosterFile(node, fileName));
      posterFileRef.current.catch(() => { posterFileRef.current = null; });
    }
    return posterFileRef.current;
  };

  // Pre-render so the tap on Share can call navigator.share while the user gesture is still fresh.
  useEffect(() => {
    const timer = setTimeout(() => { getPosterFile(); }, 400);
    return () => clearTimeout(timer);
  }, []);

  const flashFeedback = (message: string) => {
    setShareFeedback(message);
    setTimeout(() => setShareFeedback(null), 2500);
  };

  // Fitment logic
  const isExactFit = selectedVehicle 
    ? product.fitVehicles.includes(selectedVehicle.id) || product.sideAvailable === 'UNIVERSAL'
    : null;

  // Compute price
  const unitPrice = unitPriceFor(product, side);

  const totalPrice = unitPrice * quantity;

  // WhatsApp Order message
  const handleOrderWhatsApp = () => {
    const sideText = sideLabel(side);
    const carText = selectedVehicle ? `for my ${selectedVehicle.make} ${selectedVehicle.model} (${selectedVehicle.years})` : '';
    
    const message = (
      `Hello Nexo Autospares Kirinyaga Rd,\n\nI want to order:\n• Part: *${product.cleanTitle}*\n• Part No: *${product.partNo}*\n• Side: *${sideText}*\n• Qty: *${quantity}*\n• Price: *KSh ${totalPrice.toLocaleString()}*\n${carText}\n\nPlease confirm availability and M-Pesa payment details.`
    );
    openWhatsApp(message, 'product_detail');
  };

  const handleShare = async () => {
    const posterFile = getPosterFile();
    if (!posterFile) return;
    setPosterBusy(true);
    try {
      const file = await posterFile;
      const text = `${product.cleanTitle} · Part No. ${product.partNo} · KSh ${product.price.toLocaleString()} at ${SHOP_CONTACT.name}, ${SHOP_CONTACT.addressShort}.\nOrder on WhatsApp: ${whatsappUrl(undefined, { withRef: false })}`;
      const { shareOrDownload } = await loadPosterLib();
      const result = await shareOrDownload(file, text);
      if (result === 'downloaded') flashFeedback('Poster downloaded');
    } catch {
      flashFeedback('Could not create poster');
    } finally {
      setPosterBusy(false);
    }
  };

  const handleDownloadPoster = async () => {
    const posterFile = getPosterFile();
    if (!posterFile) return;
    setPosterBusy(true);
    try {
      const { downloadFile } = await loadPosterLib();
      downloadFile(await posterFile);
      flashFeedback('Poster downloaded');
    } catch {
      flashFeedback('Could not create poster');
    } finally {
      setPosterBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/65 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="w-full sm:max-w-2xl bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col max-h-[92vh] sm:max-h-[88vh] overflow-hidden border border-slate-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Off-screen poster template captured by Share / Download */}
        <div aria-hidden="true" className="fixed top-0 left-[-10000px] pointer-events-none">
          <SharePoster ref={posterRef} product={product} />
        </div>

        {/* Modal Top Bar */}
        <div className="p-3.5 sm:p-4 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              {product.category}
            </span>
            <span className="text-slate-300">·</span>
            <span className="text-xs font-mono font-semibold text-slate-600">
              Part #{product.partNo}
            </span>
          </div>

          <div className="flex items-center gap-1">
            {shareFeedback && (
              <span role="status" className="text-[11px] font-semibold text-emerald-700 mr-1">
                {shareFeedback}
              </span>
            )}
            <button
              onClick={handleDownloadPoster}
              disabled={posterBusy}
              className="p-2 rounded-full hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors disabled:opacity-50"
              title="Download poster"
              aria-label="Download poster image"
            >
              <Download className="w-4 h-4" />
            </button>
            <button
              onClick={handleShare}
              disabled={posterBusy}
              className="p-2 rounded-full hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors disabled:opacity-50"
              title="Share poster"
              aria-label="Share poster image"
            >
              {posterBusy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Share2 className="w-4 h-4" />}
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {/* Main Large Photo */}
          <div className="relative w-full aspect-16/10 sm:aspect-16/9 bg-slate-100 rounded-xl overflow-hidden border border-slate-100 flex items-center justify-center">
            <img
              src={product.image}
              alt={product.cleanTitle}
              className="w-full h-full object-cover object-center"
              referrerPolicy="no-referrer"
            />
            {product.isPosterPromo && (
              <div className="absolute top-3 left-3 bg-[#E11D48] text-white text-xs font-extrabold px-2.5 py-1 rounded-md shadow-md uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Featured Stock</span>
              </div>
            )}
            <div className="absolute bottom-3 right-3 bg-black/80 backdrop-blur-xs text-white text-xs font-semibold px-2.5 py-1 rounded-md">
              Kirinyaga Rd Counter Stock
            </div>
          </div>

          {/* Title & Price Header */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight leading-snug">
                {product.cleanTitle}
              </h1>
            </div>

            <div className="sm:text-right shrink-0">
              <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono-nums">
                KSh {unitPrice.toLocaleString()}
              </div>
              <div className="text-xs text-slate-500 mt-0.5">
                {side === 'pair' ? 'Per Pair (LH + RH)' : `Per ${product.unit}`}
              </div>
            </div>
          </div>

          {/* Fitment Validation Block (Green check if matches saved car) */}
          <div className={`p-4 rounded-xl border ${
            isExactFit === true
              ? 'bg-emerald-50/70 border-emerald-300 text-emerald-950'
              : isExactFit === false
                ? 'bg-amber-50/70 border-amber-300 text-amber-950'
                : 'bg-slate-50 border-slate-200 text-slate-900'
          }`}>
            <div className="flex items-start gap-3">
              {isExactFit === true ? (
                <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
              ) : isExactFit === false ? (
                <div className="w-8 h-8 rounded-full bg-amber-500 text-white flex items-center justify-center shrink-0">
                  <ShieldAlert className="w-5 h-5" />
                </div>
              ) : (
                <div className="w-8 h-8 rounded-full bg-slate-800 text-white flex items-center justify-center shrink-0">
                  <Check className="w-5 h-5 text-[#E11D48]" />
                </div>
              )}

              <div className="flex-1">
                <div className="text-xs font-bold uppercase tracking-wider">
                  {isExactFit === true
                    ? `✓ FITMENT CONFIRMED FOR YOUR ${selectedVehicle?.model.toUpperCase()}`
                    : isExactFit === false
                      ? `⚠ NOTE: DOES NOT FIT YOUR CURRENTLY SAVED ${selectedVehicle?.model.toUpperCase()}`
                      : 'VEHICLE COMPATIBILITY'
                  }
                </div>
                <div className="text-sm font-semibold mt-1">
                  Fits: {product.compatibleModelsText}, {product.fitYears}
                </div>
                <div className="text-xs opacity-80 mt-0.5">
                  {isExactFit === true
                    ? 'Listed as a direct replacement for your car. Send your chassis number on WhatsApp and the counter confirms before you pay.'
                    : 'Not sure it fits? Send your chassis number on WhatsApp and the counter confirms before you pay.'}
                </div>
              </div>
            </div>
          </div>

          {/* Side Selector with "Buy the pair" option */}
          {product.sideAvailable === 'BOTH_SIDES' && (
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                Select Side:
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setSide('LH')}
                  className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                    side === 'LH'
                      ? 'border-slate-900 bg-slate-900 text-white shadow-xs'
                      : 'border-slate-200 bg-white text-slate-800 hover:border-slate-300'
                  }`}
                >
                  <div className="text-xs font-bold">LH Side</div>
                  <div className={`text-[10px] mt-0.5 ${side === 'LH' ? 'text-slate-300' : 'text-slate-500'}`}>
                    Passenger Side
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setSide('RH')}
                  className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                    side === 'RH'
                      ? 'border-slate-900 bg-slate-900 text-white shadow-xs'
                      : 'border-slate-200 bg-white text-slate-800 hover:border-slate-300'
                  }`}
                >
                  <div className="text-xs font-bold">RH Side</div>
                  <div className={`text-[10px] mt-0.5 ${side === 'RH' ? 'text-slate-300' : 'text-slate-500'}`}>
                    Driver Side
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setSide('pair')}
                  className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                    side === 'pair'
                      ? 'border-[#E11D48] bg-[#E11D48] text-white shadow-xs'
                      : 'border-rose-200 bg-rose-50/60 text-[#BE123C] hover:bg-rose-100/60'
                  }`}
                >
                  <div className="text-xs font-bold flex items-center justify-between">
                    <span>Buy the Pair</span>
                    <span className="text-[10px] bg-white/20 px-1 py-0.2 rounded">Save</span>
                  </div>
                  <div className={`text-[10px] mt-0.5 ${side === 'pair' ? 'text-white' : 'text-[#BE123C]'}`}>
                    Both LH + RH
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* Description & Specifications */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Product Overview & Specs
            </h4>
            <p className="text-sm text-slate-600 leading-relaxed">
              {product.description}
            </p>

            <div className="grid grid-cols-2 gap-2 text-xs pt-2">
              {/* Only facts we hold per product; material/condition specs aren't in the data yet. */}
              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-slate-500 block text-[10px] uppercase">Part No.</span>
                <span className="font-semibold font-mono text-slate-800">{product.partNo}</span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-slate-500 block text-[10px] uppercase">Counter Stock</span>
                <span className="font-semibold text-emerald-700">
                  {product.inStock > 0 ? 'In stock' : 'Ask on WhatsApp'}
                </span>
              </div>
            </div>
          </div>

          {/* Physical Kirinyaga Road Counter Trust Banner */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-slate-900 text-[#E11D48] flex items-center justify-center shrink-0">
                <MapPin className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-slate-900 block">Nexo Autospares Shop</span>
                <span className="text-slate-500">{SHOP_CONTACT.addressLong}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <a
                href={telUrl}
                onClick={() => trackCall('product_detail')}
                className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-700 hover:text-slate-900 font-semibold flex items-center gap-1.5"
              >
                <PhoneCall className="w-3.5 h-3.5 text-[#E11D48]" />
                <span>{SHOP_CONTACT.phoneDisplay}</span>
              </a>
            </div>
          </div>
        </div>

        {/* Sticky Bottom Purchase Bar (Mobile first thumb zone) */}
        <div className="p-3.5 sm:p-4 bg-white border-t border-slate-200 shadow-lg flex items-center justify-between gap-2.5 shrink-0">
          {/* Quantity Selector */}
          <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden bg-slate-50 shrink-0">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="w-8 h-10 flex items-center justify-center text-slate-600 hover:bg-slate-200 active:bg-slate-300 font-bold"
              aria-label="Decrease quantity"
            >
              -
            </button>
            <span className="w-8 text-center text-xs font-bold font-mono-nums text-slate-900">
              {quantity}
            </span>
            <button
              onClick={() => setQuantity(quantity + 1)}
              className="w-8 h-10 flex items-center justify-center text-slate-600 hover:bg-slate-200 active:bg-slate-300 font-bold"
              aria-label="Increase quantity"
            >
              +
            </button>
          </div>

          {/* Order on WhatsApp */}
          <button
            onClick={handleOrderWhatsApp}
            className="flex-1 min-h-[44px] px-3 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white text-xs sm:text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
          >
            <MessageCircle className="w-4 h-4 shrink-0" />
            <span className="truncate">Order on WhatsApp</span>
          </button>

          {/* Pay with M-Pesa / Add to Order */}
          <button
            onClick={() => {
              onAddToCart(product, side, quantity);
              onClose();
            }}
            className="flex-1 min-h-[44px] px-3 bg-[#E11D48] hover:bg-[#BE123C] active:scale-[0.98] text-white text-xs sm:text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
          >
            <ShoppingBag className="w-4 h-4 shrink-0" />
            <span className="truncate">Pay with M-Pesa (KSh {totalPrice.toLocaleString()})</span>
          </button>
        </div>
      </div>
    </div>
  );
};
