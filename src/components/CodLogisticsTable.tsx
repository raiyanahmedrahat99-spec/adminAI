import React, { useState } from 'react';
import { 
  Truck, 
  DollarSign, 
  CheckCircle2, 
  Clock, 
  Plus,
  Trash2,
  ExternalLink,
  Search,
  Sparkles,
  User,
  Phone,
  MapPin
} from 'lucide-react';
import { Order, OrderStatus } from '../types/store';
import { useTranslation } from '../hooks/useTranslation';
import { useLanguage } from '../context/LanguageContext';

interface CodLogisticsTableProps {
  orders: Order[];
  onUpdateOrderStatus: (orderId: string, newStatus: OrderStatus) => void;
  onAuditCourierLogistics: () => void;
  onAddOrder: (order: Order) => void;
  onDeleteOrder: (orderId: string) => void;
}

export const CodLogisticsTable: React.FC<CodLogisticsTableProps> = ({
  orders,
  onUpdateOrderStatus,
  onAuditCourierLogistics,
  onAddOrder,
  onDeleteOrder,
}) => {
  const t = useTranslation();
  const { language } = useLanguage();
  const [filterPartner, setFilterPartner] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  // Form states for manual dispatch entry
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [district, setDistrict] = useState('Dhaka');
  const [codAmountBDT, setCodAmountBDT] = useState<number | ''>('');
  const [courierPartner, setCourierPartner] = useState<Order['courierPartner']>('Pathao Courier');
  const [deliveryManName, setDeliveryManName] = useState('');
  const [deliveryManPhone, setDeliveryManPhone] = useState('');
  const [courierTrackingCode, setCourierTrackingCode] = useState('');
  const [trackingLink, setTrackingLink] = useState('');
  const [itemsSummary, setItemsSummary] = useState('');

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !phone || !codAmountBDT) return;

    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      orderNumber: `TOW-ORD-${Math.floor(1000 + Math.random() * 9000)}`,
      customerName,
      phone,
      deliveryAddress,
      district,
      division: district === 'Dhaka' ? 'Dhaka' : 'Chittagong',
      itemsCount: 1,
      itemsSummary: itemsSummary || 'Towa Store Essential FMCG Items',
      codAmountBDT: Number(codAmountBDT),
      courierPartner,
      courierTrackingCode: courierTrackingCode || `TRK-${Math.floor(100000 + Math.random() * 900000)}`,
      status: 'dispatched',
      createdAt: new Date().toISOString(),
      codAgingDays: 0,
      deliveryManName: deliveryManName || undefined,
      deliveryManPhone: deliveryManPhone || undefined,
      trackingLink: trackingLink || undefined
    };

    onAddOrder(newOrder);
    setCustomerName('');
    setPhone('');
    setDeliveryAddress('');
    setCodAmountBDT('');
    setDeliveryManName('');
    setDeliveryManPhone('');
    setCourierTrackingCode('');
    setTrackingLink('');
    setItemsSummary('');
    setShowAddModal(false);
  };

  const filteredOrders = orders.filter((o) => {
    const matchesCourier = filterPartner === 'All' || o.courierPartner === filterPartner;
    const matchesSearch =
      o.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.district.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.courierTrackingCode.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCourier && matchesSearch;
  });

  const totalInTransit = orders
    .filter((o) => ['cod_in_transit', 'out_for_delivery', 'dispatched'].includes(o.status))
    .reduce((sum, o) => sum + o.codAmountBDT, 0);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden flex flex-col">
      {/* Logistics Banner */}
      <div className="p-6 border-b border-slate-800 bg-slate-950/70 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
              <Truck className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <h2 className={`text-lg sm:text-xl font-bold text-white flex items-center gap-2 ${language === 'bn' ? 'font-bengali' : ''}`}>
                {t('COD Logistics')}
              </h2>
              <p className={`text-[10px] sm:text-sm text-slate-400 ${language === 'bn' ? 'font-bengali' : ''}`}>
                Manual & Live Courier Dispatch Management
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-6 w-full lg:w-auto">
          <div className="flex-1 lg:flex-none text-left lg:text-right">
            <span className="text-[10px] uppercase tracking-wider text-slate-500 block font-bold">
              Pending Remittance
            </span>
            <span className="font-mono text-base sm:text-xl font-bold text-cyan-400">
              ৳{totalInTransit.toLocaleString()}
            </span>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="w-full lg:w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-white px-5 py-3 rounded-xl text-xs font-bold shadow-lg shadow-cyan-900/30 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Dispatch</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 bg-slate-950/40 border-b border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
        <div className="relative w-full sm:max-w-xs">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
          <input
            type="text"
            placeholder="Search order, customer, tracking..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700/80 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0">
          {['All', 'Pathao', 'Steadfast', 'RedX'].map((partner) => (
            <button
              key={partner}
              onClick={() => setFilterPartner(partner === 'All' ? 'All' : partner)}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all whitespace-nowrap ${
                (filterPartner === partner || (partner === 'Pathao' && filterPartner === 'Pathao Courier'))
                  ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                  : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800'
              }`}
            >
              {partner}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs sm:text-sm">
          <thead className="bg-slate-950/80 text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-800">
            <tr>
              <th className="py-4 px-5">Ref / Date</th>
              <th className="py-4 px-4">Customer & Phone</th>
              <th className="py-4 px-4">Address / Area</th>
              <th className="py-4 px-4">Delivery Person</th>
              <th className="py-4 px-4">COD (BDT)</th>
              <th className="py-4 px-4">Courier / Tracking</th>
              <th className="py-4 px-4">Status</th>
              <th className="py-4 px-5 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {filteredOrders.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-slate-500">
                  No active dispatches found.
                </td>
              </tr>
            ) : (
              filteredOrders.map((ord) => {
                const isSettled = ord.status === 'delivered_settled';
                const isReturned = ord.status === 'returned';

                return (
                  <tr key={ord.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-4 px-5">
                      <div className="font-mono font-bold text-white text-[11px]">{ord.orderNumber}</div>
                      <div className="text-[10px] text-slate-500 font-mono mt-0.5">{new Date(ord.createdAt).toLocaleDateString()}</div>
                    </td>

                    <td className="py-4 px-4">
                      <div className="font-bold text-slate-100">{ord.customerName}</div>
                      <div className="text-[10px] font-mono text-cyan-400 flex items-center gap-1 mt-0.5">
                        <Phone className="w-2.5 h-2.5" /> {ord.phone}
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      <div className="text-[11px] text-slate-400 max-w-[150px] truncate">{ord.deliveryAddress}</div>
                      <div className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-2.5 h-2.5" /> {ord.district}
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      {ord.deliveryManName ? (
                        <>
                          <div className="font-bold text-white flex items-center gap-1 text-[11px]">
                            <User className="w-2.5 h-2.5 text-slate-500" /> {ord.deliveryManName}
                          </div>
                          {ord.deliveryManPhone && (
                            <div className="text-[10px] text-slate-500 font-mono flex items-center gap-1 mt-0.5">
                              <Phone className="w-2.5 h-2.5" /> {ord.deliveryManPhone}
                            </div>
                          )}
                        </>
                      ) : (
                        <span className="text-[10px] text-slate-600">Unassigned</span>
                      )}
                    </td>

                    <td className="py-4 px-4 font-mono font-bold text-cyan-400">
                      ৳{ord.codAmountBDT.toLocaleString()}
                    </td>

                    <td className="py-4 px-4">
                      <div className="font-bold text-slate-300 text-[11px]">{ord.courierPartner}</div>
                      {ord.trackingLink ? (
                        <a href={ord.trackingLink} target="_blank" rel="noreferrer" className="text-[10px] text-cyan-400 flex items-center gap-1 hover:underline mt-0.5 font-mono">
                          {ord.courierTrackingCode} <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      ) : (
                        <span className="text-[10px] text-slate-500 font-mono block mt-0.5">{ord.courierTrackingCode}</span>
                      )}
                    </td>

                    <td className="py-4 px-4">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase inline-flex items-center gap-1 ${
                        isSettled ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30' :
                        isReturned ? 'bg-rose-950 text-rose-400 border border-rose-500/30' :
                        'bg-cyan-950 text-cyan-400 border border-cyan-500/30'
                      }`}>
                        {isSettled ? <CheckCircle2 className="w-2.5 h-2.5" /> : <Clock className="w-2.5 h-2.5" />}
                        {ord.status.replace('_', ' ')}
                      </span>
                    </td>

                    <td className="py-4 px-5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {!isSettled && (
                          <button
                            onClick={() => onUpdateOrderStatus(ord.id, 'delivered_settled')}
                            className="p-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors shadow"
                            title="Mark Settled"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          onClick={() => onDeleteOrder(ord.id)}
                          className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-lg w-full shadow-2xl space-y-6 my-8">
            <h3 className="text-lg font-bold text-white border-b border-slate-800 pb-3">New Manual Courier Dispatch</h3>
            <form onSubmit={handleAddSubmit} className="space-y-4 text-xs sm:text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Customer Name</label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="e.g. Rahim Ahmed"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Phone Number</label>
                  <input
                    type="text"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="017xxxxxxxx"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-cyan-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">Delivery Address</label>
                <input
                  type="text"
                  required
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  placeholder="Street address, City"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">COD Amount (BDT)</label>
                  <input
                    type="number"
                    required
                    value={codAmountBDT}
                    onChange={(e) => setCodAmountBDT(e.target.value ? Number(e.target.value) : '')}
                    placeholder="0"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-cyan-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Courier Company</label>
                  <select
                    value={courierPartner}
                    onChange={(e) => setCourierPartner(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value="Pathao Courier">Pathao Courier</option>
                    <option value="Steadfast">Steadfast</option>
                    <option value="RedX">RedX</option>
                    <option value="Paperfly">Paperfly</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Delivery Man Name</label>
                  <input
                    type="text"
                    value={deliveryManName}
                    onChange={(e) => setDeliveryManName(e.target.value)}
                    placeholder="Full name"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Delivery Man Phone</label>
                  <input
                    type="text"
                    value={deliveryManPhone}
                    onChange={(e) => setDeliveryManPhone(e.target.value)}
                    placeholder="Phone number"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-cyan-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Tracking Code</label>
                  <input
                    type="text"
                    value={courierTrackingCode}
                    onChange={(e) => setCourierTrackingCode(e.target.value)}
                    placeholder="e.g. TRK-123456"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-cyan-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Tracking Link</label>
                  <input
                    type="url"
                    value={trackingLink}
                    onChange={(e) => setTrackingLink(e.target.value)}
                    placeholder="https://..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-cyan-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">Cart Summary / Items</label>
                <textarea
                  value={itemsSummary}
                  onChange={(e) => setItemsSummary(e.target.value)}
                  placeholder="e.g. 2x Soyabean Oil, 1x Harpic"
                  rows={2}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-cyan-500 resize-none"
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
                  className="px-6 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold shadow-lg transition-all"
                >
                  Save Dispatch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
