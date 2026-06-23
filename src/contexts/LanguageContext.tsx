import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

export type Language = 'en' | 'es' | 'fr' | 'de' | 'it';

interface Translations {
  [key: string]: {
    en: string;
    es: string;
    fr: string;
    de: string;
    it: string;
    [key: string]: string; // For dynamic keys
  };
}

const translations: Translations = {
  // Navigation & Header
  catalog: { en: 'Catalog', es: 'Catálogo', fr: 'Catalogue', de: 'Katalog', it: 'Catalogo' },
  artisans: { en: 'Our Artisans', es: 'Nuestros Artesanos', fr: 'Nos Artisans', de: 'Unsere Handwerker', it: 'I Nostri Artigiani' },
  about: { en: 'About Us', es: 'Nosotros', fr: 'Nous connaître', de: 'Über uns', it: 'Chi siamo' },
  admin: { en: 'Admin', es: 'Admin', fr: 'Admin', de: 'Admin', it: 'Amministratore' },
  logout: { en: 'Log Out', es: 'Cerrar sesión', fr: 'Se déconnecter', de: 'Abmelden', it: 'Disconnettersi' },
  login: { en: 'Log In', es: 'Iniciar sesión', fr: 'Se connecter', de: 'Anmelden', it: 'Accedi' },
  
  // Hero Section
  heroTitle: { en: 'Discovering Colombian Roots', es: 'Descubriendo las raíces Típicas', fr: 'À la découverte des racines colombiennes', de: 'Die Entdeckung kolumbianischer Wurzeln', it: 'Alla scoperta delle radici colombiane' },
  heroSubtitle: { 
    en: 'Travel through the regions and explore creations from exceptional artisans and local producers.', 
    es: 'Viaja por las regiones y explora creaciones de artesanos y productores locales excepcionales.', 
    fr: 'Voyagez à travers les régions et explorez les créations d\'artisans et de producteurs locaux exceptionnels.',
    de: 'Reisen Sie durch die Regionen und entdecken Sie Kreationen von außergewöhnlichen Handwerkern und lokalen Produzenten.',
    it: 'Viaggia attraverso le regioni ed esplora creazioni di artigiani eccezionali e produttori locali.'
  },
  exploreMap: { en: 'Explore the Map', es: 'Explorar el mapa', fr: 'Explorer la carte', de: 'Karte erkunden', it: 'Esplora la mappa' },
  
  // Map Section
  ourOrigins: { en: 'Our Origins: The Map', es: 'Nuestros orígenes: El Mapa', fr: 'Nos origines : La Carte', de: 'Unsere Herkunft: Die Karte', it: 'Le nostre origini: La mappa' },
  mapInstruction: { en: 'Click on a highlighted region to discover its history and specialties.', es: 'Haz clic en una región resaltada para descubrir su historia y especialidades.', fr: 'Cliquez sur une région en surbrillance pour découvrir son histoire et ses spécialités.', de: 'Klicken Sie auf eine hervorgehobene Region, um ihre Geschichte und Besonderheiten zu entdecken.', it: 'Clicca su una regione evidenziata per scoprirne la storia e le specialità.' },
  selectRegion: { en: 'Select a region', es: 'Selecciona una región', fr: 'Sélectionner une région', de: 'Wählen Sie eine Region', it: 'Seleziona una regione' },
  allColombia: { en: 'All of Colombia', es: 'Toda Colombia', fr: 'Toute la Colombie', de: 'Ganz Kolumbien', it: 'Tutta la Colombia' },
  listenToHistory: { en: 'Listen to history', es: 'Escuchar historia', fr: 'Écouter l\'histoire', de: 'Geschichte anhören', it: 'Ascolta la storia' },
  
  // Products / Catalog Section
  filterCategory: { en: 'Filter by category', es: 'Filtrar por categoría', fr: 'Filtrer par catégorie', de: 'Nach Kategorie filtern', it: 'Filtra per categoria' },
  allTreasures: { en: 'All treasures', es: 'Todos los tesoros', fr: 'Tous les trésors', de: 'Alle Schätze', it: 'Tutti i tesori' },
  noProducts: { en: 'No products available for this region.', es: 'No hay productos disponibles para esta región.', fr: 'Aucun produit disponible pour cette région.', de: 'Keine Produkte für diese Region verfügbar.', it: 'Nessun prodotto disponibile per questa regione.' },
  deliverTo: { en: 'Where do we deliver?', es: '¿A dónde enviamos?', fr: 'Où livrons-nous ?', de: 'Wohin liefern wir?', it: 'Dove consegniamo?' },
  france: { en: 'France', es: 'Francia', fr: 'France', de: 'Frankreich', it: 'Francia' },
  spain: { en: 'Spain', es: 'España', fr: 'Espagne', de: 'Spanien', it: 'Spagna' },
  germany: { en: 'Germany', es: 'Alemania', fr: 'Allemagne', de: 'Deutschland', it: 'Germania' },
  italy: { en: 'Italy', es: 'Italia', fr: 'Italie', de: 'Italien', it: 'Italia' },
  
  // Product Details
  pricePrefix: { en: 'From', es: 'Desde', fr: 'À partir de', de: 'Ab', it: 'Da' },
  originLabel: { en: 'Origin', es: 'Origen', fr: 'Origine', de: 'Herkunft', it: 'Origine' },
  categoryLabel: { en: 'Category', es: 'Categoría', fr: 'Catégorie', de: 'Kategorie', it: 'Categoria' },
  producerLabel: { en: 'Producer', es: 'Productor', fr: 'Producteur', de: 'Produzent', it: 'Produttore' },
  requestSourcing: { en: 'Request Sourcing', es: 'Solicitar envío', fr: 'Demander un sourcing', de: 'Sourcing anfordern', it: 'Richiedi Approvvigionamento' },
  characteristics: { en: 'Characteristics', es: 'Características', fr: 'Caractéristiques', de: 'Eigenschaften', it: 'Caratteristiche' },
  productHistory: { en: 'The History', es: 'La Historia', fr: 'L\'Histoire', de: 'Die Geschichte', it: 'La Storia' },
  
  // Actions
  backToMap: { en: 'Back to map', es: 'Volver al mapa', fr: 'Retour à la carte', de: 'Zurück zur Karte', it: 'Torna alla mappa' },
  backToCatalog: { en: 'Back to catalog', es: 'Volver al catálogo', fr: 'Retour au catalogue', de: 'Zurück zum Katalog', it: 'Torna al catalogo' },
  close: { en: 'Close', es: 'Cerrar', fr: 'Fermer', de: 'Schließen', it: 'Chiudi' },
  send: { en: 'Send', es: 'Enviar', fr: 'Envoyer', de: 'Senden', it: 'Invia' },
  cancel: { en: 'Cancel', es: 'Cancelar', fr: 'Annuler', de: 'Abbrechen', it: 'Annulla' },
  
  // Footer
  footerDesc: { 
    en: 'Connecting European seekers with exceptional Colombian artisans through ethical and direct sourcing.', 
    es: 'Conectando buscadores europeos con artesanos colombianos excepcionales a través de abastecimiento ético y directo.', 
    fr: 'Connecter les chercheurs européens avec des artisans colombiens exceptionnels grâce à un sourcing éthique et direct.',
    de: 'Wir verbinden europäische Sucher mit außergewöhnlichen kolumbianischen Handwerkern durch ethisches und direktes Sourcing.',
    it: 'Colleghiamo ricercatori europei con eccezionali artigiani colombiani attraverso un approvvigionamento etico e diretto.'
  },
  quickLinks: { en: 'Quick Links', es: 'Enlaces rápidos', fr: 'Liens rapides', de: 'Schnelllinks', it: 'Link Rapidi' },
  contactUs: { en: 'Contact Us', es: 'Contáctanos', fr: 'Nous contacter', de: 'Kontaktiere uns', it: 'Contattaci' },
  allRightsReserved: { en: 'All rights reserved.', es: 'Todos los derechos reservados.', fr: 'Tous droits réservés.', de: 'Alle Rechte vorbehalten.', it: 'Tutti i diritti riservati.' },
  
  // Request Form
  reqFormTitle: { en: 'Custom Sourcing Request', es: 'Solicitud de abastecimiento a medida', fr: 'Demande de sourcing sur mesure', de: 'Individuelle Sourcing-Anfrage', it: 'Richiesta di Approvvigionamento su Misura' },
  reqFormDesc: { en: 'Tell us what you are looking for. We work directly with local Colombian producers to find exceptional products.', es: 'Cuéntanos qué estás buscando. Trabajamos directamente con productores locales colombianos.', fr: 'Dites-nous ce que vous recherchez. Nous travaillons directement avec des producteurs locaux colombiens.', de: 'Sagen Sie uns, wonach Sie suchen. Wir arbeiten direkt mit lokalen kolumbianischen Produzenten zusammen.', it: 'Dicci cosa stai cercando. Lavoriamo direttamente con produttori locali colombiani.' },
  reqProductType: { en: 'What type of product are you looking for?', es: '¿Qué tipo de producto buscas?', fr: 'Quel type de produit recherchez-vous ?', de: 'Nach welcher Art von Produkt suchen Sie?', it: 'Che tipo di prodotto stai cercando?' },
  reqInterest: { en: 'I am interested in:', es: 'Estoy interesado en:', fr: 'Je suis intéressé par :', de: 'Ich interessiere mich für:', it: 'Sono interessato a:' },
  reqEmail: { en: 'Your professional email', es: 'Tu correo profesional', fr: 'Votre email professionnel', de: 'Ihre geschäftliche E-Mail', it: 'La tua email professionale' },
  reqDetails: { en: 'Additional details (quantity, specific region, certification...)', es: 'Detalles adicionales (cantidad, región específica, certificación...)', fr: 'Détails supplémentaires (quantité, région spécifique, certification...)', de: 'Zusätzliche Details (Menge, bestimmte Region, Zertifizierung...)', it: 'Dettagli aggiuntivi (quantità, regione specifica, certificazione...)' },
  reqSubmit: { en: 'Send Request', es: 'Enviar solicitud', fr: 'Envoyer la demande', de: 'Anfrage senden', it: 'Invia richiesta' },
  reqSuccess: { en: 'Request sent successfully. We will contact you soon.', es: 'Solicitud enviada con éxito. Te contactaremos pronto.', fr: 'Demande envoyée avec succès. Nous vous contacterons bientôt.', de: 'Anfrage erfolgreich gesendet. Wir werden Sie bald kontaktieren.', it: 'Richiesta inviata con successo. Ti contatteremo presto.' },
  
  // Admin Login
  adminAccess: { en: 'Admin Access', es: 'Acceso Admin', fr: 'Accès Admin', de: 'Admin-Zugang', it: 'Accesso Amministratore' },
  email: { en: 'Email', es: 'Correo electrónico', fr: 'Email', de: 'E-Mail', it: 'Email' },
  password: { en: 'Password', es: 'Contraseña', fr: 'Mot de passe', de: 'Passwort', it: 'Password' },
  
  // General Map text defaults
  mapWelcome: {
    en: "Welcome to the territories of secret Colombia. Explore works created with art, soul, and patience throughout our history and geography.",
    es: "Bienvenido a los territorios de la Colombia secreta. Explora obras creadas con arte, alma y paciencia a lo largo de nuestra historia y geografía.",
    fr: "Bienvenue dans les contrées de la Colombie secrète. Explorez des œuvres façonnées avec art, cœur et patience au fil de l'histoire régionale.",
    de: "Willkommen in den Gebieten des geheimen Kolumbiens. Entdecken Sie Werke, die mit Kunst, Seele und Geduld im Laufe unserer Geschichte geschaffen wurden.",
    it: "Benvenuti nei territori della Colombia segreta. Esplora opere create con arte, anima e pazienza in tutta la nostra storia."
  },
  
  // App UI elements
  catalogActive: { en: 'Active Catalog', es: 'Catálogo Activo', fr: 'Catalogue Actif', de: 'Aktiver Katalog', it: 'Catalogo Attivo' },
  deliverablesEurope: { en: 'European Deliverables', es: 'Envíos Europa', fr: 'Livrables Europe', de: 'Europäische Lieferungen', it: 'Consegne in Europa' },
  categoriesNav: { en: 'Categories', es: 'Categorías', fr: 'Catégories', de: 'Kategorien', it: 'Categorie' },
  systemMode: { en: 'System Mode', es: 'Modo Sistema', fr: 'Mode Système', de: 'Systemmodus', it: 'Modalità di Sistema' },
  viewClientSite: { en: 'View client site', es: 'Ver sitio cliente', fr: 'Voir le site client', de: 'Kunden-Website anzeigen', it: 'Visualizza sito cliente' },
  adminDescription: { en: 'Origin Inventory & Community Pricing Control', es: 'Control de Inventario de Origen & Tarifarios Comunitarios', fr: 'Contrôle des stocks d\'origine & Tarifications communautaires', de: 'Herkunftsinventar & Gemeindepreissteuerung', it: 'Controllo Inventario Origine & Prezzi Comunitari' },
  adminProfile: { en: 'Administrator', es: 'Administrador', fr: 'Administrateur', de: 'Administrator', it: 'Amministratore' },
  originTerritory: { en: 'Origin Territory (Colombia)', es: 'Territorio de Origen (Colombia)', fr: 'Territoire d\'Origine (Colombie)', de: 'Herkunftsgebiet (Kolumbien)', it: 'Territorio di Origine (Colombia)' },
  allTerritories: { en: 'All Territories', es: 'Todos los Territorios', fr: 'Tous les Territoires', de: 'Alle Gebiete', it: 'Tutti i Territori' },
  productCategory: { en: 'Product Category', es: 'Categoría de Producto', fr: 'Catégorie de Produits', de: 'Produktkategorie', it: 'Categoria di Prodotto' },
  allProducts: { en: 'All Products', es: 'Todos los Productos', fr: 'Tous les Produits', de: 'Alle Produkte', it: 'Tutti i Prodotti' },
  ourSelection: { en: 'Our Unique Selection', es: 'Nuestra Selección Única', fr: 'Notre Sélection Unique', de: 'Unsere einzigartige Auswahl', it: 'La Nostra Selezione Unica' },
  priceVariationMsg: { en: 'Dynamic price variations depending on the selected shipping country.', es: 'Variaciones de precios dinámicas según el país de envío seleccionado.', fr: 'Variations de prix dynamiques selon le pays d\'expédition sélectionné.', de: 'Dynamische Preisschwankungen abhängig vom ausgewählten Versandland.', it: 'Variazioni dinamiche di prezzo in base al paese di spedizione selezionato.' },
  selectedTerroir: { en: 'Selected Terroir', es: 'Origen Territorial', fr: 'Terroir Sélectionné', de: 'Ausgewähltes Terroir', it: 'Terroir Selezionato' },
  showAll: { en: 'Show all', es: 'Mostrar todo', fr: 'Voir tout', de: 'Alle anzeigen', it: 'Mostra tutto' },
  associatedProducers: { en: 'Associated Producers', es: 'Productores', fr: 'Créateurs associés', de: 'Assoziierte Produzenten', it: 'Produttori Associati' },
  knowHow: { en: 'Know-how', es: 'Sabiduría', fr: 'Savoir-faire', de: 'Know-how', it: 'Saper fare' },
  stopAudio: { en: 'Stop Audio', es: 'Parar audio', fr: 'Arrêter la narration', de: 'Audio stoppen', it: 'Ferma Audio' },
  certifiedOrigin: { en: 'Certified Origin ✓', es: 'Origen Certificado ✓', fr: 'Origine Certifiée ✓', de: 'Zertifizierte Herkunft ✓', it: 'Origine Certificata ✓' },
  noTreasuresTitle: { en: 'No treasures found', es: 'Ningún tesoro encontrado', fr: 'Aucun trésor trouvé', de: 'Keine Schätze gefunden', it: 'Nessun tesoro trovato' },
  noTreasuresDesc: { en: 'No products match this selection at the moment. Discover our other categories or generate sample products.', es: 'Ningún producto coincide con esta selección por el momento. Descubre nuestras otras categorías o genera productos de demostración.', fr: 'Aucun produit ne correspond à cette sélection pour le moment. Découvrez nos autres catégories ou générez des produits de démonstration.', de: 'Derzeit entsprechen keine Produkte dieser Auswahl. Entdecken Sie unsere anderen Kategorien oder generieren Sie Beispielprodukte.', it: 'Nessun prodotto corrisponde a questa selezione al momento. Scopri le nostre altre categorie o genera prodotti campione.' },
  generateSamples: { en: 'Generate Colombian samples', es: 'Generar muestras Colombianas', fr: 'Générer les échantillons Colombiens', de: 'Kolumbianische Proben generieren', it: 'Genera campioni colombiani' },
  guaranteedQuality: { en: 'Guaranteed Origin Quality', es: 'Calidad de Origen Garantizada', fr: 'Qualité d\'Origine Garantie', de: 'Garantierte Herkunftsqualität', it: 'Qualità di Origine Garantita' },
  aboutPills: { en: 'Exceptional Crafts & Origin Coffee', es: 'Artesanía y Café de Origen Excepcionales', fr: 'Artisanat & Café d\'Origine Exceptionnels', de: 'Außergewöhnliches Handwerk & Herkunftskaffee', it: 'Artigianato Eccezionale & Caffè d\'Origine' },
  aboutTitle1: { en: 'Papagayo Sourcing', es: 'Papagayo Sourcing', fr: 'Papagayo Sourcing', de: 'Papagayo Sourcing', it: 'Papagayo Sourcing' },
  aboutTitle2: { en: 'Artisans of the Earth.', es: 'Artesanos de la Tierra.', fr: 'Artisans de la Terre.', de: 'Handwerker der Erde.', it: 'Artigiani della Terra.' },
  aboutQuote: { en: '“From Latin America to Europe, we share creations born from hands, the earth, and tradition.”', es: '“De América Latina a Europa, compartimos creaciones nacidas de las manos, de la tierra y la tradición.”', fr: '“De l’Amérique latine vers l’Europe, nous partageons des créations nées des mains, de la terre et de la tradition.”', de: '„Von Lateinamerika nach Europa teilen wir Kreationen, die aus den Händen, der Erde und der Tradition entstanden sind.“', it: '“Dall’America Latina all’Europa, condividiamo creazioni nate dalle mani, dalla terra e dalla tradizione.”' },
  
  // ColombiaMap specific
  loadingMap: { en: 'Loading Colombian territory...', es: 'Cargando el territorio colombiano...', fr: 'Chargement du territoire...', de: 'Kolumbianisches Gebiet wird geladen...', it: 'Caricamento del territorio colombiano...' },
  interactiveAudio: { en: 'Interactive • Audio', es: 'Interactivo • Audio', fr: 'Interactive • Audio', de: 'Interaktiv • Audio', it: 'Interattivo • Audio' },
  geoOrigin: { en: 'Geographical Origin', es: 'Origen Geográfico', fr: 'Géo-Origine', de: 'Geografische Herkunft', it: 'Origine Geografica' },
  stampUnlocked: { en: '🎖️ Origin Stamp Unlocked!', es: '🎖️ ¡Sello de Origen Desbloqueado!', fr: '🎖️ Sceau d\'Origine Débloqué !', de: '🎖️ Herkunftsstempel freigeschaltet!', it: '🎖️ Timbro di Origine Sbloccato!' },
  stampDescPrefix: { en: 'This historic origin of', es: 'Este origen histórico de', fr: 'Cette origine historique de', de: 'Dieser historische Ursprung von', it: 'Questa storica origine di' },
  stampDescSuffix: { en: 'has been successfully recorded in your Collection Passport.', es: 'ha sido registrado con éxito en tu Pasaporte de Colección.', fr: 'a été enregistrée avec succès dans votre Passeport de Collection.', de: 'wurde erfolgreich in Ihrem Sammlungspass erfasst.', it: 'è stato registrato con successo nel tuo Passaporto da Collezione.' },
  pauseAudio: { en: 'Pause Audio', es: 'Pausar narración', fr: 'Mettre en pause', de: 'Audio pausieren', it: 'Metti in pausa' },
  audioPlaying: { en: 'AUDIO PLAYING...', es: 'NARRACIÓN EN CURSO...', fr: 'ÉCOUTE EN COURS...', de: 'AUDIO LÄUFT...', it: 'RIPRODUZIONE AUDIO...' },
  listenToHistoryAI: { en: 'Listen to History with AI', es: 'Escuchar Historia con IA', fr: 'Écouter l\'Histoire avec l\'IA', de: 'Geschichte mit KI anhören', it: 'Ascolta la Storia con l\'IA' },
  aiNarrator: { en: 'AI Narrator', es: 'Narradora IA', fr: 'IA de Narration', de: 'KI-Erzähler', it: 'Narratore IA' },
  clickToPlay: { en: 'Click to listen', es: 'Haz clic para escuchar', fr: 'Cliquez pour écouter', de: 'Klicken zum Anhören', it: 'Clicca per ascoltare' },
  viewProducts: { en: 'View Products', es: 'Ver Productos', fr: 'Trésors régionaux', de: 'Produkte ansehen', it: 'Visualizza Prodotti' },
  passportTitle: { en: 'Origin Collection Passport', es: 'Pasaporte de Sourcing Colombiano', fr: 'Passeport de Collection d\'Origine', de: 'Herkunftssammlung Pass', it: 'Passaporto Collezione d\'Origine' },
  passportDesc: { en: 'Click on the regions on the map above to unlock them all!', es: '¡Haz clic en las regiones y sellos en el mapa de arriba para desbloquear todo!', fr: 'Cliquez sur les régions et tampons sur le croquis de la carte ci-dessus pour tout débloquer !', de: 'Klicken Sie auf die Regionen auf der Karte oben, um sie alle freizuschalten!', it: 'Clicca sulle regioni sulla mappa sopra per sbloccarle tutte!' },
  rankNovice: { en: 'Novice 🗺️', es: 'Novicio 🗺️', fr: 'Novice 🗺️', de: 'Anfänger 🗺️', it: 'Novizio 🗺️' },
  rankTraveler: { en: 'Traveler 🏔️', es: 'Viajero 🏔️', fr: 'Voyageur 🏔️', de: 'Reisender 🏔️', it: 'Viaggiatore 🏔️' },
  rankCollector: { en: 'Collector 🏺', es: 'Coleccionista 🏺', fr: 'Collectionneur 🏺', de: 'Sammler 🏺', it: 'Collezionista 🏺' },
  rankCurator: { en: 'Curator 🏆', es: 'Conservador 🏆', fr: 'Conservateur 🏆', de: 'Kurator 🏆', it: 'Curatore 🏆' },
  progressUnlocked: { en: 'stamps unlocked', es: 'sellos desbloqueados', fr: 'tampons débloqués', de: 'Stempel freigeschaltet', it: 'timbri sbloccati' },
  resetProgress: { en: 'Reset', es: 'Reiniciar', fr: 'Réinitialiser', de: 'Zurücksetzen', it: 'Ripristina' },
  resetConfirm: { en: 'Are you sure?', es: '¿Seguro?', fr: 'Sûr ?', de: 'Sicher?', it: 'Sicuro?' },
  yes: { en: 'Yes', es: 'Sí', fr: 'Oui', de: 'Ja', it: 'Sì' },
  no: { en: 'No', es: 'No', fr: 'Non', de: 'Nein', it: 'No' },
  clickToView: { en: 'Click to view!', es: '¡Haz clic para ver!', fr: 'Cliquez pour voir !', de: 'Klicken zum Ansehen!', it: 'Clicca per vedere!' },
  sourcingCommunities: { en: 'Sourcing & Communities', es: 'Sourcing & Comunidades', fr: 'Sourcing & Communautés', de: 'Beschaffung & Gemeinschaften', it: 'Sourcing e Comunità' },
  
  // App.tsx specifics
  latamCoffee: { en: 'Latin America & Colombian Origin Coffee', es: 'América latina & Café de origen colombiano', fr: 'Amérique latine & Café d\'origine colombienne', de: 'Lateinamerika & Kolumbianischer Herkunftskaffee', it: 'America Latina & Caffè di Origine Colombiana' },
  traceability: { en: '100% Origin Traceability', es: '100% Trazabilidad de Origen', fr: '100% Traçabilité Origine', de: '100% Herkunftsnachweis', it: '100% Tracciabilità di Origine' },
  directToTable: { en: 'Direct Producer-to-Table', es: 'Directo Productor-a-Mesa', fr: 'Direct Producteur-Table', de: 'Direkt vom Produzenten auf den Tisch', it: 'Diretto dal Produttore alla Tavola' },
  euLogistics: { en: '4 Countries EU Logistics Hub', es: '4 Países Hub logístico UE', fr: '4 Pays Hub logistique UE', de: '4 Länder EU-Logistik-Hub', it: '4 Paesi Hub Logistico UE' },
  deliveryCountry: { en: 'Delivery country:', es: 'País de entrega:', fr: 'Pays de livraison :', de: 'Lieferland:', it: 'Paese di consegna:' },
  deliveryCountryMobile: { en: 'Delivery country', es: 'País de entrega', fr: 'Pays de livraison', de: 'Lieferland', it: 'Paese di consegna' },
  wonders: { en: 'Treasures', es: 'Tesoros', fr: 'Merveilles', de: 'Wunder', it: 'Meraviglie' },
  
  // Admin Panel specifics
  adminTitle: { en: 'Admin Workspace', es: 'Panel de Administrador', fr: 'Espace Administrateur', de: 'Admin-Arbeitsbereich', it: 'Area Amministratore' },
  adminDesc: { en: 'Manage the catalog, configure delivery countries, and administer Colombian categories.', es: 'Administra el catálogo, configura países de envío y gestiona las categorías colombianas.', fr: 'Gérez le catalogue, connectez les pays de livraison et administrez les catégories colombiennes.', de: 'Katalog verwalten, Lieferländer konfigurieren und kolumbianische Kategorien verwalten.', it: 'Gestisci il catalogo, configura i paesi di consegna e amministra le categorie colombiane.' },
  closePanel: { en: 'Close Admin Panel', es: 'Cerrar Panel de Control', fr: 'Fermer le panneau', de: 'Admin-Panel schließen', it: 'Chiudi pannello admin' },
  tabProducts: { en: '📦 Products', es: '📦 Productos', fr: '📦 Produits de Sourcing', de: '📦 Produkte', it: '📦 Prodotti' },
  tabCategories: { en: '🏷️ Categories', es: '🏷️ Categorías', fr: '🏷️ Gestion des Catégories', de: '🏷️ Kategorien', it: '🏷️ Categorie' },
  tabPricing: { en: '💶 Country Pricing', es: '💶 Precios por País', fr: '💶 Grille Tarifaire par Pays', de: '💶 Länderpreise', it: '💶 Prezzi per Paese' },
  tabRequests: { en: '📥 Client Requests', es: '📥 Solicitudes', fr: '📥 Demandes Client', de: '📥 Kundenanfragen', it: '📥 Richieste Clienti' },
  // Form specific translations
  formTitle: { en: 'Can\'t find what you are looking for?', es: '¿No encuentras lo que buscas?', fr: 'Vous ne trouvez pas votre bonheur ?', de: 'Finden Sie nicht, wonach Sie suchen?', it: 'Non trovi quello che cerchi?' },
  formSubtitle: { en: 'Tell us which South American product you would like to see in our shop. Leave us your details, and we will take care of the search.', es: 'Dinos qué producto sudamericano te gustaría ver en nuestra tienda. Déjanos tus datos y nos encargaremos de la búsqueda.', fr: 'Dites-nous quel produit sud-américain vous aimeriez voir sur notre boutique. Laissez-nous vos coordonnées, nous nous chargeons de la recherche.', de: 'Teilen Sie uns mit, welches südamerikanische Produkt Sie in unserem Shop sehen möchten. Hinterlassen Sie Ihre Daten, wir kümmern uns um die Suche.', it: 'Dicci quale prodotto sudamericano vorresti vedere nel nostro negozio. Lasciaci i tuoi dettagli e ci occuperemo della ricerca.' },
  formName: { en: 'Your Name', es: 'Tu Nombre', fr: 'Votre Nom', de: 'Ihr Name', it: 'Il tuo nome' },
  formEmail: { en: 'Email', es: 'Correo electrónico', fr: 'Email', de: 'E-Mail', it: 'Email' },
  formDesiredProduct: { en: 'Desired Product', es: 'Producto Deseado', fr: 'Produit Souhaité', de: 'Gewünschtes Produkt', it: 'Prodotto desiderato' },
  formPlaceholder: { en: 'Ex: Bocadillo Veleño, Chamba pottery...', es: 'Ej: Bocadillo Veleño, cerámica de La Chamba...', fr: 'Ex: Bocadillo Veleño, céramique de La Chamba...', de: 'Bsp.: Bocadillo Veleño, Chamba-Keramik...', it: 'Es: Bocadillo Veleño, ceramica Chamba...' },
  formSubmit: { en: 'Send Suggestion', es: 'Enviar sugerencia', fr: 'Envoyer la suggestion', de: 'Vorschlag senden', it: 'Invia suggerimento' },
  formSuccessTitle: { en: 'Thank you for your suggestion!', es: '¡Gracias por tu sugerencia!', fr: 'Merci pour votre suggestion !', de: 'Vielen Dank für Ihren Vorschlag!', it: 'Grazie per il tuo suggerimento!' },
  formSuccessDesc: { en: 'We will contact you soon if this product becomes available for import.', es: 'Te contactaremos pronto si este producto está disponible para la importación.', fr: 'Nous vous contacterons bientôt si ce produit devient disponible à l\'importation.', de: 'Wir werden uns in Kürze mit Ihnen in Verbindung setzen, wenn dieses Produkt zum Import verfügbar wird.', it: 'Ti contatteremo presto se questo prodotto diventerà disponibile per l\'importazione.' },
  formAnother: { en: 'Make another suggestion', es: 'Hacer otra sugerencia', fr: 'Faire une autre suggestion', de: 'Einen weiteren Vorschlag machen', it: 'Fai un altro suggerimento' },
  
  // Footer Specific
  footerLogisticsHub: { en: 'Shipping Hub:', es: 'Hub de envío:', fr: 'Hub d\'expédition :', de: 'Versandzentrum:', it: 'Hub di spedizione:' },
  footerProducers: { en: 'Producer Relations:', es: 'Relaciones productores:', fr: 'Relations producteurs :', de: 'Produzentenbeziehungen:', it: 'Relazioni produttori:' },
  footerRights: { en: '© 2026 Papagayo Inc. All rights reserved.', es: '© 2026 Papagayo Inc. Todos los derechos reservados.', fr: '© 2026 Papagayo Inc. Tous droits réservés.', de: '© 2026 Papagayo Inc. Alle Rechte vorbehalten.', it: '© 2026 Papagayo Inc. Tutti i diritti riservati.' },
  footerTerms: { en: 'Import terms & conditions', es: 'Condiciones generales de importación', fr: 'Conditions générales d\'importation', de: 'Allgemeine Importbedingungen', it: 'Condizioni generali di importazione' },
  footerPrivacy: { en: 'Privacy policy', es: 'Política de privacidad', fr: 'Politique de confidentialité', de: 'Datenschutzrichtlinie', it: 'Informativa sulla privacy' },
  footerCreated: { en: 'Created for European connoisseurs', es: 'Creado para conocedores europeos', fr: 'Créé pour les connaisseurs européens', de: 'Gemacht für europäische Kenner', it: 'Creato per intenditori europei' },
  // Admin Specific
  adminCreateProduct: { en: 'Create New Colombian Product', es: 'Crear un Nuevo Producto Colombiano', fr: 'Créer un Nouveau Produit Colombien', de: 'Neues kolumbianisches Produkt erstellen', it: 'Crea un Nuovo Prodotto Colombiano' },
  adminEditProduct: { en: 'Edit', es: 'Modificar', fr: 'Modifier', de: 'Bearbeiten', it: 'Modifica' },
  adminCancelEdit: { en: 'Cancel editing', es: 'Cancelar edición', fr: 'Annuler la modification', de: 'Bearbeitung abbrechen', it: 'Annulla la modifica' },
  adminCreateCategory: { en: 'Create New Commercial Category', es: 'Crear Nueva Categoría Comercial', fr: 'Créer une nouvelle Catégorie Commerciale', de: 'Neue gewerbliche Kategorie erstellen', it: 'Crea Nuova Categoria Commerciale' },
  adminCategoryName: { en: 'Category Name', es: 'Nombre de la Categoría', fr: 'Nom de la Catégorie', de: 'Kategoriename', it: 'Nome della categoria' },
  adminCategoryDesc: { en: 'Short Description', es: 'Descripción Corta', fr: 'Description rapide', de: 'Kurzbeschreibung', it: 'Breve descrizione' },
  adminSaveCategory: { en: 'Save Category', es: 'Guardar Categoría', fr: 'Enregistrer la catégorie', de: 'Kategorie speichern', it: 'Salva Categoria' },
};

