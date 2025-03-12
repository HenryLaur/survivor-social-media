import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// API functions
export const api = {
  // Survivors
  getSurvivor: async (id: number) => {
    const { data } = await apiClient.get(`/survivors/${id}`);
    return data;
  },
  getSurvivorByName: async (name: string) => {
    const { data } = await apiClient.get(`/survivors/by-name/${name}`);
    return data;
  },
  getAllSurvivors: async () => {
    const { data } = await apiClient.get('/survivors/');
    return data;
  },
  createSurvivor: async (survivor: any) => {
    const { data } = await apiClient.post('/survivors/', survivor);
    return data;
  },
  updateLocation: async (id: number, location: { latitude: number; longitude: number }) => {
    const { data } = await apiClient.put(`/survivors/${id}/location`, location);
    return data;
  },
  // Trading
  executeTrade: async (trade: any) => {
    const { data } = await apiClient.post('/trade', trade);
    return data;
  },
  // Infection Reports
  reportInfection: async (reporterId: number, reportedId: number): Promise<void> => {
    const response = await apiClient.post(`${API_BASE_URL}/survivors/${reportedId}/report`, {
      body: { reporter_id: reporterId },
    });

    if (response.status !== 200) {
      throw new Error(response.data.detail || 'Failed to report infection');
    }
  },
}; 