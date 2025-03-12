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
  setUserId: (id: number | null) => void;
  refreshUser: () => Promise<void>;
  logout: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const queryClient = useQueryClient();
  const [userId, setUserId] = useState<number | null>(() => {
    const savedId = localStorage.getItem('userId');
    return savedId ? parseInt(savedId) : null;
  });

  const { data: user } = useQuery({
    queryKey: ['user', userId],
    queryFn: () => (userId ? api.getSurvivor(userId) : null),
    enabled: !!userId,
  });

  const refreshUser = useCallback(async () => {
    if (userId) {
      await queryClient.invalidateQueries({ queryKey: ['user', userId] });
    }
  }, [userId, queryClient]);

  useEffect(() => {
    if (userId) {
      localStorage.setItem('userId', userId.toString());
      refreshUser();
    } else {
      localStorage.removeItem('userId');
    }
  }, [userId, refreshUser]);

  const logout = () => {
    setUserId(null);
    queryClient.removeQueries({ queryKey: ['user'] });
  };

  return (
    <UserContext.Provider
      value={{ user: user || null, setUserId, refreshUser, logout }}
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
