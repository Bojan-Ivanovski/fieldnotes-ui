import { useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  ThemeProvider,
  ThemeSelector,
  Heading,
  Text,
  Stack,
} from 'fieldnotes-ui';
import {
  Navigation,
  NavigationGroup,
  NavigationLink,
  NavigationButton,
} from 'fieldnotes-ui/composites';
import { ApplicationShell, Sidebar } from 'fieldnotes-ui/patterns';
import { Checkbox, Button } from 'fieldnotes-ui/core';
import 'fieldnotes-ui/styles.css';
function Example() {
  const [open, setOpen] = useState(false),
    [allowed, setAllowed] = useState(false),
    [pending, setPending] = useState(false);
  const [view, setView] = useState('All documents'),
    [status, setStatus] = useState('');
  async function navigate(next: string) {
    if (pending) return;
    setPending(true);
    setStatus('Checking unsaved changes…');
    await new Promise((resolve) => setTimeout(resolve, 200));
    setPending(false);
    if (!allowed) {
      setStatus('Navigation cancelled. Your edits are still here.');
      return;
    }
    setView(next);
    setStatus('Navigation accepted.');
    setOpen(false);
  }
  return (
    <ApplicationShell
      navigationOpen={open}
      onNavigationOpenChange={setOpen}
      sidebar={
        <Sidebar
          label="Workspace"
          header={<Heading>Fieldnotes</Heading>}
          footer={
            <Stack>
              <label>
                <Checkbox
                  checked={allowed}
                  onChange={(event) => setAllowed(event.target.checked)}
                />
                Permit navigation
              </label>
              <p role="status">{status}</p>
            </Stack>
          }
        >
          <Navigation label="Library">
            <NavigationGroup
              title="Your library"
              actions={
                <Button
                  size="sm"
                  onClick={() => setStatus('Create document requested.')}
                >
                  New
                </Button>
              }
            >
              <NavigationButton
                current={view === 'All documents'}
                count={12}
                icon="▤"
                disabled={pending}
                onClick={() => void navigate('All documents')}
              >
                All documents
              </NavigationButton>
              <NavigationButton
                current={view === 'Favorites'}
                count={0}
                icon="★"
                disabled={pending}
                onClick={() => void navigate('Favorites')}
              >
                Favorites
              </NavigationButton>
              <NavigationLink href="#archive">Archive</NavigationLink>
              <NavigationButton disabled>
                Unavailable workspace
              </NavigationButton>
            </NavigationGroup>
          </Navigation>
        </Sidebar>
      }
    >
      <Stack>
        <ThemeSelector includeSystem={false} />
        <Heading level={1}>Your workspace</Heading>
        <Text as="p">Selected view: {view}</Text>
        <label>
          Unsaved text <input defaultValue="A thought worth keeping" />
        </label>
        <section id="archive" aria-labelledby="archive-title">
          <Heading id="archive-title">Archive</Heading>
          <Text as="p">Links retain ordinary browser navigation.</Text>
        </section>
      </Stack>
    </ApplicationShell>
  );
}
createRoot(document.getElementById('root')!).render(
  <ThemeProvider>
    <Example />
  </ThemeProvider>,
);
