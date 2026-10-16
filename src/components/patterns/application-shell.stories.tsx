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
