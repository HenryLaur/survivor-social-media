import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useUser } from '../contexts/UserContext';
import { api } from '../api/client';
import { ISurvivor } from '../types/types';
import { SurvivorProfile } from './SurvivorProfile';

export const SurvivorList: React.FC = () => {
  const { user } = useUser();
  const { data: survivors = [], isLoading, error } = useQuery({
    queryKey: ['survivors'],
    queryFn: api.getAllSurvivors,
  });

  if (isLoading) {
    return <div className="text-center text-gray-600">Loading survivors...</div>;
  }

  if (error) {
    return <div className="text-center text-red-600">Error loading survivors: {error.message}</div>;
  }

  const otherSurvivors = survivors.filter((s: ISurvivor) => s.id !== user?.id);

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-gray-900">Other Survivors</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {otherSurvivors.map((survivor: ISurvivor) => (
          <SurvivorProfile 
            key={survivor.id} 
            survivor={survivor}
            showInfectionReport={true}
          />
        ))}
      </div>
    </div>
  );
};
