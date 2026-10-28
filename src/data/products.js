export const sampleProducts = [
  {
    id: 'macbook-air-m1',
    name: 'MacBook Air M1',
    category: 'Computing',
    price: 48999,
    condition: 'Excellent',
    description: 'A quiet, capable everyday machine with the original M1 chip and a bright Retina display.',
    image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=1200&q=85',
  },
  {
    id: 'iphone-13',
    name: 'iPhone 13',
    category: 'Mobiles',
    price: 32999,
    condition: 'Good',
    description: 'The familiar all-rounder: crisp cameras, strong battery life, and a timeless aluminium frame.',
    image: 'https://images.unsplash.com/photo-1592286927505-2fd4d5d9ef94?auto=format&fit=crop&w=1200&q=85',
  },
  {
    id: 'sony-wh-1000xm4',
    name: 'Sony WH-1000XM4',
    category: 'Audio',
    price: 16999,
    condition: 'Excellent',
    description: 'Immersive wireless listening with adaptive noise cancellation and a considered, comfortable fit.',
    image: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=1200&q=85',
  },
  {
    id: 'playstation-5',
    name: 'PlayStation 5',
    category: 'Gaming',
    price: 39999,
    condition: 'Good',
    description: 'A clean, fast console setup ready for the next campaign, race, or couch co-op session.',
    image: 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&w=1200&q=85',
  },
  {
    id: 'dell-xps-13',
    name: 'Dell XPS 13',
    category: 'Computing',
    price: 37999,
    condition: 'Good',
    description: 'An understated ultrabook with a sharp display and enough power for work that moves with you.',
    image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=1200&q=85',
  },
  {
    id: 'mechanical-keyboard',
    name: 'Mechanical Keyboard',
    category: 'Accessories',
    price: 6999,
    condition: 'Excellent',
    description: 'Tactile, compact, and built for long sessions at the desk with a satisfying mechanical switch.',
    image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=1200&q=85',
  },
]

export const products = sampleProducts

export const formatPrice = (price) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(price)
