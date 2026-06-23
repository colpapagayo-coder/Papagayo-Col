import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { Map as MapIcon, Info, Play, Pause, ChevronRight, Headphones, Award, Compass, Sparkles } from 'lucide-react';
import { getDepartmentCodeFromName, COLOMBIA_DEPARTMENTS } from '../departments';
import { useLanguage } from '../contexts/LanguageContext';

interface DepartmentDetail {
  name: string;
  name_es?: string;
  specialty: string;
  specialty_es?: string;
  story: string;
  story_es?: string;
  audioText: string;
  audioText_es?: string;
  artisanName: string;
  artisanName_es?: string;
  technique: string;
  technique_es?: string;
}

export const COLOMBIA_DEPARTMENT_DETAILS: Record<string, DepartmentDetail> = {
  "CO-QUI": {
    name: "Quindío",
    name_es: "Quindío",
    specialty: "Café de Spécialité & Forêts de Nuages",
    specialty_es: "Café de Especialidad y Selvas de Niebla",
    artisanName: "Famille Herrera & Producteurs ruraux",
    artisanName_es: "Familia Herrera y Productores rurales",
    technique: "Cueillette sélective & lavage d'altitude",
    technique_es: "Recolección selectiva y lavado de altura",
    story: "Niché dans la majestueuse cordillère des Andes, le Quindío est l'âme de la culture caféière. Les collines verdoyantes de la vallée de Cocora, peuplées de palmiers de cire géants, abritent de petites cultures familiales de café de spécialité. Les grains d'arabica y sont récoltés à la main au sommet de leur maturité, puis lavés à l'eau de source pour révéler une tasse douce, fruitée, d'une pureté exceptionnelle.",
    story_es: "Ubicado en la majestuosa cordillera de los Andes, Quindío es el alma de la cultura cafetera. Las colinas verdes del Valle de Cocora, pobladas de palmas de cera gigantes, albergan pequeñas fincas familiares de café de especialidad. Los granos de arábica se cosechan a mano en su punto óptimo y se lavan con agua purísima de manantial.",
    audioText: "Bienvenue dans le Quindío, le grand cœur de notre café d'origine colombienne. Des pentes andines escarpées aux fiers producteurs ruraux, chaque cerise de café est cueillie à la main avec ferveur pour préserver des notes aromatiques douces.",
    audioText_es: "Bienvenido al Quindío, el corazón de nuestro café de origen colombiano. En estas hermosas lomas andinas, cada cereza de café se cosecha a mano para brindar una taza excepcionalmente dulce y suave."
  },
  "CO-LAG": {
    name: "La Guajira",
    name_es: "La Guajira",
    specialty: "Art Ancestral & Tissage Sacré",
    specialty_es: "Arte Ancestral y Tejido Sagrado",
    artisanName: "Tisseuses de la Communauté Indigène Wayuu",
    artisanName_es: "Tejedoras de la Comunidad Indígena Wayuu",
    technique: "Crochet double fil ancestral (motifs Kanaas)",
    technique_es: "Crochet de doble hebra con figuras Kanaas",
    story: "À l'extrême nord de l'Amérique du Sud, là où le désert de La Guajira rencontre la mer des Caraïbes, vit le peuple indigène Wayuu. Les femmes de la tribu y tissent à la main les emblématiques Mochilas. Chaque sac en crochet de couleur est une œuvre d'art unique appelée 'Kanaas', exprimant la faune locale, leur vie quotidienne rurale, leurs rêves secrets et les étoiles de leur désert protecteur.",
    story_es: "En el extremo norte de Colombia, donde el desierto de La Guajira se une con el mar Caribe, vive el pueblo Wayuu. Las mujeres de la etnia tejen las mochilas con figuras geométricas llamadas Kanaas que representan las dunas de su arena sagrada, las estrellas y su maravillosa mitología local.",
    audioText: "Parcourez La Guajira, une terre désertique vibrante. Les tisseuses indigènes de la communauté Wayuu y façonnent avec soin chaque Mochila. Les figures géométriques colorées dessinent la sagesse ancestrale de leur clan.",
    audioText_es: "Explora La Guajira, un desierto vibrante. Aquí las tejedoras Wayuu plasman su sabiduría en mochilas de colores vivos, entrelazando hilos de historia familiar en espirales de crochet."
  },
  "CO-VAC": {
    name: "Valle del Cauca",
    name_es: "Valle del Cauca",
    specialty: "Cacao Ancestral & Chocolat de Domaine",
    specialty_es: "Cacao de Origen y Chocolate de Finca",
    artisanName: "Agroculteurs de Cacao Éco-Responsables",
    artisanName_es: "Agroproductores Ecosostenibles de Cacao",
    technique: "Fermentation lente sous feuilles de bananier",
    technique_es: "Fermentación lenta bajo hojas de plátano",
    story: "Le long des vallées fertiles du Valle del Cauca, caressées par les alizés de l'océan Pacifique sauvage, prospère un microclimat propice au cacao fin d'arôme. Les producteurs locaux y maintiennent avec passion des variétés de cacao natives et biologiques. Fermentées sous feuilles de bananier, les fèves développent un arôme terreux intense et doux, avec de subtils éclats de miel sauvage.",
    story_es: "A lo largo de los fértiles valles del Valle del Cauca, acariciados por el viento del Pacífico, prospera un microclima ideal para el cacao fino de aroma. Los agricultores locales mantienen variedades nativas orgánicas, fermentadas bajo hojas de plátano para desatar notas maderadas y miel silvestre.",
    audioText: "Faites escale au Valle del Cauca. Entre forêts équatoriales et plaines, les familles agroforestières locales y récoltent des cacaos fins et sauvages d'une profondeur aromatique et chocolatée envoûtante.",
    audioText_es: "Viaja al Valle del Cauca. Su tierra húmeda da vida a cacaos finos que los agricultores locales transforman de forma artesanal en chocolates premium puros aromatizados de manera única."
  },
  "CO-COR": {
    name: "Córdoba",
    name_es: "Córdoba",
    specialty: "Tressage Ancestral de Palme",
    specialty_es: "Tejido Ancestral en Caña Flecha",
    artisanName: "Artisans du Peuple Indigène Zenú",
    artisanName_es: "Artesanos del Pueblo Sindicado Zenú",
    technique: "Tissage en spirale de fibres de Caña Flecha",
    technique_es: "Tejido en espiral de fibras de Caña Flecha",
    story: "Dans les riches plaines sédimentaires de Córdoba, les artisans indigènes Zenú perpétuent l'art précolombien de tresser la Caña Flecha. C'est à partir de cette fibre végétale séchée et teinte naturellement à la boue de rivière qu'est né le 'Sombrero Vueltiao', véritable trésor culturel colombien. Ce chapeau souple et d'une durabilité infinie arbore des motifs marquant la mythologie Zenú.",
    story_es: "En las sabanas de Córdoba, los artesanos Zenú mantienen vivo el arte prehispánico de trenzar la Caña Flecha teñida de forma natural con barro de río. Así nace el icónico Sombrero Vueltiao, un tesoro nacional que narra antiguas historias tribales.",
    audioText: "Bienvenue à Córdoba, lieu historique de la culture Zenú. C'est ici que les artisans extraient et filent la Caña Flecha pour créer le Sombrero Vueltiao, magnifique symbole d'art et de résistance ancestrale.",
    audioText_es: "Descubre Córdoba, cuna de los Zenú. De la caña extraen y tiñen hilos para dar forma al Sombrero Vueltiao, una joya representativa de la identidad caribeña colombiana."
  },
  "CO-BOL": {
    name: "Bolívar (Mompox)",
    name_es: "Bolívar (Mompox)",
    specialty: "Orfèvrerie & Filigrane Secrète",
    specialty_es: "Orfebrería en Filigrana de Plata",
    artisanName: "Maîtres Bijoutiers de Mompox",
    artisanName_es: "Maestros Joyeros de la Colonial Mompox",
    technique: "Étirement de fils d'or et d'argent purs",
    technique_es: "Estirado manual y tejido de hilos de plata",
    story: "Mompox est une ville coloniale suspendue au bord du grand fleuve Magdalena. Ses artisans chevronnés y conçoivent la filigrane d'argent, un ornement d'une précision royale issu des lointaines influences arabes et espagnoles. Ils réduisent les métaux précieux en d'infimes fils puis les assemblent à la main pour créer des arabesques fleuries transparentes, légères comme la brise côtière.",
    story_es: "Mompox es una villa colonial detenida a orillas del río Magdalena. Sus talentosos orfebres heredan técnicas andaluzas y árabes para hilar plata pura, moldeando joyas que parecen flotar como encajes ligeros en la brisa.",
    audioText: "Regardez l'histoire de Bolívar et du port colonial de Mompox. Porteurs d'une tradition royale précieuse, ses orfèvres dessinent des fleurs d'argent suspendues, légères comme de la dentelle.",
    audioText_es: "Visita Mompox en Bolívar. Un refugio colonial donde los sabios joyeros tejen hilos de plata pura convirtiéndolos en fina y ligera joyería de encaje."
  },
  "CO-ANT": {
    name: "Antioquia",
    name_es: "Antioquia",
    specialty: "Céramiques Authentiques & Café de Haute Montagne",
    specialty_es: "Vajillas de El Carmen y Café de Finca",
    artisanName: "Artisans Potiers de Carmen de Viboral & Cultivateurs Paysans",
    artisanName_es: "Alfareros de El Carmen de Viboral & Caficultores Rurales",
    technique: "Faïence peinte au pinceau & Récolte des pentes andines",
    technique_es: "Cerámica esmaltada pintada a pincel & Secado natural",
    story: "L'Antioquia est une vaste terre montagneuse très réputée pour sa culture rurale paysanne. La région rayonne par ses céramiques traditionnelles de Carmen de Viboral, décorées d'élégants bouquets de fleurs peints minutieusement à la main, et pour ses majestueux micro-lots de cafés cultivés sur des pentes andines rudes, réputés pour leur corps intense et leur fraîcheur aromatique.",
    story_es: "Antioquia brilla por las vajillas tradicionales de El Carmen de Viboral, decoradas con pinceladas de flores hechas con maestría. Asimismo, sus laderas andinas producen cafés corpulentos elaborados por familias arrieras.",
    audioText: "Découvrez l'Antioquia. De la majesté de ses cultures de café d'altitude aux faïences peintes au pinceau, les artisans y célèbrent la richesse de la nature sauvage et de l'identité paysanne locale.",
    audioText_es: "Conoce Antioquia. Desde sus laderas andinas colmadas de cafetales montañeros hasta las vasijas floreadas de cerámica hechas a mano, sus campos celebran la herencia campesina."
  },
  "CO-NAR": {
    name: "Nariño (Pasto)",
    name_es: "Nariño (Pasto)",
    specialty: "Laque Sacrée Mopa-Mopa",
    specialty_es: "Barniz de Pasto Mopa-Mopa (UNESCO)",
    artisanName: "Maîtres Décorateurs du Barniz de Pasto",
    artisanName_es: "Maestros Decoradores en Madera",
    technique: "Application délicate de résine amazonienne étirée",
    technique_es: "Tracción y fundido de resina salvaje",
    story: "Dans la région andine de Pasto se transmet le mystérieux 'Barniz de Pasto' (inscrit à l'UNESCO). Les artisans récoltent la résine sauvage de l'arbre Mopa-Mopa dans la forêt amazonienne voisine. Chauffée, colorée et étirée manuellement sous forme de pellicule d'une minceur folle, cette laque verte et dorée est fusionnée à chaud sur de grands coffrets de bois précieux.",
    story_es: "En Pasto se atesora el Barniz de Pasto (Patrimonio de la Humanidad). Los artesanos recogen la resina silvestre del árbol Mopa-Mopa en selvas del Amazonas, la tiñen térmicamente y la estiran en asombrosas telas delgadas para sellarla sobre cofres.",
    audioText: "Admirez le savoir-faire de Nariño à travers l'art magique du Barniz de Pasto de tradition précolombienne. Une résine amazonienne est étirée à la main puis collée à chaud pour former une mosaïque de couleurs éternelles.",
    audioText_es: "Admira el tesoro de Nariño: el Barniz de Pasto. Una mágica resina de la selva que se estira y fusiona sobre madera preciosa en coloridos diseños eternos de procedencia prehispánica."
  },
  "CO-SAN": {
    name: "Santander (Barichara)",
    name_es: "Santander (Barichara)",
    specialty: "Tapis de Fique & Taille de Pierre de Grès",
    specialty_es: "Tejidos de Fique y Talla de Piedra Colonial",
    artisanName: "Tailleurs de Pierre à Barichara & Tisseurs de Fique",
    artisanName_es: "Talleristas de Fique y Canteros de Barichara",
    technique: "Sculpture manuelle de grès ocre & artisanat de l'agave",
    technique_es: "Escultura manual de piedra & Deshilado de cardón fique",
    story: "Baigné par le canyon aride du Chicamocha, le Santander abrite le magnifique village colonial de Barichara. Ici, les tailleurs de pierre extraient et sculptent des grès ocres épurés uniques. Les tisseuses de la région dévident les fibres végétales robustes de la plante de Fique pour tresser des tapis épais de terre, des espadrilles et des paniers rustiques raffinés d'une grande beauté.",
    story_es: "Cerca al cañón del Chicamocha está Barichara, donde canteros tallan piedra arenisca y tejedoras de fique deshilachan y trenzan el agave para forjar tapetes rústicos, alpargatas y sacos de alta belleza campestre.",
    audioText: "Parcourez le Santander colonial. Entre les montagnes rudes de Bucaramanga et le village de Barichara, les artisans façonnent la pierre de grès et tissent le Fique pour sculpter des objets de vie simples, durables et élégants.",
    audioText_es: "Adéntrate en Santander. De rocas de arenisca esculpidas con cincel a fibras de fique deshiladas a mano, sus talleres rústicos crean objetos puros con el alma de nuestra tierra campestre."
  },
  "CO-DC": {
    name: "Bogotá, D.C.",
    name_es: "Bogotá, D.C.",
    specialty: "Chocolat Artisanal & Altitude Andine",
    specialty_es: "Chocolate Artesanal y Tradición Cafetera",
    artisanName: "Maîtres Cacaotiers & Chocolatiers Artisans",
    artisanName_es: "Maestros Chocolateros de la Candelaria",
    technique: "Mouture sur pierre & affinage traditionnel",
    technique_es: "Molido en piedra y fusión artesanal",
    story: "Perchée à 2600 mètres d'altitude au cœur de la cordillère orientale, Bogotá est le carrefour culturel de la Colombie. C'est ici, dans le centre historique de La Candelaria, que des artisans chocolatiers transforment des fèves de cacao d'origine native dans le respect le plus pur des traditions ancestrales, alliant saveurs intenses de chocolat de finca de haute qualité.",
    story_es: "Bogotá, situada a 2,600 metros de altura en el corazón andino, es el nexo de la cultura de origen. En La Candelaria, maestros chocolateros transforman el cacao fino de aroma cosechado en fincas orgánicas en selectas barras y bombones de tradición internacional.",
    audioText: "Bienvenue à Bogotá, notre capitale d'altitude andine. C'est ici que convergent les plus belles cultures de cacao et de café de spécialité fine de toute la Colombie colombienne.",
    audioText_es: "Bienvenido a Bogotá, capital de altura andina. Epicentro en donde convergen los mejores granos de cacao orgánico y cafés finos del país."
  }
};

