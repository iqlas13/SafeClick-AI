'use client';
import { toast } from '@/hooks/use-toast';
import { FirebaseError } from 'firebase/app';

export function handleAuthError(error: FirebaseError) {
  console.error("Authentication Error:", error.code, error.message);
  
  let title = "An unexpected error occurred.";
  let description = "Please try again in a moment.";

  switch (error.code) {
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      title = 'Login Failed';
      description = 'The email or password you entered is incorrect. Please check your credentials and try again.';
      break;
    case 'auth/email-already-in-use':
      title = 'Sign-up Failed';
      description = 'An account with this email address already exists. Please try signing in instead.';
      break;
    case 'auth/weak-password':
      title = 'Sign-up Failed';
      description = 'The password is too weak. It must be at least 6 characters long.';
      break;
    case 'auth/invalid-email':
      title = 'Invalid Email';
      description = 'Please enter a valid email address.';
      break;
    case 'auth/too-many-requests':
      title = 'Too Many Attempts';
      description = 'Access to this account has been temporarily disabled due to many failed login attempts. You can immediately restore it by resetting your password or you can try again later.';
      break;
    default:
      // Keep the generic message for other errors
      break;
  }

  toast({
    variant: 'destructive',
    title: title,
    description: description,
  });
}
