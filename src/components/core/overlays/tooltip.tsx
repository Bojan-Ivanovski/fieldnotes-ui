import * as Primitive from '@radix-ui/react-tooltip';
import type { ComponentPropsWithRef } from 'react';
import { cn } from '../../../foundations/utilities/cn.js';
import { useThemeContainer } from '../../../themes/theme-provider.js';
export const TooltipProvider = Primitive.Provider;
export const Tooltip = Primitive.Root;
export const TooltipTrigger = Primitive.Trigger;
export function TooltipContent({
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
        className={cn('fn-control fn-tooltip', className)}
      />
    </Primitive.Portal>
  );
}
