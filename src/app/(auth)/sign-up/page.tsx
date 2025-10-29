import type { Metadata } from 'next';
import { headers } from 'next/headers';
import Image from 'next/image';
import { redirect } from 'next/navigation';

import { Logo } from '@/components/common/logo';
import { ModeToggle } from '@/components/common/mode-toggle';
import { SignUpForm } from '@/components/forms/sign-up-form';
import { auth } from '@/lib/auth/auth';
import { AppConfig } from '@/utils/appConfig';

export const metadata: Metadata = {
  title: 'TaskUp | Sign Up',
  description: 'Create a TaskUp account to manage your tasks efficiently.',
};

export default async function SignUpPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (session) {
    redirect('/dashboard');
  }

  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <Logo>
            {AppConfig.name}
          </Logo>
          <ModeToggle className="ml-auto" />
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <SignUpForm />
          </div>
        </div>
      </div>
      <div className="relative hidden bg-muted lg:block">
        <Image
          src="/assets/images/imac-do-more.jpg"
          alt="Image"
          fill
          className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
        />
      </div>
    </div>
  );
}
