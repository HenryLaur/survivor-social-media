import React, { useState } from 'react';
import { LoginForm } from './components/LoginForm';
import { RegisterForm } from './components/RegisterForm';
import { TradeForm } from './components/TradeForm';
import { UserProvider, useUser } from './contexts/UserContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { SurvivorList } from './components/SurvivorList';
import { SurvivorProfile } from './components/SurvivorProfile';
import { Button } from './components/ui';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1,
    },
  },
});

const AppContent: React.FC = () => {
  const { user, logout } = useUser();
  const [showRegister, setShowRegister] = useState(false);
  const [showTrade, setShowTrade] = useState(false);

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-100 py-6 flex flex-col justify-center sm:py-12">
        <div className="relative py-3 sm:max-w-xl sm:mx-auto">
          <div className="relative px-4 py-10 bg-white shadow-lg sm:rounded-3xl sm:p-20">
            {!showRegister ? (
              <>
                <LoginForm />
                <p className="mt-4 text-center text-sm text-gray-600">
                  Not registered yet?{' '}
                  <button
                    onClick={() => setShowRegister(true)}
                    className="text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Create an account
                  </button>
                </p>
              </>
            ) : (
              <>
                <RegisterForm />
                <p className="mt-4 text-center text-sm text-gray-600">
                  Already a survivor?{' '}
                  <button
                    onClick={() => setShowRegister(false)}
                    className="text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Login
                  </button>
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Welcome, {user.name}!
            </h1>
            <p className="text-sm text-gray-500">
              Status: {user.infected ? 'Infected' : 'Healthy'}
            </p>
          </div>
          <Button onClick={logout}>Logout</Button>
        </div>

        <div className="space-y-6">
          <SurvivorProfile survivor={user} />
          {user.infected ? (
            <div className="text-red-500 text-sm">
              You are infected. Please report to the nearest survivor.
            </div>
          ) : !showTrade ? (
            <Button onClick={() => setShowTrade(true)} className="w-full">
              Start a Trade
            </Button>
          ) : (
            <>
              <TradeForm onSuccess={() => setShowTrade(false)} />
              <Button
                onClick={() => setShowTrade(false)}
                className="mt-4 w-full"
              >
                Cancel Trade
              </Button>
            </>
          )}

          <SurvivorList />
        </div>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <UserProvider>
        <AppContent />
      </UserProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
};

export default App;
