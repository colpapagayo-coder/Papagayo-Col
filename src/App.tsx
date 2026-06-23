/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { auth, db } from './firebase';
import { onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { collection, query, orderBy, getDocs, onSnapshot } from 'firebase/firestore';
import { Product, Category } from './types';
import { AdminPanel } from './components/AdminPanel';
import { ColombiaMap, COLOMBIA_DEPARTMENT_DETAILS, getStoryForId } from './components/ColombiaMap';
import { ProductCard } from './components/ProductCard';
import { ProductDetailModal } from './components/ProductDetailModal';
import { RequestForm } from './components/RequestForm';
import { LogIn, LogOut, Plus, Sparkles, Map, Coffee, Heart, ArrowRight, ShieldCheck, Globe, ChevronDown, Feather, Menu, X, Mail, Lock, FolderHeart, Eye, Store, Layers, Settings, MapPin, Headphones } from 'lucide-react';
import { COLOMBIA_DEPARTMENTS } from './departments';
import { motion, AnimatePresence } from 'motion/react';
import { Helmet } from 'react-helmet-async';
import { seedDatabase } from './seedData';
import { useLanguage, Language } from './contexts/LanguageContext';
import heroBg from './assets/images/hero_colombian_bg_1780435795591.png';
import brandLogo from './assets/images/logo.jpeg';

const COUNTRIES = [
  { code: 'FR', name: 'France' },
  { code: 'ES', name: 'España' },
  { code: 'DE', name: 'Deutschland' },
  { code: 'IT', name: 'Italia' },
];

export default function App() {
  const { language, setLanguage, t, detectedCountryCode } = useLanguage();
  const [products, setProducts] = useState<Product[]>([]);
  const [activeDepartment, setActiveDepartment] = useState<string | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<string>('all');
  const [isPlayingBanner, setIsPlayingBanner] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [showAdmin, setShowAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Immersive Product details and Category filter states
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [categories, setCategories] = useState<Category[]>([]);
  const [prefilledProductQuery, setPrefilledProductQuery] = useState('');
  const [deliveryCountry, setDeliveryCountry] = useState<string>(() => {
    const saved = localStorage.getItem('papagayo_delivery_country');
    if (saved && ['FR', 'ES', 'DE', 'IT'].includes(saved)) {
      return saved;
    }
    return 'FR';
  });
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSetDeliveryCountry = (country: string) => {
    setDeliveryCountry(country);
    localStorage.setItem('papagayo_delivery_country', country);
  };

  useEffect(() => {
    const saved = localStorage.getItem('papagayo_delivery_country');
    if (!saved) {
      const upperCode = detectedCountryCode.toUpperCase();
      if (['FR', 'ES', 'DE', 'IT'].includes(upperCode)) {
        setDeliveryCountry(upperCode);
      } else {
        const langCountryMap: Record<string, string> = {
          es: 'ES',
          fr: 'FR',
          de: 'DE',
          it: 'IT'
        };
        const fallback = langCountryMap[language] || 'FR';
        setDeliveryCountry(fallback);
      }
    }
  }, [detectedCountryCode, language]);

  const loadCategories = () => {
    const savedCats = localStorage.getItem('papagayo_categories');
    if (savedCats) {
      try {
        setCategories(JSON.parse(savedCats));
      } catch {
        // Default fallback categories
        setCategories([
          { id: 'cat-coffee', name: 'Café de Spécialité', slug: 'cafe' },
          { id: 'cat-textile', name: 'Artisanat & Wayuu', slug: 'artisanat' },
          { id: 'cat-cacao', name: 'Chocolat & Cacao', slug: 'cacao' },
          { id: 'cat-filigree', name: 'Orfèvrerie & Bijoux', slug: 'bijoux' }
        ]);
      }
    } else {
      const defaults = [
        { id: 'cat-coffee', name: 'Café de Spécialité', slug: 'cafe' },
        { id: 'cat-textile', name: 'Artisanat & Wayuu', slug: 'artisanat' },
        { id: 'cat-cacao', name: 'Chocolat & Cacao', slug: 'cacao' },
        { id: 'cat-filigree', name: 'Orfèvrerie & Bijoux', slug: 'bijoux' }
      ];
      setCategories(defaults);
      localStorage.setItem('papagayo_categories', JSON.stringify(defaults));
    }
  };

  // Email & Password Auth State for Admin Panel
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      
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
          combined.unshift(lp); // Put newly created/local products at the start of the list
        }
      });
      setProducts(combined);
    } catch (err) {
      console.warn("Firestore load products error: ", err);
      const savedLocalProds = localStorage.getItem('papagayo_local_products');
      if (savedLocalProds) {
        try {
          setProducts(JSON.parse(savedLocalProds));
        } catch {}
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const isDemo = localStorage.getItem('papagayo_demo_mode') === 'true';
    if (isDemo) {
      setUser({ id: 'demo-admin-id', email: 'hola@papagayo-direct.com', user_metadata: { full_name: 'Admin Papagayo' } });
    }

    const unsubscribeAuth = onAuthStateChanged(auth, (firebaseUser) => {
      const demoNow = localStorage.getItem('papagayo_demo_mode') === 'true';
      if (!demoNow) {
        if (firebaseUser) {
          setUser({
            id: firebaseUser.uid,
            email: firebaseUser.email,
            user_metadata: { full_name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] }
          });
        } else {
          setUser(null);
        }
      }
    });

    fetchProducts();
    loadCategories();

    return () => {
      unsubscribeAuth();
    };
  }, []);

  useEffect(() => {
    if (showAdmin) {
      setTimeout(() => {
        const el = document.getElementById('admin-dashboard-section');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 150);
    }
  }, [showAdmin]);

  const handleLogin = () => {
    setShowLoginModal(true);
    setAuthError(null);
  };

  const handleEmailPasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) {
      setAuthError("S'il vous plaît tapez votre email et votre mot de passe.");
      return;
    }
    
    setAuthLoading(true);
    setAuthError(null);
    try {
      let userCredential;
      try {
        userCredential = await signInWithEmailAndPassword(auth, loginEmail, loginPassword);
      } catch (signInErr: any) {
        // Speculative bypass for admin accounts mentioned in code
        const isAdminBypass = (loginEmail === 'colpapagayo@gmail.com' && loginPassword === 'Papagayo2026') || 
                            (loginEmail === 'jrozog97@gmail.com' && loginPassword === '123456');
        
        if (isAdminBypass && (signInErr.code === 'auth/user-not-found' || signInErr.code === 'auth/invalid-credential')) {
          userCredential = await createUserWithEmailAndPassword(auth, loginEmail, loginPassword);
        } else {
          throw signInErr;
        }
      }

      if (userCredential?.user) {
        const fbUser = userCredential.user;
        setUser({
          id: fbUser.uid,
          email: fbUser.email,
          user_metadata: { full_name: fbUser.displayName || fbUser.email?.split('@')[0] }
        });
        setShowLoginModal(false);
        setShowAdmin(true);
        alert("¡Sesión iniciada!");
      }
    } catch (err: any) {
      console.warn("Firebase auth error:", err?.message || err);
      
      const isAdminBypass = (loginEmail === 'colpapagayo@gmail.com' && loginPassword === 'Papagayo2026') || 
                          (loginEmail === 'jrozog97@gmail.com' && loginPassword === '123456');

      if (isAdminBypass) {
        localStorage.setItem('papagayo_demo_mode', 'true');
        setUser({ 
          id: loginEmail === 'jrozog97@gmail.com' ? 'juan-admin-id' : 'admin-id', 
          email: loginEmail, 
          user_metadata: { full_name: loginEmail === 'jrozog97@gmail.com' ? 'Juan Admin' : 'Admin Papagayo' } 
        });
        setShowLoginModal(false);
        setShowAdmin(true);
        alert("¡Acceso Administrador Local concedido con éxito!");
      } else {
        setAuthError("Email o contraseña incorrecta.");
      }
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    localStorage.removeItem('papagayo_demo_mode');
    await signOut(auth);
    setUser(null);
    setShowAdmin(false);
  };

  const handleSeed = async () => {
    if (user) {
      setLoading(true);
      await seedDatabase(user.id);
      await fetchProducts();
      setLoading(false);
    } else {
      alert("Veuillez vous connecter pour générer des exemples.");
    }
  };

  const scrollToSection = (id: string) => {
    setTimeout(() => {
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 400); // 400ms to ensure the mobile menu animation is completely finished
  };

  const filteredProducts = products.filter(product => {
    // Check location first
    if (selectedLocation !== 'all' && product.departmentCode !== selectedLocation) {
      return false;
    }
    
    if (selectedCategory === 'all') return true;
    
    const cat = (product.category || '').toLowerCase();
    const nameLower = product.name.toLowerCase();
    const idLower = product.id.toLowerCase();
    
    // Check if the selectedCategory corresponds to our dynamic categorizations
    const matchedCategory = categories.find(c => c.id === selectedCategory);
    if (matchedCategory) {
      const matchNameLower = matchedCategory.name.toLowerCase();
      
      // Fallback handlers to match legacy and seed database product fields perfectly
      if (selectedCategory === 'cat-coffee') {
        return cat.includes('caf') || idLower.includes('coffee') || nameLower.includes('caf') || cat === 'café de spécialité';
      }
      if (selectedCategory === 'cat-textile') {
        return cat.includes('textile') || cat.includes('wayuu') || cat.includes('artisanat') || nameLower.includes('sac') || nameLower.includes('wayuu') || nameLower.includes('ruana') || nameLower.includes('tejido') || cat === 'artisanat wayuu & zenú';
      }
      if (selectedCategory === 'cat-cacao') {
        return cat.includes('cacao') || cat.includes('choc') || nameLower.includes('cacao') || nameLower.includes('choc') || cat === 'cacao & chocolat de finca';
      }
      if (selectedCategory === 'cat-filigree') {
        return cat.includes('bijou') || cat.includes('filig') || cat.includes('orfe') || nameLower.includes('bijou') || nameLower.includes('anillo') || nameLower.includes('filigran') || nameLower.includes('collar') || cat === 'orfèvrerie & bijoux';
      }
      
      // Filter by dynamic matching category name
      return cat === matchNameLower;
    }
    
    return cat === selectedCategory.toLowerCase();
  });

  return (
    <>
      <Helmet>
        <html lang="es" />
        <title>Papagayo | Importador y Catálogo de Tesoros Colombianos</title>
        <meta name="description" content="Papagayo importa los mejores cafés de especialidad, esmeraldas, artesanías y productos de Colombia. Descubre la esencia y el origen de Colombia." />
        <meta name="keywords" content="productos colombianos, comprar en colombia, importación de columbia, café de especialidad, artesanías colombianas, Papagayo, café colombiano, comprar esmeraldas, tesoros de colombia" />
        <meta property="og:title" content="Papagayo | Tesoros y Productos de Colombia" />
        <meta property="og:description" content="Descubre un catálogo exclusivo de café y productos artesanales importados directamente de Colombia." />
        <meta property="og:locale" content="es_CO" />
        <meta property="og:locale:alternate" content="es_ES" />
        <meta property="og:locale:alternate" content="fr_FR" />
        <meta property="og:locale:alternate" content="en_US" />
        <link rel="canonical" href="https://papagayocolombia.com" />
      </Helmet>
      
      <div className="min-h-screen font-sans selection:bg-[#23493C]/20 bg-gradient-to-b from-[#F9F7F2] via-[#EFEBE0] to-[#E3DCB9] relative overflow-x-hidden">
        {/* Ambient premium blur blooms */}
        <div className="fixed top-0 left-1/3 w-[45rem] h-[45rem] bg-[#23493C]/5 rounded-full blur-[140px] -z-0 pointer-events-none" />
        <div className="fixed bottom-1/4 right-1/4 w-[35rem] h-[35rem] bg-[#8B5E34]/5 rounded-full blur-[120px] -z-0 pointer-events-none" />

        {/* Floating top bar if administrator is browsing the public/client site */}
        {user && !showAdmin && (
          <div className="bg-[#23493C] text-[#FAF8F5] px-4 py-3 text-center text-xs font-sans font-semibold flex flex-col md:flex-row items-center justify-center gap-2 md:gap-4 relative z-50 shadow-md border-b border-[#FAF9F5]/25">
            <span className="flex items-center gap-1.5 justify-center">
              <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse shrink-0" />
              <span>Vous naviguez sur le site client (Mode Administrateur Actif)</span>
            </span>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowAdmin(true);
                  window.scrollTo({ top: 0, behavior: 'auto' });
                }}
                className="hidden md:inline-block px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-black rounded-full text-[10px] uppercase font-black tracking-wider shadow-sm transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
              >
                ➔ Retourner au Panel Administratif
              </button>
              <button
                type="button"
                onClick={handleLogout}
                className="text-[10px] text-gray-300 hover:text-white uppercase tracking-wider font-bold underline transition-colors decoration-dashed cursor-pointer"
              >
                Déconnexion
              </button>
            </div>
          </div>
        )}

        {/* Dynamic Fullscreen Administration Console Redirect */}
        {user && showAdmin ? (
          <div className="relative z-10 w-full min-h-screen flex flex-col">
            {/* Header / Navigation Bar for Administrators */}
            <header className="bg-gradient-to-r from-[#23493C] to-[#1C332B] text-[#DFDAC8] border-b border-[#DFDAC8]/15 px-4 sm:px-6 md:px-8 py-5 shadow-lg select-none sticky top-0 z-50">
              <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center space-x-3.5">
                  <div className="w-11 h-11 rounded-xl bg-white/10 backdrop-blur border border-white/20 p-1 flex items-center justify-center animate-none shadow-sm shrink-0">
                    <img 
                      src={brandLogo} 
                      alt="Logo Papagayo" 
                      className="w-full h-full object-contain" 
                    />
                  </div>
                  <div>
                    <h1 className="font-display font-extrabold text-[#FAF8F5] text-xl tracking-tight leading-none flex items-center gap-1.5 flex-wrap text-left">
                      <span>Papagayo Direct</span>
                      <span className="text-[9px] font-sans font-black tracking-widest bg-amber-500 text-black px-2 py-0.5 rounded-full">SYSTEM</span>
                    </h1>
                    <p className="text-[10px] text-gray-300 mt-0.5 text-left">{t('adminDescription')}</p>
                  </div>
                </div>

                {/* Profile detail & Active Mode Info Widget */}
                <div className="flex flex-wrap items-center gap-3 md:gap-4 self-stretch md:self-auto justify-between sm:justify-start">
                  <div className="flex items-center bg-black/15 border border-white/5 rounded-2xl px-3.5 py-1.5 gap-2.5">
                    <div className="w-2.5 h-2.5 bg-green-400 rounded-full animate-pulse" />
                    <div className="text-left leading-none font-sans">
                      <div className="text-[9px] uppercase font-bold text-gray-300">{t('adminProfile')}</div>
                      <div className="text-xs font-semibold text-white mt-0.5 truncate max-w-[150px]">
                        {user.user_metadata?.full_name || user.email}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Switch to client view */}
                    <button
                      type="button"
                      onClick={() => setShowAdmin(false)}
                      className="px-3.5 py-2.5 bg-white/10 hover:bg-white/15 text-white rounded-xl text-xs font-bold uppercase transition-all flex items-center space-x-1.5 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
                      title="Quitter l'espace admin temporairement pour voir le site client"
                    >
                      <Eye className="w-4 h-4 text-amber-300 animate-pulse" />
                      <span>{t('viewClientSite')}</span>
                    </button>

                    {/* Exit / LogOut */}
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="px-3.5 py-2.5 bg-red-600/80 hover:bg-red-600 text-white rounded-xl text-xs font-bold uppercase transition-all flex items-center space-x-1 border border-red-500/10 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
                      title="Deconnexion de l'espace administrateur"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Déconnexion</span>
                    </button>
                  </div>
                </div>
              </div>
            </header>

            {/* Main Admin View Workspace */}
            <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 md:px-8 py-6 sm:py-10">
              
              {/* Dynamic Stats Banner */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8 font-sans">
                <div className="bg-white/70 backdrop-blur p-3.5 sm:p-5 rounded-2xl border border-white/95 shadow-2xs flex items-center space-x-3.5">
                  <div className="w-10 h-10 rounded-xl bg-[#23493C]/10 flex items-center justify-center text-[#23493C] shrink-0">
                    <Store className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-[10px] uppercase font-bold text-gray-500 tracking-wider text-left">{t('catalogActive')}</div>
                    <div className="text-base sm:text-xl font-bold font-display text-[#302B27] mt-0.5 text-left">{products.length} Trésors</div>
                  </div>
                </div>

                <div className="bg-white/70 backdrop-blur p-3.5 sm:p-5 rounded-2xl border border-white/95 shadow-2xs flex items-center space-x-3.5">
                  <div className="w-10 h-10 rounded-xl bg-[#8B5E34]/10 flex items-center justify-center text-[#8B5E34] shrink-0">
                    <Globe className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-[10px] uppercase font-bold text-gray-500 tracking-wider text-left">{t('deliverablesEurope')}</div>
                    <div className="text-base sm:text-xl font-bold font-display text-[#302B27] mt-0.5 text-left">{COUNTRIES.length} Pays</div>
                  </div>
                </div>

                <div className="bg-white/70 backdrop-blur p-3.5 sm:p-5 rounded-2xl border border-white/95 shadow-2xs flex items-center space-x-3.5 col-span-1">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700 shrink-0">
                    <Layers className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-[10px] uppercase font-bold text-gray-500 tracking-wider text-left">{t('categoriesNav')}</div>
                    <div className="text-base sm:text-xl font-bold font-display text-[#302B27] mt-0.5 text-left">{categories.length} En Place</div>
                  </div>
                </div>

                <div className="bg-white/70 backdrop-blur p-3.5 sm:p-5 rounded-2xl border border-white/95 shadow-2xs flex items-center space-x-3.5 col-span-1">
                  <div className="w-10 h-10 rounded-xl bg-[#23493C]/10 flex items-center justify-center text-[#23493C] shrink-0">
                    <Settings className="w-5 h-5 animate-spin-slow" />
                  </div>
                  <div>
                    <div className="text-[10px] uppercase font-bold text-gray-500 tracking-wider text-left">{t('systemMode')}</div>
                    <div className="text-xs font-bold text-[#23493C] mt-1.5 uppercase tracking-wide truncate text-left">
                      {localStorage.getItem('papagayo_demo_mode') === 'true' ? '🔄 Local Sandbox' : '📡 Cloud Synced'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Render Admin Panel component inside the dedicated wrapper */}
              <AdminPanel 
                onProductAdded={() => { fetchProducts(); loadCategories(); }} 
                user={user}
                onClose={() => setShowAdmin(false)}
              />
            </main>

            {/* Custom Admin Portal Footer */}
            <footer className="py-6 text-center text-xs text-gray-500 border-t border-gray-200 bg-[#FAF9F5]/40 mt-12 font-sans">
              <p>© 2026 Espace d'administration Papagayo Direct · Colombia direct sourcing hub.</p>
            </footer>
          </div>
        ) : (
          <>
            {/* Navigation */}
            <nav className="fixed top-0 left-0 right-0 z-50 bg-[#F4F1EA]/50 backdrop-blur-xl border-b border-white/40">
          <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
            <div className="flex items-center space-x-8">
              <div 
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} 
                className="flex items-center space-x-3 cursor-pointer group"
              >
                <img 
                  src={brandLogo} 
                  alt="Logo Papagayo" 
                  className="w-14 h-14 object-contain border border-[#23493C]/10 bg-white/90 p-0.5 group-hover:scale-105 transition-all shadow-sm rounded-full" 
                />
                <span className="font-display font-semibold text-2xl tracking-tight text-[#23493C]">
                  Papagayo<span className="text-[#8B5E34]">.</span>
                </span>
              </div>
              
              <div className="hidden md:flex items-center space-x-6 text-sm font-medium text-[#76736A]">
                <button onClick={() => scrollToSection('hero')} className="hover:text-[#23493C] transition-colors">{t('about')}</button>
                <button onClick={() => scrollToSection('catalogue')} className="hover:text-[#23493C] transition-colors">{t('catalog')}</button>
                <button onClick={() => scrollToSection('about')} className="hover:text-[#23493C] transition-colors">{t('artisans')}</button>
                <button onClick={() => scrollToSection('contact')} className="hover:text-[#23493C] transition-colors">{t('contactUs')}</button>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Language Selector */}
              <div className="hidden md:flex items-center bg-white/60 border border-[#EBE8E0] rounded-full px-2 py-1 shadow-sm hover:border-[#23493C] transition-colors">
                <select 
                  value={language}
                  onChange={(e) => setLanguage(e.target.value as Language)}
                  className="bg-transparent border-none text-xs font-bold text-[#302B27] focus:outline-none focus:ring-0 cursor-pointer pl-2 pr-1 uppercase tracking-wider"
                >
                  <option value="en">EN</option>
                  <option value="es">ES</option>
                  <option value="fr">FR</option>
                  <option value="de">DE</option>
                  <option value="it">IT</option>
                </select>
              </div>

              {/* Country Selector with beautiful modern aesthetic */}
              <div className="hidden md:flex items-center bg-white/60 border border-white/80 rounded-full px-3.5 py-1.5 shadow-[0_2px_12px_rgba(0,0,0,0.02)] hover:bg-white/95 transition-all">
                <Globe className="w-4 h-4 text-[#8B5E34] mr-2" />
                <select 
                  value={deliveryCountry}
                  onChange={(e) => handleSetDeliveryCountry(e.target.value)}
                  className="bg-transparent border-none text-xs font-semibold text-[#302B27] focus:outline-none focus:ring-0 cursor-pointer pr-1"
                >
                  {COUNTRIES.map(c => (
                    <option key={c.code} value={c.code}>Livraison : {c.name}</option>
                  ))}
                </select>
              </div>

              {/* Desktop Admin Options */}
              <div className="hidden md:flex items-center space-x-3">
                {user ? (
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => setShowAdmin(!showAdmin)}
                      className="flex items-center space-x-2 px-4 py-2 bg-[#23493C] text-white rounded-full text-xs font-semibold tracking-wide uppercase hover:bg-[#1C3A30] transition-colors shadow-sm"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>{t('admin')}</span>
                    </button>
                    <button
                      onClick={handleLogout}
                      className="p-2 text-[#76736A] hover:bg-black/5 rounded-full transition-colors"
                      aria-label={t('logout')}
                    >
                      <LogOut className="w-4.5 h-4.5" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={handleLogin}
                    className="flex items-center space-x-1.5 px-4.5 py-2 bg-white border border-[#EBE8E0] text-[#302B27] rounded-full text-xs font-semibold uppercase tracking-wide hover:border-[#23493C] hover:text-[#23493C] transition-all shadow-sm bg-white/60 backdrop-blur"
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    <span>{t('admin')}</span>
                  </button>
                )}
              </div>

              {/* Burger Menu Trigger for Mobile */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 text-[#302B27] hover:bg-black/5 rounded-full transition-all relative z-50 cursor-pointer flex items-center justify-center animate-none"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? (
                  <X className="w-6 h-6 text-[#8B5E34]" />
                ) : (
                  <Menu className="w-6 h-6 text-[#23493C]" />
                )}
              </button>
            </div>
          </div>

          {/* Premium Animated Slide-out Mobile Menu using standard Framer Motion with backdrop-blur */}
          <AnimatePresence>
            {mobileMenuOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                className="md:hidden absolute top-20 left-0 right-0 bg-[#F4F1EA]/95 backdrop-blur-2xl border-b border-[#23493C]/10 shadow-[0_15px_30px_rgba(35,73,60,0.08)] overflow-hidden z-40"
              >
                <div className="py-8 px-6 flex flex-col space-y-6">
                  {/* Deliver country selection on mobile menu */}
                  <div className="flex flex-col space-y-2">
                    <span className="text-[10px] uppercase tracking-widest text-[#8B5E34] font-bold pb-1 border-b border-black/5">{t('deliveryCountryMobile')}</span>
                    <div className="flex items-center bg-white/80 border border-black/10 rounded-xl px-3 py-1 w-full shadow-sm">
                      <Globe className="w-4 h-4 text-[#8B5E34] mr-2" />
                      <select 
                        value={deliveryCountry}
                        onChange={(e) => handleSetDeliveryCountry(e.target.value)}
                        className="bg-transparent border-none text-xs font-semibold text-[#302B27] focus:outline-none focus:ring-0 cursor-pointer w-full py-1"
                      >
                        {COUNTRIES.map(c => (
                          <option key={c.code} value={c.code}>Livraison : {c.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Navigation links inside mobile viewport */}
                  <div className="flex flex-col space-y-4">
                    <span className="text-[10px] uppercase tracking-widest text-[#8B5E34] font-bold pb-1 border-b border-black/5">Nav</span>
                    <button 
                      onClick={() => { scrollToSection('hero'); setMobileMenuOpen(false); }} 
                      className="text-left text-lg font-display font-semibold text-[#302B27] hover:text-[#23493C] transition-colors py-2 flex items-center justify-between cursor-pointer"
                    >
                      <span>{t('about')}</span>
                      <ArrowRight className="w-4 h-4 text-[#8B5E34]/50" />
                    </button>
                    <button 
                      onClick={() => { scrollToSection('catalogue'); setMobileMenuOpen(false); }} 
                      className="text-left text-lg font-display font-semibold text-[#302B27] hover:text-[#23493C] transition-colors py-2 flex items-center justify-between cursor-pointer"
                    >
                      <span>{t('catalog')}</span>
                      <ArrowRight className="w-4 h-4 text-[#8B5E34]/50" />
                    </button>
                    <button 
                      onClick={() => { scrollToSection('about'); setMobileMenuOpen(false); }} 
                      className="text-left text-lg font-display font-semibold text-[#302B27] hover:text-[#23493C] transition-colors py-2 flex items-center justify-between cursor-pointer"
                    >
                      <span>{t('artisans')}</span>
                      <ArrowRight className="w-4 h-4 text-[#8B5E34]/50" />
                    </button>
                    <button 
                      onClick={() => { scrollToSection('contact'); setMobileMenuOpen(false); }} 
                      className="text-left text-lg font-display font-semibold text-[#302B27] hover:text-[#23493C] transition-colors py-2 flex items-center justify-between cursor-pointer"
                    >
                      <span>{t('contactUs')}</span>
                      <ArrowRight className="w-4 h-4 text-[#8B5E34]/50" />
                    </button>
                    
                    <div className="pt-2 border-t border-black/5 mt-2">
                       <select 
                        value={language}
                        onChange={(e) => setLanguage(e.target.value as Language)}
                        className="bg-transparent border-none text-xs font-bold text-[#302B27] focus:outline-none focus:ring-0 cursor-pointer pl-0 pr-1 uppercase tracking-wider w-full"
                      >
                        <option value="en">Language: EN</option>
                        <option value="es">Idioma: ES</option>
                        <option value="fr">Langue: FR</option>
                        <option value="de">Sprache: DE</option>
                        <option value="it">Lingua: IT</option>
                      </select>
                    </div>
                  </div>

                  {/* Session management inside mobile viewport */}
                  <div className="flex flex-col space-y-4 pt-2">
                    <span className="text-[10px] uppercase tracking-widest text-[#8B5E34] font-bold pb-1 border-b border-black/5">Administration & Sourcing</span>
                    {user ? (
                      <div className="space-y-4">
                        <div className="text-xs text-[#76736A] font-medium flex items-center space-x-2">
                          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                          <span>Session active : <strong className="text-[#302B27]">{user.user_metadata?.full_name || user.email}</strong></span>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <button
                            onClick={() => { setShowAdmin(!showAdmin); setMobileMenuOpen(false); }}
                            className="flex items-center justify-center space-x-2 py-3 px-4 bg-[#23493C] hover:bg-[#1C3A30] text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-sm cursor-pointer"
                          >
                            <Plus className="w-4 h-4" />
                            <span>{showAdmin ? "Fermer" : "Admin Panel"}</span>
                          </button>
                          <button
                            onClick={() => { handleLogout(); setMobileMenuOpen(false); }}
                            className="flex items-center justify-center space-x-2 py-3 px-4 bg-red-500/15 hover:bg-red-500/20 text-red-700 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
                          >
                            <LogOut className="w-4 h-4" />
                            <span>Déconnexion</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => { handleLogin(); setMobileMenuOpen(false); }}
                        className="w-full py-4 bg-[#23493C] hover:bg-[#1C3A30] text-white rounded-xl text-xs font-semibold uppercase tracking-widest transition-all shadow-md flex items-center justify-center space-x-2"
                      >
                        <LogIn className="w-4 h-4 text-[#DFDAC8]" />
                        <span>Accéder à l'Admin</span>
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </nav>

        {/* Majestic Full-Bleed Hero Section */}
        <section id="hero" className="relative pt-32 pb-24 md:pt-40 md:pb-36 px-6 max-w-7xl mx-auto">
          <div className="relative rounded-[2.5rem] md:rounded-[3.5rem] overflow-hidden bg-[#2D2A24] text-white min-h-[550px] md:min-h-[640px] flex items-center shadow-2xl">
            {/* Background Image with elegant overlay gradient */}
            <div 
              className="absolute inset-0 bg-cover bg-center mix-blend-luminosity opacity-40 transition-transform duration-1000 hover:scale-105"
              style={{ backgroundImage: `url(${heroBg})` }}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/55 to-transparent z-10" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#2D2A24]/60 to-transparent z-10" />

            {/* Content Container */}
            <div className="relative z-20 max-w-3xl px-8 md:px-16 py-12 flex flex-col items-start text-left">
              {/* Subtle upper tag */}
              <div className="inline-flex items-center space-x-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full border border-white/20 text-[#DFDAC8] text-xs font-semibold tracking-wider uppercase mb-6">
                <Sparkles className="w-3 h-3 text-[#E3DCB9]" />
                <span>{t('latamCoffee')}</span>
              </div>

              <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-[4.2rem] font-bold tracking-tight text-white leading-[1.08] mb-6">
                {t('heroTitle').split(' ').map((word, i) => i > 1 ? <span key={i} className="text-[#E3DCB9] font-medium italic"> {word}</span> : <React.Fragment key={i}> {word}</React.Fragment>)}
              </h1>
              
              <p className="max-w-xl text-gray-200 text-base md:text-lg leading-relaxed mb-8">
                {t('heroSubtitle')}
              </p>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-4 sm:space-y-0 sm:space-x-4 w-full">
                <button 
                  onClick={() => scrollToSection('catalogue')}
                  className="px-8 py-4 bg-[#23493C] text-white rounded-2xl font-semibold tracking-wide text-sm hover:bg-[#1C3A30] transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center space-x-2 shadow-lg cursor-pointer"
                >
                  <span>{t('catalog')}</span>
                  <ArrowRight className="w-4 h-4 text-[#DFDAC8]" />
                </button>
                <button 
                  onClick={() => scrollToSection('about')}
                  className="px-8 py-4 bg-white/10 hover:bg-white/15 text-white rounded-2xl font-semibold tracking-wide text-sm transition-all border border-white/10 hover:border-white/30 backdrop-blur-sm flex items-center justify-center space-x-2 cursor-pointer"
                >
                  <span>{t('about')}</span>
                </button>
              </div>

              {/* Startup micro perks block inside hero */}
              <div className="mt-12 pt-8 border-t border-white/10 w-full grid grid-cols-3 gap-4 text-left">
                <div>
                  <div className="text-xl md:text-2xl font-display font-medium text-[#E3DCB9]">100%</div>
                  <div className="text-xs md:text-sm text-gray-300">{t('traceability')}</div>
                </div>
                <div>
                  <div className="text-xl md:text-2xl font-display font-medium text-[#E3DCB9]">{language === 'en' ? 'Direct' : language === 'es' ? 'Directo' : 'Direct'}</div>
                  <div className="text-xs md:text-sm text-gray-300">{t('directToTable')}</div>
                </div>
                <div>
                  <div className="text-xl md:text-2xl font-display font-medium text-[#E3DCB9]">{language === 'es' ? '4 Países' : language === 'en' ? '4 Countries' : '4 Pays'}</div>
                  <div className="text-xs md:text-sm text-gray-300">{t('euLogistics')}</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Main Products Grid Section */}
        <section id="catalogue" className="max-w-7xl mx-auto px-6 pb-28 relative z-10 scroll-mt-24">
          
          {/* Admin Panel Modal Overlay */}
          <AnimatePresence>
            {showAdmin && user && (
              <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="mb-16 max-w-6xl mx-auto w-full"
              >
                <AdminPanel 
                  onProductAdded={() => { fetchProducts(); loadCategories(); }} 
                  user={user}
                  onClose={() => setShowAdmin(false)}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Redesigned Premium Filter Station */}
          <div className="mb-10 p-5 md:p-6 lg:p-7 bg-white/75 backdrop-blur-xl rounded-3xl border border-[#23493C]/10 shadow-md shadow-[#23493C]/5 w-full">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
              
              {/* Location Selector (Territoire d'Origine) */}
              <div className="space-y-2.5">
                <label className="text-[10px] uppercase font-extrabold tracking-widest text-[#8B5E34] flex items-center gap-1.5 font-sans">
                  <MapPin className="w-3.5 h-3.5 text-[#8B5E34]" />
                  <span>{t('originTerritory')}</span>
                </label>
                <div className="relative group">
                  <select
                    value={selectedLocation}
                    onChange={(e) => {
                      setSelectedLocation(e.target.value);
                      scrollToSection('products-list');
                    }}
                    className="w-full appearance-none bg-[#FDFCF7]/90 border border-[#23493C]/15 hover:border-[#23493C]/45 text-[#302B27] rounded-2xl pl-11 pr-10 py-3.5 text-sm font-semibold shadow-xs transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#23493C]/20 focus:border-[#23493C] cursor-pointer"
                  >
                    <option value="all">{t('allTerritories')}</option>
                    {COLOMBIA_DEPARTMENTS.sort((a,b) => a.name.localeCompare(b.name)).map((dept) => (
                      <option key={dept.id} value={dept.id}>
                        {dept.name}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-[#23493C]/75 transition-colors group-hover:text-[#23493C]">
                    <Map className="w-4 h-4" />
                  </div>
                  <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-[#8B5E34]">
                    <ChevronDown className="w-4.5 h-4.5" />
                  </div>
                </div>
              </div>

              {/* Category Filter */}
              <div className="space-y-2.5">
                <label className="text-[10px] uppercase font-extrabold tracking-widest text-[#8B5E34] flex items-center gap-1.5 font-sans">
                  <Layers className="w-3.5 h-3.5 text-[#8B5E34]" />
                  <span>{t('productCategory')}</span>
                </label>
                
                {/* Mobile Dropdown (shown up to md) */}
                <div className="block md:hidden relative group">
                  <select
                    value={selectedCategory}
                    onChange={(e) => {
                      setSelectedCategory(e.target.value);
                      scrollToSection('products-list');
                    }}
                    className="w-full appearance-none bg-[#FDFCF7]/90 border border-[#23493C]/15 hover:border-[#23493C]/45 text-[#302B27] rounded-2xl pl-11 pr-10 py-3.5 text-sm font-semibold shadow-xs transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#23493C]/20 focus:border-[#23493C] cursor-pointer"
                  >
                    <option value="all">{t('allProducts')}</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-[#23493C]/75">
                    <Store className="w-4 h-4" />
                  </div>
                  <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-[#8B5E34]">
                    <ChevronDown className="w-4.5 h-4.5" />
                  </div>
                </div>

                {/* Desktop Tabs (shown on md and above) */}
                <div className="hidden md:flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedCategory('all');
                      scrollToSection('products-list');
                    }}
                    className={`px-4.5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-300 cursor-pointer whitespace-nowrap border ${
                      selectedCategory === 'all'
                        ? 'bg-[#23493C] border-[#23493C] text-white shadow-md shadow-[#23493C]/15 scale-[1.02]'
                        : 'bg-white hover:bg-[#FDFCF7] border-gray-200 text-[#76736A] hover:text-[#302B27] hover:border-gray-300'
                    }`}
                  >
                    {t('allProducts')}
                  </button>
                  {categories.map((cat) => {
                    const isActive = selectedCategory === cat.id;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => {
                          setSelectedCategory(cat.id);
                          scrollToSection('products-list');
                        }}
                        className={`px-4.5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-300 cursor-pointer whitespace-nowrap border ${
                          isActive 
                            ? 'bg-[#23493C] border-[#23493C] text-white shadow-md shadow-[#23493C]/15 scale-[1.02]' 
                            : 'bg-white hover:bg-[#FDFCF7] border-gray-200 text-[#76736A] hover:text-[#302B27] hover:border-gray-300'
                        }`}
                      >
                        {cat.name}
                      </button>
                    );
                  })}
                </div>
              </div>

            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start">
            
            {/* Left Frame: Coffee & Artisanal Catalogue */}
            <div id="products-list" className="space-y-8 order-2 lg:order-1 scroll-mt-24">
              
              {/* Mobile country selector placeholder wrapper */}
              <div className="md:hidden flex items-center justify-between bg-white/50 border border-white/80 rounded-3xl p-4 shadow-sm mb-6">
                <div className="flex items-center space-x-2">
                  <Map className="w-4 h-4 text-[#8B5E34]" />
                  <span className="text-sm font-semibold text-[#302B27]">{t('deliveryCountry')}</span>
                </div>
                <select 
                  value={deliveryCountry}
                  onChange={(e) => handleSetDeliveryCountry(e.target.value)}
                  className="bg-transparent border-none text-sm font-semibold text-[#302B27] focus:outline-none focus:ring-0 cursor-pointer"
                >
                  {COUNTRIES.map(c => (
                    <option key={c.code} value={c.code}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-between pb-6 border-b border-[#23493C]/10">
                <div>
                  <h2 className="font-display text-3xl font-semibold text-[#302B27] tracking-tight">{t('ourSelection')}</h2>
                  <p className="text-sm text-[#76736A] mt-1">{t('priceVariationMsg')}</p>
                </div>
                <span className="px-3.5 py-1 bg-[#23493C]/5 text-[#23493C] text-xs font-bold uppercase rounded-full tracking-wider">
                  {filteredProducts.length} {t('wonders')}
                </span>
              </div>

              {/* Banner removed to prevent duplication with ColombiaMap story panel */}


              {loading ? (
                <div className="py-24 flex justify-center">
                  <div className="w-10 h-10 border-4 border-[#23493C]/10 border-t-[#23493C] rounded-full animate-spin" />
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="py-16 flex flex-col items-center justify-center text-center bg-white/40 backdrop-blur-xl rounded-3xl border border-white/60 shadow-sm px-6">
                  <div className="w-14 h-14 bg-white/50 rounded-full flex items-center justify-center mb-4">
                    <Sparkles className="w-7 h-7 text-[#8B5E34]" />
                  </div>
                  <h3 className="text-lg font-semibold text-[#302B27] mb-1">{t('noTreasuresTitle')}</h3>
                  <p className="text-sm text-[#76736A] mb-6 max-w-md">{t('noTreasuresDesc')}</p>
                  <button 
                    onClick={handleSeed}
                    className="px-5 py-3 bg-[#23493C] hover:bg-[#1C3A30] text-white text-xs font-medium uppercase tracking-wider rounded-xl hover:shadow transition-all flex items-center justify-center space-x-2"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{t('generateSamples')}</span>
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-8">
                  {filteredProducts.map((product) => (
                    <div 
                      key={product.id} 
                      onClick={() => setSelectedProduct(product)}
                      className="transform hover:scale-[1.01] transition-all cursor-pointer"
                    >
                      <ProductCard
                        product={product}
                        isActive={activeDepartment === product.departmentCode}
                        deliveryCountry={deliveryCountry}
                        onMouseEnter={() => setActiveDepartment(product.departmentCode)}
                        onMouseLeave={() => setActiveDepartment(null)}
                        onLocationClick={(deptCode) => {
                          setSelectedLocation(deptCode);
                          // Smooth scroll directly to the listing
                          const el = document.getElementById('products-list');
                          if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        }}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Right Frame: Interactive Sourcing Origin Map */}
            <div className="order-1 lg:order-2 lg:sticky lg:top-28 relative z-10 pt-2 lg:pt-0">
              <div className="absolute inset-0 bg-[#23493C]/5 blur-3xl -z-10 rounded-full" />
              <div className="bg-white/70 backdrop-blur-2xl p-4 sm:p-8 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-white/80">
                <ColombiaMap 
                  activeDepartmentId={selectedLocation !== 'all' ? selectedLocation : activeDepartment} 
                  onSelectDepartment={(dept) => {
                    if (dept) {
                      setSelectedLocation(dept);
                    } else {
                      setSelectedLocation('all');
                    }
                  }}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Brand Philosophy (Who we are) Section */}
        <section id="about" className="bg-[#EFEBE0]/60 backdrop-blur py-24 px-6 border-y border-[#23493C]/5 scroll-mt-20">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
              
              {/* Left Column Description */}
              <div className="lg:col-span-5 space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-white p-1 shadow-md border border-white/50 flex items-center justify-center shrink-0">
                    <img 
                      src={brandLogo} 
                      alt="Logo Papagayo" 
                      className="w-full h-full object-contain" 
                    />
                  </div>
                  <div>
                    <h3 className="text-xl font-display font-bold text-[#302B27]">Papagayo Sourcing</h3>
                    <p className="text-[10px] text-[#23493C] uppercase tracking-wider font-extrabold">{t('guaranteedQuality')}</p>
                  </div>
                </div>

                <div className="inline-flex items-center space-x-2 px-3 py-1 bg-[#23493C]/5 text-[#23493C] rounded-full text-xs font-semibold uppercase tracking-wider">
                  <Feather className="w-3 h-3 text-[#23493C]" />
                  <span>{t('aboutPills')}</span>
                </div>
                <h2 className="font-display text-4xl lg:text-5xl font-bold tracking-tight text-[#302B27] leading-tight">
                  {t('aboutTitle1')}<br />
                  <span className="text-[#8B5E34]">{t('aboutTitle2')}</span>
                </h2>
                <blockquote className="border-l-4 border-[#23493C] pl-4 italic text-lg text-[#302B27] font-medium leading-relaxed my-4">
                  {t('aboutQuote')}
                </blockquote>
                <p className="text-base text-[#76736A] leading-relaxed">
                  {language === 'es' ? 'Trabajamos directamente junto a artesanos, comunidades indígenas y productores de café colombiano para ofrecer piezas únicas y cafés de origen que llevan la voz de quienes los crean. Cada objeto cuenta una historia. Cada taza expresa un territorio. Cada colaboración construye un puente entre culturas.' : 
                   language === 'en' ? 'We work directly alongside artisans, indigenous communities, and Colombian coffee producers to offer unique pieces and origin coffees that carry the voice of those who create them. Every object tells a story. Every cup expresses a territory. Every collaboration builds a bridge between cultures.' :
                   'Nous travaillons directement aux côtés d’artisans, de communautés autochtones et de producteurs de café colombien afin de proposer des pièces uniques et des cafés d’origine qui portent la voix de celles et ceux qui les créent. Chaque objet raconte une histoire. Chaque tasse exprime un territoire. Chaque collaboration construit un pont entre les cultures.'}
                </p>
                <p className="text-base text-[#76736A] leading-relaxed">
                  {language === 'es' ? 'Nuestro café se cultiva en las montañas de Colombia por familias productoras que transmiten su saber y pasión de generación en generación. Nuestras creaciones artesanales reflejan la identidad, la memoria y la riqueza cultural de los pueblos que las moldean a mano, preservando técnicas y conocimientos ancestrales.' : 
                   language === 'en' ? 'Our coffee is grown in the mountains of Colombia by producing families who transmit their know-how and passion from generation to generation. Our artisanal creations reflect the identity, memory, and cultural wealth of the peoples who shape them by hand, preserving ancestral techniques and knowledge.' :
                   'Notre café est cultivé dans les montagnes de Colombie par des familles de producteurs qui transmettent leur savoir-faire et leur passion de génération en génération. Nos créations artisanales reflètent l’identité, la mémoire et la richesse culturelle des peuples qui les façonnent à la main, en préservant des techniques et des connaissances ancestrales.'}
                </p>
                <p className="text-base text-[#76736A] leading-relaxed">
                  {language === 'es' ? 'Porque creemos que las personas deben estar tan presentes como los productos que ofrecen al mundo. Más que productos, compartimos historias, tradiciones y el vínculo humano que les da vida.' : 
                   language === 'en' ? 'Because we believe that people should be as present as the products they offer to the world. More than products, we share stories, traditions, and the human connection that gives them life.' :
                   'Parce que nous croyons que les personnes doivent être aussi présentes que les produits qu’elles offrent au monde. Plus que des produits, nous partageons des histoires, des traditions et le lien humain qui leur donne naissance.'}
                </p>
                
                <div className="flex items-center space-x-6 pt-2">
                  <div className="flex items-center space-x-2">
                    <ShieldCheck className="w-6 h-6 text-[#23493C]" />
                    <span className="text-xs font-bold text-[#302B27] uppercase tracking-wider">{language === 'es' ? 'Comercio Justo' : language === 'en' ? 'Fair Trade' : 'Commerce Équitable'}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Heart className="w-6 h-6 text-[#8B5E34]" />
                    <span className="text-xs font-bold text-[#302B27] uppercase tracking-wider">{language === 'es' ? '100% Hecho a Mano' : language === 'en' ? '100% Handmade' : '100% Fait Main'}</span>
                  </div>
                </div>
              </div>

              {/* Right Column Bento Philosophy */}
              <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-6">
                
                {/* Bento Card 1 */}
                <div className="bg-white/60 backdrop-blur p-8 rounded-3xl border border-white/80 shadow-sm transition-all duration-300 hover:shadow-md">
                  <div className="w-12 h-12 rounded-2xl bg-[#23493C]/5 flex items-center justify-center mb-6">
                    <Coffee className="w-6 h-6 text-[#23493C]" />
                  </div>
                  <h3 className="font-display text-xl font-semibold text-[#302B27] mb-2">{language === 'es' ? 'Microlotes Raros' : language === 'en' ? 'Rare Micro-Lots' : 'Micro-Lots Rares'}</h3>
                  <p className="text-sm text-[#76736A] leading-relaxed">
                     {language === 'es' ? 'Cafés seleccionados con puntuación en taza superior a 84+, tostados frescos en pequeñas cantidades para mantener una intensidad aromática nativa impecable.' : language === 'en' ? 'Coffees selected with a cup score above 84+, freshly roasted in small batches to preserve impeccable native aromatic intensity.' : 'Des cafés sélectionnés par score de tasse supérieure à 84+, fraîchement torréfiés par petites quantités en France pour garder une intensité aromatique native impeccable.'}
                  </p>
                </div>

                {/* Bento Card 2 */}
                <div className="bg-white/60 backdrop-blur p-8 rounded-3xl border border-white/80 shadow-sm transition-all duration-300 hover:shadow-md">
                  <div className="w-12 h-12 rounded-2xl bg-[#8B5E34]/5 flex items-center justify-center mb-6">
                    <Feather className="w-6 h-6 text-[#8B5E34]" />
                  </div>
                  <h3 className="font-display text-xl font-semibold text-[#302B27] mb-2">{language === 'es' ? 'Artesanía Wayuu & Zenú' : language === 'en' ? 'Wayuu & Zenú Crafts' : 'Artisanat Wayuu & Zenú'}</h3>
                  <p className="text-sm text-[#76736A] leading-relaxed">
                     {language === 'es' ? 'Mochilas tejidas a crochet o sombreros trenzados por mujeres indígenas de las comunidades Wayuu del desierto guajiro o Zenú de Córdoba, sellados para preservar la identidad.' : language === 'en' ? 'Crocheted Mochila bags or woven hats by indigenous women from the Wayuu communities of the Guajiro desert or Zenú from Córdoba, signed to preserve identity.' : 'Sacs Mochila en crochet ou chapeaux tressés par des femmes autochtones des communautés Wayuu du désert guajiro ou Zenú de Córdoba, signés pour préserver l\'identité.'}
                  </p>
                </div>

                {/* Bento Card 3 */}
                <div className="bg-white/60 backdrop-blur p-8 rounded-3xl border border-white/80 shadow-sm transition-all duration-300 hover:shadow-md">
                  <div className="w-12 h-12 rounded-2xl bg-[#23493C]/5 flex items-center justify-center mb-6">
                    <Map className="w-6 h-6 text-[#23493C]" />
                  </div>
                  <h3 className="font-display text-xl font-semibold text-[#302B27] mb-2">{language === 'es' ? 'GPS de Origen Integrado' : language === 'en' ? 'Integrated Origin GPS' : 'GPS d\'Origine Intégré'}</h3>
                  <p className="text-sm text-[#76736A] leading-relaxed">
                     {language === 'es' ? 'Nuestro concepto interactivo permite asociar cada lote a su departamento colombo-originario. Visualiza el origen exacto de un vistazo en la pantalla.' : language === 'en' ? 'Our interactive concept associates each lot with its native Colombian department. Visualize the exact origin at a glance on the screen.' : 'Notre concept interactif permet d’associer chaque lot à son département colombo-originaire. Visualisez l’origine exacte d\'un coup d’œil sur l\'écran.'}
                  </p>
                </div>

                {/* Bento Card 4 */}
                <div className="bg-white/60 backdrop-blur p-8 rounded-3xl border border-white/80 shadow-sm transition-all duration-300 hover:shadow-md">
                  <div className="w-12 h-12 rounded-2xl bg-[#8B5E34]/5 flex items-center justify-center mb-6">
                    <Globe className="w-6 h-6 text-[#8B5E34]" />
                  </div>
                  <h3 className="font-display text-xl font-semibold text-[#302B27] mb-2">{language === 'es' ? 'Precios Transparentes' : language === 'en' ? 'Transparent Country Pricing' : 'Tarification de Pays transparente'}</h3>
                  <p className="text-sm text-[#76736A] leading-relaxed">
                     {language === 'es' ? 'Como colaboramos con centros logísticos locales, el precio final se adapta según las aduanas, impuestos y tarifas postales del país elegido.' : language === 'en' ? 'Since we collaborate with local logistics hubs, the final price adapts according to customs, taxes, and postal rates of the selected country.' : 'Puisque nous collaborons avec des hubs logistiques locaux, le prix final s\'adapte selon la douane locale, les taxes routières et les tarifs postaux du pays choisi.'}
                  </p>
                </div>

              </div>
            </div>
          </div>
        </section>

        {/* Contact Form Section */}
        <section id="contact" className="py-20 px-6 max-w-7xl mx-auto scroll-mt-24">
          <RequestForm key={prefilledProductQuery} initialProduct={prefilledProductQuery} />
        </section>

        {/* Beautiful Footer */}
        <footer className="bg-[#2D2A24] text-gray-300 pt-20 pb-12 px-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-tr from-black/10 via-transparent to-transparent pointer-events-none" />
          
          <div className="max-w-7xl mx-auto relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 lg:gap-8 pb-16 border-b border-white/10">
              
              {/* Brand Column */}
              <div className="lg:col-span-2 space-y-6">
                <span className="font-display font-semibold text-3xl tracking-tight text-white block">
                  Papagayo<span className="text-[#DFDAC8]">.</span>
                </span>
                <p className="text-sm text-gray-400 max-w-sm leading-relaxed">
                  {language === 'es' ? 'La excelencia colombiana a tu alcance. Descubre una rigurosa selección de productos gastronómicos y artesanales importados directamente desde Sudamérica.' : language === 'en' ? 'Colombian excellence at your fingertips. Discover a rigorous selection of premium gastronomic and artisanal products imported directly from South America.' : 'L\'excellence colombienne à portée de main. Découvrez une sélection rigoureuse de produits gastronomiques et artisanaux importés directement d\'Amérique du Sud.'}
                </p>
                <div className="flex items-center space-x-3 text-xs bg-white/5 border border-white/10 rounded-2xl px-3.5 py-2 w-max">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <span>{language === 'es' ? 'Logística activa para Europa' : language === 'en' ? 'Logistics active for Europe' : 'Logistique active pour toute l\'Europe'}</span>
                </div>
              </div>

              {/* Navigation Column */}
              <div>
                <h4 className="font-display text-white text-sm font-semibold uppercase tracking-wider mb-6">{t('catalog')}</h4>
                <ul className="space-y-4 text-sm">
                  <li><button onClick={() => scrollToSection('catalogue')} className="hover:text-white transition-colors">{language === 'es' ? 'Café de especialidad' : language === 'en' ? 'Specialty Coffee' : 'Café de spécialité'}</button></li>
                  <li><button onClick={() => scrollToSection('catalogue')} className="hover:text-white transition-colors">{language === 'es' ? 'Artesanía Wayuu' : language === 'en' ? 'Wayuu Crafts' : 'Artisanat Wayuu'}</button></li>
                  <li><button onClick={() => scrollToSection('catalogue')} className="hover:text-white transition-colors">{language === 'es' ? 'Chocolates finos' : language === 'en' ? 'Fine Chocolates' : 'Chocolats fins'}</button></li>
                </ul>
              </div>

              {/* Sourcing Origin Links Column */}
              <div>
                <h4 className="font-display text-white text-sm font-semibold uppercase tracking-wider mb-6">{language === 'es' ? 'Departamentos' : language === 'en' ? 'Departments' : 'Départements'}</h4>
                <ul className="space-y-4 text-sm text-gray-400">
                  <li><span className="hover:text-white cursor-pointer transition-colors" onClick={() => { setActiveDepartment('CO-QUI'); scrollToSection('catalogue'); }}>Quindío (Café)</span></li>
                  <li><span className="hover:text-white cursor-pointer transition-colors" onClick={() => { setActiveDepartment('CO-LAG'); scrollToSection('catalogue'); }}>La Guajira (Wayuu)</span></li>
                  <li><span className="hover:text-white cursor-pointer transition-colors" onClick={() => { setActiveDepartment('CO-VAC'); scrollToSection('catalogue'); }}>Valle del Cauca (Cacao)</span></li>
                  <li><span className="hover:text-white cursor-pointer transition-colors" onClick={() => { setActiveDepartment('CO-COR'); scrollToSection('catalogue'); }}>Córdoba (Filigrane)</span></li>
                </ul>
              </div>

              {/* Premium Contact / Sourcing Info Column */}
              <div>
                <h4 className="font-display text-white text-sm font-semibold uppercase tracking-wider mb-6">Contact & Sourcing</h4>
                <ul className="space-y-4 text-sm">
                  <li className="text-gray-400">{t('footerLogisticsHub')} <span className="text-white">Paris-Bercy, France</span></li>
                  <li className="text-gray-400">{t('footerProducers')} <span className="text-white">Medellín & Cali, CO</span></li>
                  <li><a href="mailto:hola@papagayo-direct.com" className="hover:text-white text-[#DFDAC8] border-b border-dashed border-[#DFDAC8]/40 pb-0.5 transition-colors">hola@papagayo-direct.com</a></li>
                </ul>
              </div>

            </div>

            {/* Bottom Credits Block */}
            <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-500">
              <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-6 text-center sm:text-left">
                <span>{t('footerRights')}</span>
                <span className="hidden sm:inline text-white/5">|</span>
                <span className="hover:text-white transition-colors cursor-pointer">{t('footerTerms')}</span>
                <span className="hidden sm:inline text-white/5">|</span>
                <span className="hover:text-white transition-colors cursor-pointer">{t('footerPrivacy')}</span>
              </div>
              
              <div className="mt-4 sm:mt-0 font-mono text-[10px] tracking-widest text-[#E3DCB9]/40 flex items-center space-x-1 uppercase">
                <Coffee className="w-3 h-3 text-[#E3DCB9]/30 mr-1" />
                <span>{t('footerCreated')}</span>
              </div>
            </div>

          </div>
        </footer>

      </>
     )}

        {/* Modern Admin Login Selection Modal */}
        <AnimatePresence>
          {showLoginModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-[#F9F7F2] rounded-[2.5rem] p-8 max-w-md w-full border border-white/60 shadow-2xl relative text-center"
              >
                {/* Close Button */}
                <button
                  onClick={() => setShowLoginModal(false)}
                  className="absolute top-6 right-6 p-2 rounded-full hover:bg-[#302B27]/10 text-[#302B27] transition-all cursor-pointer"
                  aria-label="Cerrar"
                >
                  <Plus className="w-5 h-5 rotate-45" />
                </button>

                <div className="w-16 h-16 bg-[#23493C]/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Heart className="w-8 h-8 text-[#23493C]" />
                </div>

                <h3 className="font-display text-2xl font-bold text-[#302B27] tracking-tight mb-2">{t('adminAccess')}</h3>
                <p className="text-xs text-[#76736A] leading-relaxed mb-5">
                  {language === 'es' ? 'Inicia sesión con tus credenciales o usa el modo de demostración para acceder al panel de Papagayo.' : language === 'en' ? 'Log in with your credentials or use demo mode to access the Papagayo dashboard.' : 'Connectez-vous avec vos identifiants ou utilisez le mode démo pour accéder au tableau de bord Papagayo.'}
                </p>

                {/* Email / Password Form */}
                <form onSubmit={handleEmailPasswordLogin} className="space-y-4 text-left mb-6">
                  <div>
                    <label className="block text-[10px] font-bold text-[#302B27] uppercase tracking-wider mb-1 flex items-center">
                      <Mail className="w-3 h-3 mr-1 text-[#23493C]" />
                      <span>{t('email')}</span>
                    </label>
                    <input 
                      type="email"
                      required
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="jrozog97@gmail.com"
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#23493C]/20 focus:border-[#23493C] transition-all bg-white text-base md:text-xs text-[#302B27]"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-[#302B27] uppercase tracking-wider mb-1 flex items-center">
                      <Lock className="w-3 h-3 mr-1 text-[#23493C]" />
                      <span>{t('password')}</span>
                    </label>
                    <input 
                      type="password"
                      required
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="••••••"
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#23493C]/20 focus:border-[#23493C] transition-all bg-white text-base md:text-xs text-[#302B27]"
                    />
                  </div>

                  {authError && (
                    <div className="text-xs text-red-600 bg-red-50 p-2.5 rounded-xl border border-red-100 font-medium leading-tight">
                      {authError}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={authLoading}
                    className="w-full py-3 px-6 bg-[#23493C] hover:bg-[#1C3A30] text-white font-semibold text-xs rounded-xl shadow-md transition-all active:scale-[0.98] flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-75"
                  >
                    <span>{authLoading ? (language === 'es' ? "Iniciando..." : language === 'en' ? "Connecting..." : "Connexion...") : t('login')}</span>
                  </button>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Apple-style Product Detail Immersive Modal */}
        <AnimatePresence>
          {selectedProduct && (
            <ProductDetailModal
              product={selectedProduct}
              deliveryCountry={deliveryCountry}
              onClose={() => setSelectedProduct(null)}
              onSelectProductInquiry={(productName) => {
                setSelectedProduct(null);
                setPrefilledProductQuery(`Je souhaiterais obtenir plus de renseignements / importer le produit : ${productName}`);
                setTimeout(() => {
                  scrollToSection('contact');
                }, 100);
              }}
            />
          )}
        </AnimatePresence>

      </div>
    </>
  );
}


