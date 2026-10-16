import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ResourceExplorer, type ResourceItem } from './resource-explorer';
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
});
