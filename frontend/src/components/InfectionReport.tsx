import React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from './ui';
import { useUser } from '../contexts/UserContext';
import { api } from '../api/client';
import { ISurvivor } from '../types/types';

interface IInfectionReportProps {
  survivor: ISurvivor;
}

export const InfectionReport: React.FC<IInfectionReportProps> = ({ survivor }) => {
  const { user } = useUser();
  const queryClient = useQueryClient();
  const reportMutation = useMutation({
    mutationFn: () => {
      if (!user) throw new Error('You must be logged in to report infections');
      return api.reportInfection(user.id, survivor.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['survivors'] });
    },
  });
  if (!user || user.id === survivor.id || survivor.infected || survivor.reporters?.length >= 3 || survivor.reporters?.some(reporterId => reporterId === user.id)) {
    return null;
  }

  const hasReported = survivor.reporters?.some(
    reporterId => reporterId === user.id
  );
  return (
    <div className="mt-2">
      <Button
        disabled={hasReported || reportMutation.isPending}
        onClick={() => reportMutation.mutate()}
        className="bg-red-500 hover:bg-red-600 text-white"
      >
        {hasReported 
          ? 'Already Reported' 
          : reportMutation.isPending 
            ? 'Reporting...' 
            : 'Report as Infected'}
      </Button>
      {survivor.reporters && (
        <p className="text-sm text-gray-600 mt-1">
          Infection Reports: {survivor.reporters.length}/3
        </p>
      )}
    </div>
  );
}; 