'use client';

import type * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { IconLoader2, IconUpload } from '@tabler/icons-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  DialogClose,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { client } from '@/lib/auth/auth-client';
import { cn, createSlug } from '@/lib/utils';
import { convertImageToBase64 } from '@/utils/file';
import { CreateOrganizationValidation } from '@/validations/OrganizationValidation';

type FormData = z.infer<typeof CreateOrganizationValidation>;

type CreateOrgFormProps = React.ComponentProps<'form'> & {
  onSuccess?: () => void;
};

export function CreateOrgForm({ className, onSuccess, ...props }: CreateOrgFormProps) {
  const [dragActive, setDragActive] = useState(false);
  const [loading, startTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const form = useForm<FormData>({
    resolver: zodResolver(CreateOrganizationValidation),
    defaultValues: {
      name: '',
      slug: '',
      logo: undefined,
    },
  });

  const selectedFile = form.watch('logo');
  const preview = selectedFile ? URL.createObjectURL(selectedFile) : null;

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files?.[0]) {
      form.setValue('logo', e.dataTransfer.files[0]);
      form.trigger('logo');
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      form.setValue('logo', e.target.files[0]);
      form.trigger('logo');
    }
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  useEffect(() => {
    return () => {
      if (preview) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  const handleNameChange = (value: string) => {
    const slug = createSlug(value);
    form.setValue('slug', slug);
  };

  const onSubmit = (values: FormData) => {
    startTransition(async () => {
      try {
        // Convert logo to base64 if provided
        let logoUrl: string | undefined;
        if (values.logo) {
          logoUrl = await convertImageToBase64(values.logo);
        }

        // Create organization with authClient
        const { error } = await client.organization.create({
          name: values.name,
          slug: values.slug,
          logo: logoUrl,
          // Set to false so the new organization becomes active
          keepCurrentActiveOrganization: false,
        });

        if (error) {
          toast.error(error.message || 'Failed to create organization');
          return;
        }

        toast.success('Organization created successfully');
        form.reset();
        onSuccess?.();

        // Refresh the page to reflect the new active organization
        router.refresh();
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Failed to create organization');
      }
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className={cn('grid gap-6', className)} {...props}>

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Organization Name</FormLabel>
              <FormControl>
                <Input
                  placeholder="Acme Inc."
                  className="bg-background"
                  {...field}
                  onChange={(e) => {
                    field.onChange(e);
                    handleNameChange(e.target.value);
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="slug"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Slug URL</FormLabel>
              <FormControl>
                <Input
                  placeholder="acme-inc"
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
          name="logo"
          render={() => (
            <FormItem>
              <FormLabel>Logo</FormLabel>

              {/* Image Upload Area */}
              <FormControl>
                <div
                  role="button"
                  tabIndex={0}
                  onClick={openFileDialog}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      openFileDialog();
                    }
                  }}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  className={cn(
                    'flex cursor-pointer flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed px-4 py-8 transition-colors',
                    dragActive
                      ? 'border-primary bg-primary/5'
                      : 'border-border bg-muted/50 hover:bg-muted',
                  )}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileInput}
                    className="hidden"
                    disabled={loading}
                    aria-label="Upload logo file"
                  />

                  {preview
                    ? (
                        <div className="flex w-full flex-col items-center gap-3">
                          <div className="relative h-16 w-16 overflow-hidden rounded-lg border border-border">
                            <Image
                              src={preview}
                              alt="Logo preview"
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div className="text-center text-sm">
                            <p className="font-medium text-foreground">Logo uploaded</p>
                            <p className="text-xs text-muted-foreground">Drag another image or click to change</p>
                          </div>
                        </div>
                      )
                    : (
                        <div className="flex flex-col items-center gap-2">
                          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted">
                            <IconUpload className="h-6 w-6 text-muted-foreground" />
                          </div>
                          <div className="text-center">
                            <p className="text-sm font-medium text-foreground">Drag your logo here</p>
                            <p className="text-xs text-muted-foreground">or click to browse</p>
                          </div>
                        </div>
                      )}
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" type="button">
              Cancel
            </Button>
          </DialogClose>
          <Button type="submit" disabled={loading}>
            {loading
              ? (
                  <>
                    <IconLoader2 size={16} className="mr-2 animate-spin" />
                    Creating...
                  </>
                )
              : (
                  'Create Organization'
                )}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
}
