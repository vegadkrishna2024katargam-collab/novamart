import CreditCardIcon from '@mui/icons-material/CreditCard';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import PaymentsIcon from '@mui/icons-material/Payments';
import PhonePeIcon from '@mui/icons-material/AccountBalanceWallet';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import ShieldIcon from '@mui/icons-material/Shield';
import { Alert, Box, Button, Chip, Container, Divider, FormControl, FormControlLabel, FormHelperText, Grid, LinearProgress, Paper, Radio, RadioGroup, Stack, Step, StepLabel, Stepper, TextField, Typography } from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import EmptyState from '../components/EmptyState.jsx';
import useCart from '../hooks/useCart';
import useAuth from '../hooks/useAuth.js';
import api from '../services/api.js';
import formatCurrency from '../utils/formatCurrency.js';
import { getCategoryName, getProductId, getProductImages } from '../utils/productUtils.js';

const steps = ['Cart', 'Address', 'Payment', 'Review Order', 'Confirmation'];
const initialAddress = { fullName: '', mobile: '', address: '', city: '', state: '', pincode: '' };
const paymentMethods = [
  { value: 'cod', label: 'Cash on Delivery', icon: PaymentsIcon, note: 'Pay when your order arrives.' },
  { value: 'upi', label: 'UPI', icon: PhonePeIcon, note: 'Mock UPI authorization for this demo.' },
  { value: 'card', label: 'Credit/Debit Card', icon: CreditCardIcon, note: 'Mock secure card payment.' },
];

function addressFromUser(user) {
  const saved = user?.defaultAddress || user?.savedAddresses?.[0];
  if (!saved) return initialAddress;
  return {
    fullName: saved.name || user?.name || '',
    mobile: saved.phone || user?.phone || '',
    address: saved.address || '',
    city: saved.city || '',
    state: saved.state || '',
    pincode: saved.postalCode || '',
  };
}

