import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button, Card, Label, Select } from './ui';
import { useUser } from '../contexts/UserContext';
import { ISurvivor, IInventory, ITrade } from '../types/types';
import { api } from '../api/client';

const emptyInventory: IInventory = {
  water: 0,
  food: 0,
  medication: 0,
  ammunition: 0,
};

const calculatePoints = (inventory: IInventory): number => {
  return (
    inventory.water * 4 +
    inventory.food * 3 +
    inventory.medication * 2 +
    inventory.ammunition
  );
};

export const TradeForm: React.FC<{ onSuccess: () => void }> = ({
  onSuccess,
}) => {
  const queryClient = useQueryClient();
  const { user, refreshUser } = useUser();
  const [selectedSurvivor, setSelectedSurvivor] = useState<ISurvivor | null>(
    null
  );
  const [myOffer, setMyOffer] = useState<IInventory>(emptyInventory);
  const [theirOffer, setTheirOffer] = useState<IInventory>(emptyInventory);
  const [error, setError] = useState('');

  const { data: availableSurvivors = [] } = useQuery({
    queryKey: ['survivors'],
    queryFn: api.getAllSurvivors,
    select: (survivors: ISurvivor[]) =>
      survivors.filter((s: ISurvivor) => s.id !== user?.id && !s.infected),
    enabled: !!user,
  });

  const tradeMutation = useMutation<void, Error, ITrade>({
    mutationFn: api.executeTrade,
    onSuccess: async () => {
      await refreshUser();
      await queryClient.invalidateQueries({ queryKey: ['survivors'] });
      setMyOffer(emptyInventory);
      setTheirOffer(emptyInventory);
      setSelectedSurvivor(null);
      onSuccess();
    },
    onError: (error: Error) => {
      setError(error.message || 'Failed to execute trade. Please try again.');
    },
  });

  const handleSurvivorSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = availableSurvivors.find(
      (s) => s.id === Number(e.target.value)
    );
    setSelectedSurvivor(selected || null);
    setTheirOffer(emptyInventory);
  };

  const handleOfferChange = (
    setValue: React.Dispatch<React.SetStateAction<IInventory>>,
    inventory: IInventory,
    item: keyof IInventory,
    value: number
  ) => {
    if (!inventory || typeof inventory[item] !== 'number') return;

    const maxValue = inventory[item] as number;
    const validValue = Math.min(Math.max(0, value), maxValue);

    setValue((prev) => ({
      ...prev,
      [item]: validValue,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSurvivor || !user || !user.id || !selectedSurvivor.id) return;

    const myPoints = calculatePoints(myOffer);
    const theirPoints = calculatePoints(theirOffer);

    if (myPoints !== theirPoints) {
      setError('Trade points must be equal on both sides');
      return;
    }

    tradeMutation.mutate({
      trader1: {
        survivor_id: user.id,
        items: myOffer,
      },
      trader2: {
        survivor_id: selectedSurvivor.id,
        items: theirOffer,
      },
    });
  };

  if (!user) return null;

  const myPoints = calculatePoints(myOffer);
  const theirPoints = calculatePoints(theirOffer);

  return (
    <Card>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <Label>Select Trader</Label>
          <Select
            id="trader"
            value={selectedSurvivor ? String(selectedSurvivor.id) : ''}
            onChange={handleSurvivorSelect}
          >
            <option value="">Select a survivor</option>
            {availableSurvivors.map((survivor: ISurvivor) => (
              <option key={survivor.id} value={String(survivor.id)}>
                {survivor.name}
              </option>
            ))}
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold mb-2">
              Your Offer (Points: {myPoints})
            </h3>
            <div className="space-y-2">
              {Object.entries(user.inventory).map(([item, quantity]) => (
                <div key={item}>
                  <Label>
                    {item} (Available: {quantity})
                  </Label>
                  <input
                    id={`my-${item}`}
                    type="number"
                    value={myOffer[item as keyof IInventory]}
                    onChange={(e) =>
                      handleOfferChange(
                        setMyOffer,
                        user.inventory,
                        item as keyof IInventory,
                        Number(e.target.value)
                      )
                    }
                    className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="0"
                    max={quantity}
                  />
                </div>
              ))}
            </div>
          </div>

          {selectedSurvivor && (
            <div>
              <h3 className="font-semibold mb-2">
                Their Offer (Points: {theirPoints})
              </h3>
              <div className="space-y-2">
                {Object.entries(selectedSurvivor.inventory).map(
                  ([item, quantity]) => (
                    <div key={item}>
                      <Label>
                        {item} (Available: {quantity})
                      </Label>
                      <input
                        id={`their-${item}`}
                        type="number"
                        value={theirOffer[item as keyof IInventory]}
                        onChange={(e) =>
                          handleOfferChange(
                            setTheirOffer,
                            selectedSurvivor.inventory,
                            item as keyof IInventory,
                            Number(e.target.value)
                          )
                        }
                        className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        min="0"
                        max={quantity}
                      />
                    </div>
                  )
                )}
              </div>
            </div>
          )}
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <Button
          type="submit"
          disabled={
            !selectedSurvivor ||
            tradeMutation.isPending ||
            myPoints !== theirPoints
          }
        >
          {tradeMutation.isPending ? 'Trading...' : 'Execute Trade'}
        </Button>
      </form>
    </Card>
  );
};
