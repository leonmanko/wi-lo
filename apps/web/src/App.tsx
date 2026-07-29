// apps/web/src/App.tsx

import React from 'react';
import { RouterProvider } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import SportThemeProvider from './components/theme/SportThemeProvider';
import { router } from './router';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});

export default function App(): React.ReactElement {
  return (
    <QueryClientProvider client={queryClient}>
      <SportThemeProvider>
        <RouterProvider router={router} />
      </SportThemeProvider>
    </QueryClientProvider>
  );
}