'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { createUserWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db, googleProvider } from '@/lib/firebase';
import { useTranslation } from 'react-i18next';
import Link from 'next/link';
import toast from 'react-hot-toast';

import {
  Box,
  TextField,
  Select,
  MenuItem,
  Button,
  Typography,
  Stack,
  InputLabel,
  FormControl,
  CircularProgress,
  useTheme,
} from '@mui/material';


export default function Signup() {
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [gen, setGen] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const inputRef = useRef<HTMLInputElement>(null);
  const theme = useTheme();

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const validate = () => {
    if (!email || !pass || !gen) {
      return toast.error('⚠️ ' + t('auth.signup.error.required_fields'));
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return toast.error('✉️ ' + t('auth.signup.error.invalid_email'));
    }
    if (pass.length < 6) {
      return toast.error('🔐 ' + t('auth.signup.error.weak_password'));
    }
    if (gen !== 'female') {
      return toast.error('🚫 ' + t('auth.signup.only_female'));
    }
    return true;
  };

  const handleSignup = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, pass);
      await setDoc(doc(db, 'users', cred.user.uid), {
        email,
        gender: gen,
        progress: [],
        enrolledCourse: 'A1',
        createdAt: new Date().toISOString(),
      });
      toast.success('🎉 ' + t('auth.signup.success'));
      router.push(`/${i18n.language}/dashboard`);
    } catch (err: any) {
      const errs: Record<string, string> = {
        'auth/email-already-in-use': t('auth.signup.error.email_in_use'),
        'auth/weak-password': t('auth.signup.error.weak_password'),
        'auth/invalid-email': t('auth.signup.error.invalid_email'),
      };
      toast.error(errs[err.code] || '❌ ' + t('auth.signup.error.default'));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setGoogleLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      const userRef = doc(db, 'users', user.uid);
      const snap = await getDoc(userRef);

      if (snap.exists()) {
        const data = snap.data();
        if (data.gender !== 'female') {
          toast.error('🚫 ' + t('auth.signup.only_female'));
          return;
        }
      } else {
        await setDoc(userRef, {
          email: user.email,
          gender: 'female',
          progress: [],
          enrolledCourse: 'A1',
          createdAt: new Date().toISOString(),
        });
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
    if (e.key === 'Enter') handleSignup();
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
          {t('auth.signup.title')}
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
              type="password"
              label={t('common.password')}
              value={pass}
              onChange={(e) => setPass(e.target.value)}
              onKeyDown={handleKey}
              fullWidth
            />

          <FormControl fullWidth>
            <InputLabel>{t('common.gender')}</InputLabel>
            <Select
              value={gen}
              onChange={(e) => setGen(e.target.value)}
              label={t('common.gender')}
            >
              <MenuItem value="female">{t('common.female')}</MenuItem>
              <MenuItem value="male" disabled>
                {t('common.male')} 🚫
              </MenuItem>
            </Select>
          </FormControl>

          <Button
            variant="contained"
            onClick={handleSignup}
            fullWidth
            disabled={loading}
            sx={{ py: 1.5 }}
          >
            {loading ? <CircularProgress size={24} /> : t('auth.signup.title')}
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
          {t('auth.signup.already_have_account')}{' '}
          <Link href={`/${i18n.language}/login`} passHref>
            <Typography
              component="span"
              color="primary"
              fontWeight="bold"
              sx={{ cursor: 'pointer', textDecoration: 'underline' }}
            >
              {t('auth.login.title')}
            </Typography>
          </Link>
        </Typography>
      </Box>
    </Box>
  );
}
