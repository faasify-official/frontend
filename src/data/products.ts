import type { Product } from '../types/product'

export const products: Product[] = [
  {
    id: 'minimal-market',
    name: 'Minimal Market',
    category: 'Lifestyle',
    price: 49,
    image:
      'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=1400&q=80',
    description:
      'A clean, modern storefront with curated essentials. Perfect for lifestyle brands wanting a minimal aesthetic.',
    averageRating: 4.8,
    reviews: [
      {
        id: 'rev-1',
        reviewer: 'Elena Rivera',
        rating: 5,
        comment: 'Stunning layout and easy to customize. Loved the onboarding experience!',
      },
      {
        id: 'rev-2',
        reviewer: 'Marcus Lee',
        rating: 4.5,
        comment: 'Great template for launching my home goods shop quickly.',
      },
    ],
  },
  {
    id: 'artisan-atelier',
    name: 'Artisan Atelier',
    category: 'Handmade',
    price: 59,
    image:
      'https://images.unsplash.com/photo-1513128034602-7814ccaddd4e?auto=format&fit=crop&w=1400&q=80',
    description:
      'Showcase handcrafted goods with warmth and storytelling. Includes sections for maker spotlights and reviews.',
    averageRating: 4.9,
    reviews: [
      {
        id: 'rev-3',
        reviewer: 'Priya Verma',
        rating: 5,
        comment: 'My customers love the vibe. The product detail page is top notch!',
      },
      {
        id: 'rev-4',
        reviewer: 'Jonah Fitz',
        rating: 4.7,
        comment: 'Easy to tweak typography and colors to match my brand.',
      },
    ],
  },
  {
    id: 'fresh-bites',
    name: 'Fresh Bites',
    category: 'Food & Beverage',
    price: 45,
    image:
      'https://images.unsplash.com/photo-1523475472560-d2df97ec485c?auto=format&fit=crop&w=1400&q=80',
    description:
      'Built for restaurants and meal prep services with delivery integrations and menu highlights.',
    averageRating: 4.6,
    reviews: [
      {
        id: 'rev-5',
        reviewer: 'Chef Nia',
        rating: 4.5,
        comment: 'Loved the responsive menu sections. Works great on mobile.',
      },
      {
        id: 'rev-6',
        reviewer: 'Carlos Mendez',
        rating: 4.7,
        comment: 'Perfect base for our subscription meal plan storefront.',
      },
    ],
  },
]

