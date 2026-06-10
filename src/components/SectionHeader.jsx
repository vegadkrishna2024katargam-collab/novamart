import { Box, Typography } from '@mui/material';

export default function SectionHeader({ eyebrow, title, action }) {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, gap: 2, mb: 3, flexDirection: { xs: 'column', sm: 'row' } }}>
      <Box>
        {eyebrow && <Typography color="primary" fontWeight={800} variant="overline">{eyebrow}</Typography>}
        <Typography variant="h4">{title}</Typography>
      </Box>
      {action}
    </Box>
  );
}
