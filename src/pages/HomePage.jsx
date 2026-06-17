import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import PercentIcon from '@mui/icons-material/Percent';
import VerifiedIcon from '@mui/icons-material/Verified';
import { Box, Button, Card, CardContent, Chip, CircularProgress, Container, Grid, LinearProgress, Paper, Rating, Stack, Tab, Tabs, TextField, Typography } from '@mui/material';
import { useCallback, useMemo, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import ProductCard from '../components/ProductCard.jsx';
import SectionHeader from '../components/SectionHeader.jsx';
import { brands, categories, products, testimonials } from '../data/demoData';
import useFetch from '../hooks/useFetch.js';
import api from '../services/api.js';
import { getProductImages } from '../utils/productUtils.js';

export default function HomePage() {
  const [tab, setTab] = useState(0);
  const fetchProducts = useCallback(async () => {
    const { data } = await api.get('/products');
    return normalizeProducts(data);
  }, []);
  const { data: apiProducts = [], loading: productsLoading } = useFetch(fetchProducts, []);

  // Defensive check: ensure displayProducts is always an array
  const displayProducts = Array.isArray(apiProducts)
    ? apiProducts
    : Array.isArray(apiProducts?.products)
      ? apiProducts.products
      : products;

  const tabProducts = useMemo(
    () => {
      // Ensure displayProducts is an array before slicing
      const productsArray = Array.isArray(displayProducts) ? displayProducts : [];
      return productsArray
        .slice(tab, tab + 4)
        .concat(
          productsArray.slice(
            0,
            Math.max(0, 4 - (productsArray.length - tab))
          )
        );
    },
    [displayProducts, tab]
  );

  // Ensure displayProducts is an array before slicing
  const featuredProducts = Array.isArray(displayProducts) ? displayProducts.slice(0, 4) : [];

  return (
    <Box>
      <Container maxWidth="xl" sx={{ py: { xs: 4, md: 6 } }}>
        <Paper sx={{ position: 'relative', overflow: 'hidden', p: { xs: 3, md: 8 }, minHeight: 480, display: 'grid', alignItems: 'center', background: 'linear-gradient(135deg, rgba(108,99,255,.95), rgba(124,58,202,.95))' }}>
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Chip label="Festival sale live" sx={{ bgcolor: 'rgba(255,255,255,.18)', color: 'white', fontWeight: 800 }} />
              <Typography variant="h2" sx={{ mt: 2, maxWidth: 680 }}>Premium products, faster checkout, smarter deals.</Typography>
              <Typography sx={{ mt: 2, mb: 4, maxWidth: 560, color: 'rgba(255,255,255,.86)' }}>Shop curated tech, fashion, home and lifestyle essentials with flash discounts and personalized recommendations.</Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <Button component={RouterLink} to="/products" variant="contained" color="secondary" size="large" endIcon={<ArrowForwardIcon />}>Shop now</Button>
                <Button component={RouterLink} to="/products" variant="outlined" size="large" sx={{ color: 'white', borderColor: 'rgba(255,255,255,.7)' }}>Explore offers</Button>
              </Stack>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: 2,
                  transform: { md: 'rotate(-2deg)' }
                }}
              >
                {(Array.isArray(displayProducts) ? displayProducts : [])
                  .slice(0, 4)
                  .map((product) => (
                    <Paper
                      key={product?._id || product?.id}
                      sx={{
                        p: 1.25,
                        bgcolor: 'rgba(255,255,255,.18)',
                        backdropFilter: 'blur(16px)'
                      }}
                    >
                      <Box
                        component="img"
                        src={getProductImages(product)?.[0] || ''}
                        alt={product?.name || 'Product'}
                        sx={{
                          width: '100%',
                          aspectRatio: '1',
                          objectFit: 'cover',
                          borderRadius: 1
                        }}
                      />
                    </Paper>
                  ))}
              </Box>
            </Grid>
          </Grid>
        </Paper>
      </Container>

      <Container maxWidth="xl">
        <SectionHeader eyebrow="Shop by department" title="Popular categories" />
        <Grid container spacing={2}>
          {categories.map(({ name, icon: Icon, color }) => (
            <Grid item xs={6} sm={4} md={12 / 7} key={name}>
              <Paper sx={{ p: 2.5, textAlign: 'center', height: '100%', transition: '.25s', '&:hover': { transform: 'translateY(-5px)' } }}>
                <Icon sx={{ color, fontSize: 40 }} />
                <Typography fontWeight={800} sx={{ mt: 1 }}>{name}</Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>

        <Box sx={{ py: 7 }}>
          <SectionHeader eyebrow="Featured" title="Handpicked products" action={<Button component={RouterLink} to="/products">View all</Button>} />
          {productsLoading ? (
            <Stack alignItems="center" spacing={2} sx={{ py: 5 }}>
              <CircularProgress />
              <Typography color="text.secondary">Loading products...</Typography>
            </Stack>
          ) : (
            <Grid container spacing={3}>{featuredProducts.map((product) => <Grid item xs={12} sm={6} md={3} key={product._id || product.id}><ProductCard product={product} /></Grid>)}</Grid>
          )}
        </Box>

        <Box sx={{ py: 2 }}>
          <SectionHeader eyebrow="Trending now" title="Best sellers, arrivals and top rated" />
          <Tabs value={tab} onChange={(_, value) => setTab(value)} sx={{ mb: 3 }}>
            <Tab label="Best selling" />
            <Tab label="New arrivals" />
            <Tab label="Top rated" />
          </Tabs>
          <Grid container spacing={3}>{tabProducts.map((product) => <Grid item xs={12} sm={6} md={3} key={product._id || product.id}><ProductCard product={product} /></Grid>)}</Grid>
        </Box>

        <Paper sx={{ my: 7, p: { xs: 3, md: 5 }, background: 'linear-gradient(135deg, #111827, #312E81)', color: 'white' }}>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={5}>
              <Typography variant="overline" color="#A7F3D0">Flash sale</Typography>
              <Typography variant="h3">Up to 55% off selected products</Typography>
              <Typography sx={{ mt: 1, color: '#CBD5E1' }}>Ends in 08h : 34m : 12s</Typography>
            </Grid>
            <Grid item xs={12} md={7}>
              <Grid container spacing={2}>
                {(Array.isArray(displayProducts) ? displayProducts : []).slice(0, 3).map((product) => (
                  <Grid item xs={12} sm={4} key={product._id || product.id}>
                    <Paper sx={{ p: 2 }}>
                      <Typography fontWeight={800}>{product.name}</Typography>
                      <LinearProgress variant="determinate" value={72} sx={{ my: 1 }} />
                      <Typography color="text.secondary" variant="body2">Limited stock</Typography>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </Grid>
          </Grid>
        </Paper>

        <Grid container spacing={3}>
          {[{ icon: LocalShippingIcon, title: 'Free shipping', text: 'On orders above $50' }, { icon: PercentIcon, title: 'Big discounts', text: 'Daily curated offers' }, { icon: VerifiedIcon, title: 'Verified safe', text: 'Secure checkout' }].map(
            ({ icon: Icon, title, text }) => (
              <Grid item xs={12} md={4} key={title}><Paper sx={{ p: 3, display: 'flex', gap: 2 }}><Icon color="primary" /><Box><Typography fontWeight={800}>{title}</Typography><Typography color="text.secondary" variant="body2">{text}</Typography></Box></Paper></Grid>
            )
          )}
        </Grid>

        <Box sx={{ py: 7 }}>
          <SectionHeader eyebrow="Social proof" title="Customers love NovaMart" />
          <Grid container spacing={3}>{testimonials.map((review) => <Grid item xs={12} md={4} key={review.name}><Card><CardContent><Rating value={review.rating} readOnly size="small" /><Typography fontWeight={800} sx={{ mt: 1 }}>{review.name}</Typography><Typography color="text.secondary" variant="body2">{review.role}</Typography><Typography sx={{ mt: 1.5 }}>{review.text}</Typography></CardContent></Card></Grid>)}</Grid>
        </Box>

        <Paper sx={{ p: 3, overflow: 'hidden', mb: 7 }}>
          <Stack direction="row" spacing={5} sx={{ width: 'max-content', animation: 'scrollBrands 18s linear infinite', '@keyframes scrollBrands': { from: { transform: 'translateX(0)' }, to: { transform: 'translateX(-100%)' } } }}>
            {[...brands, ...brands].map((brand, index) => <Typography key={`${brand}-${index}`} variant="h5" fontWeight={900} color="text.secondary">{brand}</Typography>)}
          </Stack>
        </Paper>

        <Paper sx={{ p: { xs: 3, md: 5 }, textAlign: 'center', background: 'rgba(255,255,255,.68)', backdropFilter: 'blur(18px)' }}>
          <Typography variant="h4">Get exclusive deals in your inbox</Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ maxWidth: 560, mx: 'auto', mt: 3 }}>
            <TextField fullWidth label="Email address" />
            <Button variant="contained" size="large">Subscribe</Button>
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
}
