'use client';

import { useState } from 'react';
import { useRouter } from 'next/router';
import { signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '@/lib/firebase';
import { useTranslation } from 'react-i18next';
import { ensureUserDocumentExists } from '@/lib/ensureUserDocumentExists';
import toast from 'react-hot-toast';
import Link from 'next/link';

import {
  Box,
  TextField,
  Button,
  Typography,
  Stack,
  CircularProgress,
} from '@mui/material';

export default function Login() {
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const router = useRouter();
  const { t, i18n } = useTranslation();

  const handleLogin = async () => {
    setLoading(true);
    try {
      const result = await signInWithEmailAndPassword(auth, email, pass);
      await ensureUserDocumentExists(result.user);
      toast.success(t('auth.login.success'));
      router.push(`/${i18n.language}/dashboard`);
    } catch (err: any) {
      const errors: Record<string, string> = {
        'auth/user-not-found': t('auth.login.error.user_not_found'),
        'auth/wrong-password': t('auth.login.error.wrong_password'),
        'auth/too-many-requests': t('auth.login.error.too_many_requests'),
        'auth/popup-closed-by-user': t('auth.login.error.popup_closed'),
        'auth/network-request-failed': t('auth.login.error.network_failed'),
      };
      toast.error(errors[err.code] || t('auth.login.error.default'));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      await ensureUserDocumentExists(result.user);
      toast.success(t('auth.login.success_google'));
      router.push(`/${i18n.language}/dashboard`);
    } catch (err: any) {
      toast.error(t('auth.login.error.google') || err.message);
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <Box
      sx={{
        width: '40%',
        mx: 'auto',
        mt: 6,
        p: 4,
        backgroundColor: 'background.paper',
        borderRadius: 3,
        boxShadow: 3,
        textAlign: 'center',
      }}
    >
      <Typography variant="h5" mb={3}>
        {t('auth.login.title')}
      </Typography>

      <Stack spacing={2}>
        <TextField
          type="email"
          label={t('common.email')}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          fullWidth
        />

        <TextField
          type="password"
          label={t('common.password')}
          value={pass}
          onChange={(e) => setPass(e.target.value)}
          fullWidth
        />

        <Button
          variant="contained"
          onClick={handleLogin}
          fullWidth
          sx={{ py: 1.5 }}
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} color="inherit" /> : t('auth.login.button')}
        </Button>

        <Button
          onClick={handleGoogleLogin}
          fullWidth
          disabled={googleLoading}
          sx={{
            py: 1.5,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px solid #d1d5db',
            backgroundColor: '#fff',
            color: '#000',
            '&:hover': {
              backgroundColor: '#f5f5f5',
            },
          }}
        >
          {googleLoading ? (
            <CircularProgress size={20} />
          ) : (
            <>
              <img
                src="https://www.svgrepo.com/show/475656/google-color.svg"
                alt="Google Icon"
                width={20}
                style={{ marginRight: 8 }}
              />
              {t('auth.login.google')}
            </>
          )}
        </Button>
      </Stack>

      <Typography mt={3}>
        {t('auth.login.no_account')}{' '}
        <Link href={`/${i18n.language}/signup`}>
          <Typography component="span" color="primary" fontWeight="bold">
            {t('auth.signup.title')}
          </Typography>
        </Link>
      </Typography>
    </Box>
  );
}
