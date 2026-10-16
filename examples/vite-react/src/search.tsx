import { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  ThemeProvider,
  ThemeSelector,
  Heading,
  Text,
  Stack,
} from 'fieldnotes-ui';
import {
  SearchField,
  SearchResults,
  LoadMoreButton,
  ResourceCard,
  EmptyState,
} from 'fieldnotes-ui/composites';
import { Alert, Button } from 'fieldnotes-ui/core';
import 'fieldnotes-ui/styles.css';

// Deterministic simulated service: the application, not the package, owns it.
const documents = ['Idea one', 'Idea two', 'Idea three', 'Quiet notes'].map(
  (title, index) => ({ id: String(index), title }),
);
type Document = (typeof documents)[number];
async function request(query: string, offset: number, attempt: number) {
  await new Promise((resolve) =>
    setTimeout(resolve, query === 'slow' ? 800 : 200),
  );
  if (
    (query === 'error' && offset === 0 && attempt === 0) ||
    (offset > 0 && attempt === 0)
  )
    throw new Error('Documents could not be loaded. Try again.');
  const matches = ['slow', 'fast', 'error'].includes(query)
    ? [
        {
          id: query,
          title:
            query === 'error'
              ? 'Recovered document'
              : `${query === 'slow' ? 'Slow' : 'Fast'} result`,
        },
      ]
    : documents.filter((item) =>
        item.title.toLowerCase().includes(query.toLowerCase()),
      );
  return { items: matches.slice(offset, offset + 2), total: matches.length };
}
function ResultList({
  items,
  headingLevel = 3,
}: {
  items: Document[];
  headingLevel?: 3 | 4;
}) {
  return (
    <ul
      style={{
        listStyle: 'none',
        margin: 0,
        padding: 0,
        display: 'grid',
        gap: 12,
      }}
    >
      {items.map((item) => (
        <li key={item.id}>
          <ResourceCard
            headingLevel={headingLevel}
            title={<a href={`#document-${item.id}`}>{item.title}</a>}
            description="A document in your library."
          />
        </li>
      ))}
    </ul>
  );
}
function Example() {
  const [draft, setDraft] = useState(''),
    [query, setQuery] = useState(''),
    [shownQuery, setShownQuery] = useState('');
  const [items, setItems] = useState<Document[]>([]),
    [total, setTotal] = useState(0);
  const [phase, setPhase] = useState<
    'initial' | 'loading' | 'ready' | 'failed'
  >('initial');
  const [morePending, setMorePending] = useState(false),
    [moreError, setMoreError] = useState('');
  const [local, setLocal] = useState('');
  const generation = useRef(0),
    attempts = useRef(new Map<string, number>()),
    appendAttempt = useRef(0),
    appending = useRef(false);
  useEffect(
    () => () => {
      generation.current++;
    },
    [],
  );
  async function search(next: string) {
    const token = ++generation.current;
    const attempt = attempts.current.get(next) ?? 0;
    attempts.current.set(next, attempt + 1);
    setQuery(next);
    setPhase('loading');
    setMoreError('');
    setMorePending(false);
    appendAttempt.current = 0;
    appending.current = false;
    try {
      const result = await request(next, 0, attempt);
      if (generation.current !== token) return;
      setItems(result.items);
      setTotal(result.total);
      setShownQuery(next);
      setPhase('ready');
    } catch {
      if (generation.current === token) setPhase('failed');
    }
  }
  function edit(value: string) {
    setDraft(value);
    if (!value) {
      generation.current++;
      setQuery('');
      setShownQuery('');
      setItems([]);
      setTotal(0);
      setPhase('initial');
      setMoreError('');
      setMorePending(false);
      appending.current = false;
    }
  }
  async function more() {
    if (appending.current || phase !== 'ready' || items.length >= total) return;
    const token = generation.current;
    appending.current = true;
    setMorePending(true);
    setMoreError('');
    try {
      const result = await request(
        query,
        items.length,
        appendAttempt.current++,
      );
      if (generation.current !== token) return;
      setItems((previous) => [...previous, ...result.items]);
      setTotal(result.total);
    } catch {
      if (generation.current === token)
        setMoreError(
          'More documents could not be loaded. Existing results are still available.',
        );
    } finally {
      if (generation.current === token) {
        appending.current = false;
        setMorePending(false);
      }
    }
  }
  const summary =
    phase === 'initial'
      ? 'Search to find a document.'
      : phase === 'loading'
        ? `Searching for ${query || 'all documents'}…${items.length ? ` Showing ${items.length} previous results.` : ''}`
        : phase === 'failed'
          ? `Search failed.${items.length ? ` Showing previous results for ${shownQuery || 'all documents'}.` : ''}`
          : `${total} ${total === 1 ? 'document' : 'documents'} found; ${items.length} shown.`;
  const filtered = documents.filter((item) =>
    item.title.toLowerCase().includes(local.toLowerCase()),
  );
  return (
    <main style={{ maxWidth: 800, margin: 'auto', padding: 20 }}>
      <Stack>
        <ThemeSelector includeSystem={false} />
        <Heading level={1}>Search your library</Heading>
        <Text as="p">
          Submitted search keeps draft text separate from the results. Try
          “idea”, “missing”, or “error”. Submit “slow” then “fast” to
          demonstrate stale-response protection. The first load-more attempt
          deliberately fails so you can retry.
        </Text>
        <form
          role="search"
          aria-label="Submitted document search"
          onSubmit={(event) => {
            event.preventDefault();
            void search(draft.trim());
          }}
        >
          <Stack>
            <SearchField
              label="Search documents"
              value={draft}
              onValueChange={edit}
            />
            <Button type="submit">Search</Button>
          </Stack>
        </form>
        <SearchResults
          title="Search results"
          announcement={
            morePending
              ? `Loading more documents… ${items.length} previous results remain available.`
              : summary
          }
          loading={phase === 'loading'}
        >
          <Stack>
            {phase === 'initial' && (
              <EmptyState
                title="Find a thought"
                description="Enter a query to begin."
              />
            )}
            {phase === 'loading' && !items.length && (
              <Text as="p">Loading documents…</Text>
            )}
            {phase === 'failed' && (
              <Alert role="alert" tone="destructive">
                Documents could not be loaded.{' '}
                <Button onClick={() => void search(query)}>Try again</Button>
              </Alert>
            )}
            {phase === 'ready' && !items.length && (
              <EmptyState
                title="No matching documents"
                description="Try another search or clear your query."
              />
            )}
            {items.length > 0 && <ResultList items={items} />}
            {moreError && (
              <Alert role="alert" tone="destructive">
                {moreError}
              </Alert>
            )}
            {items.length > 0 && (
              <LoadMoreButton
                pending={morePending}
                aria-disabled={phase !== 'ready' || items.length >= total}
                onClick={() => void more()}
              >
                {items.length >= total
                  ? 'All results loaded'
                  : moreError
                    ? 'Retry more results'
                    : 'Load more results'}
              </LoadMoreButton>
            )}
          </Stack>
        </SearchResults>
        <section aria-labelledby="local-title">
          <Stack>
            <Heading id="local-title">Local live filtering</Heading>
            <SearchField
              label="Filter loaded documents"
              value={local}
              onValueChange={setLocal}
            />
            <SearchResults
              title="Local results"
              headingLevel={3}
              announcement={`${filtered.length} loaded documents match.`}
            >
              {filtered.length ? (
                <ResultList items={filtered} headingLevel={4} />
              ) : (
                <EmptyState title="No local matches" />
              )}
            </SearchResults>
          </Stack>
        </section>
      </Stack>
    </main>
  );
}
createRoot(document.getElementById('root')!).render(
  <ThemeProvider>
    <Example />
  </ThemeProvider>,
);
