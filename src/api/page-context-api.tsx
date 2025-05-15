import { useEffect } from 'react';
import { useState } from 'react';
import { createContext, PropsWithChildren, useContext } from 'react';
import { PageContextMessage } from './api.types';

// inject page-context-injection
(() => {
  const script = document.createElement('script');
  script.src = chrome.runtime.getURL('dist/page-context-injection.js');
  script.onload = () => script.remove();
  (document.head || document.documentElement).appendChild(script);
})();

interface PageContextContent {
  authToken: string | undefined;
}

const PageContext = createContext<PageContextContent | undefined>(undefined);

export const usePageContext = (): PageContextContent => {
  const context = useContext(PageContext);
  if (!context) {
    throw new Error('usePageContext must be used within a PageContextProvider');
  }
  return context;
};

export const PageContextProvider = ({ children }: PropsWithChildren) => {
  const [authToken, setAuthToken] = useState<string | undefined>(undefined);

  useEffect(() => {
    const handler = (event: MessageEvent) => {
      if (event.data?.isTvbMessage) {
        const data = event.data as PageContextMessage;
        switch (data.type) {
          case 'authToken': {
            setAuthToken(data.payload);
          }
        }
      }
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  });

  return (
    <PageContext.Provider
      value={{
        authToken,
      }}
    >
      {children}
    </PageContext.Provider>
  );
};
