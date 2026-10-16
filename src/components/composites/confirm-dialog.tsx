import { useRef, useState, type ReactNode } from 'react';
import { useControlled } from '../../foundations/utilities/use-controlled.js';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from '../core/dialog/dialog.js';
import { Button } from '../core/button/button.js';
import { Alert } from '../core/surfaces/surfaces.js';
import { Stack } from '../primitives/layout.js';
export interface ConfirmDialogProps {
  title: string;
  description: string;
  trigger?: ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  onConfirm: () => void | Promise<void>;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  className?: string;
}
export function ConfirmDialog({
  title,
  description,
  trigger,
  open,
  defaultOpen = false,
  onOpenChange,
  onConfirm,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  destructive = false,
  className,
}: ConfirmDialogProps) {
  const [visible, setVisible] = useControlled(open, defaultOpen, onOpenChange),
    [busy, setBusy] = useState(false),
    [error, setError] = useState('');
  const cancel = useRef<HTMLButtonElement>(null);
  const change = (next: boolean) => {
    if (busy) return;
    setError('');
    setVisible(next);
  };
  const confirm = async () => {
    if (busy) return;
    setBusy(true);
    setError('');
    try {
      await onConfirm();
      setVisible(false);
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : 'The action could not be completed.',
      );
    } finally {
      setBusy(false);
    }
  };
  return (
    <Dialog open={visible} onOpenChange={change}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent
        className={className}
        showClose={!busy}
        onOpenAutoFocus={(event) => {
          event.preventDefault();
          cancel.current?.focus();
        }}
        onEscapeKeyDown={(event) => {
          if (busy) event.preventDefault();
        }}
        onPointerDownOutside={(event) => {
          if (busy) event.preventDefault();
        }}
      >
        <Stack>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
          {error && (
            <Alert role="alert" tone="destructive">
              {error}
            </Alert>
          )}
          <Stack direction="horizontal" wrap>
            <Button
              ref={cancel}
              variant="secondary"
              disabled={busy}
              onClick={() => change(false)}
            >
              {cancelLabel}
            </Button>
            <Button
              variant={destructive ? 'destructive' : 'primary'}
              loading={busy}
              onClick={() => void confirm()}
            >
              {confirmLabel}
            </Button>
          </Stack>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}
