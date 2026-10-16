'use client';
import { ThemeSelector, ThemeProvider, Button, useTheme } from 'fieldnotes-ui';
import {
  Fieldset,
  Label,
  Switch,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverClose,
  Field,
  Input,
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  ToastProvider,
  ToastViewport,
} from 'fieldnotes-ui/core';
function Content() {
  const { resolvedTheme } = useTheme();
  return (
    <>
      <ThemeSelector />
      <p>Active theme: {resolvedTheme.name}</p>
      <Button onClick={() => window.alert('Saved')}>Save</Button>
      <Fieldset legend="Editor preferences">
        <Label>
          <Switch defaultChecked name="autosave" />
          Autosave
        </Label>
      </Fieldset>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button>Shortcut help</Button>
          </TooltipTrigger>
          <TooltipContent>Control + S saves the document.</TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <Popover>
        <PopoverTrigger asChild>
          <Button>Edit details</Button>
        </PopoverTrigger>
        <PopoverContent aria-label="Document details">
          <Field label="Title">
            {(props) => <Input {...props} defaultValue="SSR document" />}
          </Field>
          <PopoverClose asChild>
            <Button>Apply details</Button>
          </PopoverClose>
        </PopoverContent>
      </Popover>
      <ToastProvider>
        <ToastViewport />
      </ToastProvider>
    </>
  );
}
export function ClientPreview() {
  return (
    <ThemeProvider defaultTheme="ocean">
      <Content />
    </ThemeProvider>
  );
}
