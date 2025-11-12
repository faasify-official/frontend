import type { Storefront } from '../types/storefront'

export const storefronts: Storefront[] = [
  {
    storeId: 'minimal-market',
    name: 'Minimal Market',
    description:
      'A clean, modern storefront with curated essentials. Perfect for lifestyle brands wanting a minimal aesthetic.',
    category: 'Lifestyle',
    image: 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=1400&q=80',
    owner: 'Elena Rivera',
    items: ['item-1', 'item-2', 'item-3', 'item-4'], // Product IDs
  },
  {
    storeId: 'artisan-atelier',
    name: 'Artisan Atelier',
    description:
      'Showcase handcrafted goods with warmth and storytelling. Includes sections for maker spotlights and reviews.',
    category: 'Handmade',
    image: 'https://images.unsplash.com/photo-1513128034602-7814ccaddd4e?auto=format&fit=crop&w=1400&q=80',
    owner: 'Priya Verma',
    items: ['item-5', 'item-6', 'item-7', 'item-8', 'item-9'], // Product IDs
  },
  {
    storeId: 'fresh-bites',
    name: 'Fresh Bites',
    description:
      'Built for restaurants and meal prep services with delivery integrations and menu highlights.',
    category: 'Food & Beverage',
    image: 'https://images.unsplash.com/photo-1523475472560-d2df97ec485c?auto=format&fit=crop&w=1400&q=80',
    owner: 'Chef Nia',
    items: ['item-10', 'item-11', 'item-12', 'item-13', 'item-14', 'item-15'], // Product IDs
  },
]
