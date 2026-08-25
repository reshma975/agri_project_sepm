import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  X,
  Tag,
  ArrowRight,
  Package,
  Layers,
  Sparkles,
  CheckCircle2,
  Boxes,
  Plus
} from 'lucide-react';

const CATEGORY_META = {
  Fertilizer: {
    name: 'Fertilizers',
    btnText: 'Fertilizers',
    emoji: '🌾',
    color: 'from-emerald-950/90 via-[#06151a] to-[#030b0e] border-emerald-500/40 text-emerald-300',
    badgeColor: 'bg-emerald-950/80 text-emerald-300 border-emerald-500/30',
  },
  Seeds: {
    name: 'Seeds',
    btnText: 'Seeds',
    emoji: '🌱',
    color: 'from-teal-950/90 via-[#06151a] to-[#030b0e] border-teal-500/40 text-teal-300',
    badgeColor: 'bg-teal-950/80 text-teal-300 border-teal-500/30',
  },
  Pesticide: {
    name: 'Pesticides',
    btnText: 'Pesticides',
    emoji: '🧪',
    color: 'from-cyan-950/90 via-[#06151a] to-[#030b0e] border-cyan-500/40 text-cyan-300',
    badgeColor: 'bg-cyan-950/80 text-cyan-300 border-cyan-500/30',
  },
  Machines: {
    name: 'Machinery & Equipment',
    btnText: 'Machinery',
    emoji: '🚜',
    color: 'from-amber-950/90 via-[#06151a] to-[#030b0e] border-amber-500/40 text-amber-300',
    badgeColor: 'bg-amber-950/80 text-amber-300 border-amber-500/30',
  },
  Tools: {
    name: 'Tools & Sprayers',
    btnText: 'Tools',
    emoji: '🛠️',
    color: 'from-slate-900 via-[#06151a] to-[#030b0e] border-slate-700 text-slate-300',
    badgeColor: 'bg-slate-900 text-slate-300 border-slate-700',
  },
  Irrigation: {
    name: 'Irrigation & Drip',
    btnText: 'Irrigation',
    emoji: '💧',
    color: 'from-blue-950/90 via-[#06151a] to-[#030b0e] border-blue-500/40 text-blue-300',
    badgeColor: 'bg-blue-950/80 text-blue-300 border-blue-500/30',
  },
  'Bio-Stimulants': {
    name: 'Bio-Stimulants',
    btnText: 'Bio-Stimulants',
    emoji: '🌿',
    color: 'from-emerald-950/90 via-[#06151a] to-[#030b0e] border-emerald-500/40 text-emerald-300',
    badgeColor: 'bg-emerald-950/80 text-emerald-300 border-emerald-500/30',
  },
  'Soil-Conditioners': {
    name: 'Soil Conditioners',
    btnText: 'Soil Conditioners',
    emoji: '🪨',
    color: 'from-amber-950/90 via-[#06151a] to-[#030b0e] border-amber-500/40 text-amber-300',
    badgeColor: 'bg-amber-950/80 text-amber-300 border-amber-500/30',
  },
  Others: {
    name: 'Other Farm Supplies',
    btnText: 'Products',
    emoji: '📦',
    color: 'from-purple-950/90 via-[#06151a] to-[#030b0e] border-purple-500/40 text-purple-300',
    badgeColor: 'bg-purple-950/80 text-purple-300 border-purple-500/30',
  }
};

