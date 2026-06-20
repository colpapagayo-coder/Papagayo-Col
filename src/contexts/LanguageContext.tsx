import React, { createContext, useContext, useState, ReactNode } from 'react';

export type Language = 'en' | 'es' | 'fr';

interface Translations {
  [key: string]: {
    en: string;
    es: string;
    fr: string;
    [key: string]: string; // For dynamic keys
  };
}

const translations: Translations = {
  // Navigation & Header
  catalog: { en: 'Catalog', es: 'Catálogo', fr: 'Catalogue' },
  artisans: { en: 'Our Artisans', es: 'Nuestros Artesanos', fr: 'Nos Artisans' },
  about: { en: 'About Us', es: 'Nosotros', fr: 'Nous connaître' },
  admin: { en: 'Admin', es: 'Admin', fr: 'Admin' },
  logout: { en: 'Log Out', es: 'Cerrar sesión', fr: 'Se déconnecter' },
  login: { en: 'Log In', es: 'Iniciar sesión', fr: 'Se connecter' },
  
  // Hero Section
  heroTitle: { en: 'Discovering Colombian Roots', es: 'Descubriendo las raíces Típicas', fr: 'À la découverte des racines colombiennes' },
  heroSubtitle: { en: 'Travel through the regions and explore creations from exceptional artisans and local producers.', es: 'Viaja por las regiones y explora creaciones de artesanos y productores locales excepcionales.', fr: 'Voyagez à travers les régions et explorez les créations d\'artisans et de producteurs locaux exceptionnels.' },
  exploreMap: { en: 'Explore the Map', es: 'Explorar el mapa', fr: 'Explorer la carte' },
  
  // Map Section
  ourOrigins: { en: 'Our Origins: The Map', es: 'Nuestros orígenes: El Mapa', fr: 'Nos origines : La Carte' },
  mapInstruction: { en: 'Click on a highlighted region to discover its history and specialties.', es: 'Haz clic en una región resaltada para descubrir su historia y especialidades.', fr: 'Cliquez sur une région en surbrillance pour découvrir son histoire et ses spécialités.' },
  selectRegion: { en: 'Select a region', es: 'Selecciona una región', fr: 'Sélectionner une région' },
  allColombia: { en: 'All of Colombia', es: 'Toda Colombia', fr: 'Toute la Colombie' },
  listenToHistory: { en: 'Listen to history', es: 'Escuchar historia', fr: 'Écouter l\'histoire' },
  
  // Products / Catalog Section
  filterCategory: { en: 'Filter by category', es: 'Filtrar por categoría', fr: 'Filtrer par catégorie' },
  allTreasures: { en: 'All treasures', es: 'Todos los tesoros', fr: 'Tous les trésors' },
  noProducts: { en: 'No products available for this region.', es: 'No hay productos disponibles para esta región.', fr: 'Aucun produit disponible pour cette région.' },
  deliverTo: { en: 'Where do we deliver?', es: '¿A dónde enviamos?', fr: 'Où livrons-nous ?' },
  france: { en: 'France', es: 'Francia', fr: 'France' },
  spain: { en: 'Spain', es: 'España', fr: 'Espagne' },
  germany: { en: 'Germany', es: 'Alemania', fr: 'Allemagne' },
  italy: { en: 'Italy', es: 'Italia', fr: 'Italie' },
  
  // Product Details
  pricePrefix: { en: 'From', es: 'Desde', fr: 'À partir de' },
  originLabel: { en: 'Origin', es: 'Origen', fr: 'Origine' },
  categoryLabel: { en: 'Category', es: 'Categoría', fr: 'Catégorie' },
  producerLabel: { en: 'Producer', es: 'Productor', fr: 'Producteur' },
  requestSourcing: { en: 'Request Sourcing', es: 'Solicitar envío', fr: 'Demander un sourcing' },
  characteristics: { en: 'Characteristics', es: 'Características', fr: 'Caractéristiques' },
  productHistory: { en: 'The History', es: 'La Historia', fr: 'L\'Histoire' },
  
  // Actions
  backToMap: { en: 'Back to map', es: 'Volver al mapa', fr: 'Retour à la carte' },
  backToCatalog: { en: 'Back to catalog', es: 'Volver al catálogo', fr: 'Retour au catalogue' },
  close: { en: 'Close', es: 'Cerrar', fr: 'Fermer' },
  send: { en: 'Send', es: 'Enviar', fr: 'Envoyer' },
  cancel: { en: 'Cancel', es: 'Cancelar', fr: 'Annuler' },
  
  // Footer
  footerDesc: { 
    en: 'Connecting European seekers with exceptional Colombian artisans through ethical and direct sourcing.', 
    es: 'Conectando buscadores europeos con artesanos colombianos excepcionales a través de abastecimiento ético y directo.', 
    fr: 'Connecter les chercheurs européens avec des artisans colombiens exceptionnels grâce à un sourcing éthique et direct.' 
  },
  quickLinks: { en: 'Quick Links', es: 'Enlaces rápidos', fr: 'Liens rapides' },
  contactUs: { en: 'Contact Us', es: 'Contáctanos', fr: 'Nous contacter' },
  allRightsReserved: { en: 'All rights reserved.', es: 'Todos los derechos reservados.', fr: 'Tous droits réservés.' },
  
  // Request Form
  reqFormTitle: { en: 'Custom Sourcing Request', es: 'Solicitud de abastecimiento a medida', fr: 'Demande de sourcing sur mesure' },
  reqFormDesc: { en: 'Tell us what you are looking for. We work directly with local Colombian producers to find exceptional products.', es: 'Cuéntanos qué estás buscando. Trabajamos directamente con productores locales colombianos.', fr: 'Dites-nous ce que vous recherchez. Nous travaillons directement avec des producteurs locaux colombiens.' },
  reqProductType: { en: 'What type of product are you looking for?', es: '¿Qué tipo de producto buscas?', fr: 'Quel type de produit recherchez-vous ?' },
  reqInterest: { en: 'I am interested in:', es: 'Estoy interesado en:', fr: 'Je suis intéressé par :' },
  reqEmail: { en: 'Your professional email', es: 'Tu correo profesional', fr: 'Votre email professionnel' },
  reqDetails: { en: 'Additional details (quantity, specific region, certification...)', es: 'Detalles adicionales (cantidad, región específica, certificación...)', fr: 'Détails supplémentaires (quantité, région spécifique, certification...)' },
  reqSubmit: { en: 'Send Request', es: 'Enviar solicitud', fr: 'Envoyer la demande' },
  reqSuccess: { en: 'Request sent successfully. We will contact you soon.', es: 'Solicitud enviada con éxito. Te contactaremos pronto.', fr: 'Demande envoyée avec succès. Nous vous contacterons bientôt.' },
  
  // Admin Login
  adminAccess: { en: 'Admin Access', es: 'Acceso Admin', fr: 'Accès Admin' },
  email: { en: 'Email', es: 'Correo electrónico', fr: 'Email' },
  password: { en: 'Password', es: 'Contraseña', fr: 'Mot de passe' },
  
  // General Map text defaults
  mapWelcome: {
    en: "Welcome to the territories of secret Colombia. Explore works created with art, soul, and patience throughout our history and geography.",
    es: "Bienvenido a los territorios de la Colombia secreta. Explora obras creadas con arte, alma y paciencia a lo largo de nuestra historia y geografía.",
    fr: "Bienvenue dans les contrées de la Colombie secrète. Explorez des œuvres façonnées avec art, cœur et patience au fil de l'histoire régionale."
  },
  
  // App UI elements
  catalogActive: { en: 'Active Catalog', es: 'Catálogo Activo', fr: 'Catalogue Actif' },
  deliverablesEurope: { en: 'European Deliverables', es: 'Envíos Europa', fr: 'Livrables Europe' },
  categoriesNav: { en: 'Categories', es: 'Categorías', fr: 'Catégories' },
  systemMode: { en: 'System Mode', es: 'Modo Sistema', fr: 'Mode Système' },
  viewClientSite: { en: 'View client site', es: 'Ver sitio cliente', fr: 'Voir le site client' },
  adminDescription: { en: 'Origin Inventory & Community Pricing Control', es: 'Control de Inventario de Origen & Tarifarios Comunitarios', fr: 'Contrôle des stocks d\'origine & Tarifications communautaires' },
  adminProfile: { en: 'Administrator', es: 'Administrador', fr: 'Administrateur' },
  originTerritory: { en: 'Origin Territory (Colombia)', es: 'Territorio de Origen (Colombia)', fr: 'Territoire d\'Origine (Colombie)' },
  allTerritories: { en: 'All Territories', es: 'Todos los Territorios', fr: 'Tous les Territoires' },
  productCategory: { en: 'Product Category', es: 'Categoría de Producto', fr: 'Catégorie de Produits' },
  allProducts: { en: 'All Products', es: 'Todos los Productos', fr: 'Tous les Produits' },
  ourSelection: { en: 'Our Unique Selection', es: 'Nuestra Selección Única', fr: 'Notre Sélection Unique' },
  priceVariationMsg: { en: 'Dynamic price variations depending on the selected shipping country.', es: 'Variaciones de precios dinámicas según el país de envío seleccionado.', fr: 'Variations de prix dynamiques selon le pays d\'expédition sélectionné.' },
  selectedTerroir: { en: 'Selected Terroir', es: 'Origen Territorial', fr: 'Terroir Sélectionné' },
  showAll: { en: 'Show all', es: 'Mostrar todo', fr: 'Voir tout' },
  associatedProducers: { en: 'Associated Producers', es: 'Productores', fr: 'Créateurs associés' },
  knowHow: { en: 'Know-how', es: 'Sabiduría', fr: 'Savoir-faire' },
  stopAudio: { en: 'Stop Audio', es: 'Parar audio', fr: 'Arrêter la narration' },
  certifiedOrigin: { en: 'Certified Origin ✓', es: 'Origen Certificado ✓', fr: 'Origine Certifiée ✓' },
  noTreasuresTitle: { en: 'No treasures found', es: 'Ningún tesoro encontrado', fr: 'Aucun trésor trouvé' },
  noTreasuresDesc: { en: 'No products match this selection at the moment. Discover our other categories or generate sample products.', es: 'Ningún producto coincide con esta selección por el momento. Descubre nuestras otras categorías o genera productos de demostración.', fr: 'Aucun produit ne correspond à cette sélection pour le moment. Découvrez nos autres catégories ou générez des produits de démonstration.' },
  generateSamples: { en: 'Generate Colombian samples', es: 'Generar muestras Colombianas', fr: 'Générer les échantillons Colombiens' },
  guaranteedQuality: { en: 'Guaranteed Origin Quality', es: 'Calidad de Origen Garantizada', fr: 'Qualité d\'Origine Garantie' },
  aboutPills: { en: 'Exceptional Crafts & Origin Coffee', es: 'Artesanía y Café de Origen Excepcionales', fr: 'Artisanat & Café d\'Origine Exceptionnels' },
  aboutTitle1: { en: 'Papagayo Sourcing', es: 'Papagayo Sourcing', fr: 'Papagayo Sourcing' },
  aboutTitle2: { en: 'Artisans of the Earth.', es: 'Artesanos de la Tierra.', fr: 'Artisans de la Terre.' },
  aboutQuote: { en: '“From Latin America to Europe, we share creations born from hands, the earth, and tradition.”', es: '“De América Latina a Europa, compartimos creaciones nacidas de las manos, de la tierra y la tradición.”', fr: '“De l’Amérique latine vers l’Europe, nous partageons des créations nées des mains, de la terre et de la tradition.”' }
};

interface LanguageContextProps {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextProps | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('es'); // Default spanish as requested "dejemos 3 idiomas que traduzcan totalmente la información algo tipo" EN/ES/FR

  const t = (key: string): string => {
    if (translations[key] && translations[key][language]) {
      return translations[key][language];
    }
    return key; // Fallback to key if not found
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextProps => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
