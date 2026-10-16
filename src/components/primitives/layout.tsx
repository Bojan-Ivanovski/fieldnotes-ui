import type { HTMLAttributes } from 'react';
import { cn } from '../../foundations/utilities/cn';
export interface StackProps extends HTMLAttributes<HTMLDivElement> {
  ref?: React.Ref<HTMLDivElement>;
  direction?: 'vertical' | 'horizontal';
  gap?: 'sm' | 'md' | 'lg';
  wrap?: boolean;
}
/** A small layout API for the repeated flex/gap patterns in Fieldnotes. */
export function Stack({
  direction = 'vertical',
  gap = 'md',
  wrap = false,
  className,
  ...props
}: StackProps) {
  return (
    <div
      {...props}
      className={cn('fn-stack', className)}
      data-direction={direction}
      data-gap={gap}
      data-wrap={wrap || undefined}
    />
  );
}
