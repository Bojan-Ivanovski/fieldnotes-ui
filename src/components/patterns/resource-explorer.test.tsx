import { createRef } from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ResourceExplorer, type ResourceItem } from './resource-explorer.js';
const items: ResourceItem[] = [
  {
    id: 'folder',
    label: 'Plans',
    children: [
      { id: 'alpha', label: 'Alpha' },
      { id: 'beta', label: 'Beta' },
    ],
  },
  { id: 'locked', label: 'Locked', disabled: true },
  { id: 'zeta', label: 'Zeta' },
];
it('expands, navigates parent/child, selects and collapses by keyboard', async () => {
  const select = vi.fn();
  render(
    <ResourceExplorer label="Resources" items={items} onSelect={select} />,
  );
  await userEvent.tab();
  expect(screen.getByRole('treeitem', { name: 'Plans' })).toHaveFocus();
  await userEvent.keyboard('{ArrowRight}');
  expect(
    await screen.findByRole('treeitem', { name: 'Alpha' }),
  ).toBeInTheDocument();
  await userEvent.keyboard('{ArrowDown}');
  await waitFor(() =>
    expect(screen.getByRole('treeitem', { name: 'Alpha' })).toHaveFocus(),
  );
  await userEvent.keyboard('{Enter}');
  expect(select).toHaveBeenCalledWith('alpha');
  await userEvent.keyboard('{ArrowRight}');
  expect(screen.getByRole('treeitem', { name: 'Alpha' })).toHaveFocus();
  expect(screen.getByRole('treeitem', { name: 'Alpha' })).toHaveAttribute(
    'aria-selected',
    'true',
  );
  await userEvent.keyboard('{ArrowLeft}');
  await waitFor(() =>
    expect(screen.getByRole('treeitem', { name: 'Plans' })).toHaveFocus(),
  );
  await userEvent.keyboard('{ArrowLeft}');
  expect(
    screen.queryByRole('treeitem', { name: 'Alpha' }),
  ).not.toBeInTheDocument();
});
it('supports Home/End, typeahead and disabled activation', async () => {
  const select = vi.fn();
  render(
    <ResourceExplorer label="Resources" items={items} onSelect={select} />,
  );
  await userEvent.tab();
  await userEvent.keyboard('{End}');
  await waitFor(() =>
    expect(screen.getByRole('treeitem', { name: 'Zeta' })).toHaveFocus(),
  );
  await userEvent.keyboard('l');
  await waitFor(() =>
    expect(screen.getByRole('treeitem', { name: 'Locked' })).toHaveFocus(),
  );
  await userEvent.keyboard('{Enter}');
  expect(select).not.toHaveBeenCalled();
  await userEvent.keyboard('{Home}');
  await waitFor(() =>
    expect(screen.getByRole('treeitem', { name: 'Plans' })).toHaveFocus(),
  );
});
it('supports controlled selection/expansion and fresh data after updates', async () => {
  const select = vi.fn(),
    expand = vi.fn();
  const { rerender } = render(
    <ResourceExplorer
      label="Resources"
      items={items}
      selectedId="zeta"
      expandedIds={[]}
      onSelect={select}
      onExpandedChange={expand}
    />,
  );
  await userEvent.click(screen.getByRole('treeitem', { name: 'Plans' }));
  expect(expand).toHaveBeenCalledWith(['folder']);
  expect(screen.getByRole('treeitem', { name: 'Zeta' })).toHaveAttribute(
    'aria-selected',
    'true',
  );
  rerender(
    <ResourceExplorer
      label="Resources"
      items={[{ id: 'new', label: 'New item' }]}
      selectedId="new"
      expandedIds={[]}
    />,
  );
  expect(screen.getByRole('treeitem', { name: 'New item' })).toHaveAttribute(
    'aria-selected',
    'true',
  );
  expect(screen.getByRole('treeitem', { name: 'New item' })).toHaveAttribute(
    'tabindex',
    '0',
  );
});

