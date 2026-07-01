import React from 'react';
import type { Metadata } from 'next';
import '../styles/globals.css';
import ClientLayout from './ClientLayout';

export const metadata: Metadata = {
  title: 'Nurofin-Executive-AI',
  description: 'Enterprise-grade Executive Dashboard and AI Assistant for Nurofin CEO Vincent.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
