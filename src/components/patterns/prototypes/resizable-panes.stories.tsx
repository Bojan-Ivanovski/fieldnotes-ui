import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { ResizablePanes } from './resizable-panes.js';
import { Button } from '../../core/button/button.js';
const meta = {
  title: 'Prototypes/ResizablePanes',
  component: ResizablePanes,
  args: {
    label: 'Editor and preview widths',
    first: 'Editor',
    second: 'Preview',
  },
} satisfies Meta<typeof ResizablePanes>;
export default meta;
function Demo() {
  const [size, setSize] = useState(50);
  const [text, setText] = useState('Write something, then resize the panes.');
  return (
    <>
      <p>
        Drag the divider, or focus it and use Left/Right. Shift changes by 10%,
        Home/End reaches the limits, Enter resets. Narrow screens stack the same
        panes.
      </p>
      <Button variant="outline" onClick={() => setSize(50)}>
        Reset widths
      </Button>
      <ResizablePanes
        label="Editor and preview widths"
        size={size}
        onSizeChange={setSize}
        first={
          <textarea
            aria-label="Resizable editor"
            value={text}
            onChange={(event) => setText(event.target.value)}
            style={{ width: '100%', minHeight: 280, font: 'inherit' }}
          />
        }
        second={
          <article style={{ padding: 16, whiteSpace: 'pre-wrap' }}>
            {text}
          </article>
        }
      />
      <p role="status">Editor width: {Math.round(size)}%</p>
    </>
  );
}
export const Interactive: StoryObj<typeof meta> = { render: () => <Demo /> };
