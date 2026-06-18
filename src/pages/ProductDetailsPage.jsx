import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import { Box, Button, Chip, CircularProgress, Container, Divider, Grid, IconButton, Paper, Rating, Stack, Typography } from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import EmptyState from '../components/EmptyState.jsx';
import api from '../services/api.js';
import { products as demoProducts } from '../data/demoData.js';
import useCart from '../hooks/useCart.js';
import formatCurrency from '../utils/formatCurrency.js';
import { getCategoryName, getProductId, getProductImages, normalizeProduct, toCartProduct } from '../utils/productUtils.js';

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

        if (Array.isArray(productSource)) {
          productSource = pickMatch(productSource) || productSource[0];
        } else if (Array.isArray(productSource?.products)) {
          productSource = pickMatch(productSource.products) || productSource.products[0];
        } else if (Array.isArray(productSource?.data)) {
          productSource = pickMatch(productSource.data) || productSource.data[0];
        } else if (Array.isArray(productSource?.result)) {
          productSource = pickMatch(productSource.result) || productSource.result[0];
        }

        const productData = normalizeProduct(productSource || data);
        if (!productData) {
          throw new Error('Invalid product response');
        }

        setProduct(productData);
        const images = getProductImages(productData);
        setSelectedImage(images[0] || '');
        setQuantity(1);
      } catch (err) {
        if (!active) return;

        const fallbackProduct = demoProducts
          .map(normalizeProduct)
          .find((item) => String(getProductId(item)) === String(id));
        if (fallbackProduct) {
          setProduct(fallbackProduct);
          setSelectedImage(getProductImages(fallbackProduct)[0] || '');
          setQuantity(1);
          return;
        }

        setError(err.response?.status === 404 ? 'not-found' : 'load-error');
        setProduct(null);
      } finally {
        if (active) setLoading(false);
      }
    }

    loadProduct();
    return () => {
      active = false;
    };
  }, [id]);

  const images = useMemo(() => {
    if (!product) return [];
    const imgs = getProductImages(product);
    // If product has colorVariants, include those images too
    if (product.colorVariants && Array.isArray(product.colorVariants)) {
      product.colorVariants.forEach((variant) => {
        if (variant.image && !imgs.includes(variant.image)) {
          imgs.push(variant.image);
        }
      });
    }
    return imgs;
  }, [product]);

  useEffect(() => {
    if (!images.length) return;
    setSelectedImage((current) => (images.includes(current) ? current : images[0]));
  }, [images]);

  const stockCount = product?.countInStock ?? product?.stock ?? 0;
  const inStock = stockCount > 0;
  const cartProduct = product ? toCartProduct(product, quantity) : null;
  const category = getCategoryName(product?.category);
  const reviewCount = product?.numReviews || product?.reviewCount || 0;

  const addSelectedToCart = () => {
    if (!cartProduct || !inStock) return;
    addToCart(cartProduct);
  };

  const buyNow = () => {
    if (!cartProduct || !inStock) return;
    sessionStorage.setItem('novamart_buy_now', JSON.stringify(cartProduct));
    navigate('/checkout?buyNow=1');
  };

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ py: 10, display: 'grid', placeItems: 'center', minHeight: 420 }}>
        <Stack spacing={2} alignItems="center">
          <CircularProgress />
          <Typography color="text.secondary">Loading product details...</Typography>
        </Stack>
      </Container>
    );
  }

  if (error || !product) {
    return (
      <EmptyState
        title={error === 'not-found' ? 'Product not found' : 'Unable to load product'}
        text={error === 'not-found' ? 'The selected product ID does not match an available product.' : 'Product details could not be fetched right now.'}
        action="View products"
      />
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: { xs: 3, md: 6 } }}>
      <Grid container spacing={{ xs: 3, md: 5 }} alignItems="flex-start">
        <Grid item xs={12} md={6}>
          <Stack spacing={2}>
            {/* Main Product Image */}
            <Paper sx={{ overflow: 'hidden', borderRadius: 2, bgcolor: 'background.default' }}>
              <Box sx={{ position: 'relative', aspectRatio: '1 / 1', overflow: 'hidden' }}>
                <Box
                  component="img"
                  src={selectedImage}
                  alt={product.name}
                  sx={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    transition: 'transform .35s ease',
                    '&:hover': { transform: 'scale(1.14)' },
                  }}
                />
              </Box>
            </Paper>


          </Stack>
        </Grid>

        <Grid item xs={12} md={6}>
          <Stack spacing={2.5}>
            <Stack direction="row" spacing={1} flexWrap="wrap">
              <Chip label={category} color="primary" variant="outlined" />
              {product.discount ? <Chip label={`${product.discount}% off`} color="secondary" /> : null}
            </Stack>

            <Typography variant="h3" sx={{ fontSize: { xs: '2rem', md: '3rem' } }}>{product.name}</Typography>

            <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap">
              <Rating value={product.rating || 0} precision={0.1} readOnly />
              <Typography color="text.secondary">{(product.rating || 0).toFixed(1)} ({reviewCount} reviews)</Typography>
            </Stack>

            <Stack direction="row" spacing={2} alignItems="baseline">
              <Typography variant="h3" color="primary">{formatCurrency(product.price)}</Typography>
              {product.oldPrice ? <Typography variant="h5" color="text.secondary" sx={{ textDecoration: 'line-through' }}>{formatCurrency(product.oldPrice)}</Typography> : null}
            </Stack>

            <Typography color="text.secondary" sx={{ fontSize: '1.05rem', lineHeight: 1.8 }}>{product.description || 'No description available for this product.'}</Typography>

            <Divider />

            <Stack spacing={2}>
              <Chip
                label={inStock ? `In Stock${stockCount ? ` (${stockCount} available)` : ''}` : 'Out of Stock'}
                color={inStock ? 'success' : 'error'}
                sx={{ width: 'fit-content', fontWeight: 800 }}
              />

              <Stack direction="row" spacing={2} alignItems="center">
                <Typography fontWeight={800}>Quantity</Typography>
                <Stack direction="row" alignItems="center" sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1, width: 132, justifyContent: 'space-between' }}>
                  <IconButton aria-label="Decrease quantity" disabled={quantity <= 1} onClick={() => setQuantity((value) => Math.max(1, value - 1))}><RemoveIcon /></IconButton>
                  <Typography fontWeight={900}>{quantity}</Typography>
                  <IconButton aria-label="Increase quantity" disabled={inStock && quantity >= stockCount} onClick={() => setQuantity((value) => value + 1)}><AddIcon /></IconButton>
                </Stack>
              </Stack>
            </Stack>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <Button fullWidth variant="contained" size="large" disabled={!inStock} onClick={buyNow}>Buy Now</Button>
              <Button fullWidth variant="outlined" size="large" startIcon={<ShoppingCartIcon />} disabled={!inStock} onClick={addSelectedToCart}>Add To Cart</Button>
            </Stack>
          </Stack>
        </Grid>
      </Grid>
    </Container>
  );
}