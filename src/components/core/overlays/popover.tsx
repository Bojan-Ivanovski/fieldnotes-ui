import * as Primitive from '@radix-ui/react-popover';
import type { ComponentPropsWithRef } from 'react';
import { cn } from '../../../foundations/utilities/cn.js';
import { useThemeContainer } from '../../../themes/theme-provider.js';
export const Popover = Primitive.Root;
export const PopoverTrigger = Primitive.Trigger;
export const PopoverAnchor = Primitive.Anchor;
export const PopoverClose = Primitive.Close;
export function PopoverContent({
  className,
  sideOffset = 6,
  collisionPadding = 12,
  ...props
}: ComponentPropsWithRef<typeof Primitive.Content>) {
  const container = useThemeContainer();
  return (
    <Primitive.Portal container={container}>
      <Primitive.Content
        {...props}
        sideOffset={sideOffset}
        collisionPadding={collisionPadding}
        className={cn('fn-control fn-popover', className)}
      />
    </Primitive.Portal>
  );
}
