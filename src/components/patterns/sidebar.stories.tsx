import type { Meta, StoryObj } from '@storybook/react-vite';
import { Sidebar } from './application-shell.js';
const meta = {
  title: 'Patterns/Sidebar',
  component: Sidebar,
  args: {
    label: 'Workspace',
    header: <h2>Fieldnotes</h2>,
    children: (
      <nav aria-label="Pages">
        <a href="#notes">Notes</a>
      </nav>
    ),
    footer: 'Your words. Your workspace.',
  },
} satisfies Meta<typeof Sidebar>;
export default meta;
export const Playground: StoryObj<typeof meta> = {};
