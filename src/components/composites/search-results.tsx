import { useId, type ComponentPropsWithRef, type ReactNode } from 'react';
import { cn } from '../../foundations/utilities/cn.js';
import { Heading, Text, type HeadingProps } from '../primitives/typography.js';
import { Button, type ButtonProps } from '../core/button/button.js';
import { Spinner } from '../primitives/feedback.js';

export interface SearchResultsProps extends Omit<
  ComponentPropsWithRef<'section'>,
  'title'
> {
  title: ReactNode;
  headingLevel?: HeadingProps['level'];
  /** Consumer-localized count, progress or outcome; unchanged text is not remounted. */
  announcement?: string;
  loading?: boolean;
}
/** Result contents remain native lists, links and cards, not selectable options. */
export function SearchResults({
  title,
  headingLevel = 2,
  announcement = '',
  loading = false,
  children,
  className,
  ...props
}: SearchResultsProps) {
  const id = useId();
  return (
    <section
      aria-labelledby={id}
      {...props}
      className={cn('fn-stack fn-search-results', className)}
      data-direction="vertical"
    >
      <Heading id={id} level={headingLevel}>
        {title}
      </Heading>
      <Text as="p" tone="muted" role="status" aria-atomic="true">
        {announcement}
      </Text>
      <div aria-busy={loading || undefined}>{children}</div>
    </section>
  );
}
export interface LoadMoreButtonProps extends Omit<
  ButtonProps,
  'loading' | 'loadingLabel'
> {
  pending?: boolean;
  pendingLabel?: string;
}
/** Pending keeps the native button focused while preventing repeated activation. */
export function LoadMoreButton({
  pending = false,
  pendingLabel = 'Loading more',
  children = 'Load more',
  onClick,
  ...props
}: LoadMoreButtonProps) {
  const blocked =
    pending ||
    props['aria-disabled'] === true ||
    props['aria-disabled'] === 'true';
  return (
    <Button
      {...props}
      loading={false}
      aria-disabled={blocked || undefined}
      aria-busy={pending || undefined}
      onClick={(event) => {
        if (blocked) {
          event.preventDefault();
          return;
        }
        onClick?.(event);
      }}
    >
      {pending && (
        <span aria-hidden="true">
          <Spinner label={pendingLabel} />
        </span>
      )}
      {pending ? pendingLabel : children}
    </Button>
  );
}
