import ChairIcon from '@mui/icons-material/Chair';
import CheckroomIcon from '@mui/icons-material/Checkroom';
import DevicesIcon from '@mui/icons-material/Devices';
import FaceRetouchingNaturalIcon from '@mui/icons-material/FaceRetouchingNatural';
import LocalGroceryStoreIcon from '@mui/icons-material/LocalGroceryStore';
import PhoneIphoneIcon from '@mui/icons-material/PhoneIphone';
import RunCircleIcon from '@mui/icons-material/RunCircle';

export const categories = [
  { name: 'Fashion', icon: CheckroomIcon, color: '#6C63FF' },
  { name: 'Electronics', icon: DevicesIcon, color: '#10B981' },
  { name: 'Shoes', icon: RunCircleIcon, color: '#F59E0B' },
  { name: 'Beauty', icon: FaceRetouchingNaturalIcon, color: '#EF4444' },
  { name: 'Furniture', icon: ChairIcon, color: '#8B5CF6' },
  { name: 'Mobiles', icon: PhoneIphoneIcon, color: '#2563EB' },
  { name: 'Grocery', icon: LocalGroceryStoreIcon, color: '#059669' },
];

const mkImages = (primary, extra) => [primary, ...(extra || [])];

export const products = [
  {
    id: 'p1',
    name: 'Nike Air Pulse Runner',
    brand: 'Nike',
    category: 'Shoes',
    price: 129,
    oldPrice: 179,
    discount: 28,
    rating: 4.8,
    numReviews: 1287,
    badge: '28% off',
    countInStock: 42,
    images: mkImages(
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1200&q=80',
      [
        'https://images.unsplash.com/photo-1528701800489-20be3c2ea3e7?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1543163521-1bf539c55dd5?auto=format&fit=crop&w=1200&q=80',
      ]
    ),
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1200&q=80',
    description: 'Responsive everyday running shoes with lightweight mesh, breathable comfort, and premium cushioning for daily miles.',
    specs: ['Breathable mesh upper', 'Cushioned midsole', 'Grippy rubber outsole'],
  },
  {
    id: 'p2',
    name: 'Adidas Cloud Sprint',
    brand: 'Adidas',
    category: 'Shoes',
    price: 109,
    oldPrice: 149,
    discount: 18,
    rating: 4.6,
    numReviews: 932,
    badge: '18% off',
    countInStock: 33,
    images: mkImages(
      'https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&w=1200&q=80',
      [
        'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1528701800489-20be3c2ea3e7?auto=format&fit=crop&w=1200&q=80',
      ]
    ),
    description: 'Lightweight training shoe built for all-day comfort and a stable, springy ride on pavement or track.',
    specs: ['Supportive heel counter', 'Cloud-soft cushioning', 'Durable outsole'],
  },
  {
    id: 'p3',
    name: 'Puma Street Motion',
    brand: 'Puma',
    category: 'Shoes',
    price: 98,
    oldPrice: 129,
    rating: 4.4,
    numReviews: 604,
    badge: 'Best seller',
    countInStock: 18,
    images: mkImages(
      'https://images.unsplash.com/photo-1514989940723-e8e51635b782?auto=format&fit=crop&w=1200&q=80',
      [
        'https://images.unsplash.com/photo-1528701800489-20be3c2ea3e7?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1506806732259-39c2d0268443?auto=format&fit=crop&w=1200&q=80',
      ]
    ),
    description: 'Clean street sneaker with breathable panels, responsive foam cushioning, and an everyday-ready silhouette.',
    specs: ['Breathable upper', 'Responsive foam', 'Everyday traction'],
  },
  {
    id: 'p4',
    name: 'Apple Studio Watch',
    brand: 'Apple',
    category: 'Electronics',
    price: 399,
    oldPrice: 459,
    discount: 13,
    rating: 4.9,
    numReviews: 5120,
    badge: 'New',
    countInStock: 24,
    images: mkImages(
      'https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?auto=format&fit=crop&w=1200&q=80',
      [
        'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1531297484001-80022131f5a1?auto=format&fit=crop&w=1200&q=80',
      ]
    ),
    description: 'Smart health, notifications, fitness insights, and all-day battery in one polished wearable.',
    specs: ['Health sensors', 'All-day battery', 'Water resistant'],
  },
  {
    id: 'p5',
    name: 'Samsung NeoView 4K',
    brand: 'Samsung',
    category: 'Electronics',
    price: 849,
    oldPrice: 999,
    discount: 15,
    rating: 4.7,
    numReviews: 2488,
    badge: 'Hot',
    countInStock: 9,
    images: mkImages(
      'https://images.unsplash.com/photo-1593305841991-05c297ba4575?auto=format&fit=crop&w=1200&q=80',
      [
        'https://images.unsplash.com/photo-1580917868643-8f1a2e3e5b45?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=1200&q=80',
      ]
    ),
    description: 'Cinematic 4K panel with rich contrast, smart apps, and low-latency gaming mode for sharper action.',
    specs: ['4K resolution', 'Smart apps', 'Gaming mode'],
  },
  {
    id: 'p6',
    name: 'Sony Pulse Speaker',
    brand: 'Sony',
    category: 'Electronics',
    price: 179,
    oldPrice: 229,
    discount: 22,
    rating: 4.5,
    numReviews: 876,
    badge: 'Trending',
    countInStock: 27,
    images: mkImages(
      'https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=1200&q=80',
      [
        'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1518232676118-0fdb2f8e8a2b?auto=format&fit=crop&w=1200&q=80',
      ]
    ),
    description: 'Compact wireless speaker with room-filling sound, deep bass, and smooth Bluetooth pairing.',
    specs: ['Deep bass tuning', 'Bluetooth pairing', 'Compact carry design'],
  },
  {
    id: 'p7',
    name: 'Aurora Lounge Chair',
    brand: 'Aurora',
    category: 'Furniture',
    price: 249,
    oldPrice: 319,
    discount: 22,
    rating: 4.6,
    numReviews: 311,
    badge: 'Sale',
    countInStock: 12,
    images: mkImages(
      'https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?auto=format&fit=crop&w=1200&q=80',
      [
        'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=1200&q=80',
      ]
    ),
    description: 'Modern lounge seating with durable fabric, angled wooden legs, and a compact profile that fits any room.',
    specs: ['Durable upholstery', 'Comfort foam', 'Easy assembly'],
  },
  {
    id: 'p8',
    name: 'Nord Desk Table',
    brand: 'Nord',
    category: 'Furniture',
    price: 329,
    oldPrice: 389,
    discount: 15,
    rating: 4.7,
    numReviews: 529,
    badge: 'New',
    countInStock: 6,
    images: mkImages(
      'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80',
      [
        'https://images.unsplash.com/photo-1519710164239-da123dc03ef4?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80',
      ]
    ),
    description: 'Minimal work desk with a durable finish and generous surface area—built for focus, study, and home offices.',
    specs: ['Spill-resistant top', 'Cable-friendly design', 'Sturdy legs'],
  },
  {
    id: 'p9',
    name: 'Studio Storage Shelf',
    brand: 'Studio',
    category: 'Furniture',
    price: 189,
    oldPrice: 239,
    rating: 4.4,
    numReviews: 214,
    badge: 'Limited',
    countInStock: 15,
    images: mkImages(
      'https://images.unsplash.com/photo-1581539250439-c96689b516dd?auto=format&fit=crop&w=1200&q=80',
      [
        'https://images.unsplash.com/photo-1519710164239-da123dc03ef4?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1200&q=80',
      ]
    ),
    description: 'Open shelving unit designed for books, decor, and everyday storage—stable, stylish, and easy to assemble.',
    specs: ['Open storage', 'Sturdy build', 'Fits small spaces'],
  },
  {
    id: 'p10',
    name: 'Hydra Dew Serum Set',
    brand: 'Hydra',
    category: 'Beauty',
    price: 74,
    oldPrice: 99,
    discount: 25,
    rating: 4.5,
    numReviews: 781,
    badge: 'Bundle',
    countInStock: 60,
    images: mkImages(
      'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=1200&q=80',
      [
        'https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?auto=format&fit=crop&w=1200&q=80',
      ]
    ),
    description: 'Curated serum, moisturizer, cleanser, and SPF routine for daily skin care—hydration you can feel.',
    specs: ['Hydrating serum', 'Gentle cleanser', 'Daily SPF support'],
  },
  {
    id: 'p11',
    name: 'GlowLab Skin Ritual Kit',
    brand: 'GlowLab',
    category: 'Beauty',
    price: 74,
    oldPrice: 99,
    discount: 25,
    rating: 4.5,
    numReviews: 1024,
    badge: 'Bundle',
    countInStock: 44,
    images: mkImages(
      'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=1200&q=80',
      [
        'https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?auto=format&fit=crop&w=1200&q=80',
      ]
    ),
    description: 'Curated serum, moisturizer, cleanser, and SPF routine for daily skin care—designed for a healthy glow.',
    specs: ['Glow-supporting routine', 'Lightweight moisturizer', 'AM/PM friendly'],
  },
  {
    id: 'p12',
    name: 'Velvet Glow Lip Set',
    brand: 'Velvet Glow',
    category: 'Beauty',
    price: 42,
    oldPrice: 58,
    discount: 27,
    rating: 4.3,
    numReviews: 388,
    badge: 'Hot',
    countInStock: 70,
    images: mkImages(
      'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=1200&q=80',
      [
        'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=1200&q=80',
      ]
    ),
    description: 'Soft matte lip collection with rich color payoff and a smooth, comfortable finish.',
    specs: ['Buildable coverage', 'Comfort matte', 'Long-wear feel'],
  },
  {
    id: 'p13',
    name: 'Pixel Edge Pro',
    brand: 'Pixel',
    category: 'Mobiles',
    price: 699,
    oldPrice: 799,
    discount: 13,
    rating: 4.8,
    numReviews: 2045,
    badge: 'Top rated',
    countInStock: 21,
    images: mkImages(
      'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=1200&q=80',
      [
        'https://images.unsplash.com/photo-1616410011236-7a42121dd981?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?auto=format&fit=crop&w=1200&q=80',
      ]
    ),
    description: 'Flagship smartphone with a bright OLED display, pro-grade cameras, and AI features for everyday creators.',
    specs: ['OLED display', 'Pro camera system', 'AI-assisted tools'],
  },
  {
    id: 'p14',
    name: 'OnePlus Nova X',
    brand: 'OnePlus',
    category: 'Mobiles',
    price: 599,
    oldPrice: 679,
    discount: 12,
    rating: 4.7,
    numReviews: 1450,
    badge: 'New',
    countInStock: 16,
    images: mkImages(
      'https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=1200&q=80',
      [
        'https://images.unsplash.com/photo-1616410011236-7a42121dd981?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?auto=format&fit=crop&w=1200&q=80',
      ]
    ),
    description: 'Fast-charging smartphone with a smooth display, clean design, and reliable all-day performance.',
    specs: ['Fast charge support', 'Fluid display', 'All-day performance'],
  },
  {
    id: 'p15',
    name: 'Xiaomi Lite Plus',
    brand: 'Xiaomi',
    category: 'Mobiles',
    price: 449,
    oldPrice: 499,
    discount: 10,
    rating: 4.4,
    numReviews: 980,
    badge: 'Value',
    countInStock: 28,
    images: mkImages(
      'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?auto=format&fit=crop&w=1200&q=80',
      [
        'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?auto=format&fit=crop&w=1200&q=80',
      ]
    ),
    description: 'Balanced phone with strong battery life, sharp display quality, and quick unlock for daily use.',
    specs: ['Battery-focused design', 'Crisp screen', 'Quick unlock'],
  },
  {
    id: 'p16',
    name: 'Organic Pantry Pack',
    brand: 'Harvest',
    category: 'Grocery',
    price: 39,
    oldPrice: 49,
    discount: 20,
    rating: 4.6,
    numReviews: 312,
    badge: 'Fresh',
    countInStock: 120,
    images: mkImages(
      'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=1200&q=80',
      [
        'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=1200&q=80',
      ]
    ),
    description: 'Weekly essentials bundle with grains, snacks, and everyday kitchen staples—ready to stock your pantry.',
    specs: ['Organic pantry staples', 'Everyday variety', 'Convenient bundle'],
  },
  {
    id: 'p17',
    name: 'Harvest Fruit Box',
    brand: 'Harvest',
    category: 'Grocery',
    price: 28,
    oldPrice: 35,
    discount: 20,
    rating: 4.5,
    numReviews: 410,
    badge: 'Seasonal',
    countInStock: 86,
    images: mkImages(
      'https://images.unsplash.com/photo-1577234286642-fc512a5f8f11?auto=format&fit=crop&w=1200&q=80',
      [
        'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1200&q=80',
      ]
    ),
    description: 'Hand-picked seasonal fruit box packed fresh for everyday snacking—sweet, juicy, and ready to enjoy.',
    specs: ['Seasonal selection', 'Fresh-packed', 'Snack-ready variety'],
  },
  {
    id: 'p18',
    name: 'Kitchen Staples Kit',
    brand: 'NovaMart',
    category: 'Grocery',
    price: 56,
    oldPrice: 68,
    discount: 18,
    rating: 4.4,
    numReviews: 245,
    badge: 'Saver',
    countInStock: 64,
    images: mkImages(
      'https://images.unsplash.com/photo-1518843875459-f738682238a6?auto=format&fit=crop&w=1200&q=80',
      [
        'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1200&q=80',
      ]
    ),
    description: 'Practical pantry stock-up with grains, pulses, spices, and everyday cooking essentials for busy weeks.',
    specs: ['Cooking staples', 'Pantry-ready', 'Great bundle value'],
  },
  {
    id: 'p19',
    name: 'Cotton Curve Shirt',
    brand: 'Zara',
    category: 'Fashion',
    price: 54,
    oldPrice: 72,
    discount: 25,
    rating: 4.6,
    numReviews: 702,
    badge: 'Fresh drop',
    countInStock: 40,
    images: mkImages(
      'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1200&q=80',
      [
        'https://images.unsplash.com/photo-1523398002811-999ca8dec234?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1523398002811-999ca8dec234?auto=format&fit=crop&w=1200&q=80',
      ]
    ),
    description: 'Everyday shirt with a clean fit, soft cotton feel, and a modern finish for effortless styling.',
    specs: ['Soft cotton', 'Modern fit', 'Breathable comfort'],
  },
  {
    id: 'p20',
    name: 'Metro Layer Jacket',
    brand: 'Zara',
    category: 'Fashion',
    price: 118,
    oldPrice: 149,
    discount: 21,
    rating: 4.7,
    numReviews: 531,
    badge: 'Popular',
    countInStock: 22,
    images: mkImages(
      'https://images.unsplash.com/photo-1523398002811-999ca8dec234?auto=format&fit=crop&w=1200&q=80',
      [
        'https://images.unsplash.com/photo-1523398002811-999ca8dec234?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?auto=format&fit=crop&w=1200&q=80',
      ]
    ),
    description: 'Lightweight jacket with structured lines and easy layering—built for comfort through changing seasons.',
    specs: ['Layer-friendly design', 'Lightweight build', 'Structured silhouette'],
  },
  {
    id: 'p21',
    name: 'Everyday Slim Jeans',
    brand: 'Zara',
    category: 'Fashion',
    price: 66,
    oldPrice: 89,
    discount: 26,
    rating: 4.5,
    numReviews: 1244,
    badge: 'Best seller',
    countInStock: 48,
    images: mkImages(
      'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=1200&q=80',
      [
        'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=1200&q=80',
      ]
    ),
    description: 'Classic denim with stretch comfort and a versatile slim silhouette—made for everyday wear.',
    specs: ['Stretch comfort', 'Slim silhouette', 'All-day durability'],
  },
  {
    id: 'p22',
    name: 'AirFlex Knit Trainer',
    brand: 'Nike',
    category: 'Shoes',
    price: 115,
    oldPrice: 145,
    discount: 21,
    rating: 4.6,
    numReviews: 488,
    badge: 'New',
    countInStock: 30,
    images: mkImages(
      'https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&w=1200&q=80',
      [
        'https://images.unsplash.com/photo-1603808033192-082d6919d3e1?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1514989940723-e8e51635b782?auto=format&fit=crop&w=1200&q=80',
      ]
    ),
    description: 'Breathable knit trainers with flexible soles for workouts, commutes, and everyday comfort.',
    specs: ['Knit upper', 'Flexible outsole', 'Breathable comfort'],
  },
  {
    id: 'p23',
    name: 'Retro Court Sneaker',
    brand: 'Puma',
    category: 'Shoes',
    price: 88,
    oldPrice: 119,
    discount: 26,
    rating: 4.4,
    numReviews: 356,
    badge: 'Deal',
    countInStock: 25,
    images: mkImages(
      'https://images.unsplash.com/photo-1603808033192-082d6919d3e1?auto=format&fit=crop&w=1200&q=80',
      [
        'https://images.unsplash.com/photo-1514989940723-e8e51635b782?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&w=1200&q=80',
      ]
    ),
    description: 'Low-profile court sneakers with clean panels and a cushioned footbed for all-day comfort.',
    specs: ['Cushioned footbed', 'Clean panel design', 'Everyday traction'],
  },
  {
    id: 'p24',
    name: 'TrailGrip Hiking Shoe',
    brand: 'Salomon',
    category: 'Shoes',
    price: 136,
    oldPrice: 169,
    discount: 20,
    rating: 4.7,
    numReviews: 289,
    badge: 'Outdoor',
    countInStock: 14,
    images: mkImages(
      'https://images.unsplash.com/photo-1520639888713-7851133b1ed0?auto=format&fit=crop&w=1200&q=80',
      [
        'https://images.unsplash.com/photo-1543163521-1bf539c55dd5?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1520639888713-7851133b1ed0?auto=format&fit=crop&w=1200&q=80',
      ]
    ),
    description: 'Durable trail shoes with grippy outsoles and weather-ready uppers for confident outdoor steps.',
    specs: ['Grippy outsole', 'Weather-ready upper', 'Trail-ready comfort'],
  },
  {
    id: 'p25',
    name: 'Canon Focus Mirrorless',
    brand: 'Canon',
    category: 'Electronics',
    price: 799,
    oldPrice: 929,
    discount: 14,
    rating: 4.8,
    numReviews: 1460,
    badge: 'Pro pick',
    countInStock: 8,
    images: mkImages(
      'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1200&q=80',
      [
        'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=1200&q=80',
      ]
    ),
    description: 'Compact mirrorless camera with crisp autofocus, rich 4K video, and pro-level detail for creators.',
    specs: ['4K video', 'Fast autofocus', 'Compact pro body'],
  },
  {
    id: 'p26',
    name: 'Bose QuietPods Max',
    brand: 'Bose',
    category: 'Electronics',
    price: 249,
    oldPrice: 299,
    discount: 17,
    rating: 4.7,
    numReviews: 204,
    badge: 'Noise cancel',
    countInStock: 32,
    images: mkImages(
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1200&q=80',
      [
        'https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1200&q=80',
      ]
    ),
    description: 'Wireless headphones with plush earcups, immersive sound, and adaptive noise cancellation for focus.',
    specs: ['Adaptive noise cancel', 'Wireless comfort', 'Immersive sound'],
  },
  {
    id: 'p27',
    name: 'Lenovo FlexBook Air',
    brand: 'Lenovo',
    category: 'Electronics',
    price: 949,
    oldPrice: 1099,
    discount: 14,
    rating: 4.6,
    numReviews: 807,
    badge: 'Work ready',
    countInStock: 10,
    images: mkImages(
      'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=1200&q=80',
      [
        'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=1200&q=80',
      ]
    ),
    description: 'Slim laptop with fast performance, sharp display, and long battery life for everyday work and study.',
    specs: ['Long battery', 'Sharp display', 'Fast performance'],
  },
  {
    id: 'p28',
    name: 'Mira Oak Coffee Table',
    brand: 'Mira',
    category: 'Furniture',
    price: 214,
    oldPrice: 269,
    discount: 20,
    rating: 4.5,
    numReviews: 177,
    badge: 'Sale',
    countInStock: 11,
    images: mkImages(
      'https://images.unsplash.com/photo-1533090481720-856c6e3c1fdc?auto=format&fit=crop&w=1200&q=80',
      [
        'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1533090481720-856c6e3c1fdc?auto=format&fit=crop&w=1200&q=80',
      ]
    ),
    description: 'Warm oak coffee table with clean storage and a compact living-room footprint for tidy setups.',
    specs: ['Warm oak finish', 'Storage-ready', 'Compact size'],
  },
  {
    id: 'p29',
    name: 'CloudRest Sofa',
    brand: 'CloudRest',
    category: 'Furniture',
    price: 689,
    oldPrice: 799,
    discount: 14,
    rating: 4.8,
    numReviews: 95,
    badge: 'Comfort',
    countInStock: 5,
    images: mkImages(
      'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1200&q=80',
      [
        'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=1200&q=80',
      ]
    ),
    description: 'Three-seat sofa with deep cushions, supportive arms, and durable upholstery for everyday lounging.',
    specs: ['Deep cushioning', 'Supportive arms', 'Durable upholstery'],
  },
  {
    id: 'p30',
    name: 'Arc Floor Lamp',
    brand: 'Arc',
    category: 'Furniture',
    price: 148,
    oldPrice: 189,
    discount: 22,
    rating: 4.4,
    numReviews: 242,
    badge: 'Limited',
    countInStock: 17,
    images: mkImages(
      'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=1200&q=80',
      [
        'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?auto=format&fit=crop&w=1200&q=80',
      ]
    ),
    description: 'Modern arched floor lamp that adds warm, focused light beside sofas and desks with a stable base.',
    specs: ['Warm ambient light', 'Stable base', 'Modern arched design'],
  },
  {
    id: 'p31',
    name: 'Rose Quartz Face Roller',
    brand: 'Rose Quartz',
    category: 'Beauty',
    price: 31,
    oldPrice: 44,
    discount: 30,
    rating: 4.3,
    numReviews: 119,
    badge: 'Glow',
    countInStock: 95,
    images: mkImages(
      'https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?auto=format&fit=crop&w=1200&q=80',
      [
        'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?auto=format&fit=crop&w=1200&q=80',
      ]
    ),
    description: 'Cooling facial roller for daily skin prep, gentle massage, and depuffing routines for a refreshed look.',
    specs: ['Cooling effect', 'Gentle massage', 'Daily skincare support'],
  },
  {
    id: 'p32',
    name: 'Botanical Hair Care Duo',
    brand: 'Botanical',
    category: 'Beauty',
    price: 48,
    oldPrice: 62,
    discount: 23,
    rating: 4.5,
    numReviews: 503,
    badge: 'Clean care',
    countInStock: 65,
    images: mkImages(
      'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?auto=format&fit=crop&w=1200&q=80',
      [
        'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?auto=format&fit=crop&w=1200&q=80',
      ]
    ),
    description: 'Nourishing shampoo and conditioner set for smooth, healthy-looking hair with a clean botanical feel.',
    specs: ['Hydration duo', 'Nourishing care', 'Smooth finish'],
  },
  {
    id: 'p33',
    name: 'Matte Finish Makeup Kit',
    brand: 'NovaColor',
    category: 'Beauty',
    price: 69,
    oldPrice: 92,
    discount: 25,
    rating: 4.6,
    numReviews: 821,
    badge: 'Kit',
    countInStock: 40,
    images: mkImages(
      'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=1200&q=80',
      [
        'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=1200&q=80',
      ]
    ),
    description: 'Everyday makeup edit with soft matte textures and buildable coverage for a smooth, polished finish.',
    specs: ['Soft matte textures', 'Buildable coverage', 'Everyday-ready set'],
  },
  {
    id: 'p34',
    name: 'iPhone Slate Mini',
    brand: 'Apple',
    category: 'Mobiles',
    price: 749,
    oldPrice: 829,
    discount: 10,
    rating: 4.8,
    numReviews: 1620,
    badge: 'Compact',
    countInStock: 14,
    images: mkImages(
      'https://images.unsplash.com/photo-1616410011236-7a42121dd981?auto=format&fit=crop&w=1200&q=80',
      [
        'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1616410011236-7a42121dd981?auto=format&fit=crop&w=1200&q=80',
      ]
    ),
    description: 'Compact smartphone with flagship speed, premium cameras, and crisp display for everyday convenience.',
    specs: ['Flagship performance', 'Premium cameras', 'Crisp display'],
  },
  {
    id: 'p35',
    name: 'Galaxy Fold Lite',
    brand: 'Samsung',
    category: 'Mobiles',
    price: 999,
    oldPrice: 1199,
    discount: 17,
    rating: 4.7,
    numReviews: 720,
    badge: 'Foldable',
    countInStock: 7,
    images: mkImages(
      'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?auto=format&fit=crop&w=1200&q=80',
      [
        'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?auto=format&fit=crop&w=1200&q=80',
      ]
    ),
    description: 'Pocketable foldable phone with a bright inner screen and multitasking tools for work and play.',
    specs: ['Foldable display', 'Multitasking tools', 'Pocket-friendly design'],
  },
  {
    id: 'p36',
    name: 'Moto Power Max',
    brand: 'Moto',
    category: 'Mobiles',
    price: 389,
    oldPrice: 449,
    discount: 13,
    rating: 4.4,
    numReviews: 540,
    badge: 'Battery',
    countInStock: 26,
    images: mkImages(
      'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?auto=format&fit=crop&w=1200&q=80',
      [
        'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?auto=format&fit=crop&w=1200&q=80',
      ]
    ),
    description: 'Reliable phone with a large battery, fast charging, and a sharp display—made for busy days.',
    specs: ['Large battery', 'Fast charging', 'Sharp display'],
  },
];

export const testimonials = [
  { name: 'Anika Sharma', role: 'Verified buyer', rating: 5, text: 'Fast delivery, clean tracking, and product quality felt exactly like a premium store.' },
  { name: 'Rohan Mehta', role: 'Sneaker collector', rating: 5, text: 'The product pages are detailed, checkout is quick, and the wishlist flow is excellent.' },
  { name: 'Sara Khan', role: 'Interior stylist', rating: 4.5, text: 'I liked the recommendations and the sale countdown. The UI is polished on mobile too.' },
];

export const brands = ['Nike', 'Adidas', 'Puma', 'Apple', 'Samsung', 'Sony', 'OnePlus', 'Zara'];

export const analytics = [
  { month: 'Jan', revenue: 32000, orders: 420 },
  { month: 'Feb', revenue: 41000, orders: 510 },
  { month: 'Mar', revenue: 38000, orders: 480 },
  { month: 'Apr', revenue: 57000, orders: 690 },
  { month: 'May', revenue: 64000, orders: 760 },
  { month: 'Jun', revenue: 72000, orders: 830 },
];

