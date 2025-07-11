import { useState } from 'react';
import { useRouter } from 'next/router';
import { signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '@/lib/firebase';
import { useTranslation } from 'react-i18next';
import { ensureUserDocumentExists } from '@/lib/ensureUserDocumentExists';
import toast from 'react-hot-toast';
import Link from 'next/link';

export default function Login() {
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const router = useRouter();
  const { t, i18n } = useTranslation();

  const handleLogin = async () => {
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
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      await ensureUserDocumentExists(result.user);
      toast.success(t('auth.login.success_google'));
      router.push(`/${i18n.language}/dashboard`);
    } catch (err: any) {
      toast.error(t('auth.login.error.google') || err.message);
    }
  };

  return (
    <div style={containerStyle}>
      <h2>{t('auth.login.title')}</h2>
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
      <button onClick={handleLogin} style={primaryButtonStyle}>
        {t('auth.login.button')}
      </button>

      <button className="button-google" onClick={handleGoogleLogin}>
        <img
          src="https://www.svgrepo.com/show/475656/google-color.svg"
          alt="Google Icon"
          width={20}
          style={{ marginRight: 8 }}
        />
        {t('auth.login.google')}
      </button>

      <p style={{ marginTop: '1rem' }}>
        {t('auth.login.no_account')}{' '}
        <Link href={`/${i18n.language}/signup`}>{t('auth.signup.title')}</Link>
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
  boxSizing: 'border-box' as const,
};

const primaryButtonStyle = {
  width: '100%',
  padding: '0.75rem',
  backgroundColor: '#3b82f6',
  color: '#fff',
  border: 'none',
  borderRadius: '8px',
  fontSize: '1rem',
  cursor: 'pointer',
  marginBottom: '1rem',
};
