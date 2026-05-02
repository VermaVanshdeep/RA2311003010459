import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  IconButton,
  Tooltip,
  Fade,
} from '@mui/material';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import { useNotifications } from '../../state/notificationsContext';

const PRIORITY_CONFIG = {
  urgent: { label: 'Urgent', color: '#ef4444', bg: 'rgba(239,68,68,0.12)', border: 'rgba(239,68,68,0.25)' },
  high: { label: 'High', color: '#f97316', bg: 'rgba(249,115,22,0.12)', border: 'rgba(249,115,22,0.25)' },
  normal: { label: 'Normal', color: '#22c55e', bg: 'rgba(34,197,94,0.1)', border: 'rgba(34,197,94,0.2)' },
};

function formatTimestamp(iso) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days === 1) return 'Yesterday';
  return `${days}d ago`;
}

export default function NotificationCard({ notification }) {
  const { markAsRead, markAsUnread, deleteNotification } = useNotifications();
  const { id, title, message, timestamp, read, priority } = notification;
  const pConf = PRIORITY_CONFIG[priority] || PRIORITY_CONFIG.normal;

  return (
    <Fade in timeout={300}>
      <Card
        id={`notification-card-${id}`}
        elevation={0}
        sx={{
          background: read
            ? 'rgba(255,255,255,0.03)'
            : 'rgba(102,126,234,0.07)',
          border: read
            ? '1px solid rgba(255,255,255,0.07)'
            : '1px solid rgba(102,126,234,0.2)',
          borderRadius: 2.5,
          mb: 1.5,
          transition: 'all 0.2s ease',
          '&:hover': {
            background: read
              ? 'rgba(255,255,255,0.055)'
              : 'rgba(102,126,234,0.1)',
            transform: 'translateY(-1px)',
            boxShadow: '0 6px 20px rgba(0,0,0,0.25)',
          },
          position: 'relative',
          overflow: 'visible',
        }}
      >
        {/* Unread indicator stripe */}
        {!read && (
          <Box
            sx={{
              position: 'absolute',
              left: 0,
              top: '50%',
              transform: 'translateY(-50%)',
              width: 3,
              height: '60%',
              background: 'linear-gradient(180deg, #667eea, #764ba2)',
              borderRadius: '0 3px 3px 0',
            }}
          />
        )}

        <CardContent sx={{ p: '14px 16px !important' }}>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
            {/* Content */}
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', mb: 0.5 }}>
                <Typography
                  variant="body2"
                  fontWeight={read ? 500 : 700}
                  sx={{
                    color: read ? 'rgba(255,255,255,0.75)' : '#fff',
                    fontSize: '0.875rem',
                    lineHeight: 1.4,
                    flex: 1,
                    minWidth: 0,
                  }}
                >
                  {title}
                </Typography>

                <Chip
                  label={pConf.label}
                  size="small"
                  sx={{
                    height: 20,
                    fontSize: '0.6rem',
                    fontWeight: 700,
                    letterSpacing: '0.03em',
                    color: pConf.color,
                    background: pConf.bg,
                    border: `1px solid ${pConf.border}`,
                    '& .MuiChip-label': { px: 1 },
                    flexShrink: 0,
                  }}
                />
              </Box>

              <Typography
                variant="body2"
                sx={{
                  color: 'rgba(255,255,255,0.45)',
                  fontSize: '0.8rem',
                  lineHeight: 1.5,
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                  mb: 1,
                }}
              >
                {message}
              </Typography>

              <Typography
                variant="caption"
                sx={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.72rem' }}
              >
                {formatTimestamp(timestamp)}
              </Typography>
            </Box>

            {/* Actions */}
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: 0.5,
                flexShrink: 0,
              }}
            >
              <Tooltip title={read ? 'Mark as unread' : 'Mark as read'} placement="left">
                <IconButton
                  id={`card-toggle-read-${id}`}
                  size="small"
                  onClick={() => (read ? markAsUnread(id) : markAsRead(id))}
                  sx={{
                    color: read ? 'rgba(255,255,255,0.3)' : '#818cf8',
                    width: 30,
                    height: 30,
                    '&:hover': {
                      background: 'rgba(129,140,248,0.12)',
                      color: '#818cf8',
                    },
                  }}
                >
                  {read ? (
                    <RadioButtonUncheckedIcon sx={{ fontSize: 16 }} />
                  ) : (
                    <DoneAllIcon sx={{ fontSize: 16 }} />
                  )}
                </IconButton>
              </Tooltip>

              <Tooltip title="Delete" placement="left">
                <IconButton
                  id={`card-delete-${id}`}
                  size="small"
                  onClick={() => deleteNotification(id)}
                  sx={{
                    color: 'rgba(255,255,255,0.3)',
                    width: 30,
                    height: 30,
                    '&:hover': {
                      background: 'rgba(239,68,68,0.1)',
                      color: '#f87171',
                    },
                  }}
                >
                  <DeleteOutlinedIcon sx={{ fontSize: 16 }} />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Fade>
  );
}
