import React from 'react';
import { Store, MapPin, Star, ChevronRight, Package } from 'lucide-react';

export default function ShopCard({ shop, onClick }) {
  return (
    <div
      onClick={onClick}
      className="glass-card rounded-3xl overflow-hidden cursor-pointer hover:border-forest-500 group transition-all"
    >
      {/* Photo (Banner) */}
      <div className="relative h-44 w-full overflow-hidden bg-slate-100">
        <img
          src={shop.imageUrl || 'https://images.unsplash.com/photo-1595246140625-573b715d11dc?auto=format&fit=crop&w=600&q=80'}
          alt={shop.shopName}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {/* Rating Badge (Wireframe 1) */}
        <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-full text-xs font-bold text-slate-800 flex items-center gap-1 shadow-md border border-slate-100">
          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
          <span>{shop.ratingAverage?.toFixed(1) || '4.5'}</span>
          <span className="text-[10px] text-slate-400 font-normal">({shop.ratingCount || 12})</span>
        </div>
      </div>

      {/* Content Area (Wireframe 1: Name, Location, Specific Address) */}
      <div className="p-5 space-y-2">
        <h3 className="font-extrabold text-lg text-slate-900 group-hover:text-forest-700 transition-colors truncate">
          {shop.shopName}
        </h3>

        {/* Location (Big font as annotated in wireframe 1) */}
        <div className="flex items-center gap-1.5 text-sm font-bold text-forest-800">
          <MapPin className="w-4 h-4 text-forest-600 flex-shrink-0" />
          <span>{shop.location}</span>
        </div>

        {/* Specific Address (Small font as annotated in wireframe 1) */}
        <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
          {shop.address}
        </p>

        {/* Bottom meta */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 text-slate-600">
            <Package className="w-3.5 h-3.5 text-slate-400" />
            <span>{shop.productCount || 0} Products in Stock</span>
          </div>

          <span className="font-bold text-forest-700 flex items-center gap-0.5 group-hover:translate-x-1 transition-transform">
            Manage Shop <ChevronRight className="w-4 h-4" />
          </span>
        </div>
      </div>
    </div>
  );
}
