import Image from 'next/image';

import { Logo } from '@/components/common/logo';
import { ModeToggle } from '@/components/common/mode-toggle';
import { Skeleton } from '@/components/ui/skeleton';
import { AppConfig } from '@/utils/appConfig';

export default function SignUpLoading() {
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
            <div className="flex flex-col gap-6">
              {/* Header */}
              <div className="flex flex-col items-center gap-2 text-center">
                <Skeleton className="h-8 w-56" />
                <Skeleton className="h-5 w-72" />
              </div>

              {/* Form */}
              <div className="grid gap-6">
                {/* First name and Last name */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-9 w-full" />
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-9 w-full" />
                  </div>
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <Skeleton className="h-4 w-10" />
                  <Skeleton className="h-9 w-full" />
                </div>

                {/* Password */}
                <div className="space-y-2">
                  <Skeleton className="h-4 w-17" />
                  <Skeleton className="h-9 w-full" />
                </div>

                {/* Confirm Password */}
                <div className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-9 w-full" />
                </div>

                {/* Profile Image */}
                <div className="space-y-2">
                  <Skeleton className="h-4 w-36" />
                  <Skeleton className="h-9 w-full" />
                </div>

                {/* Submit Button */}
                <Skeleton className="h-9 w-full" />
              </div>

              {/* Footer */}
              <div className="text-center">
                <Skeleton className="mx-auto h-5 w-54" />
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
