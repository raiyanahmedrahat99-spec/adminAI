import React, { useState } from 'react';
import { Users, Building, Phone, Plus, Trash2, DollarSign, Calendar, UserCheck, MapPin, Briefcase } from 'lucide-react';
import { DealerAccount } from '../types/store';
import { useTranslation } from '../hooks/useTranslation';
import { useLanguage } from '../context/LanguageContext';

interface DealerAccountsTabProps {
  dealers: DealerAccount[];
  onAddDealer: (dealer: DealerAccount) => void;
  onDeleteDealer: (id: string) => void;
}

export const DealerAccountsTab: React.FC<DealerAccountsTabProps> = ({ dealers, onAddDealer, onDeleteDealer }) => {
  const t = useTranslation();
  const { language } = useLanguage();
  const [showModal, setShowModal] = useState(false);
  const [dealerName, setDealerName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [category, setCategory] = useState('General Distribution');
  const [outstandingPayableBDT, setOutstandingPayableBDT] = useState<number | ''>('');
  const [contactPerson, setContactPerson] = useState('');
  const [phone, setPhone] = useState('');
  const [representativeName, setRepresentativeName] = useState('');
  const [representativePhone, setRepresentativePhone] = useState('');
  const [officeAddress, setOfficeAddress] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dealerName || !phone) return;

    const newDealer: DealerAccount = {
      id: `dlr-${Date.now()}`,
      dealerName,
      companyName: companyName || dealerName,
      category,
      outstandingPayableBDT: outstandingPayableBDT ? Number(outstandingPayableBDT) : 0,
      lastOrderDate: new Date().toISOString().split('T')[0],
      contactPerson: contactPerson || 'Sales Rep',
      phone,
      representativeName: representativeName || undefined,
      representativePhone: representativePhone || undefined,
      officeAddress: officeAddress || undefined
    };

    onAddDealer(newDealer);
    setDealerName('');
    setCompanyName('');
    setCategory('General Distribution');
    setOutstandingPayableBDT('');
    setContactPerson('');
    setPhone('');
    setRepresentativeName('');
    setRepresentativePhone('');
    setOfficeAddress('');
    setShowModal(false);
  };

  const totalPayables = dealers.reduce((acc, d) => acc + d.outstandingPayableBDT, 0);

  return (
    <div className="space-y-6">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400">
            <Users className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <h2 className={`text-lg sm:text-xl font-bold text-white ${language === 'bn' ? 'font-bengali' : ''}`}>
              {t('Dealer Accounts')}
            </h2>
            <p className={`text-[10px] sm:text-sm text-slate-400 ${language === 'bn' ? 'font-bengali' : ''}`}>
              Manage dealer accounts and supplier payables.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-6 w-full sm:w-auto">
          <div className="flex-1 sm:flex-none text-left sm:text-right">
            <span className="text-[10px] text-slate-400 block uppercase tracking-wider font-bold">Total Dealer Payables</span>
            <span className="font-mono text-base sm:text-xl font-bold text-teal-400">৳{totalPayables.toLocaleString()}</span>
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="flex items-center justify-center gap-2 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold px-4 py-2.5 rounded-xl text-xs transition-all shadow-lg"
          >
            <Plus className="w-4 h-4" />
            <span>Add Dealer</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {dealers.length === 0 ? (
          <div className="col-span-full bg-slate-900 border border-slate-800 rounded-2xl p-16 text-center text-slate-500">
            <div className="flex flex-col items-center gap-2">
              <Building className="w-10 h-10 opacity-20" />
              <p>No dealer accounts recorded yet.</p>
            </div>
          </div>
        ) : (
          dealers.map((dealer) => (
            <div key={dealer.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4 hover:border-slate-700 transition-all relative group">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-teal-400" />
                    {dealer.dealerName}
                  </h3>
                  <div className="text-[11px] text-slate-400 font-mono mt-0.5">{dealer.companyName}</div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-500 block uppercase font-bold">Payable</span>
                  <span className="font-mono text-sm font-bold text-amber-400">৳{dealer.outstandingPayableBDT.toLocaleString()}</span>
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-800">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-500 flex items-center gap-1.5"><UserCheck className="w-3.5 h-3.5 text-teal-500" /> Rep: {dealer.representativeName || dealer.contactPerson}</span>
                  <span className="text-slate-300 font-mono flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-cyan-500" /> {dealer.representativePhone || dealer.phone}</span>
                </div>
                {dealer.officeAddress && (
                  <div className="text-[10px] text-slate-500 flex items-start gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-600 shrink-0 mt-0.5" />
                    <span className="line-clamp-1">{dealer.officeAddress}</span>
                  </div>
                )}
              </div>

              <div className="pt-3 flex items-center justify-between text-[10px] text-slate-500 border-t border-slate-800/80">
                <span>Last Restock: <strong className="text-slate-300">{dealer.lastOrderDate}</strong></span>
                <button
                  onClick={() => onDeleteDealer(dealer.id)}
                  className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-lg w-full shadow-2xl space-y-6 my-8">
            <h3 className="text-lg font-bold text-white border-b border-slate-800 pb-3">Add Dealer Account</h3>
            <form onSubmit={handleSubmit} className="space-y-4 text-xs sm:text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Dealer Display Name</label>
                  <input
                    type="text"
                    required
                    value={dealerName}
                    onChange={(e) => setDealerName(e.target.value)}
                    placeholder="e.g. City Group Distributor"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Company Name</label>
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="e.g. Meghna Group of Industries"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-teal-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Category</label>
                  <input
                    type="text"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="e.g. Oil & Flour"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Outstanding (BDT)</label>
                  <input
                    type="number"
                    value={outstandingPayableBDT}
                    onChange={(e) => setOutstandingPayableBDT(e.target.value ? Number(e.target.value) : '')}
                    placeholder="0"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-teal-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Sales Rep Name</label>
                  <input
                    type="text"
                    value={representativeName}
                    onChange={(e) => setRepresentativeName(e.target.value)}
                    placeholder="e.g. Rahim Ahmed"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Sales Rep Phone</label>
                  <input
                    type="text"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="017xxxxxxxx"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-teal-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">Office / Warehouse Address</label>
                <textarea
                  value={officeAddress}
                  onChange={(e) => setOfficeAddress(e.target.value)}
                  placeholder="Enter office address..."
                  rows={2}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-teal-500 resize-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold shadow-lg transition-all"
                >
                  Save Dealer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
