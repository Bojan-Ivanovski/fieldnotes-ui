import { createRef } from 'react';
import { render, screen } from '@testing-library/react';
import {
  Heading,
  Spinner,
  Stack,
  Text,
  VisuallyHidden,
} from '../../primitives';
it('preserves heading semantics and forwards refs and native attributes', () => {
  const ref = createRef<HTMLHeadingElement>();
  render(
    <Stack aria-label="Layout">
      <Heading level={3} ref={ref}>
        Thoughts
      </Heading>
      <Text as="p">Words</Text>
    </Stack>,
  );
  expect(ref.current).toBe(screen.getByRole('heading', { level: 3 }));
  expect(screen.getByLabelText('Layout')).toContainElement(
    screen.getByText('Words'),
  );
});
it('names loading status and keeps hidden text available to assistive technology', () => {
  render(
    <>
      <Spinner label="Opening document" />
      <VisuallyHidden>Additional context</VisuallyHidden>
    </>,
  );
  expect(screen.getByRole('status')).toHaveTextContent('Opening document');
  expect(screen.getByText('Additional context')).toBeInTheDocument();
});
