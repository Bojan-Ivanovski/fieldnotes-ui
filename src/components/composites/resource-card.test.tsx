import { createRef } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ResourceCard } from './resource-card.js';
import { Button } from '../core/button/button.js';

it('keeps primary and secondary actions independent with native keyboard behavior', async () => {
  const user = userEvent.setup();
  const open = vi.fn(),
    favorite = vi.fn();
  const article = createRef<HTMLElement>(),
    primary = createRef<HTMLButtonElement>();
  render(
    <ResourceCard
      ref={article}
      data-resource="note"
      title={
        <button ref={primary} type="button" onClick={open}>
          A thought
        </button>
      }
      description="A document preview."
      metadata={<time dateTime="2026-10-16">October 16</time>}
      actions={<Button onClick={favorite}>Favorite</Button>}
    />,
  );
  expect(article.current).toBe(screen.getByRole('article'));
  expect(article.current).toHaveAttribute('data-resource', 'note');
  expect(primary.current).toBe(
    screen.getByRole('button', { name: 'A thought' }),
  );
  expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent(
    'A thought',
  );
  await user.tab();
  expect(primary.current).toHaveFocus();
  await user.keyboard('{Enter}');
  expect(open).toHaveBeenCalledTimes(1);
  await user.tab();
  await user.keyboard(' ');
  expect(favorite).toHaveBeenCalledTimes(1);
  expect(open).toHaveBeenCalledTimes(1);
  expect(
    article.current?.querySelector('button button, a button, button a'),
  ).toBeNull();
});

it('preserves destination, browser modifiers and link refs without intercepting events', async () => {
  const ref = createRef<HTMLAnchorElement>();
  const click = vi.fn((event) => event.preventDefault());
  render(
    <ResourceCard
      headingLevel={2}
      title={
        <a
          ref={ref}
          href="/documents/idea"
          target="_blank"
          rel="noreferrer"
          onClick={click}
        >
          Idea
        </a>
      }
    />,
  );
  const link = screen.getByRole('link', { name: 'Idea' });
  expect(ref.current).toBe(link);
  expect(link).toHaveAttribute('href', '/documents/idea');
  expect(link).toHaveAttribute('target', '_blank');
  expect(screen.getByRole('heading', { level: 2 })).toContainElement(link);
  const user = userEvent.setup();
  await user.keyboard('{Control>}');
  await user.click(link);
  await user.keyboard('{/Control}');
  expect(click.mock.calls[0][0].ctrlKey).toBe(true);
});

it('leaves busy and disabled behavior with native action controls', async () => {
  const open = vi.fn(),
    restore = vi.fn();
  render(
    <ResourceCard
      title={
        <button disabled onClick={open}>
          Deleted note
        </button>
      }
      actions={
        <Button loading onClick={restore}>
          Restore
        </Button>
      }
    >
      <p>Retained until restored.</p>
    </ResourceCard>,
  );
  await userEvent.click(screen.getByRole('button', { name: 'Deleted note' }));
  await userEvent.click(screen.getByRole('button', { name: /Restore/ }));
  expect(open).not.toHaveBeenCalled();
  expect(restore).not.toHaveBeenCalled();
  expect(screen.getByRole('button', { name: /Restore/ })).toHaveAttribute(
    'aria-busy',
    'true',
  );
  expect(screen.getByText('Retained until restored.')).toBeVisible();
});
