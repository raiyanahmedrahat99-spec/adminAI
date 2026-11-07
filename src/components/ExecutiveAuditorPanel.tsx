import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, 
  Send, 
  Sparkles, 
  TrendingUp, 
  AlertTriangle, 
  DollarSign, 
  Truck, 
  Copy, 
  Check, 
  Trash2, 
  FileSpreadsheet, 
  ShieldCheck, 
  ArrowRight,
  Info
} from 'lucide-react';
import { Product, Order, StoreFinancials, ChatMessage } from '../types/store';

interface ExecutiveAuditorPanelProps {
  products: Product[];
  orders: Order[];
  financials: StoreFinancials;
}

const STRATEGIC_QUICK_PROMPTS = [
  {
    label: 'Audit COD Cash-Flow & Aging',
    icon: DollarSign,
    prompt: 'Provide a rigorous audit of our current Cash on Delivery (COD) cash-flow, courier aging balance across Pathao and Steadfast, and risk of delayed remittances.',
  },
  {
    label: 'Stock Replenishment Schedule',
    icon: AlertTriangle,
    prompt: 'Analyze our current low-stock items (such as Teer Soybean Oil, ACI Pure Salt, Harpic Stockout, Dano Milk Powder) and provide an immediate prioritized procurement schedule with suggested order units and estimated capital outlay.',
  },
  {
    label: 'Margin Audit: Groceries vs Toiletries',
    icon: TrendingUp,
    prompt: 'Compare gross margins across our Groceries & Cooking Essentials category versus Toiletries & Hygiene. Highlight margin leakages and recommend pricing adjustments for FMCG daily staples.',
  },
  {
    label: 'Draft City Group Supplier Memo',
    icon: FileSpreadsheet,
    prompt: 'Draft an executive supplier purchase inquiry memo for City Group regarding a restock batch of Teer Fortified Soybean Oil 5L (50 units) and request volume discount payment terms.',
  },
  {
    label: 'Courier Logistics & RTO Optimization',
    icon: Truck,
    prompt: 'Evaluate our delivery efficiency and Return to Origin (RTO) rate. Recommend operational adjustments between Dhaka inside deliveries and Outside-Dhaka courier dispatches.',
  },
  {
    label: 'সাপ্তাহিক আর্থিক ও স্টক অডিট (Bangla)',
    icon: Sparkles,
    prompt: 'তোয়া স্টোরের চলতি সপ্তাহের ইনভেন্টরি মূল্যায়ন, স্টকআউট ঝুঁকি এবং ক্যাশ অন ডেলিভারি (COD) রিকভারি নিয়ে একটি সংক্ষিপ্ত নির্বাহী প্রতিবেদন উপস্থাপন করুন।',
  },
];

