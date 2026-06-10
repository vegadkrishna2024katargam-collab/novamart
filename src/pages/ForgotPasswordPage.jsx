import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { Alert, Button, Container, IconButton, InputAdornment, Paper, Stack, TextField, Typography } from '@mui/material';
import { useState } from 'react';
import api from '../services/api';

export default function ForgotPasswordPage() {
  const [form, setForm] = useState({ email: '', otp: '', password: '', confirmPassword: '' });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const change = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
    setError('');
  };

  const requestOtp = async (event) => {
    event.preventDefault();
    setMessage('');
    if (!/^\S+@\S+\.\S+$/.test(form.email)) return setError('Enter a valid email address.');
    try {
      setLoading(true);
      const { data } = await api.post('/auth/forgot-password', { email: form.email });
      setOtpSent(true);
      setMessage(data.otp ? `${data.message}. Development OTP: ${data.otp}` : data.message);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to request verification code.');
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (event) => {
    event.preventDefault();
    setMessage('');
    if (!form.otp.trim()) return setError('Enter the OTP sent to your email.');
    if (form.password.length < 6) return setError('Password must be at least 6 characters.');
    if (form.password !== form.confirmPassword) return setError('Passwords do not match.');
    try {
      setLoading(true);
      const { data } = await api.post('/auth/reset-password', { email: form.email, otp: form.otp, password: form.password });
      setMessage(data.message);
      setForm({ email: '', otp: '', password: '', confirmPassword: '' });
      setOtpSent(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to reset password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: 7 }}>
      <Paper sx={{ p: { xs: 3, md: 5 } }}>
        <Stack component="form" onSubmit={otpSent ? resetPassword : requestOtp} spacing={2}>
          <Typography variant="h4">Reset password</Typography>
          <Typography color="text.secondary">Verify your email with an OTP, then set a new password.</Typography>
          {message && <Alert severity="success">{message}</Alert>}
          {error && <Alert severity="error">{error}</Alert>}
          <TextField required name="email" label="Email address" type="email" value={form.email} onChange={change} disabled={otpSent} />
          {otpSent && (
            <>
              <TextField required name="otp" label="OTP code" value={form.otp} onChange={change} />
              <TextField required name="password" label="New password" type={showPassword ? 'text' : 'password'} value={form.password} onChange={change} InputProps={{ endAdornment: <InputAdornment position="end"><IconButton aria-label="Toggle password visibility" onClick={() => setShowPassword((current) => !current)}>{showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}</IconButton></InputAdornment> }} />
              <TextField required name="confirmPassword" label="Confirm new password" type={showPassword ? 'text' : 'password'} value={form.confirmPassword} onChange={change} />
            </>
          )}
          <Button type="submit" variant="contained" disabled={loading}>{otpSent ? 'Reset password' : 'Send OTP'}</Button>
          {otpSent && <Button onClick={() => setOtpSent(false)} disabled={loading}>Use another email</Button>}
        </Stack>
      </Paper>
    </Container>
  );
}