it('filters loaded descendants with ancestor paths and restores stored expansion and hidden selection', async () => {
  const select = vi.fn(),
    expand = vi.fn();
  const view = (filter: string) => (
    <ResourceExplorer
      label="Resources"
      items={items}
      selectedId="beta"
      filter={filter}
      onSelect={select}
      onExpandedChange={expand}
    />
  );
  const { rerender } = render(view('alpha'));
  expect(screen.getByRole('treeitem', { name: 'Plans' })).toHaveAttribute(
    'aria-expanded',
    'true',
  );
  expect(screen.getByRole('treeitem', { name: 'Alpha' })).toBeVisible();
  expect(
    screen.queryByRole('treeitem', { name: 'Beta' }),
  ).not.toBeInTheDocument();
  expect(expand).not.toHaveBeenCalled();
  expect(select).not.toHaveBeenCalled();
  rerender(view('Plans'));
  expect(screen.getAllByRole('treeitem')).toHaveLength(1);
  rerender(view(''));
  expect(screen.getByRole('treeitem', { name: 'Plans' })).toHaveAttribute(
    'aria-expanded',
    'false',
  );
  expect(expand).not.toHaveBeenCalled();
  expect(select).not.toHaveBeenCalled();
  await userEvent.tab();
  await userEvent.keyboard('{ArrowRight}');
  expect(screen.getByRole('treeitem', { name: 'Beta' })).toHaveAttribute(
    'aria-selected',
    'true',
  );
});

it('keeps filtered expansion temporary and accepts a consumer predicate', async () => {
  const expand = vi.fn();
  const { rerender } = render(
    <ResourceExplorer
      label="Resources"
      items={items}
      filter="a"
      onExpandedChange={expand}
    />,
  );
  await userEvent.tab();
  await userEvent.keyboard('{ArrowLeft}');
  expect(
    screen.queryByRole('treeitem', { name: 'Alpha' }),
  ).not.toBeInTheDocument();
  expect(expand).not.toHaveBeenCalled();
  rerender(
    <ResourceExplorer
      label="Resources"
      items={items}
      filter="ignored"
      filterItem={(item, query) => query === 'ignored' && item.id === 'zeta'}
      onExpandedChange={expand}
    />,
  );
  expect(screen.getAllByRole('treeitem')).toHaveLength(1);
  expect(screen.getByRole('treeitem', { name: 'Zeta' })).toBeVisible();
  rerender(
    <ResourceExplorer
      label="Resources"
      items={items}
      onExpandedChange={expand}
    />,
  );
  expect(screen.getByRole('treeitem', { name: 'Plans' })).toHaveAttribute(
    'aria-expanded',
    'false',
  );
});

it('recovers actual focus through removal, ancestor collapse, empty data and replacement', async () => {
  const select = vi.fn();
  const view = (nodes: readonly ResourceItem[], expandedIds = ['folder']) => (
    <ResourceExplorer
      label="Resources"
      items={nodes}
      expandedIds={expandedIds}
      selectedId="zeta"
      onSelect={select}
    />
  );
  const { rerender } = render(view(items));
  await userEvent.tab();
  await userEvent.keyboard('{Home}{ArrowRight}');
  await waitFor(() =>
    expect(screen.getByRole('treeitem', { name: 'Alpha' })).toHaveFocus(),
  );
  const appended = [
    {
      ...items[0],
      children: [...items[0].children!, { id: 'gamma', label: 'Gamma' }],
    },
    ...items.slice(1),
  ];
  rerender(view(appended));
  await waitFor(() =>
    expect(screen.getByRole('treeitem', { name: 'Alpha' })).toHaveFocus(),
  );
  rerender(view(items, []));
  await waitFor(() =>
    expect(screen.getByRole('treeitem', { name: 'Plans' })).toHaveFocus(),
  );
  rerender(view(items));
  await userEvent.keyboard('{ArrowRight}');
  await waitFor(() =>
    expect(screen.getByRole('treeitem', { name: 'Alpha' })).toHaveFocus(),
  );
  rerender(
    view([
      { ...items[0], children: [{ id: 'beta', label: 'Beta' }] },
      items[2],
    ]),
  );
  await waitFor(() =>
    expect(screen.getByRole('treeitem', { name: 'Plans' })).toHaveFocus(),
  );
  rerender(view([items[2], { id: 'fresh', label: 'Fresh' }]));
  await waitFor(() =>
    expect(screen.getByRole('treeitem', { name: 'Zeta' })).toHaveFocus(),
  );
  rerender(view([{ id: 'fresh', label: 'Fresh' }]));
  await waitFor(() =>
    expect(screen.getByRole('treeitem', { name: 'Fresh' })).toHaveFocus(),
  );
  rerender(view([]));
  await waitFor(() =>
    expect(screen.getByRole('region', { name: 'Resources' })).toHaveFocus(),
  );
  await userEvent.keyboard('{ArrowDown}{Home}{End}');
  rerender(
    view([
      { id: 'next', label: 'Next' },
      { id: 'fresh', label: 'Fresh' },
    ]),
  );
  await waitFor(() =>
    expect(screen.getByRole('treeitem', { name: 'Next' })).toHaveFocus(),
  );
  expect(select).not.toHaveBeenCalled();
});

