import {
  useEffect,
  useLayoutEffect,
  useRef,
  useEffectEvent,
  useState,
  type ComponentPropsWithRef,
  type ReactNode,
} from 'react';
import { Menu } from 'lucide-react';
import { MobileNavigationContext } from './mobile-navigation-context.js';
import {
  captureContainedFocus,
  restoreContainedFocus,
  type ContainedFocus,
} from '../../foundations/utilities/contained-focus.js';
import { cn } from '../../foundations/utilities/cn.js';
import { useControlled } from '../../foundations/utilities/use-controlled.js';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from '../core/dialog/dialog.js';
import { IconButton } from '../core/button/button.js';
export interface SidebarProps extends ComponentPropsWithRef<'aside'> {
  label: string;
  header?: ReactNode;
  footer?: ReactNode;
}
export function Sidebar({
  label,
  header,
  footer,
  children,
  className,
  ...props
}: SidebarProps) {
  return (
    <aside
      {...props}
      aria-label={label}
      className={cn('fn-sidebar', className)}
    >
      {header && <div>{header}</div>}
      <div className="fn-sidebar-body">{children}</div>
      {footer && <footer className="fn-sidebar-footer">{footer}</footer>}
    </aside>
  );
}
export interface ApplicationShellProps extends ComponentPropsWithRef<'div'> {
  sidebar: ReactNode;
  header?: ReactNode;
  navigationLabel?: string;
  mainId?: string;
  navigationOpen?: boolean;
  defaultNavigationOpen?: boolean;
  onNavigationOpenChange?: (open: boolean) => void;
}
export function ApplicationShell({
  sidebar,
  header,
  children,
  navigationLabel = 'Navigation',
  mainId,
  navigationOpen,
  defaultNavigationOpen = false,
  onNavigationOpenChange,
  className,
  ...props
}: ApplicationShellProps) {
  const [mobile, setMobile] = useState(false);
  const [presentationEpoch, setPresentationEpoch] = useState(0);
  const [open, setOpen] = useControlled(
    navigationOpen,
    defaultNavigationOpen,
    onNavigationOpenChange,
  );
  const navigationContent = useRef<HTMLDivElement>(null);
  const desktopNavigation = useRef<HTMLDivElement>(null);
  const menuTrigger = useRef<HTMLButtonElement>(null);
  const pendingFocus = useRef<ContainedFocus | null>(null);
  const desktopFocus = useRef<ContainedFocus | null>(null);
  const openNavigationFocus = useEffectEvent((event: Event) => {
    if (pendingFocus.current) {
      event.preventDefault();
      restoreContainedFocus(navigationContent.current, pendingFocus.current);
      pendingFocus.current = null;
    }
  });
  const closeNavigationFocus = useEffectEvent(
    (event: Event, closingEpoch: number) => {
      // An unmounted drawer must not restore its old trigger after a later
      // presentation has already accepted focus (including rapid reversals).
      if (closingEpoch !== presentationEpoch) event.preventDefault();
    },
  );
  useLayoutEffect(() => {
    if (mobile && !open && pendingFocus.current) {
      menuTrigger.current?.focus();
      pendingFocus.current = null;
    } else if (!mobile && pendingFocus.current) {
      restoreContainedFocus(desktopNavigation.current, pendingFocus.current);
      pendingFocus.current = null;
    }
  }, [mobile, open]);
  const closeForDesktop = useEffectEvent(() => {
    if (open) setOpen(false);
  });
  useEffect(() => {
    const query = window.matchMedia('(max-width: 800px)');
    const update = () => {
      pendingFocus.current =
        captureContainedFocus(
          query.matches ? desktopNavigation.current : navigationContent.current,
        ) ?? (query.matches ? desktopFocus.current : null);
      desktopFocus.current = null;
      setPresentationEpoch((previous) => previous + 1);
      setMobile(query.matches);
      if (!query.matches) closeForDesktop();
    };
    update();
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);
  return (
    <MobileNavigationContext
      value={{ active: mobile && open, requestClose: () => setOpen(false) }}
    >
      <div {...props} className={cn('fn-application-shell', className)}>
        {!mobile && (
          <div
            ref={desktopNavigation}
            className="fn-shell-sidebar"
            onFocusCapture={() => {
              desktopFocus.current = captureContainedFocus(
                desktopNavigation.current,
              );
            }}
            onBlurCapture={(event) => {
              if (
                event.relatedTarget instanceof Node &&
                event.currentTarget.contains(event.relatedTarget)
              )
                return;
              // CSS can hide the desktop sidebar before matchMedia dispatches.
              desktopFocus.current = window.matchMedia('(max-width: 800px)')
                .matches
                ? captureContainedFocus(desktopNavigation.current, event.target)
                : null;
            }}
          >
            {sidebar}
          </div>
        )}
        <div className="fn-main-column">
          {mobile && (
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <IconButton
                  ref={menuTrigger}
                  aria-label={`Open ${navigationLabel}`}
                  className="fn-shell-menu"
                >
                  <Menu size={19} aria-hidden="true" />
                </IconButton>
              </DialogTrigger>
              <DialogContent
                ref={navigationContent}
                className="fn-mobile-navigation"
                onCloseAutoFocus={(event) =>
                  closeNavigationFocus(event, presentationEpoch)
                }
                onOpenAutoFocus={openNavigationFocus}
              >
                <DialogTitle className="fn-sr-only">
                  {navigationLabel}
                </DialogTitle>
                <DialogDescription className="fn-sr-only">
                  Choose a destination.
                </DialogDescription>
                {sidebar}
              </DialogContent>
            </Dialog>
          )}
          {header && <header className="fn-app-header">{header}</header>}
          <main id={mainId} className="fn-main-content">
            {children}
          </main>
        </div>
      </div>
    </MobileNavigationContext>
  );
}
