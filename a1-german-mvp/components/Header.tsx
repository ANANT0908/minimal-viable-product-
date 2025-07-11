'use client';

import React, { useEffect, useState, useCallback, ReactNode } from 'react';
import { useRouter } from 'next/router';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Select,
  MenuItem,
  SelectChangeEvent,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import i18next from 'i18next';
import LogoutButton from './LogoutButton';
import { auth } from '@/lib/firebase';
import toast from 'react-hot-toast';

interface HeaderProps {
  children: ReactNode;
}

const LANGUAGE_OPTIONS = [
  { code: 'en', label: '🇺🇸 English' },
  { code: 'de', label: '🇩🇪 Deutsch' },
];

const Header: React.FC<HeaderProps> = ({ children }) => {
  const { i18n, t } = useTranslation();
  const router = useRouter();
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const isDashboard = router.pathname === '/dashboard';

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUserEmail(user?.email ?? null);
    });
    return () => unsubscribe();
  }, []);

  const changeLanguage = useCallback(
    async (lng: string) => {
      try {
        await i18next.changeLanguage(lng);
        router.replace(router.pathname, router.asPath, { locale: lng });
      } catch {
        toast.error(t('error.language_switch') || 'Failed to change language.');
      }
    },
    [router, t]
  );

  return (
    <Box
      sx={{
        width: '100vw',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: '#f9fafb',
      }}
    >
      <AppBar position="static" color="default" elevation={1}>
        <Toolbar
          sx={{
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: { xs: 'flex-start', sm: 'center' },
            justifyContent: 'space-between',
            px: { xs: 2, sm: 3, md: 4 },
            py: { xs: 1, sm: 2 },
            gap: { xs: 1, sm: 0 },
          }}
        >
          <Typography
            variant="h6"
            fontWeight={600}
            sx={{
              fontSize: { xs: '1rem', sm: '1.25rem', md: '1.5rem' },
              mb: { xs: 1, sm: 0 },
            }}
          >
            🚀 {t('course.title')}
          </Typography>

          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              alignItems: { xs: 'flex-start', sm: 'center' },
              gap: { xs: 1, sm: 2 },
              width: { xs: '100%', sm: 'auto' },
            }}
          >
            <Select
              value={i18n.language}
              onChange={(e: SelectChangeEvent) => changeLanguage(e.target.value)}
              variant="outlined"
              size="small"
              sx={{
                minWidth: { xs: '100%', sm: 140 },
                bgcolor: '#fff',
                borderRadius: 1,
              }}
            >
              {LANGUAGE_OPTIONS.map((lang) => (
                <MenuItem key={lang.code} value={lang.code}>
                  {lang.label}
                </MenuItem>
              ))}
            </Select>

            {userEmail && (
              <Typography
                variant="body2"
                sx={{
                  color: '#4b5563',
                  fontSize: { xs: '0.85rem', sm: '0.95rem' },
                  whiteSpace: 'nowrap',
                }}
              >
                {t('course.welcome', { email: userEmail })}
              </Typography>
            )}

            {isDashboard && <LogoutButton />}
          </Box>
        </Toolbar>
      </AppBar>
        {children}
    </Box>
  );
};

export default Header;
