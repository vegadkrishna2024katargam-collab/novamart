import DeleteIcon from '@mui/icons-material/Delete';
import { Box, Button, Container, Divider, IconButton, Paper, Stack, TextField, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import EmptyState from '../components/EmptyState.jsx';
import useCart from '../hooks/useCart';

export default function CartPage() {
  const { items, subtotal, updateQty, removeFromCart } = useCart();
  if (!items.length) return <EmptyState title="Your cart is empty" />;
  const shipping = subtotal > 50 ? 0 : 12;
  const total = subtotal + shipping;

  return (
    <Container maxWidth="lg" sx={{ py: 5 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>Cart</Typography>
      <Stack spacing={2}>
        {items.map((item) => (
          <Paper key={item.id} sx={{ p: 2, display: 'flex', gap: 2, alignItems: 'center' }}>
            <Box component="img" src={item.image} alt={item.name} sx={{ width: 96, height: 96, objectFit: 'cover', borderRadius: 1 }} />
            <Box sx={{ flex: 1 }}><Typography fontWeight={800}>{item.name}</Typography><Typography color="text.secondary">${item.price}</Typography></Box>
            <TextField type="number" size="small" value={item.qty} onChange={(event) => updateQty(item.id, Number(event.target.value))} sx={{ width: 90 }} />
            <IconButton onClick={() => removeFromCart(item.id)}><DeleteIcon /></IconButton>
          </Paper>
        ))}
      </Stack>
      <Paper sx={{ p: 3, mt: 3, ml: 'auto', maxWidth: 420 }}>
        <TextField fullWidth label="Coupon code" sx={{ mb: 2 }} />
        <Stack spacing={1}>
          <Stack direction="row" justifyContent="space-between"><Typography>Subtotal</Typography><Typography>${subtotal.toFixed(2)}</Typography></Stack>
          <Stack direction="row" justifyContent="space-between"><Typography>Shipping</Typography><Typography>${shipping.toFixed(2)}</Typography></Stack>
          <Divider />
          <Stack direction="row" justifyContent="space-between"><Typography variant="h6">Total</Typography><Typography variant="h6">${total.toFixed(2)}</Typography></Stack>
          <Button component={RouterLink} to="/checkout" variant="contained" size="large">Checkout</Button>
        </Stack>
      </Paper>
    </Container>
  );
}
