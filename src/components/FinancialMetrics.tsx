import React from 'react';
import { 
  TrendingUp, 
  DollarSign, 
  AlertTriangle, 
  Truck, 
  Boxes, 
  ArrowUpRight, 
  Percent 
} from 'lucide-react';
import { StoreFinancials } from '../types/store';
import { useTranslation } from '../hooks/useTranslation';
import { useLanguage } from '../context/LanguageContext';

interface FinancialMetricsProps {
  financials: StoreFinancials;
  onAuditLowStock: () => void;
  onAuditCod: () => void;
}

export const FinancialMetrics: React.FC<FinancialMetricsProps> = ({
  financials,
  onAuditLowStock,
  onAuditCod,
}) => {
  const t = useTranslation();
  const { language } = useLanguage();

  const metrics = [
    { title: 'Monthly GMV', value: `৳${financials.monthlyGMVBDT.toLocaleString()}`, icon: TrendingUp, color: 'emerald' },
    { title: 'COD In-Transit', value: `৳${financials.codPendingSettlementBDT.toLocaleString()}`, icon: Truck, color: 'cyan' },
    { title: 'Inventory Valuation', value: `৳${financials.totalInventoryValuationCostBDT.toLocaleString()}`, icon: Boxes, color: 'teal' },
    { title: 'Replenishment Priority', value: `${financials.lowStockItemsCount} Items`, icon: AlertTriangle, color: 'amber' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {metrics.map((m, i) => (
        <div key={i} className="bg-slate-900/90 border border-slate-800 rounded-3xl p-7 shadow-lg hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between mb-5">
            <span className={`text-sm font-semibold uppercase tracking-wider text-slate-400 ${language === 'bn' ? 'font-bengali' : ''}`}>
              {t(m.title)}
            </span>
            <div className={`h-12 w-12 rounded-xl bg-${m.color}-500/10 border border-${m.color}-500/20 flex items-center justify-center text-${m.color}-400`}>
              <m.icon className="w-6 h-6" />
            </div>
          </div>
          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-bold font-mono text-white tracking-tight">
              {m.value}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};
