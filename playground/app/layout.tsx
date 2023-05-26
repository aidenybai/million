import './globals.css';
import { Inter } from 'next/font/google';
import { EditorCss } from '@/components/editor-styles';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Million.js Playground',
  description: 'A playground to execute and test code for Million.js',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <EditorCss />
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  );
}
