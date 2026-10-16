import type { Meta, StoryObj } from '@storybook/react-vite';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './tabs.js';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from './dropdown-menu.js';
import { Button } from '../button/button.js';
const meta = {
  title: 'Core/Tabs',
  component: Tabs,
  args: {
    defaultValue: 'write',
    children: (
      <>
        <TabsList aria-label="Editor view">
          <TabsTrigger value="write">Write</TabsTrigger>
          <TabsTrigger value="split" disabled>
            Split
          </TabsTrigger>
          <TabsTrigger value="read">Read</TabsTrigger>
        </TabsList>
        <TabsContent value="write">Your words start here.</TabsContent>
        <TabsContent value="read">Preview your document.</TabsContent>
      </>
    ),
  },
} satisfies Meta<typeof Tabs>;
export default meta;
export const Playground: StoryObj<typeof meta> = {};
export const Menu: StoryObj<typeof meta> = {
  render: () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="secondary">Document actions</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem>Duplicate</DropdownMenuItem>
        <DropdownMenuItem disabled>Move (unavailable)</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem destructive>Move to trash</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
};
