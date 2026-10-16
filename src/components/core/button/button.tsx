import { cva, type VariantProps } from 'class-variance-authority';
import type { ComponentPropsWithRef } from 'react';
import { cn } from '../../../foundations/utilities/cn.js';
import { Spinner } from '../../primitives/feedback.js';
export const buttonVariants = cva('fn-control fn-button', {
  variants: {
    variant: {
      primary: 'fn-button-primary',
      secondary: 'fn-button-secondary',
      outline: 'fn-button-outline',
      ghost: 'fn-button-ghost',
      destructive: 'fn-button-destructive',
    },
    size: { sm: 'fn-button-sm', md: 'fn-button-md', lg: 'fn-button-lg' },
  },
  defaultVariants: { variant: 'primary', size: 'md' },
});
export interface ButtonProps
  extends ComponentPropsWithRef<'button'>, VariantProps<typeof buttonVariants> {
  loading?: boolean;
  loadingLabel?: string;
}
export function Button({
  variant,
  size,
  loading = false,
  loadingLabel = 'Loading',
  disabled,
  type = 'button',
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      type={type}
      className={cn(buttonVariants({ variant, size }), className)}
      disabled={disabled || loading}
      aria-busy={loading || props['aria-busy']}
    >
      {loading && <Spinner label={loadingLabel} />}
      <span className="fn-button-content">{children}</span>
    </button>
  );
}
export interface IconButtonProps extends Omit<ButtonProps, 'aria-label'> {
  'aria-label': string;
}
export function IconButton({
  className,
  variant = 'ghost',
  ...props
}: IconButtonProps) {
  return (
    <Button
      {...props}
      variant={variant}
      className={cn('fn-icon-button', className)}
    />
  );
}
