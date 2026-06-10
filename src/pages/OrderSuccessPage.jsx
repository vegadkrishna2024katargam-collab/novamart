import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HomeIcon from '@mui/icons-material/Home';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import { Box, Button, Container, Divider, Paper, Stack, Typography } from '@mui/material';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import formatCurrency from '../utils/formatCurrency.js';

export default function OrderSuccessPage() {
  const { state } = useLocation();
  const order = state?.order;

  return (
    <Container maxWidth="md" sx={{ py: { xs: 5, md: 8 } }}>
      <Paper sx={{ p: { xs: 3, md: 5 } }}>
        <Stack spacing={3} alignItems="center" textAlign="center">
          <CheckCircleIcon color="success" sx={{ fontSize: 72 }} />
          <Box>
            <Typography variant="h4" fontWeight={900}>Order placed successfully</Typography>
            <Typography color="text.secondary">
              {order?._id ? `Order ID: ${order._id}` : 'Your order has been confirmed.'}
            </Typography>
          </Box>

          {order ? (
            <Paper variant="outlined" sx={{ width: '100%', p: 2.5, textAlign: 'left' }}>
              <Stack spacing={1.5}>
                <Stack direction="row" justifyContent="space-between">
                  <Typography color="text.secondary">Payment</Typography>
                  <Typography fontWeight={800}>{order.paymentMethod?.toUpperCase()} - {order.paymentStatus}</Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between">
                  <Typography color="text.secondary">Items</Typography>
                  <Typography fontWeight={800}>{order.items?.length || 0}</Typography>
                </Stack>
                <Divider />
                <Stack direction="row" justifyContent="space-between" alignItems="baseline">
                  <Typography variant="h6">Total</Typography>
                  <Typography variant="h5" color="primary" fontWeight={900}>{formatCurrency(order.total || 0)}</Typography>
                </Stack>
              </Stack>
            </Paper>
          ) : null}

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ width: '100%' }}>
            <Button fullWidth component={RouterLink} to="/dashboard?section=orders" variant="contained" startIcon={<ReceiptLongIcon />}>View Order</Button>
            <Button fullWidth component={RouterLink} to="/products" variant="outlined" startIcon={<ShoppingBagIcon />}>Shop More</Button>
            <Button fullWidth component={RouterLink} to="/" variant="text" startIcon={<HomeIcon />}>Home</Button>
          </Stack>
        </Stack>
      </Paper>
    </Container>
  );
}
