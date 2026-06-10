import { Box } from '@mui/material';
import { Outlet } from 'react-router-dom';
import Footer from '../components/Footer.jsx';
import Navbar from '../components/Navbar.jsx';

export default function MainLayout() {
  return (
    <Box sx={{ minHeight: '100vh' }}>
      <Navbar />
      <Outlet />
      <Footer />
    </Box>
  );
}
