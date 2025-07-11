'use client';

import React, { useCallback } from 'react';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/router';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { Button } from '@mui/material';

const LogoutButton: React.FC = () => {
  const router = useRouter();
  const { t } = useTranslation('common');

  const handleLogout = useCallback(async () => {
    try {
      await signOut(auth);
      router.push('/');
    } catch (error: any) {
      toast.error(`${t('logout_failed')}: ${error?.message || 'Unknown error'}`);
    }
  }, [router, t]);

  return (
    <Button
      onClick={handleLogout}
      variant="contained"
      color="error"
      sx={{
        textTransform: 'none',
        fontWeight: 500,
        borderRadius: '0.5rem',
        boxShadow: 2,
        px: 2.5,
        py: 1,
        fontSize: '0.95rem',
        '&:hover': {
          backgroundColor: '#c62828',
        },
      }}
      aria-label={t('logout')}
    >
      {t('logout')}
    </Button>
  );
};

export default LogoutButton;
