import type { ComponentPropsWithRef } from 'react';
import { cn } from '../../../foundations/utilities/cn.js';
export interface SeparatorProps extends ComponentPropsWithRef<'div'> {
  orientation?: 'horizontal' | 'vertical';
  decorative?: boolean;
}
export function Separator({
  className,
  orientation = 'horizontal',
  decorative = false,
  ...props
}: SeparatorProps) {
  return (
    <div
      {...props}
      className={cn('fn-separator', className)}
      data-orientation={orientation}
      role={decorative ? 'none' : 'separator'}
      aria-orientation={decorative ? undefined : orientation}
    />
  );
}