export default function CategoriesModal({ isOpen, onClose, products = [], onSelectCategory, onAddNewProduct }) {
  const navigate = useNavigate();

  if (!isOpen) return null;

  // Group ONLY the products that belong to this shopkeeper's active inventory
  const inventoryByCategory = products.reduce((acc, item) => {
    const rawCat = item.category || item.productId?.category || 'Fertilizer';
    let catKey = 'Others';
    if (/fertilizer/i.test(rawCat)) catKey = 'Fertilizer';
    else if (/seed/i.test(rawCat)) catKey = 'Seeds';
    else if (/pesticide|insecticide|fungicide/i.test(rawCat)) catKey = 'Pesticide';
    else if (/machine/i.test(rawCat)) catKey = 'Machines';
    else if (/tool|sprayer/i.test(rawCat)) catKey = 'Tools';
    else if (/irrigation|drip/i.test(rawCat)) catKey = 'Irrigation';
    else if (/bio/i.test(rawCat)) catKey = 'Bio-Stimulants';
    else if (/soil|manure|gypsum/i.test(rawCat)) catKey = 'Soil-Conditioners';

    if (!acc[catKey]) {
      acc[catKey] = {
        key: catKey,
        items: [],
        totalQuantity: 0,
        totalValue: 0,
      };
    }

    const price = Number(item.price) || 0;
    const qty = Number(item.quantity) || 0;
    const value = item.totalValue || (price * qty);

    acc[catKey].items.push(item);
    acc[catKey].totalQuantity += qty;
    acc[catKey].totalValue += value;

    return acc;
  }, {});

  const activeCategoriesList = Object.values(inventoryByCategory);

  const handleCategoryClick = (catKey) => {
    if (onSelectCategory) {
      onSelectCategory(catKey);
    } else {
      navigate(`/shopkeeper/products?category=${encodeURIComponent(catKey)}`);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="glass-card bg-[#051419] border border-teal-500/30 rounded-3xl p-5 sm:p-7 max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl space-y-5 relative">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-teal-900/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-950 text-teal-400 flex items-center justify-center border border-teal-500/30 shadow-xs">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
                <span>Inventory Categories</span>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-teal-950 text-teal-300 border border-teal-500/30">
                  {activeCategoriesList.length} Active in Stock
                </span>
              </h2>
              <p className="text-xs text-slate-300 font-normal">
                Categories currently registered with active products in your shop inventory.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#030b0e] text-slate-400 hover:text-white flex items-center justify-center border border-teal-900/40 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Categories List */}
        {activeCategoriesList.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {activeCategoriesList.map((catGroup) => {
              const meta = CATEGORY_META[catGroup.key] || CATEGORY_META.Others;
              return (
                <div
                  key={catGroup.key}
                  onClick={() => handleCategoryClick(catGroup.key)}
                  className={`glass-card bg-gradient-to-br ${meta.color} rounded-2xl p-4 sm:p-5 border transition-all cursor-pointer flex flex-col justify-between group shadow-md hover:scale-[1.01] hover:shadow-teal-500/10`}
                >
                  <div className="space-y-3">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <span className="text-2xl p-2 rounded-xl bg-[#030b0e] border border-slate-700 shadow-inner">
                          {meta.emoji}
                        </span>
                        <div>
                          <h3 className="text-sm sm:text-base font-extrabold text-white group-hover:text-teal-300 transition-colors">
                            {meta.name}
                          </h3>
                          <span className="text-[11px] text-slate-300">
                            {catGroup.items.length} {catGroup.items.length === 1 ? 'Product' : 'Products'} Listed
                          </span>
                        </div>
                      </div>

                      <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${meta.badgeColor}`}>
                        {catGroup.items.length} Items
                      </span>
                    </div>

                    {/* Stock Value & Volume */}
                    <div className="flex items-center justify-between p-2.5 bg-[#030b0e]/90 rounded-xl border border-slate-700/60 text-xs">
                      <div>
                        <span className="text-[10px] text-slate-400 block font-semibold">Total Stock</span>
                        <span className="font-bold text-white">{catGroup.totalQuantity} units</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 block font-semibold">Category Value</span>
                        <span className="font-bold text-teal-300">₹{catGroup.totalValue.toLocaleString('en-IN')}</span>
                      </div>
                    </div>

                    {/* Product Names in this Category */}
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider block">
                        Products in this shop:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {catGroup.items.map((prod, idx) => (
                          <span
                            key={idx}
                            className="text-[11px] font-semibold bg-[#030b0e] text-white px-2.5 py-0.5 rounded-md border border-slate-700/80 shadow-xs"
                          >
                            {prod.name || prod.productId?.name || 'Item'}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Footer Action */}
                  <div className="pt-3.5 mt-3 border-t border-slate-800/80 flex items-center justify-between text-xs font-bold text-teal-400 group-hover:text-teal-300">
                    <span>View {meta.btnText} in Inventory</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-8 text-center bg-[#030b0e] rounded-2xl border border-dashed border-slate-700 space-y-3">
            <Boxes className="w-10 h-10 text-slate-500 mx-auto" />
            <h3 className="text-sm font-bold text-white">No products in inventory yet</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Add your first agricultural product to automatically see its category registered here.
            </p>
            {onAddNewProduct && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onAddNewProduct();
                }}
                className="px-4 py-2 btn-glow-primary text-slate-950 text-xs font-bold rounded-xl inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Add Product Now
              </button>
            )}
          </div>
        )}

        {/* Modal Bottom Banner */}
        <div className="pt-2 border-t border-teal-900/40 flex items-center justify-between text-xs text-slate-400">
          <span className="flex items-center gap-1.5 text-teal-300">
            <Sparkles className="w-3.5 h-3.5 text-teal-400" />
            Categories automatically update as you add or modify products in your shop inventory.
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-[#030b0e] hover:bg-[#0c242c] text-white border border-slate-700 rounded-xl font-bold cursor-pointer transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
