import { useState } from 'react';
import { useRouter } from 'next/router';
import { createUserWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db, googleProvider } from '@/lib/firebase';
import { useTranslation } from 'react-i18next';
import Link from 'next/link';

export default function Signup() {
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [gen, setGen] = useState('');
  const router = useRouter();
  const { t } = useTranslation('common');

  const handleSignup = async () => {
    if (gen !== 'female') {
      alert(t('only_female'));
      return;
    }

    try {
      const userCred = await createUserWithEmailAndPassword(auth, email, pass);
      console.log(userCred, "userCred")
      await setDoc(doc(db, 'users', userCred.user.uid), {
        email,
        gender: gen,
        progress: [],
        enrolledCourse: 'A1',
        createdAt: new Date().toISOString(),
      });
      console.log("strp")
      router.push('/dashboard');
    } catch (error) {
      console.error("Signup error:", error);
      alert(error); 
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      await setDoc(doc(db, 'users', user.uid), {
        email: user.email,
        gender: 'female',
        progress: [],
        enrolledCourse: 'A1',
        createdAt: new Date().toISOString(),
      });
      router.push('/dashboard');
    } catch (err: any) {
      alert(err.message);
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
