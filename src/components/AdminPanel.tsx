import { useState, useRef, ChangeEvent, FormEvent, useEffect } from 'react';
import { db } from '../firebase';
import { collection, query, orderBy, getDocs, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { COLOMBIA_DEPARTMENTS } from '../departments';
import { ColombiaMap } from './ColombiaMap';
import { Product, Category, CountryPricingConfig } from '../types';
import { 
  Camera, 
  Loader2, 
  Upload, 
  Tag, 
  Package, 
  Inbox, 
  Trash2, 
  Check, 
  Plus, 
  MapPin, 
  Map, 
  AlertCircle,
  FolderHeart,
  Mail,
  User,
  Pencil,
  Percent,
  Truck,
  Undo,
  Menu,
  X,
  ChevronDown
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const DEFAULT_CATEGORIES: Category[] = [
  { id: 'cat-coffee', name: 'Café de Spécialité', slug: 'cafe', description: 'Cafés d’altitude fraichement torréfiés' },
  { id: 'cat-textile', name: 'Artisanat Wayuu & Zenú', slug: 'artisanat', description: 'Sacs Wayuu tissés main, chapeaux, pièces nobles' },
  { id: 'cat-cacao', name: 'Cacao & Chocolat de Finca', slug: 'cacao', description: 'Cacaos natifs, chocolaterie artisanale fine' },
  { id: 'cat-filigree', name: 'Orfèvrerie & Bijoux', slug: 'bijoux', description: 'Bijoux traditionnels en filigrane d’or et d’argent' }
];

const DEFAULT_COUNTRY_PRICING: CountryPricingConfig[] = [
  { code: 'FR', name: 'France 🇫🇷', multiplier: 1.0, surcharge: 0.0 },
  { code: 'ES', name: 'Espagne 🇪🇸', multiplier: 1.1, surcharge: 3.5 },
  { code: 'DE', name: 'Allemagne 🇩🇪', multiplier: 1.15, surcharge: 4.5 },
  { code: 'IT', name: 'Italie 🇮🇹', multiplier: 1.2, surcharge: 5.0 },
];

export function AdminPanel({ 
  onProductAdded,
  user,
  onClose
}: { 
  onProductAdded: () => void;
  user?: any;
  onClose?: () => void;
}) {
  // Tabs State
  const [activeTab, setActiveTab] = useState<'products' | 'categories' | 'pricing' | 'suggestions'>('products');
  const [menuOpen, setMenuOpen] = useState(false);

  // Product Form State
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [departmentId, setDepartmentId] = useState('CO-QUI'); // Quindío default
  const [selectedCategory, setSelectedCategory] = useState('cat-coffee');
  const [base64Image, setBase64Image] = useState<string | null>(null);
  const [extraImages, setExtraImages] = useState<string[]>([]);
  const [basePrice, setBasePrice] = useState('15.00'); // Clean simplified base price (€)
  const [loading, setLoading] = useState(false);
  
  // Track existing product update mode
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Custom Categories list
  const [categories, setCategories] = useState<Category[]>([]);
  const [catName, setCatName] = useState('');
  const [catDesc, setCatDesc] = useState('');
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  // Global Country pricing configurations state
  const [countryPricing, setCountryPricing] = useState<CountryPricingConfig[]>([]);

  // Suggestions (Sourcing Requests)
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);

  // Existing Products list in Admin
  const [adminProducts, setAdminProducts] = useState<Product[]>([]);
  const [productsLoading, setProductsLoading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize and load
  useEffect(() => {
    // 1. Categories load
    const savedCats = localStorage.getItem('papagayo_categories');
    if (savedCats) {
      try {
        setCategories(JSON.parse(savedCats));
      } catch {
        setCategories(DEFAULT_CATEGORIES);
      }
    } else {
      setCategories(DEFAULT_CATEGORIES);
      localStorage.setItem('papagayo_categories', JSON.stringify(DEFAULT_CATEGORIES));
    }

    // 2. Global Country pricing load
    const savedPricing = localStorage.getItem('papagayo_countries_pricing');
    if (savedPricing) {
      try {
        setCountryPricing(JSON.parse(savedPricing));
      } catch {
        setCountryPricing(DEFAULT_COUNTRY_PRICING);
      }
    } else {
      setCountryPricing(DEFAULT_COUNTRY_PRICING);
      localStorage.setItem('papagayo_countries_pricing', JSON.stringify(DEFAULT_COUNTRY_PRICING));
    }

    // Fetch existing data
    fetchAdminProducts();
    fetchSuggestions();
  }, []);

  const fetchAdminProducts = async () => {
    try {
      setProductsLoading(true);
      
      // Load local custom items
      let localProds: Product[] = [];
      const savedLocalProds = localStorage.getItem('papagayo_local_products');
      if (savedLocalProds) {
        try {
          localProds = JSON.parse(savedLocalProds);
        } catch {}
      }

      const q = query(collection(db, 'products'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const dbProds: Product[] = [];
      querySnapshot.forEach((doc) => {
        dbProds.push({ id: doc.id, ...doc.data() } as Product);
      });
        
      const combined = [...dbProds];
      localProds.forEach((lp) => {
        if (!combined.some(dp => dp.id === lp.id)) {
          combined.unshift(lp);
        }
      });
      setAdminProducts(combined);
    } catch (e) {
      console.error(e);
      // Fallback on error
      const savedLocalProds = localStorage.getItem('papagayo_local_products');
      if (savedLocalProds) {
        try {
          setAdminProducts(JSON.parse(savedLocalProds));
        } catch {}
      }
    } finally {
      setProductsLoading(false);
    }
  };

  const fetchSuggestions = async () => {
    try {
      setSuggestionsLoading(true);
      
      // Load local custom cached suggestions
      let localSugs: any[] = [];
      const savedLocalSugs = localStorage.getItem('papagayo_local_suggestions');
      if (savedLocalSugs) {
        try {
          localSugs = JSON.parse(savedLocalSugs);
        } catch {}
      }

      const q = query(collection(db, 'product_requests'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const dbSugs: any[] = [];
      querySnapshot.forEach((doc) => {
        dbSugs.push({ id: doc.id, ...doc.data() });
      });

      const combined = [...dbSugs];
      localSugs.forEach((ls) => {
        const alreadyInDb = dbSugs.some(ds => 
          (ds.email === ls.email && ds.requestedProduct === ls.requestedProduct) ||
          ds.id === ls.id
        );
        if (!alreadyInDb) {
          combined.unshift(ls);
        }
      });
      setSuggestions(combined);
    } catch (e) {
      console.error("Firestore load suggestions error:", e);
      let localSugs: any[] = [];
      const savedLocalSugs = localStorage.getItem('papagayo_local_suggestions');
      if (savedLocalSugs) {
        try {
          localSugs = JSON.parse(savedLocalSugs);
        } catch {}
      }
      setSuggestions(localSugs);
    } finally {
      setSuggestionsLoading(false);
    }
  };

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 800;
        const MAX_HEIGHT = 800;
        
        let width = img.width;
        let height = img.height;
        
        if (width > height) {
          if (width > MAX_WIDTH) {
            height = Math.round((height * MAX_WIDTH) / width);
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width = Math.round((width * MAX_HEIGHT) / height);
            height = MAX_HEIGHT;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        
        // JPEG format with 0.8 quality
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
        
        if (dataUrl.length > 850000) {
          alert("L'image est trop grande. Veuillez choisir une image de moins de 800kb.");
          return;
        }
        
        if (!base64Image) {
          setBase64Image(dataUrl);
        } else if (extraImages.length < 4) {
          setExtraImages(prev => [...prev, dataUrl]);
        } else {
          alert("¡Máximo 5 imágenes permitidas en total!");
        }
      };
      
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // Helper to compute prices per country using the global setup modifiers
  const computeCountryPrices = (rawBase: number, configs: CountryPricingConfig[]) => {
    const pricesObj: Record<string, number> = {};
    configs.forEach(conf => {
      const finalPrice = parseFloat(((rawBase * conf.multiplier) + conf.surcharge).toFixed(2));
      pricesObj[conf.code] = finalPrice;
    });
    return pricesObj;
  };

  // Create or Edit Product Submit Handler
  const handleSaveProduct = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const userId = user?.id || 'demo-admin-id';

      if (!name || !description) {
        alert("¡Por favor complete todos los campos requeridos!");
        setLoading(false);
        return;
      }

      const numericBasePrice = parseFloat(basePrice) || 0;
      // Generate calculated pricing for each of the 4 countries based on country configs!
      const generatedPrices = computeCountryPrices(numericBasePrice, countryPricing);

      const now = Date.now();
      const productCategoryName = categories.find(c => c.id === selectedCategory)?.name || 'Général';
      
      let finalBase64Image = base64Image;
      if (!finalBase64Image) {
        if (selectedCategory === 'cat-coffee') {
          finalBase64Image = 'https://images.unsplash.com/photo-1559525839-b184a4d698c7?q=80&w=800&auto=format&fit=crop';
        } else if (selectedCategory === 'cat-textile') {
          finalBase64Image = 'https://images.unsplash.com/photo-1605814578550-abddcb96911c?q=80&w=800&auto=format&fit=crop';
        } else if (selectedCategory === 'cat-cacao') {
          finalBase64Image = 'https://images.unsplash.com/photo-1614088924823-380ff9fbc7bd?q=80&w=800&auto=format&fit=crop';
        } else if (selectedCategory === 'cat-filigree') {
          finalBase64Image = 'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=800&auto=format&fit=crop';
        } else {
          finalBase64Image = 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?q=80&w=800&auto=format&fit=crop';
        }
      }

      const targetId = editingProduct ? editingProduct.id : 'prod-' + Math.random().toString(36).substring(2, 11) + '-' + now;

      const productPayload: Product = {
        id: targetId,
        name,
        description,
        departmentCode: departmentId,
        base64Image: finalBase64Image,
        prices: generatedPrices,
        ownerId: userId,
        createdAt: editingProduct ? editingProduct.createdAt : now,
        category: productCategoryName,
        additionalImages: extraImages,
        basePrice: numericBasePrice
      };

      // 1. Save or update locally
      let localProducts: Product[] = [];
      const savedLocalProducts = localStorage.getItem('papagayo_local_products');
      if (savedLocalProducts) {
        try {
          localProducts = JSON.parse(savedLocalProducts);
        } catch {}
      }

      if (editingProduct) {
        localProducts = localProducts.map(p => p.id === targetId ? productPayload : p);
      } else {
        localProducts.unshift(productPayload);
      }
      localStorage.setItem('papagayo_local_products', JSON.stringify(localProducts));

      // 2. Database update or insert
      try {
        const productData = { ...productPayload };
        delete (productData as any).id; // ID is the document ID in Firestore

        if (editingProduct) {
          await updateDoc(doc(db, 'products', targetId), {
            ...productData,
            updatedAt: serverTimestamp()
          });
        } else {
          await addDoc(collection(db, 'products'), {
            ...productData,
            createdAt: serverTimestamp()
          });
        }
      } catch (dbErr) {
        console.warn("Db action failed, using offline fallback storage:", dbErr);
      }

      // Reset form fields
      setName('');
      setDescription('');
      setBase64Image(null);
      setExtraImages([]);
      setDepartmentId('CO-QUI');
      setBasePrice('15.00');
      setEditingProduct(null);

      // Callbacks
      onProductAdded();
      fetchAdminProducts();
      alert(editingProduct ? "¡Trésor mis à jour avec succès !" : "¡Producto creado con éxito!");
    } catch (err: any) {
      console.error(err);
      alert("Erreur: " + (err?.message || ""));
    } finally {
      setLoading(false);
    }
  };

  // Turn on edit mode for product
  const startEditProduct = (prod: Product) => {
    setEditingProduct(prod);
    setName(prod.name);
    setDescription(prod.description);
    setDepartmentId(prod.departmentCode || 'CO-QUI');
    setBase64Image(prod.base64Image);
    setExtraImages(prod.additionalImages || []);
    
    // Set base price from product if present, or fallback from FR price
    const initialPriceValue = prod.basePrice !== undefined ? String(prod.basePrice) : String(prod.prices?.FR || '15.00');
    setBasePrice(initialPriceValue);

    // Find custom category id matching product category name
    const matchedCategory = categories.find(c => c.name.toLowerCase() === (prod.category || '').toLowerCase());
    if (matchedCategory) {
      setSelectedCategory(matchedCategory.id);
    }
  };

  const cancelEditProduct = () => {
    setEditingProduct(null);
    setName('');
    setDescription('');
    setBase64Image(null);
    setExtraImages([]);
    setDepartmentId('CO-QUI');
    setBasePrice('15.00');
  };

  // Create or Update Category Submit Handler
  const handleSaveCategory = (e: FormEvent) => {
    e.preventDefault();
    if (!catName) {
      alert("Veuillez spécifier le nom de la catégorie.");
      return;
    }

    const newSlug = catName.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, '-');
    
    if (editingCategory) {
      const updatedCategories = categories.map(cat => {
        if (cat.id === editingCategory.id) {
          return { ...cat, name: catName, description: catDesc, slug: newSlug };
        }
        return cat;
      });
      setCategories(updatedCategories);
      localStorage.setItem('papagayo_categories', JSON.stringify(updatedCategories));
      alert(`Catégorie "${catName}" mise à jour avec succès !`);
      setEditingCategory(null);
    } else {
      const newCategory: Category = {
        id: `cat-${Date.now()}`,
        name: catName,
        slug: newSlug,
        description: catDesc || 'Catégorie de sourcing premium',
        createdAt: Date.now()
      };
      const updatedCategories = [...categories, newCategory];
      setCategories(updatedCategories);
      localStorage.setItem('papagayo_categories', JSON.stringify(updatedCategories));
      alert(`Catégorie "${catName}" créée avec succès !`);
    }
    
    setCatName('');
    setCatDesc('');
  };

  const startEditCategory = (cat: Category) => {
    setEditingCategory(cat);
    setCatName(cat.name);
    setCatDesc(cat.description || '');
  };

  const cancelEditCategory = () => {
    setEditingCategory(null);
    setCatName('');
    setCatDesc('');
  };

  // Delete Category
  const handleDeleteCategory = (catId: string) => {
    if (!confirm("Voulez-vous vraiment supprimer cette catégorie ?")) return;
    const updated = categories.filter(c => c.id !== catId);
    setCategories(updated);
    localStorage.setItem('papagayo_categories', JSON.stringify(updated));
  };

  // Update Global country configurations and propagate to existing products dynamically
  const handleUpdateCountryPricing = (idx: number, field: 'multiplier' | 'surcharge', value: string) => {
    const valFloat = parseFloat(value) || 0;
    const nextConfigs = countryPricing.map((config, i) => {
      if (i === idx) {
        return { ...config, [field]: valFloat };
      }
      return config;
    });
    setCountryPricing(nextConfigs);
  };

  const saveCountryPricingConfigs = async () => {
    try {
      setLoading(true);
      localStorage.setItem('papagayo_countries_pricing', JSON.stringify(countryPricing));

      // Propagate the pricing settings instantly to update all saved products!
      let localProducts: Product[] = [];
      const savedLocalProducts = localStorage.getItem('papagayo_local_products');
      if (savedLocalProducts) {
        try {
          localProducts = JSON.parse(savedLocalProducts);
        } catch {}
      }

      if (localProducts.length > 0) {
        const revisedProducts = localProducts.map(p => {
          // If product defines a basePrice, multiply it correctly, otherwise use fallback of previous FR price
          const sourceBase = p.basePrice !== undefined ? p.basePrice : (p.prices?.FR || 15.0);
          return {
            ...p,
            basePrice: sourceBase,
            prices: computeCountryPrices(sourceBase, countryPricing)
          };
        });
        localStorage.setItem('papagayo_local_products', JSON.stringify(revisedProducts));
        
        // Push updates to Firestore
        for (const item of revisedProducts) {
          try {
            await updateDoc(doc(db, 'products', item.id), {
              prices: item.prices,
              basePrice: item.basePrice,
              updatedAt: serverTimestamp()
            });
          } catch {}
        }
      }

      onProductAdded();
      fetchAdminProducts();
      alert("¡Tarifas de cobro por país actualizadas con éxito!");
    } catch (e: any) {
      console.error(e);
      alert("Erreur lors de la sauvegarde: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  // Delete Product
  const handleDeleteProduct = async (prodId: string) => {
    if (!confirm("Voulez-vous vraiment supprimer ce produit de l'inventaire ?")) return;
    
    try {
      await deleteDoc(doc(db, 'products', prodId));
    } catch (e) {
      console.warn("Firestore delete failed, operating locally:", e);
    } finally {
      let localProducts: Product[] = [];
      const savedLocalProducts = localStorage.getItem('papagayo_local_products');
      if (savedLocalProducts) {
        try {
          localProducts = JSON.parse(savedLocalProducts);
          const filtered = localProducts.filter(p => p.id !== prodId);
          localStorage.setItem('papagayo_local_products', JSON.stringify(filtered));
        } catch {}
      }
      
      fetchAdminProducts();
      onProductAdded();
      alert("Produit supprimé !");
    }
  };

  // Archive request
  const handleMarkRequestDone = async (reqId: string) => {
    try {
      // 1. Try to delete from Firestore
      try {
        await deleteDoc(doc(db, 'product_requests', reqId));
      } catch (dbErr) {
        console.warn("Firestore database delete issue:", dbErr);
      }

      // 2. Filter and update localStorage
      let localSugs: any[] = [];
      const savedLocalSugs = localStorage.getItem('papagayo_local_suggestions');
      if (savedLocalSugs) {
        try {
          localSugs = JSON.parse(savedLocalSugs);
          const filtered = localSugs.filter(s => s.id !== reqId);
          localStorage.setItem('papagayo_local_suggestions', JSON.stringify(filtered));
        } catch {}
      }

      // 3. Refresh display list
      fetchSuggestions();
      alert("Demande archivée avec succès.");
    } catch (e) {
      console.warn("Archive error:", e);
      setSuggestions(suggestions.filter(s => s.id !== reqId));
    }
  };

  return (
    <div id="admin-dashboard-section" className="bg-white/90 backdrop-blur-3xl p-4 sm:p-6 md:p-8 rounded-2xl sm:rounded-[2.5rem] shadow-[0_15px_45px_rgba(0,0,0,0.06)] border border-white/90 w-full overflow-hidden">
      
      {/* Dynamic Header with custom colombian bird flair */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-gray-100 mb-6 sm:mb-8 gap-4 w-full">
        <div className="w-full flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-2xl sm:text-3xl font-display font-bold text-[#302B27] tracking-tight flex flex-wrap items-center gap-2">
                <span>Espace Administrateur</span>
                <span className="text-[10px] bg-[#23493C] text-[#DFDAC8] px-2.5 py-1 rounded-full font-sans tracking-widest uppercase font-bold">PAPAGAYO DIRECT</span>
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-[#76736A] mt-1">Gérez le catalogue, connectez les pays de livraison et administrez les catégories colombiennes.</p>
          </div>
          
          {onClose && (
            <button 
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-[#8B5E34]/10 hover:bg-[#8B5E34]/20 text-[#8B5E34] border border-[#8B5E34]/20 font-semibold text-xs rounded-xl transition-all cursor-pointer inline-flex items-center space-x-1 hover:scale-[1.02] active:scale-[0.98] self-start md:self-auto"
            >
              <span>✕</span>
              <span>Cerrar Panel de Control</span>
            </button>
          )}
        </div>
        
        {/* Modern Interactive Hamburger Space Menu Controller */}
        <div className="relative w-full z-30 font-sans">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#23493C]/5 border border-[#23493C]/10 p-3 sm:p-4 rounded-2xl">
            <button
              type="button"
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex items-center justify-between gap-3 px-5 py-3 bg-[#23493C] hover:bg-[#1C3A30] text-[#FAF8F5] rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300 shadow-md cursor-pointer hover:scale-[1.01] active:scale-[0.99] self-start"
            >
              <span className="flex items-center gap-2">
                {menuOpen ? <X className="w-4 h-4 text-amber-300 animate-spin-once shrink-0" /> : <Menu className="w-4 h-4 text-amber-300 shrink-0" />}
                <span>Naviguer dans les Espaces</span>
              </span>
              <ChevronDown className={`w-4 h-4 text-amber-300 transition-transform duration-300 shrink-0 ${menuOpen ? 'rotate-180' : ''}`} />
            </button>
            
            {/* Real-time Indicator Chip of the Active Admin Space */}
            <div className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-150 rounded-xl shadow-2xs self-stretch sm:self-auto justify-center">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse shrink-0" />
              <div className="text-left font-sans leading-none">
                <span className="block text-[8px] uppercase tracking-wider text-gray-400 font-bold">Espace Actif</span>
                <span className="block text-[11px] font-black text-[#23493C] uppercase tracking-wide mt-0.5">
                  {activeTab === 'products' ? '📦 Produits & Inventaire' : 
                   activeTab === 'categories' ? '🏷️ Gestion des Catégories' : 
                   activeTab === 'pricing' ? '💶 Grille Tarifaire par Pays' : 
                   `📥 Demandes Client (${suggestions.length})`}
                </span>
              </div>
            </div>
          </div>

          {/* Expanded Hamburger Overlays Menu with Premium Description cards */}
          {menuOpen && (
            <div className="absolute top-[108%] left-0 right-0 z-40 bg-[#FAF9F5] border-2 border-[#23493C]/25 rounded-3xl p-4 shadow-[0_25px_60px_rgba(0,0,0,0.18)] grid grid-cols-1 md:grid-cols-2 gap-3 animate-none">
              <button
                type="button"
                onClick={() => { setActiveTab('products'); setMenuOpen(false); }}
                className={cn(
                  "p-4 rounded-2xl text-left border transition-all cursor-pointer flex items-start gap-3.5 group",
                  activeTab === 'products' 
                    ? "bg-[#23493C] text-white border-transparent shadow-lg shadow-[#23493C]/10" 
                    : "bg-white hover:bg-[#FAF9F5] text-[#302B27] border-gray-150 hover:border-[#23493C]/30"
                )}
              >
                <div className={cn("p-2.5 rounded-xl shrink-0 transition-transform group-hover:scale-105", activeTab === 'products' ? "bg-white/10" : "bg-[#23493C]/5 text-[#23493C]")}>
                  <Package className="w-5 h-5 text-amber-500" />
                </div>
                <div className="min-w-0">
                  <span className="block text-xs uppercase font-extrabold tracking-wider">📦 Produits de Sourcing</span>
                  <span className="block text-[10px] opacity-80 mt-0.5 leading-relaxed">Ajouter, modifier ou retirer les fiches produits et configurer la carte de traçabilité colombienne.</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => { setActiveTab('categories'); setMenuOpen(false); }}
                className={cn(
                  "p-4 rounded-2xl text-left border transition-all cursor-pointer flex items-start gap-3.5 group",
                  activeTab === 'categories' 
                    ? "bg-[#23493C] text-white border-transparent shadow-lg shadow-[#23493C]/10" 
                    : "bg-white hover:bg-[#FAF9F5] text-[#302B27] border-gray-150 hover:border-[#23493C]/30"
                )}
              >
                <div className={cn("p-2.5 rounded-xl shrink-0 transition-transform group-hover:scale-105", activeTab === 'categories' ? "bg-white/10" : "bg-[#23493C]/5 text-[#23493C]")}>
                  <Tag className="w-5 h-5 text-amber-500" />
                </div>
                <div className="min-w-0">
                  <span className="block text-xs uppercase font-extrabold tracking-wider">🏷️ Catégories d'Origine</span>
                  <span className="block text-[10px] opacity-80 mt-0.5 leading-relaxed">Administrer les types d'artisanat ou de spécialités (Cafés, Cacaos, Textiles Wayuu, Orfèvrerie).</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => { setActiveTab('pricing'); setMenuOpen(false); }}
                className={cn(
                  "p-4 rounded-2xl text-left border transition-all cursor-pointer flex items-start gap-3.5 group",
                  activeTab === 'pricing' 
                    ? "bg-[#23493C] text-white border-transparent shadow-lg shadow-[#23493C]/10" 
                    : "bg-white hover:bg-[#FAF9F5] text-[#302B27] border-gray-150 hover:border-[#23493C]/30"
                )}
              >
                <div className={cn("p-2.5 rounded-xl shrink-0 transition-transform group-hover:scale-105", activeTab === 'pricing' ? "bg-white/10" : "bg-[#23493C]/5 text-[#23493C]")}>
                  <Percent className="w-5 h-5 text-amber-500" />
                </div>
                <div className="min-w-0">
                  <span className="block text-xs uppercase font-extrabold tracking-wider">💶 Grille Tarifaire & Multiplicateurs</span>
                  <span className="block text-[10px] opacity-80 mt-0.5 leading-relaxed">Gérer les coefficients de transport, taxes douanières et majorations par pays d'Europe.</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => { setActiveTab('suggestions'); setMenuOpen(false); }}
                className={cn(
                  "p-4 rounded-2xl text-left border transition-all cursor-pointer flex items-start gap-3.5 group relative",
                  activeTab === 'suggestions' 
                    ? "bg-[#23493C] text-white border-transparent shadow-lg shadow-[#23493C]/10" 
                    : "bg-white hover:bg-[#FAF9F5] text-[#302B27] border-gray-150 hover:border-[#23493C]/30"
                )}
              >
                <div className={cn("p-2.5 rounded-xl shrink-0 transition-transform group-hover:scale-105", activeTab === 'suggestions' ? "bg-white/10" : "bg-[#23493C]/5 text-[#23493C]")}>
                  <Inbox className="w-5 h-5 text-amber-500" />
                </div>
                <div className="min-w-0">
                  <span className="block text-xs uppercase font-extrabold tracking-wider">📥 Demandes d'Importation Client</span>
                  <span className="block text-[10px] opacity-80 mt-0.5 leading-relaxed">Suivre les fiches de contact, demandes d'importation sur mesure pré-remplies par les clients.</span>
                </div>
                {suggestions.length > 0 && (
                  <span className="absolute top-3.5 right-3.5 bg-amber-500 text-black font-extrabold text-[9px] px-2 py-0.5 rounded-full ring-2 ring-white">
                    {suggestions.length}
                  </span>
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* TAB 1: PRODUCT MANAGEMENT */}
      {activeTab === 'products' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
          
          {/* Main creation form Column */}
          <form onSubmit={handleSaveProduct} className="lg:col-span-7 space-y-4 sm:space-y-6">
            <h3 className="text-base sm:text-lg font-bold text-[#302B27] pb-2 border-b border-gray-100 flex items-center justify-between">
              <span className="flex items-center space-x-2">
                {editingProduct ? <Pencil className="w-4 h-4 text-[#8B5E34]" /> : <Plus className="w-4 h-4 text-[#23493C]" />}
                <span>{editingProduct ? `Modifier "${editingProduct.name}"` : 'Créer un Nouveau Produit Colombien'}</span>
              </span>
              {editingProduct && (
                <button 
                  type="button" 
                  onClick={cancelEditProduct}
                  className="text-xs font-semibold text-gray-500 hover:text-red-600 flex items-center gap-1 bg-gray-100 px-2.5 py-1 rounded-lg"
                >
                  <Undo className="w-3 h-3" />
                  Annuler la modification
                </button>
              )}
            </h3>

            {/* Custom Category Selection */}
            <div>
              <label className="block text-[10px] sm:text-xs font-bold text-[#302B27] uppercase tracking-wider mb-2">Choisir la Catégorie commerciale</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategory(cat.id)}
                    className={cn(
                      "p-2.5 sm:p-3 rounded-xl border text-center transition-all flex flex-col items-center justify-center cursor-pointer min-h-[70px]",
                      selectedCategory === cat.id 
                        ? "border-[#23493C] bg-[#23493C]/5 text-[#23493C] font-semibold"
                        : "border-gray-150 hover:border-gray-300 bg-white/40 text-[#76736A]"
                    )}
                  >
                    <FolderHeart className="w-4 h-4 mb-1 opacity-80 animate-pulse" />
                    <span className="text-[10px] sm:text-[11px] leading-tight break-words w-full line-clamp-2">{cat.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Image Gallery uploads */}
            <div className="space-y-2">
              <label className="block text-[10px] sm:text-xs font-bold text-[#302B27] uppercase tracking-wider mb-1">
                Galerie Photos (Jusqu'à 5 images | Up to 5 images)
              </label>
              
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {/* Main image slot */}
                {base64Image ? (
                  <div className="aspect-square relative rounded-xl overflow-hidden border-2 border-[#23493C]/40 group shadow-sm bg-gray-50 flex items-center justify-center">
                    <img src={base64Image} alt="Main" className="w-full h-full object-cover" />
                    <div className="absolute top-1.5 right-1.5 bg-black/60 text-white text-[9px] px-1.5 py-0.5 rounded font-bold">Principal</div>
                    <button 
                      type="button" 
                      onClick={() => {
                        if (extraImages.length > 0) {
                          setBase64Image(extraImages[0]);
                          setExtraImages(prev => prev.slice(1));
                        } else {
                          setBase64Image(null);
                        }
                      }}
                      className="absolute inset-0 bg-red-600/85 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer font-bold text-xs"
                    >
                      Supprimer
                    </button>
                  </div>
                ) : (
                  <button 
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="aspect-square rounded-xl border-2 border-dashed border-gray-200 hover:border-[#23493C]/55 hover:bg-[#23493C]/5 flex flex-col items-center justify-center text-center cursor-pointer p-2 transition-all bg-white w-full h-full"
                  >
                    <Plus className="w-5 h-5 text-gray-400 mb-1" />
                    <span className="text-[9px] font-bold text-[#23493C] uppercase">Ajouter</span>
                    <span className="text-[8px] text-gray-400 mt-0.5 font-sans">1/5 Cover</span>
                  </button>
                )}

                {/* Additional image slots */}
                {extraImages.map((img, idx) => (
                  <div key={idx} className="aspect-square relative rounded-xl overflow-hidden border border-gray-200 group shadow-2xs bg-gray-50">
                    <img src={img} alt={`Extra ${idx}`} className="w-full h-full object-cover" />
                    <div className="absolute top-1.5 right-1.5 bg-[#8B5E34]/80 text-white text-[9px] px-1.5 py-0.5 rounded font-bold">#{idx + 2}</div>
                    <button 
                      type="button"
                      onClick={() => setExtraImages(prev => prev.filter((_, i) => i !== idx))}
                      className="absolute inset-0 bg-red-600/85 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer font-bold text-xs"
                    >
                      Supprimer
                    </button>
                  </div>
                ))}

                {/* Upload placeholders to complete up to 5 slots visually */}
                {base64Image && extraImages.length < 4 && (
                  <button 
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="aspect-square rounded-xl border-2 border-dashed border-gray-200 hover:border-[#23493C]/55 hover:bg-[#23493C]/5 flex flex-col items-center justify-center text-center cursor-pointer p-2 transition-all bg-white"
                  >
                    <Plus className="w-5 h-5 text-gray-400 mb-1" />
                    <span className="text-[9px] font-bold text-[#23493C] uppercase">Ajouter</span>
                    <span className="text-[8px] text-gray-400 mt-0.5 font-sans">{extraImages.length + 2}/5</span>
                  </button>
                )}

                {/* Blank placeholders if no primary is selected */}
                {!base64Image && Array.from({ length: 4 }).map((_, idx) => (
                  <div key={idx} className="aspect-square rounded-xl border border-dashed border-gray-150 bg-[#FAF9F5]/40 flex items-center justify-center text-gray-300 text-[10px] uppercase font-bold tracking-wider">
                    Vide
                  </div>
                ))}
              </div>
              
              <p className="text-[9px] sm:text-[10px] text-gray-400 mt-1">
                La première photo sera la couverture principale, les suivantes forment la présentation style Apple.
              </p>

              <input 
                ref={fileInputRef}
                type="file" 
                accept="image/*" 
                className="hidden" 
                onChange={handleImageUpload}
                disabled={loading}
              />
            </div>

            {/* Two Column Layout Name & Department dropdown */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="block text-[10px] sm:text-xs font-bold text-[#302B27] uppercase tracking-wider mb-1.5">Nom commercial du Trésor</label>
                <input 
                  type="text" 
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2.5 sm:py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#23493C]/20 focus:border-[#23493C] transition-all bg-white text-base md:text-sm text-[#302B27]"
                  placeholder="Ex: Café Castillo Specialty Honey"
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-[10px] sm:text-xs font-bold text-[#302B27] uppercase tracking-wider mb-1.5">Département (Sourcing local)</label>
                <select 
                  value={departmentId}
                  onChange={(e) => setDepartmentId(e.target.value)}
                  className="w-full px-3 py-2.5 sm:py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#23493C]/20 focus:border-[#23493C] transition-all bg-white cursor-pointer text-base md:text-sm text-[#302B27]"
                  disabled={loading}
                >
                  {COLOMBIA_DEPARTMENTS.map((dept) => (
                    <option key={dept.id} value={dept.id}>{dept.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Simplified Single Price configuration */}
            <div className="bg-[#23493C]/5 border border-[#23493C]/10 rounded-2xl p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <label className="block text-[10px] sm:text-xs font-bold text-[#302B27] uppercase tracking-wider">
                    Prix de Base (€)
                  </label>
                  <p className="text-[10px] sm:text-[11px] text-gray-500 leading-snug">
                    Spécifiez le prix de base d'origine. Les prix de chaque pays seront générés à l'enregistrement en appliquant les tarifs et multiplicateurs du menu de cobro.
                  </p>
                </div>
                <div className="relative rounded-xl shadow-xs w-36 shrink-0">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <span className="text-gray-500 text-xs font-semibold">€</span>
                  </div>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={basePrice}
                    onChange={(e) => setBasePrice(e.target.value)}
                    className="block w-full rounded-xl border border-gray-200 pl-7 pr-3 py-2.5 focus:border-[#23493C] focus:ring-[#23493C]/20 text-base md:text-sm font-semibold text-[#23493C] bg-white"
                    placeholder="15.00"
                    disabled={loading}
                  />
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-[10px] sm:text-xs font-bold text-[#302B27] uppercase tracking-wider mb-2">Histoire, notes aromatiques et détails de production</label>
              <textarea 
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#23493C]/20 focus:border-[#23493C] transition-all bg-white resize-none text-base md:text-sm text-[#302B27]"
                placeholder="Exprimez la texture de l'artisanat ou la note de tasse supérieure du lot..."
                disabled={loading}
              />
            </div>
            
            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-[#23493C] text-white font-semibold text-xs sm:text-sm hover:bg-[#1C3A30] active:scale-[0.98] transition-all disabled:opacity-70 flex items-center justify-center space-x-2 cursor-pointer shadow-md shadow-[#23493C]/10"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Upload className="w-4 h-4 text-[#DFDAC8]" />
                  <span>{editingProduct ? 'Mettre à jour le produit' : 'Publier et référencer le produit'}</span>
                </>
              )}
            </button>
          </form>

          {/* Sourcing region overview column */}
          <div className="lg:col-span-5 space-y-4 sm:space-y-6">
            <div className="bg-gray-50/50 p-3 sm:p-4 border border-gray-200/50 rounded-2xl w-full">
              <h4 className="text-[10px] sm:text-xs font-bold text-[#302B27] uppercase tracking-wider mb-2.5 flex items-center space-x-1.5">
                <Map className="w-3.5 h-3.5 text-[#8B5E34]" />
                <span>Croquis d'Origine</span>
              </h4>
              <div className="border border-gray-250/30 rounded-xl overflow-hidden bg-white/40 w-full">
                <ColombiaMap 
                  activeDepartmentId={departmentId} 
                  onDepartmentClick={(id) => id && setDepartmentId(id)}
                  interactive={true}
                  allowDeselect={false}
                />
              </div>
              <div className="flex items-center space-x-2 text-xs text-[#76736A] mt-3 bg-[#23493C]/5 p-2 sm:p-2.5 rounded-xl border border-[#23493C]/10 leading-snug">
                <MapPin className="w-4 h-4 text-[#23493C] shrink-0 animate-bounce" />
                <span>
                  Origine : <strong>{COLOMBIA_DEPARTMENTS.find(d => d.id === departmentId)?.name || departmentId}</strong>
                </span>
              </div>
            </div>

            {/* Quick Inventory list with edit and delete */}
            <div className="border border-gray-150 rounded-2xl p-4 sm:p-5 bg-white/40 w-full">
              <h4 className="text-[10px] sm:text-xs font-bold text-[#302B27] uppercase tracking-wider mb-3 flex items-center justify-between">
                <span>Catalogue Référencé ({adminProducts.length})</span>
                <span className="text-[9px] text-[#898579] font-medium">Créer, Éditer, Supprimer</span>
              </h4>

              {productsLoading ? (
                <div className="py-6 flex justify-center">
                  <Loader2 className="w-5 h-5 animate-spin text-[#23493C]" />
                </div>
              ) : adminProducts.length === 0 ? (
                <p className="text-xs text-[#76736A] italic py-2">Aucun produit à afficher.</p>
              ) : (
                <div className="space-y-2 max-h-[250px] overflow-y-auto pr-1">
                  {adminProducts.map(p => {
                    const priceStr = p.basePrice ? `${p.basePrice} €` : `FR:${p.prices?.FR || '0'} €`;
                    return (
                      <div key={p.id} className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-gray-100 text-xs gap-3 shadow-2xs">
                        <div className="flex items-center space-x-2.5 min-w-0">
                          {p.base64Image && (
                            <img src={p.base64Image} alt={p.name} className="w-9 h-9 rounded-lg object-cover bg-gray-50 select-none shrink-0" referrerPolicy="no-referrer" />
                          )}
                          <div className="min-w-0">
                            <p className="font-bold text-[#302B27] truncate leading-tight">{p.name}</p>
                            <p className="text-[10px] text-gray-500 truncate mt-0.5">
                              {p.category || 'Général'} · <span className="font-bold text-[#23493C]">{priceStr}</span>
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-1 shrink-0">
                          <button 
                            type="button"
                            onClick={() => startEditProduct(p)}
                            className="bg-[#23493C]/5 text-[#23493C] hover:bg-[#23493C]/10 p-2 rounded-lg transition-colors cursor-pointer"
                            title="Modifier le produit"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button 
                            type="button"
                            onClick={() => handleDeleteProduct(p.id)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition-colors cursor-pointer"
                            title="Supprimer le produit"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

        </div>
      )}

      {/* TAB 2: CATEGORIES CREATION / EDITING */}
      {activeTab === 'categories' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
          {/* Create category Form */}
          <form onSubmit={handleSaveCategory} className="space-y-4 sm:space-y-6">
            <h3 className="text-base sm:text-lg font-bold text-[#302B27] pb-2 border-b border-gray-100 flex items-center justify-between">
              <span className="flex items-center space-x-2">
                {editingCategory ? <Pencil className="w-4 h-4 text-[#8B5E34]" /> : <Plus className="w-4 h-4 text-[#8B5E34]" />}
                <span>{editingCategory ? `Modifier "${editingCategory.name}"` : 'Créer une nouvelle Catégorie Commerciale'}</span>
              </span>
              {editingCategory && (
                <button 
                  type="button" 
                  onClick={cancelEditCategory}
                  className="text-xs font-semibold text-gray-500 hover:text-red-600 flex items-center gap-1 bg-gray-100 px-2.5 py-1 rounded-lg"
                >
                  <Undo className="w-3 h-3" />
                  Annuler la modification
                </button>
              )}
            </h3>

            <div>
              <label className="block text-[10px] sm:text-xs font-bold text-[#302B27] uppercase tracking-wider mb-2">Nom de la Catégorie</label>
              <input 
                type="text"
                required
                value={catName}
                onChange={(e) => setCatName(e.target.value)}
                placeholder="Ex : Chocolats Fins & Cacao, Tapisseries, Poteries"
                className="w-full px-3 py-2.5 sm:py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#8B5E34]/20 focus:border-[#8B5E34] transition-all bg-white text-base md:text-sm text-[#302B27]"
              />
            </div>

            <div>
              <label className="block text-[10px] sm:text-xs font-bold text-[#302B27] uppercase tracking-wider mb-2">Description rapide</label>
              <textarea 
                value={catDesc}
                onChange={(e) => setCatDesc(e.target.value)}
                placeholder="Ex : Des fèves d'exception récoltées par les communautés natives de la Sierra Nevada."
                rows={4}
                className="w-full px-3 py-2.5 sm:py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#8B5E34]/20 focus:border-[#8B5E34] transition-all bg-white text-base md:text-sm text-[#302B27] resize-none"
              />
            </div>

            <button 
              type="submit"
              className="w-full py-3 sm:py-4 bg-[#8B5E34] text-white font-semibold text-xs sm:text-sm hover:bg-[#724C28] rounded-xl transition-all flex items-center justify-center space-x-2 cursor-pointer shadow-md shadow-[#8B5E34]/15"
            >
              {editingCategory ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              <span>{editingCategory ? 'Mettre à jour la Catégorie' : 'Créer la Catégorie'}</span>
            </button>
          </form>

          {/* Categories List view */}
          <div className="space-y-4">
            <h3 className="text-base sm:text-lg font-bold text-[#302B27] pb-2 border-b border-gray-100">
              Catégories en Activité ({categories.length})
            </h3>
            <div className="space-y-2.5 sm:space-y-3 max-h-[420px] overflow-y-auto pr-1">
              {categories.map((cat) => {
                const isDefault = DEFAULT_CATEGORIES.some(df => df.id === cat.id);
                return (
                  <div key={cat.id} className="p-3.5 sm:p-4 bg-white rounded-2xl border border-gray-100 flex items-center justify-between gap-4 shadow-sm hover:shadow-md transition-shadow">
                    <div className="min-w-0 flex-grow">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="font-bold text-xs sm:text-sm text-[#302B27]">{cat.name}</span>
                        {isDefault && (
                          <span className="text-[8px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider shrink-0 font-sans">Système</span>
                        )}
                      </div>
                      <p className="text-xs text-[#76736A] mt-1 line-clamp-2 leading-relaxed">{cat.description || "Aucune description renseignée."}</p>
                      <p className="font-mono text-[9px] text-[#ACAA9F] mt-1.5 text-ellipsis overflow-hidden">slug: /{cat.slug}</p>
                    </div>
                    
                    <div className="flex items-center space-x-1 shrink-0">
                      <button 
                        type="button"
                        onClick={() => startEditCategory(cat)}
                        className="bg-gray-100 hover:bg-gray-250 text-[#76736A] hover:text-[#302B27] p-2 rounded-xl transition-all cursor-pointer"
                        title="Modifier la catégorie"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      
                      {!isDefault && (
                        <button 
                          type="button"
                          onClick={() => handleDeleteCategory(cat.id)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-xl transition-colors cursor-pointer self-center"
                          title="Supprimer la catégorie"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: DEDICATED COUNTRY PRICING */}
      {activeTab === 'pricing' && (
        <div className="space-y-6 sm:space-y-8">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-[#302B27] pb-2 border-b border-gray-100 flex items-center space-x-2">
              <Percent className="w-4 h-4 text-[#23493C]" />
              <span>Grille de Tarification de Cobro par Pays de Livraison</span>
            </h3>
            <p className="text-xs text-[#76736A] max-w-2xl leading-relaxed mt-2.5">
              Configurez ici les tarifs d'acheminement, taxes et marges commerciales globales pour chacun des hubs d'Europe de l'Union. Le prix payé par le client se calcule comme suit : <br />
              <strong className="text-[#23493C] font-mono text-[11px] bg-gray-50 px-2 py-1 rounded block mt-1 border border-gray-150 inline-block">
                Prix Final = (Prix de Base x Multiplicateur de Pays) + Surcharge Fixe de Transport
              </strong>
            </p>
          </div>

          <div className="border border-gray-200/50 rounded-2xl overflow-hidden bg-white/40 shadow-xs max-w-3.5xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#23493C]/5 border-b border-gray-200/70 text-[#23493C] font-semibold text-[10px] uppercase tracking-wider">
                    <th className="py-4 px-5">Pays de Livraison</th>
                    <th className="py-4 px-4 flex items-center gap-1">
                      <Percent className="w-3 h-3 text-[#23493C]" />
                      <span>Multiplicateur Tarifaire</span>
                    </th>
                    <th className="py-4 px-4">
                      <div className="flex items-center gap-1">
                        <Truck className="w-3.5 h-3.5 text-[#23493C]" />
                        <span>Frais Fixes de Commande (€)</span>
                      </div>
                    </th>
                    <th className="py-4 px-5 text-right">Simulation (Pour un produit de base à 15,00 €)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {countryPricing.map((item, idx) => {
                    const simulatedPrice = (15.0 * item.multiplier) + item.surcharge;
                    return (
                      <tr key={item.code} className="hover:bg-white/70 transition-all font-medium text-[#302B27]">
                        <td className="py-4 px-5">
                          <div className="font-semibold text-sm">{item.name}</div>
                          <div className="font-mono text-[9px] text-[#898579] uppercase">Code: {item.code}</div>
                        </td>
                        <td className="py-4 px-4">
                          <input 
                            type="number" 
                            step="0.01" 
                            required
                            value={item.multiplier}
                            onChange={(e) => handleUpdateCountryPricing(idx, 'multiplier', e.target.value)}
                            className="w-24 px-3 py-1.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#23493C] bg-white font-semibold flex" 
                            placeholder="1.0"
                          />
                        </td>
                        <td className="py-4 px-4">
                          <input 
                            type="number" 
                            step="0.10" 
                            required
                            value={item.surcharge}
                            onChange={(e) => handleUpdateCountryPricing(idx, 'surcharge', e.target.value)}
                            className="w-24 px-3 py-1.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#23493C] bg-white font-semibold flex" 
                            placeholder="0.0"
                          />
                        </td>
                        <td className="py-4 px-5 text-right text-[#23493C] font-bold text-sm">
                          {simulatedPrice.toFixed(2)} €
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="p-4 bg-gray-50 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-gray-150">
              <span className="text-[10px] sm:text-xs text-[#76736A] font-semibold flex items-center space-x-1.5">
                <AlertCircle className="w-4 h-4 text-[#8B5E34] animate-pulse" />
                <span>La modification des tarifs recalculera instantanément le prix des produits existants.</span>
              </span>
              <button
                type="button"
                onClick={saveCountryPricingConfigs}
                className="px-5 py-2.5 bg-[#23493C] hover:bg-[#1C3A30] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-sm hover:shadow"
              >
                Mettre à jour les Tarifs Nationaux
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: CLIENT REQUESTS */}
      {activeTab === 'suggestions' && (
        <div className="space-y-4 sm:space-y-6">
          <div className="flex items-center justify-between pb-2 border-b border-gray-100 gap-2">
            <h3 className="text-base sm:text-lg font-bold text-[#302B27] flex items-center space-x-2">
              <Inbox className="w-4 h-4 text-[#23493C]" />
              <span>Demandes de Sourcing Déposées par les Clients</span>
            </h3>
            <button 
              type="button"
              onClick={fetchSuggestions} 
              className="text-xs font-semibold text-[#8B5E34] hover:underline flex items-center space-x-1 cursor-pointer shrink-0"
            >
              <span>Actualiser</span>
            </button>
          </div>

          <p className="text-xs text-[#76736A] max-w-xl leading-relaxed">
            Ces fiches sont générées lorsque les visiteurs remplissent le formulaire de contact sur le site. Utilisez ces informations pour négocier des importations directes avec les producteurs colombiens.
          </p>

          {suggestionsLoading ? (
            <div className="py-12 flex justify-center">
              <Loader2 className="w-10 h-10 animate-spin text-[#23493C]" />
            </div>
          ) : suggestions.length === 0 ? (
            <div className="py-12 sm:py-16 text-center border-2 border-dashed border-gray-200 rounded-3xl bg-gray-50/50">
              <Inbox className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <h4 className="font-bold text-[#302B27] text-sm">Boîte de réception vide</h4>
              <p className="text-xs text-[#76736A] mt-1 max-w-sm mx-auto px-4">Aucun visiteur n'a encore suggéré de produit d'importation.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {suggestions.map((s) => (
                <div key={s.id} className="bg-white p-4 sm:p-6 rounded-3xl border border-gray-100 shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow font-sans">
                  <div className="absolute top-0 left-0 w-1.5 h-full bg-[#8B5E34]" />
                  
                  <div className="space-y-3.5">
                    {/* Header Details */}
                    <div className="min-w-0">
                      <div className="flex items-center space-x-2 text-xs text-gray-500 font-medium mb-1 min-w-0">
                        <User className="w-3.5 h-3.5 shrink-0" />
                        <span className="font-bold text-gray-800 truncate">{s.name}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-xs text-[#8B5E34] font-medium min-w-0">
                        <Mail className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                        <a href={`mailto:${s.email}`} className="hover:underline truncate min-w-0">{s.email}</a>
                      </div>
                    </div>

                    {/* Desired products bubble */}
                    <div className="bg-gray-50 p-3 sm:p-4 rounded-2xl border border-gray-100 text-xs">
                      <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider block mb-1">Demande Produit :</span>
                      <p className="text-[#302B27] leading-relaxed italic break-words">"{s.requestedProduct}"</p>
                    </div>

                    {/* Actions panel */}
                    <div className="pt-2 flex flex-wrap items-center justify-between border-t border-gray-50 gap-2">
                      <span className="text-[10px] text-gray-400">Origine: Webapp suggestion</span>
                      <button 
                        type="button"
                        onClick={() => handleMarkRequestDone(s.id)}
                        className="flex items-center space-x-1 px-2.5 py-1.5 bg-[#23493C]/10 hover:bg-[#23493C]/20 text-[#23493C] rounded-lg text-[9px] sm:text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer whitespace-nowrap"
                        title="Archiver"
                      >
                        <Check className="w-3 h-3" />
                        <span>Archiver</span>
                      </button>
                    </div>

                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

    </div>
  );
}
