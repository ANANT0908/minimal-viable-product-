import { useState } from 'react';
import { signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '@/src/lib/firebase';
import { useRouter } from 'next/router';
import { useTranslation } from 'react-i18next';
import { ensureUserDocumentExists } from '@/src/lib/ensureUserDocumentExists';
import toast from 'react-hot-toast';

export default function Login() {
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const router = useRouter();
  const { t } = useTranslation();

  const handleLogin = async () => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, pass);
      const user = result.user;
      await ensureUserDocumentExists(user);
      toast.success(t('auth.login.success'));
      router.push('/dashboard');
    } catch (err: any) {
      let message = t('auth.login.error.default');

      if (err?.code) {
        switch (err.code) {
          case 'auth/user-not-found':
            message = t('auth.login.error.user_not_found');
            break;
          case 'auth/wrong-password':
            message = t('auth.login.error.wrong_password');
            break;
          case 'auth/too-many-requests':
            message = t('auth.login.error.too_many_requests');
            break;
          case 'auth/popup-closed-by-user':
            message = t('auth.login.error.popup_closed');
            break;
          case 'auth/network-request-failed':
            message = t('auth.login.error.network_failed');
            break;
          default:
            message = t('auth.login.error.default');
            break;
        }
      }

      toast.error(message);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      await ensureUserDocumentExists(user);
      toast.success(t('auth.login.success_google'));
      router.push('/dashboard');
    } catch (err: any) {
      toast.error(t('auth.login.error.google') || err.message);
    }
  };

  return (
    <div
      style={{
        maxWidth: '400px',
        margin: '5rem auto',
        padding: '2rem',
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
        textAlign: 'center',
      }}
    >
      <h2 style={{ marginBottom: '1.5rem', color: '#111827' }}>
        {t('auth.login.title')}
      </h2>

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
        />
        {t('auth.login.google')}
      </button>

      <p style={{ marginTop: '1.5rem', fontSize: '0.95rem' }}>
        {t('auth.login.no_account')}{' '}
        <a
          href="/signup"
          style={{
            color: '#3b82f6',
            textDecoration: 'none',
            fontWeight: 500,
          }}
        >
          {t('auth.signup.title')}
        </a>
      </p>
    </div>
  );
}

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
