import { useId, type ComponentPropsWithRef, type ReactNode } from 'react';
import { cn } from '../../foundations/utilities/cn.js';
export interface SettingsLayoutProps extends Omit<
  ComponentPropsWithRef<'section'>,
  'title'
> {
  title: ReactNode;
  description?: ReactNode;
  navigation?: ReactNode;
  headingLevel?: 1 | 2 | 3 | 4 | 5 | 6;
}
export function SettingsLayout({
  title,
  description,
  navigation,
  headingLevel = 1,
  children,
  className,
  ...props
}: SettingsLayoutProps) {
  const id = useId();
  const Heading = `h${headingLevel}` as const;
  return (
    <section
      aria-labelledby={id}
      {...props}
      className={cn('fn-settings-layout', className)}
    >
      <header>
        <Heading id={id} className="fn-heading">
          {title}
        </Heading>
        {description && <div className="fn-description">{description}</div>}
      </header>
      <div className="fn-settings-body">
        {navigation && (
          <div className="fn-settings-navigation">{navigation}</div>
        )}
        <div className="fn-settings-content">{children}</div>
      </div>
    </section>
  );
}
export interface SettingsSectionProps extends Omit<
  ComponentPropsWithRef<'section'>,
  'title'
> {
  title: ReactNode;
  description?: ReactNode;
  headingLevel?: 2 | 3 | 4 | 5 | 6;
  actions?: ReactNode;
  destructive?: boolean;
}
export function SettingsSection({
  title,
  description,
  headingLevel = 2,
  actions,
  destructive,
  children,
  className,
  ...props
}: SettingsSectionProps) {
  const id = useId();
  const Heading = `h${headingLevel}` as const;
  return (
    <section
      aria-labelledby={id}
      {...props}
      className={cn('fn-settings-section', className)}
      data-destructive={destructive || undefined}
    >
      <header>
        <Heading id={id} className="fn-heading">
          {title}
        </Heading>
        {description && <div className="fn-description">{description}</div>}
      </header>
      <div>{children}</div>
      {actions && <footer className="fn-workspace-actions">{actions}</footer>}
    </section>
  );
}
