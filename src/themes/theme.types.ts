export type BuiltInThemeName =
  | 'fieldnotes-dark'
  | 'fieldnotes-light'
  | 'midnight'
  | 'ocean'
  | 'forest'
  | 'warm'
  | 'high-contrast';
export interface ThemeTokens {
  background: string;
  foreground: string;
  card: string;
  'card-foreground': string;
  popover: string;
  'popover-foreground': string;
  primary: string;
  'primary-foreground': string;
  'primary-hover': string;
  secondary: string;
  'secondary-foreground': string;
  muted: string;
  'muted-foreground': string;
  accent: string;
  'accent-foreground': string;
  destructive: string;
  'destructive-foreground': string;
  border: string;
  input: string;
  'input-background': string;
  ring: string;
  success: string;
  'success-foreground': string;
  warning: string;
  'warning-foreground': string;
}
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
