import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '../../../themes/theme-provider.js';
import { Button } from '../button/button.js';
import {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from './tooltip.js';
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverClose,
} from './popover.js';
import {
  ToastProvider,
  Toast,
  ToastTitle,
  ToastDescription,
  ToastAction,
  ToastClose,
  ToastViewport,
} from './toast.js';

it('opens a tooltip on keyboard focus, describes its trigger and dismisses with Escape', async () => {
  render(
    <ThemeProvider defaultTheme="ocean">
      <TooltipProvider delayDuration={0}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button>Save</Button>
          </TooltipTrigger>
          <TooltipContent>Keep your changes</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </ThemeProvider>,
  );
  await userEvent.tab();
  const tooltip = await screen.findByRole('tooltip');
  expect(
    screen.getByRole('button', { name: 'Save' }),
  ).toHaveAccessibleDescription('Keep your changes');
  expect(tooltip.closest('[data-fn-theme]')).toHaveAttribute(
    'data-fn-theme',
    'ocean',
  );
  await userEvent.keyboard('{Escape}');
  expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  expect(screen.getByRole('button')).toHaveFocus();
});
it('autofocuses an interactive popover, preserves nested themes and restores focus', async () => {
  render(
    <ThemeProvider>
      <ThemeProvider defaultTheme="warm">
        <Popover>
          <PopoverTrigger asChild>
            <Button>Details</Button>
          </PopoverTrigger>
          <PopoverContent aria-label="Document details">
            <input aria-label="Title" />
            <PopoverClose asChild>
              <Button>Done</Button>
            </PopoverClose>
          </PopoverContent>
        </Popover>
      </ThemeProvider>
    </ThemeProvider>,
  );
  const trigger = screen.getByRole('button', { name: 'Details' });
  await userEvent.click(trigger);
  const dialog = screen.getByRole('dialog', { name: 'Document details' });
  expect(dialog.closest('[data-fn-theme]')).toHaveAttribute(
    'data-fn-theme',
    'warm',
  );
  expect(screen.getByLabelText('Title')).toHaveFocus();
  await userEvent.click(screen.getByRole('button', { name: 'Done' }));
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  expect(trigger).toHaveFocus();
  await userEvent.click(trigger);
  await userEvent.keyboard('{Escape}');
  expect(trigger).toHaveFocus();
});
it('respects controlled popover state when requesting dismissal', async () => {
  const changed = vi.fn();
  render(
    <Popover open onOpenChange={changed}>
      <PopoverContent aria-label="Controlled">
        <PopoverClose>Close</PopoverClose>
      </PopoverContent>
    </Popover>,
  );
  await userEvent.click(screen.getByText('Close'));
  expect(changed).toHaveBeenCalledWith(false);
  expect(screen.getByRole('dialog')).toBeInTheDocument();
});
it('offers toast actions, labelled dismissal and a keyboard notification region', async () => {
  const undo = vi.fn(),
    changed = vi.fn();
  render(
    <ThemeProvider defaultTheme="ocean">
      <ToastProvider duration={Infinity}>
        <Toast open onOpenChange={changed}>
          <ToastTitle>Archived</ToastTitle>
          <ToastDescription>Document moved to archive.</ToastDescription>
          <ToastAction altText="Undo from archive" onClick={undo}>
            Undo
          </ToastAction>
          <ToastClose />
        </Toast>
        <ToastViewport />
      </ToastProvider>
    </ThemeProvider>,
  );
  fireEvent.click(await screen.findByRole('button', { name: 'Undo' }));
  expect(undo).toHaveBeenCalledOnce();
  expect(changed).toHaveBeenCalledWith(false);
  fireEvent.click(screen.getByRole('button', { name: 'Dismiss notification' }));
  expect(screen.getByRole('region')).toHaveAccessibleName('Notifications (F8)');
  expect(
    screen.getByText('Archived').closest('[data-fn-theme]'),
  ).toHaveAttribute('data-fn-theme', 'ocean');
});
