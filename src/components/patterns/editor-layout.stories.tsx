import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { EditorLayout, type EditorMode } from './editor-layout.js';
import { Textarea } from '../core/forms/controls.js';
import { Button } from '../core/button/button.js';
const meta = {
  title: 'Patterns/EditorLayout',
  component: EditorLayout,
  args: {
    editor: (
      <Textarea
        aria-label="Source text"
        defaultValue="Your editor goes here."
      />
    ),
    preview: <p>Your rendered preview goes here.</p>,
  },
} satisfies Meta<typeof EditorLayout>;
export default meta;
export const Playground: StoryObj<typeof meta> = {};
function ControlledEditor() {
  const [text, setText] = useState(
    'Change this text, switch views, and return. Both panes stay mounted.',
  );
  const [mode, setMode] = useState<EditorMode>('split');
  const [focused, setFocused] = useState(false);
  return (
    <EditorLayout
      mode={mode}
      onModeChange={setMode}
      focusMode={focused}
      onFocusModeChange={setFocused}
      editor={
        <Textarea
          aria-label="Source text"
          value={text}
          onChange={(event) => setText(event.target.value)}
          style={{ minHeight: 260 }}
        />
      }
      preview={<article style={{ whiteSpace: 'pre-wrap' }}>{text}</article>}
      actions={
        <Button variant="ghost" disabled>
          Formatting unavailable
        </Button>
      }
    />
  );
}
export const Controlled: StoryObj<typeof meta> = {
  render: () => <ControlledEditor />,
};
export const Write: StoryObj<typeof meta> = { args: { defaultMode: 'write' } };
export const Read: StoryObj<typeof meta> = { args: { defaultMode: 'read' } };
