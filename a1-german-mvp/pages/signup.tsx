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

export default function Signup() {
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [gen, setGen] = useState('');
  const router = useRouter();
  const { t, i18n } = useTranslation();

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
      router.push(`/${i18n.language}/dashboard`);
    } catch (error: any) {
      const errors: Record<string, string> = {
        'auth/email-already-in-use': t('auth.signup.error.email_in_use'),
        'auth/weak-password': t('auth.signup.error.weak_password'),
        'auth/invalid-email': t('auth.signup.error.invalid_email'),
      };
      toast.error(errors[error.code] || t('auth.signup.error.default'));
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
      router.push(`/${i18n.language}/dashboard`);
    } catch (err: any) {
      const errors: Record<string, string> = {
        'auth/popup-closed-by-user': t('auth.signup.error.popup_closed'),
        'auth/cancelled-popup-request': t('auth.signup.error.popup_cancelled'),
      };
      toast.error(errors[err.code] || t('auth.signup.error.google'));
    }
  };

  return (
    <div style={containerStyle}>
      <h2>{t('auth.signup.title')}</h2>

      <input
        type="email"
        placeholder={t('common.email')}
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={inputStyle}
      />

      <input
        type="password"
        placeholder={t('common.password')}
        value={pass}
        onChange={(e) => setPass(e.target.value)}
        style={inputStyle}
      />

      <select value={gen} onChange={(e) => setGen(e.target.value)} style={inputStyle}>
        <option value="">{t('common.gender')}</option>
        <option value="female">{t('common.female')}</option>
        <option value="male">{t('common.male')}</option>
      </select>

      <button onClick={handleSignup} style={primaryButtonStyle}>
        {t('auth.signup.title')}
      </button>

      <button className="button-google" onClick={handleGoogleSignIn}>
        <img
          src="https://www.svgrepo.com/show/475656/google-color.svg"
          alt="Google Icon"
          width={20}
          style={{ marginRight: 8 }}
        />
        {t('auth.login.google')}
      </button>

      <p style={{ marginTop: '1rem' }}>
        {t('auth.signup.already_have_account')}{' '}
        <Link href={`/${i18n.language}/login`}>{t('auth.login.title')}</Link>
      </p>
    </div>
  );
}

const containerStyle = {
  maxWidth: '400px',
  margin: '5rem auto',
  padding: '2rem',
  backgroundColor: '#ffffff',
  borderRadius: '12px',
  boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
  textAlign: 'center' as const,
};

const inputStyle = {
  width: '100%',
  padding: '0.75rem',
  borderRadius: '8px',
  border: '1px solid #d1d5db',
  marginBottom: '1rem',
  fontSize: '1rem',
};

const primaryButtonStyle = {
  width: '100%',
  padding: '0.75rem',
  backgroundColor: '#10b981',
  color: '#fff',
  border: 'none',
  borderRadius: '8px',
  fontSize: '1rem',
  cursor: 'pointer',
  marginBottom: '1rem',
};
