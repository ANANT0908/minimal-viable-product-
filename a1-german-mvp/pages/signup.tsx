'use client';

import { useState } from 'react';
import { useRouter } from 'next/router';
import {
  createUserWithEmailAndPassword,
  signInWithPopup,
} from 'firebase/auth';
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
} from '@mui/material';

export default function Signup() {
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [gen, setGen] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const router = useRouter();
  const { t, i18n } = useTranslation();

  const validateInputs = () => {
    if (!email || !pass || !gen) {
      toast.error(t('auth.signup.error.required_fields'));
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error(t('auth.signup.error.invalid_email'));
      return false;
    }

    if (pass.length < 6) {
      toast.error(t('auth.signup.error.weak_password'));
      return false;
    }

    if (gen !== 'female') {
      toast.error(t('auth.signup.only_female'));
      return false;
    }

    return true;
  };

  const handleSignup = async () => {
    if (!validateInputs()) return;

    setLoading(true);
    try {
      const userCred = await createUserWithEmailAndPassword(auth, email, pass);
      await setDoc(doc(db, 'users', userCred.user.uid), {
        email,
        gender: gen,
        progress: [],
        enrolledCourse: 'A1',
        createdAt: new Date().toISOString(),
      });
      toast.success(t('auth.signup.success'));
      router.push(`/${i18n.language}/dashboard`);
    } catch (error: any) {
      const errors: Record<string, string> = {
        'auth/email-already-in-use': t('auth.signup.error.email_in_use'),
        'auth/weak-password': t('auth.signup.error.weak_password'),
        'auth/invalid-email': t('auth.signup.error.invalid_email'),
      };
      toast.error(errors[error.code] || t('auth.signup.error.default'));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const existingData = userSnap.data();
        if (existingData.gender !== 'female') {
          toast.error(t('auth.signup.only_female'));
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

      toast.success(t('auth.login.success'));
      router.push(`/${i18n.language}/dashboard`);
    } catch (err: any) {
      const errors: Record<string, string> = {
        'auth/popup-closed-by-user': t('auth.signup.error.popup_closed'),
        'auth/cancelled-popup-request': t('auth.signup.error.popup_cancelled'),
      };
      toast.error(errors[err.code] || t('auth.signup.error.google'));
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <Box
      sx={{
        width: '40%',
        minWidth: 350,
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
        {t('auth.signup.title')}
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

        <FormControl fullWidth>
          <InputLabel>{t('common.gender')}</InputLabel>
          <Select
            value={gen}
            onChange={(e) => setGen(e.target.value)}
            label={t('common.gender')}
          >
            <MenuItem value="">{t('common.gender')}</MenuItem>
            <MenuItem value="female">{t('common.female')}</MenuItem>
            <MenuItem value="male">{t('common.male')}</MenuItem>
          </Select>
        </FormControl>

        <Button
          variant="contained"
          onClick={handleSignup}
          fullWidth
          sx={{ py: 1.5 }}
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} color="inherit" /> : t('auth.signup.title')}
        </Button>

        <Button
          onClick={handleGoogleSignIn}
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
        {t('auth.signup.already_have_account')}{' '}
        <Link href={`/${i18n.language}/login`}>
          <Typography component="span" color="primary" fontWeight="bold">
            {t('auth.login.title')}
          </Typography>
        </Link>
      </Typography>
    </Box>
  );
}
