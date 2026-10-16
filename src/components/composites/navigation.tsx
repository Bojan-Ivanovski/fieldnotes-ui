import { useId, type ComponentPropsWithRef, type ReactNode } from 'react';
import { cn } from '../../foundations/utilities/cn.js';
import { Heading, type HeadingProps } from '../primitives/typography.js';

export interface NavigationProps extends ComponentPropsWithRef<'nav'> {
  label: string;
}
export function Navigation({ label, className, ...props }: NavigationProps) {
  return (
    <nav
      {...props}
      aria-label={label}
      className={cn('fn-navigation', className)}
    />
  );
}
export interface NavigationGroupProps extends Omit<
  ComponentPropsWithRef<'section'>,
  'title'
> {
  title: ReactNode;
  headingLevel?: HeadingProps['level'];
  actions?: ReactNode;
}
export function NavigationGroup({
  title,
  headingLevel = 3,
  actions,
  children,
  className,
  ...props
}: NavigationGroupProps) {
  const id = useId();
  return (
    <section
      aria-labelledby={id}
      {...props}
      className={cn('fn-navigation-group', className)}
    >
      <div className="fn-navigation-heading">
        <Heading id={id} level={headingLevel}>
          {title}
        </Heading>
        {actions}
      </div>
      <ul className="fn-navigation-list">{children}</ul>
    </section>
  );
}
interface NavigationContentProps {
  children?: ReactNode;
  icon?: ReactNode;
  count?: ReactNode;
  /** Marks the current destination/view; action buttons are not implicit toggles. */
  current?: boolean;
}
function NavigationContent({ children, icon, count }: NavigationContentProps) {
  return (
    <>
      {icon != null && (
        <span className="fn-navigation-icon" aria-hidden="true">
          {icon}
        </span>
      )}
      <span className="fn-navigation-label">{children}</span>
      {count != null && (
        <>
          {' '}
          <span className="fn-navigation-count">{count}</span>
        </>
      )}
    </>
  );
}
export interface NavigationLinkProps
  extends ComponentPropsWithRef<'a'>, NavigationContentProps {
  href: string;
}
/** Place directly inside NavigationGroup; native props and ref target the anchor. */
export function NavigationLink({
  current = false,
  icon,
  count,
  children,
  className,
  ...props
}: NavigationLinkProps) {
  return (
    <li>
      <a
        {...props}
        aria-current={current ? 'page' : props['aria-current']}
        className={cn('fn-control fn-navigation-item', className)}
      >
        <NavigationContent icon={icon} count={count}>
          {children}
        </NavigationContent>
      </a>
    </li>
  );
}
export interface NavigationButtonProps
  extends ComponentPropsWithRef<'button'>, NavigationContentProps {}
/** Place directly inside NavigationGroup; native props and ref target the button. */
export function NavigationButton({
  current = false,
  icon,
  count,
  children,
  className,
  type = 'button',
  ...props
}: NavigationButtonProps) {
  return (
    <li>
      <button
        {...props}
        type={type}
        aria-current={current ? 'page' : props['aria-current']}
        className={cn('fn-control fn-navigation-item', className)}
      >
        <NavigationContent icon={icon} count={count}>
          {children}
        </NavigationContent>
      </button>
    </li>
  );
}
