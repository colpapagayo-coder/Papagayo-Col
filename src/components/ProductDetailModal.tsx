import React, { useState } from 'react';
import { Product } from '../types';
import { COLOMBIA_DEPARTMENTS } from '../departments';
import { ColombiaMap } from './ColombiaMap';
import { X, Globe, MessageSquare, ShieldCheck, Award, Info, ChevronLeft, ChevronRight } from 'lucide-react';

interface ProductDetailModalProps {
  product: Product;
  onClose: () => void;
  deliveryCountry: string;
  onSelectProductInquiry: (productName: string) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
  deliveryCountry,
  onSelectProductInquiry,
}) => {
  // Extract all available images (up to 5)
  const images: string[] = [product.base64Image];
  if (product.additionalImages && Array.isArray(product.additionalImages)) {
    product.additionalImages.forEach((img) => {
      if (img && typeof img === 'string') {
        images.push(img);
      }
    });
  }

  // Fallbacks to reach up to 5 images seamlessly for aesthetic perfection
  const placeholderImages = [
    'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=800&auto=format&fit=crop', // Aesthetic close-up coffee beans
    'https://images.unsplash.com/photo-1541167760496-1628856ab772?q=80&w=800&auto=format&fit=crop', // Pour over coffee stream
    'https://images.unsplash.com/photo-1507133750040-4a8f57021571?q=80&w=800&auto=format&fit=crop', // Organic craft texture
    'https://images.unsplash.com/photo-1511920170033-f8396924c348?q=80&w=800&auto=format&fit=crop', // Warm cafe environment
  ];

  while (images.length < 5) {
    const idx = images.length - 1;
    images.push(placeholderImages[idx % placeholderImages.length]);
  }

  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const matchedDept = COLOMBIA_DEPARTMENTS.find(d => d.id === product.departmentCode);
  const departmentName = matchedDept?.name || 'Colombie';
  const price = product.prices?.[deliveryCountry] || 0;

  // Custom localized stats depending on category
  const isCoffee = product.category?.toLowerCase().includes('caf') || product.id.includes('coffee') || product.name.toLowerCase().includes('caf');
  const isCacao = product.category?.toLowerCase().includes('cacao') || product.name.toLowerCase().includes('cacao') || product.name.toLowerCase().includes('choc');
  
  const specs = [
    { label: 'Altitude/Origine', value: isCoffee ? '1,750m - 2,100m' : isCacao ? '800m - 1,200m' : 'Traditionnel' },
    { label: 'Producteur', value: isCoffee ? 'Micro-coopératives locales' : 'Communautés Sourcing Direct' },
    { label: 'Méthode', value: '100% Fait Main (Artisanale)' },
    { label: 'Contrôle', value: 'Équitable (Zéro Intermédiaire)' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-[#1C1A17]/70 backdrop-blur-xl">
      <div 
        className="relative bg-[#FAF9F5] w-full max-w-5xl rounded-[2.5rem] shadow-[0_30px_80px_rgba(0,0,0,0.25)] border border-white/80 overflow-hidden flex flex-col md:flex-row max-h-[92vh] md:max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button top-right */}
        <button 
          onClick={onClose}
          className="absolute top-5 right-5 z-40 bg-white/85 hover:bg-white text-[#302B27] p-3 rounded-full shadow-lg border border-gray-100 hover:scale-105 active:scale-95 transition-all text-xs cursor-pointer flex items-center justify-center"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Left Half: Premium Multi-Image Slider */}
        <div className="w-full md:w-1/2 bg-white/80 flex flex-col justify-between p-6 sm:p-8 border-r border-[#EFEBE0]">
          <div className="relative flex-grow flex items-center justify-center min-h-[250px] sm:min-h-[350px] max-h-[420px] rounded-2xl overflow-hidden group">
            <img 
              src={images[activeImageIndex]} 
              alt={`${product.name} visual`} 
              className="w-full h-full object-cover rounded-2xl transition-all duration-700 hover:scale-105"
            />
            
            {/* Arrows */}
            <button 
              onClick={() => setActiveImageIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1))}
              className="absolute left-3 p-2 bg-white/70 hover:bg-white text-gray-800 rounded-full shadow opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer flex items-center justify-center"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button 
              onClick={() => setActiveImageIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0))}
              className="absolute right-3 p-2 bg-white/70 hover:bg-white text-gray-800 rounded-full shadow opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer flex items-center justify-center"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            {/* Pagination Bullet Overlays */}
            <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-2">
              {images.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`w-2.5 h-2.5 rounded-full transition-all ${
                    idx === activeImageIndex ? 'bg-[#23493C] w-6' : 'bg-[#23493C]/30 hover:bg-[#23493C]/50'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Thumbnails list (up to 5) */}
          <div className="mt-4 grid grid-cols-5 gap-2">
            {images.map((img, idx) => (
              <button 
                key={idx}
                onClick={() => setActiveImageIndex(idx)}
                className={`aspect-square rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                  idx === activeImageIndex 
                    ? 'border-[#23493C] scale-102 ring-2 ring-[#23493C]/10' 
                    : 'border-transparent hover:border-gray-200 opacity-75 hover:opacity-100'
                }`}
              >
                <img src={img} alt="thumbnail" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* Right Half: Details, Micro-Specs, and the Geographic Region Map */}
        <div className="w-full md:w-1/2 flex flex-col justify-between overflow-y-auto p-6 sm:p-8 md:p-10">
          
          {/* Header info */}
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-bold tracking-widest text-[#8B5E34] uppercase bg-[#8B5E34]/10 px-3 py-1.5 rounded-full">
                Sourcing Premium Direct
              </span>
              <span className="text-[10px] font-semibold text-gray-500 bg-gray-100 px-3 py-1.5 rounded-full">
                {product.category || 'Général'}
              </span>
            </div>

            <h2 className="text-2xl sm:text-3.5xl font-display font-bold text-[#302B27] tracking-tight leading-none">
              {product.name}
            </h2>

            <div className="flex items-center justify-between py-2 border-y border-[#23493C]/10">
              <span className="text-xs text-[#76736A] font-medium flex items-center">
                <Globe className="w-4 h-4 text-[#23493C] mr-1.5" />
                Origine : <strong className="text-[#302B27] ml-1">{departmentName} (Colombie)</strong>
              </span>
              <span className="text-lg font-bold text-[#23493C]">
                {price > 0 ? `${price.toFixed(2)} €` : 'Prix sur demande'}
              </span>
            </div>

            <p className="text-xs sm:text-sm text-[#76736A] leading-relaxed">
              {product.description}
            </p>

            {/* Sourcing Specs Mini Grid */}
            <div className="grid grid-cols-2 gap-3 pb-2 pt-1">
              {specs.map((item, idx) => (
                <div key={idx} className="bg-white/80 rounded-xl p-3 border border-[#EFEBE0] shadow-2xs">
                  <span className="block text-[9px] uppercase tracking-wider text-[#8B5E34] font-bold">{item.label}</span>
                  <span className="text-[11px] font-semibold text-[#302B27] block mt-0.5">{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Interactive highlight croquis section representing Columbia Origin */}
          <div className="my-5 bg-[#23493C]/5 border border-[#23493C]/10 rounded-2xl p-4 flex items-center justify-between gap-4">
            <div className="space-y-1 max-w-[60%]">
              <span className="text-[10px] uppercase font-bold tracking-widest text-[#23493C] flex items-center gap-1">
                <Award className="w-3 h-3" /> Carte de Traçabilité
              </span>
              <h4 className="text-sm font-semibold text-[#302B27] leading-tight">Territoire d'Origine</h4>
              <p className="text-[11px] text-gray-500 leading-normal">
                Ce trésor est sourcé spécifiquement dans la région de <strong>{departmentName}</strong>, illustrée en vert sur la carte de Colombie.
              </p>
            </div>

            {/* Micro Colombia map highlighting active code */}
            <div className="w-[110px] h-[110px] relative bg-white rounded-xl border border-gray-150 flex items-center justify-center overflow-hidden flex-shrink-0 shadow-xs">
              <ColombiaMap activeDepartmentId={product.departmentCode} interactive={false} compact={true} />
            </div>
          </div>

          {/* Sourcing Action CTA Button */}
          <button
            onClick={() => {
              onSelectProductInquiry(product.name);
            }}
            className="w-full py-3.5 bg-[#23493C] hover:bg-[#1C3A30] text-[#FAF9F5] text-xs font-bold uppercase tracking-wider rounded-xl shadow-lg hover:shadow-xl transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer flex items-center justify-center space-x-2"
          >
            <MessageSquare className="w-4 h-4 text-[#DFDAC8]" />
            <span>Faire une Demande d'Importation (Sourcing Request)</span>
          </button>

        </div>
      </div>
    </div>
  );
};
