import type { Meta, StoryObj } from '@storybook/react-vite';
import { Field, Input, Textarea, Select, Checkbox, Radio } from './controls.js';
import { Stack } from '../../primitives/layout.js';
const meta = {
  title: 'Core/Field',
  component: Field,
  args: {
    label: 'Document title',
    description: 'Keep it short and memorable.',
    children: (props) => <Input {...props} placeholder="A passing idea" />,
  },
} satisfies Meta<typeof Field>;
export default meta;
export const Playground: StoryObj<typeof meta> = {};
export const Error: StoryObj<typeof meta> = {
  args: { error: 'A title is required.' },
};
export const Controls: StoryObj<typeof meta> = {
  render: () => (
    <Stack>
      <Field label="Notes">{(props) => <Textarea {...props} rows={4} />}</Field>
      <Field label="Sort">
        {(props) => (
          <Select {...props}>
            <option>Recently edited</option>
            <option>Title</option>
          </Select>
        )}
      </Field>
      <label>
        <Checkbox /> Show resolved
      </label>
      <label>
        <Radio name="visibility" defaultChecked /> Private
      </label>
      <label>
        <Radio name="visibility" /> Public
      </label>
      <Input
        aria-label="Unavailable title"
        disabled
        placeholder="Unavailable"
      />
    </Stack>
  ),
};
