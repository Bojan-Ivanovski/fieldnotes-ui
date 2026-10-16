import { render, screen } from '@testing-library/react';
import { Card, Badge, Alert } from './surfaces';
it('supports named semantic cards and consumer-selected urgency', () => {
  render(
    <Card aria-labelledby="title">
      <h2 id="title">Document</h2>
      <Badge tone="success">Saved</Badge>
      <Alert role="alert" tone="destructive">
        Save failed
      </Alert>
    </Card>,
  );
  expect(screen.getByRole('region', { name: 'Document' })).toContainElement(
    screen.getByRole('alert'),
  );
  expect(screen.getByRole('alert')).toHaveTextContent('Save failed');
});
