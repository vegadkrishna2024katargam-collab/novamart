import AddIcon from '@mui/icons-material/Add';
import BarChartIcon from '@mui/icons-material/BarChart';
import CategoryIcon from '@mui/icons-material/Category';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import LogoutIcon from '@mui/icons-material/Logout';
import RateReviewIcon from '@mui/icons-material/RateReview';
import RefreshIcon from '@mui/icons-material/Refresh';
import SaveIcon from '@mui/icons-material/Save';
import SettingsIcon from '@mui/icons-material/Settings';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import SupervisedUserCircleIcon from '@mui/icons-material/SupervisedUserCircle';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { Alert, Avatar, Box, Button, Chip, Container, Dialog, DialogActions, DialogContent, DialogTitle, Divider, Grid, IconButton, List, ListItemButton, ListItemIcon, ListItemText, MenuItem, Paper, Select, Stack, Switch, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tabs, Tab, TextField, Typography } from '@mui/material';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import useAuth from '../hooks/useAuth';
import api from '../services/api';
import { colors } from '../styles/theme';
import formatCurrency from '../utils/formatCurrency';

const menu = [
  ['dashboard', 'Dashboard', BarChartIcon],
  ['products', 'Products', Inventory2Icon],
  ['orders', 'Orders', ShoppingBagIcon],
  ['users', 'Users', SupervisedUserCircleIcon],
  ['categories', 'Categories', CategoryIcon],
  ['coupons', 'Coupons', LocalOfferIcon],
  ['reviews', 'Reviews', RateReviewIcon],
  ['settings', 'Settings', SettingsIcon],
];

const orderStatuses = ['pending', 'confirmed', 'packed', 'shipped', 'out-for-delivery', 'delivered', 'cancelled', 'refunded'];
const settingSections = ['general', 'payment', 'shipping', 'email', 'seo'];

const emptyProduct = { name: '', description: '', category: '', brand: '', price: '', discountPrice: '', stockQuantity: '', images: '', colors: '', sizes: '', status: 'active' };
const emptyCategory = { name: '', description: '', banner: '', image: '', status: 'active' };
const emptyCoupon = { code: '', discountType: 'percentage', discountValue: '', minimumPurchase: '', maximumDiscount: '', expiryDate: '', usageLimit: '', isActive: true };

function idOf(item) {
  return item?._id || item?.id;
}

function categoryName(category) {
  return typeof category === 'object' ? category?.name || 'General' : category || 'General';
}

