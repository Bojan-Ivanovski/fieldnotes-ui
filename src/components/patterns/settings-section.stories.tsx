import type { Meta, StoryObj } from '@storybook/react-vite';
import { SettingsSection } from './settings-layout.js';
import { Field, Input } from '../core/forms/controls.js';
import { Button } from '../core/button/button.js';
const meta = {
  title: 'Patterns/SettingsSection',
  component: SettingsSection,
  args: {
    title: 'Workspace identity',
    description: 'Use a native form around each submission boundary.',
    children: (
      <Field label="Workspace name">
        {(props) => <Input {...props} defaultValue="My workspace" />}
      </Field>
    ),
  },
} satisfies Meta<typeof SettingsSection>;
export default meta;
export const Playground: StoryObj<typeof meta> = {};
export const Destructive: StoryObj<typeof meta> = {
  args: {
    title: 'Danger zone',
    destructive: true,
    description: 'Compose a confirmation before destructive operations.',
    children: <p>Your consumer decides which actions are available.</p>,
    actions: (
      <Button variant="destructive" disabled>
        Delete unavailable
      </Button>
    ),
  },
};
