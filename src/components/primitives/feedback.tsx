import type { HTMLAttributes, Ref } from 'react';
import { cn } from '../../foundations/utilities/cn';
export function VisuallyHidden({
  className,
  ...props
}: HTMLAttributes<HTMLSpanElement> & { ref?: Ref<HTMLSpanElement> }) {
  return <span {...props} className={cn('fn-sr-only', className)} />;
}
export interface SpinnerProps
  extends Omit<HTMLAttributes<HTMLSpanElement>, 'children'> {
  ref?: Ref<HTMLSpanElement>;
  label?: string;
}
export function Spinner({
  label = 'Loading',
  className,
  ...props
}: SpinnerProps) {
  return (
    <span
      {...props}
      role="status"
      className={cn('fn-spinner-status', className)}
    >
      <span aria-hidden="true" className="fn-spinner" />
      <VisuallyHidden>{label}</VisuallyHidden>
    </span>
  );
}
