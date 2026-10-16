import type { ComponentPropsWithRef } from 'react';
import { cn } from '../../../foundations/utilities/cn.js';
export function Card({
  className,
  ...props
}: ComponentPropsWithRef<'section'>) {
  return <section {...props} className={cn('fn-card', className)} />;
}
export interface BadgeProps extends ComponentPropsWithRef<'span'> {
  tone?: 'neutral' | 'success' | 'warning' | 'destructive';
}
export function Badge({ tone = 'neutral', className, ...props }: BadgeProps) {
  return (
    <span {...props} className={cn('fn-badge', className)} data-tone={tone} />
  );
}
export interface AlertProps extends ComponentPropsWithRef<'div'> {
  tone?: 'info' | 'success' | 'warning' | 'destructive';
}
export function Alert({
  tone = 'info',
  role = 'status',
  className,
  ...props
}: AlertProps) {
  return (
    <div
      {...props}
      role={role}
      className={cn('fn-alert', className)}
      data-tone={tone}
    />
  );
}
