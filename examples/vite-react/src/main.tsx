import { useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  ThemeProvider,
  defineTheme,
  builtInThemes,
  version,
} from 'fieldnotes-ui';
import {
  Stack,
  Heading,
  Text,
  Spinner,
  VisuallyHidden,
} from 'fieldnotes-ui/primitives';
import {
  Button,
  IconButton,
  Card,
  Badge,
  Alert,
  Input,
  Textarea,
  Select,
  Checkbox,
  Radio,
  Field,
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogClose,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from 'fieldnotes-ui/core';
import {
  SearchField,
  EmptyState,
  ConfirmDialog,
  ThemeSelector,
} from 'fieldnotes-ui/composites';
import {
  ApplicationShell,
  Sidebar,
  ResourceExplorer,
} from 'fieldnotes-ui/patterns';
import { useTheme } from 'fieldnotes-ui/hooks';
import type { ThemeTokens } from 'fieldnotes-ui/themes';
import 'fieldnotes-ui/styles.css';
if (import.meta.env.VITE_CONSUMER_TAILWIND)
  void import('./consumer-tailwind.css');
const tokens: Partial<ThemeTokens> = { primary: '#225577' };
const brand = defineTheme({ name: 'brand', extends: 'ocean', tokens });
function App() {
  const [query, setQuery] = useState(''),
    [selected, setSelected] = useState<string | null>('draft');
  const { resolvedTheme } = useTheme();
  return (
    <ApplicationShell
      mainId="content"
      sidebar={
        <Sidebar
          label="Workspace"
          header={<Heading>Fieldnotes.</Heading>}
          footer={<Text tone="muted">Your words. Your workspace.</Text>}
        >
          <nav aria-label="Resources">
            <ResourceExplorer
              label="Documents"
              items={[
                {
                  id: 'ideas',
                  label: 'Ideas',
                  children: [
                    { id: 'draft', label: 'A passing thought' },
                    { id: 'plan', label: 'Plans for tomorrow' },
                  ],
                },
                { id: 'locked', label: 'Restricted', disabled: true },
              ]}
              defaultExpandedIds={['ideas']}
              selectedId={selected}
              onSelect={setSelected}
            />
          </nav>
        </Sidebar>
      }
      header={
        <Stack direction="horizontal" wrap>
          <Text>Design system preview</Text>
          <Badge>{version}</Badge>
          <Text tone="muted">{resolvedTheme.name}</Text>
        </Stack>
      }
    >
      <Stack gap="lg">
        <Heading level={1}>A home for your thoughts.</Heading>
        <Text as="p" tone="muted">
          Independent components, one familiar visual language.
        </Text>
        <ThemeSelector />
        <SearchField
          label="Search documents"
          value={query}
          onValueChange={setQuery}
        />
        <Card aria-labelledby="card-title">
          <Stack>
            <Heading level={2} id="card-title">
              A passing idea
            </Heading>
            <Text as="p" tone="muted">
              Documents, plans, passing ideas. Make room for what comes next.
            </Text>
            <Stack direction="horizontal" wrap>
              {(
                [
                  'primary',
                  'secondary',
                  'outline',
                  'ghost',
                  'destructive',
                ] as const
              ).map((variant) => (
                <Button
                  variant={variant}
                  key={variant}
                  className={variant === 'primary' ? 'rounded-none' : undefined}
                >
                  {variant}
                </Button>
              ))}
              <IconButton aria-label="Favorite">☆</IconButton>
            </Stack>
            <Stack direction="horizontal">
              <Button loading>Saving</Button>
              <Button disabled>Disabled</Button>
              <Spinner label="Opening" />
            </Stack>
            <Badge tone="success">Saved</Badge>
            <Alert role="note">Your draft is stored locally.</Alert>
            <Field label="Document title" description="A memorable name.">
              {(props) => (
                <Input {...props} placeholder="A thought worth keeping" />
              )}
            </Field>
            <Field label="Comment" error="Write a comment before saving.">
              {(props) => <Textarea {...props} />}
            </Field>
            <Field label="Sort documents">
              {(props) => (
                <Select {...props}>
                  <option>Recent</option>
                  <option>Title</option>
                </Select>
              )}
            </Field>
            <Stack direction="horizontal" wrap>
              <label>
                <Checkbox />
                Show resolved
              </label>
              <label>
                <Radio name="access" defaultChecked />
                Private
              </label>
              <label>
                <Radio name="access" />
                Public
              </label>
            </Stack>
          </Stack>
        </Card>
        <Tabs defaultValue="write">
          <TabsList aria-label="View">
            <TabsTrigger value="write">Write</TabsTrigger>
            <TabsTrigger value="read">Read</TabsTrigger>
            <TabsTrigger value="split" disabled>
              Split
            </TabsTrigger>
          </TabsList>
          <TabsContent value="write">
            Write a little, think a little.
          </TabsContent>
          <TabsContent value="read">Your document preview.</TabsContent>
        </Tabs>
        <Stack direction="horizontal" wrap>
          <Dialog>
            <DialogTrigger asChild>
              <Button>Edit document</Button>
            </DialogTrigger>
            <DialogContent>
              <Stack>
                <DialogTitle>A name for your idea</DialogTitle>
                <DialogDescription>
                  Choose a title you will recognize later.
                </DialogDescription>
                <Field label="New title">
                  {(props) => (
                    <Input {...props} defaultValue="A passing thought" />
                  )}
                </Field>
                <DialogClose asChild>
                  <Button>Done</Button>
                </DialogClose>
              </Stack>
            </DialogContent>
          </Dialog>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary">Actions</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>Duplicate</DropdownMenuItem>
              <DropdownMenuItem disabled>Move</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem destructive>Delete</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <ConfirmDialog
            title="Delete document?"
            description="This cannot be undone."
            trigger={<Button variant="destructive">Delete document</Button>}
            destructive
            onConfirm={() => {
              throw new Error('Demonstration error. Try again later.');
            }}
          />
        </Stack>
        <EmptyState
          title="Room for another thought."
          description="Start a new document when you are ready."
          action={<Button>New document</Button>}
        />
        <ThemeProvider defaultTheme="warm" style={{ padding: 24 }}>
          <Heading level={2}>An isolated preview</Heading>
          <Text>Nested scopes retain their own palette.</Text>
        </ThemeProvider>
        <VisuallyHidden>
          Preview contains {builtInThemes.length} built-in themes.
        </VisuallyHidden>
      </Stack>
    </ApplicationShell>
  );
}
createRoot(document.getElementById('root')!).render(
  <ThemeProvider themes={[brand]}>
    <App />
  </ThemeProvider>,
);
