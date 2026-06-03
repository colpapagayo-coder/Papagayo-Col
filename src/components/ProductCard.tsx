import React from 'react';
import { Product } from '../types';
import { COLOMBIA_DEPARTMENTS } from '../departments';
import { MapPin } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ProductCardProps {
  product: Product;
  isActive: boolean;
  deliveryCountry: string;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, isActive, deliveryCountry, onMouseEnter, onMouseLeave }) => {
  const departmentName = COLOMBIA_DEPARTMENTS.find(d => d.id === product.departmentCode)?.name || 'Colombia';
  
  const price = product.prices?.[deliveryCountry] || 0;

  return (
    <div 
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className={cn(
        "group relative flex flex-col rounded-3xl overflow-hidden cursor-pointer transition-all duration-500",
        "bg-white/40 backdrop-blur-xl border border-white/60", // Glass effect
        isActive 
          ? "shadow-[0_8px_30px_rgb(0,0,0,0.12)] ring-1 ring-white/80 -translate-y-2 bg-white/60" 
          : "shadow-sm hover:shadow-lg hover:bg-white/50"
      )}
    >
      <div className="w-full h-64 overflow-hidden bg-white/50 relative">
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent z-10" />
        <img 
          src={product.base64Image} 
          alt={product.name} 
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
      </div>
      
      <div className="p-6 flex flex-col flex-grow">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-1.5 text-[#8B5E34] text-xs font-semibold tracking-wider uppercase">
            <MapPin className="w-3.5 h-3.5" />
            <span>{departmentName}</span>
          </div>
          {price > 0 && (
            <div className="text-[#23493C] font-semibold">
              {price.toFixed(2)} €
            </div>
          )}
        </div>
        
        <h3 className="text-xl font-medium text-[#302B27] leading-tight mb-3">
          {product.name}
        </h3>
        
        <p className="text-sm text-[#76736A] leading-relaxed line-clamp-3">
          {product.description}
        </p>
      </div>
    </div>
  );
}
