import axios from 'axios';
import { ISurvivorForm, ITrade } from '../types/types';

const API_BASE_URL = 'http://localhost:8000/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// API functions
export const api = {
  getSurvivorByName: async (name: string) => {
    const { data } = await apiClient.get(`/survivors/name/${name}`);
    return data;
  },

  getAllSurvivors: async () => {
    const { data } = await apiClient.get('/survivors/');
    return data;
  },

  createSurvivor: async (survivor: ISurvivorForm) => {
    const { data } = await apiClient.post('/survivors/', survivor);
    return data;
  },

  updateLocation: async (
    id: number,
    location: { latitude: number; longitude: number }
  ) => {
    const { data } = await apiClient.put(`/survivors/${id}/location`, location);
    return data;
  },

  executeTrade: async (trade: ITrade) => {
    const { data } = await apiClient.post('/trade', trade);
    return data;
  },

  reportInfection: async (
    reporterId: number,
    reportedId: number
  ): Promise<void> => {
    const response = await apiClient.post(
      `${API_BASE_URL}/survivors/${reportedId}/report`,
      {
        reporter_id: reporterId,
      }
    );

    if (response.status !== 200) {
      throw new Error(response.data.detail || 'Failed to report infection');
    }
  },
};
