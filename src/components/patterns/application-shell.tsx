import {
  useEffect,
  useEffectEvent,
  useState,
  type ComponentPropsWithRef,
  type ReactNode,
} from 'react';
import { Menu } from 'lucide-react';
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
  const [open, setOpen] = useControlled(
    navigationOpen,
    defaultNavigationOpen,
    onNavigationOpenChange,
  );
  const closeForDesktop = useEffectEvent(() => {
    if (open) setOpen(false);
  });
  useEffect(() => {
    const query = window.matchMedia('(max-width: 800px)');
    const update = () => {
      setMobile(query.matches);
      if (!query.matches) closeForDesktop();
    };
    update();
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);
  return (
    <div {...props} className={cn('fn-application-shell', className)}>
      {!mobile && <div className="fn-shell-sidebar">{sidebar}</div>}
      <div className="fn-main-column">
        {mobile && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <IconButton
                aria-label={`Open ${navigationLabel}`}
                className="fn-shell-menu"
              >
                <Menu size={19} aria-hidden="true" />
              </IconButton>
            </DialogTrigger>
            <DialogContent className="fn-mobile-navigation">
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
  );
}
