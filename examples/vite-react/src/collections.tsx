import { useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { ThemeProvider, Heading, Text } from 'fieldnotes-ui';
import { ResourceExplorer, type ResourceItem } from 'fieldnotes-ui/patterns';
import { SearchField } from 'fieldnotes-ui/composites';
import { Button, Select } from 'fieldnotes-ui/core';
import 'fieldnotes-ui/styles.css';

// Seed 41: labels/IDs and folder membership stay identical between runs.
function collection(count: number, nested: boolean): ResourceItem[] {
  const record = (index: number): ResourceItem => ({
    id: `record-${index}`,
    label: `Document ${String(index).padStart(5, '0')} · ${['Ideas', 'Plans', 'Research', 'Notes'][(index * 41) % 4]}`,
  });
  if (!nested)
    return Array.from({ length: count }, (_, index) => record(index));
  return Array.from({ length: Math.ceil(count / 20) }, (_, group) => ({
    ...record(group * 20),
    label: `Folder ${group}`,
    children: Array.from(
      { length: Math.min(19, count - group * 20 - 1) },
      (_, offset) => record(group * 20 + offset + 1),
    ),
  }));
}
function LargeCollection() {
  const params = new URLSearchParams(location.search);
  const count = params.get('count') === '10000' ? 10000 : 1000;
  const nested = params.get('shape') === 'nested';
  const expansion = params.get('expansion') === 'all' ? 'all' : 'partial';
  const items = useMemo(() => collection(count, nested), [count, nested]);
  const [expanded, setExpanded] = useState(() =>
    nested
      ? items
          .filter((_, index) => expansion === 'all' || index < 5)
          .map((item) => item.id)
      : [],
  );
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<string | null>(null);
  return (
    <ThemeProvider style={{ padding: 24 }}>
      <Heading level={1}>Large resource collection</Heading>
      <Text as="p">
        {count.toLocaleString()} deterministic loaded records.{' '}
        {nested
          ? 'Folders contain nineteen documents each.'
          : 'Flat document collection.'}{' '}
        Filtering searches loaded records and opens matching paths.
      </Text>
      <form method="get" className="fn-workspace-actions">
        <label>
          Records{' '}
          <Select name="count" defaultValue={String(count)}>
            <option value="1000">1,000</option>
            <option value="10000">10,000</option>
          </Select>
        </label>
        <label>
          Shape{' '}
          <Select name="shape" defaultValue={nested ? 'nested' : 'flat'}>
            <option value="flat">Flat</option>
            <option value="nested">Nested</option>
          </Select>
        </label>
        <label>
          Expansion{' '}
          <Select name="expansion" defaultValue={expansion}>
            <option value="partial">First five folders</option>
            <option value="all">All folders</option>
          </Select>
        </label>
        <Button type="submit">Load collection</Button>
      </form>
      <div style={{ maxWidth: 640, marginBlock: 20 }}>
        <SearchField
          label="Filter collection"
          placeholder="Try Document 009 or Research"
          value={query}
          onValueChange={setQuery}
        />
      </div>
      <Text as="p" role="status">
        {selected ? `Selected ${selected}` : 'No document selected'}
      </Text>
      <div
        style={{
          maxHeight: '65vh',
          overflow: 'auto',
          border: '1px solid var(--fn-border)',
        }}
      >
        <ResourceExplorer
          label="Large collection"
          items={items}
          filter={query}
          expandedIds={expanded}
          onExpandedChange={setExpanded}
          selectedId={selected}
          onSelect={setSelected}
        />
      </div>
    </ThemeProvider>
  );
}
performance.mark('fieldnotes-collection-start');
createRoot(document.getElementById('root')!).render(<LargeCollection />);
