import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ISurvivor } from '../types/types';
import { api } from '../api/client';

interface UserContextType {
  user: ISurvivor | null;
  setUserName: (name: string | null) => void;
  refreshUser: () => Promise<void>;
  logout: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const queryClient = useQueryClient();
  const [userName, setUserName] = useState<string | null>(() => {
    const savedName = localStorage.getItem('userName');
    return savedName ?? null;
  });

  const { data: user } = useQuery({
    queryKey: ['user', userName],
    queryFn: () => (userName ? api.getSurvivorByName(userName) : null),
    enabled: !!userName,
  });

  const refreshUser = useCallback(async () => {
    if (userName) {
      await queryClient.invalidateQueries({ queryKey: ['user', userName] });
    }
  }, [userName, queryClient]);

  useEffect(() => {
    if (userName) {
      localStorage.setItem('userName', userName);
      refreshUser();
    } else {
      localStorage.removeItem('userName');
    }
  }, [userName, refreshUser]);

  const logout = () => {
    setUserName(null);
    queryClient.removeQueries({ queryKey: ['user'] });
  };

  return (
    <UserContext.Provider
      value={{ user: user || null, setUserName, refreshUser, logout }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
