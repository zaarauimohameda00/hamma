import './globals.css';
import { ReactNode } from 'react';
import { Inter } from 'next/font/google';
import { ThemeProvider } from '../components/theme-provider';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'ACME Store',
  description: 'DB-driven e-commerce powered by Supabase',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} bg-white text-black dark:bg-black dark:text-white`}>
        <ThemeProvider>
          <div className="min-h-screen flex flex-col">
            <header className="border-b border-gray-200 dark:border-gray-600 p-4">ACME</header>
            <main className="flex-1">{children}</main>
            <footer className="border-t border-gray-200 dark:border-gray-600 p-4 text-sm">© ACME</footer>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}