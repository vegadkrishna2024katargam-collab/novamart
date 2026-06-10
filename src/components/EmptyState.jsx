import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined';
import { Box, Button, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

export default function EmptyState({ title = 'Nothing here yet', text = 'Explore products and add your favorites.', action = 'Shop now' }) {
  return (
    <Box sx={{ py: 10, textAlign: 'center' }}>
      <ShoppingBagOutlinedIcon color="primary" sx={{ fontSize: 56, mb: 2 }} />
      <Typography variant="h5">{title}</Typography>
      <Typography color="text.secondary" sx={{ mt: 1, mb: 3 }}>{text}</Typography>
      <Button component={RouterLink} to="/products" variant="contained">{action}</Button>
    </Box>
  );
}
