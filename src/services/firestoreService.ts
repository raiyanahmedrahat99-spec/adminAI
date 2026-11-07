import { collection, getDocs, setDoc, doc, deleteDoc, writeBatch } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { realProducts } from '../data/realStoreData';
import { Product, DiaryLedgerEntry, DealerAccount, Order } from '../types/store';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo = {
    error: error instanceof Error ? error.message : String(error),
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

/**
 * Strips undefined values from an object to prevent Firestore errors.
 */
function cleanObject<T extends object>(obj: T): T {
  const clean: any = {};
  Object.keys(obj).forEach((key) => {
    const val = (obj as any)[key];
    if (val !== undefined) {
      clean[key] = val;
    }
  });
  return clean as T;
}

// Product Catalog
export async function fetchProductsFromFirestore(): Promise<Product[]> {
  const path = 'products';
  try {
    const querySnapshot = await getDocs(collection(db, path));
    const items: Product[] = [];
    querySnapshot.forEach((docSnap) => {
      items.push(docSnap.data() as Product);
    });
    return items;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return [];
  }
}

export async function saveProductToFirestore(product: Product): Promise<void> {
  const path = 'products';
  try {
    await setDoc(doc(db, path, product.id), cleanObject(product), { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteProductFromFirestore(id: string): Promise<void> {
  const path = 'products';
  try {
    await deleteDoc(doc(db, path, id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function seedProductsToFirestore(): Promise<Product[]> {
  const path = 'products';
  try {
    for (const prod of realProducts) {
      const docRef = doc(db, path, prod.id);
      await setDoc(docRef, cleanObject(prod), { merge: true });
    }
    return realProducts;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
    return realProducts;
  }
}

export async function syncCatalogWithFirestore(): Promise<Product[]> {
  try {
    const existing = await fetchProductsFromFirestore();
    if (existing.length === 0) {
      return await seedProductsToFirestore();
    }
    return existing;
  } catch (err) {
    console.warn('Firestore sync fallback to local/seed dataset:', err);
    return realProducts;
  }
}

// Ledger / Diary
export async function fetchLedgerFromFirestore(): Promise<DiaryLedgerEntry[]> {
  const path = 'ledger';
  try {
    const querySnapshot = await getDocs(collection(db, path));
    const items: DiaryLedgerEntry[] = [];
    querySnapshot.forEach((docSnap) => {
      items.push(docSnap.data() as DiaryLedgerEntry);
    });
    return items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return [];
  }
}

export async function saveLedgerEntryToFirestore(entry: DiaryLedgerEntry): Promise<void> {
  const path = 'ledger';
  try {
    await setDoc(doc(db, path, entry.id), cleanObject(entry), { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteLedgerEntryFromFirestore(id: string): Promise<void> {
  const path = 'ledger';
  try {
    await deleteDoc(doc(db, path, id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// Dealers
export async function fetchDealersFromFirestore(): Promise<DealerAccount[]> {
  const path = 'dealers';
  try {
    const querySnapshot = await getDocs(collection(db, path));
    const items: DealerAccount[] = [];
    querySnapshot.forEach((docSnap) => {
      items.push(docSnap.data() as DealerAccount);
    });
    return items;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return [];
  }
}

export async function saveDealerToFirestore(dealer: DealerAccount): Promise<void> {
  const path = 'dealers';
  try {
    await setDoc(doc(db, path, dealer.id), cleanObject(dealer), { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteDealerFromFirestore(id: string): Promise<void> {
  const path = 'dealers';
  try {
    await deleteDoc(doc(db, path, id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function forceSeedCatalog(): Promise<Product[]> {
  const path = 'products';
  try {
    const batch = writeBatch(db);
    
    // 1. Get all current products to delete them
    const querySnapshot = await getDocs(collection(db, path));
    querySnapshot.forEach((docSnap) => {
      batch.delete(doc(db, path, docSnap.id));
    });

    // 2. Add all official audit products
    for (const prod of realProducts) {
      const docRef = doc(db, path, prod.id);
      batch.set(docRef, cleanObject(prod));
    }

    // 3. Commit the batch
    await batch.commit();
    return realProducts;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
    return realProducts;
  }
}

// Orders
export async function fetchOrdersFromFirestore(): Promise<Order[]> {
  const path = 'orders';
  try {
    const querySnapshot = await getDocs(collection(db, path));
    const items: Order[] = [];
    querySnapshot.forEach((docSnap) => {
      items.push(docSnap.data() as Order);
    });
    return items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return [];
  }
}

export async function saveOrderToFirestore(order: Order): Promise<void> {
  const path = 'orders';
  try {
    await setDoc(doc(db, path, order.id), cleanObject(order), { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteOrderFromFirestore(id: string): Promise<void> {
  const path = 'orders';
  try {
    await deleteDoc(doc(db, path, id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}
