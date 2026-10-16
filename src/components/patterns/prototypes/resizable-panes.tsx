import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { useControlled } from '../../../foundations/utilities/use-controlled.js';
import { cn } from '../../../foundations/utilities/cn.js';

/** Interaction prototype; deliberately not part of the public package exports. */
export interface ResizablePanesProps {
  first: ReactNode;
  second: ReactNode;
  label: string;
  size?: number;
  defaultSize?: number;
  onSizeChange?: (percentage: number) => void;
  min?: number;
  max?: number;
  className?: string;
}
export function ResizablePanes({
  first,
  second,
  label,
  size: controlledSize,
  defaultSize = 50,
  onSizeChange,
  min = 20,
  max = 80,
  className,
}: ResizablePanesProps) {
  const [size, setSize] = useControlled(
    controlledSize,
    defaultSize,
    onSizeChange,
  );
  const [stacked, setStacked] = useState(false);
  const container = useRef<HTMLDivElement>(null);
  const dragging = useRef<{ pointer: number; start: number } | null>(null);
  const id = useId();
  const lower = Math.max(0, Math.min(min, max, 100));
  const upper = Math.max(lower, Math.min(100, Math.max(min, max)));
  const clamp = (value: number) => Math.max(lower, Math.min(upper, value));
  const value = clamp(size);
  useEffect(() => {
    const query = window.matchMedia('(max-width: 800px)');
    const update = () => {
      setStacked(query.matches);
      dragging.current = null;
    };
    update();
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);
  return (
    <div
      ref={container}
      className={cn('fn-resizable-panes', className)}
      style={{
        gridTemplateColumns: stacked
          ? 'minmax(0, 1fr)'
          : `minmax(0, ${value}fr) auto minmax(0, ${100 - value}fr)`,
      }}
    >
      <div id={`${id}-first`} className="fn-resizable-pane">
        {first}
      </div>
      <div
        role="separator"
        aria-label={label}
        aria-orientation="vertical"
        aria-controls={`${id}-first ${id}-second`}
        aria-valuemin={lower}
        aria-valuemax={upper}
        aria-valuenow={value}
        aria-valuetext={`${Math.round(value)} percent`}
        tabIndex={stacked ? -1 : 0}
        hidden={stacked}
        className="fn-control fn-resize-handle"
        onDoubleClick={() => setSize(clamp(defaultSize))}
        onKeyDown={(event) => {
          let next: number;
          const rtl = getComputedStyle(event.currentTarget).direction === 'rtl';
          const step = event.shiftKey ? 10 : 2;
          switch (event.key) {
            case 'ArrowLeft':
              next = value + (rtl ? step : -step);
              break;
            case 'ArrowRight':
              next = value + (rtl ? -step : step);
              break;
            case 'Home':
              next = lower;
              break;
            case 'End':
              next = upper;
              break;
            case 'Enter':
              next = defaultSize;
              break;
            case 'Escape':
              if (!dragging.current) return;
              next = dragging.current.start;
              dragging.current = null;
              break;
            default:
              return;
          }
          event.preventDefault();
          setSize(clamp(next));
        }}
        onPointerDown={(event) => {
          if (event.button !== 0 || stacked) return;
          event.preventDefault();
          event.currentTarget.focus();
          dragging.current = { pointer: event.pointerId, start: value };
          event.currentTarget.setPointerCapture(event.pointerId);
        }}
        onPointerMove={(event) => {
          if (
            dragging.current?.pointer !== event.pointerId ||
            !container.current
          )
            return;
          const rect = container.current.getBoundingClientRect();
          if (!rect.width) return;
          const rtl = getComputedStyle(event.currentTarget).direction === 'rtl';
          const next = ((event.clientX - rect.left) / rect.width) * 100;
          setSize(clamp(rtl ? 100 - next : next));
        }}
        onPointerUp={(event) => {
          if (dragging.current?.pointer === event.pointerId) {
            dragging.current = null;
            event.currentTarget.releasePointerCapture(event.pointerId);
          }
        }}
        onPointerCancel={() => {
          if (dragging.current) setSize(dragging.current.start);
          dragging.current = null;
        }}
        onLostPointerCapture={() => {
          dragging.current = null;
        }}
      >
        <span aria-hidden="true">⋮</span>
      </div>
      <div id={`${id}-second`} className="fn-resizable-pane">
        {second}
      </div>
    </div>
  );
}
