import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  Sparkles, 
  Plus, 
  Minus, 
  Eye, 
  Edit3, 
  Check, 
  AlertTriangle, 
  Package, 
  ArrowUpDown,
  ExternalLink,
  ChevronDown,
  Trash2,
  RefreshCw,
  Code2
} from 'lucide-react';
import { Product, ProductCategory } from '../types/store';

interface CatalogTableProps {
  products: Product[];
  onUpdateStock: (productId: string, newStock: number) => void;
  onOpenAddModal: () => void;
  onSelectProductForAudit?: (product: Product) => void;
  onDeleteProduct?: (productId: string) => void;
  onSyncFirestore?: () => void;
  onForceReset?: () => void;
  isSyncing?: boolean;
}

export const CatalogTable: React.FC<CatalogTableProps> = ({
  products,
  onUpdateStock,
  onOpenAddModal,
  onSelectProductForAudit,
  onDeleteProduct,
  onSyncFirestore,
  onForceReset,
  isSyncing,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [activeItemDetail, setActiveItemDetail] = useState<Product | null>(null);

  // Filter products
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.supplier.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.titleBn && p.titleBn.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCategory =
      selectedCategory === 'All' || p.category === selectedCategory;

    const matchesStatus =
      selectedStatus === 'All' ||
      (selectedStatus === 'low_stock' && p.stock > 0 && p.stock <= p.reorderLevel) ||
      (selectedStatus === 'out_of_stock' && p.stock === 0) ||
      (selectedStatus === 'healthy' && p.stock > p.reorderLevel);

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const categories: (ProductCategory | 'All')[] = [
    'All',
    'Groceries & Cooking',
    'Biscuits & Bakery',
    'Snacks & Beverages',
    'Toiletries & Cleaning',
    'Personal Care & Hygiene',
  ];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden flex flex-col">
      {/* Table Controls & Filter Header */}
      <div className="p-5 border-b border-slate-800 bg-slate-950/60 flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-white">Daily Essentials Catalog</h2>
            <span className="text-xs bg-slate-800 text-slate-300 font-mono px-2 py-0.5 rounded border border-slate-700">
              {filteredProducts.length} of {products.length} Products
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time inventory levels, wholesale procurement costs, and market prices in BDT
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Search Box */}
          <div className="relative flex-1 md:w-64">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
            <input
              type="text"
              placeholder="Search by name, SKU, brand..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700/80 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-emerald-500"
          >
            <option value="All">All Stock Levels</option>
            <option value="low_stock">⚠️ Low Stock (Urgent)</option>
            <option value="out_of_stock">🛑 Stockout (0 Units)</option>
            <option value="healthy">✅ Healthy Stock</option>
          </select>

          {onSyncFirestore && (
            <button
              onClick={onSyncFirestore}
              disabled={isSyncing}
              className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold px-3 py-1.5 rounded-xl text-xs transition-all border border-slate-700"
              title="Sync catalog with Firebase Firestore"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-cyan-400 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Syncing...' : 'Sync'}</span>
            </button>
          )}

          {onForceReset && (
            <button
              onClick={onForceReset}
              disabled={isSyncing}
              className="flex items-center gap-1.5 bg-slate-800 hover:bg-rose-900/40 text-slate-400 hover:text-rose-400 font-semibold px-3 py-1.5 rounded-xl text-xs transition-all border border-slate-700 hover:border-rose-900 disabled:opacity-50"
              title="Force overwrite Firestore with official 186-SKU audit list"
            >
              {isSyncing ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Sparkles className="w-3.5 h-3.5" />
              )}
              <span>{isSyncing ? 'Seeding...' : 'Seed Audit DB'}</span>
            </button>
          )}

          <button
            onClick={onOpenAddModal}
            className="flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-3 py-1.5 rounded-xl text-xs transition-all shadow-md shadow-emerald-500/10"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Item</span>
          </button>
        </div>
      </div>

      {/* Category Pills Bar */}
      <div className="px-5 py-2.5 bg-slate-950/40 border-b border-slate-800/80 flex items-center gap-1.5 overflow-x-auto text-xs">
        <span className="text-slate-500 text-[11px] font-medium mr-1 uppercase tracking-wider">
          Category:
        </span>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
              selectedCategory === cat
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Products Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-950/80 text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-800">
            <tr>
              <th className="py-3 px-5">Product Details</th>
              <th className="py-3 px-4">Identifier / SKU</th>
              <th className="py-3 px-4">Cost (BDT)</th>
              <th className="py-3 px-4">Retail (BDT)</th>
              <th className="py-3 px-4">Stock</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {filteredProducts.slice(0, 50).map((prod) => {
              const margin = Math.round(
                ((prod.retailPriceBDT - prod.costPriceBDT) / prod.retailPriceBDT) * 100
              );
              const isLowStock = prod.stock > 0 && prod.stock <= prod.reorderLevel;
              const isOutOfStock = prod.stock === 0;

              return (
                <tr
                  key={prod.id}
                  className="hover:bg-slate-800/40 transition-colors group"
                >
                  {/* Title & Category */}
                  <td className="py-3.5 px-5">
                    <div className="font-semibold text-white group-hover:text-emerald-300 transition-colors">
                      {prod.title}
                    </div>
                    {prod.titleBn && (
                      <div className="text-[11px] text-slate-400 font-bengali">
                        {prod.titleBn}
                      </div>
                    )}
                    <span className="text-[10px] text-slate-500 bg-slate-950/50 px-1.5 py-0.5 rounded border border-slate-800 mt-1 inline-block">
                      {prod.category}
                    </span>
                  </td>

                  {/* SKU & Barcode */}
                  <td className="py-3.5 px-4">
                    <div className="flex flex-col gap-1">
                      <span className="font-mono text-[10px] text-slate-300 font-bold">
                        SKU: {prod.sku}
                      </span>
                      {prod.barcode && (
                        <span className="font-mono text-[9px] text-slate-500 flex items-center gap-1">
                          <Code2 className="w-2.5 h-2.5" /> {prod.barcode}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Cost Price */}
                  <td className="py-3.5 px-4 font-mono text-slate-400">
                    ৳{prod.costPriceBDT}
                  </td>

                  {/* Retail Price */}
                  <td className="py-3.5 px-4">
                    <div className="font-mono font-bold text-emerald-400 text-sm">
                      ৳{prod.retailPriceBDT}
                    </div>
                    <div className={`text-[9px] font-mono font-semibold ${margin >= 15 ? 'text-teal-500' : 'text-amber-500'}`}>
                      {margin}% Margin
                    </div>
                  </td>

                  {/* Stock Level with Quick Adjustments */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onUpdateStock(prod.id, Math.max(0, prod.stock - 1))}
                        className="p-1 text-slate-500 hover:text-rose-400 hover:bg-slate-800 rounded transition-colors"
                      >
                        <Minus className="w-3 h-3" />
                      </button>

                      <div className="text-center min-w-[40px]">
                        <span
                          className={`font-mono font-bold text-xs ${
                            isOutOfStock
                              ? 'text-rose-400'
                              : isLowStock
                              ? 'text-amber-400'
                              : 'text-slate-200'
                          }`}
                        >
                          {prod.stock}
                        </span>
                      </div>

                      <button
                        onClick={() => onUpdateStock(prod.id, prod.stock + 1)}
                        className="p-1 text-slate-500 hover:text-emerald-400 hover:bg-slate-800 rounded transition-colors"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </td>

                  {/* Status */}
                  <td className="py-3.5 px-4">
                    {isOutOfStock ? (
                      <span className="bg-rose-950/80 text-rose-300 border border-rose-500/40 text-[9px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap">
                        ● Out of Stock
                      </span>
                    ) : isLowStock ? (
                      <span className="bg-amber-950/80 text-amber-300 border border-amber-500/40 text-[9px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap">
                        ⚠️ Low
                      </span>
                    ) : (
                      <span className="bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 text-[9px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap">
                        ✓ OK
                      </span>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-5 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => setActiveItemDetail(prod)}
                        className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      {onDeleteProduct && (
                        <button
                          onClick={() => onDeleteProduct(prod.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {filteredProducts.length > 30 && (
        <div className="p-4 border-t border-slate-800 text-center text-xs text-slate-500 bg-slate-950/50">
          Showing first 30 of {filteredProducts.length} filtered items in catalog. Use search or category pills for specific queries.
        </div>
      )}

      {/* Description Viewer Modal */}
      {activeItemDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl shadow-2xl p-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-sm font-bold text-white">
                  {activeItemDetail.title}
                </h3>
                <p className="text-xs font-mono text-emerald-400">{activeItemDetail.sku} • {activeItemDetail.category}</p>
              </div>
              <button
                onClick={() => setActiveItemDetail(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                ✕
              </button>
            </div>

            <div className="py-4 space-y-4 text-xs">
              <div>
                <span className="font-semibold text-slate-300 block mb-1">
                  🇬🇧 English E-Commerce Description (Directive 1):
                </span>
                <p className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-slate-200 leading-relaxed">
                  {activeItemDetail.descriptionEnglish}
                </p>
              </div>

              <div>
                <span className="font-semibold text-emerald-400 block mb-1 font-bengali text-sm">
                  🇧🇩 বাংলা বিবরণী (Bengali Household Description):
                </span>
                <p className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-slate-100 font-bengali leading-relaxed text-sm">
                  {activeItemDetail.descriptionBengali}
                </p>
              </div>

              <div className="grid grid-cols-3 gap-3 pt-2 text-center font-mono">
                <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                  <span className="text-[10px] text-slate-500 block">Wholesale Cost</span>
                  <span className="text-sm font-bold text-slate-200">৳{activeItemDetail.costPriceBDT}</span>
                </div>
                <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                  <span className="text-[10px] text-slate-500 block">Market Retail Price</span>
                  <span className="text-sm font-bold text-emerald-400">৳{activeItemDetail.retailPriceBDT}</span>
                </div>
                <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                  <span className="text-[10px] text-slate-500 block">Gross Margin</span>
                  <span className="text-sm font-bold text-teal-300">
                    {Math.round(((activeItemDetail.retailPriceBDT - activeItemDetail.costPriceBDT) / activeItemDetail.retailPriceBDT) * 100)}%
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setActiveItemDetail(null)}
                className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-1.5 rounded-xl text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
