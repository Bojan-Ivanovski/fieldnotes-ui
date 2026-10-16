import * as Primitive from '@radix-ui/react-dropdown-menu';
import { Check, ChevronRight } from 'lucide-react';
import type { ComponentPropsWithRef } from 'react';
import { cn } from '../../../foundations/utilities/cn.js';
import { useThemeContainer } from '../../../themes/theme-provider.js';
export function DropdownMenu({
  modal = false,
  ...props
}: React.ComponentProps<typeof Primitive.Root>) {
  return <Primitive.Root {...props} modal={modal} />;
}
export const DropdownMenuTrigger = Primitive.Trigger;
export const DropdownMenuGroup = Primitive.Group;
export const DropdownMenuRadioGroup = Primitive.RadioGroup;
export const DropdownMenuSub = Primitive.Sub;
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
export interface DropdownMenuItemProps extends ComponentPropsWithRef<
  typeof Primitive.Item
> {
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

export function DropdownMenuLabel({
  className,
  ...props
}: ComponentPropsWithRef<typeof Primitive.Label>) {
  return (
    <Primitive.Label
      {...props}
      className={cn('fn-menu-label fn-label', className)}
    />
  );
}
export function DropdownMenuCheckboxItem({
  className,
  children,
  ...props
}: ComponentPropsWithRef<typeof Primitive.CheckboxItem>) {
  return (
    <Primitive.CheckboxItem
      {...props}
      className={cn('fn-control fn-menu-item fn-menu-choice', className)}
    >
      <span className="fn-menu-indicator">
        <Primitive.ItemIndicator>
          <Check size={15} aria-hidden="true" />
        </Primitive.ItemIndicator>
      </span>
      {children}
    </Primitive.CheckboxItem>
  );
}
export function DropdownMenuRadioItem({
  className,
  children,
  ...props
}: ComponentPropsWithRef<typeof Primitive.RadioItem>) {
  return (
    <Primitive.RadioItem
      {...props}
      className={cn('fn-control fn-menu-item fn-menu-choice', className)}
    >
      <span className="fn-menu-indicator">
        <Primitive.ItemIndicator>
          <Check size={15} aria-hidden="true" />
        </Primitive.ItemIndicator>
      </span>
      {children}
    </Primitive.RadioItem>
  );
}
export function DropdownMenuSubTrigger({
  className,
  children,
  ...props
}: ComponentPropsWithRef<typeof Primitive.SubTrigger>) {
  return (
    <Primitive.SubTrigger
      {...props}
      className={cn('fn-control fn-menu-item fn-menu-sub-trigger', className)}
    >
      {children}
      <ChevronRight
        className="fn-menu-sub-arrow"
        size={15}
        aria-hidden="true"
      />
    </Primitive.SubTrigger>
  );
}
export function DropdownMenuSubContent({
  className,
  sideOffset = 6,
  collisionPadding = 12,
  ...props
}: ComponentPropsWithRef<typeof Primitive.SubContent>) {
  const container = useThemeContainer();
  return (
    <Primitive.Portal container={container}>
      <Primitive.SubContent
        {...props}
        sideOffset={sideOffset}
        collisionPadding={collisionPadding}
        className={cn('fn-control fn-menu-content', className)}
      />
    </Primitive.Portal>
  );
}
