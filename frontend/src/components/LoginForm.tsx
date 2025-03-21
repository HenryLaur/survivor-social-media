import React, { useState } from 'react';
import { Button, Label } from './ui';
import { useUser } from '../contexts/UserContext';
import { api } from '../api/client';

export const LoginForm: React.FC = () => {
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const { setUserName } = useUser();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const survivor = await api.getSurvivorByName(name);
      setUserName(survivor.name);
    } catch (err) {
      setError('Failed to find survivor. Please check the name and try again.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label>Survivor Name</Label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter your survivor name"
          required
        />
      </div>
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <Button className="w-full" type="submit">
        Login
      </Button>
    </form>
  );
};
