import { Box, Card, CardContent, Typography, Divider } from '@mui/material';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';

// icon prop lets each auth page pass its own brand icon.
// Falls back to the notification bell if none is provided.
export default function AuthForm({ title, subtitle, icon, children }) {
  const BrandIcon = icon ?? <NotificationsActiveIcon sx={{ color: '#fff', fontSize: 28 }} />;

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)',
        px: 2,
      }}
    >
      <Card
        elevation={0}
        sx={{
          width: '100%',
          maxWidth: 440,
          borderRadius: 4,
          background: 'rgba(255,255,255,0.05)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.12)',
          boxShadow: '0 25px 50px rgba(0,0,0,0.5)',
        }}
      >
        <CardContent sx={{ p: { xs: 3, sm: 4.5 } }}>
          {/* Brand header */}
          <Box sx={{ textAlign: 'center', mb: 3.5 }}>
            <Box
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 56,
                height: 56,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                mb: 2,
                boxShadow: '0 8px 20px rgba(102,126,234,0.4)',
              }}
            >
              {BrandIcon}
            </Box>

            <Typography
              variant="h5"
              fontWeight={700}
              sx={{ color: '#fff', letterSpacing: '-0.5px', mb: 0.5 }}
            >
              {title}
            </Typography>

            {subtitle && (
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.5)' }}>
                {subtitle}
              </Typography>
            )}
          </Box>

          <Divider sx={{ borderColor: 'rgba(255,255,255,0.08)', mb: 3 }} />

          {children}
        </CardContent>
      </Card>
    </Box>
  );
}
