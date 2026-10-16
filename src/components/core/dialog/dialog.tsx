import * as Primitive from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import type { ComponentPropsWithRef } from 'react';
import { cn } from '../../../foundations/utilities/cn';
import { useThemeContainer } from '../../../themes/theme-provider';
import { IconButton } from '../button/button';
export const Dialog = Primitive.Root;
export const DialogTrigger = Primitive.Trigger;
export const DialogClose = Primitive.Close;
export interface DialogContentProps
  extends ComponentPropsWithRef<typeof Primitive.Content> {
  closeLabel?: string;
  showClose?: boolean;
}
export function DialogContent({
  children,
  className,
  closeLabel = 'Close dialog',
  showClose = true,
  ...props
}: DialogContentProps) {
  const container = useThemeContainer();
  return (
    <Primitive.Portal container={container}>
      <Primitive.Overlay className="fn-dialog-overlay" />
      <Primitive.Content
        {...props}
        className={cn('fn-dialog-content fn-control', className)}
      >
        {children}
        {showClose && (
          <Primitive.Close asChild>
            <IconButton className="fn-dialog-close" aria-label={closeLabel}>
              <X size={17} aria-hidden="true" />
            </IconButton>
          </Primitive.Close>
        )}
      </Primitive.Content>
    </Primitive.Portal>
  );
}
export function DialogTitle({
  className,
  ...props
}: ComponentPropsWithRef<typeof Primitive.Title>) {
  return (
    <Primitive.Title
      {...props}
      className={cn('fn-heading fn-dialog-title', className)}
    />
  );
}
export function DialogDescription({
  className,
  ...props
}: ComponentPropsWithRef<typeof Primitive.Description>) {
  return (
    <Primitive.Description
      {...props}
      className={cn('fn-description', className)}
    />
  );
}
