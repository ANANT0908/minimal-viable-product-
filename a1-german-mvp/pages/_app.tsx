import '../styles/globals.css';
import type { AppProps } from 'next/app';
import '@/lib/i18n'; 
import Header from '@/components/Header';
import { Toaster } from 'react-hot-toast';


export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
     <Toaster position="top-center" />
      <Header>
        <Component {...pageProps} />
      </Header>
    </>
  );
}
