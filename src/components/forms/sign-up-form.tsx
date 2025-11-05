'use client';

import type * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { IconLoader2, IconX } from '@tabler/icons-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { signUp } from '@/lib/auth/auth-client';
import { getCallbackURL } from '@/lib/routes';
import { cn } from '@/lib/utils';
import { convertImageToBase64 } from '@/utils/file';
import { SignUpValidation } from '@/validations/AuthValidation';

type FormData = z.infer<typeof SignUpValidation>;

export function SignUpForm({ className, ...props }: React.ComponentProps<'div'>) {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, startTransition] = useTransition();
  const router = useRouter();
  const params = useSearchParams();

  const form = useForm<FormData>({
    resolver: zodResolver(SignUpValidation),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      passwordConfirmation: '',
      image: undefined,
    },
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      form.setValue('image', file);
      setImagePreview((preview) => {
        if (preview) {
          URL.revokeObjectURL(preview);
        }
        return URL.createObjectURL(file);
      });
    }
  };

  const removeImage = () => {
    form.setValue('image', undefined);
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }
    setImagePreview(null);
  };

  const onSubmit = async (values: FormData) => {
    startTransition(async () => {
      await signUp.email({
        email: values.email,
        password: values.password,
        name: `${values.firstName} ${values.lastName}`,
        image: values.image ? await convertImageToBase64(values.image) : '',
        callbackURL: '/dashboard',
        fetchOptions: {
          onError: (ctx) => {
            toast.error(ctx.error.message);
          },
          onSuccess: async () => {
            toast.success('Successfully signed up');
            router.push(getCallbackURL(params));
          },
        },
      });
    });
  };

  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">Create your account</h1>
        <p className="text-sm text-balance text-muted-foreground">
          Enter your information to create an account
        </p>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-6">
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>First name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Max"
                      className="bg-background"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Last name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Robinson"
                      className="bg-background"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="m@example.com"
                    className="bg-background"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    autoComplete="new-password"
                    className="bg-background"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="passwordConfirmation"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirm Password</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    autoComplete="new-password"
                    className="bg-background"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="image"
            render={({ field: { value, onChange, ...field } }) => (
              <FormItem>
                <FormLabel>Profile Image (optional)</FormLabel>
                <FormControl>
                  <div className="flex items-end gap-4">
                    {imagePreview && (
                      <div className="relative h-16 w-16 overflow-hidden rounded-sm">
                        <Image
                          src={imagePreview}
                          alt="Profile preview"
                          className="h-full w-full object-cover"
                          fill
                        />
                      </div>
                    )}
                    <div className="flex w-full items-center gap-2">
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="w-full bg-background"
                        {...field}
                      />
                      {imagePreview && (
                        <IconX
                          className="cursor-pointer"
                          onClick={removeImage}
                        />
                      )}
                    </div>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button
            type="submit"
            className="w-full"
            disabled={loading}
          >
            <div className="flex w-full items-center justify-center">
              {loading
                ? (
                    <IconLoader2 size={16} className="animate-spin" />
                  )
                : (
                    'Create an account'
                  )}
            </div>
          </Button>
        </form>
      </Form>
      <div className="text-center text-sm">
        Already have an account?
        {' '}
        <Link href="/sign-in" className="underline underline-offset-4">
          Sign in
        </Link>
      </div>
    </div>
  );
}
