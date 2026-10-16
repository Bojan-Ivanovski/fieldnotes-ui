import type { ComponentPropsWithRef, ReactNode } from 'react';
import { cn } from '../../foundations/utilities/cn.js';
import { Heading, Text, type HeadingProps } from '../primitives/typography.js';
import { Stack } from '../primitives/layout.js';

export interface ResourceCardProps extends Omit<
  ComponentPropsWithRef<'article'>,
  'title'
> {
  /** Plain title, or one native link/button. Actions belong in the actions slot. */
  title: ReactNode;
  headingLevel?: HeadingProps['level'];
  /** Inline content rendered in a paragraph. */
  description?: ReactNode;
  metadata?: ReactNode;
  actions?: ReactNode;
}

export function ResourceCard({
  title,
  headingLevel = 3,
  description,
  metadata,
  actions,
  children,
  className,
  ...props
}: ResourceCardProps) {
  return (
    <article {...props} className={cn('fn-card fn-resource-card', className)}>
      <Heading level={headingLevel} className="fn-resource-card-title">
        {title}
      </Heading>
      {description != null && (
        <Text as="p" tone="muted" className="fn-resource-card-description">
          {description}
        </Text>
      )}
      {children}
      {metadata != null && (
        <div className="fn-resource-card-metadata">{metadata}</div>
      )}
      {actions != null && (
        <Stack
          direction="horizontal"
          gap="sm"
          wrap
          className="fn-resource-card-actions"
        >
          {actions}
        </Stack>
      )}
    </article>
  );
}
