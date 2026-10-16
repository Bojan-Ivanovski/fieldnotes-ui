import type { ComponentPropsWithRef } from 'react';
import { useTheme } from '../../themes/theme-provider';
import { Field, Select } from '../core/forms/controls';
export interface ThemeSelectorProps
  extends Omit<
    ComponentPropsWithRef<'select'>,
    'value' | 'defaultValue' | 'onChange' | 'children'
  > {
  label?: string;
  includeSystem?: boolean;
}
export function ThemeSelector({
  label = 'Theme',
  includeSystem = true,
  ...props
}: ThemeSelectorProps) {
  const { theme, themes, setTheme } = useTheme();
  return (
    <Field label={label}>
      {(field) => (
        <Select
          {...field}
          {...props}
          value={theme}
          onChange={(event) => setTheme(event.target.value)}
        >
          {themes.map((value) => (
            <option value={value.name} key={value.name}>
              {value.name}
            </option>
          ))}
          {(includeSystem || theme === 'system') && (
            <option value="system">System preference</option>
          )}
        </Select>
      )}
    </Field>
  );
}
