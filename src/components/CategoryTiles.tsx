import React from 'react';
import { 
  Eye, 
  Car, 
  CloudFog, 
  Zap, 
  Layers, 
  Wind, 
  Sparkles, 
  Wrench,
  Check
} from 'lucide-react';
import { ProductItem } from '../types';

interface CategoryTilesProps {
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  products: ProductItem[];
}

export const CATEGORIES = [
  { id: 'All', name: 'All Parts', icon: Car, count: 0 },
  { id: 'Head lenses', name: 'Head Lenses', icon: Eye, count: 0 },
  { id: 'Tail lenses', name: 'Tail Lenses', icon: Sparkles, count: 0 },
  { id: 'Fog lamps', name: 'Fog Lamps', icon: CloudFog, count: 0 },
  { id: 'LED lighting', name: 'LED Lighting', icon: Zap, count: 0 },
  { id: 'Mats & TPE', name: 'Mats & TPE', icon: Layers, count: 0 },
  { id: 'Windbreakers', name: 'Windbreakers', icon: Wind, count: 0 },
  { id: 'Chrome kits', name: 'Chrome Kits', icon: Sparkles, count: 0 },
  { id: 'Accessories & Tools', name: 'Tools & Safety', icon: Wrench, count: 0 },
];

export const CategoryTiles: React.FC<CategoryTilesProps> = ({
  selectedCategory,
  onSelectCategory,
  products,
}) => {
  return (
    <div className="my-6">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
          Browse by Category
        </h2>
        <span className="text-xs text-slate-400">
          Kirinyaga Road Inventory
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-2.5">
        {CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          const isSelected = selectedCategory === cat.id;
          const catCount = cat.id === 'All' 
            ? products.length 
            : products.filter(p => p.category === cat.id).length;

          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-2 cursor-pointer active:scale-95 group ${
                isSelected
                  ? 'border-slate-900 bg-slate-900 text-white shadow-md'
                  : 'border-slate-200/90 bg-white hover:border-slate-300 hover:bg-slate-50 text-slate-800'
              }`}
            >
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors ${
                isSelected ? 'bg-white/15 text-[#E11D48]' : 'bg-slate-100 text-slate-700 group-hover:text-[#E11D48]'
              }`}>
                <Icon className="w-5 h-5" />
              </div>
              <div className="min-w-0 w-full">
                <span className="text-xs font-bold block truncate leading-tight">
                  {cat.name}
                </span>
                <span className={`text-[10px] block font-mono-nums ${
                  isSelected ? 'text-slate-300' : 'text-slate-400'
                }`}>
                  {catCount} parts
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
