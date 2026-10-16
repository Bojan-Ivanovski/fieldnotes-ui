import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from './breadcrumb.js';
import { Separator } from '../surfaces/separator.js';
import { RichMenu } from './core-navigation.stories.js';

it('provides labelled breadcrumb navigation, native links and a current page', () => {
  render(
    <Breadcrumb aria-label="Document path">
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="/workspace">Workspace</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage>Draft</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>,
  );
  expect(
    screen.getByRole('navigation', { name: 'Document path' }),
  ).toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'Workspace' })).toHaveAttribute(
    'href',
    '/workspace',
  );
  expect(screen.getByText('Draft')).toHaveAttribute('aria-current', 'page');
  expect(screen.getByText('/')).toHaveAttribute('aria-hidden', 'true');
});
it('exposes separator orientation and removes decorative separators from semantics', () => {
  render(
    <>
      <Separator />
      <Separator orientation="vertical" />
      <Separator decorative />
    </>,
  );
  expect(screen.getAllByRole('separator')).toHaveLength(2);
  expect(screen.getAllByRole('separator')[1]).toHaveAttribute(
    'aria-orientation',
    'vertical',
  );
});
it('supports keyboard menu choices, exclusive radios and submenus', async () => {
  render(RichMenu.render());
  const trigger = screen.getByRole('button', { name: 'View preferences' });
  trigger.focus();
  await userEvent.keyboard('{ArrowDown}');
  await userEvent.keyboard('{Enter}');
  await userEvent.keyboard('{ArrowDown}');
  expect(
    screen.getByRole('menuitemcheckbox', { name: 'Show resolved' }),
  ).toHaveAttribute('aria-checked', 'true');
  await userEvent.keyboard('{ArrowDown}{ArrowDown}{Enter}');
  await userEvent.keyboard('{ArrowDown}');
  expect(screen.getByRole('menuitemradio', { name: 'Title' })).toHaveAttribute(
    'aria-checked',
    'true',
  );
  expect(
    screen.getByRole('menuitemradio', { name: 'Recent first' }),
  ).toHaveAttribute('aria-checked', 'false');
  await userEvent.keyboard('{End}{ArrowRight}');
  expect(
    await screen.findByRole('menuitem', { name: 'Markdown' }),
  ).toHaveFocus();
  expect(screen.getByRole('menuitem', { name: 'PDF' })).toHaveAttribute(
    'aria-disabled',
    'true',
  );
  await userEvent.keyboard('{ArrowLeft}{Escape}');
  expect(trigger).toHaveFocus();
});
