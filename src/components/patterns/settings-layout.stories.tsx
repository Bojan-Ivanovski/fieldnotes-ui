import type { Meta, StoryObj } from '@storybook/react-vite';
import { SettingsLayout } from './settings-layout.js';
import { SettingsExample } from './settings-example.js';
const meta = {
  title: 'Patterns/SettingsLayout',
  component: SettingsLayout,
  args: {
    title: 'Settings',
    description: 'A layout for consumer-owned forms and navigation.',
    children: <p>Compose SettingsSection and native forms here.</p>,
  },
} satisfies Meta<typeof SettingsLayout>;
export default meta;
export const Playground: StoryObj<typeof meta> = {};
export const ComposedForms: StoryObj<typeof meta> = {
  render: () => <SettingsExample />,
};
