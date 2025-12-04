'use client';

import type { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  IconLoader2,
  IconPencil,
  IconUpload,
  IconUser,
} from '@tabler/icons-react';
import { useCallback, useEffect, useRef, useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useSession } from '@/hooks/use-session';
import { client } from '@/lib/auth/auth-client';
import { cn, getInitials } from '@/lib/utils';
import { convertImageToBase64 } from '@/utils/file';
import { UpdateAvatarValidation } from '@/validations/AccountValidation';
import { AvatarUpdateCardSkeleton } from './skeletons';

type AvatarFormData = z.infer<typeof UpdateAvatarValidation>;

type AvatarUpdateCardProps = {
  className?: string;
} & React.ComponentProps<'div'>;

export function AvatarUpdateCard({
  className,
  ...props
}: AvatarUpdateCardProps) {
  const { user, isLoading } = useSession();
  const [loading, startTransition] = useTransition();
  const [dragActive, setDragActive] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<AvatarFormData>({
    resolver: zodResolver(UpdateAvatarValidation),
  });

  const selectedFile = form.watch('image');
  const preview = selectedFile ? URL.createObjectURL(selectedFile) : null;

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);

      if (e.dataTransfer.files?.[0]) {
        form.setValue('image', e.dataTransfer.files[0]);
        form.trigger('image');
      }
    },
    [form],
  );

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      form.setValue('image', e.target.files[0]);
      form.trigger('image');
    }
  };

  const onSubmit = async (values: AvatarFormData) => {
    startTransition(async () => {
      try {
        const imageBase64 = await convertImageToBase64(values.image);

        await client.updateUser({
          image: imageBase64,
        });

        toast.success('Profile picture updated successfully!');
        setIsModalOpen(false);
        form.reset();
      } catch (error) {
        console.error('Avatar update error:', error);
        toast.error('Failed to update profile picture. Please try again.');
      }
    });
  };

  const handleRemove = async () => {
    startTransition(async () => {
      try {
        await client.updateUser({
          image: null,
        });

        toast.success('Profile picture removed successfully!');
        setIsModalOpen(false);
        form.reset();
      } catch (error) {
        console.error('Avatar removal error:', error);
        toast.error('Failed to remove profile picture. Please try again.');
      }
    });
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  // Cleanup preview URL on unmount or when preview changes
  useEffect(() => {
    return () => {
      if (preview) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  if (isLoading) {
    return (
      <AvatarUpdateCardSkeleton />
    );
  }

  if (!user) {
    return null;
  }
  const userInitials = getInitials(user.name);

  return (
    <Card className={cn('w-full', className)} {...props}>
      <CardContent>
        <div className="flex flex-col gap-6 md:flex-row md:items-center">
          {/* Title and Description */}
          <div className="flex flex-1 flex-col justify-center">
            <h3 className="mb-2 text-lg font-semibold text-foreground">
              Profile Picture
            </h3>
            <p className="text-sm text-muted-foreground">
              This will be displayed on your profile and throughout the
              platform.
            </p>
          </div>

          <div className="flex items-center gap-6">
            <div className="relative">
              <Avatar className="h-20 w-20 shadow-lg">
                <AvatarImage
                  src={user.image || undefined}
                  alt={user.name || 'User avatar'}
                  className="h-full w-full object-cover"
                />
                <AvatarFallback className="bg-muted text-2xl text-muted-foreground">
                  {userInitials}
                </AvatarFallback>
              </Avatar>

              <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogTrigger asChild>
                  <Button
                    size="sm"
                    className="absolute -right-1 -bottom-1 h-8 w-8 rounded-full bg-primary p-0 shadow-md hover:bg-primary/90"
                    aria-label="Edit profile picture"
                  >
                    <IconPencil className="h-4 w-4 text-primary-foreground" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Update Profile Picture</DialogTitle>
                    <DialogDescription>
                      Upload a new profile picture. Drag and drop or click to
                      browse.
                    </DialogDescription>
                  </DialogHeader>

                  <Form {...form}>
                    <form
                      onSubmit={form.handleSubmit(onSubmit)}
                      className="space-y-6"
                    >
                      {/* Preview */}
                      <div className="flex justify-center">
                        <Avatar className="h-24 w-24 border-2 border-border shadow-lg">
                          <AvatarImage
                            src={preview || user.image || undefined}
                            alt="Avatar preview"
                          />
                          <AvatarFallback className="bg-muted text-3xl text-muted-foreground">
                            {preview
                              ? (
                                  <IconUser className="h-8 w-8" />
                                )
                              : (
                                  userInitials
                                )}
                          </AvatarFallback>
                        </Avatar>
                      </div>

                      <FormField
                        control={form.control}
                        name="image"
                        render={() => (
                          <FormItem>
                            <FormLabel className="sr-only">
                              Avatar Image
                            </FormLabel>
                            <FormControl>
                              {/* Drag and Drop Area */}
                              <div
                                className={cn(
                                  'relative rounded-lg border-2 border-dashed p-8 text-center transition-colors',
                                  dragActive
                                    ? 'border-primary bg-primary/5'
                                    : 'border-border bg-card hover:bg-accent/5',
                                )}
                                onDragEnter={handleDrag}
                                onDragLeave={handleDrag}
                                onDragOver={handleDrag}
                                onDrop={handleDrop}
                              >
                                <input
                                  ref={fileInputRef}
                                  type="file"
                                  accept="image/*"
                                  onChange={handleFileInput}
                                  className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                                  disabled={loading}
                                  aria-label="Upload image file"
                                />

                                <div className="space-y-3">
                                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                                    <IconUpload className="h-6 w-6 text-muted-foreground" />
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium text-foreground">
                                      Drop your image here, or
                                      {' '}
                                      <button
                                        type="button"
                                        onClick={openFileDialog}
                                        disabled={loading}
                                        className="text-primary underline hover:text-primary/80 disabled:opacity-50"
                                      >
                                        browse
                                      </button>
                                    </p>
                                    <p className="mt-1 text-xs text-muted-foreground">
                                      PNG, JPG, GIF up to 5MB
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Action Buttons */}
                      <div className="flex gap-3">
                        <Button
                          type="button"
                          variant="outline"
                          className="flex-1"
                          onClick={handleRemove}
                          disabled={!user.image || loading}
                        >
                          {loading
                            ? (
                                <div className="flex items-center gap-2">
                                  <IconLoader2 className="h-4 w-4 animate-spin" />
                                  Removing...
                                </div>
                              )
                            : (
                                'Remove'
                              )}
                        </Button>
                        <Button
                          type="submit"
                          className="flex-1"
                          disabled={!selectedFile || loading}
                        >
                          {loading
                            ? (
                                <div className="flex items-center gap-2">
                                  <IconLoader2 className="h-4 w-4 animate-spin" />
                                  Uploading...
                                </div>
                              )
                            : (
                                'Upload'
                              )}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
