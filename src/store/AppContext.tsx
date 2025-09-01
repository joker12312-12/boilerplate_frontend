'use client';

import React, {
  createContext,
  useState,
  useContext,
  ReactNode,
  Dispatch,
  SetStateAction,
} from 'react';
import type { Logo } from '@/lib/types';

export interface LinkItem {
  title: string;
  href: string;
}

export interface AppContextType {
  logo: Logo | null;
  searchBarHeader: string;
  setSearchBarHeader: Dispatch<SetStateAction<string>>;
}

export const AppContext = createContext<AppContextType>({
  logo: null,
  searchBarHeader: '',
  setSearchBarHeader: () => {},
});

export interface AppProviderProps {
  children: ReactNode;
  links?: LinkItem[];
  logo?: Logo | null;
}

export const AppProvider: React.FC<AppProviderProps> = ({
  children,
  logo = null,
}) => {
  const [searchBarHeader, setSearchBarHeader] = useState('');

  return (
    <AppContext.Provider
      value={{
        logo,
        searchBarHeader,
        setSearchBarHeader,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export function useAppContext(): AppContextType {
  const context = useContext(AppContext);
  return context;
}