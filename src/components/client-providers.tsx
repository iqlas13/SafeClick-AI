'use client';

import { ReactNode } from 'react';
import { FirebaseClientProvider } from '@/firebase/client-provider';

export default function ClientProviders({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <FirebaseClientProvider>
      {children}
    </FirebaseClientProvider>
  );
}
