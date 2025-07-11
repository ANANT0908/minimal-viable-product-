import { useState } from 'react';
import { useRouter } from 'next/router';
import {
  createUserWithEmailAndPassword,
  signInWithPopup,
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db, googleProvider } from '@/src/lib/firebase';
import { useTranslation } from 'react-i18next';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function Signup() {
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [gen, setGen] = useState('');
  const router = useRouter();
  const { t } = useTranslation();

  const handleSignup = async () => {
    if (gen !== 'female') {
      toast.error(t('auth.signup.only_female'));
      return;
    }

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
      router.push('/dashboard');
    } 
    catch (error: any) {
      let message = t('auth.signup.error.default');
      if (error?.code) {
        switch (error.code) {
          case 'auth/email-already-in-use':
            message = t('auth.signup.error.email_in_use');
            break;
          case 'auth/weak-password':
            message = t('auth.signup.error.weak_password');
            break;
          case 'auth/invalid-email':
            message = t('auth.signup.error.invalid_email');
            break;
        }
      }

      toast.error(message);
    }
  };

  const handleGoogleSignIn = async () => {
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
      router.push('/dashboard');
    } catch (err: any) {
      let message = t('auth.signup.error.google');

      if (err) {
        switch (err.code) {
          case 'auth/popup-closed-by-user':
            message = t('auth.signup.error.popup_closed');
            break;
          case 'auth/cancelled-popup-request':
            message = t('auth.signup.error.popup_cancelled');
            break;
        }
      }

      toast.error(message);
    }
  };

  return (
    <div className="container card">
      <h2>{t('auth.signup.title')}</h2>

      <input
        type="email"
        placeholder={t('common.email')}
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <input
        type="password"
        placeholder={t('common.password')}
        value={pass}
        onChange={(e) => setPass(e.target.value)}
      />

      <select value={gen} onChange={(e) => setGen(e.target.value)}>
        <option value="">{t('common.gender')}</option>
        <option value="female">{t('common.female')}</option>
        <option value="male">{t('common.male')}</option>
      </select>

      <button onClick={handleSignup}>{t('auth.signup.title')}</button>

      <button className="button-google" onClick={handleGoogleSignIn}>
        <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google Icon" />
        {t('auth.login.google')}
      </button>

      <p style={{ marginTop: '1rem' }}>
        {t('auth.signup.already_have_account')}{' '}
        <Link href="/login">{t('auth.login.title')}</Link>
      </p>
    </div>
  );
}
