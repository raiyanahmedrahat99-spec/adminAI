import React, { useState } from 'react';
import { 
  FileDown, 
  FileSpreadsheet, 
  Calendar, 
  ChevronDown, 
  Clock, 
  Download,
  AlertCircle,
  FileText
} from 'lucide-react';
import { Product, Order, DiaryLedgerEntry, DealerAccount } from '../types/store';
import { format, subDays, startOfMonth, endOfMonth, startOfYear, isWithinInterval, parseISO } from 'date-fns';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

interface ExecutiveReportGeneratorProps {
  products: Product[];
  orders: Order[];
  ledgerEntries: DiaryLedgerEntry[];
  dealers: DealerAccount[];
}

type TimePreset = 'today' | 'yesterday' | 'last_7_days' | 'last_30_days' | 'this_month' | 'last_month' | 'last_6_months' | 'this_year' | 'all_time';

export const ExecutiveReportGenerator: React.FC<ExecutiveReportGeneratorProps> = ({
  products,
  orders,
  ledgerEntries,
  dealers,
}) => {
  const [preset, setPreset] = useState<TimePreset>('last_30_days');
  const [isGenerating, setIsGenerating] = useState(false);

  const getInterval = (p: TimePreset) => {
    const now = new Date();
    switch (p) {
      case 'today':
        return { start: now, end: now };
      case 'yesterday':
        return { start: subDays(now, 1), end: subDays(now, 1) };
      case 'last_7_days':
        return { start: subDays(now, 7), end: now };
      case 'last_30_days':
        return { start: subDays(now, 30), end: now };
      case 'this_month':
        return { start: startOfMonth(now), end: now };
      case 'last_month':
        const lastMonth = subDays(startOfMonth(now), 1);
        return { start: startOfMonth(lastMonth), end: endOfMonth(lastMonth) };
      case 'last_6_months':
        return { start: subDays(now, 180), end: now };
      case 'this_year':
        return { start: startOfYear(now), end: now };
      case 'all_time':
        return { start: new Date(0), end: now };
      default:
        return { start: subDays(now, 30), end: now };
    }
  };

  const filterByDate = (dateStr: string, interval: { start: Date, end: Date }) => {
    try {
      const d = parseISO(dateStr);
      // Simplify to date match for daily granularity
      const compareDate = d.getTime();
      const start = new Date(interval.start).setHours(0, 0, 0, 0);
      const end = new Date(interval.end).setHours(23, 59, 59, 999);
      return compareDate >= start && compareDate <= end;
    } catch {
      return false;
    }
  };

  const handleExportCSV = () => {
    setIsGenerating(true);
    const interval = getInterval(preset);
    
    // Filter data
    const filteredOrders = orders.filter(o => filterByDate(o.createdAt, interval));
    const filteredLedger = ledgerEntries.filter(e => filterByDate(e.date, interval));

    // Headers
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Type,Date,Reference,Party/Customer,Location,Amount (BDT),Status,Notes\n";

    // Orders
    filteredOrders.forEach(o => {
      csvContent += `Sales Order,${format(parseISO(o.createdAt), 'yyyy-MM-dd')},${o.orderNumber},${o.customerName},"${o.district}, ${o.division}",${o.codAmountBDT},${o.status},${o.itemsSummary.replace(/,/g, ';')}\n`;
    });

    // Ledger
    filteredLedger.forEach(e => {
      csvContent += `${e.type.toUpperCase()},${e.date},${e.id},${e.partyName},N/A,${e.amountBDT},${e.status},${e.description.replace(/,/g, ';')}\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Towa_Audit_Report_${preset}_${format(new Date(), 'yyyyMMdd')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setIsGenerating(false);
  };

  const handleExportPDF = () => {
    setIsGenerating(true);
    const interval = getInterval(preset);
    const doc = new jsPDF();
    const dateRangeStr = preset === 'all_time' ? 'All Time Baseline' : `${format(interval.start, 'dd MMM yyyy')} - ${format(interval.end, 'dd MMM yyyy')}`;

    // PDF Configuration
    const primaryColor: [number, number, number] = [16, 185, 129]; // Emerald 500
    const textColor: [number, number, number] = [31, 41, 55]; // Slate 800
    
    // Header
    doc.setFontSize(22);
    doc.setTextColor(textColor[0], textColor[1], textColor[2]);
    doc.text('TOWA STORE', 14, 20);
    
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.text('towastore.shop | Executive Audit Command Center', 14, 26);
    
    doc.setFontSize(14);
    doc.setTextColor(textColor[0], textColor[1], textColor[2]);
    doc.text('Executive Financial Audit Report', 14, 40);
    
    doc.setFontSize(10);
    doc.text(`Period: ${dateRangeStr}`, 14, 46);
    doc.text(`Generated: ${format(new Date(), 'dd MMM yyyy, hh:mm a')}`, 14, 52);

    // 1. Executive Summary
    const filteredOrders = orders.filter(o => filterByDate(o.createdAt, interval));
    const settledOrders = filteredOrders.filter(o => o.status === 'delivered_settled');
    const totalSales = settledOrders.reduce((acc, o) => acc + o.codAmountBDT, 0);
    
    // Average store margin for calculation
    const storeMarginPct = products.length > 0 
      ? products.reduce((acc, p) => acc + ((p.retailPriceBDT - p.costPriceBDT) / p.retailPriceBDT), 0) / products.length 
      : 0.16; 
      
    const estProfit = totalSales * storeMarginPct;
    
    const filteredLedger = ledgerEntries.filter(e => filterByDate(e.date, interval));
    const expenses = filteredLedger.filter(e => e.type === 'expense').reduce((acc, e) => acc + e.amountBDT, 0);
    const receivables = filteredLedger.filter(e => e.type === 'receivable' && e.status === 'pending').reduce((acc, e) => acc + e.amountBDT, 0);
    const payables = filteredLedger.filter(e => e.type === 'payable' && e.status === 'pending').reduce((acc, e) => acc + e.amountBDT, 0);

    const invCostValuation = products.reduce((acc, p) => acc + (p.costPriceBDT * p.stock), 0);
    const invRetailValuation = products.reduce((acc, p) => acc + (p.retailPriceBDT * p.stock), 0);

    autoTable(doc, {
      startY: 60,
      head: [['Metric', 'Value (BDT)']],
      body: [
        ['Total Realized Sales (Settled)', totalSales.toLocaleString()],
        ['Estimated Gross Profit', estProfit.toLocaleString()],
        ['Total Operational Expenses', expenses.toLocaleString()],
        ['Pending Customer Dues (Receivables)', receivables.toLocaleString()],
        ['Pending Supplier Obligations (Payables)', payables.toLocaleString()],
        ['Inventory Valuation (At Cost)', invCostValuation.toLocaleString()],
        ['Inventory Valuation (At Retail)', invRetailValuation.toLocaleString()],
        ['Net Cash Position (Sales - Expenses)', (totalSales - expenses).toLocaleString()],
      ],
      theme: 'striped',
      headStyles: { fillColor: primaryColor },
      styles: { fontSize: 9, cellPadding: 3 }
    });

    // 2. Sales & Dispatches Table
    doc.setFontSize(12);
    doc.text('Sales & Courier Dispatch Details', 14, (doc as any).lastAutoTable.finalY + 15);
    
    const orderData = filteredOrders.map(o => [
      format(parseISO(o.createdAt), 'dd/MM'),
      o.orderNumber,
      o.customerName,
      o.district,
      o.courierPartner.replace(' Courier', ''),
      o.codAmountBDT.toLocaleString(),
      o.status.replace('_', ' ')
    ]);

    autoTable(doc, {
      startY: (doc as any).lastAutoTable.finalY + 20,
      head: [['Date', 'Order #', 'Customer', 'Area', 'Courier', 'Amount', 'Status']],
      body: orderData.length > 0 ? orderData : [['No data found for this period', '-', '-', '-', '-', '-', '-']],
      theme: 'grid',
      headStyles: { fillColor: [51, 65, 85] },
      styles: { fontSize: 8, cellPadding: 2 }
    });

    // 3. Ledger & Diary Table
    doc.setFontSize(12);
    doc.text('Store Ledger & Transaction Diary', 14, (doc as any).lastAutoTable.finalY + 15);

    const ledgerData = filteredLedger.map(e => [
      format(parseISO(e.date), 'dd/MM'),
      e.type.toUpperCase(),
      e.partyName,
      e.amountBDT.toLocaleString(),
      e.status.toUpperCase(),
      e.description
    ]);

    autoTable(doc, {
      startY: (doc as any).lastAutoTable.finalY + 20,
      head: [['Date', 'Type', 'Party/Entity', 'Amount', 'Status', 'Description']],
      body: ledgerData.length > 0 ? ledgerData : [['No data found for this period', '-', '-', '-', '-', '-']],
      theme: 'grid',
      headStyles: { fillColor: [51, 65, 85] },
      styles: { fontSize: 8, cellPadding: 2 }
    });

    // Footer
    const pageCount = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text(`Towa Admin Executive Suite - Confidential Financial Audit - Page ${i} of ${pageCount}`, 14, 285);
    }

    // Save PDF
    doc.save(`Towa_Audit_${preset}_${format(new Date(), 'yyyyMMdd')}.pdf`);
    setIsGenerating(false);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <FileDown className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Executive Audit Generator</h3>
            <p className="text-xs text-slate-400 mt-0.5">Generate high-precision PDF or CSV audit snapshots</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="relative group w-full md:w-56">
            <select
              value={preset}
              onChange={(e) => setPreset(e.target.value as TimePreset)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-emerald-500 appearance-none cursor-pointer hover:bg-slate-900 transition-colors"
            >
              <option value="today">Report: Today</option>
              <option value="yesterday">Report: Yesterday</option>
              <option value="last_7_days">Report: Last 7 Days</option>
              <option value="last_30_days">Report: Last 30 Days</option>
              <option value="this_month">Report: This Month</option>
              <option value="last_month">Report: Last Month</option>
              <option value="last_6_months">Report: Last 6 Months</option>
              <option value="this_year">Report: This Year</option>
              <option value="all_time">Audit Baseline: All Time</option>
            </select>
            <ChevronDown className="w-4 h-4 absolute right-3 top-3.5 text-slate-500 pointer-events-none group-hover:text-slate-300" />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <button
              onClick={handleExportCSV}
              disabled={isGenerating}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 px-5 py-3 rounded-xl text-xs font-bold transition-all border border-slate-700 disabled:opacity-50"
            >
              <FileSpreadsheet className="w-4 h-4 text-cyan-400" />
              <span>CSV</span>
            </button>
            <button
              onClick={handleExportPDF}
              disabled={isGenerating}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-6 py-3 rounded-xl text-xs font-bold transition-all shadow-lg shadow-emerald-950/20 disabled:opacity-50"
            >
              <FileText className="w-4 h-4" />
              <span>{isGenerating ? 'Generating...' : 'PDF Audit'}</span>
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
        <div className="bg-slate-950/50 p-4 rounded-2xl border border-slate-800 flex items-center gap-4">
          <div className="h-10 w-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center">
            <Clock className="w-5 h-5 text-slate-500" />
          </div>
          <div>
            <span className="text-[10px] text-slate-500 block uppercase font-bold tracking-wider">Audit Logic</span>
            <span className="text-xs text-slate-300 font-medium">Real-time ledger sync</span>
          </div>
        </div>
        <div className="bg-slate-950/50 p-4 rounded-2xl border border-slate-800 flex items-center gap-4">
          <div className="h-10 w-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center">
            <AlertCircle className="w-5 h-5 text-amber-500/70" />
          </div>
          <div>
            <span className="text-[10px] text-slate-500 block uppercase font-bold tracking-wider">Compliance</span>
            <span className="text-xs text-slate-300 font-medium">Standard financial format</span>
          </div>
        </div>
        <div className="bg-slate-950/50 p-4 rounded-2xl border border-slate-800 flex items-center gap-4">
          <div className="h-10 w-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center">
            <Download className="w-5 h-5 text-emerald-500/70" />
          </div>
          <div>
            <span className="text-[10px] text-slate-500 block uppercase font-bold tracking-wider">Security</span>
            <span className="text-xs text-slate-300 font-medium">Client-side generation</span>
          </div>
        </div>
      </div>
    </div>
  );
};
