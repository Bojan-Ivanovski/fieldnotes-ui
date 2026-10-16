import { createRef } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button, IconButton } from './button';
it('preserves native keyboard activation and ref with a safe form default', async () => {
  const click = vi.fn(),
    submit = vi.fn((e) => e.preventDefault()),
    ref = createRef<HTMLButtonElement>();
  render(
    <form onSubmit={submit}>
      <Button ref={ref} onClick={click}>
        Save
      </Button>
    </form>,
  );
  await userEvent.tab();
  await userEvent.keyboard('{Enter}');
  expect(click).toHaveBeenCalledOnce();
  expect(submit).not.toHaveBeenCalled();
  expect(ref.current).toBe(screen.getByRole('button'));
});
it('blocks loading/disabled actions and announces loading', async () => {
  const click = vi.fn();
  render(
    <Button loading onClick={click}>
      Save
    </Button>,
  );
  expect(screen.getByRole('button')).toBeDisabled();
  expect(screen.getByRole('status')).toHaveTextContent('Loading');
  await userEvent.click(screen.getByRole('button'));
  expect(click).not.toHaveBeenCalled();
});
it('names icon actions and permits explicit submit behavior', async () => {
  const submit = vi.fn((e) => e.preventDefault());
  render(
    <form onSubmit={submit}>
      <IconButton aria-label="Add document" type="submit">
        +
      </IconButton>
    </form>,
  );
  await userEvent.click(screen.getByRole('button', { name: 'Add document' }));
  expect(submit).toHaveBeenCalledOnce();
});
