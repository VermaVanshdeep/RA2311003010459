import { Box, Typography, Button, CircularProgress } from '@mui/material';
import InboxIcon from '@mui/icons-material/Inbox';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import NotificationCard from './NotificationCard';
import NotificationPagination from './NotificationPagination';
import { useNotifications } from '../../state/notificationsContext';

export default function NotificationList() {
  const { filteredNotifications, filter, markAllAsRead, unreadCount, page, totalPages } =
    useNotifications();

  if (filteredNotifications.length === 0) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          py: 10,
          gap: 2,
          opacity: 0.5,
        }}
      >
        <InboxIcon sx={{ fontSize: 56, color: 'rgba(255,255,255,0.2)' }} />
        <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.4)', fontWeight: 500 }}>
          No notifications
        </Typography>
        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.25)' }}>
          {filter === 'unread'
            ? 'All caught up!'
            : filter === 'important'
            ? 'No high priority notifications'
            : 'Nothing here yet'}
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      {/* List header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          mb: 2,
          pb: 1.5,
          borderBottom: '1px solid rgba(255,255,255,0.07)',
        }}
      >
        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem' }}>
          {filteredNotifications.length} notification{filteredNotifications.length !== 1 ? 's' : ''}
          {totalPages > 1 && (
            <Box component="span" sx={{ color: 'rgba(255,255,255,0.22)', ml: 0.75 }}>
              · page {page} of {totalPages}
            </Box>
          )}
        </Typography>

        {unreadCount > 0 && (
          <Button
            id="mark-all-read-btn"
            size="small"
            startIcon={<DoneAllIcon sx={{ fontSize: 14 }} />}
            onClick={markAllAsRead}
            sx={{
              color: '#818cf8',
              fontSize: '0.75rem',
              textTransform: 'none',
              fontWeight: 600,
              px: 1.5,
              py: 0.5,
              borderRadius: 1.5,
              '&:hover': {
                background: 'rgba(129,140,248,0.1)',
              },
            }}
          >
            Mark all read
          </Button>
        )}
      </Box>

      {/* Cards */}
      {filteredNotifications.map((notification) => (
        <NotificationCard key={notification.id} notification={notification} />
      ))}

      {/* Pagination */}
      <NotificationPagination />
    </Box>
  );
}
