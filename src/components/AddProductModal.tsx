import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  Check, 
  Copy, 
  Code2, 
  FileText, 
  DollarSign, 
  AlertCircle, 
  Layers, 
  Boxes, 
  Send 
} from 'lucide-react';
import { ProductCategory, Product, AiGeneratedProductMetadata } from '../types/store';

interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddProduct: (product: Product) => void;
}

const CATEGORIES: ProductCategory[] = [
  'Groceries & Cooking',
  'Biscuits & Bakery',
  'Snacks & Beverages',
  'Toiletries & Cleaning',
  'Personal Care & Hygiene'
];

const QUICK_SAMPLES = [
  {
    title: 'Rupchanda Fortified Soyabean Oil 2 Litre PET Bottle',
    category: 'Groceries & Cooking' as ProductCategory,
    rawSpecs: 'Vitamin A fortified, cold-pressed refinement, BEPZA certified, 2L volume',
    costPriceBDT: 340,
    stock: 35
  },
  {
    title: 'Olympic Lexus Vegetable Crackers 200g Box Pack',
    category: 'Biscuits & Bakery' as ProductCategory,
    rawSpecs: 'Crispy salted cracker with natural dehydrated spinach and carrot flakes',
    costPriceBDT: 62,
    stock: 50
  },
  {
    title: 'Savlon Ocean Blue Antiseptic Handwash 250ml Pump',
    category: 'Personal Care & Hygiene' as ProductCategory,
    rawSpecs: 'Moisturizing formula, kills 99.9% germs, pH balanced, marine floral aroma',
    costPriceBDT: 115,
    stock: 40
  }
];

