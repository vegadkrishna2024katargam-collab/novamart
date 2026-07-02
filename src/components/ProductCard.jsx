import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { Box, Button, Card, CardContent, Chip, IconButton, Rating, Stack, Tooltip, Typography } from '@mui/material';
import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import useCart from '../hooks/useCart';
import useWishlist from '../hooks/useWishlist';
import {
  getCategoryName,
  getProductId,
  normalizeProduct,
  toCartProduct,
} from '../utils/productUtils.js';


export default function ProductCard({ product }) {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { toggleWishlist, isWishlisted } = useWishlist();

  const displayProduct = useMemo(() => normalizeProduct(product) || product, [product]);
  const productId = getProductId(displayProduct);
  const detailPath = productId ? `/product/${productId}` : '/products';

  const category = getCategoryName(displayProduct.category);
  const wished = isWishlisted(productId);
  const badge = displayProduct.badge || (displayProduct.discount ? `${displayProduct.discount}% off` : 'Featured');

  const stockCount = displayProduct?.countInStock ?? displayProduct?.stock ?? 0;
  const inStock = stockCount > 0;


  const stopCardNavigation = (event) => {
    event.stopPropagation();
  };

  const openDetails = () => {
    if (!productId) return;
    navigate(detailPath);
  };

  const openDetailsFromKeyboard = (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      openDetails();
    }
  };

  const openQuickView = (event) => {
    stopCardNavigation(event);
    openDetails();
  };

  const openWishlist = (event) => {
    stopCardNavigation(event);
    toggleWishlist(toCartProduct(displayProduct));
  };

  const addToCartFromCard = (event) => {
    stopCardNavigation(event);
    addToCart(toCartProduct(displayProduct));
  };

  return (
    <Card
      role="button"
      tabIndex={0}
      onClick={openDetails}
      onKeyDown={openDetailsFromKeyboard}
      sx={{
        height: '100%',
        overflow: 'hidden',
        border: '1px solid',
        borderColor: 'divider',
        cursor: 'pointer',
        transition: 'transform .25s ease, box-shadow .25s ease',
        '&:hover': { transform: 'translateY(-6px)', boxShadow: '0 22px 50px rgba(17,24,39,.14)' },
      }}
    >
      <Box sx={{ position: 'relative', aspectRatio: '4 / 3', bgcolor: 'background.default', overflow: 'hidden' }}>
        <Box
          component="img"
          // only the main listing image should appear on the card
          src={displayProduct.images?.[0] || displayProduct.image}

          alt={displayProduct.name}
          sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
          onError={(event) => {
            event.currentTarget.src = 'https://images.unsplash.com/photo-1557821552-17105176677c?auto=format&fit=crop&w=1200&q=80';
          }}
        />
        <Chip label={badge} color="secondary" size="small" sx={{ position: 'absolute', top: 12, left: 12, fontWeight: 800 }} />

        <Stack direction="row" spacing={1} sx={{ position: 'absolute', top: 10, right: 10 }}>

          <Tooltip title="Wishlist">
            <IconButton
              onClick={openWishlist}
              onKeyDown={(event) => event.stopPropagation()}
              sx={{ bgcolor: 'rgba(255,255,255,.9)' }}
            >
              {wished ? <FavoriteIcon color="error" /> : <FavoriteBorderIcon />}
            </IconButton>
          </Tooltip>

          <Tooltip title="Quick view">
            <IconButton onClick={openQuickView} sx={{ bgcolor: 'rgba(255,255,255,.9)' }}>
              <VisibilityIcon />
            </IconButton>
          </Tooltip>
        </Stack>
      </Box>

      <CardContent>
        <Typography color="text.secondary" variant="caption">
          {category}
        </Typography>

        <Typography variant="h6" sx={{ minHeight: 56 }}>
          {displayProduct.name}
        </Typography>

        <Stack direction="row" spacing={1} alignItems="center" sx={{ my: 1 }}>
          <Rating value={displayProduct.rating} precision={0.1} readOnly size="small" />
          <Typography color="text.secondary" variant="caption">
            {(displayProduct.rating || 0).toFixed(1)}
          </Typography>
          <Typography color="text.secondary" variant="caption">
            · {displayProduct.numReviews || displayProduct.reviewCount || 0} reviews
          </Typography>
        </Stack>

        <Stack direction="row" spacing={1} alignItems="center" sx={{ my: 1.5 }}>
          <Typography variant="h6">${displayProduct.price}</Typography>
          {displayProduct.oldPrice ? (
            <Typography color="text.secondary" sx={{ textDecoration: 'line-through' }}>
              ${displayProduct.oldPrice}
            </Typography>
          ) : null}
        </Stack>



        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
          <Chip
            label={inStock ? (stockCount ? `In stock (${stockCount})` : 'In stock') : 'Out of stock'}
            color={inStock ? 'success' : 'error'}
            size="small"
            sx={{ ml: 'auto' }}
          />
        </Stack>





        <Button fullWidth variant="contained" startIcon={<ShoppingCartIcon />} onClick={addToCartFromCard}>
          Add to cart
        </Button>
      </CardContent>
    </Card>
  );
}

