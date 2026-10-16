import {
  useId,
  useLayoutEffect,
  useImperativeHandle,
  useRef,
  type ComponentPropsWithRef,
  type ReactNode,
} from 'react';
import { cn } from '../../foundations/utilities/cn.js';
import { useControlled } from '../../foundations/utilities/use-controlled.js';
import { Button } from '../core/button/button.js';
export type EditorMode = 'write' | 'split' | 'read';
export interface EditorLayoutProps extends ComponentPropsWithRef<'div'> {
  editor: ReactNode;
  preview: ReactNode;
  mode?: EditorMode;
  defaultMode?: EditorMode;
  onModeChange?: (mode: EditorMode) => void;
  focusMode?: boolean;
  defaultFocusMode?: boolean;
  onFocusModeChange?: (focused: boolean) => void;
  actions?: ReactNode;
  modeLabel?: string;
  editorLabel?: string;
  previewLabel?: string;
  modeLabels?: Partial<Record<EditorMode, string>>;
  enterFocusLabel?: string;
  exitFocusLabel?: string;
  focusLabel?: string;
}
export function EditorLayout({
  editor,
  preview,
  mode: controlledMode,
  defaultMode = 'split',
  onModeChange,
  focusMode: controlledFocus,
  defaultFocusMode = false,
  onFocusModeChange,
  actions,
  modeLabel = 'Editor view',
  editorLabel = 'Editor',
  previewLabel = 'Preview',
  modeLabels,
  enterFocusLabel = 'Enter focus mode',
  exitFocusLabel = 'Exit focus mode',
  focusLabel = 'Focused editor',
  ref,
  onKeyDown,
  children,
  className,
  ...props
}: EditorLayoutProps) {
  const [mode, setMode] = useControlled(
    controlledMode,
    defaultMode,
    onModeChange,
  );
  const [focused, setFocused] = useControlled(
    controlledFocus,
    defaultFocusMode,
    onFocusModeChange,
  );
  const root = useRef<HTMLDivElement>(null);
  useImperativeHandle(ref, () => root.current!, []);
  useLayoutEffect(() => {
    if (!focused || !root.current) return;
    const outside: { element: HTMLElement; inert: boolean }[] = [];
    let current: HTMLElement = root.current;
    while (current.parentElement) {
      for (const sibling of current.parentElement.children) {
        if (
          sibling !== current &&
          sibling instanceof HTMLElement &&
          !['SCRIPT', 'STYLE', 'LINK'].includes(sibling.tagName)
        ) {
          outside.push({ element: sibling, inert: sibling.inert });
          sibling.inert = true;
        }
      }
      current = current.parentElement;
      if (current === document.body) break;
    }
    if (!root.current.contains(document.activeElement))
      root.current.querySelector<HTMLButtonElement>('button')?.focus();
    return () => {
      for (const { element, inert } of outside) element.inert = inert;
    };
  }, [focused]);
  const id = useId();
  const editorRef = useRef<HTMLDivElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const controlsRef = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const active = document.activeElement;
    if (
      (mode === 'read' && editorRef.current?.contains(active)) ||
      (mode === 'write' && previewRef.current?.contains(active))
    ) {
      controlsRef.current
        ?.querySelector<HTMLButtonElement>('[aria-pressed="true"]')
        ?.focus();
    }
  }, [mode]);
  return (
    <div
      {...props}
      ref={root}
      role={focused ? 'dialog' : props.role}
      aria-modal={focused ? true : undefined}
      aria-label={focused ? focusLabel : props['aria-label']}
      onKeyDown={(event) => {
        onKeyDown?.(event);
        if (
          !focused ||
          event.defaultPrevented ||
          !event.currentTarget.contains(event.target as Node)
        )
          return;
        if (event.key === 'Escape') {
          event.preventDefault();
          setFocused(false);
          return;
        }
        if (event.key !== 'Tab' || !root.current) return;
        const controls = Array.from(
          root.current.querySelectorAll<HTMLElement>(
            'button, [href], input, select, textarea, [tabindex]',
          ),
        ).filter(
          (element) =>
            element.tabIndex >= 0 &&
            !element.matches(':disabled') &&
            !element.closest('[hidden], [inert]') &&
            element.getClientRects().length > 0,
        );
        const first = controls[0],
          last = controls[controls.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last?.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first?.focus();
        }
      }}
      className={cn('fn-editor-layout', className)}
      data-mode={mode}
      data-focus={focused || undefined}
    >
      <div className="fn-editor-controls">
        <div
          ref={controlsRef}
          role="group"
          aria-label={modeLabel}
          className="fn-workspace-actions"
        >
          {(['write', 'split', 'read'] as const).map((value) => (
            <Button
              key={value}
              variant={mode === value ? 'secondary' : 'ghost'}
              aria-pressed={mode === value}
              aria-controls={
                value === 'split'
                  ? `${id}-editor ${id}-preview`
                  : `${id}-${value === 'write' ? 'editor' : 'preview'}`
              }
              onClick={() => setMode(value)}
            >
              {modeLabels?.[value] ??
                { write: 'Write', split: 'Split', read: 'Read' }[value]}
            </Button>
          ))}
        </div>
        {actions && <div className="fn-workspace-actions">{actions}</div>}
        <Button
          variant="ghost"
          aria-pressed={focused}
          onClick={() => setFocused(!focused)}
        >
          {focused ? exitFocusLabel : enterFocusLabel}
        </Button>
      </div>
      <div className="fn-editor-panes">
        <div
          ref={editorRef}
          id={`${id}-editor`}
          role="region"
          aria-label={editorLabel}
          hidden={mode === 'read'}
          className="fn-editor-pane"
        >
          {editor}
        </div>
        <div
          ref={previewRef}
          id={`${id}-preview`}
          role="region"
          aria-label={previewLabel}
          hidden={mode === 'write'}
          className="fn-editor-pane"
        >
          {preview}
        </div>
      </div>
      {children}
    </div>
  );
}
