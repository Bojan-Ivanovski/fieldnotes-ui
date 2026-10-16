import { useRef, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { DocumentWorkspace, OperationStatus } from './document-workspace.js';
import { EditorLayout } from './editor-layout.js';
import { DetailsPanel } from './details-panel.js';
import { SettingsExample } from './settings-example.js';
import { Button } from '../core/button/button.js';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuSeparator,
} from '../core/navigation/dropdown-menu.js';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from '../core/dialog/dialog.js';
import { ConfirmDialog } from '../composites/confirm-dialog.js';
const meta = {
  title: 'Patterns/DocumentWorkspace',
  component: DocumentWorkspace,
  args: { title: 'A place for unfinished ideas' },
} satisfies Meta<typeof DocumentWorkspace>;
export default meta;
function WorkspaceDemo({
  initialReadOnly = false,
}: { initialReadOnly?: boolean } = {}) {
  const [readOnly, setReadOnly] = useState(initialReadOnly);
  const saving = useRef(false);
  const [text, setText] = useState(
    'A quiet place to think.\n\nStart writing here.',
  );
  const [state, setState] = useState<'saved' | 'saving' | 'unsaved' | 'error'>(
    'saved',
  );
  const [panel, setPanel] = useState(false);
  const [fail, setFail] = useState(false);
  const [note, setNote] = useState('');
  const detailsButton = useRef<HTMLButtonElement>(null);
  const editor = useRef<HTMLTextAreaElement>(null);
  const revision = useRef(0);
  function download() {
    const url = URL.createObjectURL(
      new Blob([text], { type: 'text/plain;charset=utf-8' }),
    );
    const link = document.createElement('a');
    link.href = url;
    link.download = 'unfinished-ideas.txt';
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  async function save() {
    if (saving.current || readOnly) return;
    saving.current = true;
    const savingRevision = revision.current;
    setState('saving');
    await new Promise((resolve) => setTimeout(resolve, 600));
    saving.current = false;
    setState(
      fail
        ? 'error'
        : revision.current === savingRevision
          ? 'saved'
          : 'unsaved',
    );
  }
  return (
    <DocumentWorkspace
      title="A place for unfinished ideas"
      breadcrumbs={
        <nav aria-label="Breadcrumb">
          <a href="#library">Library</a> / Ideas
        </nav>
      }
      metadata="Personal workspace · Edited just now"
      actions={
        <>
          <Button
            onClick={save}
            disabled={readOnly}
            loading={state === 'saving'}
          >
            Save
          </Button>
          <Button
            ref={detailsButton}
            variant="outline"
            aria-expanded={panel}
            onClick={() => setPanel(!panel)}
          >
            Details
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost">More document actions</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onSelect={download}>
                Download text
              </DropdownMenuItem>
              <DropdownMenuCheckboxItem
                checked={readOnly}
                onCheckedChange={(value) => setReadOnly(value === true)}
              >
                Read only
              </DropdownMenuCheckboxItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem disabled>
                Share (not configured)
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </>
      }
      status={
        <OperationStatus
          state={state}
          actions={
            state === 'error' ? (
              <>
                <Button size="sm" onClick={save}>
                  Retry save
                </Button>
                <Button size="sm" variant="outline" onClick={download}>
                  Download unsaved copy
                </Button>
              </>
            ) : undefined
          }
        />
      }
      panel={
        <DetailsPanel
          title="Document details"
          open={panel}
          onOpenChange={setPanel}
          returnFocusRef={detailsButton}
          fallbackFocusRef={editor}
        >
          <p>Keep supporting notes alongside your writing.</p>
          <label htmlFor="workspace-note">Notes</label>
          <textarea
            id="workspace-note"
            value={note}
            onChange={(event) => setNote(event.target.value)}
            style={{ width: '100%', minHeight: 140 }}
          />
          <p>Created today · Private</p>
        </DetailsPanel>
      }
    >
      <EditorLayout
        editor={
          <textarea
            ref={editor}
            aria-label="Document text"
            readOnly={readOnly}
            value={text}
            onChange={(event) => {
              revision.current += 1;
              setText(event.target.value);
              if (!saving.current) setState('unsaved');
            }}
            style={{
              width: '100%',
              minHeight: 320,
              resize: 'vertical',
              font: 'inherit',
            }}
          />
        }
        preview={
          <article style={{ whiteSpace: 'pre-wrap' }}>
            {text || 'Your preview appears here.'}
          </article>
        }
        actions={
          <label>
            <input
              type="checkbox"
              checked={fail}
              onChange={(event) => setFail(event.target.checked)}
            />{' '}
            Simulate save failure
          </label>
        }
      />
    </DocumentWorkspace>
  );
}
export const Interactive: StoryObj<typeof meta> = {
  render: () => <WorkspaceDemo />,
};
export const ReadOnly: StoryObj<typeof meta> = {
  render: () => <WorkspaceDemo initialReadOnly />,
};
export const LongTitle: StoryObj<typeof meta> = {
  args: {
    title:
      'An unusually long document title that should remain readable when the available space becomes narrow',
    metadata: 'Read only',
    actions: (
      <>
        <Button>Edit copy</Button>
        <Button variant="outline">Download</Button>
      </>
    ),
    status: <OperationStatus state="saved" />,
    children: <p>This document can be read without an editor.</p>,
  },
};
export const Settings: StoryObj<typeof meta> = {
  render: () => <SettingsExample />,
};

function ModalSettingsDemo() {
  const [open, setOpen] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [pending, setPending] = useState(false);
  const [confirmLeave, setConfirmLeave] = useState(false);
  const [message, setMessage] = useState('');
  function change(next: boolean) {
    if (next) {
      setOpen(true);
      setMessage('');
      return;
    }
    if (pending) {
      setMessage('Wait until saving finishes.');
      return;
    }
    if (dirty) {
      setConfirmLeave(true);
      return;
    }
    setOpen(false);
  }
  return (
    <>
      <Dialog open={open} onOpenChange={change}>
        <DialogTrigger asChild>
          <Button>Open settings</Button>
        </DialogTrigger>
        <DialogContent
          style={{ width: 'min(64rem, calc(100vw - 2rem))' }}
          onEscapeKeyDown={(event) => {
            if (pending) event.preventDefault();
          }}
          onPointerDownOutside={(event) => {
            if (pending) event.preventDefault();
          }}
        >
          <DialogTitle className="fn-sr-only">Workspace settings</DialogTitle>
          <DialogDescription className="fn-sr-only">
            Change your workspace preferences. Unsaved changes require
            confirmation before closing.
          </DialogDescription>
          <SettingsExample
            onDirtyChange={setDirty}
            onPendingChange={setPending}
          />
          <p role="status">{message}</p>
          <ConfirmDialog
            title="Close without saving?"
            description="Your unsaved settings will be discarded."
            confirmLabel="Discard and close"
            cancelLabel="Keep editing"
            open={confirmLeave}
            onOpenChange={setConfirmLeave}
            onConfirm={() => {
              setConfirmLeave(false);
              setOpen(false);
              setDirty(false);
            }}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
export const ModalSettings: StoryObj<typeof meta> = {
  render: () => <ModalSettingsDemo />,
};
