import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { Alert, Avatar, Box, Button, Checkbox, Container, FormControlLabel, IconButton, InputAdornment, Link, Paper, Stack, TextField, Typography } from '@mui/material';
import { useState } from 'react';
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import { dashboardPathFor } from '../utils/authRole';

const initialForm = { name: '', email: '', password: '', confirmPassword: '', phone: '', profileImage: null };

export default function AuthPage({ mode }) {
  const isSignup = mode === 'signup';
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [fieldErrors, setFieldErrors] = useState({});
  const [error, setError] = useState('');
  const { login, signup } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const imagePreview = form.profileImage ? URL.createObjectURL(form.profileImage) : '';

  const change = (event) => {
    const value = event.target.files ? event.target.files[0] : event.target.value;
    setForm((current) => ({ ...current, [event.target.name]: value }));
    setFieldErrors((current) => ({ ...current, [event.target.name]: '' }));
  };

  const validate = () => {
    const nextErrors = {};
    if (isSignup && !form.name.trim()) nextErrors.name = 'Name is required.';
    if (!/^\S+@\S+\.\S+$/.test(form.email)) nextErrors.email = 'Enter a valid email address.';
    if (form.password.length < 6) nextErrors.password = 'Password must be at least 6 characters.';
    if (isSignup && form.password !== form.confirmPassword) nextErrors.confirmPassword = 'Passwords do not match.';
    if (isSignup && !/^[0-9+\-\s()]{7,20}$/.test(form.phone)) nextErrors.phone = 'Enter a valid phone number.';
    if (isSignup && form.profileImage && !form.profileImage.type.startsWith('image/')) nextErrors.profileImage = 'Upload a valid image file.';
    setFieldErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    if (!validate()) return;
    try {
      let data;
      if (isSignup) {
        const payload = new FormData();
        Object.entries(form).forEach(([key, value]) => value && payload.append(key, value));
        data = await signup(payload);
      } else {
        data = await login({ email: form.email, password: form.password });
      }
      navigate(location.state?.from || dashboardPathFor(data.user), { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Authentication failed. Check backend connection and credentials.');
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: 7 }}>
      <Paper component="form" onSubmit={submit} sx={{ p: { xs: 3, md: 5 } }}>
        <Stack spacing={2.5}>
          <Avatar sx={{ bgcolor: 'primary.main', mx: 'auto' }}>{isSignup ? 'S' : 'L'}</Avatar>
          <Box textAlign="center">
            <Typography variant="h4">{isSignup ? 'Create account' : 'Welcome back'}</Typography>
            <Typography color="text.secondary">{isSignup ? 'Join NovaMart with secure JWT authentication.' : 'Login with your email and password.'}</Typography>
          </Box>
          {error && <Alert severity="error">{error}</Alert>}
          {isSignup && <TextField required name="name" label="Name" value={form.name} onChange={change} error={Boolean(fieldErrors.name)} helperText={fieldErrors.name} />}
          <TextField required name="email" type="email" label="Email" value={form.email} onChange={change} error={Boolean(fieldErrors.email)} helperText={fieldErrors.email} />
          {isSignup && <TextField required name="phone" label="Phone number" value={form.phone} onChange={change} error={Boolean(fieldErrors.phone)} helperText={fieldErrors.phone} />}
          <TextField required name="password" label="Password" type={showPassword ? 'text' : 'password'} value={form.password} onChange={change} error={Boolean(fieldErrors.password)} helperText={fieldErrors.password} InputProps={{ endAdornment: <InputAdornment position="end"><IconButton aria-label="Toggle password visibility" onClick={() => setShowPassword((current) => !current)}>{showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}</IconButton></InputAdornment> }} />
          {isSignup && <TextField required name="confirmPassword" label="Confirm password" type={showConfirmPassword ? 'text' : 'password'} value={form.confirmPassword} onChange={change} error={Boolean(fieldErrors.confirmPassword)} helperText={fieldErrors.confirmPassword} InputProps={{ endAdornment: <InputAdornment position="end"><IconButton aria-label="Toggle confirm password visibility" onClick={() => setShowConfirmPassword((current) => !current)}>{showConfirmPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}</IconButton></InputAdornment> }} />}
          {isSignup && (
            <Stack spacing={1}>
              <Button component="label" variant="outlined" startIcon={<PhotoCameraIcon />}>Upload profile image<input hidden type="file" name="profileImage" accept="image/*" onChange={change} /></Button>
              {imagePreview && <Avatar src={imagePreview} alt="Profile preview" sx={{ width: 72, height: 72, mx: 'auto' }} />}
              {fieldErrors.profileImage && <Typography color="error" variant="caption">{fieldErrors.profileImage}</Typography>}
            </Stack>
          )}
          {!isSignup && <Stack direction="row" justifyContent="space-between" alignItems="center"><FormControlLabel control={<Checkbox />} label="Remember me" /><Link component={RouterLink} to="/forgot-password">Forgot password?</Link></Stack>}
          <Button type="submit" variant="contained" size="large">{isSignup ? 'Signup' : 'Login'}</Button>
          <Typography textAlign="center">{isSignup ? 'Already have an account?' : 'New here?'} <Link component={RouterLink} to={isSignup ? '/login' : '/signup'}>{isSignup ? 'Login' : 'Signup'}</Link></Typography>
        </Stack>
      </Paper>
    </Container>
  );
}
