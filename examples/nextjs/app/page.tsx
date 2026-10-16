import { Button, Card, Heading } from 'fieldnotes-ui';
import { ClientPreview } from './client';
export default function Page() {
  return (
    <main>
      <Heading level={1}>Fieldnotes server-rendered consumer</Heading>
      <Card>
        <Button>Server-rendered action</Button>
        <ClientPreview />
      </Card>
    </main>
  );
}
