import { useRef, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { DocumentWorkspace, OperationStatus } from './document-workspace.js';
import { EditorLayout } from './editor-layout.js';
import { DetailsPanel } from './details-panel.js';
import { SettingsExample } from './settings-example.js';
import { Button } from '../core/button/button.js';
const meta = {
  title: 'Patterns/DocumentWorkspace',
  component: DocumentWorkspace,
  args: { title: 'A place for unfinished ideas' },
} satisfies Meta<typeof DocumentWorkspace>;
export default meta;
function WorkspaceDemo() {
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
  async function save() {
    const savingRevision = revision.current;
    setState('saving');
    await new Promise((resolve) => setTimeout(resolve, 600));
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
          <Button onClick={save} loading={state === 'saving'}>
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
        </>
      }
      status={
        <OperationStatus
          state={state}
          actions={
            state === 'error' ? (
              <Button size="sm" onClick={save}>
                Retry save
              </Button>
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
            value={text}
            onChange={(event) => {
              revision.current += 1;
              setText(event.target.value);
              setState('unsaved');
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