function dateText(value) {
  if (!value) return 'Today';
  return new Intl.DateTimeFormat('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(value));
}

function statusColor(status) {
  if (['active', 'approved', 'delivered', 'paid'].includes(status)) return 'success';
  if (['pending', 'placed', 'confirmed', 'packed'].includes(status)) return 'warning';
  if (['blocked', 'cancelled', 'rejected', 'refunded', 'inactive'].includes(status)) return 'error';
  return 'default';
}

function Field({ name, label, form, setForm, type = 'text', multiline = false }) {
  return (
    <TextField
      fullWidth
      name={name}
      label={label}
      type={type}
      value={form[name] ?? ''}
      onChange={(event) => setForm((current) => ({ ...current, [name]: event.target.value }))}
      multiline={multiline}
      rows={multiline ? 3 : undefined}
    />
  );
}

export default function AdminDashboard() {
  const { logout } = useAuth();
  const [active, setActive] = useState('dashboard');
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState({ type: '', text: '' });
  const [dashboard, setDashboard] = useState(null);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [userStats, setUserStats] = useState(null);
  const [categories, setCategories] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [settings, setSettings] = useState({});
  const [settingsTab, setSettingsTab] = useState('general');
  const [dialog, setDialog] = useState({ type: '', item: null });
  const [productForm, setProductForm] = useState(emptyProduct);
  const [categoryForm, setCategoryForm] = useState(emptyCategory);
  const [couponForm, setCouponForm] = useState(emptyCoupon);
  const [userForm, setUserForm] = useState({ name: '', email: '', phone: '', status: 'active' });

  const load = useCallback(async ({ silent = false } = {}) => {
    if (!silent) {
      setLoading(true);
      setNotice({ type: '', text: '' });
    }
    try {
      if (active === 'users') {
        const [{ data: userData }, { data: statistics }] = await Promise.all([
          api.get('/admin/users'),
          api.get('/admin/users/statistics'),
        ]);
        setUsers(userData);
        setUserStats(statistics);
        return;
      }
      const { data } = await api.get(`/admin/${active === 'dashboard' ? 'dashboard' : active}`);
      if (active === 'dashboard') setDashboard(data);
      if (active === 'products') setProducts(data);
      if (active === 'orders') setOrders(data);
      if (active === 'categories') setCategories(data);
      if (active === 'coupons') setCoupons(data);
      if (active === 'reviews') setReviews(data);
      if (active === 'settings') setSettings(data);
    } catch (error) {
      setNotice({ type: 'error', text: error.response?.data?.message || 'Admin data could not be loaded.' });
    } finally {
      if (!silent) setLoading(false);
    }
  }, [active]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!['dashboard', 'users'].includes(active)) return undefined;
    const refresh = () => load({ silent: true });
    const interval = window.setInterval(refresh, 15000);
    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') refresh();
    };
    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => {
      window.clearInterval(interval);
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, [active, load]);

  const closeDialog = () => setDialog({ type: '', item: null });

  const openProduct = (item = null) => {
    setProductForm(item ? {
      name: item.name || '',
      description: item.description || '',
      category: categoryName(item.category),
      brand: item.brand || '',
      price: item.price || '',
      discountPrice: item.oldPrice || item.discountPrice || '',
      stockQuantity: item.countInStock ?? item.stockQuantity ?? '',
      images: (item.images || []).join(', '),
      colors: (item.colors || []).join(', '),
      sizes: (item.sizes || []).join(', '),
      status: item.status || 'active',
    } : emptyProduct);
    setDialog({ type: 'product', item });
  };

  const saveProduct = async () => {
    const payload = { ...productForm, price: Number(productForm.price || 0), stockQuantity: Number(productForm.stockQuantity || 0) };
    if (dialog.item) await api.put(`/admin/products/${idOf(dialog.item)}`, payload);
    else await api.post('/admin/products', payload);
    closeDialog();
    await load();
  };

  const openCategory = (item = null) => {
    setCategoryForm(item ? { name: item.name || '', description: item.description || '', banner: item.banner || '', image: item.image || '', status: item.status || 'active' } : emptyCategory);
    setDialog({ type: 'category', item });
  };

  const saveCategory = async () => {
    if (dialog.item) await api.put(`/admin/categories/${idOf(dialog.item)}`, categoryForm);
    else await api.post('/admin/categories', categoryForm);
    closeDialog();
    await load();
  };

  const openCoupon = (item = null) => {
    setCouponForm(item ? { code: item.code || '', discountType: item.discountType || 'percentage', discountValue: item.discountValue || '', minimumPurchase: item.minimumPurchase || '', maximumDiscount: item.maximumDiscount || '', expiryDate: item.expiresAt || item.expiryDate || '', usageLimit: item.usageLimit || '', isActive: item.isActive !== false } : emptyCoupon);
    setDialog({ type: 'coupon', item });
  };

  const saveCoupon = async () => {
    if (dialog.item) await api.put(`/admin/coupons/${idOf(dialog.item)}`, couponForm);
    else await api.post('/admin/coupons', couponForm);
    closeDialog();
    await load();
  };

  const openUser = (item) => {
    setUserForm({ name: item.name || '', email: item.email || '', phone: item.phone || '', status: item.status || (item.isBlocked ? 'blocked' : 'active') });
    setDialog({ type: 'user', item });
  };

  const saveUser = async () => {
    await api.put(`/admin/users/${idOf(dialog.item)}`, userForm);
    closeDialog();
    await load();
  };

  const remove = async (resource, item) => {
    const label = item.name || item.code || item.email || idOf(item);
    if (!window.confirm(`Delete ${label}?`)) return;
    await api.delete(`/admin/${resource}/${idOf(item)}`);
    await load();
  };

  const updateOrderStatus = async (order, orderStatus) => {
    await api.put(`/admin/orders/${idOf(order)}`, { orderStatus, paymentStatus: order.paymentStatus });
    await load();
  };

  const updateReview = async (review, approved) => {
    await api.put(`/admin/reviews/${idOf(review)}`, { approved });
    await load();
  };

  const saveSettings = async () => {
    await api.put(`/admin/settings/${settingsTab}`, settings[settingsTab] || {});
    setNotice({ type: 'success', text: 'Settings saved successfully.' });
    await load();
  };

  const stats = useMemo(() => [
    ['Total Products', dashboard?.totalProducts ?? 0],
    ['Total Orders', dashboard?.totalOrders ?? 0],
    ['Total Users', dashboard?.totalUsers ?? 0],
    ['Total Categories', dashboard?.totalCategories ?? 0],
    ['Total Revenue', formatCurrency(dashboard?.totalRevenue ?? 0)],
    ['Pending Orders', dashboard?.pendingOrders ?? 0],
  ], [dashboard]);

  const renderDashboard = () => (
    <Stack spacing={3}>
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ sm: 'center' }} spacing={1}>
        <Box>
          <Typography variant="h6">Dashboard Overview</Typography>
          <Typography variant="caption" color="text.secondary">Last updated {dashboard?.generatedAt ? new Date(dashboard.generatedAt).toLocaleTimeString() : 'just now'}</Typography>
        </Box>
        <Button variant="outlined" startIcon={<RefreshIcon />} onClick={() => load()}>Refresh data</Button>
      </Stack>
      <Grid container spacing={2}>{stats.map(([label, value]) => <Grid item xs={12} sm={6} md={4} key={label}><Paper variant="outlined" sx={{ p: 2 }}><Typography color="text.secondary">{label}</Typography><Typography variant="h4" fontWeight={900}>{value}</Typography></Paper></Grid>)}</Grid>
      <Chart title="Sales Overview" data={dashboard?.salesOverview || []} dataKey="revenue" color={colors.primary} valueFormatter={(value) => formatCurrency(value)} />
    </Stack>
  );

  const renderProducts = () => (
    <Stack spacing={2}>
      <Header title="Products Management" action="Add Product" onClick={() => openProduct()} />
      <TableWrap heads={['Product Image', 'Product Name', 'Category', 'Price', 'Stock', 'Status', 'Actions']}>
        {products.map((product) => <TableRow key={idOf(product)}><TableCell><Avatar src={product.images?.[0] || product.image} variant="rounded" /></TableCell><TableCell>{product.name}</TableCell><TableCell>{categoryName(product.category)}</TableCell><TableCell>{formatCurrency(product.price || 0)}</TableCell><TableCell>{product.countInStock ?? product.stockQuantity ?? 0}</TableCell><TableCell><Chip label={product.status || 'active'} color={statusColor(product.status || 'active')} /></TableCell><TableCell><IconButton onClick={() => setDialog({ type: 'view-product', item: product })}><VisibilityIcon /></IconButton><IconButton onClick={() => openProduct(product)}><EditIcon /></IconButton><IconButton color="error" onClick={() => remove('products', product)}><DeleteIcon /></IconButton></TableCell></TableRow>)}
      </TableWrap>
    </Stack>
  );

  const renderOrders = () => (
    <Stack spacing={2}>
      <Typography variant="h6">Orders Management</Typography>
      <TableWrap heads={['Order ID', 'Customer Name', 'Product Count', 'Amount', 'Payment Method', 'Status', 'Date', 'Actions']}>
        {orders.map((order) => <TableRow key={idOf(order)}><TableCell>{String(idOf(order)).slice(0, 8)}</TableCell><TableCell>{order.user?.name || order.shippingAddress?.name || 'Customer'}</TableCell><TableCell>{order.items?.length || 0}</TableCell><TableCell>{formatCurrency(order.total || 0)}</TableCell><TableCell>{String(order.paymentMethod || 'cod').toUpperCase()}</TableCell><TableCell><StatusSelect value={order.orderStatus || 'pending'} options={orderStatuses} onChange={(value) => updateOrderStatus(order, value)} /></TableCell><TableCell>{dateText(order.createdAt)}</TableCell><TableCell><IconButton onClick={() => setDialog({ type: 'order', item: order })}><VisibilityIcon /></IconButton></TableCell></TableRow>)}
      </TableWrap>
    </Stack>
  );

  const renderUsers = () => (
    <Stack spacing={2}>
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ sm: 'center' }} spacing={1}>
        <Box>
          <Typography variant="h6">Users Management</Typography>
          <Typography variant="caption" color="text.secondary">Last updated {userStats?.generatedAt ? new Date(userStats.generatedAt).toLocaleTimeString() : 'just now'}</Typography>
        </Box>
        <Button variant="outlined" startIcon={<RefreshIcon />} onClick={() => load()}>Refresh users</Button>
      </Stack>
      <Grid container spacing={2}>
        {[
          ['Registered Users', userStats?.registeredUsers ?? users.length],
          ['Logged-in Users', userStats?.loggedInUsers ?? 0],
          ['Active Users', userStats?.activeUsers ?? 0],
          ['Blocked Users', userStats?.blockedUsers ?? 0],
        ].map(([label, value]) => <Grid item xs={12} sm={6} lg={3} key={label}><Paper variant="outlined" sx={{ p: 2 }}><Typography color="text.secondary">{label}</Typography><Typography variant="h4" fontWeight={900}>{value}</Typography></Paper></Grid>)}
      </Grid>
      <TableWrap heads={['User Name', 'Email', 'Phone', 'Orders Count', 'Join Date', 'Last Login', 'Status', 'Actions']}>
        {users.map((user) => <TableRow key={idOf(user)}><TableCell>{user.name}</TableCell><TableCell>{user.email}</TableCell><TableCell>{user.phone}</TableCell><TableCell>{user.ordersCount || 0}</TableCell><TableCell>{dateText(user.createdAt)}</TableCell><TableCell>{user.lastLoginAt ? dateText(user.lastLoginAt) : 'Never'}</TableCell><TableCell><Chip label={user.status || 'active'} color={statusColor(user.status || 'active')} /></TableCell><TableCell><IconButton onClick={() => openUser(user)}><EditIcon /></IconButton><IconButton color="error" onClick={() => remove('users', user)}><DeleteIcon /></IconButton></TableCell></TableRow>)}
      </TableWrap>
    </Stack>
  );

  const renderCategories = () => (
    <Stack spacing={2}>
      <Header title="Categories Management" action="Add Category" onClick={() => openCategory()} />
      <TableWrap heads={['Category Image', 'Category Name', 'Products Count', 'Status', 'Actions']}>
        {categories.map((category) => <TableRow key={idOf(category)}><TableCell><Avatar src={category.image} variant="rounded">{category.name?.[0]}</Avatar></TableCell><TableCell>{category.name}</TableCell><TableCell>{category.productsCount || 0}</TableCell><TableCell><Chip label={category.status || 'active'} color={statusColor(category.status || 'active')} /></TableCell><TableCell><IconButton onClick={() => openCategory(category)}><EditIcon /></IconButton><IconButton color="error" onClick={() => remove('categories', category)}><DeleteIcon /></IconButton></TableCell></TableRow>)}
      </TableWrap>
    </Stack>
  );

  const renderCoupons = () => (
    <Stack spacing={2}>
      <Header title="Coupons Management" action="Add Coupon" onClick={() => openCoupon()} />
      <TableWrap heads={['Coupon Code', 'Discount', 'Usage Limit', 'Expiry Date', 'Status', 'Actions']}>
        {coupons.map((coupon) => <TableRow key={idOf(coupon)}><TableCell>{coupon.code}</TableCell><TableCell>{coupon.discountType === 'fixed' ? formatCurrency(coupon.discountValue || 0) : `${coupon.discountValue || 0}%`}</TableCell><TableCell>{coupon.usageLimit || 0}</TableCell><TableCell>{dateText(coupon.expiresAt || coupon.expiryDate)}</TableCell><TableCell><Chip label={coupon.isActive === false ? 'inactive' : 'active'} color={coupon.isActive === false ? 'error' : 'success'} /></TableCell><TableCell><IconButton onClick={() => openCoupon(coupon)}><EditIcon /></IconButton><IconButton color="error" onClick={() => remove('coupons', coupon)}><DeleteIcon /></IconButton></TableCell></TableRow>)}
      </TableWrap>
    </Stack>
  );

  const renderReviews = () => (
    <Stack spacing={2}>
      <Typography variant="h6">Reviews Management</Typography>
      <TableWrap heads={['Customer', 'Product', 'Rating', 'Review', 'Date', 'Status', 'Actions']}>
        {reviews.map((review) => <TableRow key={idOf(review)}><TableCell>{review.customerName || review.user?.name || 'Customer'}</TableCell><TableCell>{review.productName || review.product?.name || 'Product'}</TableCell><TableCell>{review.rating}</TableCell><TableCell>{review.comment}</TableCell><TableCell>{dateText(review.createdAt)}</TableCell><TableCell><Chip label={review.approved ? 'approved' : 'pending'} color={review.approved ? 'success' : 'warning'} /></TableCell><TableCell><Button size="small" onClick={() => updateReview(review, true)}>Approve</Button><Button size="small" onClick={() => updateReview(review, false)}>Reject</Button><IconButton onClick={() => setDialog({ type: 'review', item: review })}><VisibilityIcon /></IconButton><IconButton color="error" onClick={() => remove('reviews', review)}><DeleteIcon /></IconButton></TableCell></TableRow>)}
      </TableWrap>
    </Stack>
  );

  const renderSettings = () => {
    const section = settings[settingsTab] || {};
    return (
      <Stack spacing={2}>
        <Typography variant="h6">Settings Management</Typography>
        <Tabs value={settingsTab} onChange={(_, value) => setSettingsTab(value)} variant="scrollable" scrollButtons="auto">{settingSections.map((sectionName) => <Tab key={sectionName} value={sectionName} label={sectionName} />)}</Tabs>
        <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { md: '1fr 1fr' } }}>
          {Object.entries(section).map(([key, value]) => typeof value === 'boolean'
            ? <Stack key={key} direction="row" alignItems="center" justifyContent="space-between"><Typography>{key}</Typography><Switch checked={Boolean(value)} onChange={(event) => setSettings((current) => ({ ...current, [settingsTab]: { ...section, [key]: event.target.checked } }))} /></Stack>
            : <TextField key={key} label={key} value={value ?? ''} onChange={(event) => setSettings((current) => ({ ...current, [settingsTab]: { ...section, [key]: event.target.value } }))} />)}
        </Box>
        <Button variant="contained" startIcon={<SaveIcon />} sx={{ alignSelf: 'flex-start' }} onClick={saveSettings}>Save Settings</Button>
      </Stack>
    );
  };

  const content = { dashboard: renderDashboard, products: renderProducts, orders: renderOrders, users: renderUsers, categories: renderCategories, coupons: renderCoupons, reviews: renderReviews, settings: renderSettings }[active]?.();

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 1, position: { md: 'sticky' }, top: 88 }}>
            <Typography variant="h6" sx={{ px: 2, py: 1 }}>Admin Panel</Typography>
            <List>{menu.map(([key, label, Icon]) => <ListItemButton key={key} selected={active === key} onClick={() => setActive(key)}><ListItemIcon><Icon color={active === key ? 'primary' : 'inherit'} /></ListItemIcon><ListItemText primary={label} /></ListItemButton>)}</List>
            <Divider />
            <ListItemButton onClick={logout}><ListItemIcon><LogoutIcon /></ListItemIcon><ListItemText primary="Logout" /></ListItemButton>
          </Paper>
        </Grid>
        <Grid item xs={12} md={9}>
          <Stack spacing={2}>
            {notice.text ? <Alert severity={notice.type}>{notice.text}</Alert> : null}
            <Paper sx={{ p: { xs: 2, md: 3 } }}>{loading ? <Typography>Loading...</Typography> : content}</Paper>
          </Stack>
        </Grid>
      </Grid>
      <AdminDialog dialog={dialog} closeDialog={closeDialog} productForm={productForm} setProductForm={setProductForm} saveProduct={saveProduct} categoryForm={categoryForm} setCategoryForm={setCategoryForm} saveCategory={saveCategory} couponForm={couponForm} setCouponForm={setCouponForm} saveCoupon={saveCoupon} userForm={userForm} setUserForm={setUserForm} saveUser={saveUser} />
    </Container>
  );
}

