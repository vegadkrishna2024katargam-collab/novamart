import { Container, Grid, Typography } from '@mui/material';
import EmptyState from '../components/EmptyState.jsx';
import ProductCard from '../components/ProductCard.jsx';
import useWishlist from '../hooks/useWishlist';

export default function WishlistPage() {
  const { items } = useWishlist();
  if (!items.length) return <EmptyState title="No wishlist items" text="Save products and move them to cart later." />;
  return (
    <Container maxWidth="xl" sx={{ py: 5 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>Wishlist</Typography>
      <Grid container spacing={3}>{items.map((product) => <Grid item xs={12} sm={6} md={3} key={product.id}><ProductCard product={product} /></Grid>)}</Grid>
    </Container>
  );
}
