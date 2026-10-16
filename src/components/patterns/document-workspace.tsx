import { useId, type ComponentPropsWithRef, type ReactNode } from 'react';
import { cn } from '../../foundations/utilities/cn.js';

export interface OperationStatusProps extends Omit<
  ComponentPropsWithRef<'div'>,
  'children'
> {
  state: 'saved' | 'saving' | 'unsaved' | 'error';
  children?: ReactNode;
  announcement?: string;
  actions?: ReactNode;
}
const messages = {
  saved: 'Saved',
  saving: 'Saving…',
  unsaved: 'Unsaved changes',
  error: 'Could not save',
};
export function OperationStatus({
  state,
  children,
  announcement,
  actions,
  className,
  ...props
}: OperationStatusProps) {
  return (
    <div
      {...props}
      className={cn('fn-operation-status', className)}
      data-state={state}
    >
      <span className="fn-operation-indicator" aria-hidden="true" />
      <span>{children ?? messages[state]}</span>
      {actions && <div className="fn-workspace-actions">{actions}</div>}
      <span
        className="fn-sr-only"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        {announcement ?? messages[state]}
      </span>
    </div>
  );
}
export interface DocumentWorkspaceProps extends Omit<
  ComponentPropsWithRef<'section'>,
  'title'
> {
  title: ReactNode;
  headingLevel?: 1 | 2 | 3 | 4 | 5 | 6;
  breadcrumbs?: ReactNode;
  metadata?: ReactNode;
  actions?: ReactNode;
  status?: ReactNode;
  panel?: ReactNode;
}
export function DocumentWorkspace({
  title,
  headingLevel = 1,
  breadcrumbs,
  metadata,
  actions,
  status,
  panel,
  children,
  className,
  ...props
}: DocumentWorkspaceProps) {
  const titleId = useId();
  const Heading = `h${headingLevel}` as const;
  return (
    <section
      aria-labelledby={titleId}
      {...props}
      className={cn('fn-document-workspace', className)}
    >
      <header className="fn-workspace-header">
        {breadcrumbs && (
          <div className="fn-workspace-breadcrumbs">{breadcrumbs}</div>
        )}
        <div className="fn-workspace-heading">
          <div className="fn-workspace-identity">
            <Heading id={titleId} className="fn-heading">
              {title}
            </Heading>
            {metadata && (
              <div className="fn-workspace-metadata">{metadata}</div>
            )}
          </div>
          {actions && <div className="fn-workspace-actions">{actions}</div>}
        </div>
        {status}
      </header>
      <div className="fn-workspace-body">
        <div className="fn-workspace-content">{children}</div>
        {panel}
      </div>
    </section>
  );
}
