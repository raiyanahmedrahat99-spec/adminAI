import React, { useState } from 'react';
import { BookOpen, Plus, Trash2, CheckCircle, Clock, Calendar, FileText, User, Phone } from 'lucide-react';
import { DiaryLedgerEntry } from '../types/store';
import { useTranslation } from '../hooks/useTranslation';
import { useLanguage } from '../context/LanguageContext';

interface LedgerDiaryTabProps {
  entries: DiaryLedgerEntry[];
  onAddEntry: (entry: DiaryLedgerEntry) => void;
  onDeleteEntry: (id: string) => void;
}

export const LedgerDiaryTab: React.FC<LedgerDiaryTabProps> = ({ entries, onAddEntry, onDeleteEntry }) => {
  const t = useTranslation();
  const { language } = useLanguage();
  const [showAddModal, setShowAddModal] = useState(false);
  const [partyName, setPartyName] = useState('');
  const [description, setDescription] = useState('');
  const [amountBDT, setAmountBDT] = useState<number | ''>('');
  const [type, setType] = useState<DiaryLedgerEntry['type']>('receivable');
  const [representativeName, setRepresentativeName] = useState('');
  const [contactNumber, setContactNumber] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!partyName || !amountBDT) return;

    const newEntry: DiaryLedgerEntry = {
      id: `ldg-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      type,
      partyName,
      description: description || 'Manual diary entry',
      amountBDT: Number(amountBDT),
      status: 'pending',
      notes: 'Added via Admin Diary',
      representativeName: representativeName || undefined,
      contactNumber: contactNumber || undefined
    };

    onAddEntry(newEntry);
    setPartyName('');
    setDescription('');
    setAmountBDT('');
    setRepresentativeName('');
    setContactNumber('');
    setShowAddModal(false);
  };

  const totalReceivable = entries.filter(e => e.type === 'receivable' && e.status === 'pending').reduce((acc, e) => acc + e.amountBDT, 0);
  const totalPayable = entries.filter(e => e.type === 'payable' && e.status === 'pending').reduce((acc, e) => acc + e.amountBDT, 0);

  return (
    <div className="space-y-6">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <BookOpen className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <h2 className={`text-lg sm:text-xl font-bold text-white ${language === 'bn' ? 'font-bengali' : ''}`}>
                {t('Store Ledger & Diary')}
              </h2>
              <p className={`text-[10px] sm:text-sm text-slate-400 ${language === 'bn' ? 'font-bengali' : ''}`}>
                Record customer dues, supplier payables and sales.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4 w-full sm:w-auto">
          <div className="flex-1 sm:flex-none text-left sm:text-right">
            <span className="text-[10px] text-slate-400 block uppercase tracking-wider font-bold">Total Receivable</span>
            <span className="font-mono text-base sm:text-lg font-bold text-emerald-400">৳{totalReceivable.toLocaleString()}</span>
          </div>
          <span className="hidden sm:inline text-slate-700">|</span>
          <div className="flex-1 sm:flex-none text-left sm:text-right">
            <span className="text-[10px] text-slate-400 block uppercase tracking-wider font-bold">Total Payable</span>
            <span className="font-mono text-base sm:text-lg font-bold text-amber-400">৳{totalPayable.toLocaleString()}</span>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-4 py-2.5 rounded-xl text-xs transition-all shadow-lg"
          >
            <Plus className="w-4 h-4" />
            <span>Add Entry</span>
          </button>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-950 text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Date & Details</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Party / Business</th>
                <th className="py-3 px-4">Amount (BDT)</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {entries.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center gap-2">
                      <FileText className="w-8 h-8 opacity-20" />
                      <p>No transactions recorded in diary yet.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                entries.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-mono text-[10px] text-slate-400">{item.date}</div>
                      <div className="text-slate-300 mt-0.5 line-clamp-1 max-w-[150px]">{item.description}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        item.type === 'receivable' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                        item.type === 'payable' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                        item.type === 'cash_sale' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' :
                        'bg-slate-800 text-slate-400'
                      }`}>
                        {item.type}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-white">{item.partyName}</div>
                      {(item.representativeName || item.contactNumber) && (
                        <div className="flex items-center gap-2 mt-0.5 text-[10px] text-slate-500">
                          {item.representativeName && <span className="flex items-center gap-1"><User className="w-2.5 h-2.5" /> {item.representativeName}</span>}
                          {item.contactNumber && <span className="flex items-center gap-1 font-mono"><Phone className="w-2.5 h-2.5" /> {item.contactNumber}</span>}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-emerald-400">৳{item.amountBDT.toLocaleString()}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold inline-flex items-center gap-1 ${
                        item.status === 'cleared' ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-500/30' : 'bg-amber-950/60 text-amber-400 border border-amber-500/30'
                      }`}>
                        {item.status === 'cleared' ? <CheckCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                        {item.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => onDeleteEntry(item.id)}
                        className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-lg w-full shadow-2xl space-y-6 my-8">
            <h3 className="text-lg font-bold text-white border-b border-slate-800 pb-3">Add Store Diary Entry</h3>
            <form onSubmit={handleSubmit} className="space-y-4 text-xs sm:text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Transaction Type</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="receivable">Receivable (পাওনা)</option>
                    <option value="payable">Payable (দেনা)</option>
                    <option value="cash_sale">Cash Sale</option>
                    <option value="expense">Expense</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Amount (BDT)</label>
                  <input
                    type="number"
                    required
                    value={amountBDT}
                    onChange={(e) => setAmountBDT(e.target.value ? Number(e.target.value) : '')}
                    placeholder="e.g. 2500"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">Party / Business Name</label>
                <input
                  type="text"
                  required
                  value={partyName}
                  onChange={(e) => setPartyName(e.target.value)}
                  placeholder="e.g. Rahim Store / PRAN Distributor"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Representative Name</label>
                  <input
                    type="text"
                    value={representativeName}
                    onChange={(e) => setRepresentativeName(e.target.value)}
                    placeholder="e.g. Store Manager"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Contact Number</label>
                  <input
                    type="text"
                    value={contactNumber}
                    onChange={(e) => setContactNumber(e.target.value)}
                    placeholder="017xxxxxxxx"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">Short Note / Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter details about this transaction..."
                  rows={2}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-emerald-500 resize-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold shadow-lg transition-all"
                >
                  Save Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
