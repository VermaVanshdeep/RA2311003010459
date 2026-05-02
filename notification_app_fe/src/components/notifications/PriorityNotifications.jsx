import { Box, Typography, Chip, Tooltip, IconButton, Collapse } from '@mui/material';
import BoltIcon from '@mui/icons-material/Bolt';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import { useNotifications } from '../../state/notificationsContext';
import getPriorityNotifications from '../../utils/getPriorityNotifications';

// Top N items to surface
const TOP_N = 3;

const PRIORITY_CONFIG = {
  urgent: { label: 'Urgent', color: '#ef4444', bg: 'rgba(239,68,68,0.12)', border: 'rgba(239,68,68,0.3)', glow: 'rgba(239,68,68,0.15)' },
  high:   { label: 'High',   color: '#f97316', bg: 'rgba(249,115,22,0.12)', border: 'rgba(249,115,22,0.3)', glow: 'rgba(249,115,22,0.12)' },
  normal: { label: 'Normal', color: '#22c55e', bg: 'rgba(34,197,94,0.1)',   border: 'rgba(34,197,94,0.2)',  glow: 'rgba(34,197,94,0.08)' },
};

function formatRelativeTime(iso) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1)  return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)  return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function PriorityNotifications() {
  const { notifications, markAsRead, deleteNotification } = useNotifications();

  // Run the Stage 1 algorithm
  const topItems = getPriorityNotifications(notifications, TOP_N);

  // Don't render the section if no urgent/high notifications exist
  const hasHighOrUrgent = topItems.some(
    (n) => n.priority === 'urgent' || n.priority === 'high'
  );
  if (!hasHighOrUrgent) return null;

  return (
    <Box
      id="priority-notifications-section"
      sx={{ mb: 4 }}
    >
      {/* Section header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          mb: 1.5,
        }}
      >
        <BoltIcon
          sx={{
            fontSize: 16,
            color: '#f97316',
            filter: 'drop-shadow(0 0 4px rgba(249,115,22,0.6))',
          }}
        />
        <Typography
          variant="overline"
          sx={{
            color: '#f97316',
            fontSize: '0.65rem',
            fontWeight: 700,
            letterSpacing: '0.12em',
            lineHeight: 1,
          }}
        >
          Priority
        </Typography>
        <Chip
          label={`Top ${topItems.length}`}
          size="small"
          sx={{
            height: 18,
            fontSize: '0.6rem',
            fontWeight: 700,
            color: '#f97316',
            background: 'rgba(249,115,22,0.12)',
            border: '1px solid rgba(249,115,22,0.25)',
            '& .MuiChip-label': { px: 0.9 },
          }}
        />
      </Box>

      {/* Priority cards — compact horizontal-accent style */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        {topItems.map((n, idx) => {
          const conf = PRIORITY_CONFIG[n.priority] || PRIORITY_CONFIG.normal;
          return (
            <Collapse key={n.id} in timeout={200 + idx * 60}>
              <Box
                id={`priority-card-${n.id}`}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                  px: 1.5,
                  py: 1.25,
                  borderRadius: 2,
                  background: `linear-gradient(135deg, ${conf.glow} 0%, rgba(255,255,255,0.02) 100%)`,
                  border: `1px solid ${conf.border}`,
                  backdropFilter: 'blur(6px)',
                  transition: 'all 0.18s ease',
                  '&:hover': {
                    transform: 'translateX(3px)',
                    boxShadow: `0 4px 16px ${conf.glow}`,
                  },
                  // Left accent bar
                  borderLeft: `3px solid ${conf.color}`,
                }}
              >
                {/* Rank badge */}
                <Typography
                  sx={{
                    fontSize: '0.65rem',
                    fontWeight: 800,
                    color: conf.color,
                    minWidth: 18,
                    textAlign: 'center',
                    opacity: 0.7,
                  }}
                >
                  #{idx + 1}
                </Typography>

                {/* Text block */}
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 0.25 }}>
                    <Typography
                      variant="body2"
                      fontWeight={n.read ? 500 : 700}
                      noWrap
                      sx={{
                        color: n.read ? 'rgba(255,255,255,0.65)' : '#fff',
                        fontSize: '0.82rem',
                        flex: 1,
                        minWidth: 0,
                      }}
                    >
                      {n.title}
                    </Typography>
                    <Chip
                      label={conf.label}
                      size="small"
                      sx={{
                        height: 18,
                        fontSize: '0.58rem',
                        fontWeight: 700,
                        color: conf.color,
                        background: conf.bg,
                        border: `1px solid ${conf.border}`,
                        flexShrink: 0,
                        '& .MuiChip-label': { px: 0.8 },
                      }}
                    />
                  </Box>
                  <Typography
                    variant="caption"
                    sx={{
                      color: 'rgba(255,255,255,0.35)',
                      fontSize: '0.7rem',
                      display: 'block',
                      overflow: 'hidden',
                      whiteSpace: 'nowrap',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {formatRelativeTime(n.timestamp)}
                    {n.category && (
                      <Box component="span" sx={{ ml: 0.75, opacity: 0.6 }}>
                        · {n.category}
                      </Box>
                    )}
                  </Typography>
                </Box>

                {/* Actions */}
                <Box sx={{ display: 'flex', gap: 0.25, flexShrink: 0 }}>
                  {!n.read && (
                    <Tooltip title="Mark as read" placement="top">
                      <IconButton
                        id={`priority-read-${n.id}`}
                        size="small"
                        onClick={() => markAsRead(n.id)}
                        sx={{
                          width: 26,
                          height: 26,
                          color: 'rgba(255,255,255,0.3)',
                          '&:hover': {
                            color: '#818cf8',
                            background: 'rgba(129,140,248,0.1)',
                          },
                        }}
                      >
                        <DoneAllIcon sx={{ fontSize: 13 }} />
                      </IconButton>
                    </Tooltip>
                  )}
                  <Tooltip title="Dismiss" placement="top">
                    <IconButton
                      id={`priority-delete-${n.id}`}
                      size="small"
                      onClick={() => deleteNotification(n.id)}
                      sx={{
                        width: 26,
                        height: 26,
                        color: 'rgba(255,255,255,0.3)',
                        '&:hover': {
                          color: '#f87171',
                          background: 'rgba(239,68,68,0.08)',
                        },
                      }}
                    >
                      <DeleteOutlinedIcon sx={{ fontSize: 13 }} />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>
            </Collapse>
          );
        })}
      </Box>

      {/* Divider */}
      <Box
        sx={{
          mt: 2.5,
          borderBottom: '1px solid rgba(255,255,255,0.07)',
        }}
      />
    </Box>
  );
}
