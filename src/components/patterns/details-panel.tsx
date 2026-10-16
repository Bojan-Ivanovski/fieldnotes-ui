import {
  useEffect,
  useEffectEvent,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type ComponentPropsWithRef,
  type ReactNode,
  type RefObject,
} from 'react';
import { X } from 'lucide-react';
import { cn } from '../../foundations/utilities/cn.js';
import { useControlled } from '../../foundations/utilities/use-controlled.js';
import { Dialog, DialogContent, DialogTitle } from '../core/dialog/dialog.js';
import { IconButton } from '../core/button/button.js';
export interface DetailsPanelProps extends Omit<
  ComponentPropsWithRef<'aside'>,
  'title'
> {
  title: ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  footer?: ReactNode;
  closeLabel?: string;
  returnFocusRef?: RefObject<HTMLElement | null>;
  fallbackFocusRef?: RefObject<HTMLElement | null>;
}
export function DetailsPanel({
  title,
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
  footer,
  closeLabel = 'Close details',
  returnFocusRef,
  fallbackFocusRef,
  children,
  className,
  ...props
}: DetailsPanelProps) {
  const [open, setOpen] = useControlled(
    controlledOpen,
    defaultOpen,
    onOpenChange,
  );
  const [mobile, setMobile] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const opener = useRef<HTMLElement | null>(null);
  const transfer = useRef(false);
  const wasOpen = useRef(false);
  const id = useId();
  const restoreFocus = useEffectEvent(() => {
    const target = returnFocusRef?.current ?? opener.current;
    if (target?.isConnected) target.focus();
    else fallbackFocusRef?.current?.focus();
  });
  useLayoutEffect(() => {
    if (
      open &&
      !wasOpen.current &&
      document.activeElement instanceof HTMLElement
    )
      opener.current = document.activeElement;
    if (!open && wasOpen.current && !mobile) restoreFocus();
    wasOpen.current = open;
  }, [open, mobile]);
  useEffect(() => {
    const query = window.matchMedia('(max-width: 800px)');
    const update = () => {
      transfer.current = !!contentRef.current?.contains(document.activeElement);
      setMobile(query.matches);
    };
    update();
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);
  useLayoutEffect(() => {
    if (!mobile && open && transfer.current) {
      contentRef.current
        ?.querySelector<HTMLElement>(
          'button, [href], input, textarea, select, [tabindex="0"]',
        )
        ?.focus();
      transfer.current = false;
    }
  }, [mobile, open]);
  const body = (
    <div ref={contentRef} className="fn-details-inner">
      <header className="fn-details-header">
        {mobile ? (
          <DialogTitle>{title}</DialogTitle>
        ) : (
          <h2 id={id} className="fn-heading">
            {title}
          </h2>
        )}
        <IconButton aria-label={closeLabel} onClick={() => setOpen(false)}>
          <X size={18} aria-hidden="true" />
        </IconButton>
      </header>
      <div className="fn-details-body">{children}</div>
      {footer && <footer className="fn-details-footer">{footer}</footer>}
    </div>
  );
  if (mobile)
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          aria-describedby={undefined}
          showClose={false}
          className={cn('fn-details-drawer', className)}
          onCloseAutoFocus={(event) => {
            event.preventDefault();
            if (!open) restoreFocus();
          }}
        >
          <aside {...props}>{body}</aside>
        </DialogContent>
      </Dialog>
    );
  if (!open) return null;
  return (
    <aside
      {...props}
      aria-labelledby={id}
      className={cn('fn-details-panel', className)}
    >
      {body}
    </aside>
  );
}