interface LanguageContextProps {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextProps | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('es');

  useEffect(() => {
    // Determine language by IP
    const detectLanguageByIP = async () => {
      try {
        const cachedLang = localStorage.getItem('papagayo_preferred_lang');
        if (cachedLang && ['en', 'es', 'fr', 'de', 'it'].includes(cachedLang)) {
          setLanguage(cachedLang as Language);
          return;
        }

        const res = await fetch('https://ipapi.co/json/');
        if (res.ok) {
          const data = await res.json();
          const country = data.country;
          let newLang: Language = 'en';

          if (country === 'ES' || country === 'CO' || country === 'MX' || country === 'AR' || country === 'CL' || country === 'PE') {
            newLang = 'es';
          } else if (country === 'FR' || country === 'BE' || country === 'CH' || country === 'CA') {
            newLang = 'fr';
          } else if (country === 'DE' || country === 'AT') {
            newLang = 'de';
          } else if (country === 'IT') {
            newLang = 'it';
          }

          setLanguage(newLang);
        }
      } catch (err) {
        console.error('Error detecting IP location for language:', err);
      }
    };
    
    detectLanguageByIP();
  }, []);

  const t = (key: string): string => {
    if (translations[key] && translations[key][language]) {
      return translations[key][language];
    }
    return key;
  };

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('papagayo_preferred_lang', lang);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
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
