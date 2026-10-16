import { createRef } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  Navigation,
  NavigationGroup,
  NavigationLink,
  NavigationButton,
} from './navigation.js';
import { Button } from '../core/button/button.js';

it('names the navigation and groups, preserving native links, counts and refs', async () => {
  const link = createRef<HTMLAnchorElement>(),
    group = createRef<HTMLElement>();
  const click = vi.fn((event) => event.preventDefault());
  render(
    <Navigation label="Library">
      <NavigationGroup
        ref={group}
        title="Documents"
        headingLevel={2}
        actions={<Button>Create document</Button>}
      >
        <NavigationLink
          ref={link}
          href="/all"
          current
          count={0}
          icon={<span>Decorative icon</span>}
          onClick={click}
        >
          All documents
        </NavigationLink>
      </NavigationGroup>
    </Navigation>,
  );
  expect(screen.getByRole('navigation', { name: 'Library' })).toBeVisible();
  expect(group.current).toBe(screen.getByRole('region', { name: 'Documents' }));
  expect(link.current).toBe(
    screen.getByRole('link', { name: 'All documents 0' }),
  );
  expect(link.current).toHaveAttribute('href', '/all');
  expect(link.current).toHaveAttribute('aria-current', 'page');
  expect(screen.getByText('Decorative icon').parentElement).toHaveAttribute(
    'aria-hidden',
    'true',
  );
  expect(screen.getByRole('list').children[0].tagName).toBe('LI');
  expect(
    screen.getByRole('button', { name: 'Create document' }).closest('h2'),
  ).toBeNull();
  const user = userEvent.setup();
  await user.keyboard('{Control>}');
  await user.click(link.current!);
  await user.keyboard('{/Control}');
  expect(click.mock.calls[0][0].ctrlKey).toBe(true);
});

it('keeps actions native buttons with explicit current-view semantics and disabled behavior', async () => {
  const user = userEvent.setup(),
    action = vi.fn();
  const ref = createRef<HTMLButtonElement>();
  render(
    <form
      onSubmit={(event) => {
        event.preventDefault();
        throw new Error('Must not submit');
      }}
    >
      <Navigation label="Views">
        <NavigationGroup title="Library">
          <NavigationButton ref={ref} current onClick={action} count={3}>
            Favorites
          </NavigationButton>
          <NavigationButton disabled onClick={action}>
            Unavailable
          </NavigationButton>
          <NavigationButton>Settings</NavigationButton>
        </NavigationGroup>
      </Navigation>
    </form>,
  );
  expect(ref.current).toBe(screen.getByRole('button', { name: 'Favorites 3' }));
  expect(ref.current).toHaveAttribute('type', 'button');
  expect(ref.current).toHaveAttribute('aria-current', 'page');
  expect(ref.current).not.toHaveAttribute('aria-pressed');
  expect(screen.getByRole('button', { name: 'Settings' })).not.toHaveAttribute(
    'aria-current',
  );
  await user.tab();
  await user.keyboard('{Enter}');
  await user.keyboard(' ');
  expect(action).toHaveBeenCalledTimes(2);
  await user.click(screen.getByRole('button', { name: 'Unavailable' }));
  expect(action).toHaveBeenCalledTimes(2);
  ref.current?.focus();
  await user.tab();
  expect(screen.getByRole('button', { name: 'Settings' })).toHaveFocus();
});
