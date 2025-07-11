'use client';
import React, { useEffect, useState, ReactNode } from 'react';
import { useRouter } from 'next/router';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import { useTranslation } from 'react-i18next';
import i18next from 'i18next';
import LogoutButton from './LogoutButton';
import { auth } from '@/lib/firebase';
import toast from 'react-hot-toast';

interface HeaderProps {
  children: ReactNode;
}

const Header: React.FC<HeaderProps> = ({ children }) => {
  const { i18n, t } = useTranslation();
  const router = useRouter();
  const isDashboard = router.pathname === '/dashboard';
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUserEmail(user?.email ?? null);
    });
    return () => unsubscribe();
  }, []);

  const changeLanguage = async (lng: string) => {
    try {
      await i18next.changeLanguage(lng);
      router.replace(router.pathname, router.asPath, { locale: lng });
    } catch (err) {
      toast.error(t('error.language_switch') || 'Language change failed.');
    }
  };

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
            gap: { xs: 1, sm: 0 },
            px: { xs: 2, sm: 3, md: 4 },
            py: { xs: 1, sm: 2 },
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
              onChange={(e) => changeLanguage(e.target.value)}
              variant="outlined"
              size="small"
              sx={{
                minWidth: { xs: '100%', sm: 130 },
                bgcolor: '#fff',
                borderRadius: 1,
              }}
            >
              <MenuItem value="en">🇺🇸 {t('common.english')}</MenuItem>
              <MenuItem value="de">🇩🇪 {t('common.german')}</MenuItem>
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

      <Box
        component="main"
        sx={{
          flex: 1,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'flex-start',
          px: { xs: 2, sm: 4, md: 6 },
          pt: { xs: 2, sm: 3 },
          overflowY: 'auto',
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default Header;
