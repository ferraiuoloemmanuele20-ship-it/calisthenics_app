import { useState } from 'react';
import { equipmentLabels } from '../data/exerciseLibrary';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Header } from '../components/Header';
import type { Equipment, Level, UserSettings } from '../types';

const equipmentOptions = Object.keys(equipmentLabels) as Equipment[];
const levels: Level[] = ['Base', 'Intermediate', 'Advanced'];

export function SettingsScreen({ settings, onSave, onReset }: { settings: UserSettings; onSave: (settings: UserSettings) => void; onReset: () => void }) {
  const [equipment, setEquipment] = useState<Equipment[]>(settings.equipment);
  const [level, setLevel] = useState<Level>(settings.level);
  const toggleEquipment = (item: Equipment) => setEquipment((current) => current.includes(item) ? current.filter((value) => value !== item) : [...current, item]);

  return (
    <div className="space-y-6">
      <Header title="Settings" subtitle="Update equipment or level any time. This changes future generated workouts only." />
      <Card className="space-y-4">
        <h2 className="text-lg font-black text-white">Equipment</h2>
        {equipmentOptions.map((item) => (
          <button key={item} onClick={() => toggleEquipment(item)} className={`mb-3 w-full rounded-2xl border p-4 text-left font-bold ${equipment.includes(item) ? 'border-lime-300 bg-lime-300 text-slate-950' : 'border-slate-700 bg-slate-950 text-white'}`}>
            {equipmentLabels[item]}
          </button>
        ))}
      </Card>
      <Card className="space-y-4">
        <h2 className="text-lg font-black text-white">Level</h2>
        <div className="grid grid-cols-1 gap-3">
          {levels.map((item) => <button key={item} onClick={() => setLevel(item)} className={`rounded-2xl border p-4 text-left font-bold ${level === item ? 'border-lime-300 bg-lime-300 text-slate-950' : 'border-slate-700 bg-slate-950 text-white'}`}>{item}</button>)}
        </div>
      </Card>
      <Button full disabled={equipment.length === 0} onClick={() => onSave({ equipment, level, onboarded: true })}>Save settings</Button>
      <Button full variant="danger" onClick={onReset}>Reset progress and history</Button>
    </div>
  );
}
