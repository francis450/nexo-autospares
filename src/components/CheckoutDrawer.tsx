import React, { useState } from 'react';
import { 
  X, 
  Trash2, 
  MapPin, 
  Truck, 
  ShieldCheck, 
  Smartphone, 
  ArrowRight, 
  CheckCircle2, 
  Loader2, 
  Clock,
  Car
} from 'lucide-react';
import { CartItem, Order, VehicleModel } from '../types';

interface CheckoutDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateQuantity: (productId: string, side: string, delta: number) => void;
  onRemoveItem: (productId: string, side: string) => void;
  onOrderPlaced: (order: Order) => void;
  selectedVehicle: VehicleModel | null;
}

export const CheckoutDrawer: React.FC<CheckoutDrawerProps> = ({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onOrderPlaced,
  selectedVehicle,
}) => {
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [fulfillmentType, setFulfillmentType] = useState<'counter_pickup' | 'nairobi_courier' | 'upcountry_parcel'>('counter_pickup');
  const [deliveryLocation, setDeliveryLocation] = useState('');
  
  // M-Pesa STK Push state
  const [isProcessingStk, setIsProcessingStk] = useState(false);
  const [stkStep, setStkStep] = useState<'idle' | 'prompting' | 'entered_pin' | 'confirmed'>('idle');
  const [pinInput, setPinInput] = useState('');
  const [simulatedReceipt, setSimulatedReceipt] = useState('');
  const [validationError, setValidationError] = useState('');

  if (!isOpen) return null;

  const subtotal = cartItems.reduce((acc, item) => acc + item.totalPrice, 0);
  const deliveryFee = fulfillmentType === 'counter_pickup' ? 0 : fulfillmentType === 'nairobi_courier' ? 300 : 350;
  const totalAmount = subtotal + deliveryFee;

  const handleStartMpesaPayment = () => {
    // Validate phone
    const cleanPhone = phone.replace(/\s+/g, '');
    if (!customerName.trim()) {
      setValidationError('Please enter your name.');
      return;
    }
    if (!cleanPhone || cleanPhone.length < 9) {
      setValidationError('Please enter a valid Safaricom phone number (e.g. 0712345678 or 0112345678).');
      return;
    }
    if (fulfillmentType !== 'counter_pickup' && !deliveryLocation.trim()) {
      setValidationError('Please enter your delivery town or street address.');
      return;
    }

    setValidationError('');
    setIsProcessingStk(true);
    setStkStep('prompting');
  };

  const handleSimulatePinSubmission = () => {
    if (pinInput.length !== 4) {
      alert('Please enter a 4-digit PIN to simulate M-Pesa confirmation.');
      return;
    }

    setStkStep('entered_pin');
    setTimeout(() => {
      // Generate authentic Safaricom transaction code
      const randHex = Math.random().toString(36).substring(2, 8).toUpperCase();
      const receipt = `SK${randHex}NX`;
      setSimulatedReceipt(receipt);
      setStkStep('confirmed');

      setTimeout(() => {
        // Create order
        const newOrder: Order = {
          id: `NX-${Math.floor(1000 + Math.random() * 9000)}`,
          orderNumber: `NX-${Math.floor(1000 + Math.random() * 9000)}`,
          createdAt: new Date().toISOString(),
          status: 'confirmed',
          customerName,
          phone,
          fulfillmentType,
          deliveryLocation: deliveryLocation || 'Kirinyaga Road Shop Counter',
          items: cartItems,
          subtotal,
          deliveryFee,
          totalAmount,
          paymentMethod: 'mpesa_stk',
          paymentStatus: 'paid',
          mpesaReceipt: receipt,
          vehicleSelected: selectedVehicle ? `${selectedVehicle.make} ${selectedVehicle.model}` : undefined,
        };

        setIsProcessingStk(false);
        setStkStep('idle');
        onOrderPlaced(newOrder);
      }, 1200);
    }, 1500);
  };

  const handlePayAtCounter = () => {
    if (!customerName.trim()) {
      setValidationError('Please enter your name.');
      return;
    }
    if (!phone.trim()) {
      setValidationError('Please enter your phone number.');
      return;
    }

    const newOrder: Order = {
      id: `NX-${Math.floor(1000 + Math.random() * 9000)}`,
      orderNumber: `NX-${Math.floor(1000 + Math.random() * 9000)}`,
      createdAt: new Date().toISOString(),
      status: 'received',
      customerName,
      phone,
      fulfillmentType,
      deliveryLocation: deliveryLocation || 'Kirinyaga Road Shop Counter',
      items: cartItems,
      subtotal,
      deliveryFee,
      totalAmount,
      paymentMethod: 'pay_on_pickup',
      paymentStatus: 'pending',
      vehicleSelected: selectedVehicle ? `${selectedVehicle.make} ${selectedVehicle.model}` : undefined,
    };

    onOrderPlaced(newOrder);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="w-full sm:max-w-xl h-full bg-white shadow-2xl flex flex-col overflow-hidden"
        role="dialog"
        aria-modal="true"
      >
        {/* Drawer Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
          <div>
            <h2 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <span>Checkout Order</span>
              <span className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full font-mono">
                {cartItems.length} {cartItems.length === 1 ? 'part' : 'parts'}
              </span>
            </h2>
            <p className="text-xs text-slate-500">
              No account creation needed. Direct counter dispatch.
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Checkout Form */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* Cart Items List */}
          <div className="space-y-3">
            <div className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center justify-between">
              <span>Selected Parts</span>
              <span className="text-slate-400 font-normal">KSh Subtotal</span>
            </div>

            {cartItems.length === 0 ? (
              <div className="text-center py-8 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                <p className="text-xs text-slate-500">Your parts counter tray is empty.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {cartItems.map((item) => (
                  <div
                    key={`${item.productId}-${item.selectedSide}`}
                    className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={item.product.image}
                        alt={item.product.cleanTitle}
                        className="w-12 h-12 rounded-lg object-cover border border-slate-200 shrink-0"
                      />
                      <div className="min-w-0">
                        <div className="font-bold text-slate-900 truncate">
                          {item.product.cleanTitle}
                        </div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                          <span className="font-semibold text-[#E11D48]">
                            {item.selectedSide === 'pair' ? 'Pair (LH+RH)' : `${item.selectedSide} Side`}
                          </span>
                          <span>·</span>
                          <span className="font-mono">#{item.product.partNo}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      {/* Quantity stepper */}
                      <div className="flex items-center border border-slate-200 rounded-md bg-white">
                        <button
                          onClick={() => onUpdateQuantity(item.productId, item.selectedSide, -1)}
                          className="px-2 py-0.5 text-slate-600 hover:bg-slate-100 font-bold"
                        >
                          -
                        </button>
                        <span className="px-2 font-mono text-slate-800 font-bold">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => onUpdateQuantity(item.productId, item.selectedSide, 1)}
                          className="px-2 py-0.5 text-slate-600 hover:bg-slate-100 font-bold"
                        >
                          +
                        </button>
                      </div>

                      <div className="text-right min-w-[70px]">
                        <div className="font-bold font-mono-nums text-slate-900">
                          KSh {item.totalPrice.toLocaleString()}
                        </div>
                      </div>

                      <button
                        onClick={() => onRemoveItem(item.productId, item.selectedSide)}
                        className="text-slate-400 hover:text-red-600 p-1"
                        title="Remove part"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Customer Details Form */}
          <div className="space-y-3 pt-2">
            <div className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              1. Customer Details (For M-Pesa & Dispatch)
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                  Full Name / Mechanic Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Francis Kamande"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:bg-white focus:border-slate-900 transition-colors"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                  M-Pesa Phone Number *
                </label>
                <div className="relative">
                  <Smartphone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="tel"
                    placeholder="07... or 01..."
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-mono focus:outline-none focus:bg-white focus:border-slate-900 transition-colors"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Fulfillment Method */}
          <div className="space-y-3 pt-2">
            <div className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              2. Pickup or Delivery Option
            </div>

            <div className="grid grid-cols-1 gap-2.5">
              {/* Pickup Option */}
              <label className={`p-3.5 rounded-xl border flex items-start gap-3 cursor-pointer transition-all ${
                fulfillmentType === 'counter_pickup'
                  ? 'border-slate-900 bg-slate-900 text-white shadow-xs'
                  : 'border-slate-200 bg-slate-50 hover:bg-white text-slate-800'
              }`}>
                <input
                  type="radio"
                  name="fulfillment"
                  checked={fulfillmentType === 'counter_pickup'}
                  onChange={() => setFulfillmentType('counter_pickup')}
                  className="mt-0.5 accent-[#E11D48]"
                />
                <div className="flex-1 text-xs">
                  <div className="flex items-center justify-between font-bold">
                    <span>Kirinyaga Road Shop Counter Pickup</span>
                    <span className="text-emerald-400 font-bold uppercase text-[10px]">Free (KSh 0)</span>
                  </div>
                  <p className={`mt-0.5 ${fulfillmentType === 'counter_pickup' ? 'text-slate-300' : 'text-slate-500'}`}>
                    Ready in 15 mins. 120m from Shell Globe, Kirinyaga Road, Nairobi CBD.
                  </p>
                </div>
              </label>

              {/* Nairobi Courier Option */}
              <label className={`p-3.5 rounded-xl border flex items-start gap-3 cursor-pointer transition-all ${
                fulfillmentType === 'nairobi_courier'
                  ? 'border-slate-900 bg-slate-900 text-white shadow-xs'
                  : 'border-slate-200 bg-slate-50 hover:bg-white text-slate-800'
              }`}>
                <input
                  type="radio"
                  name="fulfillment"
                  checked={fulfillmentType === 'nairobi_courier'}
                  onChange={() => setFulfillmentType('nairobi_courier')}
                  className="mt-0.5 accent-[#E11D48]"
                />
                <div className="flex-1 text-xs">
                  <div className="flex items-center justify-between font-bold">
                    <span>Nairobi Boda Rider / Same-Day Courier</span>
                    <span className="font-mono">+ KSh 300</span>
                  </div>
                  <p className={`mt-0.5 ${fulfillmentType === 'nairobi_courier' ? 'text-slate-300' : 'text-slate-500'}`}>
                    Delivered to your garage/location in CBD, Westlands, Upper Hill, Industrial Area, Rongai.
                  </p>
                </div>
              </label>

              {/* Upcountry Parcel */}
              <label className={`p-3.5 rounded-xl border flex items-start gap-3 cursor-pointer transition-all ${
                fulfillmentType === 'upcountry_parcel'
                  ? 'border-slate-900 bg-slate-900 text-white shadow-xs'
                  : 'border-slate-200 bg-slate-50 hover:bg-white text-slate-800'
              }`}>
                <input
                  type="radio"
                  name="fulfillment"
                  checked={fulfillmentType === 'upcountry_parcel'}
                  onChange={() => setFulfillmentType('upcountry_parcel')}
                  className="mt-0.5 accent-[#E11D48]"
                />
                <div className="flex-1 text-xs">
                  <div className="flex items-center justify-between font-bold">
                    <span>Upcountry Matatu / Bus Parcel Office</span>
                    <span className="font-mono">+ KSh 350</span>
                  </div>
                  <p className={`mt-0.5 ${fulfillmentType === 'upcountry_parcel' ? 'text-slate-300' : 'text-slate-500'}`}>
                    Sent via 2NK, EasyCoach, Guardian, Modern Coast, or North Rift parcels.
                  </p>
                </div>
              </label>
            </div>

            {fulfillmentType !== 'counter_pickup' && (
              <div className="pt-1">
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                  Delivery Destination / Town & Garage Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Nakuru 2NK stage, or Total Energies Karen garage"
                  value={deliveryLocation}
                  onChange={(e) => setDeliveryLocation(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:bg-white focus:border-slate-900 transition-colors"
                />
              </div>
            )}
          </div>

          {/* Validation error message */}
          {validationError && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold rounded-xl">
              {validationError}
            </div>
          )}

          {/* Price Breakdown */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Parts Subtotal ({cartItems.length} items)</span>
              <span className="font-mono-nums font-semibold">KSh {subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Fulfillment Fee</span>
              <span className="font-mono-nums font-semibold">
                {deliveryFee === 0 ? 'FREE (Pickup)' : `KSh ${deliveryFee.toLocaleString()}`}
              </span>
            </div>
            <div className="border-t border-slate-200 pt-2 flex justify-between text-sm font-bold text-slate-900">
              <span>Total Payable</span>
              <span className="font-mono-nums text-base text-[#E11D48]">
                KSh {totalAmount.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Drawer Action Bar */}
        <div className="p-4 bg-white border-t border-slate-200 shadow-xl space-y-2 shrink-0">
          <button
            onClick={handleStartMpesaPayment}
            disabled={cartItems.length === 0}
            className="w-full min-h-[48px] bg-[#E11D48] hover:bg-[#BE123C] active:scale-[0.98] disabled:bg-slate-300 text-white font-bold text-sm rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
          >
            <span>Pay with M-Pesa (KSh {totalAmount.toLocaleString()})</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={handlePayAtCounter}
            disabled={cartItems.length === 0}
            className="w-full py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
          >
            Or Reserve & Pay at Shop Counter
          </button>
        </div>

        {/* M-PESA STK PUSH INTERACTIVE MODAL */}
        {isProcessingStk && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
            <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl p-6 text-center border-4 border-[#0F8A5F]/20 relative overflow-hidden">
              {/* Safaricom Green Header Bar */}
              <div className="h-2 bg-[#0F8A5F] absolute top-0 left-0 right-0"></div>

              {stkStep === 'prompting' && (
                <div className="space-y-4 pt-2">
                  <div className="w-14 h-14 rounded-full bg-emerald-50 text-[#0F8A5F] flex items-center justify-center mx-auto border border-emerald-200 animate-pulse">
                    <Smartphone className="w-7 h-7" />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900">
                      M-Pesa STK Prompt Sent
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                      Check phone <strong className="text-slate-800">{phone}</strong> for the prompt:
                    </p>
                  </div>

                  {/* STK Screen Replica */}
                  <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl text-left text-xs font-mono space-y-1.5 text-slate-800">
                    <div className="text-[10px] text-emerald-800 uppercase font-bold tracking-wider">
                      Safaricom M-Pesa
                    </div>
                    <div>Paybill: <strong>247247</strong></div>
                    <div>Account: <strong>NEXO-AUTO</strong></div>
                    <div>Amount: <strong className="text-[#E11D48] text-sm">KSh {totalAmount.toLocaleString()}</strong></div>
                    <div className="pt-2">
                      <label className="text-[11px] font-sans font-bold text-slate-700 block mb-1">
                        Enter M-Pesa PIN (Simulate):
                      </label>
                      <input
                        type="password"
                        maxLength={4}
                        placeholder="••••"
                        value={pinInput}
                        onChange={(e) => setPinInput(e.target.value.replace(/\D/g, ''))}
                        className="w-full px-3 py-2 bg-white border border-emerald-300 rounded-lg text-center text-lg tracking-widest font-mono font-bold focus:outline-none focus:border-emerald-600"
                        autoFocus
                      />
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={() => setIsProcessingStk(false)}
                      className="flex-1 py-2.5 text-xs font-semibold text-slate-500 hover:bg-slate-100 rounded-xl"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSimulatePinSubmission}
                      className="flex-1 py-2.5 bg-[#0F8A5F] hover:bg-[#0c7450] text-white text-xs font-bold rounded-xl shadow-xs"
                    >
                      Authorize Payment
                    </button>
                  </div>
                </div>
              )}

              {stkStep === 'entered_pin' && (
                <div className="py-8 space-y-4">
                  <Loader2 className="w-10 h-10 text-[#0F8A5F] animate-spin mx-auto" />
                  <p className="text-sm font-bold text-slate-800">
                    Verifying with Safaricom M-Pesa...
                  </p>
                  <p className="text-xs text-slate-400">
                    Please do not refresh this page.
                  </p>
                </div>
              )}

              {stkStep === 'confirmed' && (
                <div className="py-6 space-y-3">
                  <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="text-base font-extrabold text-slate-900">
                    Payment Received!
                  </h3>
                  <p className="text-xs text-slate-500 font-mono">
                    Receipt: <strong className="text-slate-800">{simulatedReceipt}</strong>
                  </p>
                  <p className="text-xs text-emerald-700 font-semibold">
                    KSh {totalAmount.toLocaleString()} paid to Nexo Autospares
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
