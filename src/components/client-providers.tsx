'use client';

import { ReactNode, useEffect, useState } from 'react';

export function FirebaseClientProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // 🔒 Ensure this NEVER runs on the server
    if (typeof window === 'undefined') {
      return;
    }

    try {
      // Import lazily to avoid build-time execution
      const { initializeFirebase } = require('@/firebase');
      initializeFirebase();
    } catch (err) {
      // ❗ Never throw — just warn in dev
      if (process.env.NODE_ENV === 'development') {
        console.warn('Firebase initialization skipped:', err);
      }
    } finally {
      setReady(true);
    }
  }, []);

  // ⛔ During build / hydration, render nothing
  if (!ready) {
    return null;
  }

  return <>{children}</>;
}
