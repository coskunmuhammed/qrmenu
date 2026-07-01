import React from 'react';

export const metadata = {
  title: 'Dior Beach Club - Yönetim Paneli',
  description: 'QR Menü ve Kulüp İçerik Yönetimi',
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#030306' }}>
      {children}
    </div>
  );
}
