import * as Primitive from '@radix-ui/react-dropdown-menu';
import type { ComponentPropsWithRef } from 'react';
import { cn } from '../../../foundations/utilities/cn';
import { useThemeContainer } from '../../../themes/theme-provider';
export const DropdownMenu = Primitive.Root;
export const DropdownMenuTrigger = Primitive.Trigger;
export function DropdownMenuContent({
  className,
  sideOffset = 6,
  ...props
}: ComponentPropsWithRef<typeof Primitive.Content>) {
  const container = useThemeContainer();
  return (
    <Primitive.Portal container={container}>
      <Primitive.Content
        {...props}
        sideOffset={sideOffset}
        className={cn('fn-control fn-menu-content', className)}
      />
    </Primitive.Portal>
  );
}
export interface DropdownMenuItemProps
  extends ComponentPropsWithRef<typeof Primitive.Item> {
  destructive?: boolean;
}
export function DropdownMenuItem({
  className,
  destructive = false,
  ...props
}: DropdownMenuItemProps) {
  return (
    <Primitive.Item
      {...props}
      className={cn('fn-control fn-menu-item', className)}
      data-destructive={destructive || undefined}
    />
  );
}
export function DropdownMenuSeparator({
  className,
  ...props
}: ComponentPropsWithRef<typeof Primitive.Separator>) {
  return (
    <Primitive.Separator
      {...props}
      className={cn('fn-menu-separator', className)}
    />
  );
}
