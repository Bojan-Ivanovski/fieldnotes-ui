import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './tabs';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from './dropdown-menu';
it('navigates tabs with arrows and skips disabled choices', async () => {
  render(
    <Tabs defaultValue="write">
      <TabsList aria-label="Editor view">
        <TabsTrigger value="write">Write</TabsTrigger>
        <TabsTrigger value="split" disabled>
          Split
        </TabsTrigger>
        <TabsTrigger value="read">Read</TabsTrigger>
      </TabsList>
      <TabsContent value="write">Editing</TabsContent>
      <TabsContent value="read">Preview</TabsContent>
    </Tabs>,
  );
  await userEvent.tab();
  await userEvent.keyboard('{ArrowRight}');
  expect(screen.getByRole('tab', { name: 'Read' })).toHaveAttribute(
    'aria-selected',
    'true',
  );
  expect(screen.getByRole('tabpanel')).toHaveTextContent('Preview');
});
it('opens menus by keyboard and activates items', async () => {
  const select = vi.fn();
  render(
    <DropdownMenu>
      <DropdownMenuTrigger>Actions</DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onSelect={select}>Duplicate</DropdownMenuItem>
        <DropdownMenuItem disabled>Unavailable</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>,
  );
  await userEvent.tab();
  await userEvent.keyboard('{Enter}');
  expect(screen.getByRole('menuitem', { name: 'Duplicate' })).toHaveFocus();
  await userEvent.keyboard('{Enter}');
  expect(select).toHaveBeenCalledOnce();
  expect(screen.queryByRole('menu')).not.toBeInTheDocument();
});