export const DEFAULT_STORY: DepartmentDetail = {
  name: "Colombie Secrète",
  name_es: "Colombia Secreta",
  specialty: "Terroirs Préservés & Traditions",
  specialty_es: "Terruños Preservados y Tradición",
  artisanName: "Familles d'artisans pionniers",
  artisanName_es: "Familias artesanas pioneras",
  technique: "Savoir-faire traditionnel d'origine",
  technique_es: "Saber hacer tradicional y místico",
  story: "Chaque département recèle des trésors inestimables façonnés en silence. Des côtes caraïbes aux chaudes terres andines, des communautés rurales préservent courageusement d'anciennes coutumes dans la vannerie, le cuir naturel et le café de micro-lots pour soutenir le développement créatif local.",
  story_es: "Cada departamento oculta tesoros invaluables creados en silencio. Desde las costas caribes hasta los Andes, agricultores y etnias protegen valientes sus tradiciones y formas de coser y cultivar micro-lotes.",
  audioText: "Bienvenue dans les contrées de la Colombie secrète. En visitant notre carte d'origine, explorez des œuvres uniques façonnées avec art, cœur, patience et dévouement au fil de l'histoire régionale.",
  audioText_es: "Bienvenido a los territorios de la Colombia secreta. Explora obras creadas con arte, alma y paciencia a lo largo de nuestra historia y geografía."
};

