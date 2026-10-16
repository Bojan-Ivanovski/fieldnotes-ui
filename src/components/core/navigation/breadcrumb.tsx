import type { ComponentPropsWithRef } from 'react';
import { cn } from '../../../foundations/utilities/cn.js';
export function Breadcrumb({
  className,
  'aria-label': label = 'Breadcrumb',
  ...props
}: ComponentPropsWithRef<'nav'>) {
  return (
    <nav
      {...props}
      aria-label={label}
      className={cn('fn-breadcrumb', className)}
    />
  );
}
export function BreadcrumbList({
  className,
  ...props
}: ComponentPropsWithRef<'ol'>) {
  return <ol {...props} className={cn('fn-breadcrumb-list', className)} />;
}
export function BreadcrumbItem({
  className,
  ...props
}: ComponentPropsWithRef<'li'>) {
  return <li {...props} className={cn('fn-breadcrumb-item', className)} />;
}
export function BreadcrumbLink({
  className,
  ...props
}: ComponentPropsWithRef<'a'>) {
  return (
    <a {...props} className={cn('fn-control fn-breadcrumb-link', className)} />
  );
}
export function BreadcrumbPage({
  className,
  ...props
}: ComponentPropsWithRef<'span'>) {
  return (
    <span
      aria-current="page"
      {...props}
      className={cn('fn-breadcrumb-page', className)}
    />
  );
}
export function BreadcrumbSeparator({
  className,
  children = '/',
  ...props
}: ComponentPropsWithRef<'li'>) {
  return (
    <li
      {...props}
      role="presentation"
      aria-hidden="true"
      className={cn('fn-breadcrumb-separator', className)}
    >
      {children}
    </li>
  );
}
