import React from 'react';
import ConditionalLayout from '../components/ConditionalLayout';
import ClientWrapper from '../components/ClientWrapper';
import '../styles/globals.css';
import '../components/Header/Header.css';
import '../components/Footer/Footer.css';

export const metadata = {
  title: "Cora'l - Premium Handbags & Fashion Accessories",
  description: "Discover premium handbags and accessories at Cora'l. Shop the latest collection of stylish bags, purses, and fashion accessories with fast shipping and secure checkout.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <ClientWrapper>
          <ConditionalLayout>{children}</ConditionalLayout>
        </ClientWrapper>
      </body>
    </html>
  );
}