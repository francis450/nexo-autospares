/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, 
  Car, 
  ShoppingBag, 
  MessageCircle, 
  MapPin, 
  SlidersHorizontal, 
  PhoneCall, 
  Check, 
  X,
  Clock,
  Sparkles,
  ChevronRight,
  Package
} from 'lucide-react';

import { PRODUCTS } from './data/products';
import { VEHICLE_DATABASE } from './data/vehicles';
import { ProductItem, PartSide, VehicleModel, CartItem, Order } from './types';
import { NexoLogo } from './components/NexoLogo';
import { ActiveVehicleBar } from './components/ActiveVehicleBar';
import { VehicleSelectorModal } from './components/VehicleSelectorModal';
import { ProductRowCard } from './components/ProductRowCard';
import { ProductDetailModal } from './components/ProductDetailModal';
import { CheckoutDrawer } from './components/CheckoutDrawer';
import { OrderStatusView } from './components/OrderStatusView';
import { CantFindPartModal } from './components/CantFindPartModal';
import { PromoPosterBanner } from './components/PromoPosterBanner';
import { CategoryTiles } from './components/CategoryTiles';
import { CounterTrustFooter } from './components/CounterTrustFooter';

export default function App() {
  // --- Persistent State ---
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleModel | null>(() => {
    try {
      const saved = localStorage.getItem('nexo_selected_vehicle');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('nexo_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [activeOrder, setActiveOrder] = useState<Order | null>(() => {
    try {
      const saved = localStorage.getItem('nexo_active_order');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Save to localStorage
  useEffect(() => {
    if (selectedVehicle) {
      localStorage.setItem('nexo_selected_vehicle', JSON.stringify(selectedVehicle));
    } else {
      localStorage.removeItem('nexo_selected_vehicle');
    }
  }, [selectedVehicle]);

  useEffect(() => {
    localStorage.setItem('nexo_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    if (activeOrder) {
      localStorage.setItem('nexo_active_order', JSON.stringify(activeOrder));
    }
  }, [activeOrder]);

  // --- UI Modals State ---
  const [isVehicleSelectorOpen, setIsVehicleSelectorOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isCantFindModalOpen, setIsCantFindModalOpen] = useState(false);
  const [selectedProductForModal, setSelectedProductForModal] = useState<ProductItem | null>(null);
  const [preselectedSideForModal, setPreselectedSideForModal] = useState<PartSide>('LH');
  const [currentView, setCurrentView] = useState<'catalog' | 'order_status'>('catalog');

  // --- Filtering State ---
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [onlyShowMatchingVehicle, setOnlyShowMatchingVehicle] = useState(false);

  // Cart total items
  const cartItemCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  // --- Add to Cart Handler ---
  const handleAddToCart = (product: ProductItem, side: PartSide, quantity: number = 1) => {
    const unitPrice = (side === 'pair' && product.pairPrice)
      ? product.pairPrice
      : (side === 'pair')
        ? product.price * 2
        : product.price;

    setCart(prev => {
      const existingIndex = prev.findIndex(
        item => item.productId === product.id && item.selectedSide === side
      );

      if (existingIndex > -1) {
        const updated = [...prev];
        const newQty = updated[existingIndex].quantity + quantity;
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: newQty,
          totalPrice: newQty * unitPrice,
        };
        return updated;
      } else {
        return [
          ...prev,
          {
            productId: product.id,
            product,
            selectedSide: side,
            quantity,
            unitPrice,
            totalPrice: unitPrice * quantity,
          },
        ];
      }
    });

    // Auto open checkout drawer for instant feedback
    setIsCheckoutOpen(true);
  };

  const handleUpdateQuantity = (productId: string, side: string, delta: number) => {
    setCart(prev => {
      return prev
        .map(item => {
          if (item.productId === productId && item.selectedSide === side) {
            const newQty = item.quantity + delta;
            return newQty > 0
              ? { ...item, quantity: newQty, totalPrice: newQty * item.unitPrice }
              : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[];
    });
  };

  const handleRemoveItem = (productId: string, side: string) => {
    setCart(prev => prev.filter(item => !(item.productId === productId && item.selectedSide === side)));
  };

  // Direct WhatsApp query for a part
  const handleDirectWhatsApp = (product: ProductItem, side: PartSide) => {
    const carText = selectedVehicle ? `for my ${selectedVehicle.make} ${selectedVehicle.model} (${selectedVehicle.years})` : '';
    const text = encodeURIComponent(
      `Hello Nexo Autospares (Kirinyaga Rd),\n\nI want to order:\n• Part: *${product.cleanTitle}*\n• Part No: *${product.partNo}*\n• Side: *${side}*\n• Price: *KSh ${product.price.toLocaleString()}*\n${carText}\n\nIs it available right now at the counter?`
    );
    window.open(`https://wa.me/254141088163?text=${text}`, '_blank');
  };

  // --- Filtered Products List ---
  const filteredProducts = useMemo(() => {
    return PRODUCTS.filter(p => {
      // Category filter
      if (selectedCategory !== 'All' && p.category !== selectedCategory) {
        return false;
      }

      // Search filter
      if (searchQuery.trim().length > 0) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = p.cleanTitle.toLowerCase().includes(query);
        const matchesName = p.name.toLowerCase().includes(query);
        const matchesPartNo = p.partNo.toLowerCase().includes(query);
        const matchesModel = p.compatibleModelsText.toLowerCase().includes(query);
        const matchesCategory = p.category.toLowerCase().includes(query);

        if (!matchesTitle && !matchesName && !matchesPartNo && !matchesModel && !matchesCategory) {
          return false;
        }
      }

      // Vehicle fitment filter
      if (selectedVehicle && onlyShowMatchingVehicle) {
        const fits = p.fitVehicles.includes(selectedVehicle.id) || p.sideAvailable === 'UNIVERSAL';
        if (!fits) return false;
      }

      return true;
    });
  }, [selectedCategory, searchQuery, selectedVehicle, onlyShowMatchingVehicle]);

  // Matching count for active vehicle
  const matchingVehicleCount = useMemo(() => {
    if (!selectedVehicle) return undefined;
    return PRODUCTS.filter(p => p.fitVehicles.includes(selectedVehicle.id) || p.sideAvailable === 'UNIVERSAL').length;
  }, [selectedVehicle]);

  const handleOrderPlaced = (order: Order) => {
    setActiveOrder(order);
    setCart([]);
    setIsCheckoutOpen(false);
    setCurrentView('order_status');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F9FA] text-[#111111]">
      {/* 1. TOP HEADER (Following Top Bar Contract: Zone 1 Wordmark, Zone 2 Clean Links, Zone 3 Actions) */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
          {/* Zone 1: Nexo Autospares Logo */}
          <button 
            onClick={() => setCurrentView('catalog')}
            className="flex items-center gap-2 cursor-pointer focus:outline-none"
            aria-label="Nexo Autospares Home"
          >
            <NexoLogo className="h-8 sm:h-9" />
          </button>

          {/* Zone 2: Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-600">
            <button
              onClick={() => {
                setCurrentView('catalog');
                setSelectedCategory('All');
              }}
              className="hover:text-slate-900 transition-colors cursor-pointer"
            >
              Parts Counter
            </button>
            <button
              onClick={() => setIsCantFindModalOpen(true)}
              className="hover:text-slate-900 transition-colors cursor-pointer"
            >
              Can't Find Part?
            </button>
            {activeOrder && (
              <button
                onClick={() => setCurrentView('order_status')}
                className="text-[#E11D48] hover:text-[#BE123C] font-bold transition-colors cursor-pointer flex items-center gap-1"
              >
                <span>Track Order #{activeOrder.orderNumber}</span>
              </button>
            )}
            <a
              href="tel:0141088163"
              className="text-slate-500 hover:text-slate-900 transition-colors flex items-center gap-1"
            >
              <PhoneCall className="w-3.5 h-3.5 text-[#E11D48]" />
              <span>0141088163</span>
            </a>
          </nav>

          {/* Zone 3: Primary Actions (Vehicle Picker Trigger & Cart Drawer Button) */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => setIsVehicleSelectorOpen(true)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border ${
                selectedVehicle
                  ? 'border-emerald-500/50 bg-emerald-50 text-emerald-900 hover:bg-emerald-100'
                  : 'border-slate-300 bg-white text-slate-800 hover:bg-slate-50'
              }`}
            >
              <Car className="w-3.5 h-3.5 text-[#E11D48]" />
              <span className="hidden sm:inline">
                {selectedVehicle ? selectedVehicle.model : 'Select Car'}
              </span>
              <span className="sm:hidden">
                {selectedVehicle ? selectedVehicle.model.split(' ')[0] : 'Car'}
              </span>
            </button>

            {/* Shopping Bag Button with Tabular Numbers */}
            <button
              onClick={() => setIsCheckoutOpen(true)}
              className="relative px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-xs active:scale-95"
              aria-label="View order tray"
            >
              <ShoppingBag className="w-4 h-4 text-[#E11D48]" />
              <span className="hidden sm:inline">Order Tray</span>
              {cartItemCount > 0 && (
                <span className="px-1.5 py-0.5 rounded-full bg-[#E11D48] text-white text-[10px] font-mono-nums font-bold">
                  {cartItemCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* 2. STICKY ACTIVE VEHICLE CHIP (Core Idea: Pick your car first) */}
        <ActiveVehicleBar
          selectedVehicle={selectedVehicle}
          onOpenSelector={() => setIsVehicleSelectorOpen(true)}
          onClearVehicle={() => {
            setSelectedVehicle(null);
            setOnlyShowMatchingVehicle(false);
          }}
          filteredCount={matchingVehicleCount}
        />
      </header>

      {/* Main Content Area */}
      <main className="flex-1">
        {currentView === 'order_status' && activeOrder ? (
          <OrderStatusView
            order={activeOrder}
            onBackToShopping={() => setCurrentView('catalog')}
          />
        ) : (
          <div className="max-w-6xl mx-auto px-4 py-4 sm:py-6">
            {/* If no vehicle is selected, show an inviting Parts Counter Selector Card */}
            {!selectedVehicle && (
              <div className="p-5 sm:p-6 bg-white rounded-2xl border border-slate-200 shadow-sm mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#E11D48] font-mono">
                      STEP 1 · CHOOSE YOUR VEHICLE
                    </span>
                  </div>
                  <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
                    Walking up to the Kirinyaga Road counter?
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 max-w-xl">
                    Say "I drive a 2015 Premio" or "2016 Harrier" and we'll show you the guaranteed right part in seconds. No wrong sides, no dead ends.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  {VEHICLE_DATABASE.filter(v => v.popular).slice(0, 4).map(v => (
                    <button
                      key={v.id}
                      onClick={() => {
                        setSelectedVehicle(v);
                        setOnlyShowMatchingVehicle(true);
                      }}
                      className="px-3 py-2 bg-slate-100 hover:bg-slate-900 hover:text-white text-slate-800 text-xs font-bold rounded-xl transition-all cursor-pointer"
                    >
                      {v.model}
                    </button>
                  ))}
                  <button
                    onClick={() => setIsVehicleSelectorOpen(true)}
                    className="px-4 py-2 bg-[#E11D48] hover:bg-[#BE123C] text-white text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
                  >
                    <span>More Cars</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* 3. PROMO BANNER (In Authentic WhatsApp Poster Style) */}
            <PromoPosterBanner
              onSelectPromoPart={(partId) => {
                const part = PRODUCTS.find(p => p.id === partId);
                if (part) {
                  setSelectedProductForModal(part);
                }
              }}
              onOpenWhatsApp={() => {
                window.open('https://wa.me/254141088163?text=Hello%20Nexo%20Autospares,%20I%20saw%20your%20Harrier%20Head%20Lens%20poster.', '_blank');
              }}
            />

            {/* 4. CATEGORY TILES (Simple Line Icons) */}
            <CategoryTiles
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
              products={PRODUCTS}
            />

            {/* 5. SEARCH & FITMENT FILTER CONTROLS */}
            <div className="bg-white p-3 sm:p-4 rounded-xl border border-slate-200 shadow-2xs mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              {/* Search Bar */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by part name, chassis (e.g. 260, NZE, 47-148), or model..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs sm:text-sm placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-slate-900 transition-colors"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
                  >
                    Clear
                  </button>
                )}
              </div>

              {/* Fitment Toggle (Only show parts matching my car) */}
              {selectedVehicle && (
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => setOnlyShowMatchingVehicle(!onlyShowMatchingVehicle)}
                    className={`px-3 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border ${
                      onlyShowMatchingVehicle
                        ? 'bg-emerald-700 border-emerald-800 text-white shadow-xs'
                        : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    <Check className={`w-3.5 h-3.5 ${onlyShowMatchingVehicle ? 'text-white' : 'text-slate-400'}`} />
                    <span>Only show {selectedVehicle.model} parts</span>
                  </button>
                </div>
              )}
            </div>

            {/* Active Filters Display */}
            {(selectedCategory !== 'All' || searchQuery || onlyShowMatchingVehicle) && (
              <div className="flex flex-wrap items-center gap-2 mb-4 text-xs">
                <span className="text-slate-400 font-medium">Filtering by:</span>
                {selectedCategory !== 'All' && (
                  <span className="px-2 py-0.5 bg-slate-900 text-white rounded-md font-semibold flex items-center gap-1">
                    <span>{selectedCategory}</span>
                    <button onClick={() => setSelectedCategory('All')} className="hover:text-red-400">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {searchQuery && (
                  <span className="px-2 py-0.5 bg-slate-900 text-white rounded-md font-semibold flex items-center gap-1">
                    <span>"{searchQuery}"</span>
                    <button onClick={() => setSearchQuery('')} className="hover:text-red-400">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {onlyShowMatchingVehicle && selectedVehicle && (
                  <span className="px-2 py-0.5 bg-emerald-800 text-white rounded-md font-semibold flex items-center gap-1">
                    <span>Fits {selectedVehicle.model}</span>
                    <button onClick={() => setOnlyShowMatchingVehicle(false)} className="hover:text-emerald-300">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                <button
                  onClick={() => {
                    setSelectedCategory('All');
                    setSearchQuery('');
                    setOnlyShowMatchingVehicle(false);
                  }}
                  className="text-xs text-[#E11D48] hover:underline font-semibold ml-1 cursor-pointer"
                >
                  Reset filters
                </button>
              </div>
            )}

            {/* 6. CLEAN LIST RESULTS (No Pinterest grids, fast compare fitment and side) */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-500 px-1">
                <span>
                  Showing <strong className="text-slate-800 font-mono-nums">{filteredProducts.length}</strong> parts in stock
                </span>
                <span className="hidden sm:inline">
                  Kirinyaga Rd Counter Direct Pricing · Cash / M-Pesa
                </span>
              </div>

              {filteredProducts.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                    <Car className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-bold text-slate-800">
                    No exact parts matched your filters
                  </h3>
                  <p className="text-xs text-slate-500 max-w-md mx-auto">
                    We might have this part at our Kirinyaga shop counter that isn't listed online yet. Tap below to ask our attendants directly on WhatsApp!
                  </p>
                  <div className="flex flex-wrap justify-center gap-2 pt-2">
                    <button
                      onClick={() => setIsCantFindModalOpen(true)}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>Send Photo / Chassis on WhatsApp</span>
                    </button>
                    <button
                      onClick={() => {
                        setSelectedCategory('All');
                        setSearchQuery('');
                        setOnlyShowMatchingVehicle(false);
                      }}
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                    >
                      View All Nexo Stock
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {filteredProducts.map(product => (
                    <ProductRowCard
                      key={product.id}
                      product={product}
                      selectedVehicle={selectedVehicle}
                      onOpenDetails={(p, side) => {
                        setSelectedProductForModal(p);
                        if (side) setPreselectedSideForModal(side);
                      }}
                      onQuickAdd={(p, side) => handleAddToCart(p, side, 1)}
                      onQuickWhatsApp={(p, side) => handleDirectWhatsApp(p, side)}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* 7. "CAN'T FIND YOUR PART?" CALLOUT ON EVERY RESULTS PAGE */}
            <div className="mt-8 bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                  <h3 className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight">
                    Can't find your part in the list?
                  </h3>
                </div>
                <p className="text-xs text-slate-500 max-w-lg">
                  Send a photo of your broken lens, vehicle dashboard, or chassis number over WhatsApp. Our Kirinyaga Road attendants respond in 2 minutes.
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => setIsCantFindModalOpen(true)}
                  className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Send Photo on WhatsApp</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* 8. COUNTER TRUST FOOTER (Kirinyaga Road, Map, Phone & Hours) */}
      <CounterTrustFooter />

      {/* --- MODALS & DRAWERS --- */}
      {/* Vehicle Selector Modal */}
      <VehicleSelectorModal
        isOpen={isVehicleSelectorOpen}
        onClose={() => setIsVehicleSelectorOpen(false)}
        selectedVehicle={selectedVehicle}
        onSelectVehicle={(v) => {
          setSelectedVehicle(v);
          if (v) setOnlyShowMatchingVehicle(true);
        }}
      />

      {/* Product Detail Modal */}
      <ProductDetailModal
        product={selectedProductForModal}
        preselectedSide={preselectedSideForModal}
        selectedVehicle={selectedVehicle}
        onClose={() => setSelectedProductForModal(null)}
        onAddToCart={(p, side, qty) => handleAddToCart(p, side, qty)}
        onDirectCheckout={(p, side, qty) => {
          handleAddToCart(p, side, qty);
          setIsCheckoutOpen(true);
        }}
      />

      {/* Checkout Drawer with M-Pesa STK Push */}
      <CheckoutDrawer
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        cartItems={cart}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onOrderPlaced={handleOrderPlaced}
        selectedVehicle={selectedVehicle}
      />

      {/* "Can't Find Your Part" WhatsApp Modal */}
      <CantFindPartModal
        isOpen={isCantFindModalOpen}
        onClose={() => setIsCantFindModalOpen(false)}
        selectedVehicle={selectedVehicle}
      />
    </div>
  );
}
