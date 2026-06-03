/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { supabase } from './supabase';
import { Product, Category } from './types';
import { AdminPanel } from './components/AdminPanel';
import { ColombiaMap } from './components/ColombiaMap';
import { ProductCard } from './components/ProductCard';
import { ProductDetailModal } from './components/ProductDetailModal';
import { RequestForm } from './components/RequestForm';
import { LogIn, LogOut, Plus, Sparkles, Map, Coffee, Heart, ArrowRight, ShieldCheck, Globe, ChevronDown, Feather, Menu, X, Mail, Lock, FolderHeart, Eye, Store, Layers, Settings } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Helmet } from 'react-helmet-async';
import { seedDatabase } from './seedData';
import heroBg from './assets/images/hero_colombian_bg_1780435795591.png';
import brandLogo from './assets/images/papagayo_colombia_logo_png_1780438656342.png';

const COUNTRIES = [
  { code: 'FR', name: 'France' },
  { code: 'ES', name: 'España' },
  { code: 'DE', name: 'Deutschland' },
  { code: 'IT', name: 'Italia' },
];

export default function App() {
  const [products, setProducts] = useState<Product[]>([]);
  const [activeDepartment, setActiveDepartment] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [showAdmin, setShowAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Immersive Product details and Category filter states
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [categories, setCategories] = useState<Category[]>([]);
  const [prefilledProductQuery, setPrefilledProductQuery] = useState('');
  const [deliveryCountry, setDeliveryCountry] = useState('FR');
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('createdAt', { ascending: false });
        
      if (!error && data) {
        const dbProds = data as Product[];
        const combined = [...dbProds];
        localProds.forEach((lp) => {
          if (!combined.some(dp => dp.id === lp.id)) {
            combined.unshift(lp); // Put newly created/local products at the start of the list
          }
        });
        setProducts(combined);
      } else {
        if (error) {
          console.warn("Supabase load products error: ", error);
        }
        setProducts(localProds);
      }
    } catch (err) {
      console.warn(err);
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
    } else {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          setUser(session.user);
        }
      });
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const demoNow = localStorage.getItem('papagayo_demo_mode') === 'true';
      if (!demoNow && session?.user) {
        setUser(session.user);
      }
    });

    fetchProducts();
    loadCategories();

    return () => {
      subscription.unsubscribe();
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
      let { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password: loginPassword,
      });

      // Si c'est un compte admin spécifique et qu'il n'existe pas encore, on le crée
      const isAdminBypass = (loginEmail === 'colpapagayo@gmail.com' && loginPassword === 'Papagayo2026') || 
                          (loginEmail === 'jrozog97@gmail.com' && loginPassword === '123456');

      if (signInError && isAdminBypass) {
        if (
          signInError.message.includes('Invalid login credentials') || 
          signInError.message.includes('not found') ||
          signInError.message.includes('Email not confirmed')
        ) {
          const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
            email: loginEmail,
            password: loginPassword,
            options: {
              data: {
                full_name: loginEmail === 'jrozog97@gmail.com' ? 'Juan Admin' : 'Admin Papagayo',
              }
            }
          });
          if (!signUpError && signUpData?.user) {
            signInData = signUpData;
            signInError = null as any;
          }
        }
      }

      if (signInError) {
        throw signInError;
      }

      if (signInData?.user) {
        setUser(signInData.user);
        setShowLoginModal(false);
        setShowAdmin(true);
        alert("¡Sesión iniciada!");
      }
    } catch (err: any) {
      console.warn("Supabase auth error:", err?.message || err);
      
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
    await supabase.auth.signOut();
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
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const filteredProducts = products.filter(product => {
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
        <html lang="fr" />
        <title>Papagayo | Importateur et Sourcing Direct de Trésors Colombiens</title>
        <meta name="description" content="Papagayo importe les meilleurs cafés de spécialité, art et produits de Colombie pour toute l'Europe (France, Espagne, Allemagne, etc). Découvrez l'essence de la Colombie." />
        <meta name="keywords" content="café colombien, importation colombie, produits de colombie, café de spécialité, artisanat colombien, Papagayo, achat de café, europe colombien, mochila wayuu, cacao de colombie" />
        <meta property="og:title" content="Papagayo | Sourcing Colombien Rigoureux & Import Direct" />
        <meta property="og:description" content="Découvrez une sélection exclusive de café de spécialité et produits artisanaux importés directement de Colombie, disponibles à la livraison partout en Europe." />
        <meta property="og:locale" content="fr_FR" />
        <meta property="og:locale:alternate" content="en_GB" />
        <meta property="og:locale:alternate" content="es_ES" />
        <meta property="og:locale:alternate" content="de_DE" />
        <link rel="canonical" href="https://papagayo.com" />
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
                      className="w-full h-full rounded-lg object-cover" 
                    />
                  </div>
                  <div>
                    <h1 className="font-display font-extrabold text-[#FAF8F5] text-xl tracking-tight leading-none flex items-center gap-1.5 flex-wrap text-left">
                      <span>Papagayo Direct</span>
                      <span className="text-[9px] font-sans font-black tracking-widest bg-amber-500 text-black px-2 py-0.5 rounded-full">SYSTEM</span>
                    </h1>
                    <p className="text-[10px] text-gray-300 mt-0.5 text-left">Control de Inventario de Origen & Tarifarios Comunitarios</p>
                  </div>
                </div>

                {/* Profile detail & Active Mode Info Widget */}
                <div className="flex flex-wrap items-center gap-3 md:gap-4 self-stretch md:self-auto justify-between sm:justify-start">
                  <div className="flex items-center bg-black/15 border border-white/5 rounded-2xl px-3.5 py-1.5 gap-2.5">
                    <div className="w-2.5 h-2.5 bg-green-400 rounded-full animate-pulse" />
                    <div className="text-left leading-none font-sans">
                      <div className="text-[9px] uppercase font-bold text-gray-300">Administrateur</div>
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
                      <span>Voir le site client</span>
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
                    <div className="text-[10px] uppercase font-bold text-gray-500 tracking-wider text-left">Catalogue Actif</div>
                    <div className="text-base sm:text-xl font-bold font-display text-[#302B27] mt-0.5 text-left">{products.length} Trésors</div>
                  </div>
                </div>

                <div className="bg-white/70 backdrop-blur p-3.5 sm:p-5 rounded-2xl border border-white/95 shadow-2xs flex items-center space-x-3.5">
                  <div className="w-10 h-10 rounded-xl bg-[#8B5E34]/10 flex items-center justify-center text-[#8B5E34] shrink-0">
                    <Globe className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-[10px] uppercase font-bold text-gray-500 tracking-wider text-left">Livrables Europe</div>
                    <div className="text-base sm:text-xl font-bold font-display text-[#302B27] mt-0.5 text-left">{COUNTRIES.length} Pays</div>
                  </div>
                </div>

                <div className="bg-white/70 backdrop-blur p-3.5 sm:p-5 rounded-2xl border border-white/95 shadow-2xs flex items-center space-x-3.5 col-span-1">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700 shrink-0">
                    <Layers className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-[10px] uppercase font-bold text-gray-500 tracking-wider text-left">Catégories</div>
                    <div className="text-base sm:text-xl font-bold font-display text-[#302B27] mt-0.5 text-left">{categories.length} En Place</div>
                  </div>
                </div>

                <div className="bg-white/70 backdrop-blur p-3.5 sm:p-5 rounded-2xl border border-white/95 shadow-2xs flex items-center space-x-3.5 col-span-1">
                  <div className="w-10 h-10 rounded-xl bg-[#23493C]/10 flex items-center justify-center text-[#23493C] shrink-0">
                    <Settings className="w-5 h-5 animate-spin-slow" />
                  </div>
                  <div>
                    <div className="text-[10px] uppercase font-bold text-gray-500 tracking-wider text-left">Mode Système</div>
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
                  className="w-10 h-10 rounded-full object-cover border border-[#23493C]/10 bg-white/80 p-0.5 group-hover:scale-105 transition-all shadow-xs" 
                />
                <span className="font-display font-semibold text-2xl tracking-tight text-[#23493C]">
                  Papagayo<span className="text-[#8B5E34]">.</span>
                </span>
              </div>
              
              <div className="hidden md:flex items-center space-x-6 text-sm font-medium text-[#76736A]">
                <button onClick={() => scrollToSection('catalogue')} className="hover:text-[#23493C] transition-colors">Le Catalogue</button>
                <button onClick={() => scrollToSection('about')} className="hover:text-[#23493C] transition-colors">Notre Démarche</button>
                <button onClick={() => scrollToSection('contact')} className="hover:text-[#23493C] transition-colors">Suggérer un Produit</button>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Country Selector with beautiful modern aesthetic */}
              <div className="hidden md:flex items-center bg-white/60 border border-white/80 rounded-full px-3.5 py-1.5 shadow-[0_2px_12px_rgba(0,0,0,0.02)] hover:bg-white/95 transition-all">
                <Globe className="w-4 h-4 text-[#8B5E34] mr-2" />
                <select 
                  value={deliveryCountry}
                  onChange={(e) => setDeliveryCountry(e.target.value)}
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
                      <span>Nouveau</span>
                    </button>
                    <button
                      onClick={handleLogout}
                      className="p-2 text-[#76736A] hover:bg-black/5 rounded-full transition-colors"
                      aria-label="Logout"
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
                    <span>Admin</span>
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
                    <span className="text-[10px] uppercase tracking-widest text-[#8B5E34] font-bold pb-1 border-b border-black/5">Pays de livraison</span>
                    <div className="flex items-center bg-white/80 border border-black/10 rounded-xl px-3 py-1 w-full shadow-sm">
                      <Globe className="w-4 h-4 text-[#8B5E34] mr-2" />
                      <select 
                        value={deliveryCountry}
                        onChange={(e) => setDeliveryCountry(e.target.value)}
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
                    <span className="text-[10px] uppercase tracking-widest text-[#8B5E34] font-bold pb-1 border-b border-black/5">Navigation Directe</span>
                    <button 
                      onClick={() => { scrollToSection('catalogue'); setMobileMenuOpen(false); }} 
                      className="text-left text-lg font-display font-semibold text-[#302B27] hover:text-[#23493C] transition-colors py-2 flex items-center justify-between cursor-pointer"
                    >
                      <span>Le Catalogue</span>
                      <ArrowRight className="w-4 h-4 text-[#8B5E34]/50" />
                    </button>
                    <button 
                      onClick={() => { scrollToSection('about'); setMobileMenuOpen(false); }} 
                      className="text-left text-lg font-display font-semibold text-[#302B27] hover:text-[#23493C] transition-colors py-2 flex items-center justify-between cursor-pointer"
                    >
                      <span>Notre Démarche</span>
                      <ArrowRight className="w-4 h-4 text-[#8B5E34]/50" />
                    </button>
                    <button 
                      onClick={() => { scrollToSection('contact'); setMobileMenuOpen(false); }} 
                      className="text-left text-lg font-display font-semibold text-[#302B27] hover:text-[#23493C] transition-colors py-2 flex items-center justify-between cursor-pointer"
                    >
                      <span>Suggérer un Produit</span>
                      <ArrowRight className="w-4 h-4 text-[#8B5E34]/50" />
                    </button>
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
        <section className="relative pt-32 pb-24 md:pt-40 md:pb-36 px-6 max-w-7xl mx-auto">
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
                <span>Sourcing direct de Colombie</span>
              </div>

              <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-[4.2rem] font-bold tracking-tight text-white leading-[1.08] mb-6">
                Café d'exception & Art colombien.<br />
                <span className="text-[#E3DCB9] font-medium italic">Importation éthique.</span>
              </h1>
              
              <p className="max-w-xl text-gray-200 text-base md:text-lg leading-relaxed mb-8">
                Bypassez les intermédiaires de distribution. Papagayo source rigoureusement des grains de haute altitude et des pièces d’art directement auprès de communautés locales colombiennes, pour les distribuer partout en Europe.
              </p>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-4 sm:space-y-0 sm:space-x-4 w-full">
                <button 
                  onClick={() => scrollToSection('catalogue')}
                  className="px-8 py-4 bg-[#23493C] text-white rounded-2xl font-semibold tracking-wide text-sm hover:bg-[#1C3A30] transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center space-x-2 shadow-lg cursor-pointer"
                >
                  <span>Explorer le catalogue</span>
                  <ArrowRight className="w-4 h-4 text-[#DFDAC8]" />
                </button>
                <button 
                  onClick={() => scrollToSection('about')}
                  className="px-8 py-4 bg-white/10 hover:bg-white/15 text-white rounded-2xl font-semibold tracking-wide text-sm transition-all border border-white/10 hover:border-white/30 backdrop-blur-sm flex items-center justify-center space-x-2 cursor-pointer"
                >
                  <span>Notre philosophie</span>
                </button>
              </div>

              {/* Startup micro perks block inside hero */}
              <div className="mt-12 pt-8 border-t border-white/10 w-full grid grid-cols-3 gap-4 text-left">
                <div>
                  <div className="text-xl md:text-2xl font-display font-medium text-[#E3DCB9]">100%</div>
                  <div className="text-xs md:text-sm text-gray-300">Traçabilité Origine</div>
                </div>
                <div>
                  <div className="text-xl md:text-2xl font-display font-medium text-[#E3DCB9]">Direct</div>
                  <div className="text-xs md:text-sm text-gray-300">Producteur-Table</div>
                </div>
                <div>
                  <div className="text-xl md:text-2xl font-display font-medium text-[#E3DCB9]">4 Pays</div>
                  <div className="text-xs md:text-sm text-gray-300">Hub logistique UE</div>
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

          {/* Apple style Category filtering tabs above Catalogue Section */}
          <div className="mb-10 max-w-3xl">
            <span className="text-[10px] uppercase font-extrabold tracking-widest text-[#8B5E34] block mb-2 font-display">Filtrer par Catégorie de Trésors</span>
            <div className="flex items-center gap-2 overflow-x-auto pb-3 scrollbar-none">
              <button
                type="button"
                onClick={() => {
                  setSelectedCategory('all');
                  scrollToSection('catalogue');
                }}
                className={`px-4.5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap border ${
                  selectedCategory === 'all'
                    ? 'bg-[#23493C] border-[#23493C] text-white shadow-md shadow-[#23493C]/25 scale-102'
                    : 'bg-white/70 border-gray-200 text-[#76736A] hover:bg-white hover:text-[#302B27]'
                }`}
              >
                Tous les Trésors
              </button>
              {categories.map((cat) => {
                const isActive = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => {
                      setSelectedCategory(cat.id);
                      scrollToSection('catalogue');
                    }}
                    className={`px-4.5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap border ${
                      isActive 
                        ? 'bg-[#23493C] border-[#23493C] text-white shadow-md shadow-[#23493C]/25 scale-102' 
                        : 'bg-white/70 border-gray-200 text-[#76736A] hover:bg-white hover:text-[#302B27]'
                    }`}
                  >
                    {cat.name}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start">
            
            {/* Left Frame: Coffee & Artisanal Catalogue */}
            <div className="space-y-8 order-2 lg:order-1">
              
              {/* Mobile country selector placeholder wrapper */}
              <div className="md:hidden flex items-center justify-between bg-white/50 border border-white/80 rounded-3xl p-4 shadow-sm mb-6">
                <div className="flex items-center space-x-2">
                  <Map className="w-4 h-4 text-[#8B5E34]" />
                  <span className="text-sm font-semibold text-[#302B27]">Pays de livraison :</span>
                </div>
                <select 
                  value={deliveryCountry}
                  onChange={(e) => setDeliveryCountry(e.target.value)}
                  className="bg-transparent border-none text-sm font-semibold text-[#302B27] focus:outline-none focus:ring-0 cursor-pointer"
                >
                  {COUNTRIES.map(c => (
                    <option key={c.code} value={c.code}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-between pb-6 border-b border-[#23493C]/10">
                <div>
                  <h2 className="font-display text-3xl font-semibold text-[#302B27] tracking-tight">Notre Sélection Unique</h2>
                  <p className="text-sm text-[#76736A] mt-1">Variations de prix dynamiques selon le pays d'expédition sélectionné.</p>
                </div>
                <span className="px-3.5 py-1 bg-[#23493C]/5 text-[#23493C] text-xs font-bold uppercase rounded-full tracking-wider">
                  {filteredProducts.length} Merveilles
                </span>
              </div>

              {loading ? (
                <div className="py-24 flex justify-center">
                  <div className="w-10 h-10 border-4 border-[#23493C]/10 border-t-[#23493C] rounded-full animate-spin" />
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="py-16 flex flex-col items-center justify-center text-center bg-white/40 backdrop-blur-xl rounded-3xl border border-white/60 shadow-sm px-6">
                  <div className="w-14 h-14 bg-white/50 rounded-full flex items-center justify-center mb-4">
                    <Sparkles className="w-7 h-7 text-[#8B5E34]" />
                  </div>
                  <h3 className="text-lg font-semibold text-[#302B27] mb-1">Aucun trésor trouvé</h3>
                  <p className="text-sm text-[#76736A] mb-6 max-w-md">Aucun produit ne correspond à cette sélection pour le moment. Découvrez nos autres catégories ou générez des produits de démonstration.</p>
                  <button 
                    onClick={handleSeed}
                    className="px-5 py-3 bg-[#23493C] hover:bg-[#1C3A30] text-white text-xs font-medium uppercase tracking-wider rounded-xl hover:shadow transition-all flex items-center justify-center space-x-2"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Générer les échantillons Colombiens</span>
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
                      />
                    </div>
                  ))}
                </div>
              )}
              
              <div id="contact" className="pt-8 scroll-mt-24">
                <RequestForm key={prefilledProductQuery} initialProduct={prefilledProductQuery} />
              </div>
            </div>

            {/* Right Frame: Interactive Sourcing Origin Map */}
            <div className="order-1 lg:order-2 lg:sticky lg:top-28 relative z-10 pt-2 lg:pt-0">
              <div className="absolute inset-0 bg-[#23493C]/5 blur-3xl -z-10 rounded-full" />
              <div className="bg-white/70 backdrop-blur-2xl p-4 sm:p-8 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-white/80">
                <ColombiaMap 
                  activeDepartmentId={activeDepartment} 
                  onSelectDepartment={(dept) => {
                    if (dept) setActiveDepartment(dept.toUpperCase());
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
                  <div className="w-14 h-14 rounded-2xl bg-white p-1.5 shadow-md border border-white/50 flex items-center justify-center shrink-0">
                    <img 
                      src={brandLogo} 
                      alt="Logo Papagayo" 
                      className="w-full h-full rounded-xl object-cover" 
                    />
                  </div>
                  <div>
                    <h3 className="text-xl font-display font-bold text-[#302B27]">Papagayo Sourcing</h3>
                    <p className="text-[10px] text-[#23493C] uppercase tracking-wider font-extrabold">Qualité d'Origine Garantie</p>
                  </div>
                </div>

                <div className="inline-flex items-center space-x-2 px-3 py-1 bg-[#23493C]/5 text-[#23493C] rounded-full text-xs font-semibold uppercase tracking-wider">
                  <Feather className="w-3 h-3 text-[#23493C]" />
                  <span>D'une Famille d'agriculteurs à votre table</span>
                </div>
                <h2 className="font-display text-4xl lg:text-5xl font-bold tracking-tight text-[#302B27] leading-tight">
                  Sourcing direct,<br />
                  <span className="text-[#8B5E34]">zéro filtre.</span>
                </h2>
                <p className="text-base text-[#76736A] leading-relaxed">
                  Papagayo est né de la volonté de rompre avec les réseaux d'importation opaques traditionnels. Nous travaillons main dans la main avec des micro-coopératives locales colombiennes en garantissant des prix d’achats stables et justes.
                </p>
                <p className="text-base text-[#76736A] leading-relaxed">
                  Notre hub d’expédition basé en France collabore avec des transporteurs express responsables pour livrer à votre domicile en Allemagne, Italie, Espagne ou France, en adaptant le prix de transport au plus juste.
                </p>
                
                <div className="flex items-center space-x-6 pt-2">
                  <div className="flex items-center space-x-2">
                    <ShieldCheck className="w-6 h-6 text-[#23493C]" />
                    <span className="text-xs font-bold text-[#302B27] uppercase tracking-wider">Commerce Équitable</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Heart className="w-6 h-6 text-[#8B5E34]" />
                    <span className="text-xs font-bold text-[#302B27] uppercase tracking-wider">100% Fait Main</span>
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
                  <h3 className="font-display text-xl font-semibold text-[#302B27] mb-2">Micro-Lots Rares</h3>
                  <p className="text-sm text-[#76736A] leading-relaxed">
                     Des cafés sélectionnés par score de tasse supérieure à 84+, fraîchement torréfiés par petites quantités en France pour garder une intensité aromatique native impeccable.
                  </p>
                </div>

                {/* Bento Card 2 */}
                <div className="bg-white/60 backdrop-blur p-8 rounded-3xl border border-white/80 shadow-sm transition-all duration-300 hover:shadow-md">
                  <div className="w-12 h-12 rounded-2xl bg-[#8B5E34]/5 flex items-center justify-center mb-6">
                    <Feather className="w-6 h-6 text-[#8B5E34]" />
                  </div>
                  <h3 className="font-display text-xl font-semibold text-[#302B27] mb-2">Artisanat Wayuu & Zenú</h3>
                  <p className="text-sm text-[#76736A] leading-relaxed">
                     Sacs Mochila en crochet ou chapeaux tressés par des femmes autochtones des communautés Wayuu du désert guajiro ou Zenú de Córdoba, signés pour préserver l'identité.
                  </p>
                </div>

                {/* Bento Card 3 */}
                <div className="bg-white/60 backdrop-blur p-8 rounded-3xl border border-white/80 shadow-sm transition-all duration-300 hover:shadow-md">
                  <div className="w-12 h-12 rounded-2xl bg-[#23493C]/5 flex items-center justify-center mb-6">
                    <Map className="w-6 h-6 text-[#23493C]" />
                  </div>
                  <h3 className="font-display text-xl font-semibold text-[#302B27] mb-2">GPS d'Origine Intégré</h3>
                  <p className="text-sm text-[#76736A] leading-relaxed">
                     Notre concept interactif permet d’associer chaque lot à son département colombo-originaire. Visualisez l’origine exacte d'un coup d’œil sur l'écran.
                  </p>
                </div>

                {/* Bento Card 4 */}
                <div className="bg-white/60 backdrop-blur p-8 rounded-3xl border border-white/80 shadow-sm transition-all duration-300 hover:shadow-md">
                  <div className="w-12 h-12 rounded-2xl bg-[#8B5E34]/5 flex items-center justify-center mb-6">
                    <Globe className="w-6 h-6 text-[#8B5E34]" />
                  </div>
                  <h3 className="font-display text-xl font-semibold text-[#302B27] mb-2">Tarification de Pays transparente</h3>
                  <p className="text-sm text-[#76736A] leading-relaxed">
                     Puisque nous collaborons avec des hubs logistiques locaux, le prix final s'adapte selon la douane locale, les taxes routières et les tarifs postaux du pays choisi.
                  </p>
                </div>

              </div>
            </div>
          </div>
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
                  L'excellence colombienne à portée de main. Découvrez une sélection rigoureuse de produits gastronomiques et artisanaux de première qualité importés directement d'Amérique du Sud pour l'Europe.
                </p>
                <div className="flex items-center space-x-3 text-xs bg-white/5 border border-white/10 rounded-2xl px-3.5 py-2 w-max">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <span>Logistique active pour toute l'Europe</span>
                </div>
              </div>

              {/* Navigation Column */}
              <div>
                <h4 className="font-display text-white text-sm font-semibold uppercase tracking-wider mb-6">Le catalogue</h4>
                <ul className="space-y-4 text-sm">
                  <li><button onClick={() => scrollToSection('catalogue')} className="hover:text-white transition-colors">Café de spécialité</button></li>
                  <li><button onClick={() => scrollToSection('catalogue')} className="hover:text-white transition-colors">Artisanat Wayuu</button></li>
                  <li><button onClick={() => scrollToSection('catalogue')} className="hover:text-white transition-colors">Chocolats fins</button></li>
                  <li><button onClick={() => scrollToSection('catalogue')} className="hover:text-white transition-colors">Nouveautés hebdomadaires</button></li>
                </ul>
              </div>

              {/* Sourcing Origin Links Column */}
              <div>
                <h4 className="font-display text-white text-sm font-semibold uppercase tracking-wider mb-6">Départements</h4>
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
                  <li className="text-gray-400">Hub d'expédition : <span className="text-white">Paris-Bercy, France</span></li>
                  <li className="text-gray-400">Relations producteurs : <span className="text-white">Medellín & Cali, CO</span></li>
                  <li><a href="mailto:hola@papagayo-direct.com" className="hover:text-white text-[#DFDAC8] border-b border-dashed border-[#DFDAC8]/40 pb-0.5 transition-colors">hola@papagayo-direct.com</a></li>
                </ul>
              </div>

            </div>

            {/* Bottom Credits Block */}
            <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-500">
              <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-6 text-center sm:text-left">
                <span>© 2026 Papagayo Inc. Tous droits réservés.</span>
                <span className="hidden sm:inline text-white/5">|</span>
                <span className="hover:text-white transition-colors cursor-pointer">Conditions générales d'importation</span>
                <span className="hidden sm:inline text-white/5">|</span>
                <span className="hover:text-white transition-colors cursor-pointer">Politique de confidentialité</span>
              </div>
              
              <div className="mt-4 sm:mt-0 font-mono text-[10px] tracking-widest text-[#E3DCB9]/40 flex items-center space-x-1 uppercase">
                <Coffee className="w-3 h-3 text-[#E3DCB9]/30 mr-1" />
                <span>Crafted for european connoisseurs</span>
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

                <h3 className="font-display text-2xl font-bold text-[#302B27] tracking-tight mb-2">Acceso Administrador</h3>
                <p className="text-xs text-[#76736A] leading-relaxed mb-5">
                  Connectez-vous avec vos identifiants ou utilisez le mode démo pour accéder au tableau de bord Papagayo.
                </p>

                {/* Email / Password Form */}
                <form onSubmit={handleEmailPasswordLogin} className="space-y-4 text-left mb-6">
                  <div>
                    <label className="block text-[10px] font-bold text-[#302B27] uppercase tracking-wider mb-1 flex items-center">
                      <Mail className="w-3 h-3 mr-1 text-[#23493C]" />
                      <span>Adresse Email</span>
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
                      <span>Mot de Passe</span>
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
                    <span>{authLoading ? "Connexion..." : "Se connecter / Entrar"}</span>
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