export const AddProductModal: React.FC<AddProductModalProps> = ({
  isOpen,
  onClose,
  onAddProduct,
}) => {
  // Input fields
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<ProductCategory>('Groceries & Cooking');
  const [stockDetails, setStockDetails] = useState('');
  const [rawSpecs, setRawSpecs] = useState('');
  const [costPriceBDT, setCostPriceBDT] = useState<number | ''>('');
  const [stockCount, setStockCount] = useState<number>(30);
  const [supplierName, setSupplierName] = useState('');
  const [barcode, setBarcode] = useState('');

  // Generated metadata states
  const [suggestedPriceBDT, setSuggestedPriceBDT] = useState<number | ''>('');
  const [descriptionEnglish, setDescriptionEnglish] = useState('');
  const [descriptionBengali, setDescriptionBengali] = useState('');
  const [skuSuggestion, setSkuSuggestion] = useState('');
  const [reorderThreshold, setReorderThreshold] = useState<number>(20);
  const [keyFeatures, setKeyFeatures] = useState<string[]>([]);
  const [pricingRationale, setPricingRationale] = useState('');

  // Generation status
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [showJsonView, setShowJsonView] = useState(false);
  const [copiedJson, setCopiedJson] = useState(false);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    if (!title.trim()) {
      setGenerationError('Please provide a Product Title first.');
      return;
    }

    setIsGenerating(true);
    setGenerationError(null);

    const maxRetries = 3;
    let attempt = 0;

    const executeAttempt = async (): Promise<boolean> => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 35000); // 35s timeout for AI generation

      try {
        const response = await fetch('/api/ai/generate-product', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          signal: controller.signal,
          body: JSON.stringify({
            title,
            category,
            stockDetails: stockDetails || `${stockCount} units initial lot`,
            rawSpecs,
            currentCost: costPriceBDT ? Number(costPriceBDT) : undefined,
          }),
        });

        clearTimeout(timeoutId);
        const data: AiGeneratedProductMetadata & { error?: string; hint?: string } = await response.json();

        if (!response.ok || data.error) {
          const errorMsg = data.error || 'Server responded with an error';
          if (response.status === 503 || errorMsg.includes('high demand') || errorMsg.includes('UNAVAILABLE')) {
            return false; // Trigger retry
          }
          throw new Error(errorMsg);
        }

        // Populate input fields cleanly
        setSuggestedPriceBDT(data.suggested_price_bdt);
        setDescriptionEnglish(data.description_english || '');
        setDescriptionBengali(data.description_bengali || '');

        if (data.suggested_cost_bdt && !costPriceBDT) {
          setCostPriceBDT(data.suggested_cost_bdt);
        }
        if (data.recommended_reorder_level) {
          setReorderThreshold(data.recommended_reorder_level);
        }
        if (data.sku_suggestion) {
          setSkuSuggestion(data.sku_suggestion);
        }
        if (data.key_features) {
          setKeyFeatures(data.key_features);
        }
        if (data.rationale) {
          setPricingRationale(data.rationale);
        }
        return true;
      } catch (err: any) {
        clearTimeout(timeoutId);
        if (err.name === 'AbortError') {
          console.warn('AI Generation timed out.');
          return false;
        }
        if (err.message?.includes('503')) {
          return false;
        }
        throw err;
      }
    };

    while (attempt < maxRetries) {
      attempt++;
      const success = await executeAttempt();
      if (success) {
        setIsGenerating(false);
        return;
      }
      
      if (attempt < maxRetries) {
        const delay = Math.pow(2, attempt) * 1000;
        setGenerationError(`Server busy. Retrying... (Attempt ${attempt}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, delay));
        setGenerationError(null);
      }
    }

    setGenerationError('AI Executive is currently overloaded. Please try again in a few minutes or enter details manually.');
    setIsGenerating(false);
  };

  const handleApplySample = (sample: typeof QUICK_SAMPLES[0]) => {
    setTitle(sample.title);
    setCategory(sample.category);
    setRawSpecs(sample.rawSpecs);
    setCostPriceBDT(sample.costPriceBDT);
    setStockCount(sample.stock);
    setStockDetails(`Initial batch: ${sample.stock} units`);
    setSupplierName(sample.category === 'Groceries & Cooking' ? 'Meghna Group' : sample.category === 'Biscuits & Bakery' ? 'Olympic Industries' : 'ACI Consumer Brands');
  };

  const jsonPayload = {
    suggested_price_bdt: suggestedPriceBDT || 0,
    description_english: descriptionEnglish,
    description_bengali: descriptionBengali,
    ...(costPriceBDT ? { wholesale_cost_bdt: Number(costPriceBDT) } : {}),
    ...(skuSuggestion ? { sku: skuSuggestion } : {})
  };

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(jsonPayload, null, 2));
    setCopiedJson(true);
    setTimeout(() => setCopiedJson(false), 2000);
  };

  const handleSaveToCatalog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setGenerationError('Product Title is required.');
      return;
    }
    const finalRetailPrice = suggestedPriceBDT ? Number(suggestedPriceBDT) : 100;
    const finalCostPrice = costPriceBDT ? Number(costPriceBDT) : Math.round(finalRetailPrice * 0.82);
    const finalStock = Number(stockCount) || 25;

    const newProd: Product = {
      id: `prod-custom-${Date.now()}`,
      sku: skuSuggestion || `TOW-${category.substring(0, 3).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`,
      title: title.trim(),
      category: category,
      costPriceBDT: finalCostPrice,
      retailPriceBDT: finalRetailPrice,
      stock: finalStock,
      reorderLevel: reorderThreshold || 15,
      monthlyVelocityUnits: 45,
      supplier: supplierName || 'Dhaka Central Hub',
      status: finalStock <= (reorderThreshold || 15) ? 'low_stock' : 'in_stock',
      descriptionEnglish: descriptionEnglish || `${title} available at Towa Store.`,
      descriptionBengali: descriptionBengali || `${title} তোয়া স্টোরে সুলভ মূল্যে উপলব্ধ।`,
      updatedAt: new Date().toISOString(),
      isAiGenerated: true,
      ...(barcode.trim() ? { barcode: barcode.trim() } : {}),
    };

    onAddProduct(newProd);
    onClose();
  };

  const marginPct = (suggestedPriceBDT && costPriceBDT) 
    ? Math.round(((Number(suggestedPriceBDT) - Number(costPriceBDT)) / Number(suggestedPriceBDT)) * 1000) / 10 
    : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden my-8 flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-800 bg-slate-950/70 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                Add New Essential Product
                <span className="text-[11px] font-mono font-medium text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30">
                  Directive 1 Active
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Automated English & Bengali copywriting with Bangladesh market retail price suggestion (BDT)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowJsonView(!showJsonView)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono transition-all ${
                showJsonView 
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' 
                  : 'bg-slate-800 text-slate-400 hover:text-white border border-slate-700'
              }`}
              title="Toggle JSON Output View"
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>{showJsonView ? 'Visual Fields' : 'JSON Schema'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Quick Sample Fillers */}
        <div className="px-6 py-2.5 bg-slate-950/40 border-b border-slate-800/80 flex flex-wrap items-center gap-2 text-xs">
          <span className="text-slate-400 font-medium flex items-center gap-1">
            <Layers className="w-3.5 h-3.5 text-slate-500" />
            Test FMCG Presets:
          </span>
          {QUICK_SAMPLES.map((s, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleApplySample(s)}
              className="bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white px-2.5 py-1 rounded text-[11px] border border-slate-700/60 transition-colors"
            >
              {s.title.split(' ')[0]} {s.title.split(' ')[1]} ({s.category.split(' ')[0]})
            </button>
          ))}
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {generationError && (
            <div className="bg-rose-950/40 border border-rose-500/30 text-rose-300 p-3.5 rounded-xl text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Generation Notice</p>
                <p>{generationError}</p>
              </div>
            </div>
          )}

          {/* Core Input Block */}
          <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Product Title / Name <span className="text-emerald-400">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g., Teer Fortified Soybean Oil 5 Litre or Radhuni Spices"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Category <span className="text-emerald-400">*</span>
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as ProductCategory)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Wholesale Procurement Cost (BDT)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-slate-500 text-xs font-mono">৳</span>
                  <input
                    type="number"
                    placeholder="e.g. 780"
                    value={costPriceBDT}
                    onChange={(e) => setCostPriceBDT(e.target.value ? Number(e.target.value) : '')}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-7 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Initial Stock Quantity
                </label>
                <input
                  type="number"
                  placeholder="30"
                  value={stockCount}
                  onChange={(e) => setStockCount(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Supplier / Distributor
                </label>
                <input
                  type="text"
                  placeholder="e.g. City Group, Square, Unilever"
                  value={supplierName}
                  onChange={(e) => setSupplierName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Barcode (EAN/UPC)
                </label>
                <input
                  type="text"
                  placeholder="e.g. 8941100123456"
                  value={barcode}
                  onChange={(e) => setBarcode(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                Raw Specifications / Packaging Notes (Optional Context for AI)
              </label>
              <input
                type="text"
                placeholder="e.g. 200g jar, sun-dried, high curcumin, shelf life 12 months, family size pack"
                value={rawSpecs}
                onChange={(e) => setRawSpecs(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-300 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Directive 1 Execution Trigger Button */}
            <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-slate-800/80">
              <div className="text-xs text-slate-400 flex items-center gap-1.5">
                <span className="text-emerald-400">⚡</span>
                <span>Gemini 3.8 Flash automated pricing engine & bilingual copywriter</span>
              </div>

              <button
                type="button"
                onClick={handleGenerate}
                disabled={isGenerating || !title.trim()}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-xs transition-all shadow-lg ${
                  isGenerating || !title.trim()
                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                    : 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 shadow-emerald-500/20 hover:scale-[1.01]'
                }`}
              >
                {isGenerating ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                    <span>Analyzing Bangladesh Retail Trends & Generating...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Run Directive 1: Auto-Generate Descriptions & BDT Price</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* JSON View Alternative Modal */}
          {showJsonView ? (
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-xs">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3 text-slate-400">
                <span className="text-emerald-400 font-semibold">Structured Output Schema (JSON)</span>
                <button
                  type="button"
                  onClick={handleCopyJson}
                  className="flex items-center gap-1 px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded border border-slate-700 transition-colors"
                >
                  {copiedJson ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedJson ? 'Copied' : 'Copy JSON'}</span>
                </button>
              </div>
              <pre className="text-emerald-300 overflow-x-auto p-2 bg-slate-900/80 rounded-lg">
                {JSON.stringify(jsonPayload, null, 2)}
              </pre>
            </div>
          ) : (
            /* Populated Result Fields */
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                  <FileText className="w-3.5 h-3.5 text-emerald-400" />
                  Generated Catalog Attributes & Descriptions
                </h3>
                {suggestedPriceBDT && (
                  <span className="text-[11px] text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded-full font-medium">
                    ✓ AI Pricing & Copy Ready
                  </span>
                )}
              </div>

              {/* Price & SKU Suggestion Row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-slate-950/80 p-3 rounded-xl border border-emerald-500/30">
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
                      <DollarSign className="w-3.5 h-3.5" /> Market Price Suggestion (BDT)
                    </label>
                    {marginPct !== null && (
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold">
                        {marginPct}% Margin
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-emerald-400 font-bold font-mono text-sm">৳</span>
                    <input
                      type="number"
                      placeholder="Suggested Retail (BDT)"
                      value={suggestedPriceBDT}
                      onChange={(e) => setSuggestedPriceBDT(e.target.value ? Number(e.target.value) : '')}
                      className="w-full bg-slate-900 border border-emerald-500/40 rounded-lg pl-8 pr-3 py-2 text-base font-bold text-emerald-300 focus:outline-none focus:border-emerald-400 font-mono"
                    />
                  </div>
                  {pricingRationale && (
                    <p className="text-[11px] text-slate-400 mt-1.5 leading-relaxed italic">
                      "{pricingRationale}"
                    </p>
                  )}
                </div>

                <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800">
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Recommended SKU
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. TOW-GRO-044"
                    value={skuSuggestion}
                    onChange={(e) => setSkuSuggestion(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-slate-500"
                  />
                  <p className="text-[10px] text-slate-500 mt-1">Unique store identifier for barcode & inventory sync</p>
                </div>

                <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800">
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Reorder Threshold (Units)
                  </label>
                  <input
                    type="number"
                    placeholder="20"
                    value={reorderThreshold}
                    onChange={(e) => setReorderThreshold(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-slate-500"
                  />
                  <p className="text-[10px] text-slate-500 mt-1">Triggers low-stock alert when stock falls below this level</p>
                </div>
              </div>

              {/* English Description Field */}
              <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                    <span>🇬🇧 English Description</span>
                    <span className="text-[10px] font-normal text-slate-400">(Crisp, engaging, modern e-commerce copy)</span>
                  </label>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {descriptionEnglish.length} characters
                  </span>
                </div>
                <textarea
                  rows={3}
                  placeholder="Enter or auto-generate crisp English e-commerce description..."
                  value={descriptionEnglish}
                  onChange={(e) => setDescriptionEnglish(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 leading-relaxed"
                />
              </div>

              {/* Bengali Description Field (বাংলা বর্ণনা) */}
              <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 font-bengali text-sm">
                    <span>🇧🇩 বাংলা বর্ণনা (Bengali Description)</span>
                    <span className="text-[10px] font-normal text-slate-400 font-sans">(গৃহস্থালি ব্যবহারের উপযোগী, স্বচ্ছ ও নির্ভরযোগ্য)</span>
                  </label>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {descriptionBengali.length} characters
                  </span>
                </div>
                <textarea
                  rows={3}
                  placeholder="বাংলায় প্রাকৃতিক ও পেশাদার পণ্য বিবরণী লিখুন বা এআই দিয়ে জেনারেট করুন..."
                  value={descriptionBengali}
                  onChange={(e) => setDescriptionBengali(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm text-slate-100 font-bengali focus:outline-none focus:border-emerald-500 leading-relaxed"
                />
              </div>

              {/* Bullet Features (if provided by AI) */}
              {keyFeatures.length > 0 && (
                <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 text-xs">
                  <span className="font-semibold text-slate-300 block mb-1.5">Key Value Propositions:</span>
                  <div className="flex flex-wrap gap-2">
                    {keyFeatures.map((kf, i) => (
                      <span key={i} className="bg-slate-900 text-slate-300 px-2.5 py-1 rounded-md border border-slate-700 text-[11px] flex items-center gap-1">
                        <Check className="w-3 h-3 text-emerald-400" />
                        {kf}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/80 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleSaveToCatalog}
              className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-6 py-2 rounded-xl text-xs shadow-lg shadow-emerald-500/20 transition-all hover:scale-[1.01]"
            >
              <Boxes className="w-4 h-4 text-slate-950" />
              <span>Save Product to Towa Catalog</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
