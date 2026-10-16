import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button } from '../button/button.js';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from './breadcrumb.js';
import { Separator } from '../surfaces/separator.js';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuItem,
} from './dropdown-menu.js';
const meta = {
  title: 'Core/Navigation additions',
  component: Breadcrumb,
} satisfies Meta<typeof Breadcrumb>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Breadcrumbs: Story = {
  render: () => (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="#workspace">Workspace</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbLink href="#ideas">Ideas</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage>A passing thought</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  ),
};
export const Separators: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 20 }}>
      Document
      <Separator />
      <div style={{ display: 'flex', gap: 16 }}>
        Write
        <Separator orientation="vertical" />
        Preview
      </div>
    </div>
  ),
};
function PreferencesMenu() {
  const [resolved, setResolved] = useState(false);
  const [sort, setSort] = useState('recent');
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button>View preferences</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>Workspace view</DropdownMenuLabel>
        <DropdownMenuCheckboxItem
          checked={resolved}
          onCheckedChange={(value) => setResolved(value === true)}
        >
          Show resolved
        </DropdownMenuCheckboxItem>
        <DropdownMenuSeparator />
        <DropdownMenuRadioGroup value={sort} onValueChange={setSort}>
          <DropdownMenuRadioItem value="recent">
            Recent first
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="title">Title</DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
        <DropdownMenuSeparator />
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>Export</DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuItem>Markdown</DropdownMenuItem>
            <DropdownMenuItem disabled>PDF</DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
export const RichMenu = { render: () => <PreferencesMenu /> } satisfies Story;