function getBuyNowItem() {
  try {
    const stored = sessionStorage.getItem('novamart_buy_now');
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

export default function CheckoutPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isBuyNow = searchParams.get('buyNow') === '1';
  const buyNowItem = isBuyNow ? getBuyNowItem() : null;
  const { items: cartItems, clearCart } = useCart();
  const { token, logout, user } = useAuth();
  const checkoutItems = useMemo(() => (buyNowItem ? [buyNowItem] : cartItems), [buyNowItem, cartItems]);
  const [address, setAddress] = useState(initialAddress);
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [paymentDetails, setPaymentDetails] = useState({ upiId: '', cardNumber: '', cardName: '', expiry: '', cvv: '' });
  const [fieldErrors, setFieldErrors] = useState({});
  const [error, setError] = useState('');
  const [placingOrder, setPlacingOrder] = useState(false);

  useEffect(() => {
    const savedAddress = addressFromUser(user);
    if (Object.values(savedAddress).some(Boolean)) setAddress(savedAddress);
  }, [user]);

  const subtotal = useMemo(() => checkoutItems.reduce((sum, item) => sum + Number(item.price || 0) * Number(item.qty || 1), 0), [checkoutItems]);
  const shipping = subtotal > 50 ? 0 : 12;
  const discount = subtotal > 500 ? Math.round(subtotal * 0.04) : 0;
  const tax = Math.round((subtotal - discount) * 0.18 * 100) / 100;
  const total = Math.max(0, subtotal + shipping + tax - discount);

  const updateAddress = (event) => {
    const { name, value } = event.target;
    setAddress((current) => ({ ...current, [name]: value }));
    setFieldErrors((current) => ({ ...current, [name]: '' }));
  };

  const updatePaymentDetails = (event) => {
    const { name, value } = event.target;
    setPaymentDetails((current) => ({ ...current, [name]: value }));
    setFieldErrors((current) => ({ ...current, [name]: '' }));
  };

  const validate = () => {
    const nextErrors = {};
    if (!address.fullName.trim()) nextErrors.fullName = 'Full name is required.';
    if (!/^[0-9+\s()-]{7,20}$/.test(address.mobile.trim())) nextErrors.mobile = 'Enter a valid mobile number.';
    if (address.address.trim().length < 10) nextErrors.address = 'Enter a complete address.';
    if (!address.city.trim()) nextErrors.city = 'City is required.';
    if (!address.state.trim()) nextErrors.state = 'State is required.';
    if (!/^[1-9][0-9]{5}$/.test(address.pincode.trim())) nextErrors.pincode = 'Enter a valid 6-digit pincode.';
    if (paymentMethod === 'upi' && !/^[\w.-]{2,}@[a-zA-Z]{2,}$/.test(paymentDetails.upiId.trim())) nextErrors.upiId = 'Enter a valid UPI ID.';
    if (paymentMethod === 'card') {
      if (!/^[0-9]{12,19}$/.test(paymentDetails.cardNumber.replace(/\s/g, ''))) nextErrors.cardNumber = 'Enter a valid card number.';
      if (!paymentDetails.cardName.trim()) nextErrors.cardName = 'Cardholder name is required.';
      if (!/^(0[1-9]|1[0-2])\/[0-9]{2}$/.test(paymentDetails.expiry.trim())) nextErrors.expiry = 'Use MM/YY format.';
      if (!/^[0-9]{3,4}$/.test(paymentDetails.cvv.trim())) nextErrors.cvv = 'Enter a valid CVV.';
    }
    setFieldErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const placeOrder = async () => {
    setError('');
    if (!checkoutItems.length) return;
    if (!validate()) return;
    if (!token || token.startsWith('local-')) {
      if (token?.startsWith('local-')) logout();
      setError('Please log in again before placing your order.');
      navigate('/login', { state: { from: '/checkout' } });
      return;
    }
    setPlacingOrder(true);
    try {
      const payload = {
        // Ensure stable keys for backend demoStore.
        // - backend expects `paymentMethod` and `shippingAddress`
        // - items must include `product` (id), `quantity`, and pricing
        // - color/size are optional
        items: checkoutItems.map((item) => ({
          product: getProductId(item),
          name: item.name,
          image: getProductImages(item)[0],
          category: getCategoryName(item.category),
          quantity: item.qty || 1,
          price: Number(item.price || 0),
          color: item.color || 'Default',
          size: item.size || 'Standard',
        })),
        shippingAddress: {
          name: address.fullName.trim(),
          phone: address.mobile.trim(),
          address: address.address.trim(),
          city: address.city.trim(),
          state: address.state.trim(),
          postalCode: address.pincode.trim(),
          country: 'India',
        },
        paymentMethod,
        paymentDetails,
        subtotal,
        shipping,
        couponDiscount: discount,
        tax,
        total,
      };
      const { data } = await api.post('/orders', payload);
      if (buyNowItem) sessionStorage.removeItem('novamart_buy_now');
      else clearCart();
      navigate('/order-success', { replace: true, state: { order: data } });
    } catch (err) {
      setError(err.response?.data?.message || 'Order could not be placed. Please check your details and try again.');
    } finally {
      setPlacingOrder(false);
    }
  };

  if (!checkoutItems.length) {
    return <EmptyState title="No checkout items" text="Add a product to cart or use Buy Now before checkout." action="View products" />;
  }

  return (
    <Container maxWidth="xl" sx={{ py: { xs: 3, md: 5 } }}>
      <Stack spacing={3}>
        <Box>
          <Typography variant="h4" fontWeight={900}>Checkout</Typography>
          <Typography color="text.secondary">Review your product, shipping details, payment method, and final payable amount.</Typography>
        </Box>

        <Paper sx={{ p: { xs: 2, md: 3 } }}>
          <Stepper activeStep={3} alternativeLabel sx={{ display: { xs: 'none', md: 'flex' } }}>
            {steps.map((label) => <Step key={label}><StepLabel>{label}</StepLabel></Step>)}
          </Stepper>
          <Box sx={{ display: { xs: 'block', md: 'none' } }}>
            <Stack direction="row" justifyContent="space-between"><Typography fontWeight={800}>Review Order</Typography><Typography color="text.secondary">Step 4 of 5</Typography></Stack>
            <LinearProgress variant="determinate" value={80} sx={{ mt: 1 }} />
          </Box>
        </Paper>

        {error ? <Alert severity="error">{error}</Alert> : null}

        <Grid container spacing={3} alignItems="flex-start">
          <Grid item xs={12} lg={8}>
            <Stack spacing={3}>
              <Paper sx={{ p: { xs: 2, md: 3 } }}>
                <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2 }}>
                  <ReceiptLongIcon color="primary" />
                  <Typography variant="h6">Product Summary</Typography>
                </Stack>
                <Stack spacing={2}>
                  {checkoutItems.map((item) => {
                    const image = getProductImages(item)[0];
                    const qty = item.qty || 1;
                    const itemSubtotal = Number(item.price || 0) * qty;
                    return (
                      <Paper key={getProductId(item)} variant="outlined" sx={{ p: 1.5, display: 'grid', gridTemplateColumns: { xs: '88px 1fr', sm: '104px 1fr auto' }, gap: 2, alignItems: 'center' }}>
                        <Box component="img" src={image} alt={item.name} sx={{ width: '100%', aspectRatio: '1 / 1', objectFit: 'cover', borderRadius: 1 }} />
                        <Box>
                          <Typography fontWeight={900}>{item.name}</Typography>
                          <Typography color="text.secondary" variant="body2">Color: {item.color || 'Default'} • Size: {item.size || 'Standard'} • Qty: {qty}</Typography>
                          <Typography color="text.secondary" variant="body2">{getCategoryName(item.category)}</Typography>
                        </Box>
                        <Box sx={{ textAlign: { xs: 'left', sm: 'right' }, gridColumn: { xs: '2', sm: 'auto' } }}>
                          <Typography fontWeight={900}>{formatCurrency(Number(item.price || 0))}</Typography>
                          <Typography color="text.secondary" variant="body2">Subtotal {formatCurrency(itemSubtotal)}</Typography>
                        </Box>
                      </Paper>
                    );
                  })}
                </Stack>
              </Paper>

              <Paper sx={{ p: { xs: 2, md: 3 } }}>
                <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2 }}>
                  <LocalShippingIcon color="primary" />
                  <Typography variant="h6">Shipping Details</Typography>
                </Stack>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}><TextField fullWidth required name="fullName" label="Full Name" value={address.fullName} onChange={updateAddress} error={Boolean(fieldErrors.fullName)} helperText={fieldErrors.fullName} /></Grid>
                  <Grid item xs={12} sm={6}><TextField fullWidth required name="mobile" label="Mobile Number" value={address.mobile} onChange={updateAddress} error={Boolean(fieldErrors.mobile)} helperText={fieldErrors.mobile} /></Grid>
                  <Grid item xs={12}><TextField fullWidth required multiline rows={3} name="address" label="Address" value={address.address} onChange={updateAddress} error={Boolean(fieldErrors.address)} helperText={fieldErrors.address} /></Grid>
                  <Grid item xs={12} sm={4}><TextField fullWidth required name="city" label="City" value={address.city} onChange={updateAddress} error={Boolean(fieldErrors.city)} helperText={fieldErrors.city} /></Grid>
                  <Grid item xs={12} sm={4}><TextField fullWidth required name="state" label="State" value={address.state} onChange={updateAddress} error={Boolean(fieldErrors.state)} helperText={fieldErrors.state} /></Grid>
                  <Grid item xs={12} sm={4}><TextField fullWidth required name="pincode" label="Pincode" value={address.pincode} onChange={updateAddress} error={Boolean(fieldErrors.pincode)} helperText={fieldErrors.pincode} /></Grid>
                </Grid>
              </Paper>

              <Paper sx={{ p: { xs: 2, md: 3 } }}>
                <Typography variant="h6" sx={{ mb: 2 }}>Payment Method</Typography>
                <FormControl fullWidth error={Boolean(fieldErrors.paymentMethod)}>
                  <RadioGroup value={paymentMethod} onChange={(event) => setPaymentMethod(event.target.value)}>
                    <Grid container spacing={2}>
                      {paymentMethods.map(({ value, label, icon: Icon, note }) => (
                        <Grid item xs={12} md={4} key={value}>
                          <Paper variant="outlined" sx={{ p: 2, height: '100%', borderColor: paymentMethod === value ? 'primary.main' : 'divider' }}>
                            <FormControlLabel value={value} control={<Radio />} label={<Stack spacing={0.5}><Stack direction="row" spacing={1} alignItems="center"><Icon fontSize="small" /><Typography fontWeight={900}>{label}</Typography></Stack><Typography variant="caption" color="text.secondary">{note}</Typography></Stack>} />
                          </Paper>
                        </Grid>
                      ))}
                    </Grid>
                  </RadioGroup>
                  {fieldErrors.paymentMethod ? <FormHelperText>{fieldErrors.paymentMethod}</FormHelperText> : null}
                </FormControl>

                {paymentMethod === 'upi' ? (
                  <TextField sx={{ mt: 2 }} fullWidth name="upiId" label="UPI ID" placeholder="name@bank" value={paymentDetails.upiId} onChange={updatePaymentDetails} error={Boolean(fieldErrors.upiId)} helperText={fieldErrors.upiId || 'Demo checkout validates the UPI format and marks payment as paid.'} />
                ) : null}

                {paymentMethod === 'card' ? (
                  <Grid container spacing={2} sx={{ mt: 0.5 }}>
                    <Grid item xs={12}><TextField fullWidth name="cardNumber" label="Card Number" value={paymentDetails.cardNumber} onChange={updatePaymentDetails} error={Boolean(fieldErrors.cardNumber)} helperText={fieldErrors.cardNumber} /></Grid>
                    <Grid item xs={12} sm={6}><TextField fullWidth name="cardName" label="Name on Card" value={paymentDetails.cardName} onChange={updatePaymentDetails} error={Boolean(fieldErrors.cardName)} helperText={fieldErrors.cardName} /></Grid>
                    <Grid item xs={6} sm={3}><TextField fullWidth name="expiry" label="MM/YY" value={paymentDetails.expiry} onChange={updatePaymentDetails} error={Boolean(fieldErrors.expiry)} helperText={fieldErrors.expiry} /></Grid>
                    <Grid item xs={6} sm={3}><TextField fullWidth name="cvv" label="CVV" value={paymentDetails.cvv} onChange={updatePaymentDetails} error={Boolean(fieldErrors.cvv)} helperText={fieldErrors.cvv} /></Grid>
                  </Grid>
                ) : null}
              </Paper>
            </Stack>
          </Grid>

          <Grid item xs={12} lg={4}>
            <Paper sx={{ p: { xs: 2, md: 3 }, position: { lg: 'sticky' }, top: 96 }}>
              <Stack spacing={2}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="h6">Your Order</Typography>
                  <Chip label={`${checkoutItems.length} item${checkoutItems.length > 1 ? 's' : ''}`} />
                </Stack>
                <Divider />
                <Stack spacing={1.25}>
                  <Stack direction="row" justifyContent="space-between"><Typography color="text.secondary">Subtotal</Typography><Typography>{formatCurrency(subtotal)}</Typography></Stack>
                  <Stack direction="row" justifyContent="space-between"><Typography color="text.secondary">Shipping</Typography><Typography>{shipping === 0 ? 'Free' : formatCurrency(shipping)}</Typography></Stack>
                  <Stack direction="row" justifyContent="space-between"><Typography color="text.secondary">Discount</Typography><Typography color="success.main">-{formatCurrency(discount)}</Typography></Stack>
                  <Stack direction="row" justifyContent="space-between"><Typography color="text.secondary">GST</Typography><Typography>{formatCurrency(tax)}</Typography></Stack>
                </Stack>
                <Divider />
                <Stack direction="row" justifyContent="space-between" alignItems="baseline">
                  <Typography variant="h6">Total</Typography>
                  <Typography variant="h4" color="primary" fontWeight={900}>{formatCurrency(total)}</Typography>
                </Stack>
                <Button variant="contained" size="large" onClick={placeOrder} disabled={placingOrder}>{placingOrder ? 'Placing Order...' : 'Place Order'}</Button>
                <Stack direction="row" spacing={1} alignItems="center" justifyContent="center">
                  <ShieldIcon fontSize="small" color="success" />
                  <Typography variant="caption" color="text.secondary">Secure checkout • SSL encrypted</Typography>
                </Stack>
              </Stack>
            </Paper>
          </Grid>
        </Grid>
      </Stack>
    </Container>
  );
}
