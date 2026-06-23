import { createClient } from '@supabase/supabase-js';
import { Product } from './types';

const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL || '').trim();
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim();

export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Local fallback helpers for Offline Mode
const getLocalProducts = (): Product[] => {
  const saved = localStorage.getItem('papagayo_local_products');
  return saved ? JSON.parse(saved) : [];
};

const saveLocalProducts = (products: Product[]) => {
  localStorage.setItem('papagayo_local_products', JSON.stringify(products));
};

const getLocalRequests = (): any[] => {
  const saved = localStorage.getItem('papagayo_local_suggestions');
  return saved ? JSON.parse(saved) : [];
};

const saveLocalRequests = (requests: any[]) => {
  localStorage.setItem('papagayo_local_suggestions', JSON.stringify(requests));
};

// Unified DB API
export const dbService = {
  getProducts: async (): Promise<Product[]> => {
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .order('createdAt', { ascending: false });

        if (error) {
          console.warn('Supabase products fetch failed, using local fallback:', error.message);
          return getLocalProducts();
        }

        if (data) {
          // Sync with local storage so cache is fresh
          saveLocalProducts(data as Product[]);
          return data as Product[];
        }
      } catch (err) {
        console.warn('Supabase fetch error, using local fallback:', err);
      }
    }
    return getLocalProducts();
  },

  insertProduct: async (product: Omit<Product, 'id'> & { id?: string }): Promise<Product> => {
    const newProduct: Product = {
      ...product,
      id: product.id || Math.random().toString(36).substring(2, 11),
      createdAt: product.createdAt || Date.now()
    };

    // Always update local storage first
    const local = getLocalProducts();
    local.unshift(newProduct);
    saveLocalProducts(local);

    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('products')
          .insert([newProduct])
          .select();

        if (error) {
          console.warn('Supabase insert failed, saved locally:', error.message);
        } else if (data && data[0]) {
          return data[0] as Product;
        }
      } catch (err) {
        console.warn('Supabase insert error, saved locally:', err);
      }
    }

    return newProduct;
  },

  updateProduct: async (id: string, product: Partial<Product>): Promise<void> => {
    // Always update local storage
    const local = getLocalProducts();
    const updated = local.map(p => p.id === id ? { ...p, ...product } : p);
    saveLocalProducts(updated);

    if (supabase) {
      try {
        const { error } = await supabase
          .from('products')
          .update(product)
          .eq('id', id);

        if (error) {
          console.warn('Supabase update failed, saved locally:', error.message);
        }
      } catch (err) {
        console.warn('Supabase update error, saved locally:', err);
      }
    }
  },

  deleteProduct: async (id: string): Promise<void> => {
    // Always update local storage
    const local = getLocalProducts();
    const updated = local.filter(p => p.id !== id);
    saveLocalProducts(updated);

    if (supabase) {
      try {
        const { error } = await supabase
          .from('products')
          .delete()
          .eq('id', id);

        if (error) {
          console.warn('Supabase delete failed, saved locally:', error.message);
        }
      } catch (err) {
        console.warn('Supabase delete error, saved locally:', err);
      }
    }
  },

  getProductRequests: async (): Promise<any[]> => {
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('product_requests')
          .select('*')
          .order('createdAt', { ascending: false });

        if (error) {
          console.warn('Supabase suggestions fetch failed, using local fallback:', error.message);
          return getLocalRequests();
        }

        if (data) {
          saveLocalRequests(data);
          return data;
        }
      } catch (err) {
        console.warn('Supabase fetch error, using local fallback:', err);
      }
    }
    return getLocalRequests();
  },

  insertProductRequest: async (request: { name: string; email: string; requestedProduct: string; createdAt?: number }): Promise<any> => {
    const newRequest = {
      id: Math.random().toString(36).substring(2, 11),
      ...request,
      createdAt: request.createdAt || Date.now()
    };

    // Always update local storage
    const local = getLocalRequests();
    local.unshift(newRequest);
    saveLocalRequests(local);

    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('product_requests')
          .insert([newRequest])
          .select();

        if (error) {
          console.warn('Supabase request insert failed, saved locally:', error.message);
        } else if (data && data[0]) {
          return data[0];
        }
      } catch (err) {
        console.warn('Supabase request insert error, saved locally:', err);
      }
    }

    return newRequest;
  },

  deleteProductRequest: async (id: string): Promise<void> => {
    // Always update local storage
    const local = getLocalRequests();
    const updated = local.filter(r => r.id !== id);
    saveLocalRequests(updated);

    if (supabase) {
      try {
        const { error } = await supabase
          .from('product_requests')
          .delete()
          .eq('id', id);

        if (error) {
          console.warn('Supabase request delete failed, saved locally:', error.message);
        }
      } catch (err) {
        console.warn('Supabase request delete error, saved locally:', err);
      }
    }
  }
};

// Unified Auth API
export const authService = {
  onAuthStateChanged: (callback: (user: any) => void) => {
    if (supabase) {
      // Get current session first
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session && session.user) {
          callback(session.user);
        } else {
          callback(null);
        }
      });

      // Listen for changes
      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session && session.user) {
          callback(session.user);
        } else {
          callback(null);
        }
      });

      return () => subscription.unsubscribe();
    } else {
      // No-op for offline mode (or read demo mode state if we want)
      const isDemo = localStorage.getItem('papagayo_demo_mode') === 'true';
      if (isDemo) {
        callback({
          id: 'admin-id',
          email: 'colpapagayo@gmail.com',
          user_metadata: { full_name: 'Admin Papagayo' }
        });
      } else {
        callback(null);
      }
      return () => {};
    }
  },

  signInWithEmail: async (email: string, password: string) => {
    if (supabase) {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      return data;
    }
    throw new Error('Supabase is not configured.');
  },

  signUpWithEmail: async (email: string, password: string) => {
    if (supabase) {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) throw error;
      return data;
    }
    throw new Error('Supabase is not configured.');
  },

  signOut: async () => {
    if (supabase) {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    }
  }
};
