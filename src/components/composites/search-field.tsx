import { useId, useRef, type ComponentPropsWithRef } from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '../core/forms/controls.js';
import { IconButton } from '../core/button/button.js';
import { Spinner, VisuallyHidden } from '../primitives/feedback.js';
import { cn } from '../../foundations/utilities/cn.js';
import { useControlled } from '../../foundations/utilities/use-controlled.js';
export interface SearchFieldProps extends Omit<
  ComponentPropsWithRef<'input'>,
  'value' | 'defaultValue' | 'onChange' | 'type' | 'children'
> {
  label: string;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  loading?: boolean;
  clearLabel?: string;
}
export function SearchField({
  label,
  value,
  defaultValue = '',
  onValueChange,
  loading = false,
  clearLabel = 'Clear search',
  className,
  disabled,
  readOnly,
  id,
  ref,
  ...props
}: SearchFieldProps) {
  const uid = useId(),
    inputId = id ?? uid,
    input = useRef<HTMLInputElement | null>(null);
  const [query, setQuery] = useControlled(value, defaultValue, onValueChange);
  return (
    <div
      className={cn('fn-search-field', className)}
      aria-busy={loading || undefined}
    >
      <Search size={16} aria-hidden="true" />
      <VisuallyHidden>
        <label htmlFor={inputId}>{label}</label>
      </VisuallyHidden>
      <Input
        {...props}
        id={inputId}
        ref={(node) => {
          input.current = node;
          if (typeof ref === 'function') return ref(node);
          if (ref) ref.current = node;
        }}
        type="search"
        disabled={disabled}
        readOnly={readOnly}
        value={query}
        onChange={(event) => setQuery(event.target.value)}
      />
      {loading && <Spinner label="Searching" />}
      {query && (
        <IconButton
          aria-label={clearLabel}
          disabled={disabled || readOnly}
          onClick={() => {
            setQuery('');
            input.current?.focus();
          }}
        >
          <X size={14} aria-hidden="true" />
        </IconButton>
      )}
    </div>
  );
}
