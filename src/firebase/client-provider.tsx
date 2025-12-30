'use client';

import { ReactNode, useEffect, useState } from 'react';
import { initializeFirebase } from '@/firebase';
import { FirebaseProvider } from '@/firebase/provider';

interface FirebaseClientProviderProps {
  children: ReactNode;
}

export function FirebaseClientProvider({ children }: FirebaseClientProviderProps) {
  const [services, setServices] =
    useState<ReturnType<typeof initializeFirebase> | null>(null);

  useEffect(() => {
    // 🔥 Client-only Firebase initialization
    const initialized = initializeFirebase();
    setServices(initialized);
  }, []);

  // ⛔ Do NOT render anything until Firebase is ready
  if (!services) {
    return null;
  }

  return (
    <FirebaseProvider
      firebaseApp={services.firebaseApp}
      auth={services.auth}
      firestore={services.firestore}
    >
      {children}
    </FirebaseProvider>
  );
}
