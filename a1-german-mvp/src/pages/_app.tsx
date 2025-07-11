import '../styles/globals.css';
import type { AppProps } from 'next/app';
import '@/src/lib/i18n'; 
import Header from '@/src/components/Header';
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
