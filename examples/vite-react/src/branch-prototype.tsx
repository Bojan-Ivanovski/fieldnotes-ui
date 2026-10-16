import { useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { ThemeProvider, Heading, Text, Stack } from 'fieldnotes-ui';
import { ResourceExplorer, type ResourceItem } from 'fieldnotes-ui/patterns';
import { LoadMoreButton } from 'fieldnotes-ui/composites';
import 'fieldnotes-ui/styles.css';
function Approach({ integrated }: { integrated: boolean }) {
  const prefix = integrated ? 'inside' : 'outside';
  const [phase, setPhase] = useState<
    'unloaded' | 'loading' | 'error' | 'partial' | 'done'
  >('unloaded');
  const [children, setChildren] = useState<ResourceItem[]>([]),
    [selected, setSelected] = useState('');
  const [attempts, setAttempts] = useState(0);
  const pending = useRef(false);
  const actionLabel = `${phase === 'error' ? 'Retry' : phase === 'loading' ? 'Loading' : phase === 'done' ? 'All loaded:' : phase === 'partial' ? 'Load more' : 'Load'} Plans`;
  async function load() {
    if (pending.current || phase === 'done') return;
    pending.current = true;
    setPhase('loading');
    setAttempts((value) => value + 1);
    await new Promise((resolve) => setTimeout(resolve, 150));
    pending.current = false;
    if (!attempts) {
      setPhase('error');
      return;
    }
    setChildren((previous) => [
      ...previous,
      {
        id: `${prefix}-${previous.length}`,
        label: previous.length ? 'Beta' : 'Alpha',
      },
    ]);
    setPhase(children.length ? 'done' : 'partial');
  }
  const data: ResourceItem[] = [
    {
      id: `${prefix}-plans`,
      label: 'Plans',
      children: [
        ...children,
        ...(integrated
          ? [
              {
                id: `${prefix}-action`,
                label: actionLabel,
                disabled: phase === 'loading' || phase === 'done',
              },
            ]
          : []),
      ],
    },
  ];
  return (
    <section
      aria-label={integrated ? 'Action rows' : 'External branch controls'}
    >
      <Stack>
        <Heading>
          {integrated ? 'Action-row prototype' : 'External-control prototype'}
        </Heading>
        <Text as="p">
          {integrated
            ? 'The action is represented as a tree item. Observe the selected state after activation.'
            : 'Arrow keys navigate resources. Tab leaves the tree for native branch controls.'}
        </Text>
        <ResourceExplorer
          label={
            integrated ? 'Action-row resources' : 'External-control resources'
          }
          items={data}
          defaultExpandedIds={[`${prefix}-plans`]}
          onSelect={(id) => {
            if (id === `${prefix}-action`) void load();
            else setSelected(id);
          }}
        />
        <div
          role="region"
          aria-label={`${integrated ? 'Action-row' : 'External'} Plans loading controls`}
        >
          <p role="status">
            {phase === 'error'
              ? 'Loading failed. Retry is available.'
              : phase === 'loading'
                ? 'Loading Plans…'
                : `${children.length} children loaded.`}
          </p>
          {!integrated && (
            <LoadMoreButton
              pending={phase === 'loading'}
              pendingLabel="Loading Plans"
              aria-disabled={phase === 'done'}
              onClick={() => void load()}
            >
              {actionLabel}
            </LoadMoreButton>
          )}
        </div>
        <Text as="p">
          Attempts: {attempts}. Selected resource: {selected || 'none'}.
        </Text>
      </Stack>
    </section>
  );
}
createRoot(document.getElementById('root')!).render(
  <ThemeProvider>
    <main style={{ padding: 24, maxWidth: 800, margin: 'auto' }}>
      <Stack>
        <Heading level={1}>Branch interaction comparison</Heading>
        <Approach integrated={false} />
        <Approach integrated />
      </Stack>
    </main>
  </ThemeProvider>,
);
