'use client';
import { ThemeSelector, ThemeProvider, Button, useTheme } from 'fieldnotes-ui';
function Content() {
  const { resolvedTheme } = useTheme();
  return (
    <>
      <ThemeSelector />
      <p>Active theme: {resolvedTheme.name}</p>
      <Button onClick={() => window.alert('Saved')}>Save</Button>
    </>
  );
}
export function ClientPreview() {
  return (
    <ThemeProvider defaultTheme="ocean">
      <Content />
    </ThemeProvider>
  );
}
