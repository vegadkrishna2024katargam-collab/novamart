import FilterListIcon from '@mui/icons-material/FilterList';
import { Box, Button, CircularProgress, Container, FormControl, Grid, InputLabel, MenuItem, Pagination, Paper, Select, Slider, Stack, TextField, Typography } from '@mui/material';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import EmptyState from '../components/EmptyState.jsx';
import ProductCard from '../components/ProductCard.jsx';
import SectionHeader from '../components/SectionHeader.jsx';
import { categories, products as demoProducts } from '../data/demoData';
import useFetch from '../hooks/useFetch.js';
import api from '../services/api.js';
import { getCategoryName } from '../utils/productUtils.js';

const validCategoryName = (value) => (categories.some((item) => item.name === value) ? value : 'All');

export default function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('search') || '');
  const [category, setCategory] = useState(validCategoryName(searchParams.get('category')));
  const [sort, setSort] = useState('featured');
  const [price, setPrice] = useState([0, 1000]);
  const [page, setPage] = useState(1);
  const productsPerPage = 12;
  const fetchProducts = useCallback(async () => {
    const { data } = await api.get('/products');
    return data;
  }, []);
  const { data: products = [], loading } = useFetch(fetchProducts, []);
  const displayProducts = products.length ? products : demoProducts;

  useEffect(() => {
    setQuery(searchParams.get('search') || '');
    setCategory(validCategoryName(searchParams.get('category')));
    setPage(1);
  }, [searchParams]);

  const updateProductParams = (next = {}) => {
    const nextQuery = next.search ?? query;
    const nextCategory = next.category ?? category;
    const params = new URLSearchParams();
    if (nextCategory && nextCategory !== 'All') params.set('category', nextCategory);
    if (nextQuery.trim()) params.set('search', nextQuery.trim());
    setSearchParams(params);
  };

  const filtered = useMemo(() => {
    const searchTerm = query.toLowerCase();
    const result = displayProducts.filter((product) => {
      const productCategory = getCategoryName(product.category);
      const searchable = `${product.name} ${product.brand || ''} ${productCategory} ${product.description || ''}`.toLowerCase();
      return searchable.includes(searchTerm) && (category === 'All' || productCategory === category) && product.price >= price[0] && product.price <= price[1];
    });
    if (sort === 'low') return [...result].sort((a, b) => a.price - b.price);
    if (sort === 'high') return [...result].sort((a, b) => b.price - a.price);
    if (sort === 'rating') return [...result].sort((a, b) => b.rating - a.rating);
    return result;
  }, [displayProducts, query, category, sort, price]);
  const pageCount = Math.max(1, Math.ceil(filtered.length / productsPerPage));
  const visibleProducts = filtered.slice((page - 1) * productsPerPage, page * productsPerPage);

  const resetPage = (changeHandler) => (event) => {
    changeHandler(event);
    setPage(1);
  };

  return (
    <Container maxWidth="xl" sx={{ py: 5 }}>
      <SectionHeader eyebrow="Catalog" title="All products" />
      <Grid container spacing={3}>
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 3, position: { md: 'sticky' }, top: 96 }}>
            <Stack spacing={3}>
              <Typography variant="h6"><FilterListIcon fontSize="small" /> Filters</Typography>
              <TextField label="Live search" value={query} onChange={resetPage((event) => { setQuery(event.target.value); updateProductParams({ search: event.target.value }); })} />
              <FormControl>
                <InputLabel>Category</InputLabel>
                <Select label="Category" value={category} onChange={resetPage((event) => { setCategory(event.target.value); updateProductParams({ category: event.target.value }); })}>
                  <MenuItem value="All">All</MenuItem>
                  {categories.map((item) => <MenuItem key={item.name} value={item.name}>{item.name}</MenuItem>)}
                </Select>
              </FormControl>
              <Box>
                <Typography gutterBottom>Price range</Typography>
                <Slider value={price} onChange={(_, next) => { setPrice(next); setPage(1); }} min={0} max={1000} valueLabelDisplay="auto" />
              </Box>
              <FormControl>
                <InputLabel>Sort</InputLabel>
                <Select label="Sort" value={sort} onChange={resetPage((event) => setSort(event.target.value))}>
                  <MenuItem value="featured">Featured</MenuItem>
                  <MenuItem value="low">Price: low to high</MenuItem>
                  <MenuItem value="high">Price: high to low</MenuItem>
                  <MenuItem value="rating">Top rated</MenuItem>
                </Select>
              </FormControl>
            </Stack>
          </Paper>
        </Grid>
        <Grid item xs={12} md={9}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
            <Typography color="text.secondary">{filtered.length} products found</Typography>
            <Button variant="outlined">AI recommendations</Button>
          </Stack>
          {loading ? (
            <Stack alignItems="center" spacing={2} sx={{ py: 8 }}>
              <CircularProgress />
              <Typography color="text.secondary">Loading products...</Typography>
            </Stack>
          ) : filtered.length ? (
            <>
              <Grid container spacing={3}>{visibleProducts.map((product) => <Grid item xs={12} sm={6} lg={4} key={product._id || product.id}><ProductCard product={product} /></Grid>)}</Grid>
              <Pagination count={pageCount} page={page} onChange={(_, value) => setPage(value)} color="primary" sx={{ mt: 4, display: 'flex', justifyContent: 'center' }} />
            </>
          ) : (
            <EmptyState title="No products found" text="Try adjusting filters or search terms." action="Clear filters" />
          )}
        </Grid>
      </Grid>
    </Container>
  );
}
