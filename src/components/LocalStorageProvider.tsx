import { TvbAccount } from '@/types';
import { useCallback } from 'react';
import {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useState,
} from 'react';

interface LocalStorageContextComponents {
  tvbAccounts: TvbAccount[];
  setLocalStorage: (field: string, value: unknown) => void;
  isLocalStorageLoading: boolean;
}

const localStorageContext = createContext<
  LocalStorageContextComponents | undefined
>(undefined);

export const useLocalStorageContext = (): LocalStorageContextComponents => {
  const context = useContext(localStorageContext);
  if (!context) {
    throw new Error(
      'useLocalStorageContext must be used within a LocalStorageContextProvider'
    );
  }
  return context;
};

const localStorageId = 'MonarchSplitwiseLocalStorage';

export const LocalStorageContextProvider = ({
  children,
}: PropsWithChildren) => {
  const [tvbAccounts, setTvbAccounts] = useState<TvbAccount[]>([]);
  const [isLocalStorageLoading, setIsLocalStorageLoading] =
    useState<boolean>(true);

  const fetchLocalStorage = useCallback(() => {
    setIsLocalStorageLoading(true);
    const ls: LocalStorageContextComponents | null = JSON.parse(
      localStorage.getItem(localStorageId) ?? 'null'
    );
    setTvbAccounts(
      ls?.tvbAccounts.sort((a, b) =>
        a.monarchName.localeCompare(b.monarchName)
      ) ?? []
    );
    setIsLocalStorageLoading(false);
  }, []);

  const setLocalStorage = useCallback((field: string, value: unknown) => {
    localStorage.setItem(
      localStorageId,
      JSON.stringify({
        ...JSON.parse(localStorage.getItem(localStorageId) ?? 'null'),
        [field]: value,
      })
    );
    fetchLocalStorage();
  }, []);

  useEffect(() => {
    fetchLocalStorage();
  }, [fetchLocalStorage]);

  return (
    <localStorageContext.Provider
      value={{
        tvbAccounts,
        setLocalStorage,
        isLocalStorageLoading,
      }}
    >
      {children}
    </localStorageContext.Provider>
  );
};