export function getStoryForId(id?: string | null): DepartmentDetail {
  if (!id) return DEFAULT_STORY;
  if (COLOMBIA_DEPARTMENT_DETAILS[id]) {
    return COLOMBIA_DEPARTMENT_DETAILS[id];
  }
  const deptObj = COLOMBIA_DEPARTMENTS.find(d => d.id === id);
  const name = deptObj ? deptObj.name : "Colombie Secrète";
  return {
    name: name,
    name_es: name,
    specialty: "Trésor Authentique Local",
    specialty_es: "Tesoro Auténtico Local",
    artisanName: "Artisans & Producteurs de la région",
    artisanName_es: "Artesanos y Productores de la región",
    technique: "Savoir-faire traditionnel d'origine",
    technique_es: "Saber hacer tradicional de origen",
    story: `Découvrez la richesse culturelle et naturelle du département de ${name}. Entre traditions familiales séculaires, fiers caféiculteurs locaux et artisans créatifs, cette région incarne l'excellence d'un terroir authentique où chaque produit raconte une histoire unique de passion, d'art et de transmission humaine.`,
    story_es: `Descubre la riqueza cultural y natural del departamento de ${name}. Entre tradiciones familiares seculares, orgullosos caficultores locales y artesanos creativos, esta región encarna la excelencia de un terruño auténtico donde cada producto cuenta una historia única de pasión, arte y transmisión humana.`,
    audioText: `Bienvenue à ${name}. Parcourez cette région magique à la rencontre de ses fiers artisans et producteurs locaux, qui partagent avec amour des créations authentiques nées des mains, de la terre et de la tradition.`,
    audioText_es: `Bienvenido a ${name}. Recorre esta región mágica para encontrar a sus orgullosos artesanos y productores locales, que comparten con amor creaciones auténticas nacidas de las manos, de la tierra y de la tradición.`
  };
}

