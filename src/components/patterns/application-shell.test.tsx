import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ApplicationShell, Sidebar } from './application-shell.js';
afterEach(() => vi.unstubAllGlobals());
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

it('lets the consumer reject or accept navigation before closing a controlled drawer', async () => {
  vi.stubGlobal('matchMedia', () => ({
    matches: true,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }));
  const change = vi.fn();
  const { rerender } = render(
    <ApplicationShell
      navigationOpen
      onNavigationOpenChange={change}
      sidebar={
        <Sidebar label="Workspace">
          <button onClick={() => change(false)}>Accept navigation</button>
          <button>Rejected navigation</button>
        </Sidebar>
      }
    >
      <h1>Documents</h1>
    </ApplicationShell>,
  );
  await userEvent.click(
    screen.getByRole('button', { name: 'Rejected navigation' }),
  );
  expect(change).not.toHaveBeenCalled();
  expect(screen.getByRole('dialog')).toBeVisible();
  await userEvent.click(
    screen.getByRole('button', { name: 'Accept navigation' }),
  );
  expect(change).toHaveBeenLastCalledWith(false);
  expect(screen.getByRole('dialog')).toBeVisible();
  rerender(
    <ApplicationShell
      navigationOpen={false}
      onNavigationOpenChange={change}
      sidebar={<Sidebar label="Workspace">Navigation</Sidebar>}
    >
      <h1>Documents</h1>
    </ApplicationShell>,
  );
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  await waitFor(() =>
    expect(
      screen.getByRole('button', { name: 'Open Navigation' }),
    ).toHaveFocus(),
  );
  vi.unstubAllGlobals();
});

it('requests closure once on desktop and mounts only one sidebar through breakpoint changes', async () => {
  const listeners = new Set<() => void>();
  const media = {
    matches: true,
    addEventListener: (_: string, listener: () => void) =>
      listeners.add(listener),
    removeEventListener: (_: string, listener: () => void) =>
      listeners.delete(listener),
  };
  vi.stubGlobal('matchMedia', () => media);
  const change = vi.fn();
  const { rerender, unmount } = render(
    <ApplicationShell
      navigationOpen
      onNavigationOpenChange={change}
      sidebar={<Sidebar label="Workspace">Pages</Sidebar>}
    >
      <h1>Documents</h1>
    </ApplicationShell>,
  );
  expect(
    screen.getAllByRole('complementary', { name: 'Workspace' }),
  ).toHaveLength(1);
  act(() => {
    media.matches = false;
    listeners.forEach((listener) => listener());
  });
  expect(change).toHaveBeenCalledExactlyOnceWith(false);
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  expect(
    screen.getAllByRole('complementary', { name: 'Workspace' }),
  ).toHaveLength(1);
  rerender(
    <ApplicationShell
      navigationOpen
      onNavigationOpenChange={change}
      sidebar={<Sidebar label="Workspace">Pages</Sidebar>}
    >
      <h1>Changed</h1>
    </ApplicationShell>,
  );
  expect(change).toHaveBeenCalledTimes(1);
  unmount();
  expect(listeners.size).toBe(0);
  vi.unstubAllGlobals();
});

it('opens the uncontrolled drawer from its initial value and lets Escape close it', async () => {
  vi.stubGlobal('matchMedia', () => ({
    matches: true,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }));
  const change = vi.fn();
  render(
    <ApplicationShell
      defaultNavigationOpen
      onNavigationOpenChange={change}
      sidebar={<Sidebar label="Workspace">Pages</Sidebar>}
    >
      <h1>Documents</h1>
    </ApplicationShell>,
  );
  expect(screen.getByRole('dialog')).toBeVisible();
  await userEvent.keyboard('{Escape}');
  expect(change).toHaveBeenLastCalledWith(false);
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
});
