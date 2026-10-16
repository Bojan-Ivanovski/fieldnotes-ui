import { createContext } from 'react';

// Shell descendants coordinate drawers without requiring a global overlay store.
export const MobileNavigationContext = createContext<{
  active: boolean;
  requestClose: () => void;
} | null>(null);
