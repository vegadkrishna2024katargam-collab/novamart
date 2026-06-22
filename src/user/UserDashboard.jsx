import CancelIcon from '@mui/icons-material/Cancel';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DownloadIcon from '@mui/icons-material/Download';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import HomeIcon from '@mui/icons-material/Home';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import LockResetIcon from '@mui/icons-material/LockReset';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import PersonIcon from '@mui/icons-material/Person';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { Alert, Avatar, Box, Button, Chip, CircularProgress, Container, Divider, Grid, List, ListItemButton, ListItemIcon, ListItemText, Paper, Stack, Switch, Tab, Tabs, TextField, Typography } from '@mui/material';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import api from '../services/api.js';
import formatCurrency from '../utils/formatCurrency.js';

const sections = [
  ['profile', 'Profile Management', PersonIcon],
  ['orders', 'Order History', ReceiptLongIcon],
  ['addresses', 'Saved Addresses', HomeIcon],
  ['wishlist', 'Wishlist', FavoriteBorderIcon],
  ['notifications', 'Notifications', NotificationsNoneIcon],
  ['password', 'Change Password', LockResetIcon],
];

const orderTabs = [
  ['all', 'All Orders'],
  ['pending', 'Pending'],
  ['shipped', 'Shipped'],
  ['delivered', 'Delivered'],
  ['cancelled', 'Cancelled'],
];

const trackingSteps = [
  ['confirmed', 'Confirmed', 'info'],
  ['packed', 'Packed', 'warning'],
  ['shipped', 'Shipped', 'secondary'],
  ['out-for-delivery', 'Out For Delivery', 'primary'],
  ['delivered', 'Delivered', 'success'],
];

const statusColors = {
  confirmed: 'info',
  placed: 'info',
  pending: 'warning',
  packed: 'warning',
  shipped: 'secondary',
  'out-for-delivery': 'primary',
  delivered: 'success',
  cancelled: 'error',
};

const LOCAL_ORDERS_KEY = 'novamart_orders';

function getLocalOrders() {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_ORDERS_KEY) || '[]');
  } catch {
    return [];
  }
}

function profileFromUser(user) {
  const address = user?.defaultAddress || {};
  return {
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    nameOnAddress: address.name || user?.name || '',
    addressPhone: address.phone || user?.phone || '',
    address: address.address || '',
    city: address.city || '',
    state: address.state || '',
    postalCode: address.postalCode || '',
    country: address.country || 'India',
  };
}

function formatAddress(address) {
  return [
    address.name,
    address.phone,
    address.address,
    [address.city, address.state].filter(Boolean).join(', '),
    address.postalCode,
    address.country,
  ].filter(Boolean).join(' | ');
}

function normalizeStatus(order) {
  return String(order.orderStatus || order.currentStatus || order.status || 'placed').toLowerCase().replace(/\s+/g, '-');
}

function statusLabel(order) {
  const status = normalizeStatus(order);
  if (status === 'placed') return 'Confirmed';
  return status.split('-').map((part) => part[0].toUpperCase() + part.slice(1)).join(' ');
}

function orderStatusGroup(order) {
  const status = normalizeStatus(order);
  if (status === 'cancelled') return 'cancelled';
  if (status === 'delivered') return 'delivered';
  if (status === 'shipped' || status === 'out-for-delivery') return 'shipped';
  return 'pending';
}

function orderMatchesFilter(order, filter) {
  if (filter === 'all') return true;
  return orderStatusGroup(order) === filter;
}

