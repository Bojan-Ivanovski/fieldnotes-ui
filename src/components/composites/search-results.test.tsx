import { createRef } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SearchResults, LoadMoreButton } from './search-results.js';

it('keeps result links native and announcements outside the busy collection', () => {
  const ref = createRef<HTMLElement>();
  const { rerender } = render(
    <SearchResults
      ref={ref}
      title="Documents"
      announcement="Searching…"
      loading
    >
      <ul>
        <li>
          <a href="/idea">Previous result</a>
        </li>
      </ul>
    </SearchResults>,
  );
  expect(ref.current).toBe(screen.getByRole('region', { name: 'Documents' }));
  const status = screen.getByRole('status');
  expect(status).toHaveAttribute('aria-atomic', 'true');
  expect(status.closest('[aria-busy]')).toBeNull();
  expect(screen.getByRole('list').parentElement).toHaveAttribute(
    'aria-busy',
    'true',
  );
  expect(screen.getByRole('link', { name: 'Previous result' })).toHaveAttribute(
    'href',
    '/idea',
  );
  expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  rerender(
    <SearchResults title="Documents" announcement="1 document found">
      <ul>
        <li>
          <a href="/idea">Idea</a>
        </li>
      </ul>
    </SearchResults>,
  );
  expect(screen.getByRole('status')).toBe(status);
  expect(status).toHaveTextContent('1 document found');
  expect(screen.getByRole('list').parentElement).not.toHaveAttribute(
    'aria-busy',
  );
});

it('does not mutate unchanged announcement text or move focus on unrelated result updates', async () => {
  const ref = createRef<HTMLButtonElement>();
  const view = (text: string) => (
    <>
      <button ref={ref}>Search</button>
      <SearchResults title="Results" announcement="2 results">
        {text}
      </SearchResults>
    </>
  );
  const { rerender } = render(view('One'));
  ref.current?.focus();
  const mutations: MutationRecord[] = [];
  const observer = new MutationObserver((records) =>
    mutations.push(...records),
  );
  observer.observe(screen.getByRole('status'), {
    subtree: true,
    childList: true,
    characterData: true,
  });
  rerender(view('Two'));
  await Promise.resolve();
  expect(mutations).toHaveLength(0);
  expect(ref.current).toHaveFocus();
  observer.disconnect();
});

it('keeps pagination focus while pending and blocks mouse and keyboard duplicate requests', async () => {
  const user = userEvent.setup(),
    request = vi.fn();
  const ref = createRef<HTMLButtonElement>();
  const { rerender } = render(
    <LoadMoreButton ref={ref} onClick={request}>
      More documents
    </LoadMoreButton>,
  );
  const button = screen.getByRole('button', { name: 'More documents' });
  await user.tab();
  await user.keyboard('{Enter}');
  expect(request).toHaveBeenCalledTimes(1);
  rerender(
    <LoadMoreButton ref={ref} pending onClick={request}>
      More documents
    </LoadMoreButton>,
  );
  expect(ref.current).toBe(button);
  expect(button).toHaveFocus();
  expect(button).toHaveAttribute('aria-disabled', 'true');
  expect(button).toHaveAttribute('aria-busy', 'true');
  expect(button).not.toBeDisabled();
  await user.keyboard('{Enter} ');
  await user.click(button);
  expect(request).toHaveBeenCalledTimes(1);
  rerender(
    <LoadMoreButton ref={ref} onClick={request}>
      Retry more documents
    </LoadMoreButton>,
  );
  expect(button).toHaveFocus();
  await user.keyboard('{Enter}');
  expect(request).toHaveBeenCalledTimes(2);
  rerender(
    <LoadMoreButton aria-disabled onClick={request}>
      All loaded
    </LoadMoreButton>,
  );
  await user.click(screen.getByRole('button', { name: 'All loaded' }));
  expect(request).toHaveBeenCalledTimes(2);
});
