import React from 'react';
import { 
  CheckCircle2, 
  Clock, 
  Package, 
  Truck, 
  MapPin, 
  PhoneCall, 
  Share2, 
  MessageCircle, 
  ChevronLeft,
  ArrowRight,
  Car
} from 'lucide-react';
import { Order } from '../types';
import { SHOP_CONTACT, openWhatsApp, telUrl, trackCall } from '../config/contact';

interface OrderStatusViewProps {
  order: Order;
  onBackToShopping: () => void;
}

export const OrderStatusView: React.FC<OrderStatusViewProps> = ({
  order,
  onBackToShopping,
}) => {
  const steps = [
    {
      id: 'received',
      title: 'Order Received',
      description: 'Your request reached our Kirinyaga Road counter system',
      icon: Clock,
      completed: true,
      current: order.status === 'received',
    },
    {
      id: 'confirmed',
      title: 'Confirmed & Inspected',
      description: 'Counter attendant verified fitment and physically pulled part from shelf',
      icon: CheckCircle2,
      completed: order.status === 'confirmed' || order.status === 'ready_for_dispatch' || order.status === 'completed',
      current: order.status === 'confirmed',
    },
    {
      id: 'ready_for_dispatch',
      title: order.fulfillmentType === 'counter_pickup' ? 'Ready at Counter' : 'Out with Courier Rider',
      description: order.fulfillmentType === 'counter_pickup' 
        ? 'Ready for collection at shop (120m from Shell Globe)' 
        : `Dispatched to ${order.deliveryLocation || 'your delivery address'}`,
      icon: order.fulfillmentType === 'counter_pickup' ? Package : Truck,
      completed: order.status === 'ready_for_dispatch' || order.status === 'completed',
      current: order.status === 'ready_for_dispatch',
    },
    {
      id: 'completed',
      title: 'Order Complete',
      description: 'Part handed over and vehicle fitted',
      icon: CheckCircle2,
      completed: order.status === 'completed',
      current: order.status === 'completed',
    },
  ];

  const handleShareWhatsApp = () => {
    const text = (
      `Hello Nexo Autospares, I am tracking my Order *#${order.orderNumber}* for ${order.items.map(i => `${i.product.cleanTitle} (${i.selectedSide})`).join(', ')}.\nTotal: KSh ${order.totalAmount.toLocaleString()}.\nPlease update me on readiness.`
    );
    openWhatsApp(text, 'order_status');
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 sm:py-10 space-y-6">
      {/* Back button */}
      <button
        onClick={onBackToShopping}
        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
      >
        <ChevronLeft className="w-4 h-4" />
        <span>Return to Parts Counter</span>
      </button>

      {/* Main Status Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Order Status
              </span>
              <span className="text-slate-300">·</span>
              <span className="text-xs font-mono font-bold text-[#E11D48]">
                #{order.orderNumber}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight mt-0.5">
              {order.status === 'completed'
                ? 'Order Completed'
                : order.status === 'ready_for_dispatch'
                  ? order.fulfillmentType === 'counter_pickup' ? 'Ready for Pickup!' : 'Out for Delivery!'
                  : order.status === 'confirmed'
                    ? 'Confirmed by Kirinyaga Shop'
                    : 'Order Received'}
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShareWhatsApp}
              className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>Share on WhatsApp</span>
            </button>
          </div>
        </div>

        {/* Timeline */}
        <div className="pt-2">
          <div className="relative pl-6 space-y-8 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
            {steps.map((step) => {
              const Icon = step.icon;
              return (
                <div key={step.id} className="relative group">
                  {/* Timeline bullet */}
                  <div className={`absolute -left-6 top-0.5 w-5 h-5 rounded-full flex items-center justify-center ring-4 ring-white ${
                    step.completed
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-400 border border-slate-300'
                  }`}>
                    <Icon className="w-3 h-3" />
                  </div>

                  <div>
                    <h3 className={`text-sm font-bold tracking-tight ${
                      step.completed ? 'text-slate-900' : 'text-slate-400'
                    }`}>
                      {step.title}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {step.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* M-Pesa Receipt Badge */}
        {order.mpesaReceipt && (
          <div className="p-3 bg-emerald-50/70 border border-emerald-200/80 rounded-xl flex items-center justify-between text-xs text-emerald-900 font-mono">
            <span>M-Pesa Trans ID: <strong>{order.mpesaReceipt}</strong></span>
            <span className="font-bold text-emerald-700">✓ PAID</span>
          </div>
        )}
      </div>

      {/* Order Summary & Items Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-sm space-y-4">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Order Summary & Fulfillment
        </h2>

        <div className="divide-y divide-slate-100">
          {order.items.map((item) => (
            <div key={`${item.productId}-${item.selectedSide}`} className="py-3 flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-3">
                <img
                  src={item.product.image}
                  alt={item.product.cleanTitle}
                  className="w-10 h-10 rounded-lg object-cover border border-slate-200 shrink-0"
                />
                <div>
                  <div className="font-bold text-slate-900">
                    {item.product.cleanTitle}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Side: <span className="font-semibold text-slate-700">{item.selectedSide}</span> · Qty: {item.quantity}
                  </div>
                </div>
              </div>

              <div className="font-bold font-mono-nums text-slate-900">
                KSh {item.totalPrice.toLocaleString()}
              </div>
            </div>
          ))}
        </div>

        <div className="border-t border-slate-100 pt-3 space-y-1.5 text-xs">
          <div className="flex justify-between text-slate-500">
            <span>Fulfillment</span>
            <span className="font-semibold text-slate-800">
              {order.fulfillmentType === 'counter_pickup' ? 'Shop Counter Pickup' : 'Courier Delivery'}
            </span>
          </div>
          <div className="flex justify-between text-slate-500">
            <span>Destination</span>
            <span className="font-semibold text-slate-800 truncate max-w-[200px]">
              {order.deliveryLocation}
            </span>
          </div>
          <div className="flex justify-between text-slate-500">
            <span>Contact Phone</span>
            <span className="font-mono text-slate-800">{order.phone}</span>
          </div>
          <div className="border-t border-slate-100 pt-2 flex justify-between text-sm font-bold text-slate-900">
            <span>Total Amount</span>
            <span className="font-mono-nums text-base text-[#E11D48]">
              KSh {order.totalAmount.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Shop Location & Trust Card */}
      <div className="bg-slate-900 text-white rounded-2xl p-5 sm:p-6 shadow-sm space-y-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
            <MapPin className="w-5 h-5 text-[#E11D48]" />
          </div>
          <div>
            <h3 className="text-sm font-bold tracking-tight">
              Nexo Autospares Shop Counter
            </h3>
            <p className="text-xs text-slate-400">
              Kirinyaga Road, 120m from Shell Globe, Nairobi CBD
            </p>
          </div>
        </div>

        <div className="pt-2 flex flex-wrap gap-2 text-xs">
          <a
            href={telUrl}
            onClick={() => trackCall('order_status')}
            className="px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-lg flex items-center gap-2 transition-colors"
          >
            <PhoneCall className="w-3.5 h-3.5 text-[#E11D48]" />
            <span>Call Shop: {SHOP_CONTACT.phoneDisplay}</span>
          </a>
          <button
            onClick={onBackToShopping}
            className="px-3.5 py-2 bg-[#E11D48] hover:bg-[#BE123C] text-white font-bold rounded-lg flex items-center gap-1.5 transition-colors"
          >
            <span>Order Another Part</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
