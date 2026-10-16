import { useId, type ComponentPropsWithRef, type ReactNode } from 'react';
import { cn } from '../../../foundations/utilities/cn.js';

export function Label({ className, ...props }: ComponentPropsWithRef<'label'>) {
  return <label {...props} className={cn('fn-label', className)} />;
}

export interface FieldsetProps extends ComponentPropsWithRef<'fieldset'> {
  legend: ReactNode;
  description?: ReactNode;
  error?: ReactNode;
}
export function Fieldset({
  legend,
  description,
  error,
  children,
  className,
  'aria-describedby': describedBy,
  ...props
}: FieldsetProps) {
  const id = useId();
  const descriptions =
    [
      describedBy,
      description ? `${id}-description` : '',
      error ? `${id}-error` : '',
    ]
      .filter(Boolean)
      .join(' ') || undefined;
  return (
    <fieldset
      {...props}
      className={cn('fn-fieldset fn-control', className)}
      aria-describedby={descriptions}
      aria-invalid={error ? true : props['aria-invalid']}
    >
      <legend className="fn-label">{legend}</legend>
      {description && (
        <p className="fn-description" id={`${id}-description`}>
          {description}
        </p>
      )}
      <div className="fn-fieldset-body">{children}</div>
      {error && (
        <p className="fn-field-error" id={`${id}-error`} role="alert">
          {error}
        </p>
      )}
    </fieldset>
  );
}

export interface ErrorSummaryProps extends Omit<
  ComponentPropsWithRef<'div'>,
  'title' | 'children'
> {
  title?: ReactNode;
  errors: readonly { controlId: string; message: ReactNode }[];
}
export function ErrorSummary({
  title = 'Please correct the following',
  errors,
  className,
  ...props
}: ErrorSummaryProps) {
  const id = useId();
  if (!errors.length) return null;
  return (
    <div
      role="alert"
      tabIndex={-1}
      aria-labelledby={id}
      {...props}
      className={cn('fn-error-summary fn-control', className)}
    >
      <h2 id={id} className="fn-label">
        {title}
      </h2>
      <ul>
        {errors.map(({ controlId, message }, index) => (
          <li key={`${controlId}-${index}`}>
            <a
              className="fn-control"
              href={`#${encodeURIComponent(controlId)}`}
              onClick={(event) => {
                const control =
                  event.currentTarget.ownerDocument.getElementById(controlId);
                if (control) {
                  event.preventDefault();
                  control.focus();
                  control.scrollIntoView?.({
                    block: 'center',
                    behavior: 'instant',
                  });
                }
              }}
            >
              {message}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

export type SwitchProps = Omit<ComponentPropsWithRef<'input'>, 'type' | 'role'>;
/** Native checkbox submission/reset with switch semantics for on/off settings. */
export function Switch({ className, ...props }: SwitchProps) {
  return (
    <input
      {...props}
      type="checkbox"
      role="switch"
      className={cn('fn-control fn-switch', className)}
    />
  );
}
