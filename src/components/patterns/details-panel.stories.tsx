import { useRef, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { DetailsPanel } from './details-panel.js';
import { Button } from '../core/button/button.js';
import { Field, Textarea } from '../core/forms/controls.js';
const meta = {
  title: 'Patterns/DetailsPanel',
  component: DetailsPanel,
  args: { title: 'Supporting details' },
} satisfies Meta<typeof DetailsPanel>;
export default meta;
function NotesPanel() {
  const [open, setOpen] = useState(false);
  const [notes, setNotes] = useState(
    'This consumer-owned note survives panel remounts.',
  );
  const trigger = useRef<HTMLButtonElement>(null);
  return (
    <>
      <Button ref={trigger} aria-expanded={open} onClick={() => setOpen(!open)}>
        Document details
      </Button>
      <DetailsPanel
        title="Supporting details"
        open={open}
        onOpenChange={setOpen}
        returnFocusRef={trigger}
        footer={<p>Resize the viewport to switch between aside and drawer.</p>}
      >
        <Field label="Notes">
          {(props) => (
            <Textarea
              {...props}
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
            />
          )}
        </Field>
      </DetailsPanel>
    </>
  );
}
export const Interactive: StoryObj<typeof meta> = {
  render: () => <NotesPanel />,
};
export const InitiallyOpen: StoryObj<typeof meta> = {
  args: {
    defaultOpen: true,
    children: <p>Outline, metadata, or other supporting content.</p>,
  },
};

function RemovedTriggerPanel() {
  const [open, setOpen] = useState(false);
  const [showTrigger, setShowTrigger] = useState(true);
  const trigger = useRef<HTMLButtonElement>(null);
  const fallback = useRef<HTMLButtonElement>(null);
  return (
    <>
      {showTrigger && (
        <Button ref={trigger} onClick={() => setOpen(true)}>
          Open removable details
        </Button>
      )}
      <Button ref={fallback} variant="outline">
        Document content fallback
      </Button>
      <DetailsPanel
        title="Removable invoker"
        open={open}
        onOpenChange={setOpen}
        returnFocusRef={trigger}
        fallbackFocusRef={fallback}
      >
        <Button onClick={() => setShowTrigger(false)}>
          Remove invoking button
        </Button>
      </DetailsPanel>
    </>
  );
}
export const RemovedTrigger: StoryObj<typeof meta> = {
  render: () => <RemovedTriggerPanel />,
};