function Header({ title, action, onClick }) {
  return <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" spacing={1}><Typography variant="h6">{title}</Typography><Button variant="contained" startIcon={<AddIcon />} onClick={onClick}>{action}</Button></Stack>;
}

function TableWrap({ heads, children }) {
  return <TableContainer><Table size="small"><TableHead><TableRow>{heads.map((head) => <TableCell key={head} fontWeight={900}>{head}</TableCell>)}</TableRow></TableHead><TableBody>{children}</TableBody></Table></TableContainer>;
}

function StatusSelect({ value, options, onChange }) {
  return <Select size="small" value={value} onChange={(event) => onChange(event.target.value)}>{options.map((option) => <MenuItem key={option} value={option}>{option}</MenuItem>)}</Select>;
}

function Chart({ title, data, dataKey, xKey = 'month', color = colors.primary, valueFormatter }) {
  return <Paper variant="outlined" sx={{ p: 2, height: 320 }}><Typography fontWeight={900} sx={{ mb: 1 }}>{title}</Typography><ResponsiveContainer width="100%" height="85%"><BarChart data={data}><CartesianGrid strokeDasharray="3 3" stroke={colors.background} /><XAxis dataKey={xKey} tick={{ fontSize: 11 }} interval={0} angle={data.length > 6 ? -25 : 0} textAnchor={data.length > 6 ? 'end' : 'middle'} height={data.length > 6 ? 60 : 30} /><YAxis tick={{ fontSize: 11 }} /><Tooltip formatter={(value) => valueFormatter ? valueFormatter(value) : value} /><Legend /><Bar dataKey={dataKey} fill={color} radius={[6, 6, 0, 0]} /></BarChart></ResponsiveContainer></Paper>;
}

