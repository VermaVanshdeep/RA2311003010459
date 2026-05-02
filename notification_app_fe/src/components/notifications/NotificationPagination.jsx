import { Box, IconButton, Typography, Tooltip } from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { useNotifications } from '../../state/notificationsContext';

export default function NotificationPagination() {
  const { page, totalPages, goToPage, loading } = useNotifications();

  // Don't render if there's only one page
  if (totalPages <= 1) return null;

  const isFirst = page === 1;
  const isLast  = page === totalPages;

  const btnSx = (disabled) => ({
    width: 34,
    height: 34,
    border: `1px solid ${disabled ? 'rgba(255,255,255,0.08)' : 'rgba(129,140,248,0.3)'}`,
    borderRadius: 1.5,
    color: disabled ? 'rgba(255,255,255,0.2)' : '#818cf8',
    background: disabled ? 'transparent' : 'rgba(129,140,248,0.07)',
    transition: 'all 0.18s ease',
    '&:hover': disabled ? {} : {
      background: 'rgba(129,140,248,0.15)',
      borderColor: 'rgba(129,140,248,0.5)',
      transform: 'scale(1.05)',
    },
  });

  return (
    <Box
      id="notification-pagination"
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
        mt: 3,
        pt: 2.5,
        borderTop: '1px solid rgba(255,255,255,0.07)',
      }}
    >
      {/* Previous */}
      <Tooltip title="Previous page" placement="top">
        <span>
          <IconButton
            id="pagination-prev-btn"
            size="small"
            onClick={() => goToPage(page - 1)}
            disabled={isFirst || loading}
            sx={btnSx(isFirst || loading)}
          >
            <ChevronLeftIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </span>
      </Tooltip>

      {/* Page indicator */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
        {/* Page numbers — show up to 5 around current */}
        {buildPageRange(page, totalPages).map((item) =>
          item === '…' ? (
            <Typography
              key={`ellipsis-${Math.random()}`}
              variant="caption"
              sx={{ color: 'rgba(255,255,255,0.25)', px: 0.5, lineHeight: 1 }}
            >
              …
            </Typography>
          ) : (
            <Box
              key={item}
              id={`pagination-page-${item}`}
              onClick={() => !loading && goToPage(item)}
              sx={{
                width: 30,
                height: 30,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 1.5,
                cursor: loading ? 'not-allowed' : 'pointer',
                fontSize: '0.78rem',
                fontWeight: item === page ? 700 : 400,
                color: item === page ? '#fff' : 'rgba(255,255,255,0.4)',
                background: item === page
                  ? 'linear-gradient(135deg, rgba(102,126,234,0.5) 0%, rgba(118,75,162,0.5) 100%)'
                  : 'transparent',
                border: item === page
                  ? '1px solid rgba(129,140,248,0.4)'
                  : '1px solid transparent',
                transition: 'all 0.15s ease',
                '&:hover': item === page || loading ? {} : {
                  background: 'rgba(255,255,255,0.06)',
                  color: '#fff',
                },
              }}
            >
              {item}
            </Box>
          )
        )}
      </Box>

      {/* Next */}
      <Tooltip title="Next page" placement="top">
        <span>
          <IconButton
            id="pagination-next-btn"
            size="small"
            onClick={() => goToPage(page + 1)}
            disabled={isLast || loading}
            sx={btnSx(isLast || loading)}
          >
            <ChevronRightIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </span>
      </Tooltip>
    </Box>
  );
}

/**
 * Builds a compact page range array with ellipsis for large page counts.
 * E.g. page=5, total=12 → [1, '…', 4, 5, 6, '…', 12]
 *
 * @param {number} current
 * @param {number} total
 * @returns {(number|string)[]}
 */
function buildPageRange(current, total) {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const range = new Set([1, total, current]);
  if (current > 1) range.add(current - 1);
  if (current < total) range.add(current + 1);

  const sorted = [...range].sort((a, b) => a - b);
  const result = [];

  for (let i = 0; i < sorted.length; i++) {
    if (i > 0 && sorted[i] - sorted[i - 1] > 1) {
      result.push('…');
    }
    result.push(sorted[i]);
  }

  return result;
}
