import { useState } from 'react';
/** Ownership is fixed by whether a controlled value was supplied on mount. */
export function useControlled<T>(
  controlled: T | undefined,
  initial: T,
  onChange?: (value: T) => void,
) {
  const [value, setValue] = useState(initial);
  const [isControlled] = useState(controlled !== undefined);
  return [
    isControlled ? (controlled as T) : value,
    (next: T) => {
      if (!isControlled) setValue(next);
      onChange?.(next);
    },
  ] as const;
}
