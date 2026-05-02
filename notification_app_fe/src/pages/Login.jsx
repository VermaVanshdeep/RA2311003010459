import { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../state/authContext';
import {
  Box,
  TextField,
  Button,
  Link,
  Typography,
  InputAdornment,
  IconButton,
  Alert,
  Collapse,
  CircularProgress,
} from '@mui/material';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import LoginOutlinedIcon from '@mui/icons-material/LoginOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';
import AuthForm from '../components/auth/AuthForm';
import { authenticateUser, getCredentials } from '../api/auth.js';
import { log } from '../utils/logger.js';

// Autofill override keeps Chrome from flashing white on dark inputs
const autofillSx = {
  '&:-webkit-autofill, &:-webkit-autofill:hover, &:-webkit-autofill:focus, &:-webkit-autofill:active': {
    WebkitBoxShadow: '0 0 0 100px #1a1640 inset',
    WebkitTextFillColor: '#ffffff',
    caretColor: '#ffffff',
    borderRadius: 'inherit',
    transition: 'background-color 9999s ease-in-out 0s',
  },
};

const fieldSx = {
  '& .MuiOutlinedInput-root': {
    color: '#fff',
    background: 'rgba(255,255,255,0.06)',
    borderRadius: 2,
    '& fieldset': { borderColor: 'rgba(255,255,255,0.15)' },
    '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.35)' },
    '&.Mui-focused fieldset': { borderColor: '#667eea' },
    '& input': autofillSx,
  },
  '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.5)' },
  '& .MuiInputLabel-root.Mui-focused': { color: '#667eea' },
  '& .MuiFormHelperText-root': { color: '#f87171' },
};

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
    if (submitError) setSubmitError('');
  };

  const validate = () => {
    const newErrors = {};
    if (!form.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = 'Enter a valid email address';
    }
    if (!form.password) {
      newErrors.password = 'Password is required';
    } else if (form.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setLoading(true);
    setSubmitError('');

    // Attempt API auth if credentials are stored
    const credentials = getCredentials();
    if (credentials) {
      const result = await authenticateUser();
      if (result.ok) {
        await log('frontend', 'info', 'page',
          `Login successful via API for ${form.email}`);
        setLoading(false);
        login(form.email);
        navigate('/dashboard');
        return;
      }
      // API auth failed — proceed with local session
      await log('frontend', 'warn', 'api',
        `Auth API failed (${result.status ?? 'network'}) — using local session`);
    } else {
      await log('frontend', 'info', 'page',
        'No stored credentials — using local session');
    }

    // Local session login
    setTimeout(async () => {
      await log('frontend', 'info', 'page',
        `Login completed for ${form.email}`);
      setLoading(false);
      login(form.email);
      navigate('/dashboard');
    }, 800);
  };

  return (
    <AuthForm
      title="AlertFlow"
      subtitle="Critical updates. Zero noise."
      icon={<LoginOutlinedIcon sx={{ color: '#fff', fontSize: 28 }} />}
    >
      {/* Error banner */}
      <Collapse in={!!submitError}>
        <Alert
          severity="warning"
          sx={{
            mb: 2.5,
            background: 'rgba(251,191,36,0.08)',
            color: '#fde68a',
            border: '1px solid rgba(251,191,36,0.2)',
            '& .MuiAlert-icon': { color: '#fbbf24' },
          }}
        >
          {submitError}
        </Alert>
      </Collapse>

      <Box component="form" onSubmit={handleSubmit} noValidate sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
        {/* Email */}
        <TextField
          id="login-email"
          label="Email Address"
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
          error={!!errors.email}
          helperText={errors.email}
          autoComplete="email"
          fullWidth
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <EmailOutlinedIcon sx={{ color: 'rgba(255,255,255,0.35)', fontSize: 20 }} />
              </InputAdornment>
            ),
          }}
          sx={fieldSx}
        />

        {/* Password */}
        <TextField
          id="login-password"
          label="Password"
          name="password"
          type={showPassword ? 'text' : 'password'}
          value={form.password}
          onChange={handleChange}
          error={!!errors.password}
          helperText={errors.password}
          autoComplete="current-password"
          fullWidth
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <LockOutlinedIcon sx={{ color: 'rgba(255,255,255,0.35)', fontSize: 20 }} />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  id="login-toggle-password"
                  onClick={() => setShowPassword((v) => !v)}
                  edge="end"
                  sx={{ color: 'rgba(255,255,255,0.4)' }}
                >
                  {showPassword
                    ? <VisibilityOffOutlinedIcon fontSize="small" />
                    : <VisibilityOutlinedIcon fontSize="small" />}
                </IconButton>
              </InputAdornment>
            ),
          }}
          sx={fieldSx}
        />

        {/* Submit */}
        <Button
          id="login-submit-btn"
          type="submit"
          variant="contained"
          fullWidth
          disabled={loading}
          sx={{
            mt: 0.5,
            py: 1.5,
            borderRadius: 2,
            fontWeight: 600,
            fontSize: '0.95rem',
            letterSpacing: '0.3px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            boxShadow: '0 8px 20px rgba(102,126,234,0.35)',
            textTransform: 'none',
            '&:hover': {
              background: 'linear-gradient(135deg, #7c93f0 0%, #8a5cb8 100%)',
              boxShadow: '0 10px 25px rgba(102,126,234,0.5)',
              transform: 'translateY(-1px)',
            },
            '&:active': { transform: 'translateY(0)' },
            transition: 'all 0.2s ease',
          }}
        >
          {loading ? <CircularProgress size={22} sx={{ color: '#fff' }} /> : 'Sign In'}
        </Button>

        {/* Register Link */}
        <Typography
          variant="body2"
          align="center"
          sx={{ color: 'rgba(255,255,255,0.45)', mt: 0.5 }}
        >
          Don&apos;t have an account?{' '}
          <Link
            id="login-register-link"
            component={RouterLink}
            to="/register"
            underline="hover"
            sx={{ color: '#818cf8', fontWeight: 600 }}
          >
            Create one
          </Link>
        </Typography>
      </Box>
    </AuthForm>
  );
}
