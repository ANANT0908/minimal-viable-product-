'use client';
import dynamic from 'next/dynamic';

const ClientLanguageSwitcher = dynamic(() => import('./LanguageSwitcher'), { ssr: false });

export default ClientLanguageSwitcher;
