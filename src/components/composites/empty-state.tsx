import type { ComponentPropsWithRef, ReactNode } from 'react';
import { cn } from '../../foundations/utilities/cn.js';
import { Heading, Text } from '../primitives/typography.js';
import { Stack } from '../primitives/layout.js';
export interface EmptyStateProps extends Omit<
  ComponentPropsWithRef<'div'>,
  'title'
> {
  title: ReactNode;
  description?: ReactNode;
  icon?: ReactNode;
  action?: ReactNode;
}
export function EmptyState({
  title,
  description,
  icon,
  action,
  className,
  children,
  ...props
}: EmptyStateProps) {
  return (
    <div {...props} className={cn('fn-empty-state', className)}>
      <Stack>
        {icon && <div aria-hidden="true">{icon}</div>}
        <Heading level={3}>{title}</Heading>
        {description && (
          <Text as="p" tone="muted">
            {description}
          </Text>
        )}
        {children}
        {action && <div>{action}</div>}
      </Stack>
    </div>
  );
}
