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
  onLocationClick?: (departmentCode: string) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ 
  product, 
  isActive, 
  deliveryCountry, 
  onMouseEnter, 
  onMouseLeave,
  onLocationClick 
}) => {
  const departmentName = COLOMBIA_DEPARTMENTS.find(d => d.id === product.departmentCode)?.name || 'Colombia';
  
  const price = product.prices?.[deliveryCountry] || 0;

  return (
    <div 
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className={cn(
        "group relative flex flex-col h-full rounded-3xl overflow-hidden cursor-pointer transition-all duration-500",
        "bg-white/40 backdrop-blur-xl border border-white/60", // Glass effect
        isActive 
          ? "shadow-[0_8px_30px_rgb(0,0,0,0.12)] ring-1 ring-white/80 -translate-y-2 bg-white/60" 
          : "shadow-sm hover:shadow-lg hover:bg-white/50"
      )}
    >
      <div className="w-full aspect-square overflow-hidden bg-white/50 relative shrink-0">
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent z-10" />
        <img 
          src={product.base64Image} 
          alt={product.name} 
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
      </div>
      
      <div className="p-4 sm:p-6 flex flex-col flex-grow">
        <div className="flex items-center justify-between mb-2 sm:mb-3">
          <button
            onClick={(e) => {
              if (onLocationClick) {
                e.preventDefault();
                e.stopPropagation();
                onLocationClick(product.departmentCode || '');
              }
            }}
            title={`Filtrer par ${departmentName}`}
            className="flex items-center space-x-1.5 text-[#8B5E34] hover:text-[#23493C] hover:bg-[#23493C]/5 border border-transparent hover:border-[#23493C]/10 text-xs font-semibold tracking-wider uppercase p-1.5 -m-1.5 rounded-lg transition-all duration-300 cursor-pointer"
          >
            <MapPin className="w-3.5 h-3.5" />
            <span className="underline decoration-dotted decoration-[#8B5E34]/40 hover:decoration-[#23493C]">{departmentName}</span>
          </button>
          {price > 0 && (
            <div className="text-[#23493C] font-semibold text-sm sm:text-base">
              {price.toFixed(2)} €
            </div>
          )}
        </div>
        
        <h3 className="text-lg sm:text-xl font-medium text-[#302B27] leading-tight mb-2 sm:mb-3">
          {product.name}
        </h3>
        
        <p className="text-sm text-[#76736A] leading-relaxed line-clamp-2 sm:line-clamp-3">
          {product.description}
        </p>
      </div>
    </div>
  );
}
