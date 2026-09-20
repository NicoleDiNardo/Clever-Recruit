import React from 'react';
import ReactDOM from 'react-dom/client';
import { MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { App } from './App';
import { theme } from './theme';
import { UserProvider } from './context/UserContext';
import { CandidatesProvider } from './context/CandidatesContext';
import { OrgUsersProvider } from './context/OrgUsersContext';
import { ApplicationsProvider } from './context/ApplicationsContext';
import { InterviewsProvider } from './context/InterviewsContext';
import { JobsProvider } from './context/JobsContext';
import { isEmbedMode } from './hooks/useEmbedMode';
import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';
import '@mantine/dates/styles.css';
import './styles/global.css';

if (isEmbedMode()) {
  document.documentElement.classList.add('embed-mode');
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 1,
    },
  },
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <MantineProvider theme={theme} defaultColorScheme="light">
        <Notifications position="top-right" />
        <BrowserRouter>
          <UserProvider>
            <CandidatesProvider>
              <ApplicationsProvider>
                <InterviewsProvider>
                  <JobsProvider>
                    <OrgUsersProvider>
                      <App />
                    </OrgUsersProvider>
                  </JobsProvider>
                </InterviewsProvider>
              </ApplicationsProvider>
            </CandidatesProvider>
          </UserProvider>
        </BrowserRouter>
      </MantineProvider>
    </QueryClientProvider>
  </React.StrictMode>
);
