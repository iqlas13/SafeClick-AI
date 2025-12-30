'use client';

import { useEffect } from 'react';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

/**
 * Listens for Firebase permission errors.
 * BUILD-SAFE: never throws, never crashes prerender.
 */
export function FirebaseErrorListener() {
  useEffect(() => {
    const handleError = (error: FirestorePermissionError) => {
      // ✅ NEVER throw — just log or report
      console.warn('Firestore permission error:', error);

      // OPTIONAL: you can later show a toast or redirect here
      // toast({ title: 'Permission denied', description: error.message });
    };

    errorEmitter.on('permission-error', handleError);

    return () => {
      errorEmitter.off('permission-error', handleError);
    };
  }, []);

  // 🔥 This component renders nothing and never throws
  return null;
}

