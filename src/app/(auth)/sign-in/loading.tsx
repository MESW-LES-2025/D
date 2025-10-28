import Image from 'next/image';

import { Logo } from '@/components/common/logo';
import { ModeToggle } from '@/components/common/mode-toggle';
import { Skeleton } from '@/components/ui/skeleton';
import { AppConfig } from '@/utils/appConfig';

export default function SignInLoading() {
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
            {/* SignInForm Skeleton */}
            <div className="flex flex-col gap-7">
              <div className="flex flex-col items-center gap-2 text-center">
                <Skeleton className="h-8 w-60" />
                <Skeleton className="h-5 w-75" />
              </div>

              {/* Form */}
              <div className="grid gap-6">
                {/* Email field */}
                <div className="grid gap-7">
                  <div className="space-y-1">
                    <Skeleton className="h-4 w-10" />
                    <Skeleton className="h-9 w-full" />
                  </div>
                  {/* Password field */}
                  <div className="space-y-1">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-9 w-full" />
                  </div>
                </div>

                {/* Remember me checkbox */}
                <div className="flex items-center space-x-3">
                  <Skeleton className="h-4 w-4 rounded" />
                  <Skeleton className="h-4 w-24" />
                </div>

                {/* Submit button */}
                <Skeleton className="h-9 w-full" />
              </div>

              {/* Sign up link */}
              <div className="text-center">
                <Skeleton className="mx-auto h-5 w-50" />
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="relative hidden bg-muted lg:block">
        <Image
          src="/assets/images/placeholder.svg"
          alt="Image"
          fill
          className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
        />
      </div>
    </div>
  );
}
