import { useLayoutEffect, useId, useRef, useState } from 'react';
import { SettingsLayout, SettingsSection } from './settings-layout.js';
import { Button } from '../core/button/button.js';
import { Field, Input } from '../core/forms/controls.js';
import { ErrorSummary, Fieldset, Switch } from '../core/forms/form-parts.js';
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from '../core/navigation/tabs.js';
import { ConfirmDialog } from '../composites/confirm-dialog.js';

/** Consumer-owned settings state: no persistence or validation engine in the layout. */
export function SettingsExample({
  onDirtyChange,
  onPendingChange,
}: {
  onDirtyChange?: (dirty: boolean) => void;
  onPendingChange?: (pending: boolean) => void;
} = {}) {
  const id = useId();
  const [section, setSection] = useState('general');
  const [requestedSection, setRequestedSection] = useState<string | null>(null);
  const [name, setName] = useState('My workspace');
  const [notifications, setNotifications] = useState(true);
  const [saved, setSaved] = useState({
    name: 'My workspace',
    notifications: true,
  });
  const [pending, setPending] = useState(false);
  const inFlight = useRef(false);
  const [fail, setFail] = useState(false);
  const [fieldError, setFieldError] = useState('');
  const [message, setMessage] = useState('');
  const [deleted, setDeleted] = useState(false);
  const nameId = `${id}-name`;
  const dirty = name !== saved.name || notifications !== saved.notifications;
  const summary = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    onDirtyChange?.(dirty);
  }, [dirty, onDirtyChange]);
  useLayoutEffect(() => {
    onPendingChange?.(pending);
  }, [pending, onPendingChange]);
  async function submit() {
    if (inFlight.current) return;
    inFlight.current = true;
    setPending(true);
    setFieldError('');
    setMessage('Saving settings…');
    await new Promise((resolve) => setTimeout(resolve, 600));
    if (name.trim().toLowerCase() === 'taken') {
      setFieldError('This workspace name is already taken.');
      setMessage('Settings were not saved.');
      requestAnimationFrame(() => summary.current?.focus());
    } else if (fail)
      setMessage(
        'Could not save settings. Your changes are retained. Try again.',
      );
    else {
      setSaved({ name, notifications });
      setMessage('Settings saved.');
    }
    inFlight.current = false;
    setPending(false);
  }
  return (
    <Tabs
      value={section}
      onValueChange={(value) => {
        if (inFlight.current) {
          setMessage('Wait for the current operation to finish.');
          return;
        }
        if (dirty) {
          setRequestedSection(value);
          return;
        }
        setSection(value);
      }}
      orientation="vertical"
    >
      <SettingsLayout
        title="Settings"
        description="Choose how your workspace feels."
        navigation={
          <TabsList aria-label="Settings sections">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="danger">Danger zone</TabsTrigger>
          </TabsList>
        }
      >
        <TabsContent value="general" forceMount hidden={section !== 'general'}>
          <form
            onSubmit={(event) => {
              event.preventDefault();
              void submit();
            }}
          >
            <SettingsSection
              title="General"
              description="Change your workspace identity and preferences."
              actions={
                <>
                  <Button type="submit" loading={pending}>
                    Save settings
                  </Button>
                  <Button
                    variant="ghost"
                    disabled={pending || !dirty}
                    onClick={() => {
                      setName(saved.name);
                      setNotifications(saved.notifications);
                      setFieldError('');
                      setMessage('Changes discarded.');
                    }}
                  >
                    Discard changes
                  </Button>
                </>
              }
            >
              <ErrorSummary
                ref={summary}
                errors={
                  fieldError ? [{ controlId: nameId, message: fieldError }] : []
                }
              />
              <Fieldset legend="Workspace preferences" disabled={pending}>
                <Field
                  controlId={nameId}
                  label="Workspace name"
                  description="Try “taken” to see a field error."
                  error={fieldError || undefined}
                >
                  {(props) => (
                    <Input
                      {...props}
                      required
                      name="name"
                      value={name}
                      onChange={(event) => {
                        setName(event.target.value);
                        setFieldError('');
                        setMessage('');
                      }}
                    />
                  )}
                </Field>
                <label className="fn-workspace-actions">
                  <Switch
                    name="notifications"
                    checked={notifications}
                    onChange={(event) => {
                      setNotifications(event.target.checked);
                      setMessage('');
                    }}
                  />{' '}
                  Email notifications
                </label>
              </Fieldset>
              <label>
                <input
                  type="checkbox"
                  checked={fail}
                  disabled={pending}
                  onChange={(event) => setFail(event.target.checked)}
                />{' '}
                Simulate save failure
              </label>
              <p role="status" aria-live="polite">
                {message || (dirty ? 'Unsaved changes' : '')}
              </p>
            </SettingsSection>
          </form>
        </TabsContent>
        <TabsContent value="danger" forceMount hidden={section !== 'danger'}>
          <SettingsSection
            title="Danger zone"
            destructive
            description="Export your documents before deleting your workspace."
            actions={
              <ConfirmDialog
                title="Delete workspace?"
                description="This demo simulates deletion. Confirming clears the demonstration workspace."
                destructive
                confirmLabel="Delete workspace"
                trigger={
                  <Button variant="destructive" disabled={deleted}>
                    Delete workspace
                  </Button>
                }
                onConfirm={async () => {
                  await new Promise((resolve) => setTimeout(resolve, 500));
                  if (fail)
                    throw new Error(
                      'Deletion failed. The workspace is unchanged.',
                    );
                  setDeleted(true);
                  setMessage('Demonstration workspace deleted.');
                }}
              />
            }
          >
            <p>
              {deleted
                ? 'The demonstration workspace has been deleted.'
                : 'This action requires confirmation.'}
            </p>
            <p role="status">{message}</p>
          </SettingsSection>
        </TabsContent>
      </SettingsLayout>
      <ConfirmDialog
        title="Discard unsaved changes?"
        description="Your entered values will be discarded if you leave this section."
        confirmLabel="Discard and leave"
        cancelLabel="Keep editing"
        open={requestedSection !== null}
        onOpenChange={(open) => {
          if (!open) setRequestedSection(null);
        }}
        onConfirm={() => {
          if (!requestedSection) return;
          setName(saved.name);
          setNotifications(saved.notifications);
          setFieldError('');
          setSection(requestedSection);
          setRequestedSection(null);
          setMessage('Changes discarded.');
        }}
      />
    </Tabs>
  );
}
