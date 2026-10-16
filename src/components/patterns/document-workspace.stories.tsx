import { useRef, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { DocumentWorkspace, OperationStatus } from './document-workspace.js';
import { EditorLayout } from './editor-layout.js';
import { DetailsPanel } from './details-panel.js';
import { SettingsLayout, SettingsSection } from './settings-layout.js';
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
  async function save() {
    setState('saving');
    await new Promise((resolve) => setTimeout(resolve, 600));
    setState(fail ? 'error' : 'saved');
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
function SettingsDemo() {
  const [name, setName] = useState('My workspace');
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState('');
  return (
    <SettingsLayout
      title="Settings"
      description="Choose how your workspace feels."
      navigation={
        <nav aria-label="Settings sections">
          <a href="#general-settings">General</a>
          <br />
          <a href="#danger-settings">Danger zone</a>
        </nav>
      }
    >
      <form
        onSubmit={async (event) => {
          event.preventDefault();
          setPending(true);
          setMessage('');
          await new Promise((resolve) => setTimeout(resolve, 600));
          setPending(false);
          setMessage('Settings saved');
        }}
      >
        <SettingsSection
          id="general-settings"
          title="General"
          description="Your workspace identity."
          actions={
            <Button type="submit" loading={pending}>
              Save settings
            </Button>
          }
        >
          <label htmlFor="workspace-name">Workspace name</label>
          <input
            id="workspace-name"
            required
            value={name}
            onChange={(event) => {
              setName(event.target.value);
              setMessage('Unsaved changes');
            }}
          />
          <p role="status">{message}</p>
        </SettingsSection>
      </form>
      <SettingsSection
        id="danger-settings"
        title="Danger zone"
        destructive
        description="Actions that affect the whole workspace."
        actions={
          <Button
            variant="destructive"
            onClick={() =>
              setMessage('Deletion requires confirmation in your application.')
            }
          >
            Delete workspace
          </Button>
        }
      >
        <p>Export your documents before removing a workspace.</p>
      </SettingsSection>
    </SettingsLayout>
  );
}
export const Settings: StoryObj<typeof meta> = {
  render: () => <SettingsDemo />,
};
