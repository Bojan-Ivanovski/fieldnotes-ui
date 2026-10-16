import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type CSSProperties,
  type HTMLAttributes,
  type ReactNode,
} from 'react';
import { builtInThemes } from './presets.js';
import type { ThemeDefinition, ThemeStorage } from './theme.types.js';
interface ThemeContextValue {
  theme: string;
  resolvedTheme: ThemeDefinition;
  themes: readonly ThemeDefinition[];
  setTheme: (theme: string) => void;
  container: HTMLDivElement | null;
}
const emptyThemes: readonly ThemeDefinition[] = [];
const ThemeContext = createContext<ThemeContextValue | null>(null);
export interface ThemeProviderProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  'onChange'
> {
  children: ReactNode;
  defaultTheme?: string;
  theme?: string;
  onThemeChange?: (theme: string) => void;
  themes?: readonly ThemeDefinition[];
  storage?: ThemeStorage;
  systemFallback?: 'fieldnotes-light' | 'fieldnotes-dark';
}
export function ThemeProvider({
  children,
  defaultTheme = 'fieldnotes-dark',
  theme: controlled,
  onThemeChange,
  themes: custom = emptyThemes,
  storage,
  systemFallback = 'fieldnotes-light',
  className,
  style,
  ...props
}: ThemeProviderProps) {
  const [choice, setChoice] = useState(defaultTheme);
  const [system, setSystem] = useState<string>(systemFallback);
  const [container, setContainer] = useState<HTMLDivElement | null>(null);
  const themes = useMemo(() => {
    const values = [...builtInThemes, ...custom];
    if (new Set(values.map((value) => value.name)).size !== values.length)
      throw new Error('Duplicate theme names.');
    return values;
  }, [custom]);
  const selected = controlled ?? choice;
  const resolvedTheme =
    themes.find(
      (value) => value.name === (selected === 'system' ? system : selected),
    ) ?? builtInThemes[0];
  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return;
    const query = window.matchMedia('(prefers-color-scheme: dark)');
    const update = () =>
      setSystem(query.matches ? 'fieldnotes-dark' : 'fieldnotes-light');
    update();
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);
  useEffect(() => {
    if (controlled !== undefined) return;
    try {
      const saved = storage?.get();
      if (
        saved &&
        (saved === 'system' || themes.some((value) => value.name === saved))
      )
        setChoice(saved);
    } catch {
      /* Persistence is optional. */
    }
  }, [storage, themes, controlled]);
  const setTheme = (name: string) => {
    if (name !== 'system' && !themes.some((value) => value.name === name))
      throw new Error(`Unknown theme: ${name}`);
    if (controlled === undefined) setChoice(name);
    onThemeChange?.(name);
    try {
      storage?.set(name);
    } catch {
      /* A denied storage write must not prevent switching. */
    }
  };
  const variables = Object.fromEntries(
    Object.entries(resolvedTheme.tokens).map(([key, value]) => [
      `--fn-${key}`,
      value,
    ]),
  );
  return (
    <ThemeContext.Provider
      value={{ theme: selected, resolvedTheme, themes, setTheme, container }}
    >
      <div
        {...props}
        ref={setContainer}
        data-fn-theme={resolvedTheme.name}
        className={['fn-theme', className].filter(Boolean).join(' ')}
        style={
          {
            ...variables,
            colorScheme: resolvedTheme.colorScheme,
            ...style,
          } as CSSProperties
        }
      >
        {children}
      </div>
    </ThemeContext.Provider>
  );
}
export function useTheme() {
  const value = useContext(ThemeContext);
  if (!value) throw new Error('useTheme must be used within ThemeProvider.');
  return {
    theme: value.theme,
    resolvedTheme: value.resolvedTheme,
    themes: value.themes,
    setTheme: value.setTheme,
  };
}
/** Internal portal target preserves nested theme scope. */
export function useThemeContainer() {
  return useContext(ThemeContext)?.container ?? undefined;
}
