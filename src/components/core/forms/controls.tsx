import {
  useId,
  useEffect,
  useImperativeHandle,
  useRef,
  type ComponentPropsWithRef,
  type ReactNode,
} from 'react';
import { cn } from '../../../foundations/utilities/cn.js';
export function Input({ className, ...props }: ComponentPropsWithRef<'input'>) {
  return <input {...props} className={cn('fn-control fn-input', className)} />;
}
export function Textarea({
  className,
  ...props
}: ComponentPropsWithRef<'textarea'>) {
  return (
    <textarea
      {...props}
      className={cn('fn-control fn-input fn-textarea', className)}
    />
  );
}
export function Select({
  className,
  ...props
}: ComponentPropsWithRef<'select'>) {
  return (
    <select
      {...props}
      className={cn('fn-control fn-input fn-select', className)}
    />
  );
}
export function Checkbox({
  className,
  indeterminate = false,
  ref,
  ...props
}: CheckboxProps) {
  const input = useRef<HTMLInputElement>(null);
  useImperativeHandle(ref, () => input.current!, []);
  useEffect(() => {
    if (input.current) input.current.indeterminate = indeterminate;
  }, [indeterminate]);
  return (
    <input
      {...props}
      ref={input}
      type="checkbox"
      className={cn('fn-control fn-check', className)}
    />
  );
}
export interface CheckboxProps extends Omit<
  ComponentPropsWithRef<'input'>,
  'type'
> {
  /** Visual/native mixed state. The browser clears it on user activation. */
  indeterminate?: boolean;
}
export function Radio({
  className,
  ...props
}: Omit<ComponentPropsWithRef<'input'>, 'type'>) {
  return (
    <input
      {...props}
      type="radio"
      className={cn('fn-control fn-check', className)}
    />
  );
}
export interface FieldControlProps {
  id: string;
  'aria-describedby'?: string;
  'aria-invalid'?: true;
}
export interface FieldProps extends Omit<
  ComponentPropsWithRef<'div'>,
  'children'
> {
  label: ReactNode;
  description?: ReactNode;
  error?: ReactNode;
  controlId?: string;
  children: (props: FieldControlProps) => ReactNode;
}
export function Field({
  label,
  description,
  error,
  controlId,
  children,
  className,
  ...props
}: FieldProps) {
  const uid = useId(),
    id = controlId ?? `fn-field-${uid}`;
  const describedBy =
    [description ? `${id}-description` : '', error ? `${id}-error` : '']
      .filter(Boolean)
      .join(' ') || undefined;
  return (
    <div {...props} className={cn('fn-field', className)}>
      <label className="fn-label" htmlFor={id}>
        {label}
      </label>
      {children({
        id,
        'aria-describedby': describedBy,
        'aria-invalid': error ? true : undefined,
      })}
      {description && (
        <p className="fn-description" id={`${id}-description`}>
          {description}
        </p>
      )}
      {error && (
        <p className="fn-field-error" id={`${id}-error`} role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
