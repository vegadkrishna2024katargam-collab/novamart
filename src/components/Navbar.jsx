import DarkModeIcon from '@mui/icons-material/DarkMode';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import LightModeIcon from '@mui/icons-material/LightMode';
import MenuIcon from '@mui/icons-material/Menu';
import PersonIcon from '@mui/icons-material/Person';
import SearchIcon from '@mui/icons-material/Search';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import { AppBar, Autocomplete, Avatar, Badge, Box, Button, Container, Drawer, FormControl, IconButton, InputAdornment, MenuItem, Select, Stack, TextField, Toolbar, Typography } from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import { Link as RouterLink, NavLink, useNavigate, useSearchParams } from 'react-router-dom';
import { categories, products } from '../data/demoData';
import useAuth from '../hooks/useAuth';
import useCart from '../hooks/useCart';
import useWishlist from '../hooks/useWishlist';
import { useThemeMode } from '../context/ThemeModeContext.jsx';
import api from '../services/api.js';
import { dashboardPathFor, isAdminUser } from '../utils/authRole';
import { getCategoryName, getProductId, normalizeProducts } from '../utils/productUtils.js';

const publicLinks = [
  { label: 'Home', to: '/' },
  { label: 'Products', to: '/products' },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [headerProducts, setHeaderProducts] = useState(products);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { items } = useCart();
  const wishlist = useWishlist();
  const { user, logout } = useAuth();
  const { mode, toggleMode } = useThemeMode();
  const categoryParam = searchParams.get('category');
  const activeCategory = categories.some((category) => category.name === categoryParam) ? categoryParam : 'All';
  const productSuggestions = useMemo(() => normalizeProducts(headerProducts).map((product) => ({
    label: product.name,
    category: getCategoryName(product.category),
    product,
  })), [headerProducts]);
  const dashboardLink = user
    ? { label: isAdminUser(user) ? 'Admin Dashboard' : 'User Panel', to: dashboardPathFor(user) }
    : null;

  useEffect(() => {
    let active = true;
    const controller = new AbortController();
    api.get('/products', { signal: controller.signal })
      .then(({ data }) => {
        const nextProducts = normalizeProducts(data);
        if (active && nextProducts.length) setHeaderProducts(nextProducts);
      })
      .catch(() => {
        if (active) setHeaderProducts(products);
      });
    return () => {
      active = false;
      controller.abort();
    };
  }, []);

  const buildProductListPath = (next = {}) => {
    const params = new URLSearchParams();
    const category = next.category ?? activeCategory;
    const query = next.search ?? search;
    if (category && category !== 'All') params.set('category', category);
    if (query.trim()) params.set('search', query.trim());
    return `/products${params.toString() ? `?${params.toString()}` : ''}`;
  };

  const openCategory = (category) => {
    setSearch('');
    navigate(buildProductListPath({ category, search: '' }));
  };

  const runSearch = (value = search) => {
    const query = typeof value === 'string' ? value.trim() : value?.label?.trim() || '';
    if (!query) {
      navigate(buildProductListPath({ search: '' }));
      return;
    }

    const exactProduct = normalizeProducts(headerProducts).find((product) => product.name.toLowerCase() === query.toLowerCase());
    if (exactProduct) {
      const exactProductId = getProductId(exactProduct);
      if (exactProductId) {
        navigate(`/product/${exactProductId}`);
        return;
      }
    }

    navigate(buildProductListPath({ search: query }));
  };

  const submitSearch = (event) => {
    event.preventDefault();
    runSearch();
  };

  const nav = (
    <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems={{ xs: 'stretch', md: 'center' }}>
      {[...publicLinks, dashboardLink].filter(Boolean).map((link) => (
        <Button key={link.to} component={NavLink} to={link.to} color="inherit" sx={{ justifyContent: 'flex-start' }}>{link.label}</Button>
      ))}
    </Stack>
  );

  return (
    <AppBar position="sticky" color="inherit" elevation={0} sx={{ backdropFilter: 'blur(16px)', borderBottom: '1px solid', borderColor: 'divider' }}>
      <Container maxWidth="xl">
        <Toolbar disableGutters sx={{ gap: 2, py: 1 }}>
          <IconButton sx={{ display: { md: 'none' } }} onClick={() => setOpen(true)}><MenuIcon /></IconButton>
          <Typography component={RouterLink} to="/" variant="h5" sx={{ color: 'primary.main', fontWeight: 900, textDecoration: 'none', whiteSpace: 'nowrap' }}>NovaMart</Typography>
          <Box sx={{ display: { xs: 'none', lg: 'block' } }}>{nav}</Box>
          <Stack component="form" onSubmit={submitSearch} direction="row" sx={{ flex: 1, maxWidth: 620, mx: 'auto', display: { xs: 'none', md: 'flex' } }}>
            <FormControl size="small" sx={{ minWidth: 136 }}>
              <Select value={activeCategory} onChange={(event) => openCategory(event.target.value)} sx={{ borderTopRightRadius: 0, borderBottomRightRadius: 0 }}>
                <MenuItem value="All">All</MenuItem>
                {categories.map((category) => <MenuItem key={category.name} value={category.name}>{category.name}</MenuItem>)}
              </Select>
            </FormControl>
            <Autocomplete
              freeSolo
              fullWidth
              size="small"
              inputValue={search}
              options={productSuggestions}
              getOptionLabel={(option) => typeof option === 'string' ? option : option.label}
              onInputChange={(_, value) => setSearch(value)}
              onChange={(_, value) => {
                const selectedProductId = value?.product ? getProductId(value.product) : null;
                if (selectedProductId) {
                  navigate(`/product/${selectedProductId}`);
                  return;
                }
                runSearch(value || search);
              }}
              renderOption={(props, option) => (
                <Box component="li" {...props}>
                  <Box>
                    <Typography fontWeight={800}>{option.label}</Typography>
                    <Typography variant="caption" color="text.secondary">{option.category}</Typography>
                  </Box>
                </Box>
              )}
              renderInput={(params) => (
                <TextField
                  {...params}
                  placeholder="Search products, brands and categories"
                  InputProps={{
                    ...params.InputProps,
                    startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment>,
                  }}
                  sx={{ '& .MuiOutlinedInput-root': { borderTopLeftRadius: 0, borderBottomLeftRadius: 0 } }}
                />
              )}
            />
          </Stack>
          <Stack direction="row" spacing={0.5} alignItems="center">
            <IconButton onClick={toggleMode}>{mode === 'light' ? <DarkModeIcon /> : <LightModeIcon />}</IconButton>
            <IconButton component={RouterLink} to="/wishlist"><Badge badgeContent={wishlist.items.length} color="error"><FavoriteBorderIcon /></Badge></IconButton>
            <IconButton component={RouterLink} to="/cart"><Badge badgeContent={items.length} color="primary"><ShoppingCartIcon /></Badge></IconButton>
            {user ? (
              <Stack direction="row" spacing={1} alignItems="center">
                <Button component={RouterLink} to={dashboardPathFor(user)} startIcon={<Avatar src={user.profileImage} sx={{ width: 24, height: 24 }}>{user.name?.[0]}</Avatar>}>{isAdminUser(user) ? 'Admin' : 'Panel'}</Button>
                <Button onClick={logout}>Logout</Button>
              </Stack>
            ) : (
              <Stack direction="row" spacing={1} sx={{ display: { xs: 'none', sm: 'flex' } }}>
                <Button component={RouterLink} to="/login" startIcon={<PersonIcon />}>Login</Button>
                <Button component={RouterLink} to="/signup" variant="contained">Signup</Button>
              </Stack>
            )}
          </Stack>
        </Toolbar>
      </Container>
      <Drawer open={open} onClose={() => setOpen(false)}>
        <Box sx={{ width: 280, p: 2 }} onClick={() => setOpen(false)}>
          <Typography variant="h5" color="primary" fontWeight={900} sx={{ mb: 2 }}>NovaMart</Typography>
          <Stack component="form" onSubmit={submitSearch} spacing={1.5} sx={{ mb: 2 }} onClick={(event) => event.stopPropagation()}>
            <FormControl size="small" fullWidth>
              <Select value={activeCategory} onChange={(event) => { openCategory(event.target.value); setOpen(false); }}>
                <MenuItem value="All">All categories</MenuItem>
                {categories.map((category) => <MenuItem key={category.name} value={category.name}>{category.name}</MenuItem>)}
              </Select>
            </FormControl>
            <Autocomplete
              freeSolo
              size="small"
              inputValue={search}
              options={productSuggestions}
              getOptionLabel={(option) => typeof option === 'string' ? option : option.label}
              onInputChange={(_, value) => setSearch(value)}
              onChange={(_, value) => {
                if (value?.product) navigate(`/product/${getProductId(value.product)}`);
                else runSearch(value || search);
                setOpen(false);
              }}
              renderInput={(params) => <TextField {...params} placeholder="Search products" />}
            />
          </Stack>
          {nav}
          {user ? (
            <>
              <Button component={RouterLink} to={dashboardPathFor(user)} fullWidth sx={{ mt: 2 }}>{isAdminUser(user) ? 'Admin Dashboard' : 'User Panel'}</Button>
              <Button onClick={logout} fullWidth>Logout</Button>
            </>
          ) : (
            <>
              <Button component={RouterLink} to="/login" fullWidth sx={{ mt: 2 }}>Login</Button>
              <Button component={RouterLink} to="/signup" fullWidth variant="contained">Signup</Button>
            </>
          )}
        </Box>
      </Drawer>
    </AppBar>
  );
}
