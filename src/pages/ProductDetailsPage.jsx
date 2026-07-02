import AddIcon from '@mui/icons-material/Add';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import RemoveIcon from '@mui/icons-material/Remove';
import ReplayIcon from '@mui/icons-material/Replay';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import VerifiedIcon from '@mui/icons-material/Verified';
import { Box, Button, Chip, CircularProgress, Container, Divider, Grid, IconButton, Paper, Rating, Stack, Typography } from '@mui/material';
import { motion } from 'framer-motion';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import EmptyState from '../components/EmptyState.jsx';
import { products as demoProducts } from '../data/demoData.js';
import useCart from '../hooks/useCart.js';
import api from '../services/api.js';
import formatCurrency from '../utils/formatCurrency.js';
import { getCategoryName, getProductId, getProductImages, normalizeProduct, toCartProduct } from '../utils/productUtils.js';

const MotionStack = motion(Stack);
const MotionPaper = motion(Paper);


export default function ProductDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [selectedImage, setSelectedImage] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    async function loadProduct() {
      try {
        setLoading(true);
        setError('');
        setProduct(null);
        setSelectedImage('');
        const { data } = await api.get(`/products/${id}`);
        if (!active) return;
        let productSource = data;
        const pickMatch = (arr) => (Array.isArray(arr) ? arr.find((item) => String(getProductId(item) || item?.id || item?._id) === String(id)) : null);
        if (Array.isArray(productSource)) productSource = pickMatch(productSource) || productSource[0];
        else if (Array.isArray(productSource?.products)) productSource = pickMatch(productSource.products) || productSource.products[0];
        else if (Array.isArray(productSource?.data)) productSource = pickMatch(productSource.data) || productSource.data[0];
        else if (Array.isArray(productSource?.result)) productSource = pickMatch(productSource.result) || productSource.result[0];
        const productData = normalizeProduct(productSource || data);
        if (!productData) throw new Error('Invalid product response');
        setProduct(productData);
        const images = getProductImages(productData);
        setSelectedImage(images[0] || '');
        setQuantity(1);
      } catch (err) {
        if (!active) return;
        const fallbackProduct = demoProducts.map(normalizeProduct).find((item) => String(getProductId(item)) === String(id));
        if (fallbackProduct) { setProduct(fallbackProduct); setSelectedImage(getProductImages(fallbackProduct)[0] || ''); setQuantity(1); return; }
        setError(err.response?.status === 404 ? 'not-found' : 'load-error');
        setProduct(null);
      } finally { if (active) setLoading(false); }
    }
    loadProduct();
    return () => { active = false; };
  }, [id]);

  const images = useMemo(() => {
    if (!product) return [];
    const imgs = getProductImages(product);
    if (product.colorVariants && Array.isArray(product.colorVariants)) {
      product.colorVariants.forEach((variant) => { if (variant.image && !imgs.includes(variant.image)) imgs.push(variant.image); });
    }
    return imgs;
  }, [product]);

  useEffect(() => { if (!images.length) return; setSelectedImage((current) => (images.includes(current) ? current : images[0])); }, [images]);

  const stockCount = product?.countInStock ?? product?.stock ?? 0;
  const inStock = stockCount > 0;
  const cartProduct = product ? toCartProduct(product, quantity) : null;
  const category = getCategoryName(product?.category);
  const reviewCount = product?.numReviews || product?.reviewCount || 0;

  const addSelectedToCart = () => { if (!cartProduct || !inStock) return; addToCart(cartProduct); };
  const buyNow = () => { if (!cartProduct || !inStock) return; sessionStorage.setItem('novamart_buy_now', JSON.stringify(cartProduct)); navigate('/checkout?buyNow=1'); };

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ py: 10, display: 'grid', placeItems: 'center', minHeight: 420 }}>
        <Stack spacing={2} alignItems="center">
          <CircularProgress sx={{ color: '#6C5CE7' }} />
          <Typography color="text.secondary">Loading product details...</Typography>
        </Stack>
      </Container>
    );
  }

  if (error || !product) {
    return <EmptyState title={error === 'not-found' ? 'Product not found' : 'Unable to load product'} text={error === 'not-found' ? 'The selected product ID does not match an available product.' : 'Product details could not be fetched right now.'} action="View products" />;
  }

  return (
    <Box sx={{ bgcolor: '#F6F7FB', minHeight: '100vh', py: { xs: 3, md: 6 } }}>
      <Container maxWidth="xl">
        <Grid container spacing={{ xs: 3, md: 6 }} alignItems="flex-start">
          {/* LEFT SECTION - Product Image Gallery */}
          <Grid item xs={12} md={6}>
            <MotionStack
              spacing={2.5}
              initial={{ opacity: 0, x: -24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              sx={{ height: '100%' }}
            >
              {/* Main Image */}
              <Paper
                sx={{
                  borderRadius: '24px',
                  bgcolor: '#F8F9FC',
                  p: 4,
                  boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
                  cursor: 'zoom-in',
                  overflow: 'hidden',
                  position: 'relative',
                }}
              >
                <motion.div
                  whileHover={{ scale: 1.08 }}
                  transition={{ duration: 0.4, ease: 'easeOut' }}
                >
                  <Box
                    component="img"
                    src={selectedImage}
                    alt={product.name}
                    onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1557821552-17105176677c?auto=format&fit=crop&w=1200&q=80'; }}
                    sx={{
                      width: '100%',
                      height: 'auto',
                      maxHeight: 520,
                      objectFit: 'contain',
                      display: 'block',
                      mx: 'auto',
                      userSelect: 'none',
                      pointerEvents: 'none',
                    }}
                  />
                </motion.div>
              </Paper>

              {/* Thumbnail Gallery */}
              {images.length > 1 && (
                <Stack direction="row" spacing={1.5} sx={{ justifyContent: 'center', flexWrap: 'wrap' }}>
                  {images.map((imgUrl, index) => (
                    <motion.div
                      key={index}
                      whileHover={{ scale: 1.08, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Paper
                        onClick={() => setSelectedImage(imgUrl)}
                        sx={{
                          width: 80,
                          height: 80,
                          borderRadius: '16px',
                          overflow: 'hidden',
                          cursor: 'pointer',
                          border: selectedImage === imgUrl ? '3px solid #6C5CE7' : '2px solid transparent',
                          opacity: selectedImage === imgUrl ? 1 : 0.5,
                          transition: 'all 0.25s ease',
                          boxShadow: selectedImage === imgUrl ? '0 4px 15px rgba(108,92,231,0.3)' : 'none',
                          '&:hover': { opacity: 1 },
                        }}
                      >
                        <Box
                          component="img"
                          src={imgUrl}
                          alt={`${product.name} view ${index + 1}`}
                          onError={(e) => { e.target.style.display = 'none'; }}
                          sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      </Paper>
                    </motion.div>
                  ))}
                </Stack>
              )}
            </MotionStack>
          </Grid>

          {/* RIGHT SECTION - Product Information */}
          <Grid item xs={12} md={6}>
            <MotionStack
              spacing={3}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.15 }}
            >
              {/* Category & Discount Badges */}
              <Stack direction="row" spacing={1.5} alignItems="center">
                <Chip
                  label={category}
                  sx={{
                    bgcolor: '#6C5CE7',
                    color: 'white',
                    fontWeight: 700,
                    fontSize: '0.75rem',
                    borderRadius: '8px',
                    px: 0.5,
                  }}
                  size="small"
                />
                {product.discount ? (
                  <Chip
                    label={`${product.discount}% OFF`}
                    sx={{
                      bgcolor: '#FEE2E2',
                      color: '#EF4444',
                      fontWeight: 800,
                      fontSize: '0.7rem',
                      borderRadius: '8px',
                    }}
                    size="small"
                  />
                ) : null}
              </Stack>

              {/* Product Title */}
              <Typography
                variant="h3"
                sx={{
                  fontSize: { xs: '1.8rem', sm: '2.2rem', md: '2.8rem' },
                  fontWeight: 800,
                  color: '#111827',
                  lineHeight: 1.2,
                  fontFamily: '"Poppins", sans-serif',
                }}
              >
                {product.name}
              </Typography>

              {/* Rating */}
              <Stack direction="row" spacing={1.5} alignItems="center">
                <Rating value={product.rating || 0} precision={0.1} readOnly sx={{ '& .MuiRating-iconFilled': { color: '#F59E0B' } }} />
                <Typography sx={{ fontWeight: 700, color: '#111827', fontSize: '1rem' }}>
                  {(product.rating || 0).toFixed(1)}
                </Typography>
                <Typography sx={{ color: '#9CA3AF', fontSize: '0.9rem' }}>
                  ({reviewCount} Reviews)
                </Typography>
              </Stack>

              {/* Price */}
              <Stack direction="row" spacing={2} alignItems="baseline">
                <Typography
                  variant="h3"
                  sx={{
                    fontSize: { xs: '2rem', md: '2.5rem' },
                    fontWeight: 800,
                    color: '#6C5CE7',
                  }}
                >
                  {formatCurrency(product.price)}
                </Typography>
                {product.oldPrice ? (
                  <Typography
                    variant="h5"
                    sx={{
                      color: '#9CA3AF',
                      textDecoration: 'line-through',
                      fontSize: '1.3rem',
                      fontWeight: 500,
                    }}
                  >
                    {formatCurrency(product.oldPrice)}
                  </Typography>
                ) : null}
                {product.discount ? (
                  <Chip
                    label={`Save ${product.discount}%`}
                    size="small"
                    sx={{
                      bgcolor: '#EDE9FE',
                      color: '#6C5CE7',
                      fontWeight: 700,
                      borderRadius: '8px',
                      fontSize: '0.75rem',
                    }}
                  />
                ) : null}
              </Stack>

              {/* Description */}
              <Typography
                sx={{
                  color: '#6B7280',
                  fontSize: '1rem',
                  lineHeight: 1.8,
                  maxWidth: 560,
                }}
              >
                {product.description || 'No description available for this product.'}
              </Typography>

              {/* Divider */}
              <Divider sx={{ borderColor: '#E5E7EB' }} />

              {/* Stock Status */}
              <Chip
                icon={<VerifiedIcon sx={{ fontSize: 16, color: '#22C55E !important' }} />}
                label={inStock ? `In Stock (${stockCount} available)` : 'Out of Stock'}
                sx={{
                  bgcolor: inStock ? '#F0FDF4' : '#FEF2F2',
                  color: inStock ? '#22C55E' : '#EF4444',
                  fontWeight: 700,
                  borderRadius: '12px',
                  fontSize: '0.85rem',
                  width: 'fit-content',
                  px: 1,
                }}
              />

              {/* Quantity Selector */}
              <Stack direction="row" spacing={2} alignItems="center">
                <Typography sx={{ fontWeight: 700, color: '#111827', fontSize: '0.95rem' }}>
                  Quantity
                </Typography>
                <Stack
                  direction="row"
                  alignItems="center"
                  sx={{
                    border: '1px solid #E5E7EB',
                    borderRadius: '14px',
                    overflow: 'hidden',
                    bgcolor: 'white',
                  }}
                >
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <IconButton
                      disabled={quantity <= 1}
                      onClick={() => setQuantity((v) => Math.max(1, v - 1))}
                      sx={{ borderRadius: '14px 0 0 14px', px: 2, color: '#6C5CE7' }}
                    >
                      <RemoveIcon />
                    </IconButton>
                  </motion.div>
                  <Typography sx={{ fontWeight: 900, px: 3, minWidth: 40, textAlign: 'center', fontSize: '1.1rem' }}>
                    {quantity}
                  </Typography>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <IconButton
                      disabled={inStock && quantity >= stockCount}
                      onClick={() => setQuantity((v) => v + 1)}
                      sx={{ borderRadius: '0 14px 14px 0', px: 2, color: '#6C5CE7' }}
                    >
                      <AddIcon />
                    </IconButton>
                  </motion.div>
                </Stack>
              </Stack>

              {/* Buttons */}
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <motion.div whileHover={{ scale: 1.03, y: -2 }} whileTap={{ scale: 0.98 }} style={{ flex: 1 }}>
                  <Button
                    fullWidth
                    size="large"
                    disabled={!inStock}
                    onClick={buyNow}
                    sx={{
                      py: 1.8,
                      borderRadius: '16px',
                      background: 'linear-gradient(135deg, #6C5CE7, #8B5CF6)',
                      color: 'white',
                      fontWeight: 700,
                      fontSize: '1rem',
                      boxShadow: '0 8px 25px rgba(108,92,231,0.35)',
                      '&:hover': {
                        boxShadow: '0 12px 35px rgba(108,92,231,0.45)',
                        background: 'linear-gradient(135deg, #5B4BD6, #7C3AED)',
                      },
                      '&:disabled': { bgcolor: '#D1D5DB', boxShadow: 'none' },
                    }}
                  >
                    Buy Now
                  </Button>
                </motion.div>
                <motion.div whileHover={{ scale: 1.03, y: -2 }} whileTap={{ scale: 0.98 }} style={{ flex: 1 }}>
                  <Button
                    fullWidth
                    size="large"
                    variant="outlined"
                    startIcon={<ShoppingCartIcon />}
                    disabled={!inStock}
                    onClick={addSelectedToCart}
                    sx={{
                      py: 1.8,
                      borderRadius: '16px',
                      borderColor: '#6C5CE7',
                      borderWidth: 2,
                      color: '#6C5CE7',
                      fontWeight: 700,
                      fontSize: '1rem',
                      bgcolor: 'white',
                      '&:hover': {
                        borderColor: '#8B5CF6',
                        bgcolor: '#F5F3FF',
                        borderWidth: 2,
                      },
                      '&:disabled': { borderColor: '#D1D5DB', color: '#D1D5DB' },
                    }}
                  >
                    Add To Cart
                  </Button>
                </motion.div>
              </Stack>

              {/* Feature Highlights */}
              <MotionPaper
                elevation={0}
                sx={{
                  p: 2.5,
                  borderRadius: '20px',
                  bgcolor: 'white',
                  border: '1px solid #E5E7EB',
                  mt: 1,
                }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.3 }}
              >
                <Grid container spacing={2}>
                  {[
                    { icon: <LocalShippingIcon sx={{ color: '#6C5CE7', fontSize: 22 }} />, title: 'Free Shipping', desc: 'On orders over $100' },
                    { icon: <ReplayIcon sx={{ color: '#6C5CE7', fontSize: 22 }} />, title: '30-Day Returns', desc: 'Easy return policy' },
                    { icon: <VerifiedIcon sx={{ color: '#6C5CE7', fontSize: 22 }} />, title: 'Secure Payment', desc: '100% Secure Checkout' },
                  ].map((feature, i) => (
                    <Grid item xs={12} sm={4} key={i}>
                      <Stack spacing={1} alignItems="center" textAlign="center">
                        <Box
                          sx={{
                            width: 48,
                            height: 48,
                            borderRadius: '50%',
                            bgcolor: '#F5F3FF',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          {feature.icon}
                        </Box>
                        <Typography sx={{ fontWeight: 700, color: '#111827', fontSize: '0.85rem' }}>
                          {feature.title}
                        </Typography>
                        <Typography sx={{ color: '#9CA3AF', fontSize: '0.75rem' }}>
                          {feature.desc}
                        </Typography>
                      </Stack>
                    </Grid>
                  ))}
                </Grid>
              </MotionPaper>
            </MotionStack>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}