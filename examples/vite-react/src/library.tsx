import { useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  ThemeProvider,
  ThemeSelector,
  Heading,
  Text,
  Stack,
} from 'fieldnotes-ui';
import { ResourceCard } from 'fieldnotes-ui/composites';
import {
  Button,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from 'fieldnotes-ui/core';
import 'fieldnotes-ui/styles.css';

function Library() {
  const [favorite, setFavorite] = useState(false),
    [message, setMessage] = useState('');
  return (
    <main style={{ padding: 20, maxWidth: 1000, margin: 'auto' }}>
      <Stack>
        <ThemeSelector includeSystem={false} />
        <Heading level={1}>Your library</Heading>
        <Text as="p">
          Resource actions stay separate from opening a document.
        </Text>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns:
              'repeat(auto-fit, minmax(min(100%, 260px), 1fr))',
            gap: 16,
          }}
        >
          <ResourceCard
            headingLevel={2}
            title={<a href="#document">A home for your thoughts</a>}
            description="Follow a native link, or change this document's favorite state."
            metadata={<time dateTime="2026-10-16">Updated October 16</time>}
            actions={
              <Button
                variant="secondary"
                aria-pressed={favorite}
                onClick={() => setFavorite(!favorite)}
              >
                {favorite ? 'Remove favorite' : 'Add favorite'}
              </Button>
            }
          />
          <ResourceCard
            headingLevel={2}
            title={
              <button
                type="button"
                onClick={() => setMessage('Opened unfinished idea.')}
              >
                An unfinished idea
              </button>
            }
            description="A primary application action with an independent management menu."
            actions={
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="secondary">Manage idea</Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem
                    onSelect={() => setMessage('Renamed unfinished idea.')}
                  >
                    Rename
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            }
          />
          <ResourceCard
            headingLevel={2}
            title={
              <button type="button" disabled>
                Deleted document
              </button>
            }
            description="Primary action is disabled while this document is in the trash."
            actions={
              <Button onClick={() => setMessage('Restored deleted document.')}>
                Restore
              </Button>
            }
          />
          <ResourceCard
            headingLevel={2}
            title={
              <a href="#long">
                An
                unbrokenresourceidentifierthatmustfitwithoutoverflowingtheviewport
              </a>
            }
            description="Long titles and cards with no metadata remain readable."
          />
        </div>
        <p role="status">{message}</p>
        <section id="document" aria-labelledby="document-title">
          <Heading id="document-title">A home for your thoughts</Heading>
          <Text as="p">A native link preserves normal browser navigation.</Text>
        </section>
      </Stack>
    </main>
  );
}
createRoot(document.getElementById('root')!).render(
  <ThemeProvider>
    <Library />
  </ThemeProvider>,
);
