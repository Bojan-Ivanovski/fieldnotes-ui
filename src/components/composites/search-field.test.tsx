import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SearchField } from './search-field.js';
it('edits and clears uncontrolled search while retaining input focus', async () => {
  const change = vi.fn();
  render(
    <SearchField
      label="Search documents"
      defaultValue="idea"
      onValueChange={change}
    />,
  );
  await userEvent.click(screen.getByRole('button', { name: 'Clear search' }));
  expect(screen.getByRole('searchbox')).toHaveValue('');
  expect(screen.getByRole('searchbox')).toHaveFocus();
  expect(change).toHaveBeenLastCalledWith('');
  await userEvent.type(screen.getByRole('searchbox'), 'a');
  expect(change).toHaveBeenLastCalledWith('a');
});
it('keeps controlled state and blocks readonly clearing', async () => {
  const change = vi.fn();
  const { rerender } = render(
    <SearchField label="Search" value="idea" onValueChange={change} />,
  );
  await userEvent.click(screen.getByRole('button'));
  expect(change).toHaveBeenCalledWith('');
  expect(screen.getByRole('searchbox')).toHaveValue('idea');
  rerender(<SearchField label="Search" value="idea" readOnly loading />);
  expect(screen.getByRole('button')).toBeDisabled();
  expect(screen.getByRole('status')).toHaveTextContent('Searching');
});
