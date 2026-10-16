import * as Primitive from '@radix-ui/react-tabs';
import type { ComponentPropsWithRef } from 'react';
import { cn } from '../../../foundations/utilities/cn.js';
export const Tabs = Primitive.Root;
export function TabsList({
  className,
  ...props
}: ComponentPropsWithRef<typeof Primitive.List>) {
  return (
    <Primitive.List {...props} className={cn('fn-tabs-list', className)} />
  );
}
export function TabsTrigger({
  className,
  ...props
}: ComponentPropsWithRef<typeof Primitive.Trigger>) {
  return (
    <Primitive.Trigger
      {...props}
      className={cn('fn-control fn-tabs-trigger', className)}
    />
  );
}
export function TabsContent({
  className,
  ...props
}: ComponentPropsWithRef<typeof Primitive.Content>) {
  return (
    <Primitive.Content
      {...props}
      className={cn('fn-control fn-tabs-content', className)}
    />
  );
}
