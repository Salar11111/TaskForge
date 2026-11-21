'use client';

import { useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

interface FormDialogProps<T extends z.ZodType> {
  schema: T;
  title: string;
  description?: string;
  defaultValues?: z.infer<T>;
  onSubmit: (data: z.infer<T>) => Promise<void>;
  children?: React.ReactNode | ((form: ReturnType<typeof useForm<z.infer<T>>>) => React.ReactNode);
  submitLabel?: string;
  isOpen: boolean;
  onClose: () => void;
  className?: string;
}

export function FormDialog<T extends z.ZodType>({
  schema,
  title,
  description,
  defaultValues,
  onSubmit,
  children,
  submitLabel = 'Save',
  isOpen,
  onClose,
  className,
}: FormDialogProps<T>) {
  const form = useForm<z.infer<T>>({
    resolver: zodResolver(schema),
    defaultValues,
  });
  const defaultValuesKey = JSON.stringify(defaultValues ?? null);
  const lastResetKey = useRef<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      lastResetKey.current = null;
      return;
    }

    if (lastResetKey.current !== defaultValuesKey) {
      form.reset(defaultValues);
      lastResetKey.current = defaultValuesKey;
    }
  }, [defaultValues, defaultValuesKey, form, isOpen]);

  const handleSubmit = async (data: z.infer<T>) => {
    try {
      await onSubmit(data);
      toast.success('Saved successfully');
      onClose();
      form.reset();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to save');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={cn('max-w-lg', className)}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        <form onSubmit={form.handleSubmit(handleSubmit)}>
          {typeof children === 'function' ? children(form) : children}
          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? 'Saving...' : submitLabel}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}