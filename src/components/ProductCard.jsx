import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { Box, Button, Card, CardContent, Chip, IconButton, Rating, Stack, Tooltip, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import useCart from '../hooks/useCart';
import useWishlist from '../hooks/useWishlist';
import { getCategoryName, getFallbackProductImage, getProductId, getProductImages, toCartProduct } from '../utils/productUtils.js';

export default function ProductCard({ product }) {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { toggleWishlist, isWishlisted } = useWishlist();
  const productId = getProductId(product);
  const detailPath = productId ? `/product/${productId}` : '/products';
  const images = getProductImages(product);
  const category = getCategoryName(product.category);
  const wished = isWishlisted(productId);
  const badge = product.badge || (product.discount ? `${product.discount}% off` : 'Featured');

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

  return (
    <Card role="button" tabIndex={0} onClick={openDetails} onKeyDown={openDetailsFromKeyboard} sx={{ height: '100%', overflow: 'hidden', border: '1px solid', borderColor: 'divider', cursor: 'pointer', transition: 'transform .25s ease, box-shadow .25s ease', '&:hover': { transform: 'translateY(-6px)', boxShadow: '0 22px 50px rgba(17,24,39,.14)' } }}>
      <Box sx={{ position: 'relative', aspectRatio: '4 / 3', bgcolor: 'background.default' }}>
        <Box component="img" src={images[0]} alt={product.name} onError={(event) => { event.currentTarget.src = getFallbackProductImage(product); }} sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        <Chip label={badge} color="secondary" size="small" sx={{ position: 'absolute', top: 12, left: 12, fontWeight: 800 }} />
        <Stack direction="row" spacing={1} sx={{ position: 'absolute', top: 10, right: 10 }}>
          <Tooltip title="Wishlist">
            <IconButton onClick={(event) => { stopCardNavigation(event); toggleWishlist(toCartProduct(product)); }} onKeyDown={(event) => event.stopPropagation()} sx={{ bgcolor: 'rgba(255,255,255,.9)' }}>{wished ? <FavoriteIcon color="error" /> : <FavoriteBorderIcon />}</IconButton>
          </Tooltip>
          <Tooltip title="Quick view">
            <IconButton sx={{ bgcolor: 'rgba(255,255,255,.9)' }}><VisibilityIcon /></IconButton>
          </Tooltip>
        </Stack>
      </Box>
      <CardContent>
        <Typography color="text.secondary" variant="caption">{category}</Typography>
        <Typography variant="h6" sx={{ minHeight: 56 }}>{product.name}</Typography>
        <Rating value={product.rating} precision={0.1} readOnly size="small" sx={{ mt: 1 }} />
        <Stack direction="row" spacing={1} alignItems="center" sx={{ my: 1.5 }}>
          <Typography variant="h6">${product.price}</Typography>
          {product.oldPrice ? <Typography color="text.secondary" sx={{ textDecoration: 'line-through' }}>${product.oldPrice}</Typography> : null}
        </Stack>
        <Button fullWidth variant="contained" startIcon={<ShoppingCartIcon />} onClick={(event) => { stopCardNavigation(event); addToCart(toCartProduct(product)); }} onKeyDown={(event) => event.stopPropagation()}>Add to cart</Button>
      </CardContent>
    </Card>
  );
}
