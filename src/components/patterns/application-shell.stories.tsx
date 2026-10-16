import { useRef, useState } from 'react';
import { DetailsPanel } from './details-panel.js';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { ApplicationShell, Sidebar } from './application-shell.js';
import { Heading, Text } from '../primitives/typography.js';
import { Button } from '../core/button/button.js';
const meta = {
  title: 'Patterns/ApplicationShell',
  component: ApplicationShell,
  args: {
    sidebar: (
      <Sidebar
        label="Workspace"
        header={<Heading>Fieldnotes</Heading>}
        footer={<Text tone="muted">Your words. Your workspace.</Text>}
      >
        <nav aria-label="Documents">
          <Button variant="ghost">All documents</Button>
        </nav>
      </Sidebar>
    ),
    header: <Text tone="muted">Your personal workspace</Text>,
    children: (
      <>
        <Heading level={1}>A home for your thoughts.</Heading>
        <Text as="p">
          Responsive navigation with a modal drawer on narrow screens.
        </Text>
      </>
    ),
  },
} satisfies Meta<typeof ApplicationShell>;
export default meta;
export const Playground: StoryObj<typeof meta> = {};

function DrawerCoordinationDemo() {
  const [navigationOpen, setNavigationOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [rejectClose, setRejectClose] = useState(false);
  const trigger = useRef<HTMLButtonElement>(null);
  return (
    <ApplicationShell
      navigationOpen={navigationOpen}
      onNavigationOpenChange={(next) => {
        if (next || !rejectClose) setNavigationOpen(next);
      }}
      sidebar={
        <Sidebar
          label="Workspace navigation"
          header={<Heading>Workspace</Heading>}
        >
          <Button onClick={() => setDetailsOpen(true)}>
            Open document details from navigation
          </Button>
          <label>
            <input
              type="checkbox"
              checked={rejectClose}
              onChange={(event) => setRejectClose(event.target.checked)}
            />{' '}
            Keep navigation open
          </label>
        </Sidebar>
      }
    >
      <Heading level={1}>Coordinated drawers</Heading>
      <p>
        On mobile, request document details from navigation. If navigation
        rejects closing, details waits until navigation closes.
      </p>
      <Button ref={trigger} onClick={() => setDetailsOpen(true)}>
        Open document details
      </Button>
      <DetailsPanel
        title="Supporting details"
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
        returnFocusRef={trigger}
      >
        <p>One active mobile drawer at a time.</p>
        <label>
          Panel note
          <input aria-label="Panel note" />
        </label>
      </DetailsPanel>
    </ApplicationShell>
  );
}
export const CoordinatedDrawers: StoryObj<typeof meta> = {
  render: () => <DrawerCoordinationDemo />,
};
