'use client';

import { Logo } from "@/components/icons/logo";
import { useUser, useAuth } from '@/firebase';
import { Button } from '@/components/ui/button';
import { LogOut, User as UserIcon } from 'lucide-react';
import { getAuth } from 'firebase/auth';
import Link from "next/link";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default function Header() {
  const { user, isUserLoading } = useUser();
  const auth = useAuth();

  const handleSignOut = () => {
    if (auth) {
      auth.signOut();
    }
  };

  const getInitials = (email: string | null | undefined) => {
    if (!email) return '?';
    return email.substring(0, 2).toUpperCase();
  }

  return (
    <header className="border-b border-white/10 bg-transparent">
      <div className="container mx-auto flex h-20 items-center justify-between px-4">
        <Logo />
        <div className="flex items-center gap-4">
          {!isUserLoading && user && (
            <>
               <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8 border-2 border-primary/50">
                  <AvatarFallback className="bg-primary/20 text-xs font-bold">
                    {user.isAnonymous ? 'AN' : getInitials(user.email)}
                  </AvatarFallback>
                </Avatar>
                 <span className="text-sm text-muted-foreground hidden sm:inline">
                   {user.isAnonymous ? 'Anonymous User' : user.email}
                 </span>
               </div>
              <Button variant="secondary" size="sm" onClick={handleSignOut}>
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </Button>
            </>
          )}
           {!isUserLoading && !user && (
              <Button asChild variant="default" size="sm">
                <Link href="/login">
                  <UserIcon className="mr-2 h-4 w-4" />
                  Login
                </Link>
              </Button>
           )}
        </div>
      </div>
    </header>
  );
}
