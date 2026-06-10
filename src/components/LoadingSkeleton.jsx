import { Grid, Skeleton } from '@mui/material';

export default function LoadingSkeleton({ count = 4 }) {
  return (
    <Grid container spacing={3}>
      {Array.from({ length: count }).map((_, index) => (
        <Grid item xs={12} sm={6} md={3} key={index}>
          <Skeleton variant="rounded" height={280} />
          <Skeleton sx={{ mt: 1 }} />
          <Skeleton width="60%" />
        </Grid>
      ))}
    </Grid>
  );
}
