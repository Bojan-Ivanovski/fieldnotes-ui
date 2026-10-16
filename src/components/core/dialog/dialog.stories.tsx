import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from './dialog';
import { Button } from '../button/button';
import { Field, Input } from '../forms/controls';
import { Stack } from '../../primitives/layout';
const meta = {
  title: 'Core/Dialog',
  component: Dialog,
  render: (args) => (
    <Dialog {...args}>
      <DialogTrigger asChild>
        <Button>Rename document</Button>
      </DialogTrigger>
      <DialogContent>
        <Stack>
          <DialogTitle>A name for your idea</DialogTitle>
          <DialogDescription>
            Choose a title you will recognize later.
          </DialogDescription>
          <Field label="Title">
            {(props) => <Input {...props} defaultValue="A passing thought" />}
          </Field>
          <DialogClose asChild>
            <Button>Save</Button>
          </DialogClose>
        </Stack>
      </DialogContent>
    </Dialog>
  ),
} satisfies Meta<typeof Dialog>;
export default meta;
export const Playground: StoryObj<typeof meta> = {};
export const Open: StoryObj<typeof meta> = { args: { defaultOpen: true } };
