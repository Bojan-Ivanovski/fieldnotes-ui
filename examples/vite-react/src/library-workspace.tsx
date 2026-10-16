'use client';
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import {
  ThemeProvider,
  ThemeSelector,
  Heading,
  Text,
  Stack,
} from 'fieldnotes-ui';
import {
  ApplicationShell,
  Sidebar,
  ResourceExplorer,
  DocumentWorkspace,
  OperationStatus,
  EditorLayout,
  DetailsPanel,
  type ResourceItem,
} from 'fieldnotes-ui/patterns';
import {
  Navigation,
  NavigationGroup,
  NavigationButton,
  SearchField,
  SearchResults,
  LoadMoreButton,
  ResourceCard,
  EmptyState,
} from 'fieldnotes-ui/composites';
import {
  Button,
  Input,
  Field,
  Checkbox,
  Alert,
  Textarea,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
} from 'fieldnotes-ui/core';

const documents = [
  {
    id: 'alpha',
    title: 'An unfinished idea',
    body: 'Slow thoughts become useful with time.',
  },
  { id: 'beta', title: 'Plans for tomorrow', body: 'Ideas for the next day.' },
  {
    id: 'gamma',
    title: 'Error handling notes',
    body: 'Recover gracefully from a failed operation.',
  },
  {
    id: 'delta',
    title: 'Fast note',
    body: 'A short thought, captured quickly.',
  },
  { id: 'archive-one', title: 'Archived ideas', body: 'Ideas worth keeping.' },
  {
    id: 'archive-two',
    title: 'Earlier plans',
    body: 'Review last season’s plans.',
  },
];
type View = 'library' | 'favorites';
const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
function matches(query: string, view: View, favorites: ReadonlySet<string>) {
  return documents.filter(
    (item) =>
      (view === 'library' || favorites.has(item.id)) &&
      `${item.title} ${item.body}`.toLowerCase().includes(query.toLowerCase()),
  );
}
function Content() {
  const [open, setOpen] = useState(false),
    [view, setView] = useState<View>('library');
  const [favorites, setFavorites] = useState(new Set(['alpha', 'gamma']));
  const favoriteRef = useRef(favorites);
  const [selected, setSelected] = useState<string | null>(null),
    [treeFilter, setTreeFilter] = useState('');
  const [expanded, setExpanded] = useState(['plans']);
  const [archive, setArchive] = useState<ResourceItem>({
    id: 'archive',
    label: 'Archive',
    branch: { state: 'unloaded' },
  });
  const [scratch, setScratch] = useState('A thought worth keeping'),
    [dirty, setDirty] = useState(false),
    [protect, setProtect] = useState(true),
    [navigationMessage, setNavigationMessage] = useState('');
  const [draft, setDraft] = useState('');
  const [bodies, setBodies] = useState<Record<string, string>>({});
  const [savedBodies, setSavedBodies] = useState<Record<string, string>>({});
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [panelOpen, setPanelOpen] = useState(false);
  const [detailView, setDetailView] = useState('outline');
  const [focusMode, setFocusMode] = useState(false);
  const [saveStates, setSaveStates] = useState<
    Record<string, 'saved' | 'saving' | 'unsaved' | 'error'>
  >({});
  const [failSave, setFailSave] = useState(false);
  const [readOnly, setReadOnly] = useState(false);
  const saving = useRef(false);
  const guard = useRef({ dirty: false, protect: true });
  const bodySnapshot = useRef(bodies);
  const detailsTrigger = useRef<HTMLButtonElement>(null);
  const documentEditor = useRef<HTMLTextAreaElement>(null);

  const [search, setSearch] = useState({
    ids: ['alpha', 'beta'],
    total: documents.length,
    query: '',
    shownQuery: '',
    phase: 'ready' as 'ready' | 'loading' | 'error',
    morePending: false,
    moreError: '',
  });
  const requestId = useRef(0),
    searchAttempts = useRef(new Map<string, number>()),
    pageAttempt = useRef(0),
    pagePending = useRef(false);
  const branchId = useRef(0),
    branchAttempts = useRef(0),
    branchPending = useRef(false),
    navigating = useRef(false);
  const results = useRef<HTMLElement>(null),
    removedAction = useRef<HTMLButtonElement | null>(null);
  useEffect(
    () => () => {
      requestId.current++;
      branchId.current++;
    },
    [],
  );
  useLayoutEffect(() => {
    const action = removedAction.current;
    removedAction.current = null;
    if (
      action &&
      !action.isConnected &&
      document.activeElement === document.body
    )
      results.current?.focus();
  }, [favorites]);
  async function find(query: string, target: View = view) {
    const token = ++requestId.current,
      favoriteSnapshot = new Set(favoriteRef.current);
    const attempt = searchAttempts.current.get(query) ?? 0;
    searchAttempts.current.set(query, attempt + 1);
    pageAttempt.current = 0;
    pagePending.current = false;
    setSearch((previous) => ({
      ...previous,
      query,
      phase: 'loading',
      morePending: false,
      moreError: '',
    }));
    await wait(query === 'slow' ? 800 : 200);
    if (token !== requestId.current) return;
    if (query === 'error' && !attempt) {
      setSearch((previous) => ({ ...previous, phase: 'error' }));
      return;
    }
    const found = matches(query, target, favoriteSnapshot);
    setSearch({
      ids: found.slice(0, 2).map((item) => item.id),
      total: found.length,
      query,
      shownQuery: query,
      phase: 'ready',
      morePending: false,
      moreError: '',
    });
  }
  async function more() {
    if (
      pagePending.current ||
      search.phase !== 'ready' ||
      search.ids.length >= search.total
    )
      return;
    pagePending.current = true;
    const token = requestId.current,
      attempt = pageAttempt.current++,
      offset = search.ids.length;
    const found = matches(search.query, view, new Set(favoriteRef.current));
    setSearch((previous) => ({
      ...previous,
      morePending: true,
      moreError: '',
    }));
    await wait(200);
    if (token !== requestId.current) return;
    pagePending.current = false;
    setSearch((previous) =>
      !attempt
        ? {
            ...previous,
            morePending: false,
            moreError:
              'More results could not be loaded. Your current results are still available.',
          }
        : {
            ...previous,
            morePending: false,
            ids: [
              ...previous.ids,
              ...found.slice(offset, offset + 2).map((item) => item.id),
            ],
            total: found.length,
          },
    );
  }
  async function navigate(action: () => void) {
    if (navigating.current) return;
    navigating.current = true;
    setNavigationMessage('Checking unsaved edits…');
    await wait(150);
    navigating.current = false;
    if ((guard.current.dirty || saving.current) && guard.current.protect) {
      setNavigationMessage(
        'Navigation stopped. Save your edits or turn off protection to leave.',
      );
      return;
    }
    setNavigationMessage('');
    action();
    setOpen(false);
  }
  async function loadArchive(id: string) {
    if (id !== 'archive' || branchPending.current) return;
    branchPending.current = true;
    const token = branchId.current,
      attempt = ++branchAttempts.current;
    setArchive((previous) => ({
      ...previous,
      branch: { ...previous.branch, state: 'loading' },
    }));
    await wait(200);
    if (token !== branchId.current) return;
    branchPending.current = false;
    setArchive((previous) =>
      attempt === 1 || attempt === 3
        ? {
            ...previous,
            branch: {
              ...previous.branch,
              state: 'error',
              message: 'Archive could not be loaded. Please retry.',
            },
          }
        : {
            ...previous,
            children: documents
              .slice(4, attempt === 2 ? 5 : 6)
              .map((item) => ({ id: item.id, label: item.title })),
            branch: { state: 'ready', hasMore: attempt === 2 },
          },
    );
  }
  const treeItems = useMemo<ResourceItem[]>(
    () => [
      {
        id: 'plans',
        label: 'Plans',
        children: documents
          .slice(0, 2)
          .map((item) => ({ id: item.id, label: item.title })),
      },
      ...documents
        .slice(2, 4)
        .map((item) => ({ id: item.id, label: item.title })),
      archive,
    ],
    [archive],
  );
  function toggleFavorite(id: string, button: HTMLButtonElement) {
    const next = new Set(favoriteRef.current);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    favoriteRef.current = next;
    removedAction.current = button;
    setFavorites(next);
    if (view === 'favorites') void find(search.query, view);
  }
  const visible = search.ids
    .map((id) => documents.find((item) => item.id === id)!)
    .filter((item) => view === 'library' || favorites.has(item.id));
  const current = documents.find((item) => item.id === selected);
  const selectionLabel =
    current?.title ??
    (selected === 'plans'
      ? 'Plans'
      : selected === 'archive'
        ? 'Archive'
        : 'No resource selected');
  const documentBody = current ? (bodies[current.id] ?? current.body) : '';
  const documentDirty =
    !!current && documentBody !== (savedBodies[current.id] ?? current.body);
  const saveState = current ? (saveStates[current.id] ?? 'saved') : 'saved';
  useLayoutEffect(() => {
    guard.current = { dirty: dirty || documentDirty, protect };
  }, [dirty, documentDirty, protect]);
  function downloadDocument() {
    if (!current) return;
    const url = URL.createObjectURL(
      new Blob([documentBody], { type: 'text/plain;charset=utf-8' }),
    );
    const link = document.createElement('a');
    link.href = url;
    link.download = `${current.id}.txt`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  async function saveDocument() {
    if (!current || saving.current || readOnly) return;
    const id = current.id,
      snapshot = documentBody;
    saving.current = true;
    setSaveStates((previous) => ({ ...previous, [id]: 'saving' }));
    await wait(600);
    saving.current = false;
    if (failSave) {
      setSaveStates((previous) => ({ ...previous, [id]: 'error' }));
      return;
    }
    setSavedBodies((previous) => ({ ...previous, [id]: snapshot }));
    setSaveStates((previous) => ({
      ...previous,
      [id]:
        (bodySnapshot.current[id] ?? current.body) === snapshot
          ? 'saved'
          : 'unsaved',
    }));
  }
  const announcement =
    search.phase === 'loading'
      ? `Searching… ${visible.length} previous results remain visible.`
      : search.phase === 'error'
        ? `Search failed. Showing previous results for ${search.shownQuery || 'all documents'}.`
        : search.morePending
          ? 'Loading more results…'
          : `${search.total} ${search.total === 1 ? 'document' : 'documents'} found; ${visible.length} shown.`;
  return (
    <ApplicationShell
      navigationOpen={open}
      onNavigationOpenChange={(next) => {
        if (next) setPanelOpen(false);
        setOpen(next);
      }}
      header={
        <Stack direction="horizontal" wrap>
          <ThemeSelector includeSystem={false} />
          <Text tone="muted">
            {dirty ? 'Unsaved scratch note' : 'Scratch note saved'}
          </Text>
        </Stack>
      }
      sidebar={
        <Sidebar
          label="Workspace"
          header={<Heading>Fieldnotes</Heading>}
          footer={
            <Stack>
              <label>
                <Checkbox
                  checked={protect}
                  onChange={(event) => setProtect(event.target.checked)}
                />
                Protect unsaved edits
              </label>
              <Text as="p" role="status">
                {navigationMessage}
              </Text>
            </Stack>
          }
        >
          <Stack>
            <Navigation label="Library views">
              <NavigationGroup title="Your library">
                <NavigationButton
                  current={view === 'library'}
                  count={documents.length}
                  onClick={() =>
                    void navigate(() => {
                      setView('library');
                      setSelected(null);
                      void find('', 'library');
                      setDraft('');
                    })
                  }
                >
                  All documents
                </NavigationButton>
                <NavigationButton
                  current={view === 'favorites'}
                  count={favorites.size}
                  onClick={() =>
                    void navigate(() => {
                      setView('favorites');
                      setSelected(null);
                      void find('', 'favorites');
                      setDraft('');
                    })
                  }
                >
                  Favorites
                </NavigationButton>
              </NavigationGroup>
            </Navigation>
            <SearchField
              label="Filter loaded resources"
              placeholder="Filter resources…"
              value={treeFilter}
              onValueChange={setTreeFilter}
              clearLabel="Clear resource filter"
            />
            <ResourceExplorer
              label="Workspace resources"
              items={treeItems}
              filter={treeFilter}
              selectedId={selected}
              onSelect={(id) => void navigate(() => setSelected(id))}
              expandedIds={expanded}
              onExpandedChange={setExpanded}
              onRequestChildren={(id) => void loadArchive(id)}
            />
          </Stack>
        </Sidebar>
      }
    >
      <Stack>
        <Heading level={1}>
          {view === 'library' ? 'Your library' : 'Favorites'}
        </Heading>
        <Text as="p">
          Search document titles and text. The sidebar filters loaded resources
          locally. Archive loading and the first next-page request deliberately
          fail so you can try the retry controls.
        </Text>
        <Field label="Scratch note">
          {(props) => (
            <Input
              {...props}
              value={scratch}
              onChange={(event) => {
                setScratch(event.target.value);
                setDirty(true);
              }}
            />
          )}
        </Field>
        <Button
          disabled={!dirty}
          onClick={() => {
            setDirty(false);
            setNavigationMessage('Scratch note saved.');
          }}
        >
          Save scratch note
        </Button>
        <form
          role="search"
          aria-label="Search the library"
          onSubmit={(event) => {
            event.preventDefault();
            void find(draft.trim());
          }}
        >
          <Stack direction="horizontal" wrap>
            <div style={{ flex: '1 1 16rem', minWidth: 0 }}>
              <SearchField
                label="Search documents"
                placeholder="Search documents…"
                value={draft}
                onValueChange={(value) => {
                  setDraft(value);
                  if (!value) void find('');
                }}
                clearLabel="Clear document search"
              />
            </div>
            <Button type="submit">Search</Button>
          </Stack>
        </form>
        <SearchResults
          ref={results}
          tabIndex={-1}
          title="Document results"
          announcement={announcement}
          loading={search.phase === 'loading'}
        >
          <Stack>
            {search.phase === 'error' && (
              <Alert role="alert" tone="destructive">
                Search could not be completed.{' '}
                <Button onClick={() => void find(search.query)}>
                  Retry search
                </Button>
              </Alert>
            )}
            {search.phase === 'ready' && !visible.length && (
              <EmptyState
                title="No matching documents"
                description="Try another query or view."
              />
            )}
            <ul
              style={{
                listStyle: 'none',
                padding: 0,
                margin: 0,
                display: 'grid',
                gridTemplateColumns:
                  'repeat(auto-fit, minmax(min(100%, 260px), 1fr))',
                gap: 16,
              }}
            >
              {visible.map((item) => (
                <li key={item.id}>
                  <ResourceCard
                    title={
                      <button
                        type="button"
                        onClick={() =>
                          void navigate(() => setSelected(item.id))
                        }
                      >
                        {item.title}
                      </button>
                    }
                    description={item.body}
                    metadata={
                      <time dateTime="2026-10-16">Updated October 16</time>
                    }
                    actions={
                      <Button
                        variant="secondary"
                        aria-label={`${favorites.has(item.id) ? 'Remove' : 'Add'} ${item.title} ${favorites.has(item.id) ? 'from' : 'to'} favorites`}
                        aria-pressed={favorites.has(item.id)}
                        onClick={(event) =>
                          toggleFavorite(item.id, event.currentTarget)
                        }
                      >
                        {favorites.has(item.id) ? 'Unfavorite' : 'Favorite'}
                      </Button>
                    }
                  />
                </li>
              ))}
            </ul>
            {search.moreError && (
              <Alert role="alert" tone="destructive">
                {search.moreError}
              </Alert>
            )}
            <LoadMoreButton
              pending={search.morePending}
              aria-disabled={
                search.phase !== 'ready' || search.ids.length >= search.total
              }
              onClick={() => void more()}
            >
              {search.ids.length >= search.total
                ? 'All results loaded'
                : search.moreError
                  ? 'Retry more results'
                  : 'Load more results'}
            </LoadMoreButton>
          </Stack>
        </SearchResults>
        <section aria-labelledby="selected-title">
          <Stack>
            <Heading id="selected-title">Selected resource</Heading>
            <Text as="p" role="status">
              {selectionLabel}
            </Text>
            {current && (
              <DocumentWorkspace
                title={current.title}
                headingLevel={3}
                metadata={`${readOnly ? 'Read only' : 'Editable document'} · Local demonstration`}
                actions={
                  <>
                    <Button
                      loading={saveState === 'saving'}
                      disabled={readOnly}
                      onClick={() => void saveDocument()}
                    >
                      Save document
                    </Button>
                    <Button
                      ref={detailsTrigger}
                      variant="outline"
                      aria-expanded={panelOpen}
                      onClick={() => {
                        setOpen(false);
                        setPanelOpen(!panelOpen);
                      }}
                    >
                      Document details
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost">More document actions</Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem onSelect={downloadDocument}>
                          Download text
                        </DropdownMenuItem>
                        <DropdownMenuCheckboxItem
                          checked={readOnly}
                          onCheckedChange={(value) =>
                            setReadOnly(value === true)
                          }
                        >
                          Read only
                        </DropdownMenuCheckboxItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </>
                }
                status={
                  <OperationStatus
                    state={
                      saveState === 'saving' || saveState === 'error'
                        ? saveState
                        : documentDirty
                          ? 'unsaved'
                          : 'saved'
                    }
                    actions={
                      saveState === 'error' ? (
                        <>
                          <Button
                            size="sm"
                            disabled={readOnly}
                            onClick={() => void saveDocument()}
                          >
                            Retry document save
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={downloadDocument}
                          >
                            Download unsaved copy
                          </Button>
                        </>
                      ) : undefined
                    }
                  />
                }
                panel={
                  <DetailsPanel
                    title="Document details"
                    headingLevel={4}
                    open={panelOpen && !focusMode}
                    onOpenChange={(next) => {
                      if (next) setOpen(false);
                      setPanelOpen(next);
                    }}
                    returnFocusRef={detailsTrigger}
                    fallbackFocusRef={documentEditor}
                  >
                    <Tabs value={detailView} onValueChange={setDetailView}>
                      <TabsList aria-label="Document details view">
                        <TabsTrigger value="outline">Outline</TabsTrigger>
                        <TabsTrigger value="notes">Notes</TabsTrigger>
                      </TabsList>
                      <TabsContent value="outline">
                        <p>Non-empty paragraphs in the supplied document:</p>
                        <ol>
                          {documentBody
                            .split(/\n\s*\n/)
                            .filter((text) => text.trim())
                            .map((paragraph, index) => (
                              <li key={index}>{paragraph.slice(0, 70)}</li>
                            ))}
                        </ol>
                      </TabsContent>
                      <TabsContent value="notes">
                        <Field label="Document notes">
                          {(props) => (
                            <Textarea
                              {...props}
                              value={notes[current.id] ?? ''}
                              onChange={(event) =>
                                setNotes((previous) => ({
                                  ...previous,
                                  [current.id]: event.target.value,
                                }))
                              }
                            />
                          )}
                        </Field>
                      </TabsContent>
                    </Tabs>
                  </DetailsPanel>
                }
              >
                <EditorLayout
                  focusMode={focusMode}
                  onFocusModeChange={setFocusMode}
                  editor={
                    <Textarea
                      ref={documentEditor}
                      aria-label="Document content"
                      value={documentBody}
                      onChange={(event) => {
                        const next = {
                          ...bodySnapshot.current,
                          [current.id]: event.target.value,
                        };
                        bodySnapshot.current = next;
                        setBodies(next);
                        if (!saving.current)
                          setSaveStates((previous) => ({
                            ...previous,
                            [current.id]: 'unsaved',
                          }));
                      }}
                      style={{ minHeight: 280 }}
                    />
                  }
                  preview={
                    <article style={{ whiteSpace: 'pre-wrap' }}>
                      {documentBody || 'Start writing to see your preview.'}
                    </article>
                  }
                  actions={
                    <label>
                      <Checkbox
                        checked={failSave}
                        onChange={(event) => setFailSave(event.target.checked)}
                      />{' '}
                      Simulate document save failure
                    </label>
                  }
                />
              </DocumentWorkspace>
            )}
          </Stack>
        </section>
        <Text as="p" tone="muted">
          This example keeps data, navigation guards and requests in consumer
          code. Searches for “error” demonstrate retry; submitting “slow”
          followed by “fast” demonstrates late-response protection.
        </Text>
      </Stack>
    </ApplicationShell>
  );
}
export function LibraryWorkspace() {
  return (
    <ThemeProvider>
      <Content />
    </ThemeProvider>
  );
}
