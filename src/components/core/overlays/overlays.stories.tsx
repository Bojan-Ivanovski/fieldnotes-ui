import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button } from '../button/button.js';
import { Field, Input } from '../forms/controls.js';
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
import { ThemeProvider } from '../../../themes/theme-provider.js';
const meta = {
  title: 'Core/Overlays',
  component: Popover,
  args: { defaultOpen: false, modal: false },
} satisfies Meta<typeof Popover>;
export default meta;
type Story = StoryObj<typeof meta>;
export const HoverAndFocus: Story = {
  render: () => (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="outline">Save</Button>
        </TooltipTrigger>
        <TooltipContent>Save changes to this document.</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  ),
};
export const InteractivePopover: Story = {
  render: (args) => (
    <Popover {...args}>
      <PopoverTrigger asChild>
        <Button>Document details</Button>
      </PopoverTrigger>
      <PopoverContent aria-label="Document details">
        <Field label="Title">
          {(props) => <Input {...props} defaultValue="A passing thought" />}
        </Field>
        <PopoverClose asChild>
          <Button style={{ marginTop: 16 }}>Done</Button>
        </PopoverClose>
      </PopoverContent>
    </Popover>
  ),
};
export const NestedTheme: Story = {
  render: () => (
    <ThemeProvider defaultTheme="ocean" style={{ padding: 24 }}>
      <Popover>
        <PopoverTrigger asChild>
          <Button>Ocean details</Button>
        </PopoverTrigger>
        <PopoverContent aria-label="Ocean details">
          This portal retains the nested ocean theme.
          <PopoverClose asChild>
            <Button>Close</Button>
          </PopoverClose>
        </PopoverContent>
      </Popover>
    </ThemeProvider>
  ),
};
function Notifications() {
  const [messages, setMessages] = useState<number[]>([]);
  const [restored, setRestored] = useState(false);
  return (
    <ToastProvider duration={5000} swipeDirection="right">
      <Button
        onClick={() =>
          setMessages((items) => [...items, (items.at(-1) ?? 0) + 1])
        }
      >
        Archive document
      </Button>
      {restored && <p role="status">Document restored.</p>}
      {messages.map((id) => (
        <Toast
          key={id}
          onOpenChange={(open) => {
            if (!open)
              setMessages((items) => items.filter((item) => item !== id));
          }}
        >
          <ToastTitle>Document archived</ToastTitle>
          <ToastDescription>
            Find it in the archive, or undo this action.
          </ToastDescription>
          <ToastAction
            altText="Undo archive from the archive page"
            onClick={() => setRestored(true)}
          >
            Undo
          </ToastAction>
          <ToastClose />
        </Toast>
      ))}
      <ToastViewport label="Notifications ({hotkey})" />
    </ToastProvider>
  );
}
export const NotificationsWithUndo: Story = { render: () => <Notifications /> };
function Controlled() {
  const [open, setOpen] = useState(false);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button>Controlled details</Button>
      </PopoverTrigger>
      <PopoverContent aria-label="Controlled details">
        <p>State belongs to the consumer.</p>
        <Button onClick={() => setOpen(false)}>Apply</Button>
      </PopoverContent>
    </Popover>
  );
}
export const ControlledPopover: Story = { render: () => <Controlled /> };
