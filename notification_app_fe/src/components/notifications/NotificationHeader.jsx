import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Avatar,
  Badge,
  Box,
  Popover,
  Tooltip,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import LogoutIcon from '@mui/icons-material/Logout';
import MenuIcon from '@mui/icons-material/Menu';
import { useAuth } from '../../state/authContext';
import { useNotifications } from '../../state/notificationsContext';

export default function NotificationHeader({ onMenuToggle }) {
  const { user, logout } = useAuth();
  const { unreadCount } = useNotifications();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [anchorEl, setAnchorEl] = useState(null);

  const handleLogout = () => {
    setAnchorEl(null);
    logout();
    navigate('/login');
  };

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        background: 'rgba(15, 12, 41, 0.85)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        zIndex: (t) => t.zIndex.drawer + 1,
      }}
    >
      <Toolbar sx={{ gap: 1, minHeight: { xs: 60, md: 68 }, px: { xs: 1, sm: 2 } }}>
        {/* Mobile menu toggle */}
        {isMobile && (
          <IconButton
            id="header-menu-btn"
            edge="start"
            onClick={onMenuToggle}
            sx={{ color: 'rgba(255,255,255,0.7)', mr: 0.5 }}
          >
            <MenuIcon />
          </IconButton>
        )}

        {/* Brand */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 1.5 }, flex: 1, minWidth: 0 }}>
          <Box
            sx={{
              width: { xs: 30, md: 34 },
              height: { xs: 30, md: 34 },
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(102,126,234,0.4)',
              flexShrink: 0,
            }}
          >
            <NotificationsIcon sx={{ color: '#fff', fontSize: { xs: 16, md: 18 } }} />
          </Box>
          <Typography
            variant="h6"
            fontWeight={700}
            sx={{
              color: '#fff',
              letterSpacing: '-0.3px',
              fontSize: { xs: '0.95rem', md: '1.15rem' },
              display: { xs: 'none', sm: 'block' },
              overflow: 'hidden',
              whiteSpace: 'nowrap',
              textOverflow: 'ellipsis',
            }}
          >
            AlertFlow
          </Typography>
        </Box>

        {/* Right: Badge + Avatar */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Tooltip title={`${unreadCount} unread`}>
            <IconButton
              id="header-notifications-btn"
              sx={{ color: 'rgba(255,255,255,0.6)' }}
            >
              <Badge
                badgeContent={unreadCount}
                color="error"
                sx={{
                  '& .MuiBadge-badge': {
                    background: 'linear-gradient(135deg, #f87171, #ef4444)',
                    fontWeight: 700,
                    fontSize: '0.65rem',
                    minWidth: 18,
                    height: 18,
                  },
                }}
              >
                <NotificationsIcon />
              </Badge>
            </IconButton>
          </Tooltip>

          <Tooltip title={user?.email || 'User'}>
            <IconButton
              id="header-avatar-btn"
              onClick={(e) => setAnchorEl(e.currentTarget)}
              sx={{ p: 0.5 }}
            >
              <Avatar
                sx={{
                  width: 36,
                  height: 36,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  boxShadow: '0 4px 12px rgba(102,126,234,0.35)',
                  border: '2px solid rgba(255,255,255,0.15)',
                }}
              >
                {user?.avatar || 'U'}
              </Avatar>
            </IconButton>
          </Tooltip>
        </Box>

        {/* Avatar dropdown — Popover with transparent Paper so our Box controls all styling */}
        <Popover
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={() => setAnchorEl(null)}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          PaperProps={{
            elevation: 0,
            style: {
              background: 'transparent',
              boxShadow: 'none',
              overflow: 'visible',
              marginTop: 6,
            },
          }}
        >
          {/* All dark styling lives here — fully isolated from MUI theme */}
          <Box
            sx={{
              minWidth: 220,
              borderRadius: 2.5,
              overflow: 'hidden',
              background: 'linear-gradient(160deg, #1e1a45 0%, #12102c 100%)',
              border: '1px solid rgba(129,140,248,0.2)',
              boxShadow: '0 20px 60px rgba(0,0,0,0.8), 0 0 0 1px rgba(102,126,234,0.15)',
            }}
          >
            {/* User info */}
            <Box
              data-form-type="other"
              sx={{
                px: 2,
                pt: 1.75,
                pb: 1.5,
                background: 'rgba(102,126,234,0.1)',
                borderBottom: '1px solid rgba(255,255,255,0.07)',
              }}
            >
              <Typography
                variant="body2"
                fontWeight={700}
                sx={{ color: '#fff', lineHeight: 1.3, userSelect: 'none' }}
              >
                {user?.name}
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  color: 'rgba(255,255,255,0.5)',
                  fontSize: '0.72rem',
                  display: 'block',
                  mt: 0.3,
                  userSelect: 'none',
                }}
              >
                {user?.email}
              </Typography>
            </Box>

            {/* Logout button — plain Box avoids MUI MenuItem background defaults */}
            <Box
              id="header-logout-btn"
              onClick={handleLogout}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                px: 2,
                py: 1.25,
                color: '#f87171',
                cursor: 'pointer',
                transition: 'background 0.15s ease, color 0.15s ease',
                '&:hover': {
                  background: 'rgba(248,113,113,0.1)',
                  color: '#fca5a5',
                },
              }}
            >
              <LogoutIcon fontSize="small" />
              <Typography variant="body2" fontWeight={500}>Sign Out</Typography>
            </Box>
          </Box>
        </Popover>

      </Toolbar>
    </AppBar>
  );
}
