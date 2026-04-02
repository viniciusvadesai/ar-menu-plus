import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Product, products as initialProducts } from '@/data/mockData';
import { loadFile, deleteFile as deleteFileFromDB } from '@/lib/indexedDb';

const STORAGE_KEY = 'menuar-products';

interface ProductContextType {
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  addProduct: (product: Product) => void;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
}

const ProductContext = createContext<ProductContextType | null>(null);

function loadSavedProducts(): Product[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error('Failed to load products from localStorage', e);
  }
  return initialProducts;
}

export const ProductProvider = ({ children }: { children: ReactNode }) => {
  const [products, setProducts] = useState<Product[]>(loadSavedProducts);
  const [ready, setReady] = useState(false);

  // Restore blob URLs for GLB models from IndexedDB on mount
  useEffect(() => {
    async function restoreModels() {
      const restored = await Promise.all(
        products.map(async (p) => {
          if (p.model3dUrl && p.model3dUrl.startsWith('indexeddb:')) {
            const key = p.model3dUrl.replace('indexeddb:', '');
            const blobUrl = await loadFile(key);
            return { ...p, model3dUrl: blobUrl || undefined };
          }
          return p;
        })
      );
      setProducts(restored);
      setReady(true);
    }
    restoreModels();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Persist to localStorage whenever products change (after initial load)
  useEffect(() => {
    if (!ready) return;
    // Save with indexeddb: prefix for model3dUrl so we know to restore from IDB
    const toSave = products.map(p => ({
      ...p,
      // Keep indexeddb: references; strip blob: URLs (they won't survive reload)
      model3dUrl: p.model3dUrl?.startsWith('blob:')
        ? undefined
        : p.model3dUrl,
    }));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
  }, [products, ready]);

  const addProduct = (product: Product) => {
    setProducts(prev => [product, ...prev]);
  };

  const updateProduct = (id: string, updates: Partial<Product>) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
  };

  const deleteProduct = (id: string) => {
    const product = products.find(p => p.id === id);
    if (product?.model3dUrl?.startsWith('indexeddb:')) {
      deleteFileFromDB(product.model3dUrl.replace('indexeddb:', '')).catch(console.error);
    }
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  return (
    <ProductContext.Provider value={{ products, setProducts, addProduct, updateProduct, deleteProduct }}>
      {children}
    </ProductContext.Provider>
  );
};

export const useProducts = () => {
  const ctx = useContext(ProductContext);
  if (!ctx) throw new Error('useProducts must be used within ProductProvider');
  return ctx;
};
