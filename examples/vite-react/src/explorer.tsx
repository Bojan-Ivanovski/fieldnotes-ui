import { useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  ThemeProvider,
  ThemeSelector,
  Heading,
  Text,
  Stack,
} from 'fieldnotes-ui';
import { SearchField } from 'fieldnotes-ui/composites';
import {
  ResourceExplorer,
  type ResourceItem,
  type ResourceRequestReason,
} from 'fieldnotes-ui/patterns';
import { Button } from 'fieldnotes-ui/core';
import 'fieldnotes-ui/styles.css';
const initial: ResourceItem[] = [
  {
    id: 'plans',
    label: 'Plans',
    children: [
      { id: 'alpha', label: 'Alpha' },
      { id: 'beta', label: 'Beta' },
    ],
  },
  { id: 'archive', label: 'Archive', branch: { state: 'unloaded' } },
  { id: 'empty', label: 'Empty', children: [], branch: { state: 'ready' } },
  {
    id: 'locked',
    label: 'Locked',
    disabled: true,
    branch: { state: 'unloaded' },
  },
  { id: 'zeta', label: 'Zeta' },
  {
    id: 'long',
    label:
      'A folder with an unbrokenresourceidentifierthatmustfitwithoutoverflowingitscontainer',
    branch: { state: 'ready' },
  },
];
function remove(nodes: readonly ResourceItem[], id: string): ResourceItem[] {
  return nodes
    .filter((item) => item.id !== id)
    .map((item) =>
      item.children ? { ...item, children: remove(item.children, id) } : item,
    );
}
function Example() {
  const [items, setItems] = useState(initial),
    [filter, setFilter] = useState(''),
    [selected, setSelected] = useState<string | null>(null),
    [expanded, setExpanded] = useState(['plans']);
  const attempts = useRef(0),
    generation = useRef(0),
    pending = useRef(false);
  function reset() {
    generation.current++;
    pending.current = false;
    attempts.current = 0;
    setItems(initial);
    setFilter('');
    setSelected(null);
    setExpanded(['plans']);
  }
  async function request(id: string, _reason: ResourceRequestReason) {
    if (id !== 'archive' || pending.current) return;
    pending.current = true;
    const token = generation.current,
      attempt = ++attempts.current;
    setItems((previous) =>
      previous.map((item) =>
        item.id === id
          ? { ...item, branch: { ...item.branch, state: 'loading' } }
          : item,
      ),
    );
    await new Promise((resolve) => setTimeout(resolve, 200));
    if (token !== generation.current) return;
    pending.current = false;
    setItems((previous) =>
      previous.map((item) =>
        item.id !== id
          ? item
          : attempt === 1 || attempt === 3
            ? {
                ...item,
                branch: {
                  ...item.branch,
                  state: 'error',
                  message: 'Archive could not be loaded. Retry is available.',
                },
              }
            : {
                ...item,
                children:
                  attempt === 2
                    ? [{ id: 'remote-one', label: 'Remote one' }]
                    : [
                        { id: 'remote-one', label: 'Remote one' },
                        { id: 'remote-two', label: 'Remote two' },
                      ],
                branch: { state: 'ready', hasMore: attempt === 2 },
              },
      ),
    );
  }
  function selectionLabel(nodes: readonly ResourceItem[]): string | undefined {
    for (const item of nodes) {
      if (item.id === selected) return item.label;
      const child = item.children && selectionLabel(item.children);
      if (child) return child;
    }
  }
  return (
    <main style={{ padding: 20, maxWidth: 800, margin: 'auto' }}>
      <Stack>
        <ThemeSelector includeSystem={false} />
        <Heading level={1}>Explore your resources</Heading>
        <Text as="p">
          Filter searches loaded resources and keeps ancestor paths. Arrow keys
          navigate the tree; Enter selects. Tab reaches branch controls. The
          Archive demonstrates retry and pagination failure. Delete removes the
          selected demo resource; Escape clears the filter and collapses
          branches; Insert resets the demo.
        </Text>
        <SearchField
          label="Filter resources"
          value={filter}
          onValueChange={setFilter}
        />
        <ResourceExplorer
          label="Resources"
          items={items}
          filter={filter}
          selectedId={selected}
          onSelect={setSelected}
          expandedIds={expanded}
          onExpandedChange={setExpanded}
          onRequestChildren={(id, reason) => void request(id, reason)}
          onKeyDown={(event) => {
            if (event.key === 'Delete' && selected) {
              event.preventDefault();
              setItems((previous) => remove(previous, selected));
              setSelected(null);
            }
            if (event.key === 'Escape') {
              event.preventDefault();
              setFilter('');
              setExpanded([]);
            }
            if (event.key === 'Insert') {
              event.preventDefault();
              reset();
            }
          }}
        />
        <Text as="p">
          {selected
            ? `Selected: ${selectionLabel(items) ?? selected}`
            : 'No resource selected.'}
        </Text>
        <Stack direction="horizontal" wrap>
          <Button onClick={reset}>Reset library</Button>
          <Button
            variant="secondary"
            onClick={() => {
              generation.current++;
              pending.current = false;
              setItems([{ id: 'zeta', label: 'Zeta' }]);
              setSelected(null);
              setExpanded([]);
            }}
          >
            Show single resource
          </Button>
        </Stack>
      </Stack>
    </main>
  );
}
createRoot(document.getElementById('root')!).render(
  <ThemeProvider>
    <Example />
  </ThemeProvider>,
);
