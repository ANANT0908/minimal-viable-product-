'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { Box, CircularProgress, Typography } from '@mui/material';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    if (!router.isReady) return;
    router.replace('/signup');
  }, [router]);

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      height="100vh"
      flexDirection="column"
    >
      <CircularProgress />
      <Typography variant="body1" mt={2}>
        Redirecting...
      </Typography>
    </Box>
  );
}
