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
import { Textarea } from '@/components/ui/textarea'; // Add this import
import { cn } from '@/lib/utils';
import { convertImageToBase64 } from '@/utils/file';
import { CreateRewardValidation } from '@/validations/RewardValidation';

type FormData = z.infer<typeof CreateRewardValidation>;

type CreateRewardFormProps = React.ComponentProps<'form'> & {
  onSuccess?: () => void;
};

export function CreateRewardForm({ className, onSuccess, ...props }: CreateRewardFormProps) {
  const [dragActive, setDragActive] = useState(false);
  const [loading, startTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const form = useForm<FormData>({
    resolver: zodResolver(CreateRewardValidation),
    defaultValues: {
      title: '',
      description: '',
      points: 0,
      picture: undefined,
    },
  });

  const selectedFile = form.watch('picture');
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
      form.setValue('picture', e.dataTransfer.files[0]);
      form.trigger('picture');
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      form.setValue('picture', e.target.files[0]);
      form.trigger('picture');
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

  const onSubmit = (values: FormData) => {
    startTransition(async () => {
      try {
      // Convert picture to base64 if provided
        let pictureUrl: string | undefined;
        if (values.picture) {
          pictureUrl = await convertImageToBase64(values.picture);
        }

        // Call your custom API
        const response = await fetch('/api/rewards', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: values.title,
            description: values.description,
            points: values.points,
            picture: pictureUrl,
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          toast.error(error.error || 'Failed to create reward');
          return;
        }

        toast.success('Reward created successfully!');
        form.reset();
        onSuccess?.();
        router.refresh();
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Failed to create reward');
      }
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className={cn('grid gap-6', className)} {...props}>

        {/* Title Field */}
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Reward Title</FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter reward title"
                  className="bg-background"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Description Field */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Describe the reward..."
                  className="min-h-[100px] bg-background"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Points Field */}
        <FormField
          control={form.control}
          name="points"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Points Required</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min="0"
                  placeholder="0"
                  className="bg-background"
                  {...field}
                  onChange={e => field.onChange(Number.parseInt(e.target.value) || 0)}
                  value={field.value}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Picture/Image Field */}
        <FormField
          control={form.control}
          name="picture"
          render={() => (
            <FormItem>
              <FormLabel>Reward Image (Optional)</FormLabel>

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
                    aria-label="Upload reward image"
                  />

                  {preview
                    ? (
                        <div className="flex w-full flex-col items-center gap-3">
                          <div className="relative h-16 w-16 overflow-hidden rounded-lg border border-border">
                            <Image
                              src={preview}
                              alt="Task image preview"
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div className="text-center text-sm">
                            <p className="font-medium text-foreground">Image uploaded</p>
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
                            <p className="text-sm font-medium text-foreground">Drag task image here</p>
                            <p className="text-xs text-muted-foreground">or click to browse (optional)</p>
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
                    Creating Reward...
                  </>
                )
              : (
                  'Create Reward'
                )}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
}