it('does not steal focus from another control while filters or data change', async () => {
  const view = (filter: string) => (
    <>
      <input aria-label="Filter resources" />
      <ResourceExplorer
        label="Resources"
        items={items}
        defaultExpandedIds={['folder']}
        filter={filter}
      />
    </>
  );
  const { rerender } = render(view(''));
  const input = screen.getByRole('textbox', { name: 'Filter resources' });
  await userEvent.click(input);
  rerender(view('Beta'));
  await waitFor(() =>
    expect(screen.getByRole('treeitem', { name: 'Beta' })).toBeVisible(),
  );
  expect(input).toHaveFocus();
  rerender(view('no matches'));
  expect(screen.getByRole('region', { name: 'Resources' })).toBeVisible();
  expect(input).toHaveFocus();
});

it('distinguishes unloaded folders and keeps branch request focus through retry, append and completion', async () => {
  const request = vi.fn(),
    select = vi.fn();
  const view = (
    state: 'unloaded' | 'loading' | 'error' | 'ready',
    children: readonly ResourceItem[] = [],
    hasMore = false,
  ) => (
    <ResourceExplorer
      label="Resources"
      items={[
        { id: 'async', label: 'Async', children, branch: { state, hasMore } },
        { id: 'file', label: 'File' },
      ]}
      onRequestChildren={request}
      onSelect={select}
    />
  );
  const { rerender } = render(view('unloaded'));
  expect(screen.getByRole('treeitem', { name: 'Async' })).toHaveAttribute(
    'aria-expanded',
    'false',
  );
  expect(screen.getByRole('treeitem', { name: 'File' })).not.toHaveAttribute(
    'aria-expanded',
  );
  await userEvent.tab();
  await userEvent.keyboard('{ArrowRight}');
  await waitFor(() =>
    expect(request).toHaveBeenCalledExactlyOnceWith('async', 'load'),
  );
  await userEvent.keyboard('{ArrowLeft}{ArrowRight}');
  expect(request).toHaveBeenCalledTimes(1);
  rerender(view('loading'));
  await userEvent.tab();
  const button = screen.getByRole('button', { name: 'Loading Async' });
  expect(button).toHaveFocus();
  await userEvent.keyboard('{Enter}');
  expect(request).toHaveBeenCalledTimes(1);
  rerender(view('error'));
  expect(button).toHaveFocus();
  expect(button).toHaveTextContent('Retry Async');
  await userEvent.keyboard('{Enter}');
  expect(request).toHaveBeenLastCalledWith('async', 'retry');
  const alpha = [{ id: 'a', label: 'Alpha' }];
  rerender(view('ready', alpha, true));
  expect(button).toHaveFocus();
  expect(screen.getByRole('treeitem', { name: 'Alpha' })).toBeVisible();
  expect(button).toHaveTextContent('Load more Async');
  await userEvent.keyboard('{Enter}');
  expect(request).toHaveBeenLastCalledWith('async', 'more');
  rerender(view('loading', alpha, true));
  expect(screen.getByRole('treeitem', { name: 'Alpha' })).toBeVisible();
  rerender(view('error', alpha, true));
  expect(button).toHaveFocus();
  await userEvent.keyboard('{Enter}');
  expect(request).toHaveBeenLastCalledWith('async', 'retry');
  rerender(view('ready', [...alpha, { id: 'b', label: 'Beta' }]));
  expect(button).toHaveFocus();
  expect(button).toHaveTextContent('All loaded: Async');
  expect(button).toHaveAttribute('aria-disabled', 'true');
  const calls = request.mock.calls.length;
  await userEvent.keyboard('{Enter}');
  expect(request).toHaveBeenCalledTimes(calls);
  expect(select).not.toHaveBeenCalled();
});

