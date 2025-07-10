'use client';
import { useRouter } from 'next/router';
import { useTranslation } from 'react-i18next';
import i18next from 'i18next';
import LogoutButton from '@/components/LogoutButton';

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const router = useRouter();

  const changeLanguage = (lng: string) => {
    i18next.changeLanguage(lng);
    router.replace(router.pathname, router.asPath, { locale: lng });
  };
  const isDashboard = router.pathname === '/dashboard';
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        backgroundColor: '#ffffff',
        borderRadius: '0.75rem',
        boxShadow: '0 4px 10px rgba(0, 0, 0, 0.05)',

      }}
    >
      <select
        value={i18n.language}
        onChange={(e) => changeLanguage(e.target.value)}
        style={{
          borderRadius: '0.5rem',
          border: '1px solid #d1d5db',
          fontSize: '1rem',
          backgroundColor: '#f9fafb',
          cursor: 'pointer',
          marginBottom: "0"
        }}
      >
        <option value="en">🇺🇸 English</option>
        <option value="de">🇩🇪 Deutsch</option>
      </select>

      {isDashboard && <LogoutButton />}

    </div>
  );
}
