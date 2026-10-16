import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ConfirmDialog } from './confirm-dialog.js';
import { EmptyState } from './empty-state.js';
import { ThemeSelector } from './theme-selector.js';
import { ThemeProvider } from '../../themes/index.js';
it('keeps failed confirmations open and closes successful retries', async () => {
  const confirm = vi
    .fn()
    .mockRejectedValueOnce(new Error('Try again'))
    .mockResolvedValue(undefined);
  render(
    <ConfirmDialog
      title="Delete?"
      description="This cannot be undone."
      trigger={<button>Delete</button>}
      onConfirm={confirm}
    />,
  );
  await userEvent.click(screen.getByText('Delete'));
  expect(screen.getByRole('button', { name: 'Cancel' })).toHaveFocus();
  await userEvent.click(screen.getByRole('button', { name: 'Confirm' }));
  expect(await screen.findByRole('alert')).toHaveTextContent('Try again');
  await userEvent.click(screen.getByRole('button', { name: 'Confirm' }));
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  expect(confirm).toHaveBeenCalledTimes(2);
});
it('blocks dismissal and duplicate submissions during confirmation', async () => {
  let resolve!: () => void;
  const confirm = vi.fn(
    () =>
      new Promise<void>((done) => {
        resolve = done;
      }),
  );
  render(
    <ConfirmDialog
      title="Delete?"
      description="Wait for completion."
      defaultOpen
      onConfirm={confirm}
    />,
  );
  await userEvent.click(screen.getByRole('button', { name: 'Confirm' }));
  await userEvent.keyboard('{Escape}');
  expect(screen.getByRole('dialog')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /Confirm/ })).toBeDisabled();
  resolve();
  await waitFor(() =>
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument(),
  );
  expect(confirm).toHaveBeenCalledOnce();
});
it('renders useful empty-state semantics and drives the current theme', async () => {
  render(
    <ThemeProvider>
      <EmptyState title="No documents" description="Start a thought." />
      <ThemeSelector />
    </ThemeProvider>,
  );
  expect(
    screen.getByRole('heading', { name: 'No documents' }),
  ).toBeInTheDocument();
  await userEvent.selectOptions(screen.getByLabelText('Theme'), 'ocean');
  expect(
    screen.getByLabelText('Theme').closest('[data-fn-theme]'),
  ).toHaveAttribute('data-fn-theme', 'ocean');
});
