import { createRef, useState } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Checkbox, Input } from './controls.js';
import { Label, Fieldset, Switch, ErrorSummary } from './form-parts.js';

it('groups controls, associates feedback and propagates native disabled state', async () => {
  render(
    <Fieldset
      legend="Preferences"
      description="Choose carefully"
      error="Choose one"
      disabled
    >
      <Label>
        <Switch />
        Autosave
      </Label>
      <Label>
        <Checkbox />
        Resolved
      </Label>
    </Fieldset>,
  );
  const group = screen.getByRole('group', { name: 'Preferences' });
  expect(group).toHaveAccessibleDescription('Choose carefully Choose one');
  expect(group).toHaveAttribute('aria-invalid', 'true');
  expect(screen.getByRole('switch', { name: 'Autosave' })).toBeDisabled();
  await userEvent.click(screen.getByRole('checkbox'));
  expect(screen.getByRole('checkbox')).not.toBeChecked();
});

it('submits and resets switches and checkboxes using native form state and refs', async () => {
  const ref = createRef<HTMLInputElement>();
  const result = vi.fn();
  render(
    <form
      onSubmit={(event) => {
        event.preventDefault();
        result(Object.fromEntries(new FormData(event.currentTarget)));
      }}
    >
      <Label>
        <Switch ref={ref} name="autosave" value="enabled" defaultChecked />
        Autosave
      </Label>
      <Label>
        <Checkbox name="resolved" value="show" />
        Resolved
      </Label>
      <button type="submit">Save</button>
      <button type="reset">Reset</button>
    </form>,
  );
  expect(ref.current).toBe(screen.getByRole('switch'));
  await userEvent.click(screen.getByText('Save'));
  expect(result).toHaveBeenLastCalledWith({ autosave: 'enabled' });
  await userEvent.click(screen.getByRole('switch'));
  await userEvent.click(screen.getByRole('checkbox'));
  await userEvent.click(screen.getByText('Save'));
  expect(result).toHaveBeenLastCalledWith({ resolved: 'show' });
  await userEvent.click(screen.getByText('Reset'));
  expect(ref.current).toBeChecked();
  expect(screen.getByRole('checkbox')).not.toBeChecked();
});

it('supports controlled switches without changing their native change event', async () => {
  function Controlled() {
    const [checked, setChecked] = useState(false);
    return (
      <Switch
        aria-label="Autosave"
        checked={checked}
        onChange={(event) => setChecked(event.currentTarget.checked)}
      />
    );
  }
  render(<Controlled />);
  await userEvent.tab();
  await userEvent.keyboard(' ');
  expect(screen.getByRole('switch')).toBeChecked();
});

it('exposes mixed checkbox state, forwards refs, and follows native activation', async () => {
  const ref = createRef<HTMLInputElement>();
  const { rerender } = render(
    <Checkbox ref={ref} indeterminate aria-label="Select all" />,
  );
  expect(ref.current).toBePartiallyChecked();
  await userEvent.click(screen.getByRole('checkbox'));
  expect(ref.current).toBeChecked();
  expect(ref.current).not.toBePartiallyChecked();
  rerender(
    <Checkbox ref={ref} indeterminate={false} aria-label="Select all" />,
  );
  rerender(<Checkbox ref={ref} indeterminate aria-label="Select all" />);
  expect(ref.current).toBePartiallyChecked();
});

it('focuses the linked invalid control and hides an empty error summary', async () => {
  const { rerender } = render(
    <>
      <ErrorSummary
        errors={[{ controlId: 'title:a b', message: 'Enter a title' }]}
      />
      <Label htmlFor="title:a b">Title</Label>
      <Input id="title:a b" required />
    </>,
  );
  expect(screen.getByRole('alert')).toHaveAccessibleName(
    'Please correct the following',
  );
  await userEvent.click(screen.getByRole('link', { name: 'Enter a title' }));
  expect(screen.getByLabelText('Title')).toHaveFocus();
  expect(screen.getByLabelText('Title')).toBeInvalid();
  rerender(<ErrorSummary errors={[]} />);
  expect(screen.queryByRole('alert')).not.toBeInTheDocument();
});
