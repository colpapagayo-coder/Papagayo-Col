import { supabase } from './supabase';

const SEED_PRODUCTS = [
  {
    name: 'Café Supremo',
    description: 'Un café d\'exception cultivé en haute altitude, offrant des notes florales et une acidité brillante. Parfait pour les méthodes douces.',
    departmentCode: 'CO-QUI',
    base64Image: 'https://images.unsplash.com/photo-1559525839-b184a4d698c7?q=80&w=800&auto=format&fit=crop',
    prices: { FR: 18.5, ES: 22.0, DE: 20.0, IT: 21.0 }
  },
  {
    name: 'Mochila Wayuu',
    description: 'Sac artisanal tissé à la main par les femmes de la communauté Wayuu. Chaque motif géométrique raconte une histoire unique du désert.',
    departmentCode: 'CO-LAG',
    base64Image: 'https://images.unsplash.com/photo-1605814578550-abddcb96911c?q=80&w=800&auto=format&fit=crop',
    prices: { FR: 85.0, ES: 90.0, DE: 80.0, IT: 88.0 }
  },
  {
    name: 'Cacao Caleño',
    description: 'Fèves de cacao finement torréfiées issues des vallées chaudes. Arômes intenses de fruits rouges et de noix grillées.',
    departmentCode: 'CO-VAC',
    base64Image: 'https://images.unsplash.com/photo-1614088924823-380ff9fbc7bd?q=80&w=800&auto=format&fit=crop',
    prices: { FR: 12.0, ES: 15.0, DE: 14.0, IT: 13.5 }
  },
  {
    name: 'Sombrero Vueltiao',
    description: 'Le chapeau traditionnel emblématique de la Colombie, tressé à partir de fibres de canne flèche, symbole de la culture caribéenne.',
    departmentCode: 'CO-COR',
    base64Image: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=800&auto=format&fit=crop',
    prices: { FR: 60.0, ES: 65.0, DE: 62.0, IT: 64.0 }
  }
];

export async function seedDatabase(userId: string) {
  try {
    const now = Date.now();
    
    for (let i = 0; i < SEED_PRODUCTS.length; i++) {
      const product = SEED_PRODUCTS[i];
      const { error } = await supabase.from('products').insert({
        ...product,
        ownerId: userId,
        createdAt: now - (i * 1000) // Ensure stable ordering
      });
      
      if (error) {
        throw error;
      }
    }
  } catch (error) {
    console.error("Error seeding data:", error);
    alert("Une erreur s'est produite lors de l'ajout des exemples. Assurez-vous que la table 'products' existe dans Supabase.");
  }
}
