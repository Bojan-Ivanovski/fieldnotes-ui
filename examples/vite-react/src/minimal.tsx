import { createRoot } from 'react-dom/client';
import { Button } from 'fieldnotes-ui/core';
import 'fieldnotes-ui/styles.css';
createRoot(document.getElementById('root')!).render(
  <Button>Only a button</Button>,
);
