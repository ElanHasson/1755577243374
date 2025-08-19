import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'F# for Normal People',
  description: 'Curious about functional programming but not sure where to start? This webinar introduces F# in plain, practical terms—no math degree required. You’ll learn how F# makes everyday coding tasks simpler, how it plays nicely with .NET, and why you don’t need to be a functional programming expert to use it effectively.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}