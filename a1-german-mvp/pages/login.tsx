'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db, googleProvider } from '@/lib/firebase';
import { useTranslation } from 'react-i18next';
import Link from 'next/link';
import toast from 'react-hot-toast';

import {
  Box,
  TextField,
  Button,
  Typography,
  Stack,
  CircularProgress,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { InputAdornment, IconButton } from '@mui/material';


export default function Login() {
  const [email, setEmail] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [pass, setPass] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleLogin = async () => {
    if (!email || !pass) {
      return toast.error('⚠️ ' + t('auth.login.error.required_fields'));
    }

    setLoading(true);
    try {
      const result = await signInWithEmailAndPassword(auth, email, pass);
      const userRef = doc(db, 'users', result.user.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists() || userSnap.data()?.gender !== 'female') {
        toast.error('🚫 ' + t('auth.signup.only_female'));
        return;
      }

      toast.success('✅ ' + t('auth.login.success'));
      router.push(`/${i18n.language}/dashboard`);
    } catch (err: any) {
      const errs: Record<string, string> = {
        'auth/wrong-password': t('auth.login.error.wrong_password'),
        'auth/user-not-found': t('auth.login.error.user_not_found'),
        'auth/invalid-email': t('auth.login.error.invalid_email'),
      };
      toast.error(errs[err.code] || '❌ ' + t('auth.login.error.default'));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setGoogleLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const userRef = doc(db, 'users', result.user.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        await auth.signOut();
        toast.error(t('auth.signup.error.google_not_signed_up'));
        return;
      }

      const data = userSnap.data();
      if (data.gender !== 'female') {
        await auth.signOut();

        toast.error('🚫 ' + t('auth.signup.only_female'));
        return;
      }

      toast.success('✅ ' + t('auth.login.success'));
      router.push(`/${i18n.language}/dashboard`);
    } catch (err: any) {
      const errs: Record<string, string> = {
        'auth/popup-closed-by-user': t('auth.signup.error.popup_closed'),
        'auth/cancelled-popup-request': t('auth.signup.error.popup_cancelled'),
      };
      toast.error(errs[err.code] || '⚠️ ' + t('auth.signup.error.google'));
    } finally {
      setGoogleLoading(false);
    }
  };


  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleLogin();
  };

  return (
    <Box
      sx={{
        minHeight: '89.5vh',
        background: 'linear-gradient(135deg, #f0f4f8, #d9e2ec)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2,
      }}
    >
      <Box
        sx={{
          backdropFilter: 'blur(12px)',
          backgroundColor: 'rgba(255,255,255,0.8)',
          p: 4,
          borderRadius: 4,
          boxShadow: 8,
          maxWidth: 420,
          width: '100%',
          textAlign: 'center',
        }}
      >
        <Typography variant="h5" fontWeight="bold" mb={3}>
          {t('auth.login.title')}
        </Typography>

        <Stack spacing={2}>
          <TextField
            type="email"
            label={t('common.email')}
            value={email}
            inputRef={inputRef}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={handleKey}
            fullWidth
          />
          <TextField
            type={showPassword ? 'text' : 'password'}
            label={t('common.password')}
            value={pass}
            onChange={(e) => setPass(e.target.value)}
            onKeyDown={handleKey}
            fullWidth
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />


          <Button
            variant="contained"
            onClick={handleLogin}
            fullWidth
            disabled={loading}
            sx={{ py: 1.5 }}
          >
            {loading ? <CircularProgress size={24} /> : t('auth.login.title')}
          </Button>

          <Button
            variant="outlined"
            onClick={handleGoogle}
            fullWidth
            disabled={googleLoading}
            startIcon={
              !googleLoading && (
                <img
                  src="https://www.svgrepo.com/show/475656/google-color.svg"
                  alt="Google"
                  width={20}
                />
              )
            }
            sx={{
              py: 1.5,
              bgcolor: '#fff',
              '&:hover': { bgcolor: '#f5f5f5' },
            }}
          >
            {googleLoading ? <CircularProgress size={20} /> : t('auth.login.google')}
          </Button>
        </Stack>

        <Typography mt={3}>
          {t('auth.login.no_account')}{' '}
          <Link href={`/${i18n.language}/signup`} passHref>
            <Typography
              component="span"
              color="primary"
              fontWeight="bold"
              sx={{ cursor: 'pointer', textDecoration: 'underline' }}
            >
              {t('auth.signup.title')}
            </Typography>
          </Link>
        </Typography>
      </Box>
    </Box>
  );
}
