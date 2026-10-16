import { createRef, useState } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Input, Textarea, Select, Checkbox, Radio, Field } from './controls.js';
it('associates unique labels, descriptions and announced errors', () => {
  render(
    <>
      <Field label="Title" description="A short name" error="Required">
        {(props) => <Input {...props} />}
      </Field>
      <Field label="Summary">{(props) => <Textarea {...props} />}</Field>
    </>,
  );
  expect(screen.getByLabelText('Title')).toHaveAccessibleDescription(
    'A short name Required',
  );
  expect(screen.getByLabelText('Title')).toHaveAttribute(
    'aria-invalid',
    'true',
  );
  expect(screen.getByRole('alert')).toHaveTextContent('Required');
  expect(screen.getByLabelText('Title').id).not.toBe(
    screen.getByLabelText('Summary').id,
  );
});
it('preserves native controlled and uncontrolled editing, validation and refs', async () => {
  const ref = createRef<HTMLInputElement>();
  function Form() {
    const [text, setText] = useState('');
    return (
      <>
        <Input
          ref={ref}
          aria-label="Controlled"
          required
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <Textarea aria-label="Notes" defaultValue="Start" />
        <Select aria-label="Sort" defaultValue="recent">
          <option value="recent">Recent</option>
          <option value="title">Title</option>
        </Select>
      </>
    );
  }
  render(<Form />);
  await userEvent.type(screen.getByLabelText('Controlled'), 'Idea');
  await userEvent.type(screen.getByLabelText('Notes'), ' here');
  await userEvent.selectOptions(screen.getByLabelText('Sort'), 'title');
  expect(ref.current).toHaveValue('Idea');
  expect(screen.getByLabelText('Notes')).toHaveValue('Start here');
  expect(screen.getByLabelText('Sort')).toHaveValue('title');
});
it('supports checkbox and exclusive native radio keyboard interaction', async () => {
  render(
    <>
      <label>
        <Checkbox />
        Resolved
      </label>
      <label>
        <Radio name="access" defaultChecked />
        Private
      </label>
      <label>
        <Radio name="access" />
        Public
      </label>
    </>,
  );
  await userEvent.click(screen.getByLabelText('Resolved'));
  expect(screen.getByLabelText('Resolved')).toBeChecked();
  await userEvent.click(screen.getByLabelText('Public'));
  expect(screen.getByLabelText('Public')).toBeChecked();
  expect(screen.getByLabelText('Private')).not.toBeChecked();
});
