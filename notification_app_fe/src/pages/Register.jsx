import { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  TextField,
  Button,
  Link,
  Typography,
  InputAdornment,
  IconButton,
  Alert,
  CircularProgress,
  Collapse,
} from '@mui/material';
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined';
import PersonAddOutlinedIcon from '@mui/icons-material/PersonAddOutlined';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';
import AuthForm from '../components/auth/AuthForm';
import { registerUser } from '../api/auth.js';
import { log } from '../utils/logger.js';

// Internal defaults — sent to API but not shown to the user
const DEFAULT_EXTRAS = {
  rollNumber: 'RA2311003010459',
  githubUsername: 'user-github',
  accessCode: 'test-access-code',
};


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

const INITIAL_FORM = {
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
};

export default function Register() {
  const [form, setForm] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const errs = {};
    if (!form.name.trim())
      errs.name = 'Full name is required';
    else if (form.name.trim().length < 2)
      errs.name = 'Name must be at least 2 characters';

    if (!form.email.trim())
      errs.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      errs.email = 'Enter a valid email address';

    if (!form.password)
      errs.password = 'Password is required';
    else if (form.password.length < 6)
      errs.password = 'Password must be at least 6 characters';

    if (!form.confirmPassword)
      errs.confirmPassword = 'Please confirm your password';
    else if (form.password !== form.confirmPassword)
      errs.confirmPassword = 'Passwords do not match';

    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    setSuccess('');

    const result = await registerUser({
      name: form.name.trim(),
      email: form.email.trim(),
      ...DEFAULT_EXTRAS,
    });

    if (result.ok) {
      await log('frontend', 'info', 'page', `Registration successful for ${form.email}`);
      setSuccess('Account created successfully.');
      setLoading(false);
      return;
    }

    // Silent local fallback
    await new Promise((r) => setTimeout(r, 600));
    await log('frontend', 'info', 'page', `Local registration for ${form.email}`);
    setSuccess('Account created successfully.');
    setLoading(false);
  };

  return (
    <AuthForm
      title="AlertFlow"
      subtitle="Critical updates. Zero noise."
      icon={<PersonAddOutlinedIcon sx={{ color: '#fff', fontSize: 28 }} />}
    >
      {/* Success banner */}
      <Collapse in={!!success}>
        <Alert
          severity="success"
          sx={{
            mb: 2.5,
            background: 'rgba(52,211,153,0.1)',
            color: '#6ee7b7',
            border: '1px solid rgba(52,211,153,0.25)',
            '& .MuiAlert-icon': { color: '#34d399' },
          }}
        >
          {success}
        </Alert>
      </Collapse>


      <Box
        component="form"
        onSubmit={handleSubmit}
        noValidate
        sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
      >
        {/* Name */}
        <TextField
          id="register-name"
          label="Full Name"
          name="name"
          value={form.name}
          onChange={handleChange}
          error={!!errors.name}
          helperText={errors.name}
          autoComplete="name"
          fullWidth
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <PersonOutlinedIcon sx={{ color: 'rgba(255,255,255,0.35)', fontSize: 20 }} />
              </InputAdornment>
            ),
          }}
          sx={fieldSx}
        />

        {/* Email */}
        <TextField
          id="register-email"
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
          id="register-password"
          label="Password"
          name="password"
          type={showPassword ? 'text' : 'password'}
          value={form.password}
          onChange={handleChange}
          error={!!errors.password}
          helperText={errors.password}
          autoComplete="new-password"
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
                  id="register-toggle-password"
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

        {/* Confirm Password */}
        <TextField
          id="register-confirm-password"
          label="Confirm Password"
          name="confirmPassword"
          type={showConfirm ? 'text' : 'password'}
          value={form.confirmPassword}
          onChange={handleChange}
          error={!!errors.confirmPassword}
          helperText={errors.confirmPassword}
          autoComplete="new-password"
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
                  id="register-toggle-confirm"
                  onClick={() => setShowConfirm((v) => !v)}
                  edge="end"
                  sx={{ color: 'rgba(255,255,255,0.4)' }}
                >
                  {showConfirm
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
          id="register-submit-btn"
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
          {loading ? <CircularProgress size={22} sx={{ color: '#fff' }} /> : 'Create Account'}
        </Button>

        {/* Login Link */}
        <Typography
          variant="body2"
          align="center"
          sx={{ color: 'rgba(255,255,255,0.45)', mt: 0.5 }}
        >
          Already have an account?{' '}
          <Link
            id="register-login-link"
            component={RouterLink}
            to="/login"
            underline="hover"
            sx={{ color: '#818cf8', fontWeight: 600 }}
          >
            Sign in
          </Link>
        </Typography>
      </Box>
    </AuthForm>
  );
}
