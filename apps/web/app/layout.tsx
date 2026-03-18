import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AI Health Web',
  description: 'Week 1 scaffold'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
