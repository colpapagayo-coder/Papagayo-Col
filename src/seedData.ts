import { dbService } from './supabase';

const SEED_PRODUCTS = [
  {
    name: 'Café Supremo',
    description: 'Un café d\'exception cultivé en haute altitude, offrant des notes florales et une acidité brillante. Parfait pour les méthodes douces.',
    departmentCode: 'CO-QUI',
    base64Image: 'https://images.unsplash.com/photo-1559525839-b184a4d698c7?q=80&w=800&auto=format&fit=crop',
    prices: { FR: 18.5, ES: 22.0, DE: 20.0, IT: 21.0 },
    category: 'Café de Spécialité'
  },
  {
    name: 'Mochila Wayuu',
    description: 'Sac artisanal tissé à la main par les femmes de la communauté Wayuu. Chaque motif géométrique raconte une histoire unique du désert.',
    departmentCode: 'CO-LAG',
    base64Image: 'https://images.unsplash.com/photo-1605814578550-abddcb96911c?q=80&w=800&auto=format&fit=crop',
    prices: { FR: 85.0, ES: 90.0, DE: 80.0, IT: 88.0 },
    category: 'Artisanat Wayuu & Zenú'
  },
  {
    name: 'Cacao Caleño',
    description: 'Fèves de cacao finement torréfiées issues des vallées chaudes. Arômes intenses de fruits rouges et de noix grillées.',
    departmentCode: 'CO-VAC',
    base64Image: 'https://images.unsplash.com/photo-1614088924823-380ff9fbc7bd?q=80&w=800&auto=format&fit=crop',
    prices: { FR: 12.0, ES: 15.0, DE: 14.0, IT: 13.5 },
    category: 'Cacao & Chocolat de Finca'
  },
  {
    name: 'Sombrero Vueltiao',
    description: 'Le chapeau traditionnel emblématique de la Colombie, tressé à partir de fibres de canne flèche, symbole de la culture caribéenne.',
    departmentCode: 'CO-COR',
    base64Image: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=800&auto=format&fit=crop',
    prices: { FR: 60.0, ES: 65.0, DE: 62.0, IT: 64.0 },
    category: 'Artisanat Wayuu & Zenú'
  },
  {
    name: 'Chocolat d\'Altitude Candelaria',
    description: 'Tablette de chocolat bio fine fleur à 85% de cacao récolté en finca organique et façonné lentement à Bogotá dans le quartier historique de La Candelaria.',
    departmentCode: 'CO-DC',
    base64Image: 'https://images.unsplash.com/photo-1548907040-4d42b52115ca?q=80&w=800&auto=format&fit=crop',
    prices: { FR: 9.50, ES: 11.00, DE: 10.00, IT: 10.50 },
    category: 'Cacao & Chocolat de Finca'
  },
  {
    name: 'Boucles d\'Oreilles Filigrane Mompox',
    description: 'Sublimes boucles d\'oreilles faites de fins fils d\'argent tressés à la main par des orfèvres de Mompox selon les traditions coloniales.',
    departmentCode: 'CO-BOL',
    base64Image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=800&auto=format&fit=crop',
    prices: { FR: 75.00, ES: 80.00, DE: 78.00, IT: 79.00 },
    category: 'Orfèvrerie & Bijoux'
  },
  {
    name: 'Céramique Carmen de Viboral',
    description: 'Magnifique assiette artisanale en faïence, façonnée à la main et peinte minutieusement au pinceau avec les motifs floraux emblématiques d\'Antioquia.',
    departmentCode: 'CO-ANT',
    base64Image: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?q=80&w=800&auto=format&fit=crop',
    prices: { FR: 32.00, ES: 35.00, DE: 34.00, IT: 33.50 },
    category: 'Artisanat Wayuu & Zenú'
  },
  {
    name: 'Coffret Sacré Barniz de Pasto',
    description: 'Un coffret en bois d\'exception recouvert de résine sauvage Mopa-Mopa, étirée en films fins et appliquée à chaud, une pratique classée à l\'UNESCO.',
    departmentCode: 'CO-NAR',
    base64Image: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=800&auto=format&fit=crop',
    prices: { FR: 110.00, ES: 120.00, DE: 115.00, IT: 118.00 },
    category: 'Artisanat Wayuu & Zenú'
  },
  {
    name: 'Tapis de Fique de Barichara',
    description: 'Tapis rustique et moderne, entièrement tissé à la main à partir de fibres végétales de fique (agave durable) par les tisseuses traditionnelles de Santander.',
    departmentCode: 'CO-SAN',
    base64Image: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?q=80&w=800&auto=format&fit=crop',
    prices: { FR: 95.00, ES: 105.00, DE: 100.00, IT: 98.00 },
    category: 'Artisanat Wayuu & Zenú'
  }
];

export async function seedDatabase(userId: string) {
  try {
    for (let i = 0; i < SEED_PRODUCTS.length; i++) {
      const product = SEED_PRODUCTS[i];
      await dbService.insertProduct({
        ...product,
        ownerId: userId,
        createdAt: Date.now()
      });
    }
  } catch (error) {
    console.error("Error seeding data:", error);
    alert("Une erreur s'est produite lors de l'ajout des exemples.");
  }
}
