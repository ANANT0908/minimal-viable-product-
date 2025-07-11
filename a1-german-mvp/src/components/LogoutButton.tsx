import React from 'react';
import { signOut } from 'firebase/auth';
import { auth } from '@/src/lib/firebase';
import { useRouter } from 'next/router';
import { useTranslation } from 'react-i18next';

const LogoutButton: React.FC = () => {
  const router = useRouter();
  const { t } = useTranslation('common');

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push('/');
    } catch (error: any) {
      alert(t('logout_failed') + ': ' + error.message);
    }
  };

  return (
    <button
      onClick={handleLogout}
      style={{
        background: 'linear-gradient(135deg, #f44336, #d32f2f)',
        color: '#fff',
        border: 'none',
        borderRadius: '0.5rem',
        cursor: 'pointer',
        fontSize: '1rem',
        fontWeight: 500,
        boxShadow: '0 4px 12px rgba(244, 67, 54, 0.2)',
        transition: 'all 0.3s ease',
      }}
      onMouseOver={(e) => {
        (e.currentTarget.style.background = '#c62828');
      }}
      onMouseOut={(e) => {
        (e.currentTarget.style.background = 'linear-gradient(135deg, #f44336, #d32f2f)');
      }}
    >
      {t('logout')}
    </button>
  );
};

export default LogoutButton;
