import React, { useState } from 'react';
import { Button, Card, Label, Select } from './ui';
import { useUser } from '../contexts/UserContext';
import { Gender, ISurvivorForm } from '../types/types';
import { api } from '../api/client';

export const RegisterForm: React.FC = () => {
  const [formData, setFormData] = useState<ISurvivorForm>({
    name: '',
    age: 18,
    gender: Gender.other,
    latitude: 0,
    longitude: 0,
    inventory: {
      water: 0,
      food: 0,
      medication: 0,
      ammunition: 0,
    },
  });
  const [error, setError] = useState('');
  const { setUserName } = useUser();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      if (parent === 'inventory') {
        setFormData((prev) => ({
          ...prev,
          inventory: {
            ...prev.inventory,
            [child]: Number(value),
          },
        }));
      }
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: name === 'age' ? Number(value) : value,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const survivor = await api.createSurvivor(formData);
      setUserName(survivor.name);
    } catch (err) {
      setError('Failed to create survivor. Please try again.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label>Name</Label>
        <input
          id="name"
          name="name"
          type="text"
          value={formData.name}
          onChange={handleChange}
          className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>

      <div>
        <Label>Age</Label>
        <input
          id="age"
          name="age"
          type="number"
          value={formData.age}
          onChange={handleChange}
          className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          min="0"
          required
        />
      </div>

      <div>
        <Label>Gender</Label>
        <Select
          id="gender"
          name="gender"
          value={formData.gender}
          onChange={handleChange}
        >
          <option value={Gender.male}>Male</option>
          <option value={Gender.female}>Female</option>
          <option value={Gender.other}>Other</option>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Latitude</Label>
          <input
            id="latitude"
            name="latitude"
            type="number"
            value={formData.latitude}
            onChange={handleChange}
            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            step="any"
            required
          />
        </div>
        <div>
          <Label>Longitude</Label>
          <input
            id="longitude"
            name="longitude"
            type="number"
            value={formData.longitude}
            onChange={handleChange}
            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            step="any"
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="font-semibold">Inventory</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Water</Label>
            <input
              id="water"
              name="inventory.water"
              type="number"
              value={formData.inventory.water}
              onChange={handleChange}
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              min="0"
              required
            />
          </div>
          <div>
            <Label>Food</Label>
            <input
              id="food"
              name="inventory.food"
              type="number"
              value={formData.inventory.food}
              onChange={handleChange}
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              min="0"
              required
            />
          </div>
          <div>
            <Label>Medication</Label>
            <input
              id="medication"
              name="inventory.medication"
              type="number"
              value={formData.inventory.medication}
              onChange={handleChange}
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              min="0"
              required
            />
          </div>
          <div>
            <Label>Ammunition</Label>
            <input
              id="ammunition"
              name="inventory.ammunition"
              type="number"
              value={formData.inventory.ammunition}
              onChange={handleChange}
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              min="0"
              required
            />
          </div>
        </div>
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}
      <Button className="w-full" type="submit">
        Register Survivor
      </Button>
    </form>
  );
};
