import presets from '../foundations/tokens/presets.json';
import type { CustomTheme, ThemeDefinition } from './theme.types.js';
export const builtInThemes: readonly ThemeDefinition[] = Object.entries(
  presets,
).map(([name, value]) => ({
  name,
  ...value,
  colorScheme: value.colorScheme === 'light' ? 'light' : 'dark',
}));
export function defineTheme(custom: CustomTheme): ThemeDefinition {
  if (!/^[a-z][a-z0-9-]*$/.test(custom.name) || custom.name === 'system')
    throw new Error(
      'Theme names must be lowercase identifiers and cannot be system.',
    );
  const base = presets[custom.extends ?? 'fieldnotes-dark'];
  if (!base) throw new Error('Unknown base theme.');
  return {
    name: custom.name,
    colorScheme:
      custom.colorScheme ?? (base.colorScheme === 'light' ? 'light' : 'dark'),
    tokens: { ...base.tokens, ...custom.tokens },
  };
}
