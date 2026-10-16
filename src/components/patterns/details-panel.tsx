import {
  useContext,
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
import { MobileNavigationContext } from './mobile-navigation-context.js';
import {
  captureContainedFocus,
  restoreContainedFocus,
  type ContainedFocus,
} from '../../foundations/utilities/contained-focus.js';
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
  headingLevel?: 2 | 3 | 4 | 5 | 6;
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
  headingLevel = 2,
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
  const navigation = useContext(MobileNavigationContext);
  const navigationActive = navigation?.active ?? false;
  const previousDrawer = useRef({ open: false, navigation: false });
  const coordinateDrawers = useEffectEvent(() => {
    if (mobile && open && navigationActive) {
      if (!previousDrawer.current.open) navigation?.requestClose();
      else if (!previousDrawer.current.navigation) setOpen(false);
    }
    previousDrawer.current = { open, navigation: navigationActive };
  });
  useEffect(() => coordinateDrawers(), [mobile, open, navigationActive]);
  const contentRef = useRef<HTMLDivElement>(null);
  const opener = useRef<HTMLElement | null>(null);
  const transfer = useRef(false);
  const transferredControl = useRef<ContainedFocus | null>(null);
  const wasOpen = useRef(false);
  const id = useId();
  const Heading = `h${headingLevel}` as const;
  const restoreFocus = useEffectEvent(() => {
    const target = returnFocusRef?.current ?? opener.current;
    if (target?.isConnected) target.focus();
    if (!target?.isConnected || document.activeElement !== target)
      fallbackFocusRef?.current?.focus();
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
      transferredControl.current = captureContainedFocus(contentRef.current);
      transfer.current = transferredControl.current !== null;
      setMobile(query.matches);
    };
    update();
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);
  const focusTransferredControl = () => {
    if (transferredControl.current)
      restoreContainedFocus(contentRef.current, transferredControl.current);
    transfer.current = false;
    transferredControl.current = null;
  };
  useLayoutEffect(() => {
    if (!mobile && open && transfer.current) focusTransferredControl();
  }, [mobile, open]);
  const body = (
    <div ref={contentRef} className="fn-details-inner">
      <header className="fn-details-header">
        {mobile ? (
          <DialogTitle asChild>
            <Heading id={id} className="fn-heading">
              {title}
            </Heading>
          </DialogTitle>
        ) : (
          <Heading id={id} className="fn-heading">
            {title}
          </Heading>
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
      <Dialog open={open && !navigationActive} onOpenChange={setOpen}>
        <DialogContent
          aria-describedby={undefined}
          aria-labelledby={id}
          onOpenAutoFocus={(event) => {
            if (transfer.current) {
              event.preventDefault();
              focusTransferredControl();
            }
          }}
          showClose={false}
          className={cn('fn-details-drawer', className)}
          onCloseAutoFocus={(event) => {
            event.preventDefault();
            if (!open && !navigationActive) restoreFocus();
          }}
        >
          <aside aria-labelledby={id} {...props}>
            {body}
          </aside>
        </DialogContent>
      </Dialog>
    );
  if (!open) return null;
  return (
    <aside
      aria-labelledby={id}
      {...props}
      className={cn('fn-details-panel', className)}
    >
      {body}
    </aside>
  );
}
