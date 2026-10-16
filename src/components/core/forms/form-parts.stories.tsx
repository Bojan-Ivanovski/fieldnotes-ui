import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button } from '../button/button.js';
import { Checkbox, Field, Input, Radio } from './controls.js';
import { ErrorSummary, Fieldset, Label, Switch } from './form-parts.js';
const meta = {
  title: 'Core/Forms',
  component: Fieldset,
  args: { legend: 'Preferences', disabled: false },
} satisfies Meta<typeof Fieldset>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Grouped: Story = {
  render: (args) => (
    <Fieldset {...args} description="Choose how your workspace behaves.">
      <Label>
        <Switch name="autosave" defaultChecked />
        Autosave
      </Label>
      <Label>
        <Checkbox name="resolved" />
        Show resolved notes
      </Label>
      <Label>
        <Radio name="visibility" value="private" defaultChecked />
        Private
      </Label>
      <Label>
        <Radio name="visibility" value="public" />
        Public
      </Label>
    </Fieldset>
  ),
};
export const MixedCheckbox: Story = {
  render: () => (
    <Label>
      <Checkbox indeterminate />
      Select all documents
    </Label>
  ),
};
function ValidatedForm() {
  const [errors, setErrors] = useState<
    { controlId: string; message: string }[]
  >([]);
  const [saved, setSaved] = useState(false);
  return (
    <form
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        const title = new FormData(event.currentTarget).get('title');
        setErrors(
          title
            ? []
            : [
                {
                  controlId: 'form-story-title',
                  message: 'Enter a document title.',
                },
              ],
        );
        setSaved(Boolean(title));
      }}
      style={{ display: 'grid', gap: 16, maxWidth: 480 }}
    >
      <ErrorSummary errors={errors} />
      <Field
        controlId="form-story-title"
        label="Document title"
        error={errors[0]?.message}
      >
        {(props) => <Input {...props} name="title" required />}
      </Field>
      <Button type="submit">Save document</Button>
      {saved && <p role="status">Saved.</p>}
    </form>
  );
}
export const Validation: Story = { render: () => <ValidatedForm /> };
export const NativeReset: Story = {
  render: () => (
    <form>
      <Fieldset legend="Notifications">
        <Label>
          <Switch name="updates" defaultChecked />
          Email updates
        </Label>
        <Button type="reset" variant="secondary">
          Reset preferences
        </Button>
      </Fieldset>
    </form>
  ),
};
