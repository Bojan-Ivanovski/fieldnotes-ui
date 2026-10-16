import * as Primitive from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import {
  createContext,
  useContext,
  useEffectEvent,
  useLayoutEffect,
  useRef,
  type ComponentProps,
  type ComponentPropsWithRef,
} from 'react';
import { useControlled } from '../../../foundations/utilities/use-controlled.js';
import { cn } from '../../../foundations/utilities/cn.js';
import { useThemeContainer } from '../../../themes/theme-provider.js';
import { IconButton } from '../button/button.js';
const DialogStateContext = createContext<{
  open: boolean;
  requestChange: (open: boolean) => void;
} | null>(null);
const DialogChildrenContext = createContext<React.RefObject<
  Set<(event: KeyboardEvent) => void>
> | null>(null);
export function Dialog({
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
  children,
  ...props
}: ComponentProps<typeof Primitive.Root>) {
  const [open, requestChange] = useControlled(
    controlledOpen,
    defaultOpen,
    onOpenChange,
  );
  return (
    <DialogStateContext value={{ open, requestChange }}>
      <Primitive.Root {...props} open={open} onOpenChange={requestChange}>
        {children}
      </Primitive.Root>
    </DialogStateContext>
  );
}
export const DialogTrigger = Primitive.Trigger;
export const DialogClose = Primitive.Close;
export interface DialogContentProps extends ComponentPropsWithRef<
  typeof Primitive.Content
> {
  closeLabel?: string;
  showClose?: boolean;
}
export function DialogContent({
  children,
  className,
  closeLabel = 'Close dialog',
  showClose = true,
  onEscapeKeyDown,
  ...props
}: DialogContentProps) {
  const container = useThemeContainer();
  const state = useContext(DialogStateContext);
  const parentChildren = useContext(DialogChildrenContext);
  const childrenDialogs = useRef(new Set<(event: KeyboardEvent) => void>());
  const requestEscape = useEffectEvent((event: KeyboardEvent) => {
    if (event.defaultPrevented) return;
    const child = [...childrenDialogs.current].at(-1);
    if (child) child(event);
    else {
      onEscapeKeyDown?.(event);
      if (!event.defaultPrevented) state?.requestChange(false);
    }
  });
  useLayoutEffect(() => {
    if (!state?.open || !parentChildren) return;
    const siblings = parentChildren.current;
    siblings.add(requestEscape);
    return () => {
      siblings.delete(requestEscape);
    };
  }, [state?.open, parentChildren]);
  return (
    <Primitive.Portal container={container}>
      <Primitive.Overlay className="fn-dialog-overlay" />
      <DialogChildrenContext value={childrenDialogs}>
        <Primitive.Content
          {...props}
          onEscapeKeyDown={(event) => {
            if (event.defaultPrevented) return;
            if (!state) {
              onEscapeKeyDown?.(event);
              return;
            }
            // Layout registration covers the frame before Radix's passive layer
            // listeners settle, so one Escape reaches only the nested top layer.
            requestEscape(event);
            event.preventDefault();
          }}
          className={cn('fn-dialog-content fn-control', className)}
        >
          {children}
          {showClose && (
            <Primitive.Close asChild>
              <IconButton className="fn-dialog-close" aria-label={closeLabel}>
                <X size={17} aria-hidden="true" />
              </IconButton>
            </Primitive.Close>
          )}
        </Primitive.Content>
      </DialogChildrenContext>
    </Primitive.Portal>
  );
}
export function DialogTitle({
  className,
  ...props
}: ComponentPropsWithRef<typeof Primitive.Title>) {
  return (
    <Primitive.Title
      {...props}
      className={cn('fn-heading fn-dialog-title', className)}
    />
  );
}
export function DialogDescription({
  className,
  ...props
}: ComponentPropsWithRef<typeof Primitive.Description>) {
  return (
    <Primitive.Description
      {...props}
      className={cn('fn-description', className)}
    />
  );
}
