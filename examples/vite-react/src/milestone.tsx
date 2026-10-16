import { useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  ThemeProvider,
  ThemeSelector,
  Stack,
  Heading,
  Text,
} from 'fieldnotes-ui';
import {
  Button,
  Card,
  Input,
  Field,
  Label,
  Fieldset,
  Switch,
  Checkbox,
  ErrorSummary,
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
  Separator,
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverClose,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuItem,
  ToastProvider,
  Toast,
  ToastTitle,
  ToastDescription,
  ToastAction,
  ToastClose,
  ToastViewport,
} from 'fieldnotes-ui/core';
import 'fieldnotes-ui/styles.css';
function Preview() {
  const [errors, setErrors] = useState<
    { controlId: string; message: string }[]
  >([]);
  const [result, setResult] = useState('');
  const [resolved, setResolved] = useState(false),
    [sort, setSort] = useState('recent');
  const [messages, setMessages] = useState<{ id: number; duration: number }[]>(
    [],
  );
  const sequence = useRef(0);
  function notify(duration = 5000) {
    setMessages((items) => [...items, { id: ++sequence.current, duration }]);
  }
  return (
    <ToastProvider swipeDirection="right">
      <TooltipProvider delayDuration={100}>
        <div style={{ padding: 24, maxWidth: 900, margin: 'auto' }}>
          <Stack gap="lg">
            <Heading level={1}>Core, forms and overlays</Heading>
            <Text as="p">
              The 0.2.0 component candidate, installed from the actual package
              tarball.
            </Text>
            <ThemeSelector />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href="/">Workspace</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>Component preview</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
            <Separator />
            <Card>
              <form
                noValidate
                onSubmit={(event) => {
                  event.preventDefault();
                  const data = new FormData(event.currentTarget);
                  const title = String(data.get('title') ?? '').trim();
                  setErrors(
                    title
                      ? []
                      : [
                          {
                            controlId: 'document-title',
                            message: 'Enter a document title.',
                          },
                        ],
                  );
                  setResult(
                    title
                      ? `Saved ${title}; autosave ${data.has('autosave') ? 'on' : 'off'}.`
                      : '',
                  );
                }}
              >
                <Stack>
                  <Heading level={2}>Document preferences</Heading>
                  <ErrorSummary errors={errors} />
                  <Field
                    label="Document title"
                    controlId="document-title"
                    description="A memorable name."
                    error={errors[0]?.message}
                  >
                    {(props) => <Input {...props} name="title" required />}
                  </Field>
                  <Fieldset
                    legend="Editing"
                    description="Settings for this document."
                  >
                    <Label>
                      <Switch name="autosave" defaultChecked />
                      Autosave
                    </Label>
                    <Label>
                      <Checkbox name="selection" indeterminate />
                      Select all sections
                    </Label>
                  </Fieldset>
                  <Fieldset legend="Managed settings" disabled>
                    <Label>
                      <Switch />
                      Organization policy
                    </Label>
                  </Fieldset>
                  <Stack direction="horizontal" wrap>
                    <Button type="submit">Save preferences</Button>
                    <Button
                      type="reset"
                      variant="secondary"
                      onClick={() => {
                        setErrors([]);
                        setResult('');
                      }}
                    >
                      Reset preferences
                    </Button>
                  </Stack>
                  <p role="status">{result}</p>
                </Stack>
              </form>
            </Card>
            <Stack direction="horizontal" wrap>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline">Save shortcut</Button>
                </TooltipTrigger>
                <TooltipContent>
                  Use Control + S to save your document.
                </TooltipContent>
              </Tooltip>
              <Popover>
                <PopoverTrigger asChild>
                  <Button>Document details</Button>
                </PopoverTrigger>
                <PopoverContent aria-label="Document details">
                  <Stack>
                    <Field label="Popover title">
                      {(props) => (
                        <Input {...props} defaultValue="A passing thought" />
                      )}
                    </Field>
                    <PopoverClose asChild>
                      <Button>Apply details</Button>
                    </PopoverClose>
                  </Stack>
                </PopoverContent>
              </Popover>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button>View options</Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuLabel>View</DropdownMenuLabel>
                  <DropdownMenuCheckboxItem
                    checked={resolved}
                    onCheckedChange={(value) => setResolved(value === true)}
                  >
                    Show resolved
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuRadioGroup value={sort} onValueChange={setSort}>
                    <DropdownMenuRadioItem value="recent">
                      Recent first
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="title">
                      Title order
                    </DropdownMenuRadioItem>
                  </DropdownMenuRadioGroup>
                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger>
                      Export format
                    </DropdownMenuSubTrigger>
                    <DropdownMenuSubContent>
                      <DropdownMenuItem
                        onSelect={() => setResult('Exported Markdown.')}
                      >
                        Markdown
                      </DropdownMenuItem>
                      <DropdownMenuItem disabled>PDF</DropdownMenuItem>
                    </DropdownMenuSubContent>
                  </DropdownMenuSub>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button onClick={() => notify()}>Archive document</Button>
              <Button variant="secondary" onClick={() => notify(1200)}>
                Brief notification
              </Button>
            </Stack>
            <ThemeProvider defaultTheme="ocean" style={{ padding: 20 }}>
              <Popover>
                <PopoverTrigger asChild>
                  <Button>Nested ocean details</Button>
                </PopoverTrigger>
                <PopoverContent aria-label="Nested ocean details">
                  <Stack>
                    <Text>Nested portals keep their theme.</Text>
                    <PopoverClose asChild>
                      <Button>Close ocean details</Button>
                    </PopoverClose>
                  </Stack>
                </PopoverContent>
              </Popover>
            </ThemeProvider>
          </Stack>
        </div>
        {messages.map(({ id, duration }) => (
          <Toast
            key={id}
            duration={duration}
            onOpenChange={(open) => {
              if (!open)
                setMessages((items) => items.filter((item) => item.id !== id));
            }}
          >
            <ToastTitle>Document archived</ToastTitle>
            <ToastDescription>
              You can restore it from the archive.
            </ToastDescription>
            <ToastAction
              altText="Undo from the archive page"
              onClick={() => setResult('Document restored.')}
            >
              Undo
            </ToastAction>
            <ToastClose />
          </Toast>
        ))}
        <ToastViewport />
      </TooltipProvider>
    </ToastProvider>
  );
}
createRoot(document.getElementById('root')!).render(
  <main>
    <ThemeProvider>
      <Preview />
    </ThemeProvider>
  </main>,
);
