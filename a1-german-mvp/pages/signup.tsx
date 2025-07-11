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
import { FirebaseError } from 'firebase/app';

export default function Signup() {
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [gen, setGen] = useState('');
  const router = useRouter();
  const { t } = useTranslation('common');

  const handleSignup = async () => {
    if (gen !== 'female') {
      toast.error(t('only_female') || 'Only female users are allowed to sign up.');
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

      toast.success('Signup successful!');
      router.push('/dashboard');
    } catch (error: any) {
      let message = 'Signup failed. Please try again.';

      if (error instanceof FirebaseError) {
        switch (error.code) {
          case 'auth/email-already-in-use':
            message = 'This email is already registered.';
            break;
          case 'auth/weak-password':
            message = 'Password should be at least 6 characters.';
            break;
          case 'auth/invalid-email':
            message = 'Invalid email address.';
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
          toast.error('Only female users are allowed to sign in.');
          return;
        }
      } else {
        // New user → default to female
        await setDoc(userRef, {
          email: user.email,
          gender: 'female',
          progress: [],
          enrolledCourse: 'A1',
          createdAt: new Date().toISOString(),
        });
      }

      toast.success('Login successful!');
      router.push('/dashboard');
    } catch (err: any) {
      let message = 'Google sign-in failed. Please try again.';

      if (err instanceof FirebaseError) {
        switch (err.code) {
          case 'auth/popup-closed-by-user':
            message = 'Google sign-in popup was closed.';
            break;
          case 'auth/cancelled-popup-request':
            message = 'Google sign-in was cancelled.';
            break;
        }
      }

      toast.error(message);
    }
  };

  return (
    <div className="container card">
      <h2>{t('signup')}</h2>

      <input
        type="email"
        placeholder={t('email')}
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <input
        type="password"
        placeholder={t('password')}
        value={pass}
        onChange={(e) => setPass(e.target.value)}
      />

      <select value={gen} onChange={(e) => setGen(e.target.value)}>
        <option value="">{t('gender')}</option>
        <option value="female">{t('female')}</option>
        <option value="male">{t('male')}</option>
      </select>

      <button onClick={handleSignup}>{t('signup')}</button>

      <button className="button-google" onClick={handleGoogleSignIn}>
        <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google Icon" />
        Continue with Google
      </button>

      <p style={{ marginTop: '1rem' }}>
        {t('already_have_account')} <Link href="/login">{t('login')}</Link>
      </p>
    </div>
  );
}
