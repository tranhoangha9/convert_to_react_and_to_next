import React from 'react';
import { Poppins } from 'next/font/google';
import ConditionalLayout from '../components/ConditionalLayout';
import ClientWrapper from '../components/ClientWrapper';
import '../styles/globals.css';
import '../components/Header/Header.css';
import '../components/Footer/Footer.css';

const poppins = Poppins({
  weight: ['300', '400', '500', '600', '700', '800'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-poppins'
});

export const metadata = {
  title: "Cora'l - Premium Handbags & Fashion Accessories",
  description: "Discover premium handbags and accessories at Cora'l. HoangHa's shop the latest collection of stylish bags, purses, and fashion accessories with fast shipping and secure checkout.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={poppins.variable}>
      <body className={poppins.className}>
        <ClientWrapper>
          <ConditionalLayout>{children}</ConditionalLayout>
        </ClientWrapper>
      </body>
    </html>
  );
}