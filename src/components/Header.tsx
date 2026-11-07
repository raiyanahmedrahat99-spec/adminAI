import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Sparkles, 
  PlusCircle, 
  TrendingUp, 
  Package, 
  Truck, 
  ShieldCheck, 
  ExternalLink,
  Languages,
  LogOut,
  User as UserIcon,
  BookOpen,
  Users,
  Menu,
  X,
  Clock
} from 'lucide-react';
import { useTranslation } from '../hooks/useTranslation';
import { useLanguage } from '../context/LanguageContext';
import { signOut, User } from 'firebase/auth';
import { auth } from '../lib/firebase';

interface HeaderProps {
  activeTab: 'overview' | 'catalog' | 'orders' | 'ledger' | 'dealers';
  setActiveTab: (tab: 'overview' | 'catalog' | 'orders' | 'ledger' | 'dealers') => void;
  onOpenAddModal: () => void;
  totalProductsCount: number;
  lowStockCount: number;
  currentUser: User | null;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onOpenAddModal,
  totalProductsCount,
  lowStockCount,
  currentUser,
}) => {
  const t = useTranslation();
  const { language, toggleLanguage } = useLanguage();
  const [dhakaTime, setDhakaTime] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const timeStr = new Intl.DateTimeFormat('en-GB', {
        timeZone: 'Asia/Dhaka',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      }).format(now);
      setDhakaTime(timeStr);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error('Failed to sign out:', err);
    }
  };

  const tabs = [
    { id: 'overview', label: 'Executive Audit', icon: TrendingUp },
    { id: 'catalog', label: 'Catalog', icon: Package },
    { id: 'orders', label: 'COD Logistics', icon: Truck },
    { id: 'ledger', label: 'Store Ledger & Diary', icon: BookOpen },
    { id: 'dealers', label: 'Dealer Accounts', icon: Users },
  ];

  return (
    <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur sticky top-0 z-30">
      {/* Main Header Area */}
      <div className="px-4 lg:px-10 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2.5">
            <div className="h-10 w-10 sm:h-11 sm:w-11 rounded-xl overflow-hidden bg-white p-1 border border-slate-700 shadow-xl shadow-emerald-500/5 shrink-0 flex items-center justify-center">
              <img 
                src="https://www.google.com/s2/favicons?domain=towastore.shop&sz=128" 
                alt="Towa Store" 
                className="w-full h-full object-contain scale-110"
              />
            </div>
            <div>
              <h1 className={`text-lg sm:text-xl font-black tracking-tight text-white flex items-center gap-1.5 ${language === 'bn' ? 'font-bengali' : ''}`}>
                Towa <span className="text-emerald-400 font-extrabold">{t('Admin')}</span>
              </h1>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <p className={`text-[10px] sm:text-[11px] font-medium text-slate-400 tracking-wide uppercase ${language === 'bn' ? 'font-bengali' : ''}`}>
                  Executive Command Center
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden xl:flex items-center gap-1 bg-slate-950/80 p-1.5 rounded-xl border border-slate-800">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === tab.id
                    ? 'bg-slate-800 text-white shadow-sm border border-slate-700'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                } ${language === 'bn' ? 'font-bengali' : ''}`}
              >
                <Icon className="w-3.5 h-3.5 text-emerald-400" />
                <span>{t(tab.label)}</span>
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenAddModal}
            className={`hidden sm:flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs shadow-lg shadow-emerald-500/20 transition-all ${language === 'bn' ? 'font-bengali' : ''}`}
          >
            <PlusCircle className="w-4 h-4" />
            <span>{t('Add Product')}</span>
          </button>

          {/* Menu Toggle (Visible on all sizes now for consolidation) */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-xl bg-slate-800 text-slate-200 border border-slate-700 hover:bg-slate-700 transition-colors"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Menu Drawer */}
      {isMobileMenuOpen && (
        <div className="border-t border-slate-800 bg-slate-900 animate-in slide-in-from-top duration-300">
          <div className="p-4 space-y-2">
            {/* Nav Tabs for smaller screens in menu */}
            <div className="xl:hidden grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id as any);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`flex items-center gap-4 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                      activeTab === tab.id
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-transparent'
                    } ${language === 'bn' ? 'font-bengali' : ''}`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{t(tab.label)}</span>
                  </button>
                );
              })}
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-800">
              <a href="https://towastore.shop" target="_blank" rel="noreferrer" className="flex items-center justify-between px-4 py-3 rounded-xl bg-slate-950/50 border border-slate-800 text-slate-300 hover:text-emerald-400 transition-all group">
                <span className="text-sm font-semibold tracking-tight">Visit Storefront</span>
                <ExternalLink className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </a>

              <button 
                onClick={toggleLanguage}
                className="flex items-center justify-between px-4 py-3 rounded-xl bg-slate-950/50 border border-slate-800 text-slate-300 hover:text-emerald-400 transition-all"
              >
                <span className="text-sm font-semibold">{language === 'en' ? 'বাংলা (Bangla) সংস্করণ' : 'Switch to English'}</span>
                <Languages className="w-5 h-5" />
              </button>

              <div className="px-4 py-3 rounded-xl bg-slate-950/50 border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2 text-emerald-400">
                  <div className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </div>
                  <span className="text-xs font-bold uppercase tracking-wider">Live System</span>
                </div>
                <div className="text-right">
                  <span className="block text-[10px] text-slate-500 uppercase font-bold tracking-widest">Dhaka Time</span>
                  <span className="text-xs font-mono text-slate-200">{dhakaTime}</span>
                </div>
              </div>

              {currentUser && (
                <button
                  onClick={handleLogout}
                  className="flex items-center justify-between px-4 py-3 rounded-xl bg-rose-500/5 border border-rose-500/20 text-rose-400 hover:bg-rose-500/10 transition-all"
                >
                  <div className="flex flex-col items-start">
                    <span className="text-sm font-bold">Logout Session</span>
                    <span className="text-[10px] text-rose-500/60 font-mono">{currentUser.email}</span>
                  </div>
                  <LogOut className="w-5 h-5" />
                </button>
              )}
            </div>

            <div className="sm:hidden pt-4">
              <button
                onClick={() => {
                  onOpenAddModal();
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full flex items-center justify-center gap-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-slate-950 font-bold py-4 rounded-xl text-sm ${language === 'bn' ? 'font-bengali' : ''}`}
              >
                <PlusCircle className="w-5 h-5" />
                <span>{t('Add New Product')}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

