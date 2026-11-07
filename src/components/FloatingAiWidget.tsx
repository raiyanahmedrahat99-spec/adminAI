import React, { useState } from 'react';
import { Bot, X, Sparkles, MessageSquare } from 'lucide-react';
import { ExecutiveAuditorPanel } from './ExecutiveAuditorPanel';
import { Product, Order, StoreFinancials } from '../types/store';

interface FloatingAiWidgetProps {
  products: Product[];
  orders: Order[];
  financials: StoreFinancials;
}

export const FloatingAiWidget: React.FC<FloatingAiWidgetProps> = ({
  products,
  orders,
  financials,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end">
      {/* Expanded Floating Chat Panel with Smooth Animation */}
      {isOpen && (
        <div className="mb-3 w-[92vw] sm:w-[450px] h-[650px] max-h-[85vh] bg-slate-900 border border-emerald-500/30 rounded-3xl shadow-2xl shadow-emerald-950/40 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
          {/* Header */}
          <div className="px-5 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-white shadow-lg shrink-0">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  Towa Executive AI
                </h3>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleRefresh}
                className="p-2 text-slate-500 hover:text-emerald-400 hover:bg-slate-800 rounded-xl transition-all"
                title="Refresh Audit Session"
              >
                <Sparkles className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 text-slate-500 hover:text-rose-400 hover:bg-slate-800 rounded-xl transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Panel Body */}
          <div className="flex-1 overflow-hidden flex flex-col">
            <ExecutiveAuditorPanel 
              key={refreshKey}
              products={products} 
              orders={orders} 
              financials={financials} 
            />
          </div>
        </div>
      )}

      {/* Floating Widget Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="group relative flex items-center gap-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold px-4 py-3.5 rounded-full shadow-2xl shadow-emerald-500/20 transition-all hover:scale-105 active:scale-95 border border-emerald-300/30"
      >
        <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400"></span>
        </span>

        {isOpen ? (
          <X className="w-5 h-5 text-slate-950" />
        ) : (
          <Bot className="w-5 h-5 text-slate-950 group-hover:rotate-12 transition-transform" />
        )}

        <span className="text-xs font-bold tracking-tight hidden xs:inline">
          {isOpen ? 'Close Auditor' : 'Executive AI Assistant'}
        </span>
      </button>
    </div>
  );
};
