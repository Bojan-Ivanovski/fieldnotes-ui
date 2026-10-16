import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ApplicationShell, Sidebar } from './application-shell.js';
it('provides responsive navigation through a modal with focus restoration', async () => {
  vi.stubGlobal(
    'matchMedia',
    vi.fn(() => ({
      matches: true,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })),
  );
  render(
    <ApplicationShell
      sidebar={
        <Sidebar label="Workspace">
          <nav aria-label="Pages">
            <a href="#notes">Notes</a>
          </nav>
        </Sidebar>
      }
    >
      <h1>Documents</h1>
    </ApplicationShell>,
  );
  const trigger = screen.getByRole('button', { name: 'Open Navigation' });
  await userEvent.click(trigger);
  expect(screen.getByRole('dialog', { name: 'Navigation' })).toContainElement(
    screen.getByRole('link', { name: 'Notes' }),
  );
  await userEvent.keyboard('{Escape}');
  expect(trigger).toHaveFocus();
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  vi.unstubAllGlobals();
});