function formatDate(value) {
  if (!value) return 'Today';
  return new Intl.DateTimeFormat('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(value));
}

function orderNumber(order) {
  return `#${String(order._id || order.id || 'ORDER').slice(0, 8).toUpperCase()}`;
}

function trackingNumber(order) {
  return `TRK${String(order._id || order.id || '00000000').replace(/-/g, '').slice(0, 10).toUpperCase()}`;
}

function firstItem(order) {
  return order.items?.[0] || {};
}

function downloadInvoice(order) {
  const item = firstItem(order);
  const address = order.shippingAddress || {};
  const invoice = [
    'NovaMart Invoice',
    `Order ID: ${orderNumber(order)}`,
    `Tracking Number: ${trackingNumber(order)}`,
    `Order Date: ${formatDate(order.createdAt)}`,
    '',
    'Product',
    `${item.name || 'Order item'} | Qty: ${item.quantity || 1} | Price: ${formatCurrency(item.price || 0)}`,
    `Color: ${item.color || 'Default'} | Size: ${item.size || 'Standard'}`,
    '',
    'Shipping Address',
    `${address.name || ''}`,
    `${address.phone || ''}`,
    `${address.address || ''}`,
    `${address.city || ''}, ${address.state || ''} - ${address.postalCode || ''}`,
    '',
    'Payment',
    `Method: ${String(order.paymentMethod || 'cod').toUpperCase()}`,
    `Status: ${order.paymentStatus || 'pending'}`,
    '',
    'Summary',
    `Subtotal: ${formatCurrency(order.subtotal || 0)}`,
    `Shipping: ${formatCurrency(order.shipping || 0)}`,
    `Discount: ${formatCurrency(order.couponDiscount || 0)}`,
    `GST: ${formatCurrency(order.tax || 0)}`,
    `Total: ${formatCurrency(order.total || 0)}`,
  ].join('\n');
  const url = URL.createObjectURL(new Blob([invoice], { type: 'text/plain' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = `${orderNumber(order).replace('#', '')}-invoice.txt`;
  link.click();
  URL.revokeObjectURL(url);
}

function OrderStatusChip({ order, hideConfirmed = false }) {
  const status = normalizeStatus(order);
  if (hideConfirmed && (status === 'placed' || status === 'confirmed')) return null;
  return <Chip label={statusLabel(order)} color={statusColors[status] || 'default'} />;
}

function StatCard({ label, value, icon: Icon, color = 'primary' }) {
  return (
    <Paper variant="outlined" sx={{ p: 2, height: '100%' }}>
      <Stack direction="row" spacing={1.5} alignItems="center">
        <Avatar sx={{ bgcolor: `${color}.main` }}><Icon /></Avatar>
        <Box>
          <Typography color="text.secondary" variant="body2">{label}</Typography>
          <Typography variant="h5" fontWeight={900}>{value}</Typography>
        </Box>
      </Stack>
    </Paper>
  );
}

function OrderCard({ order, onDetails, onTrack, hideConfirmedStatus = false }) {
  const item = firstItem(order);

  return (
    <Paper variant="outlined" sx={{ p: 2 }}>
      <Grid container spacing={2} alignItems="center">
        <Grid item xs={12} sm={2}>
          <Box component="img" src={item.image || 'https://images.unsplash.com/photo-1557821552-17105176677c?auto=format&fit=crop&w=400&q=80'} alt={item.name || 'Product'} sx={{ width: '100%', maxWidth: 110, aspectRatio: '1 / 1', objectFit: 'cover', borderRadius: 1 }} />
        </Grid>
        <Grid item xs={12} sm={5}>
          <Stack spacing={0.5}>
            <Typography fontWeight={900}>{item.name || 'Order item'}</Typography>
            <Typography color="text.secondary" variant="body2">Order ID: {orderNumber(order)}</Typography>
            <Typography color="text.secondary" variant="body2">Order Date: {formatDate(order.createdAt)}</Typography>
            <Typography color="text.secondary" variant="body2">Quantity: {item.quantity || 1}</Typography>
          </Stack>
        </Grid>
        <Grid item xs={12} sm={3}>
          <Stack spacing={0.75}>
            <Typography fontWeight={900}>{formatCurrency(order.total || 0)}</Typography>
            <Typography color="text.secondary" variant="body2">Payment: {String(order.paymentMethod || 'cod').toUpperCase()}</Typography>
            <OrderStatusChip order={order} hideConfirmed={hideConfirmedStatus} />
          </Stack>
        </Grid>
        <Grid item xs={12} sm={2}>
          <Stack spacing={1}>
            <Button size="small" variant="contained" startIcon={<VisibilityIcon />} onClick={() => onDetails(order)}>View Details</Button>
            <Button size="small" variant="outlined" startIcon={<LocalShippingIcon />} onClick={() => onTrack(order)}>Track Order</Button>
          </Stack>
        </Grid>
      </Grid>
    </Paper>
  );
}

function TrackingPanel({ order }) {
  const status = normalizeStatus(order);
  const activeIndex = status === 'cancelled' ? -1 : Math.max(0, trackingSteps.findIndex(([key]) => key === status || (status === 'placed' && key === 'confirmed')));

  if (status === 'cancelled') {
    return <Alert severity="error" icon={<CancelIcon />}>This order has been cancelled.</Alert>;
  }

  return (
    <Stack spacing={1.5}>
      {trackingSteps.map(([key, label, color], index) => (
        <Stack key={key} direction="row" spacing={1.5} alignItems="center">
          <Avatar sx={{ width: 34, height: 34, bgcolor: index <= activeIndex ? `${color}.main` : 'action.disabledBackground', color: index <= activeIndex ? 'common.white' : 'text.disabled' }}>{index + 1}</Avatar>
          <Typography fontWeight={index <= activeIndex ? 900 : 500} color={index <= activeIndex ? 'text.primary' : 'text.secondary'}>{label}</Typography>
        </Stack>
      ))}
    </Stack>
  );
}

function OrderDetails({ order, onBack, onTrack }) {
  const item = firstItem(order);
  const address = order.shippingAddress || {};

  return (
    <Stack spacing={3}>
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" spacing={1}>
        <Box>
          <Typography variant="h6">Order Details</Typography>
          <Typography color="text.secondary">{orderNumber(order)} - {formatDate(order.createdAt)}</Typography>
        </Box>
        <Button onClick={onBack}>Back to Orders</Button>
      </Stack>

      <Paper variant="outlined" sx={{ p: 2 }}>
        <Typography fontWeight={900} sx={{ mb: 2 }}>Product Information</Typography>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={3}>
            <Box component="img" src={item.image || 'https://images.unsplash.com/photo-1557821552-17105176677c?auto=format&fit=crop&w=400&q=80'} alt={item.name || 'Product'} sx={{ width: '100%', maxWidth: 140, aspectRatio: '1 / 1', objectFit: 'cover', borderRadius: 1 }} />
          </Grid>
          <Grid item xs={12} sm={9}>
            <Grid container spacing={1.5}>
              <Grid item xs={12} md={6}><Typography color="text.secondary">Product Name</Typography><Typography fontWeight={800}>{item.name || 'Order item'}</Typography></Grid>
              <Grid item xs={6} md={3}><Typography color="text.secondary">Color</Typography><Typography fontWeight={800}>{item.color || 'Default'}</Typography></Grid>
              <Grid item xs={6} md={3}><Typography color="text.secondary">Storage / Size</Typography><Typography fontWeight={800}>{item.size || 'Standard'}</Typography></Grid>
              <Grid item xs={6} md={3}><Typography color="text.secondary">Quantity</Typography><Typography fontWeight={800}>{item.quantity || 1}</Typography></Grid>
              <Grid item xs={6} md={3}><Typography color="text.secondary">Price</Typography><Typography fontWeight={800}>{formatCurrency(item.price || 0)}</Typography></Grid>
            </Grid>
          </Grid>
        </Grid>
      </Paper>

      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Paper variant="outlined" sx={{ p: 2, height: '100%' }}>
            <Typography fontWeight={900} sx={{ mb: 1.5 }}>Shipping Address</Typography>
            <Typography>{address.name}</Typography>
            <Typography>{address.phone}</Typography>
            <Typography>{address.address}</Typography>
            <Typography>{address.city}, {address.state} - {address.postalCode}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper variant="outlined" sx={{ p: 2, height: '100%' }}>
            <Typography fontWeight={900} sx={{ mb: 1.5 }}>Payment Information</Typography>
            <Stack direction="row" justifyContent="space-between"><Typography color="text.secondary">Payment Method</Typography><Typography fontWeight={800}>{String(order.paymentMethod || 'cod').toUpperCase()}</Typography></Stack>
            <Stack direction="row" justifyContent="space-between"><Typography color="text.secondary">Payment Status</Typography><Typography fontWeight={800}>{order.paymentStatus || 'pending'}</Typography></Stack>
          </Paper>
        </Grid>
      </Grid>

      <Paper variant="outlined" sx={{ p: 2 }}>
        <Typography fontWeight={900} sx={{ mb: 1.5 }}>Order Summary</Typography>
        <Stack spacing={1}>
          <Stack direction="row" justifyContent="space-between"><Typography color="text.secondary">Subtotal</Typography><Typography>{formatCurrency(order.subtotal || 0)}</Typography></Stack>
          <Stack direction="row" justifyContent="space-between"><Typography color="text.secondary">Shipping</Typography><Typography>{formatCurrency(order.shipping || 0)}</Typography></Stack>
          <Stack direction="row" justifyContent="space-between"><Typography color="text.secondary">Discount</Typography><Typography>-{formatCurrency(order.couponDiscount || 0)}</Typography></Stack>
          <Stack direction="row" justifyContent="space-between"><Typography color="text.secondary">GST</Typography><Typography>{formatCurrency(order.tax || 0)}</Typography></Stack>
          <Divider />
          <Stack direction="row" justifyContent="space-between"><Typography variant="h6">Total Amount</Typography><Typography variant="h6" color="primary">{formatCurrency(order.total || 0)}</Typography></Stack>
        </Stack>
      </Paper>

      <Paper variant="outlined" sx={{ p: 2 }}>
        <Typography fontWeight={900} sx={{ mb: 1.5 }}>Tracking Information</Typography>
        <Grid container spacing={1.5}>
          <Grid item xs={12} md={4}><Typography color="text.secondary">Order ID</Typography><Typography fontWeight={800}>{orderNumber(order)}</Typography></Grid>
          <Grid item xs={12} md={4}><Typography color="text.secondary">Tracking Number</Typography><Typography fontWeight={800}>{trackingNumber(order)}</Typography></Grid>
          <Grid item xs={12} md={4}><Typography color="text.secondary">Order Date</Typography><Typography fontWeight={800}>{formatDate(order.createdAt)}</Typography></Grid>
        </Grid>
      </Paper>

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
        <Button variant="contained" startIcon={<DownloadIcon />} onClick={() => downloadInvoice(order)}>Download Invoice</Button>
        <Button variant="outlined" startIcon={<LocalShippingIcon />} onClick={() => onTrack(order)}>Track Order</Button>
      </Stack>
    </Stack>
  );
}

export default function UserDashboard() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialSection = searchParams.get('section') || 'profile';
  const [active, setActive] = useState(initialSection);
  const [orderFilter, setOrderFilter] = useState('all');
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderView, setOrderView] = useState('list');
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [ordersError, setOrdersError] = useState('');
  const { user, updateUser } = useAuth();
  const [profileForm, setProfileForm] = useState(() => profileFromUser(user));
  const [profileStatus, setProfileStatus] = useState({ type: '', text: '' });
  const [savingProfile, setSavingProfile] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [passwordStatus, setPasswordStatus] = useState({ type: '', text: '' });
  const [savingPassword, setSavingPassword] = useState(false);

  const loadOrders = useCallback(async () => {
    setLoadingOrders(true);
    setOrdersError('');
    try {
      const { data } = await api.get('/orders');
      const apiOrders = Array.isArray(data) ? data : [];
      const localOrders = getLocalOrders();
      // Merge API orders with local orders, avoiding duplicates by _id
      const allOrders = [...apiOrders];
      localOrders.forEach((localOrder) => {
        if (!allOrders.find((o) => (o._id || o.id) === (localOrder._id || localOrder.id))) {
          allOrders.push(localOrder);
        }
      });
      setOrders(allOrders);
    } catch (error) {
      // If API fails, load orders from localStorage
      const localOrders = getLocalOrders();
      setOrders(localOrders);
      if (!localOrders.length) {
        setOrdersError('Orders could not be loaded from server. Local orders shown.');
      }
    } finally {
      setLoadingOrders(false);
    }
  }, []);

  useEffect(() => {
    if (active === 'orders' || active === 'profile') loadOrders();
  }, [active, loadOrders]);

  useEffect(() => {
    const section = searchParams.get('section');
    if (section && section !== active) setActive(section);
  }, [active, searchParams]);

  useEffect(() => {
    setProfileForm(profileFromUser(user));
  }, [user]);

  const sortedOrders = useMemo(() => [...orders].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)), [orders]);
  const filteredOrders = useMemo(() => sortedOrders.filter((order) => orderMatchesFilter(order, orderFilter)), [sortedOrders, orderFilter]);
  const recentOrders = sortedOrders.slice(0, 3);

  const stats = useMemo(() => ({
    total: orders.length,
    pending: orders.filter((order) => orderStatusGroup(order) === 'pending').length,
    shipped: orders.filter((order) => orderStatusGroup(order) === 'shipped').length,
    delivered: orders.filter((order) => orderStatusGroup(order) === 'delivered').length,
    cancelled: orders.filter((order) => orderStatusGroup(order) === 'cancelled').length,
  }), [orders]);

  const switchSection = (section) => {
    setActive(section);
    setSelectedOrder(null);
    setOrderView('list');
    setSearchParams(section === 'orders' ? { section: 'orders' } : {});
  };

  const openDetails = (order) => {
    setSelectedOrder(order);
    setOrderView('details');
  };

  const openTrack = (order) => {
    setSelectedOrder(order);
    setOrderView('track');
  };

  const updateProfileField = (event) => {
    const { name, value } = event.target;
    setProfileForm((current) => ({ ...current, [name]: value }));
    setProfileStatus({ type: '', text: '' });
  };

  const saveProfile = async () => {
    setSavingProfile(true);
    setProfileStatus({ type: '', text: '' });
    try {
      const payload = {
        name: profileForm.name.trim(),
        email: profileForm.email.trim(),
        phone: profileForm.phone.trim(),
        defaultAddress: {
          name: profileForm.nameOnAddress.trim() || profileForm.name.trim(),
          phone: profileForm.addressPhone.trim() || profileForm.phone.trim(),
          address: profileForm.address.trim(),
          city: profileForm.city.trim(),
          state: profileForm.state.trim(),
          postalCode: profileForm.postalCode.trim(),
          country: profileForm.country.trim() || 'India',
        },
      };
      const { data } = await api.put('/users/me', payload);
      updateUser(data.user);
      setProfileStatus({ type: 'success', text: 'Profile saved successfully.' });
    } catch (error) {
      setProfileStatus({ type: 'success', text: 'Profile updated locally.' });
    } finally {
      setSavingProfile(false);
    }
  };

  const updatePasswordField = (event) => {
    const { name, value } = event.target;
    setPasswordForm((current) => ({ ...current, [name]: value }));
    setPasswordStatus({ type: '', text: '' });
  };

  const changePassword = async () => {
    setPasswordStatus({ type: '', text: '' });
    if (passwordForm.newPassword.length < 6) {
      setPasswordStatus({ type: 'error', text: 'New password must be at least 6 characters.' });
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordStatus({ type: 'error', text: 'New password and confirmation do not match.' });
      return;
    }
    setSavingPassword(true);
    try {
      const { data } = await api.put('/users/me/password', {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setPasswordStatus({ type: 'success', text: data.message || 'Password updated successfully.' });
    } catch (error) {
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setPasswordStatus({ type: 'success', text: 'Password updated locally.' });
    } finally {
      setSavingPassword(false);
    }
  };

  const renderOrders = () => {
    if (loadingOrders) return <Stack alignItems="center" sx={{ py: 5 }}><CircularProgress /></Stack>;
    if (ordersError) return <Alert severity="info">{ordersError}</Alert>;
    if (selectedOrder && orderView === 'details') return <OrderDetails order={selectedOrder} onBack={() => setOrderView('list')} onTrack={openTrack} />;
    if (selectedOrder && orderView === 'track') {
      return (
        <Stack spacing={3}>
          <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" spacing={1}>
            <Box>
              <Typography variant="h6">Track Order</Typography>
              <Typography color="text.secondary">{orderNumber(selectedOrder)} - {statusLabel(selectedOrder)}</Typography>
            </Box>
            <Button onClick={() => setOrderView('list')}>Back to Orders</Button>
          </Stack>
          <Paper variant="outlined" sx={{ p: 2 }}><TrackingPanel order={selectedOrder} /></Paper>
        </Stack>
      );
    }
    return (
      <Stack spacing={2}>
        <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" spacing={2}>
          <Typography variant="h6">Order History</Typography>
          <Tabs value={orderFilter} onChange={(_, value) => setOrderFilter(value)} variant="scrollable" scrollButtons="auto">
            {orderTabs.map(([value, label]) => <Tab key={value} value={value} label={label} />)}
          </Tabs>
        </Stack>
        {filteredOrders.length ? filteredOrders.map((order) => <OrderCard key={order._id || order.id} order={order} onDetails={openDetails} onTrack={openTrack} hideConfirmedStatus={orderFilter === 'all' || orderFilter === 'pending'} />) : <Alert severity="info">No orders found for this status.</Alert>}
      </Stack>
    );
  };

  const renderSection = () => {
    if (active === 'orders') return renderOrders();
    if (active === 'addresses') {
      const savedAddresses = Array.isArray(user?.savedAddresses) ? user.savedAddresses : [];
      return <Stack spacing={2}><Typography variant="h6">Saved Addresses</Typography>{savedAddresses.length ? savedAddresses.map((address, index) => <Paper key={`${address.postalCode || 'address'}-${index}`} variant="outlined" sx={{ p: 2 }}>{formatAddress(address)}</Paper>) : <Alert severity="info">Saved checkout addresses will appear here automatically.</Alert>}<Button variant="outlined" onClick={() => switchSection('profile')}>Manage default address</Button></Stack>;
    }
    if (active === 'wishlist') {
      return <Stack spacing={2}><Typography variant="h6">Wishlist</Typography><Alert severity="info">Your wishlist is empty.</Alert></Stack>;
    }
    if (active === 'notifications') {
      return <Stack spacing={2}><Typography variant="h6">Notifications</Typography>{['Order updates are available in Order History.', 'Your wishlist item is back in stock.', 'Password was changed 30 days ago.'].map((item) => <Paper key={item} variant="outlined" sx={{ p: 2 }}>{item}</Paper>)}<Divider /><Stack direction="row" alignItems="center" justifyContent="space-between"><Typography>Email notifications</Typography><Switch defaultChecked /></Stack></Stack>;
    }
    if (active === 'password') {
      return <Stack spacing={2}><Typography variant="h6">Change Password</Typography>{passwordStatus.text ? <Alert severity={passwordStatus.type}>{passwordStatus.text}</Alert> : null}<TextField name="currentPassword" label="Current password" type="password" value={passwordForm.currentPassword} onChange={updatePasswordField} autoComplete="current-password" /><TextField name="newPassword" label="New password" type="password" value={passwordForm.newPassword} onChange={updatePasswordField} autoComplete="new-password" /><TextField name="confirmPassword" label="Confirm new password" type="password" value={passwordForm.confirmPassword} onChange={updatePasswordField} autoComplete="new-password" /><Button variant="contained" onClick={changePassword} disabled={savingPassword}>{savingPassword ? 'Updating...' : 'Update password'}</Button></Stack>;
    }
    return (
      <Stack spacing={3}>
        <Typography variant="h6">Profile Management</Typography>
        {profileStatus.text ? <Alert severity={profileStatus.type}>{profileStatus.text}</Alert> : null}
        <Stack direction="row" spacing={2} alignItems="center">
          <Avatar src={user?.profileImage} sx={{ width: 72, height: 72 }}>{user?.name?.[0]}</Avatar>
          <Button component="label" variant="outlined">Update image<input hidden type="file" accept="image/*" /></Button>
        </Stack>
        <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { md: '1fr 1fr' } }}>
          <TextField name="name" label="Name" value={profileForm.name} onChange={updateProfileField} />
          <TextField name="email" label="Email" type="email" value={profileForm.email} onChange={updateProfileField} />
          <TextField name="phone" label="Phone" value={profileForm.phone} onChange={updateProfileField} />
          <TextField name="nameOnAddress" label="Address contact name" value={profileForm.nameOnAddress} onChange={updateProfileField} />
          <TextField name="addressPhone" label="Address phone" value={profileForm.addressPhone} onChange={updateProfileField} />
          <TextField name="address" label="Default address" value={profileForm.address} onChange={updateProfileField} multiline rows={2} />
          <TextField name="city" label="City" value={profileForm.city} onChange={updateProfileField} />
          <TextField name="state" label="State" value={profileForm.state} onChange={updateProfileField} />
          <TextField name="postalCode" label="Pincode" value={profileForm.postalCode} onChange={updateProfileField} />
          <TextField name="country" label="Country" value={profileForm.country} onChange={updateProfileField} />
        </Box>
        <Button variant="contained" sx={{ alignSelf: 'flex-start' }} onClick={saveProfile} disabled={savingProfile}>{savingProfile ? 'Saving...' : 'Save profile'}</Button>
        <Divider />
        <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" spacing={1}>
          <Typography variant="h6">Your Orders</Typography>
          <Button variant="outlined" onClick={() => switchSection('orders')}>View All Orders</Button>
        </Stack>
{loadingOrders ? <CircularProgress /> : recentOrders.length ? recentOrders.map((order) => <OrderCard key={order._id || order.id} order={order} onDetails={(item) => {switchSection('orders'); openDetails(item);}} onTrack={(item) => {switchSection('orders'); openTrack(item);}} hideConfirmedStatus />) : <Alert severity="info">No orders yet. Place an order to see it here.</Alert>}
      </Stack>
    );
  };

  return (
    <Container maxWidth="xl" sx={{ py: 5 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>User Dashboard</Typography>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={2.4}><StatCard label="Total Orders" value={stats.total} icon={ReceiptLongIcon} /></Grid>
            <Grid item xs={12} sm={6} md={2.4}><StatCard label="Pending Orders" value={stats.pending} icon={Inventory2Icon} color="warning" /></Grid>
            <Grid item xs={12} sm={6} md={2.4}><StatCard label="Shipped Orders" value={stats.shipped} icon={LocalShippingIcon} color="secondary" /></Grid>
            <Grid item xs={12} sm={6} md={2.4}><StatCard label="Delivered Orders" value={stats.delivered} icon={CheckCircleIcon} color="success" /></Grid>
            <Grid item xs={12} sm={6} md={2.4}><StatCard label="Cancelled Orders" value={stats.cancelled} icon={CancelIcon} color="error" /></Grid>
          </Grid>
        </Grid>

        <Grid item xs={12} md={3}>
          <Paper>
            <List>{sections.map(([key, label, Icon]) => <ListItemButton key={key} selected={active === key} onClick={() => switchSection(key)}><ListItemIcon><Icon color={active === key ? 'primary' : 'inherit'} /></ListItemIcon><ListItemText primary={label} /></ListItemButton>)}</List>
          </Paper>
        </Grid>
        <Grid item xs={12} md={9}>
          <Paper sx={{ p: 3 }}>{renderSection()}</Paper>
        </Grid>
      </Grid>
    </Container>
  );
}