export const ExecutiveAuditorPanel: React.FC<ExecutiveAuditorPanelProps> = ({
  products,
  orders,
  financials,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-init',
      sender: 'executive_ai',
      text: `Towa Store operational telemetry loaded. Monitoring 186 catalog items across 5 FMCG categories. Total inventory valuation at cost stands at ৳${financials.totalInventoryValuationCostBDT.toLocaleString()} BDT with an average gross margin of ${financials.averageProfitMarginPct}%. Current priority: 1 stockout (Harpic 750ml) and ${financials.lowStockItemsCount} items at or below reorder threshold. COD in-transit receivables total ৳${financials.codPendingSettlementBDT.toLocaleString()} BDT. Specify your operational audit objective or select an executive directive below.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputMessage).trim();
    if (!text || isLoading) return;

    const userMsg: ChatMessage = {
      id: `msg-user-${Date.now()}`,
      sender: 'admin',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputMessage('');
    setIsLoading(true);

    try {
      // Prepare real store context
      const lowStockProducts = products
        .filter((p) => p.stock <= p.reorderLevel)
        .map((p) => `${p.title} (Stock: ${p.stock}/${p.reorderLevel}, Cost: ৳${p.costPriceBDT}, Retail: ৳${p.retailPriceBDT})`)
        .slice(0, 8)
        .join('; ');

      const pendingOrdersSummary = orders
        .filter((o) => ['cod_in_transit', 'out_for_delivery', 'dispatched'].includes(o.status))
        .map((o) => `${o.orderNumber}: ৳${o.codAmountBDT} (${o.courierPartner}, Aging: ${o.codAgingDays}d)`)
        .slice(0, 6)
        .join('; ');

      const contextData = {
        totalCatalogCount: products.length,
        totalInventoryValuationCostBDT: financials.totalInventoryValuationCostBDT,
        totalInventoryRetailValuationBDT: financials.totalInventoryRetailValuationBDT,
        averageProfitMarginPct: financials.averageProfitMarginPct,
        lowStockItemsCount: financials.lowStockItemsCount,
        outOfStockItemsCount: financials.outOfStockItemsCount,
        monthlyGMVBDT: financials.monthlyGMVBDT,
        codPendingSettlementBDT: financials.codPendingSettlementBDT,
        codSettledThisMonthBDT: financials.codSettledThisMonthBDT,
        returnToOriginRatePct: financials.returnToOriginRatePct,
        lowStockSummary: lowStockProducts,
        pendingOrdersSummary: pendingOrdersSummary,
      };

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 45000); // 45s timeout for deep audits

      const response = await fetch('/api/ai/chat-auditor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          message: text,
          history: messages.map((m) => ({ sender: m.sender, text: m.text })),
          contextData,
        }),
      });

      clearTimeout(timeoutId);
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Server error occurred during audit.');
      }

      const aiMsg: ChatMessage = {
        id: `msg-ai-${Date.now()}`,
        sender: 'executive_ai',
        text: data.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err: any) {
      console.error('Audit query failed:', err);
      const errorMsg: ChatMessage = {
        id: `msg-err-${Date.now()}`,
        sender: 'executive_ai',
        text: `Operational audit interrupted: ${err.message || 'Unable to connect to model'}. Verify that GEMINI_API_KEY is active in the Secrets panel.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyText = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClearHistory = () => {
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        sender: 'executive_ai',
        text: 'Audit session reset. Active telemetry from 186 catalog items refreshed. Submit your operational query.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 overflow-hidden">
      {/* Quick Strategic Action Prompt Chips */}
      <div className="px-4 py-2 bg-slate-950/40 border-b border-slate-800/60 overflow-x-auto scrollbar-hide">
        <div className="flex items-center gap-2 min-w-max">
          <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mr-1">
            Audits:
          </span>
          {STRATEGIC_QUICK_PROMPTS.map((q, idx) => {
            const Icon = q.icon;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => handleSendMessage(q.prompt)}
                disabled={isLoading}
                className="bg-slate-800/60 hover:bg-slate-800 text-slate-400 hover:text-white px-2.5 py-1 rounded-lg text-[10px] border border-slate-700/50 flex items-center gap-1.5 transition-all disabled:opacity-50"
              >
                <Icon className="w-3 h-3 text-emerald-500/70 shrink-0" />
                <span>{q.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-900/50">
        {messages.map((msg) => {
          const isUser = msg.sender === 'admin';
          return (
            <div
              key={msg.id}
              className={`flex gap-2.5 ${isUser ? 'ml-auto flex-row-reverse' : ''}`}
            >
              <div
                className={`w-7 h-7 rounded-lg shrink-0 flex items-center justify-center text-[10px] font-bold ${
                  isUser
                    ? 'bg-slate-700 text-slate-300'
                    : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                }`}
              >
                {isUser ? 'AD' : <Bot className="w-3.5 h-3.5" />}
              </div>

              <div
                className={`group relative rounded-2xl p-3 text-[11px] leading-relaxed max-w-[88%] ${
                  isUser
                    ? 'bg-emerald-600 text-white rounded-tr-none'
                    : 'bg-slate-950 text-slate-200 border border-slate-800 rounded-tl-none shadow-sm'
                }`}
              >
                {/* Message Header */}
                <div
                  className={`flex items-center justify-between pb-1.5 mb-1.5 border-b text-[9px] ${
                    isUser
                      ? 'border-emerald-500/50 text-emerald-100'
                      : 'border-slate-800 text-slate-500'
                  }`}
                >
                  <span className="font-bold tracking-tight">
                    {isUser ? 'ADMIN' : 'EXECUTIVE AUDITOR'}
                  </span>
                  <div className="flex items-center gap-2">
                    <span>{msg.timestamp}</span>
                    {!isUser && (
                      <button
                        onClick={() => handleCopyText(msg.id, msg.text)}
                        className="text-slate-600 hover:text-slate-300 transition-colors p-0.5"
                      >
                        {copiedId === msg.id ? (
                          <Check className="w-2.5 h-2.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-2.5 h-2.5" />
                        )}
                      </button>
                    )}
                  </div>
                </div>

                {/* Message Content */}
                <div className="whitespace-pre-wrap break-words selection:bg-emerald-500/30">
                  {msg.text}
                </div>
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex gap-2.5">
            <div className="w-7 h-7 rounded-lg shrink-0 flex items-center justify-center bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Bot className="w-3.5 h-3.5" />
            </div>
            <div className="bg-slate-950 text-slate-400 border border-slate-800 rounded-2xl rounded-tl-none p-3 text-[10px] flex items-center gap-2">
              <div className="w-3 h-3 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
              <span className="font-mono">Processing telemetry data...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar */}
      <div className="p-3 bg-slate-950 border-t border-slate-800">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Ask auditor..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              disabled={isLoading}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || !inputMessage.trim()}
            className={`px-3 py-2 rounded-xl font-bold text-[10px] flex items-center gap-1.5 transition-all ${
              isLoading || !inputMessage.trim()
                ? 'bg-slate-800 text-slate-600 cursor-not-allowed border border-slate-700'
                : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/10'
            }`}
          >
            <span>GO</span>
            <Send className="w-3 h-3" />
          </button>
        </form>
        <div className="flex items-center justify-between mt-2 px-1 text-[9px] text-slate-600 font-medium">
          <span className="truncate max-w-[70%]">Bilingual Support Active • বাংলা/EN</span>
          <span className="font-mono opacity-50">v2.0</span>
        </div>
      </div>
    </div>
  );
};
