import React from 'react';
import { ISurvivor } from '../types/types';
import { InfectionReport } from './InfectionReport';

interface SurvivorProfileProps {
  survivor: ISurvivor;
  showInfectionReport?: boolean;
}

export const SurvivorProfile: React.FC<SurvivorProfileProps> = ({
  survivor,
  showInfectionReport = false,
}) => {
  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="space-y-4 w-full">
        <div className="flex justify-between items-start">
          <h3 className="text-xl font-bold text-gray-900">
            {survivor.name}
            {survivor.infected && (
              <span className="ml-2 text-red-600 text-sm">(Infected)</span>
            )}
          </h3>
          {showInfectionReport && <InfectionReport survivor={survivor} />}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-50 p-3 rounded-lg">
            <h4 className="font-medium text-gray-600">Age</h4>
            <p className="text-lg font-bold text-gray-900">{survivor.age}</p>
          </div>
          <div className="bg-gray-50 p-3 rounded-lg">
            <h4 className="font-medium text-gray-600">Gender</h4>
            <p className="text-lg font-bold text-gray-900 capitalize">
              {survivor.gender}
            </p>
          </div>
          <div className="bg-gray-50 p-3 rounded-lg">
            <h4 className="font-medium text-gray-600">Location</h4>
            <p className="text-lg font-bold text-gray-900">
              {survivor.latitude}°, {survivor.longitude}°
            </p>
          </div>
          <div className="bg-gray-50 p-3 rounded-lg">
            <h4 className="font-medium text-gray-600">Status</h4>
            <p
              className={`text-lg font-bold ${
                survivor.infected ? 'text-red-600' : 'text-green-600'
              }`}
            >
              {survivor.infected ? 'Infected' : 'Healthy'}
            </p>
          </div>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg hover:bg-gray-100 transition-colors">
          <h3 className="font-medium text-gray-600 capitalize">
            Infection Reports
          </h3>
          <p className="text-2xl font-bold text-gray-900">
            {survivor.reporters?.length || 0}
            <span className="text-lg text-gray-600"> / 3</span>
          </p>
        </div>
        <div>
          <h4 className="font-medium text-gray-600 mb-2">Inventory</h4>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(survivor.inventory).map(([item, quantity]) => (
              <div key={item} className="bg-gray-50 p-3 rounded-lg">
                <h5 className="font-medium text-gray-600 capitalize">{item}</h5>
                <p className="text-lg font-bold text-gray-900">{quantity}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