function DetailBlock({ title, lines }) {
  return <Paper variant="outlined" sx={{ p: 2 }}><Typography fontWeight={900} sx={{ mb: 1 }}>{title}</Typography>{lines.map((line) => <Typography key={line} color="text.secondary">{line || '-'}</Typography>)}</Paper>;
}

function AdminDialog({ dialog, closeDialog, productForm, setProductForm, saveProduct, categoryForm, setCategoryForm, saveCategory, couponForm, setCouponForm, saveCoupon, userForm, setUserForm, saveUser }) {
  const item = dialog.item || {};
  const isForm = ['product', 'category', 'coupon', 'user'].includes(dialog.type);
  return (
    <Dialog open={Boolean(dialog.type)} onClose={closeDialog} maxWidth="md" fullWidth>
      <DialogTitle>{dialog.type?.replace('-', ' ')}</DialogTitle>
      <DialogContent>
        {dialog.type === 'product' ? <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { md: '1fr 1fr' }, mt: 1 }}><Field name="name" label="Product Name" form={productForm} setForm={setProductForm} /><Field name="category" label="Category" form={productForm} setForm={setProductForm} /><Field name="brand" label="Brand" form={productForm} setForm={setProductForm} /><Field name="price" label="Price" form={productForm} setForm={setProductForm} type="number" /><Field name="discountPrice" label="Discount Price" form={productForm} setForm={setProductForm} type="number" /><Field name="stockQuantity" label="Stock Quantity" form={productForm} setForm={setProductForm} type="number" /><Field name="images" label="Images" form={productForm} setForm={setProductForm} /><Field name="colors" label="Colors" form={productForm} setForm={setProductForm} /><Field name="sizes" label="Sizes" form={productForm} setForm={setProductForm} /><Field name="status" label="Status" form={productForm} setForm={setProductForm} /><Field name="description" label="Description" form={productForm} setForm={setProductForm} multiline /></Box> : null}
        {dialog.type === 'category' ? <Box sx={{ display: 'grid', gap: 2, mt: 1 }}><Field name="name" label="Category Name" form={categoryForm} setForm={setCategoryForm} /><Field name="description" label="Description" form={categoryForm} setForm={setCategoryForm} multiline /><Field name="image" label="Category Image" form={categoryForm} setForm={setCategoryForm} /><Field name="banner" label="Category Banner" form={categoryForm} setForm={setCategoryForm} /><Field name="status" label="Status" form={categoryForm} setForm={setCategoryForm} /></Box> : null}
        {dialog.type === 'coupon' ? <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { md: '1fr 1fr' }, mt: 1 }}><Field name="code" label="Coupon Code" form={couponForm} setForm={setCouponForm} /><Field name="discountType" label="Discount Type" form={couponForm} setForm={setCouponForm} /><Field name="discountValue" label="Discount Value" form={couponForm} setForm={setCouponForm} type="number" /><Field name="minimumPurchase" label="Minimum Purchase" form={couponForm} setForm={setCouponForm} type="number" /><Field name="maximumDiscount" label="Maximum Discount" form={couponForm} setForm={setCouponForm} type="number" /><Field name="expiryDate" label="Expiry Date" form={couponForm} setForm={setCouponForm} type="date" /><Field name="usageLimit" label="Usage Limit" form={couponForm} setForm={setCouponForm} type="number" /><Stack direction="row" alignItems="center" justifyContent="space-between"><Typography>Status</Typography><Switch checked={couponForm.isActive} onChange={(event) => setCouponForm((current) => ({ ...current, isActive: event.target.checked }))} /></Stack></Box> : null}
        {dialog.type === 'user' ? <Box sx={{ display: 'grid', gap: 2, mt: 1 }}><Field name="name" label="User Name" form={userForm} setForm={setUserForm} /><Field name="email" label="Email" form={userForm} setForm={setUserForm} /><Field name="phone" label="Phone" form={userForm} setForm={setUserForm} /><Field name="status" label="Status" form={userForm} setForm={setUserForm} /></Box> : null}
        {dialog.type === 'order' ? <Stack spacing={2} sx={{ mt: 1 }}><DetailBlock title="Customer Details" lines={[item.user?.name || item.shippingAddress?.name, item.user?.email, item.shippingAddress?.phone]} /><DetailBlock title="Shipping Address" lines={[item.shippingAddress?.address, `${item.shippingAddress?.city || ''}, ${item.shippingAddress?.state || ''}`, item.shippingAddress?.postalCode]} /><DetailBlock title="Products List" lines={(item.items || []).map((product) => `${product.name} x ${product.quantity || 1}`)} /><DetailBlock title="Payment Information" lines={[String(item.paymentMethod || '').toUpperCase(), item.paymentStatus, formatCurrency(item.total || 0)]} /><DetailBlock title="Invoice" lines={[`Invoice ${String(idOf(item)).slice(0, 8)}`, `Date ${dateText(item.createdAt)}`]} /><DetailBlock title="Tracking Details" lines={[item.orderStatus || 'pending']} /></Stack> : null}
        {dialog.type === 'user-details' ? <Stack spacing={2} sx={{ mt: 1 }}><DetailBlock title="Personal Information" lines={[item.name, item.email, item.phone]} /><DetailBlock title="Address List" lines={(item.savedAddresses || []).map((address) => `${address.address}, ${address.city}`)} /><DetailBlock title="Order History" lines={[`${item.ordersCount || 0} orders`]} /><DetailBlock title="Wishlist" lines={['Available from customer wishlist section']} /><DetailBlock title="Reviews" lines={['Available from reviews section']} /></Stack> : null}
        {dialog.type === 'review' ? <Stack spacing={2} sx={{ mt: 1 }}><DetailBlock title="Review Details" lines={[item.customerName || item.user?.name, item.productName || item.product?.name, `Rating: ${item.rating}`, item.comment]} /><DetailBlock title="Review Images" lines={(item.images || []).length ? item.images : ['No images']} /></Stack> : null}
        {dialog.type === 'view-product' ? <Stack spacing={2} sx={{ mt: 1 }}><DetailBlock title="Product Details" lines={[item.name, categoryName(item.category), item.brand, formatCurrency(item.price || 0), item.description]} /></Stack> : null}
      </DialogContent>
      <DialogActions><Button onClick={closeDialog}>Close</Button>{isForm ? <Button variant="contained" onClick={{ product: saveProduct, category: saveCategory, coupon: saveCoupon, user: saveUser }[dialog.type]}>Save</Button> : null}</DialogActions>
    </Dialog>
  );
}
