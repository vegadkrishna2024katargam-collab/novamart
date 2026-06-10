export function getProductId(product) {
  return product?._id || product?.id;
}

export function getCategoryName(category) {
  if (!category) return 'General';
  return typeof category === 'string' ? category : category.name || 'General';
}

export function resolveImageUrl(image) {
  if (!image) return 'https://images.unsplash.com/photo-1557821552-17105176677c?auto=format&fit=crop&w=1200&q=80';
  if (image.startsWith('http') || image.startsWith('data:')) return image;
  return image;
}

const productImageFallbacks = [
  {
    keywords: ['shoe', 'sneaker', 'runner', 'trainer', 'hiking', 'sprint'],
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1200&q=80',
  },
  {
    keywords: ['watch'],
    image: 'https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?auto=format&fit=crop&w=1200&q=80',
  },
  {
    keywords: ['phone', 'mobile', 'iphone', 'galaxy', 'pixel', 'oneplus', 'xiaomi', 'moto'],
    image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=1200&q=80',
  },
  {
    keywords: ['laptop', 'book'],
    image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=1200&q=80',
  },
  {
    keywords: ['camera'],
    image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1200&q=80',
  },
  {
    keywords: ['speaker', 'headphone', 'pods'],
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1200&q=80',
  },
  {
    keywords: ['chair', 'sofa', 'table', 'desk', 'shelf', 'lamp'],
    image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1200&q=80',
  },
  {
    keywords: ['beauty', 'skin', 'serum', 'lip', 'makeup', 'hair', 'face', 'roller'],
    image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=1200&q=80',
  },
  {
    keywords: ['grocery', 'pantry', 'fruit', 'kitchen', 'harvest'],
    image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1200&q=80',
  },
  {
    keywords: ['shirt', 'jacket', 'jeans', 'fashion', 'cotton'],
    image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1200&q=80',
  },
];

export function getFallbackProductImage(product = {}) {
  const safeProduct = product || {};
  const searchable = `${safeProduct.name || ''} ${getCategoryName(safeProduct.category)}`.toLowerCase();
  return productImageFallbacks.find(({ keywords }) => keywords.some((keyword) => searchable.includes(keyword)))?.image || 'https://images.unsplash.com/photo-1557821552-17105176677c?auto=format&fit=crop&w=1200&q=80';
}

export function getProductImages(product) {
  const images = Array.isArray(product?.images) ? product.images : [];
  const primary = product?.image;
  const normalizedImages = [...new Set([primary, ...images].filter(Boolean))].map(resolveImageUrl);
  return normalizedImages.length ? normalizedImages : [getFallbackProductImage(product)];
}

export function toCartProduct(product, quantity = 1) {
  const id = getProductId(product);
  const images = getProductImages(product);
  return {
    ...product,
    id,
    category: getCategoryName(product?.category),
    image: images[0],
    images,
    qty: quantity,
  };
}
