import {
  Box,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Chip,
  Drawer,
  Divider,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import AllInboxIcon from '@mui/icons-material/AllInbox';
import MarkEmailUnreadIcon from '@mui/icons-material/MarkEmailUnread';
import MarkEmailReadIcon from '@mui/icons-material/MarkEmailRead';
import StarIcon from '@mui/icons-material/Star';
import { useNotifications } from '../../state/notificationsContext';

const SIDEBAR_WIDTH = 220;

const filters = [
  { key: 'all', label: 'All', Icon: AllInboxIcon },
  { key: 'unread', label: 'Unread', Icon: MarkEmailUnreadIcon },
  { key: 'read', label: 'Read', Icon: MarkEmailReadIcon },
  { key: 'important', label: 'Important', Icon: StarIcon },
];

function SidebarContent({ onClose }) {
  const { filter, setFilter, notifications, unreadCount } = useNotifications();

  const counts = {
    all: notifications.length,
    unread: notifications.filter((n) => !n.read).length,
    read: notifications.filter((n) => n.read).length,
    important: notifications.filter(
      (n) => n.priority === 'urgent' || n.priority === 'high'
    ).length,
  };

  const handleSelect = (key) => {
    setFilter(key);
    if (onClose) onClose();
  };

  return (
    <Box
      sx={{
        width: { xs: '85vw', sm: SIDEBAR_WIDTH },
        maxWidth: SIDEBAR_WIDTH,
        height: '100%',
        background: 'rgba(15,12,41,0.97)',
        borderRight: '1px solid rgba(255,255,255,0.07)',
        pt: 1,
        display: 'flex',
        flexDirection: 'column',
        overflowX: 'hidden',
      }}
    >
      {/* Section label */}
      <Typography
        variant="overline"
        sx={{
          color: 'rgba(255,255,255,0.3)',
          fontSize: '0.65rem',
          letterSpacing: '0.1em',
          px: 2,
          pt: { xs: 2, md: 1.5 }, // extra top padding on mobile (below AppBar)
          pb: 0.5,
          display: 'block',
        }}
      >
        Filter by
      </Typography>

      <List sx={{ px: 1, flex: 1 }}>
        {filters.map(({ key, label, Icon }) => {
          const active = filter === key;
          return (
            <ListItemButton
              id={`filter-${key}-btn`}
              key={key}
              selected={active}
              onClick={() => handleSelect(key)}
              sx={{
                borderRadius: 2,
                mb: 0.5,
                py: { xs: 1.1, md: 1 },
                px: { xs: 1.25, md: 1.5 },
                color: active ? '#fff' : 'rgba(255,255,255,0.55)',
                background: active
                  ? 'linear-gradient(135deg, rgba(102,126,234,0.25) 0%, rgba(118,75,162,0.25) 100%)'
                  : 'transparent',
                border: active ? '1px solid rgba(102,126,234,0.3)' : '1px solid transparent',
                '&:hover': {
                  background: active
                    ? 'linear-gradient(135deg, rgba(102,126,234,0.3) 0%, rgba(118,75,162,0.3) 100%)'
                    : 'rgba(255,255,255,0.05)',
                },
                '&.Mui-selected': { background: 'transparent' },
                transition: 'all 0.18s ease',
              }}
            >
              <ListItemIcon sx={{ minWidth: 36 }}>
                <Icon
                  sx={{
                    fontSize: 18,
                    color: active ? '#818cf8' : 'rgba(255,255,255,0.4)',
                  }}
                />
              </ListItemIcon>
              <ListItemText
                primary={label}
                primaryTypographyProps={{
                  fontSize: '0.875rem',
                  fontWeight: active ? 600 : 400,
                }}
              />
              {counts[key] > 0 && (
                <Chip
                  label={counts[key]}
                  size="small"
                  sx={{
                    height: 20,
                    fontSize: '0.65rem',
                    fontWeight: 700,
                    background: active
                      ? 'rgba(129,140,248,0.25)'
                      : 'rgba(255,255,255,0.08)',
                    color: active ? '#818cf8' : 'rgba(255,255,255,0.45)',
                    border: active ? '1px solid rgba(129,140,248,0.3)' : 'none',
                    '& .MuiChip-label': { px: 1 },
                  }}
                />
              )}
            </ListItemButton>
          );
        })}
      </List>

      <Divider sx={{ borderColor: 'rgba(255,255,255,0.06)', mx: 2 }} />
      <Box sx={{ px: 2.5, py: 2 }}>
        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.25)', fontSize: '0.7rem' }}>
          {unreadCount} unread · {notifications.length} total
        </Typography>
      </Box>
    </Box>
  );
}

export default function NotificationFilter({ mobileOpen, onMobileClose }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  if (isMobile) {
    return (
      <Drawer
        anchor="left"
        open={mobileOpen}
        onClose={onMobileClose}
        ModalProps={{ keepMounted: true }}
        PaperProps={{
          sx: {
            background: 'transparent',
            maxWidth: '85vw',
            boxShadow: '4px 0 24px rgba(0,0,0,0.5)',
          },
        }}
      >
        <SidebarContent onClose={onMobileClose} />
      </Drawer>
    );
  }

  return (
    <Box
      component="nav"
      sx={{
        width: SIDEBAR_WIDTH,
        flexShrink: 0,
        position: 'fixed',
        top: 68,
        left: 0,
        bottom: 0,
      }}
    >
      <SidebarContent />
    </Box>
  );
}

export { SIDEBAR_WIDTH };
