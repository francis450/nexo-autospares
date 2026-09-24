export interface VehicleModel {
  id: string;
  make: string;
  model: string;
  chassis: string;
  years: string;
  yearMin: number;
  yearMax: number;
  popular?: boolean;
}

export type PartSide = 'LH' | 'RH' | 'pair' | 'universal';

export interface ProductItem {
  id: string;
  itemCode: string;
  name: string;
  cleanTitle: string;
  category: 'Head lenses' | 'Tail lenses' | 'Fog lamps' | 'LED lighting' | 'Mats & TPE' | 'Windbreakers' | 'Chrome kits' | 'Accessories & Tools';
  price: number; // in KSh
  pairPrice?: number; // discounted or computed pair price
  inStock: number;
  unit: string;
  partNo: string;
  fitVehicles: string[]; // matching chassis/models
  fitYears: string;
  compatibleModelsText: string;
  sideAvailable: 'LH_ONLY' | 'RH_ONLY' | 'BOTH_SIDES' | 'PAIR_ONLY' | 'UNIVERSAL';
  hasSideToggle?: boolean;
  image: string;
  description: string;
  featured?: boolean;
  isPosterPromo?: boolean;
  rating?: number;
}

export interface CartItem {
  productId: string;
  product: ProductItem;
  selectedSide: PartSide;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export type OrderStatus = 'received' | 'confirmed' | 'ready_for_dispatch' | 'completed';

export interface Order {
  id: string;
  orderNumber: string;
  createdAt: string;
  status: OrderStatus;
  customerName: string;
  phone: string;
  fulfillmentType: 'counter_pickup' | 'nairobi_courier' | 'upcountry_parcel';
  deliveryLocation?: string;
  deliveryNotes?: string;
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  totalAmount: number;
  paymentMethod: 'mpesa_stk' | 'pay_on_pickup';
  paymentStatus: 'paid' | 'pending';
  mpesaReceipt?: string;
  vehicleSelected?: string;
}
