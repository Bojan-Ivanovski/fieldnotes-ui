import { useRef, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button } from '../../core/button/button.js';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from '../../core/dialog/dialog.js';
interface Entry {
  id: string;
  name: string;
  parent: string | null;
  folder?: boolean;
  writable?: boolean;
  loaded?: boolean;
}
const initial: Entry[] = [
  {
    id: 'ideas',
    name: 'Ideas',
    parent: null,
    folder: true,
    writable: true,
    loaded: true,
  },
  { id: 'draft', name: 'A first draft', parent: 'ideas' },
  {
    id: 'projects',
    name: 'Projects',
    parent: null,
    folder: true,
    writable: true,
    loaded: true,
  },
  { id: 'notes', name: 'Project notes', parent: 'projects' },
  {
    id: 'shared',
    name: 'Shared archive (read only)',
    parent: null,
    folder: true,
    writable: false,
    loaded: true,
  },
  {
    id: 'remote',
    name: 'Remote folder (not loaded)',
    parent: null,
    folder: true,
    writable: true,
    loaded: false,
  },
];
function MovementDemo() {
  const [entries, setEntries] = useState(initial);
  const [source, setSource] = useState<string | null>(null);
  const [dialog, setDialog] = useState(false);
  const [pending, setPending] = useState(false);
  const [fail, setFail] = useState(false);
  const [message, setMessage] = useState('Choose a resource to move.');
  const active = useRef<string | null>(null);
  const busy = useRef(false);
  const latestEntries = useRef(entries);
  const initiator = useRef<HTMLElement | null>(null);
  const initiatorId = useRef<string | null>(null);
  const handles = useRef(new Map<string, HTMLButtonElement>());
  const targets = useRef<HTMLDivElement>(null);
  const pointer = useRef<{
    id: string;
    x: number;
    y: number;
    started: boolean;
  } | null>(null);
  function invalid(
    id: string,
    target: string | null,
    items = latestEntries.current,
  ) {
    const item = items.find((entry) => entry.id === id);
    if (!item) return 'The resource no longer exists.';
    if (item.parent === target) return 'Already in this folder.';
    if (target !== null) {
      const folder = items.find((entry) => entry.id === target);
      if (!folder?.folder) return 'The destination no longer exists.';
      if (!folder.writable) return 'This destination is read only.';
      if (!folder.loaded) return 'Load this destination before moving.';
      let ancestor: Entry | undefined = folder;
      const visited = new Set<string>();
      while (ancestor) {
        if (ancestor.id === id) return 'A folder cannot move inside itself.';
        if (visited.has(ancestor.id))
          return 'The destination ancestry is invalid.';
        visited.add(ancestor.id);
        ancestor = items.find((entry) => entry.id === ancestor!.parent);
      }
    }
    return '';
  }
  function start(
    id: string,
    element: HTMLElement,
    useDialog: boolean,
    focusTargets = true,
  ) {
    if (busy.current) return;
    active.current = id;
    initiator.current = element;
    initiatorId.current = id;
    setSource(id);
    setDialog(useDialog);
    setMessage(
      `Moving ${entries.find((entry) => entry.id === id)?.name}. Choose a destination, or press Escape to cancel.`,
    );
    if (!useDialog && focusTargets)
      requestAnimationFrame(() =>
        targets.current?.querySelector<HTMLButtonElement>('button')?.focus(),
      );
  }
  function restore() {
    requestAnimationFrame(() => {
      if (initiator.current?.isConnected) initiator.current.focus();
      else if (initiatorId.current)
        handles.current.get(initiatorId.current)?.focus();
    });
  }
  function cancel() {
    if (busy.current) return;
    active.current = null;
    setSource(null);
    setDialog(false);
    setMessage('Move cancelled. No resources changed.');
    restore();
  }
  async function move(target: string | null) {
    const id = active.current;
    if (!id || busy.current) return;
    const problem = invalid(id, target);
    if (problem) {
      setMessage(problem);
      return;
    }
    busy.current = true;
    setPending(true);
    setMessage('Moving resource…');
    await new Promise((resolve) => setTimeout(resolve, 500));
    const stale = invalid(id, target);
    if (fail || stale) {
      setMessage(
        stale ||
          'Move failed. The collection is unchanged. Choose a destination to retry.',
      );
    } else {
      const next = latestEntries.current.map((entry) =>
        entry.id === id ? { ...entry, parent: target } : entry,
      );
      latestEntries.current = next;
      setEntries(next);
      const destination =
        next.find((entry) => entry.id === target)?.name ?? 'Library root';
      setMessage(
        `Moved ${next.find((entry) => entry.id === id)?.name} to ${destination}.`,
      );
      active.current = null;
      setSource(null);
      setDialog(false);
      restore();
    }
    busy.current = false;
    setPending(false);
  }
  const destinations = (
    <div
      ref={targets}
      role="group"
      aria-label="Move destination"
      className="fn-move-destinations"
    >
      {[
        { id: null, name: 'Library root' },
        ...entries.filter((entry) => entry.folder),
      ].map((target) => {
        const reason = source ? invalid(source, target.id) : '';
        return (
          <div key={target.id ?? 'root'}>
            <Button
              variant="outline"
              data-move-target={target.id ?? 'root'}
              aria-disabled={!!reason || pending}
              onClick={() => void move(target.id)}
            >
              {target.name}
            </Button>
            {reason && <p className="fn-description">{reason}</p>}
          </div>
        );
      })}
    </div>
  );
  function render(parent: string | null): React.ReactNode {
    return (
      <ul>
        {entries
          .filter((entry) => entry.parent === parent)
          .map((entry) => (
            <li key={entry.id}>
              <div className="fn-workspace-actions">
                <span>{entry.name}</span>
                <button
                  className="fn-control fn-button fn-button-ghost fn-button-sm"
                  ref={(node) => {
                    if (node) handles.current.set(entry.id, node);
                    else handles.current.delete(entry.id);
                  }}
                  aria-label={`Pick up ${entry.name}`}
                  aria-pressed={source === entry.id}
                  disabled={pending}
                  onClick={(event) => {
                    if (pointer.current?.started) {
                      pointer.current = null;
                      return;
                    }
                    start(entry.id, event.currentTarget, false);
                  }}
                  onPointerDown={(event) => {
                    if (event.button !== 0 || pending) return;
                    pointer.current = {
                      id: entry.id,
                      x: event.clientX,
                      y: event.clientY,
                      started: false,
                    };
                    event.currentTarget.setPointerCapture(event.pointerId);
                  }}
                  onPointerMove={(event) => {
                    const gesture = pointer.current;
                    if (!gesture || gesture.id !== entry.id) return;
                    if (
                      !gesture.started &&
                      Math.hypot(
                        event.clientX - gesture.x,
                        event.clientY - gesture.y,
                      ) > 8
                    ) {
                      gesture.started = true;
                      start(entry.id, event.currentTarget, false, false);
                    }
                  }}
                  onPointerUp={(event) => {
                    if (!pointer.current?.started) {
                      pointer.current = null;
                      return;
                    }
                    const target = document
                      .elementFromPoint(event.clientX, event.clientY)
                      ?.closest<HTMLElement>('[data-move-target]');
                    if (target)
                      void move(
                        target.dataset.moveTarget === 'root'
                          ? null
                          : target.dataset.moveTarget!,
                      );
                    else cancel();
                    event.currentTarget.releasePointerCapture(event.pointerId);
                  }}
                  onPointerCancel={() => {
                    pointer.current = null;
                    cancel();
                  }}
                  style={{ touchAction: 'none' }}
                >
                  Move by keyboard or drag
                </button>
                <Button
                  size="sm"
                  variant="ghost"
                  disabled={pending}
                  onClick={(event) =>
                    start(entry.id, event.currentTarget, true)
                  }
                >
                  Move {entry.name}…
                </Button>
              </div>
              {entry.folder && render(entry.id)}
            </li>
          ))}
      </ul>
    );
  }
  return (
    <div
      onKeyDown={(event) => {
        if (event.key === 'Escape' && active.current && !dialog) {
          event.preventDefault();
          cancel();
        }
      }}
    >
      <p>
        Prototype: drag a move handle onto a destination, or activate it with
        Enter/Space and Tab to a destination. Every resource also has a move
        dialog. Destinations are validated again after the simulated request.
      </p>
      <label>
        <input
          type="checkbox"
          checked={fail}
          disabled={pending}
          onChange={(event) => setFail(event.target.checked)}
        />{' '}
        Simulate server rejection
      </label>
      <div className="fn-workspace-actions">
        <Button
          variant="outline"
          onClick={() => {
            const next = latestEntries.current.map((entry) =>
              entry.id === 'projects'
                ? { ...entry, writable: !entry.writable }
                : entry,
            );
            latestEntries.current = next;
            setEntries(next);
            setMessage(
              'Projects access changed. Pending moves will recheck permission.',
            );
          }}
        >
          Toggle Projects write access
        </Button>
        <Button
          variant="outline"
          onClick={() => {
            const next = latestEntries.current.map((entry) =>
              entry.id === 'remote'
                ? { ...entry, loaded: !entry.loaded }
                : entry,
            );
            latestEntries.current = next;
            setEntries(next);
            setMessage(
              'Remote destination availability changed. Only loaded destinations accept moves.',
            );
          }}
        >
          Toggle remote destination loaded
        </Button>
      </div>
      {render(null)}
      <p role="status" aria-live="polite" aria-atomic="true">
        {message}
      </p>
      {source && !dialog && (
        <section aria-label="Choose move destination">
          {destinations}
          <Button variant="ghost" disabled={pending} onClick={cancel}>
            Cancel move
          </Button>
        </section>
      )}
      <Dialog
        open={dialog}
        onOpenChange={(next) => {
          if (!next) cancel();
        }}
      >
        <DialogContent
          showClose={!pending}
          onEscapeKeyDown={(event) => {
            if (busy.current) event.preventDefault();
          }}
          onPointerDownOutside={(event) => {
            if (busy.current) event.preventDefault();
          }}
          onCloseAutoFocus={(event) => {
            event.preventDefault();
            restore();
          }}
        >
          <DialogTitle>Move resource</DialogTitle>
          <DialogDescription>
            Choose a loaded destination where you have permission to move this
            resource.
          </DialogDescription>
          {destinations}
          <p role="status">{message}</p>
          <Button variant="ghost" disabled={pending} onClick={cancel}>
            Cancel move
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
const meta = {
  title: 'Prototypes/ResourceMovement',
  component: MovementDemo,
} satisfies Meta<typeof MovementDemo>;
export default meta;
export const Interactive: StoryObj<typeof meta> = {};
