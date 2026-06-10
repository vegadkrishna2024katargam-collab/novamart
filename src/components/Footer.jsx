import { Box, Container, Grid, Link, Stack, Typography } from '@mui/material';

export default function Footer() {
  return (
    <Box component="footer" sx={{ bgcolor: '#111827', color: '#F9FAFB', mt: 8, py: 6 }}>
      <Container maxWidth="xl">
        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Typography variant="h5" fontWeight={900}>NovaMart</Typography>
            <Typography sx={{ mt: 1, color: '#CBD5E1' }}>Premium shopping for fashion, electronics, home, beauty, and daily essentials.</Typography>
          </Grid>
          {['About', 'Contact', 'Policies'].map((title) => (
            <Grid item xs={6} md={2} key={title}>
              <Typography fontWeight={800} sx={{ mb: 1 }}>{title}</Typography>
              <Stack spacing={1}>
                {['Company', 'Support', 'Careers', 'Returns'].map((item) => <Link key={item} color="#CBD5E1" underline="hover" href="#">{item}</Link>)}
              </Stack>
            </Grid>
          ))}
          <Grid item xs={12} md={2}>
            <Typography fontWeight={800} sx={{ mb: 1 }}>Payments</Typography>
            <Typography color="#CBD5E1">Visa, MasterCard, UPI, NetBanking, Wallets</Typography>
          </Grid>
        </Grid>
        <Typography color="#CBD5E1" sx={{ mt: 4 }}>Copyright 2026 NovaMart. All rights reserved.</Typography>
      </Container>
    </Box>
  );
}
