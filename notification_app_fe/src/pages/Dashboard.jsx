import { useState } from 'react';
import { Box, Typography, useMediaQuery, useTheme } from '@mui/material';
import NotificationHeader from '../components/notifications/NotificationHeader';
import NotificationFilter, { SIDEBAR_WIDTH } from '../components/notifications/NotificationFilter';
import NotificationList from '../components/notifications/NotificationList';
import PriorityNotifications from '../components/notifications/PriorityNotifications';
import { useAuth } from '../state/authContext';
import { useNotifications } from '../state/notificationsContext';

const FILTER_LABELS = {
  all: 'All Notifications',
  unread: 'Unread',
  read: 'Read',
  important: 'Important',
};

export default function Dashboard() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user } = useAuth();
  const { filter, unreadCount, notifications } = useNotifications();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const totalCount = notifications.length;
  const importantCount = notifications.filter(
    (n) => n.priority === 'urgent' || n.priority === 'high'
  ).length;


  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(160deg, #0f0c29 0%, #1a1040 50%, #24243e 100%)',
      }}
    >
      {/* Top Navbar */}
      <NotificationHeader onMenuToggle={() => setMobileOpen((v) => !v)} />

      {/* Sidebar */}
      <NotificationFilter
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      {/* Main content */}
      <Box
        component="main"
        sx={{
          ml: isMobile ? 0 : `${SIDEBAR_WIDTH}px`,
          pt: { xs: '60px', md: '68px' },
          minHeight: '100vh',
        }}
      >
        <Box
          sx={{
            maxWidth: 780,
            mx: 'auto',
            px: { xs: 2, sm: 3, md: 4 },
            py: 4,
          }}
        >
          {/* Page header */}
          <Box sx={{ mb: 4 }}>
            <Typography
              variant="h5"
              fontWeight={700}
              sx={{
                color: '#fff',
                letterSpacing: '-0.4px',
                mb: 0.5,
              }}
            >
              {FILTER_LABELS[filter]}
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.4)' }}>
              {unreadCount > 0
                ? `You have ${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}`
                : `Welcome back, ${user?.name}! All caught up 🎉`}
            </Typography>
          </Box>

          {/* Stats row */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: 1.5,
              mb: 4,
            }}
          >
            {[
              { label: 'Total', value: totalCount, color: '#818cf8' },
              { label: 'Unread', value: unreadCount, color: '#f87171' },
              { label: 'Important', value: importantCount, color: '#fb923c' },
            ].map(({ label, value, color }) => (
              <Box
                key={label}
                sx={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 2.5,
                  p: { xs: 1.5, sm: 2 },
                  textAlign: 'center',
                  backdropFilter: 'blur(10px)',
                }}
              >
                <Typography
                  variant="h4"
                  fontWeight={700}
                  sx={{ color, lineHeight: 1.2, fontSize: { xs: '1.5rem', sm: '2rem' } }}
                >
                  {value}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.72rem', letterSpacing: '0.05em' }}
                >
                  {label}
                </Typography>
              </Box>
            ))}
          </Box>

          {/* Priority notifications — Stage 1 algorithm */}
          <PriorityNotifications />

          {/* Notification list */}
          <NotificationList />

        </Box>
      </Box>
    </Box>
  );
}
