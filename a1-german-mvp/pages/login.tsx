import { useState } from 'react';
import { signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '@/lib/firebase';
import { useRouter } from 'next/router';
import { useTranslation } from 'react-i18next';
import { ensureUserDocumentExists } from '@/lib/ensureUserDocumentExists';

export default function Login() {
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const router = useRouter();
  const { t } = useTranslation('common');

  const handleLogin = async () => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, pass);
      const user = result.user;
      await ensureUserDocumentExists(user);
      router.push('/dashboard');
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      router.push('/dashboard');
    } catch (err: any) {
      alert(err.message);
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
      <h2 style={{ marginBottom: '1.5rem', color: '#111827' }}>{t('login')}</h2>

      <input
        type="email"
        placeholder={t('email')}
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={inputStyle}
      />
      <input
        type="password"
        placeholder={t('password')}
        value={pass}
        onChange={(e) => setPass(e.target.value)}
        style={inputStyle}
      />

      <button onClick={handleLogin} style={primaryButtonStyle}>
        {t('login')}
      </button>

      <button className="button-google" onClick={handleGoogleLogin}>
        <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google Icon" />
        Continue with Google
      </button>

      <p style={{ marginTop: '1.5rem', fontSize: '0.95rem' }}>
        {t('no_account')}{" "}
        <a
          href="/signup"
          style={{
            color: '#3b82f6',
            textDecoration: 'none',
            fontWeight: 500,
          }}
        >
          {t('signup')}
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


