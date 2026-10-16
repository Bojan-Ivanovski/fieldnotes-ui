import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { SearchResults, LoadMoreButton } from './search-results.js';
import { ResourceCard } from './resource-card.js';
import { EmptyState } from './empty-state.js';
import { Button } from '../core/button/button.js';
import { Alert } from '../core/surfaces/surfaces.js';
const results = (
  <ul>
    <li>
      <ResourceCard
        title={<a href="#idea">An unfinished idea</a>}
        description="A native document result."
      />
    </li>
  </ul>
);
const meta = {
  title: 'Composites/SearchResults',
  component: SearchResults,
  args: {
    title: 'Documents',
    announcement: '1 document found',
    children: results,
  },
} satisfies Meta<typeof SearchResults>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Populated: Story = {};
export const Initial: Story = {
  args: {
    announcement: 'Search to find a document.',
    children: (
      <EmptyState
        title="Find a thought"
        description="Enter a query to begin."
      />
    ),
  },
};
export const Loading: Story = {
  args: {
    loading: true,
    announcement: 'Searching…',
    children: <p>Loading documents…</p>,
  },
};
export const Refreshing: Story = {
  args: {
    loading: true,
    announcement: 'Searching… showing 1 previous result.',
    children: results,
  },
};
export const Empty: Story = {
  args: {
    announcement: 'No documents found',
    children: (
      <EmptyState
        title="No matching documents"
        description="Try another search."
      />
    ),
  },
};
function RetryExample() {
  const [failed, setFailed] = useState(true);
  return (
    <SearchResults
      title="Documents"
      announcement={failed ? 'Search failed.' : '1 document found'}
    >
      {failed ? (
        <Alert role="alert" tone="destructive">
          Documents could not be loaded.{' '}
          <Button onClick={() => setFailed(false)}>Try again</Button>
        </Alert>
      ) : (
        results
      )}
    </SearchResults>
  );
}
export const FailureAndRetry: Story = { render: () => <RetryExample /> };
function PaginationExample() {
  const [pending, setPending] = useState(false),
    [done, setDone] = useState(false);
  return (
    <SearchResults
      title="Documents"
      announcement={done ? 'All documents loaded.' : '1 document found'}
    >
      {results}
      <LoadMoreButton
        pending={pending}
        aria-disabled={done}
        onClick={() => {
          setPending(true);
          setTimeout(() => {
            setPending(false);
            setDone(true);
          }, 500);
        }}
      >
        {done ? 'All documents loaded' : 'Load more'}
      </LoadMoreButton>
    </SearchResults>
  );
}
export const Pagination: Story = { render: () => <PaginationExample /> };
