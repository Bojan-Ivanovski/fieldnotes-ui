import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '../../../themes/index.js';
import { Button } from '../button/button.js';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from './dialog.js';
it('names, focuses, dismisses and restores focus within a nested theme', async () => {
  render(
    <ThemeProvider>
      <ThemeProvider defaultTheme="ocean">
        <Dialog>
          <DialogTrigger asChild>
            <Button>Open</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogTitle>Rename</DialogTitle>
            <DialogDescription>Choose a name</DialogDescription>
            <input aria-label="Title" />
          </DialogContent>
        </Dialog>
      </ThemeProvider>
    </ThemeProvider>,
  );
  const trigger = screen.getByRole('button', { name: 'Open' });
  await userEvent.click(trigger);
  const dialog = screen.getByRole('dialog', { name: 'Rename' });
  expect(dialog).toHaveAccessibleDescription('Choose a name');
  expect(dialog.closest('[data-fn-theme]')).toHaveAttribute(
    'data-fn-theme',
    'ocean',
  );
  expect(within(dialog).getByLabelText('Title')).toHaveFocus();
  await userEvent.keyboard('{Escape}');
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  expect(trigger).toHaveFocus();
});
it('provides a close button and supports controlled state', async () => {
  const change = vi.fn();
  render(
    <Dialog open onOpenChange={change}>
      <DialogContent>
        <DialogTitle>Settings</DialogTitle>
        <DialogDescription>Preferences</DialogDescription>
      </DialogContent>
    </Dialog>,
  );
  await userEvent.click(screen.getByRole('button', { name: 'Close dialog' }));
  expect(change).toHaveBeenCalledWith(false);
  expect(screen.getByRole('dialog')).toBeInTheDocument();
});
