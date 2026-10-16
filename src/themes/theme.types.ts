import presets from '../foundations/tokens/presets.json';
export type BuiltInThemeName = keyof typeof presets;
export type ThemeTokens = {
  [Key in keyof (typeof presets)['fieldnotes-dark']['tokens']]: string;
};
export type ThemeDefinition = {
  name: string;
  colorScheme: 'light' | 'dark';
  tokens: ThemeTokens;
};
export type CustomTheme = {
  name: string;
  extends?: BuiltInThemeName;
  colorScheme?: 'light' | 'dark';
  tokens: Partial<ThemeTokens>;
};
export interface ThemeStorage {
  get: () => string | null;
  set: (theme: string) => void;
}
export type ThemeSelection = string;