export function getEmojiForDept(code: string | null | undefined): string {
  if (!code) return "📍";
  switch (code) {
    case "CO-QUI": return "☕";
    case "CO-LAG": return "🎒";
    case "CO-VAC": return "🍫";
    case "CO-COR": return "👒";
    case "CO-BOL": return "✨";
    case "CO-ANT": return "🏺";
    case "CO-NAR": return "🎨";
    case "CO-SAN": return "🧱";
    case "CO-DC": return "🍫";
    default: return "📍";
  }
}

interface ColombiaMapProps {
  activeDepartmentId?: string | null;
  onSelectDepartment?: (deptId: string | null) => void;
  onDepartmentClick?: (deptId: string | null) => void;
  interactive?: boolean;
  compact?: boolean;
  allowDeselect?: boolean;
}

export function ColombiaMap({ 
  activeDepartmentId, 
  onSelectDepartment, 
  onDepartmentClick, 
  interactive = true, 
  compact = false,
  allowDeselect = true
}: ColombiaMapProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const { language: lang, t } = useLanguage();
  const [unlockedStamps, setUnlockedStamps] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('papagayo_unlocked_stamps');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [tooltip, setTooltip] = useState<{ show: boolean, title: string, desc: string, x: number, y: number }>({
    show: false,
    title: '',
    desc: '',
    x: 0,
    y: 0
  });

  // Track the absolute freshest activeDepartmentId using a Ref to solve standard React + D3 stale closure conflicts
  const activeDeptRef = useRef(activeDepartmentId);
  useEffect(() => {
    activeDeptRef.current = activeDepartmentId;
  }, [activeDepartmentId]);

  const handleSelection = (dept: string | null) => {
    // If we click the same department again, toggle to 'all' (null) only if allowDeselect is true
    const currentActive = activeDeptRef.current;
    const newDept = (currentActive === dept && allowDeselect) ? null : dept;
    
    // Auto-unlock this stamp if it is valid
    if (newDept && !unlockedStamps.includes(newDept)) {
      const updated = [...unlockedStamps, newDept];
      setUnlockedStamps(updated);
      localStorage.setItem('papagayo_unlocked_stamps', JSON.stringify(updated));
    }
    
    if (onSelectDepartment) onSelectDepartment(newDept);
    if (onDepartmentClick) onDepartmentClick(newDept);
  };

  const handleSelectionRef = useRef(handleSelection);
  useEffect(() => {
    handleSelectionRef.current = handleSelection;
  });

  // Audio speech synthesis functions Warmup & Helper
  useEffect(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      // Warm up the voices cache
      window.speechSynthesis.getVoices();
      const handleVoicesChanged = () => {
        window.speechSynthesis.getVoices();
      };
      window.speechSynthesis.addEventListener('voiceschanged', handleVoicesChanged);
      return () => {
        window.speechSynthesis.removeEventListener('voiceschanged', handleVoicesChanged);
      };
    }
  }, []);

  const startListening = (textToRead: string, languageCode: string = 'fr') => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    
    // Safety cancel to reset standard state
    window.speechSynthesis.cancel();

    // A tiny timeout avoids a classic Chromium engine race condition between cancel and speak
    setTimeout(() => {
      try {
        const utterance = new SpeechSynthesisUtterance(textToRead);
        
        let targetLang = 'fr-FR';
        if (languageCode === 'es') targetLang = 'es-ES';
        if (languageCode === 'en') targetLang = 'en-US';
        if (languageCode === 'de') targetLang = 'de-DE';
        if (languageCode === 'it') targetLang = 'it-IT';
        
        utterance.lang = targetLang;
        
        const voices = window.speechSynthesis.getVoices();
        const preferredVoice = voices.find(v => v.lang.startsWith(languageCode));
        if (preferredVoice) {
          utterance.voice = preferredVoice;
        }

        utterance.onstart = () => {
          setIsPlaying(true);
        };
        utterance.onend = () => {
          setIsPlaying(false);
        };
        utterance.onerror = () => {
          setIsPlaying(false);
        };

        window.speechSynthesis.speak(utterance);
        setIsPlaying(true);
      } catch (err) {
        console.error("SpeechSynthesis synthesis error:", err);
        setIsPlaying(false);
      }
    }, 50);
  };

  const stopListening = () => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    setIsPlaying(false);
  };

  // Clean up voice synthesis if the department or component changes
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, [activeDepartmentId]);

  useEffect(() => {
    if (!svgRef.current) return;

    const width = 800;
    const height = 800;
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove(); // Clear previous drawing

    const g = svg.append("g");
    const projection = d3.geoMercator();
    const pathGenerator = d3.geoPath().projection(projection);
    const geojsonUrl = 'https://gist.githubusercontent.com/john-guerra/43c7656821069d00dcbc/raw/be6a6e239cd5b5b803c6e7c2ec405b793a9064dd/Colombia.geo.json';

    d3.json(geojsonUrl).then((data: any) => {
      setLoading(false);
      if (!data) return;

      // Fit map with nice spacing
      projection.fitExtent([[40, 60], [width - 40, height - 60]], data);

      g.selectAll("path")
        .data(data.features)
        .enter()
        .append("path")
        .attr("d", pathGenerator as any)
        .attr("class", "department-path")
        .attr("id", (d: any) => getDepartmentCodeFromName(d.properties.NOMBRE_DPT) || "unknown")
        .style("fill", (d: any) => {
          const code = getDepartmentCodeFromName(d.properties.NOMBRE_DPT);
          const currentActive = activeDeptRef.current;
          if (code === currentActive) {
            return "#23493C"; // Active selection (deep brand green)
          }
          return "#F3EFE3"; // Uniform neutral base region
        })
        .style("stroke", "#FFFFFF")
        .style("stroke-width", "1.5px")
        .style("transition", "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)")
        .style("cursor", interactive ? "pointer" : "default")
        .on("mouseover", function(event, d: any) {
          if (!interactive) return;

          const deptoName = d.properties.NOMBRE_DPT || "Desconocido";
          const code = getDepartmentCodeFromName(deptoName);
          const detail = getStoryForId(code);
          
          setTooltip({
            show: true,
            title: deptoName.charAt(0) + deptoName.slice(1).toLowerCase(),
            desc: detail.specialty,
            x: event.pageX,
            y: event.pageY
          });

          const element = d3.select(this);
          const currentId = element.attr("id");
          const currentActive = activeDeptRef.current;

          if (currentId !== currentActive) {
            element
              .style("fill", "#23493C")
              .style("opacity", "0.7")
              .style("stroke", "#23493C")
              .style("stroke-width", "2px")
              .raise();
          }
        })
        .on("mousemove", (event) => {
          if (!interactive) return;
          setTooltip(prev => ({
            ...prev,
            x: event.pageX,
            y: event.pageY
          }));
        })
        .on("mouseout", function() {
          if (!interactive) return;
          setTooltip(prev => ({ ...prev, show: false }));
          const element = d3.select(this);
          const deptId = element.attr("id");
          const currentActive = activeDeptRef.current;
          
          if (deptId !== currentActive) {
            element
              .style("opacity", "1.0")
              .style("fill", "#F3EFE3")
              .style("stroke", "#FFFFFF")
              .style("stroke-width", "1.5px");
          }
        })
        .on("click", function(event, d: any) {
          if (!interactive) return;
          setTooltip(prev => ({ ...prev, show: false })); // dismiss on click
          const deptoName = d.properties.NOMBRE_DPT || null;
          const code = getDepartmentCodeFromName(deptoName);
          handleSelectionRef.current(code);
        });

      // Clear any markers group if it was rendered
      svg.selectAll(".map-markers-group").remove();

      // Initial highlight of active item
      const currentActive = activeDeptRef.current;
      if (currentActive) {
        g.selectAll("path")
          .filter((d: any) => getDepartmentCodeFromName(d.properties.NOMBRE_DPT) === currentActive)
          .style("fill", "#23493C")
          .style("stroke", "#23493C")
          .style("stroke-width", "2.5px")
          .raise();
      }
    }).catch(err => {
      console.error("CRITICAL: Failed to load Colombia map GeoJSON:", err);
      setLoading(false);
    });
  }, [interactive]);

  // Adjust highlight when prop changes
  useEffect(() => {
    if (loading || !svgRef.current) return;
    const g = d3.select(svgRef.current).select("g");
    
    // Reset all paths
    g.selectAll("path")
      .style("opacity", "1.0")
      .style("fill", "#F3EFE3")
      .style("stroke", "#FFFFFF")
      .style("stroke-width", "1.5px");

    // Highlight active
    if (activeDepartmentId) {
      g.selectAll("path")
        .filter((d: any) => getDepartmentCodeFromName(d.properties.NOMBRE_DPT) === activeDepartmentId)
        .style("fill", "#23493C")
        .style("stroke", "#23493C")
        .style("stroke-width", "2.5px")
        .raise();
    }
  }, [activeDepartmentId, loading]);

  const activeStory = activeDepartmentId ? getStoryForId(activeDepartmentId) : null;

  const getLocalized = (field: keyof DepartmentDetail) => {
    if (!activeStory) return '';
    if (lang === 'fr') return activeStory[field];
    const esField = `${field}_es` as keyof DepartmentDetail;
    return activeStory[esField] || activeStory[field];
  };

  return (
    <div ref={containerRef} className="relative w-full flex flex-col items-center">
      {/* Exquisite Colombia Map Brand Header */}
      {!compact && (
        <div className="w-full text-left mb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-widest text-[#8B5E34] block mb-1">
              {t('sourcingCommunities')}
            </span>
            <h2 className="text-2xl font-bold font-display text-[#302B27]">{t('ourOrigins')}</h2>
            <p className="text-xs text-[#76736A] mt-1 leading-relaxed max-w-lg">
              {t('heroSubtitle')}
            </p>
          </div>
        </div>
      )}

      {loading && (
        <div className="absolute inset-x-0 top-[200px] flex flex-col items-center justify-center z-10 animate-pulse">
          <div className="border-4 border-[#23493C]/10 border-t-[#23493C] rounded-full animate-spin mb-3 w-10 h-10"></div>
          <p className="text-xs text-[#76736A] font-medium font-sans">
            {t('loadingMap')}
          </p>
        </div>
      )}

      {/* SVG Canvas Stage */}
      <div className={`w-full flex items-center justify-center transition-opacity duration-500 relative ${loading ? 'opacity-20' : 'opacity-100'}`}>
        
        {/* Decorative Map Compass Badge on Desktop */}
        {!compact && (
          <div className="absolute top-2 left-2 hidden md:flex items-center space-x-1.5 px-3 py-1.5 bg-white/50 backdrop-blur rounded-xl border border-white/80 text-[10px] font-sans font-bold text-[#76736A] shadow-xs uppercase tracking-wider">
            <Headphones className="w-3.5 h-3.5 text-[#8B5E34]" />
            <span>{t('interactiveAudio')}</span>
          </div>
        )}

        <svg
          ref={svgRef}
          viewBox="0 0 800 800"
          className="w-full h-auto max-w-[500px] md:max-w-[440px] lg:max-w-full drop-shadow-xl select-none"
          style={{ transition: 'all 0.5s ease-in-out' }}
        />
      </div>

      {/* Interactive Story Panel containing French/Spanish audio reader narration */}
      {interactive && !compact && activeStory && activeDepartmentId && (
        <div className="mt-6 w-full text-left bg-white/95 backdrop-blur-xl rounded-3xl p-5 border border-[#23493C]/10 shadow-md animate-fade-in relative overflow-hidden">
          {/* Absolute Background Accent */}
          <div className="absolute top-0 right-0 w-24 h-24 bg-[#23493C]/2 rounded-bl-full pointer-events-none" />

          {/* Card Title & Info */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-3 border-b border-[#23493C]/5">
            <div>
              <div className="text-[9px] uppercase font-extrabold tracking-widest text-[#8B5E34]">
                {getLocalized('specialty')}
              </div>
              <h3 className="font-display text-xl font-bold text-[#302B27] mt-0.5">
                {getLocalized('name')}
              </h3>
            </div>
            <div className="inline-flex items-center space-x-1 px-3 py-1 bg-[#23493C]/5 border border-[#23493C]/10 text-[#23493C] rounded-full text-[10px] font-semibold self-start sm:self-auto uppercase tracking-wide">
              <MapIcon className="w-3.5 h-3.5 mr-1" />
              <span>{t('geoOrigin')}</span>
            </div>
          </div>

          {/* Golden/Emerald Heritage Postmark Stamp badge */}
          {unlockedStamps.includes(activeDepartmentId) && (
            <div className="mt-3.5 flex items-center gap-3.5 p-3 sm:p-4 bg-gradient-to-r from-[#8B5E34]/5 to-transparent border border-[#8B5E34]/15 rounded-2xl animate-fade-in">
              <div className="w-12 h-12 rounded-full border border-dashed border-[#8B5E34] flex items-center justify-center text-2xl font-sans rotate-12 bg-white shrink-0 shadow-md ring-4 ring-[#8B5E34]/5 transition-transform hover:rotate-0 duration-300">
                {getEmojiForDept(activeDepartmentId)}
              </div>
              <div>
                <span className="text-[9px] uppercase font-black text-[#8B5E34] tracking-widest block">
                  {t('stampUnlocked')}
                </span>
                <p className="text-[10px] text-[#76736A] mt-0.5 leading-normal">
                  {t('stampDescPrefix')} {getLocalized('name')} {t('stampDescSuffix')}
                </p>
              </div>
            </div>
          )}

          {/* Core partners & Technique Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 my-3.5 p-3 rounded-2xl bg-[#EFEBE0]/40 border border-white">
            <div>
              <span className="text-[9px] uppercase font-bold text-[#8B5E34] block">
                {t('associatedProducers')}
              </span>
              <span className="text-xs font-semibold text-[#302B27]">
                {getLocalized('artisanName')}
              </span>
            </div>
            <div>
              <span className="text-[9px] uppercase font-bold text-[#8B5E34] block">
                {t('knowHow')}
              </span>
              <span className="text-xs font-semibold text-[#302B27]">
                {getLocalized('technique')}
              </span>
            </div>
          </div>

          {/* Narrative Story */}
          <p className="text-xs lg:text-sm text-[#76736A] leading-relaxed italic my-3 bg-white/40 p-3 rounded-xl border border-black/5">
            "{getLocalized('story')}"
          </p>

          {/* Play/Pause controls with voice synthesizer & scrolling action */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-3.5 border-t border-[#23493C]/5">
            <div className="flex items-center gap-2.5">
              <button
                onClick={() => {
                  if (isPlaying) {
                    stopListening();
                  } else {
                    const audioText = getLocalized('audioText');
                    startListening(audioText, lang);
                  }
                }}
                className={`w-10 h-10 rounded-full flex items-center justify-center cursor-pointer shadow-sm transition-all duration-300 ${
                  isPlaying 
                    ? 'bg-[#8B5E34] text-white hover:scale-105 shadow-[#8B5E34]/20' 
                    : 'bg-[#23493C] text-white hover:bg-[#1C3A30] hover:scale-105 shadow-[#23493C]/10'
                }`}
                title={isPlaying ? t('pauseAudio') : t('listenToHistory')}
              >
                {isPlaying ? (
                  <Pause className="w-4 h-4 fill-current animate-pulse" />
                ) : (
                  <Play className="w-4 h-4 fill-current translate-x-0.5" />
                )}
              </button>
              
              <div>
                <div className="text-xs font-bold text-[#302B27] uppercase tracking-wider flex items-center gap-1.5">
                  {isPlaying ? (
                    <>
                      <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-ping" />
                      <span className="text-red-600 animate-pulse">
                        {t('audioPlaying')}
                      </span>
                    </>
                  ) : (
                    t('listenToHistoryAI')
                  )}
                </div>
                <div className="text-[9px] text-[#76736A] uppercase font-medium tracking-wide">
                  {isPlaying ? t('aiNarrator') : t('clickToPlay')}
                </div>
              </div>

              {/* Animated Wave Equalizer */}
              {isPlaying && (
                <div className="flex items-end gap-[2px] h-4 px-2 overflow-hidden">
                  <span className="w-0.5 bg-[#8B5E34] rounded-full animate-bounce [animation-duration:0.6s]" style={{ height: '100%' }} />
                  <span className="w-0.5 bg-[#8B5E34] rounded-full animate-bounce [animation-duration:0.4s]" style={{ height: '50%' }} />
                  <span className="w-0.5 bg-[#8B5E34] rounded-full animate-bounce [animation-duration:0.8s]" style={{ height: '75%' }} />
                  <span className="w-0.5 bg-[#8B5E34] rounded-full animate-bounce [animation-duration:0.5s]" style={{ height: '30%' }} />
                </div>
              )}
            </div>

            {/* Down-Scroll Catalog trigger */}
            <button
              onClick={() => {
                if (onSelectDepartment) onSelectDepartment(activeDepartmentId);
                setTimeout(() => {
                  const el = document.getElementById('products-list');
                  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }, 80);
              }}
              className="px-4 py-2 bg-[#23493C]/5 hover:bg-[#23493C] border border-[#23493C]/20 hover:border-[#23493C] text-[#23493C] hover:text-white text-[10px] font-extrabold uppercase tracking-widest rounded-xl transition-all duration-300 cursor-pointer flex items-center self-start sm:self-auto"
            >
              <span>{t('viewProducts')}</span>
              <ChevronRight className="w-3.5 h-3.5 ml-1" />
            </button>
          </div>
        </div>
      )}

      {/* COLLECTOR PASSPORT SECTION (Pasaporte de Sourcing Colombiano) */}
      {interactive && !compact && (
        <div className="mt-6 w-full text-left bg-gradient-to-br from-[#FDFCF7] to-[#F3EFE3] rounded-3xl p-5 border border-[#8B5E34]/20 shadow-md shadow-[#8B5E34]/5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-[#8B5E34]/3 rounded-bl-full pointer-events-none" />
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#8B5E34]/10 mb-4 gap-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-[#8B5E34]/10 rounded-xl text-[#8B5E34]">
                <Award className="w-5 h-5 text-[#8B5E34]" />
              </div>
              <div>
                <h4 className="font-display text-sm font-bold text-[#302B27] uppercase tracking-wide">
                  {t('passportTitle')}
                </h4>
                <p className="text-[10px] text-[#76736A] mt-0.5">
                  {t('passportDesc')}
                </p>
              </div>
            </div>
            
            {/* Rank Badge */}
            <span className="px-2.5 py-1 bg-[#23493C]/5 border border-[#23493C]/10 text-[9px] font-extrabold uppercase tracking-widest text-[#23493C] rounded-lg self-start sm:self-auto">
              {unlockedStamps.length <= 1 
                ? t('rankNovice')
                : unlockedStamps.length <= 3 
                  ? t('rankTraveler') 
                  : unlockedStamps.length < 5 
                    ? t('rankCollector') 
                    : t('rankCurator')
              }
            </span>
          </div>

          {/* Stamps Wallet Display */}
          <div className="grid grid-cols-5 gap-3 my-3">
            {[
              { id: "CO-QUI", short: "CO-QUI", name: "Quindío", specialty: "Café de Spécialité", specialty_es: "Café de Especialidad", emoji: "☕", bg: "bg-[#8B5E34]" },
              { id: "CO-LAG", short: "CO-LAG", name: "La Guajira", specialty: "Art Wayuu", specialty_es: "Arte Wayuu", emoji: "🎒", bg: "bg-[#FF8C00]" },
              { id: "CO-VAC", short: "CO-VAC", name: "Valle del Cauca", specialty: "Cacao Ancestral", specialty_es: "Cacao Ancestral", emoji: "🍫", bg: "bg-[#4B3621]" },
              { id: "CO-COR", short: "CO-COR", name: "Córdoba", specialty: "Caña Flecha", specialty_es: "Sombrero Vueltiao", emoji: "👒", bg: "bg-[#D4AF37]" },
              { id: "CO-BOL", short: "CO-BOL", name: "Bolívar", specialty: "Filigrane d'Argent", specialty_es: "Filigrana de Plata", emoji: "✨", bg: "bg-[#3A5FCD]" }
            ].map((st) => {
              const isUnlocked = unlockedStamps.includes(st.id);
              const isActive = activeDepartmentId === st.id;

              return (
                <button
                  key={st.id}
                  onClick={() => {
                    handleSelection(st.id);
                    // Scroll map to top of view to focus on selected region
                    const container = containerRef.current;
                    if (container) {
                      container.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }
                  }}
                  className={`relative flex flex-col items-center justify-center p-2 rounded-2xl border transition-all duration-300 group cursor-pointer ${
                    isActive 
                      ? 'border-[#23493C] bg-white ring-2 ring-[#23493C]/10 scale-105 shadow-sm' 
                      : isUnlocked 
                        ? 'border-[#8B5E34]/30 bg-white/60 hover:bg-white hover:border-[#8B5E34]/60' 
                        : 'border-dashed border-slate-200 opacity-45 grayscale hover:opacity-75 hover:grayscale-0 bg-[#EFEBE0]/20'
                  }`}
                  title={`${st.name} - ${lang === 'fr' ? st.specialty : (st.specialty_es || st.specialty)} (${t('clickToView')})`}
                >
                  {/* Circle Stamp */}
                  <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-xs sm:text-lg shadow-inner border border-white/60 transition-transform duration-300 group-hover:rotate-12 ${
                    isUnlocked ? `${st.bg} text-white` : 'bg-slate-100 text-slate-400'
                  }`}>
                    {st.emoji}
                  </div>

                  {/* Stamp Label */}
                  <span className="text-[8px] font-bold uppercase mt-1 tracking-wider text-[#302B27]">
                    {st.name.substring(0, 7)}
                  </span>

                  {/* Stamp status check */}
                  {isUnlocked && (
                    <span className="absolute -top-1 -right-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-[#23493C] text-[7px] text-white font-black shadow-sm">
                      ✓
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Stamps Progression Status */}
          <div className="flex items-center justify-between mt-3.5 pt-3 border-t border-[#8B5E34]/10">
            <span className="text-[10px] text-[#76736A] font-medium">
              {unlockedStamps.filter(uid => ["CO-QUI","CO-LAG","CO-VAC","CO-COR","CO-BOL"].includes(uid)).length} / 5 {t('progressUnlocked')}
            </span>

            {/* Clear Stamps button */}
            {unlockedStamps.length > 0 && (
              <div className="flex items-center gap-2">
                {!showResetConfirm ? (
                  <button
                    onClick={() => setShowResetConfirm(true)}
                    className="text-[10px] font-bold text-red-600 hover:text-red-700 hover:underline cursor-pointer transition-all uppercase tracking-wider"
                  >
                    {t('resetProgress')}
                  </button>
                ) : (
                  <div className="flex items-center gap-2 animate-fade-in bg-red-50 px-2 py-1 rounded-lg border border-red-200">
                    <span className="text-[9px] font-medium text-red-700">
                      {t('resetConfirm')}
                    </span>
                    <button
                      onClick={() => {
                        setUnlockedStamps([]);
                        localStorage.removeItem('papagayo_unlocked_stamps');
                        setShowResetConfirm(false);
                      }}
                      className="px-1.5 py-0.5 bg-red-600 text-[8px] font-black text-white uppercase rounded hover:bg-red-700 transition cursor-pointer"
                    >
                      {t('yes')}
                    </button>
                    <button
                      onClick={() => setShowResetConfirm(false)}
                      className="px-1.5 py-0.5 bg-slate-200 text-[8px] font-black text-slate-700 uppercase rounded hover:bg-slate-300 transition cursor-pointer"
                    >
                      {t('no')}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Floating hover tooltip for desktop guide */}
      {tooltip.show && interactive && (
        <div 
          className="fixed pointer-events-none z-[100] transform -translate-x-1/2 -translate-y-full mt-[-20px] transition-opacity duration-200"
          style={{ 
            left: tooltip.x, 
            top: tooltip.y,
            opacity: tooltip.show ? 1 : 0
          }}
        >
          <div className="bg-white/95 backdrop-blur-xl border border-slate-200 shadow-xl rounded-2xl p-4 w-60 relative">
            <div className="absolute bottom-[-8px] left-1/2 transform -translate-x-1/2 w-4 h-4 bg-white border-b border-r border-slate-200 rotate-45"></div>
            
            <div className="relative z-10 text-left">
              <div className="flex items-center justify-between mb-1.5">
                <h3 className="text-sm font-bold text-slate-800">{tooltip.title}</h3>
                {COLOMBIA_DEPARTMENT_DETAILS[getDepartmentCodeFromName(tooltip.title) || ""] && (
                  <span className="px-1.5 py-0.5 bg-yellow-100 text-[#8B5E34] text-[8px] font-extrabold tracking-widest uppercase rounded-md">Origine</span>
                )}
              </div>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">
                {tooltip.desc}
              </p>
              <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center text-[10px] text-slate-400 font-bold gap-1 uppercase tracking-wider">
                <Info className="w-3.5 h-3.5 text-[#23493C]" />
                <span>Cliquer pour Explorer</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
