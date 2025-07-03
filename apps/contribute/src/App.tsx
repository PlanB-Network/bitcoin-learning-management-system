import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { UserInfo } from './components/UserInfo.tsx';
import logo from './logo.svg';
import { AppContextProvider } from './providers/context.tsx';
import { TRPCProvider, trpcClient } from './utils/trpc.ts';

function App() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
        retry: 1, // 5 minutes
        staleTime: 5 * 60 * 1000,
      },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <TRPCProvider trpcClient={trpcClient} queryClient={queryClient}>
        <AppContextProvider>
          <div className="text-center">
            <header className="min-h-screen flex flex-col items-center justify-center bg-[#282c34] text-white text-[calc(10px+2vmin)]">
              <img
                src={logo}
                className="h-[20vmin] pointer-events-none animate-[spin_20s_linear_infinite]"
                alt="logo"
              />
              <p>
                Edit <code>src/App.tsx</code> and save to reload.
              </p>
              <a
                className="text-[#61dafb] hover:underline"
                href="https://reactjs.org"
                target="_blank"
                rel="noopener noreferrer"
              >
                Learn React
              </a>
              <a
                className="text-[#61dafb] hover:underline"
                href="https://tanstack.com"
                target="_blank"
                rel="noopener noreferrer"
              >
                Learn TanStack
              </a>
              <p>User session details:</p>
              <UserInfo />
            </header>
          </div>
        </AppContextProvider>
      </TRPCProvider>
    </QueryClientProvider>
  );
}

export default App;
