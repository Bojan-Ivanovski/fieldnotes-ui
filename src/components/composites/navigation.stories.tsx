import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  Navigation,
  NavigationGroup,
  NavigationLink,
  NavigationButton,
} from './navigation.js';
import { IconButton } from '../core/button/button.js';
const meta = {
  title: 'Composites/Navigation',
  component: Navigation,
  args: { label: 'Library' },
} satisfies Meta<typeof Navigation>;
export default meta;
type Story = StoryObj<typeof meta>;
function Views() {
  const [view, setView] = useState('all');
  return (
    <Navigation label="Library">
      <NavigationGroup
        title="Your library"
        headingLevel={2}
        actions={<IconButton aria-label="Create document">+</IconButton>}
      >
        <NavigationButton
          icon="▤"
          count={12}
          current={view === 'all'}
          onClick={() => setView('all')}
        >
          All documents
        </NavigationButton>
        <NavigationButton
          icon="★"
          count={0}
          current={view === 'favorites'}
          onClick={() => setView('favorites')}
        >
          Favorites
        </NavigationButton>
        <NavigationLink href="#archive">Archive</NavigationLink>
        <NavigationButton disabled>Unavailable workspace</NavigationButton>
      </NavigationGroup>
    </Navigation>
  );
}
export const Grouped: Story = { render: () => <Views /> };
export const LongLabels: Story = {
  args: {
    children: (
      <NavigationGroup title="A workspace with a long name" headingLevel={2}>
        <NavigationLink href="#long" count={1234}>
          An unbrokenresourcelabelthatmustfitwithoutoverflowingitscontainer
        </NavigationLink>
      </NavigationGroup>
    ),
  },
};
