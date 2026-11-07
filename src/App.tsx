import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { FinancialMetrics } from './components/FinancialMetrics';
import { CatalogTable } from './components/CatalogTable';
import { CodLogisticsTable } from './components/CodLogisticsTable';
import { AddProductModal } from './components/AddProductModal';
import { LoginModal } from './components/LoginModal';
import { LedgerDiaryTab } from './components/LedgerDiaryTab';
import { DealerAccountsTab } from './components/DealerAccountsTab';
import { FloatingAiWidget } from './components/FloatingAiWidget';
import { ExecutiveReportGenerator } from './components/ExecutiveReportGenerator';
import { 
  realProducts, 
  realOrders, 
  realDealerAccounts,
  computeStoreFinancials 
} from './data/realStoreData';
import { 
  syncCatalogWithFirestore, 
  fetchLedgerFromFirestore, 
  fetchDealersFromFirestore,
  fetchOrdersFromFirestore,
  saveProductToFirestore,
  deleteProductFromFirestore,
  saveLedgerEntryToFirestore,
  deleteLedgerEntryFromFirestore,
  saveDealerToFirestore,
  deleteDealerFromFirestore,
  saveOrderToFirestore,
  deleteOrderFromFirestore,
  forceSeedCatalog
} from './services/firestoreService';
import { Product, Order, OrderStatus, DiaryLedgerEntry, DealerAccount } from './types/store';
import { 
  CheckCircle2, 
  AlertTriangle, 
  Truck,
  Loader2
} from 'lucide-react';
import { LanguageProvider } from './context/LanguageContext';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from './lib/firebase';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [dataLoading, setDataLoading] = useState(false);

  const [activeTab, setActiveTab] = useState<'overview' | 'catalog' | 'orders' | 'ledger' | 'dealers'>('overview');
  
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [ledgerEntries, setLedgerEntries] = useState<DiaryLedgerEntry[]>([]);
  const [dealers, setDealers] = useState<DealerAccount[]>([]);
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setAuthLoading(false);
      if (user) {
        loadAllData();
      }
    });
    return () => unsubscribe();
  }, []);

  const loadAllData = async () => {
    setDataLoading(true);
    try {
      const [fetchedProducts, fetchedLedger, fetchedDealers, fetchedOrders] = await Promise.all([
        syncCatalogWithFirestore(),
        fetchLedgerFromFirestore(),
        fetchDealersFromFirestore(),
        fetchOrdersFromFirestore()
      ]);
      setProducts(fetchedProducts);
      setLedgerEntries(fetchedLedger);
      setDealers(fetchedDealers);
      setOrders(fetchedOrders);
    } catch (err) {
      console.error('Failed to load initial data:', err);
    } finally {
      setDataLoading(false);
    }
  };

  const financials = computeStoreFinancials(products, orders);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  const handleSyncFirestore = async () => {
    setIsSyncing(true);
    try {
      const fetched = await syncCatalogWithFirestore();
      setProducts(fetched);
      showNotification(`Successfully synchronized ${fetched.length} SKUs from Cloud Firestore.`);
    } catch (err: any) {
      showNotification(`Firestore sync failed: ${err.message || 'Check connection'}`);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleForceResetCatalog = async () => {
    if (!window.confirm('This will DELETE all current Firestore products and reset to the official 186-SKU audit list. Continue?')) return;
    setIsSyncing(true);
    try {
      const resetData = await forceSeedCatalog();
      setProducts(resetData);
      showNotification(`Database reset to official audit list (${resetData.length} SKUs).`);
    } catch (err: any) {
      showNotification(`Reset failed: ${err.message}`);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleAddProduct = async (newProduct: Product) => {
    try {
      await saveProductToFirestore(newProduct);
      setProducts((prev) => [newProduct, ...prev]);
      showNotification(`Added "${newProduct.title}" to Towa Inventory.`);
    } catch (err) {
      showNotification('Failed to save product to database.');
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    try {
      await deleteProductFromFirestore(productId);
      setProducts((prev) => prev.filter(p => p.id !== productId));
      showNotification('Product deleted from catalog.');
    } catch (err) {
      showNotification('Failed to delete product.');
    }
  };

  const handleUpdateStock = async (productId: string, newStock: number) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const status: Product['status'] = newStock === 0 ? 'out_of_stock' : newStock <= product.reorderLevel ? 'low_stock' : 'in_stock';
    const updatedProduct: Product = { ...product, stock: newStock, status, updatedAt: new Date().toISOString() };
    
    try {
      await saveProductToFirestore(updatedProduct);
      setProducts((prev) => prev.map((p) => (p.id === productId ? updatedProduct : p)));
    } catch (err) {
      showNotification('Failed to update stock in database.');
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, newStatus: OrderStatus) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    const updatedOrder: Order = {
      ...order,
      status: newStatus,
      settledAt: newStatus === 'delivered_settled' ? new Date().toISOString() : order.settledAt,
      codAgingDays: newStatus === 'delivered_settled' ? 0 : order.codAgingDays,
    };

    try {
      await saveOrderToFirestore(updatedOrder);
      setOrders((prev) => prev.map((o) => (o.id === orderId ? updatedOrder : o)));
      showNotification(`Order reconciled in Delivery Ledger.`);
    } catch (err) {
      showNotification('Failed to update order status.');
    }
  };

  const handleAddOrder = async (newOrder: Order) => {
    try {
      await saveOrderToFirestore(newOrder);
      setOrders((prev) => [newOrder, ...prev]);
      showNotification(`Added dispatch order ${newOrder.orderNumber}.`);
    } catch (err) {
      showNotification('Failed to save dispatch order.');
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    try {
      await deleteOrderFromFirestore(orderId);
      setOrders((prev) => prev.filter(o => o.id !== orderId));
      showNotification('Dispatch order removed.');
    } catch (err) {
      showNotification('Failed to delete order.');
    }
  };

  const handleAddLedgerEntry = async (entry: DiaryLedgerEntry) => {
    try {
      await saveLedgerEntryToFirestore(entry);
      setLedgerEntries(prev => [entry, ...prev]);
      showNotification(`Added diary entry for ${entry.partyName}.`);
    } catch (err) {
      showNotification('Failed to save ledger entry.');
    }
  };

  const handleDeleteLedgerEntry = async (id: string) => {
    try {
      await deleteLedgerEntryFromFirestore(id);
      setLedgerEntries(prev => prev.filter(e => e.id !== id));
      showNotification('Diary entry removed.');
    } catch (err) {
      showNotification('Failed to delete ledger entry.');
    }
  };

  const handleAddDealer = async (dealer: DealerAccount) => {
    try {
      await saveDealerToFirestore(dealer);
      setDealers(prev => [dealer, ...prev]);
      showNotification(`Dealer "${dealer.dealerName}" added successfully.`);
    } catch (err) {
      showNotification('Failed to save dealer account.');
    }
  };

  const handleDeleteDealer = async (id: string) => {
    try {
      await deleteDealerFromFirestore(id);
      setDealers(prev => prev.filter(d => d.id !== id));
      showNotification('Dealer account removed.');
    } catch (err) {
      showNotification('Failed to delete dealer.');
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center font-sans">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
          <p className="text-xs font-mono text-slate-400">Loading Towa Store Audit DB...</p>
        </div>
      </div>
    );
  }

  return (
    <LanguageProvider>
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-white">
        {!currentUser ? (
          <LoginModal currentUser={currentUser} />
        ) : (
          <>
            {notification && (
              <div className="fixed bottom-6 right-6 z-50 bg-emerald-500 text-slate-950 px-4 py-3 rounded-xl shadow-2xl font-semibold text-sm flex items-center gap-2 border border-emerald-400 animate-in fade-in slide-in-from-bottom-2">
                <CheckCircle2 className="w-5 h-5" />
                <span>{notification}</span>
              </div>
            )}

            <Header
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              onOpenAddModal={() => setIsAddModalOpen(true)}
              totalProductsCount={products.length}
              lowStockCount={financials.lowStockItemsCount}
              currentUser={currentUser}
            />

            <main className="flex-1 p-3 sm:p-4 lg:p-8 w-full mx-auto space-y-6 sm:space-y-8 pb-32">
              {dataLoading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                  <Loader2 className="w-10 h-10 text-emerald-500 animate-spin opacity-50" />
                  <p className="text-sm text-slate-500 font-mono tracking-widest uppercase">Synchronizing Live Data...</p>
                </div>
              ) : (
                <>
                  {activeTab === 'overview' && (
                    <div className="space-y-8 animate-in fade-in duration-300">
                      <FinancialMetrics
                        financials={financials}
                        onAuditLowStock={() => setActiveTab('catalog')}
                        onAuditCod={() => setActiveTab('orders')}
                      />

                      <ExecutiveReportGenerator 
                        products={products}
                        orders={orders}
                        ledgerEntries={ledgerEntries}
                        dealers={dealers}
                      />

                      <div className="grid grid-cols-1 gap-8">
                        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
                          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                            <div className="flex items-center gap-3">
                              <AlertTriangle className="w-5 h-5 text-amber-400" />
                              <h3 className="text-base font-bold text-white">
                                Replenishment Radar ({financials.lowStockItemsCount} Low Stock Items)
                              </h3>
                            </div>
                            <button
                              onClick={() => setActiveTab('catalog')}
                              className="text-sm text-emerald-400 hover:text-emerald-300 font-semibold hover:underline"
                            >
                              View Catalog →
                            </button>
                          </div>

                          <div className="divide-y divide-slate-800/80 mt-2">
                            {products
                              .filter((p) => p.stock > 0 && p.stock <= p.reorderLevel)
                              .slice(0, 5)
                              .map((prod) => (
                                <div key={prod.id} className="py-4 flex items-center justify-between text-sm">
                                  <div>
                                    <span className="font-semibold text-slate-200 block">{prod.title}</span>
                                    <span className="text-xs text-slate-400 font-mono">SKU: {prod.sku} • {prod.supplier}</span>
                                  </div>
                                  <div className="text-right">
                                    <span className="font-mono font-bold px-3 py-1 rounded-full text-xs bg-amber-500/20 text-amber-300 border border-amber-500/20">
                                      {prod.stock} Units
                                    </span>
                                  </div>
                                </div>
                              ))}
                            {financials.lowStockItemsCount === 0 && (
                              <div className="py-10 text-center text-slate-500 italic">No low stock items detected. Inventory healthy.</div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'catalog' && (
                    <div className="animate-in fade-in duration-300">
                      <CatalogTable 
                        products={products} 
                        onUpdateStock={handleUpdateStock} 
                        onOpenAddModal={() => setIsAddModalOpen(true)} 
                        onDeleteProduct={handleDeleteProduct}
                        onSyncFirestore={handleSyncFirestore}
                        onForceReset={handleForceResetCatalog}
                        isSyncing={isSyncing}
                      />
                    </div>
                  )}

                  {activeTab === 'orders' && (
                    <div className="animate-in fade-in duration-300">
                      <CodLogisticsTable orders={orders} onUpdateOrderStatus={handleUpdateOrderStatus} onAuditCourierLogistics={() => {}} onAddOrder={handleAddOrder} onDeleteOrder={handleDeleteOrder} />
                    </div>
                  )}

                  {activeTab === 'ledger' && (
                    <div className="animate-in fade-in duration-300">
                      <LedgerDiaryTab entries={ledgerEntries} onAddEntry={handleAddLedgerEntry} onDeleteEntry={handleDeleteLedgerEntry} />
                    </div>
                  )}

                  {activeTab === 'dealers' && (
                    <div className="animate-in fade-in duration-300">
                      <DealerAccountsTab dealers={dealers} onAddDealer={handleAddDealer} onDeleteDealer={handleDeleteDealer} />
                    </div>
                  )}
                </>
              )}
            </main>

            <FloatingAiWidget products={products} orders={orders} financials={financials} />

            <AddProductModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} onAddProduct={handleAddProduct} />
          </>
        )}
      </div>
    </LanguageProvider>
  );
}

