'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { signOut } from '@/lib/auth/auth-client';

export function SignOutButton() {
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await signOut({
        fetchOptions: {
          onSuccess: () => {
            router.push('/sign-in');
          },
        },
      });
    } catch (err) {
      console.error('Sign out failed:', err);
    }
  };

  return (
    <Button variant="outline" onClick={handleSignOut}>
      Logout
    </Button>
  );
}
