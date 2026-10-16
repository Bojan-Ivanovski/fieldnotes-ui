import * as Primitive from '@radix-ui/react-toast';
import { X } from 'lucide-react';
import type { ComponentPropsWithRef } from 'react';
import { cn } from '../../../foundations/utilities/cn.js';
export const ToastProvider = Primitive.Provider;
export function Toast({
  className,
  ...props
}: ComponentPropsWithRef<typeof Primitive.Root>) {
  return (
    <Primitive.Root
      {...props}
      className={cn('fn-control fn-toast', className)}
    />
  );
}
export function ToastTitle({
  className,
  ...props
}: ComponentPropsWithRef<typeof Primitive.Title>) {
  return <Primitive.Title {...props} className={cn('fn-label', className)} />;
}
export function ToastDescription({
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
export function ToastAction({
  className,
  ...props
}: ComponentPropsWithRef<typeof Primitive.Action>) {
  return (
    <Primitive.Action
      {...props}
      className={cn(
        'fn-control fn-button fn-button-outline fn-button-sm',
        className,
      )}
    />
  );
}
export function ToastClose({
  className,
  children = <X size={16} aria-hidden="true" />,
  'aria-label': label = 'Dismiss notification',
  ...props
}: ComponentPropsWithRef<typeof Primitive.Close>) {
  return (
    <Primitive.Close
      {...props}
      aria-label={label}
      className={cn(
        'fn-control fn-button fn-button-ghost fn-icon-button fn-toast-close',
        className,
      )}
    >
      {children}
    </Primitive.Close>
  );
}
export function ToastViewport({
  className,
  ...props
}: ComponentPropsWithRef<typeof Primitive.Viewport>) {
  return (
    <Primitive.Viewport
      {...props}
      className={cn('fn-toast-viewport fn-control', className)}
    />
  );
}