it('does not request children for filter-only expansion or for disabled folders', async () => {
  const request = vi.fn();
  const { rerender } = render(
    <ResourceExplorer
      label="Resources"
      items={[
        {
          id: 'async',
          label: 'Async',
          children: [{ id: 'a', label: 'Alpha' }],
          branch: { state: 'unloaded' },
        },
      ]}
      expandedIds={[]}
      filter="alpha"
      onRequestChildren={request}
    />,
  );
  expect(screen.getByRole('treeitem', { name: 'Async' })).toHaveAttribute(
    'aria-expanded',
    'true',
  );
  expect(request).not.toHaveBeenCalled();
  rerender(
    <ResourceExplorer
      label="Resources"
      items={[
        {
          id: 'locked',
          label: 'Locked',
          disabled: true,
          branch: { state: 'unloaded' },
          children: [{ id: 'hidden', label: 'Hidden' }],
        },
      ]}
      expandedIds={['locked']}
      filter="hidden"
      onRequestChildren={request}
    />,
  );
  expect(screen.queryByRole('treeitem')).not.toBeInTheDocument();
  expect(request).not.toHaveBeenCalled();
});

it('exposes empty loaded branches without introducing synthetic tree rows', async () => {
  render(
    <ResourceExplorer
      label="Resources"
      items={[{ id: 'empty', label: 'Empty', branch: { state: 'ready' } }]}
      defaultExpandedIds={['empty']}
      onRequestChildren={vi.fn()}
    />,
  );
  expect(screen.getAllByRole('treeitem')).toHaveLength(1);
  expect(
    screen.getByRole('treeitem', { name: 'Empty' }),
  ).toHaveAccessibleDescription('No children.');
  expect(
    screen.getByRole('button', { name: 'All loaded: Empty' }),
  ).toHaveAttribute('aria-disabled', 'true');
});

it('does not fetch a hidden stored branch merely because filtering reveals its ancestor', () => {
  const request = vi.fn();
  render(
    <ResourceExplorer
      label="Resources"
      items={[
        {
          id: 'parent',
          label: 'Parent',
          children: [
            { id: 'remote', label: 'Remote', branch: { state: 'unloaded' } },
          ],
        },
      ]}
      defaultExpandedIds={['remote']}
      filter="remote"
      onRequestChildren={request}
    />,
  );
  expect(screen.getByRole('treeitem', { name: 'Parent' })).toHaveAttribute(
    'aria-expanded',
    'true',
  );
  expect(screen.getByRole('treeitem', { name: 'Remote' })).toBeVisible();
  expect(request).not.toHaveBeenCalled();
});

it('keeps native attributes and refs on the same div as an empty explorer becomes a tree', () => {
  const ref = createRef<HTMLDivElement>();
  const { rerender } = render(
    <ResourceExplorer
      ref={ref}
      label="Resources"
      items={[]}
      data-owner="consumer"
    />,
  );
  const root = screen.getByRole('region', { name: 'Resources' });
  expect(ref.current).toBe(root);
  expect(root).toHaveAttribute('data-owner', 'consumer');
  rerender(
    <ResourceExplorer
      ref={ref}
      label="Resources"
      items={[{ id: 'item', label: 'Item' }]}
      data-owner="consumer"
    />,
  );
  expect(ref.current).toBe(root);
  expect(screen.getByRole('tree', { name: 'Resources' })).toBe(root);
  expect(root).not.toHaveAttribute('filter');
});

it('associates branch feedback with unique IDs when separate explorers reuse resource IDs', () => {
  const nodes: ResourceItem[] = [
    { id: 'folder', label: 'Folder', branch: { state: 'ready' } },
  ];
  render(
    <>
      <ResourceExplorer
        label="First"
        items={nodes}
        defaultExpandedIds={['folder']}
      />
      <ResourceExplorer
        label="Second"
        items={nodes}
        defaultExpandedIds={['folder']}
      />
    </>,
  );
  const ids = screen
    .getAllByRole('treeitem', { name: 'Folder' })
    .map((row) => row.getAttribute('aria-describedby'));
  expect(new Set(ids).size).toBe(2);
  for (const id of ids)
    expect(document.getElementById(id!)).toHaveTextContent('No children.');
});
