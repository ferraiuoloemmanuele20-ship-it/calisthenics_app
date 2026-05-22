import { useState } from 'react';
import { equipmentLabels } from '../data/exerciseLibrary';
import type { Equipment, Level, UserSettings } from '../types';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Header } from '../components/Header';

const equipmentOptions = Object.keys(equipmentLabels) as Equipment[];
const levels: Level[] = ['Base', 'Intermediate', 'Advanced'];

export function OnboardingScreen({ initial, onSave }: { initial?: UserSettings | null; onSave: (settings: UserSettings) => void }) {
  const [equipment, setEquipment] = useState<Equipment[]>(initial?.equipment ?? ['pullupBar']);
  const [level, setLevel] = useState<Level>(initial?.level ?? 'Base');

  const toggleEquipment = (item: Equipment) => {
    setEquipment((current) => current.includes(item) ? current.filter((value) => value !== item) : [...current, item]);
  };

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#1e293b,#020617_55%)] px-4 py-8">
      <div className="mx-auto max-w-md space-y-6">
        <Header title="Set up your upper-body plan" subtitle="Choose only the equipment you can use today. Workouts never include leg training." />
        <Card className="space-y-4">
          <h2 className="text-lg font-black text-white">1. Equipment</h2>
          <div className="grid gap-3">
            {equipmentOptions.map((item) => (
              <button
                key={item}
                onClick={() => toggleEquipment(item)}
                className={`rounded-2xl border p-4 text-left font-bold transition ${equipment.includes(item) ? 'border-lime-300 bg-lime-300 text-slate-950' : 'border-slate-700 bg-slate-950 text-white'}`}
              >
                {equipmentLabels[item]}
              </button>
            ))}
          </div>
          {equipment.length === 0 ? <p className="text-sm text-amber-200">Select at least one item so the app can create a pull movement.</p> : null}
        </Card>
        <Card className="space-y-4">
          <h2 className="text-lg font-black text-white">2. Level</h2>
          <div className="grid gap-3">
            {levels.map((item) => (
              <button
                key={item}
                onClick={() => setLevel(item)}
                className={`rounded-2xl border p-4 text-left font-bold transition ${level === item ? 'border-lime-300 bg-lime-300 text-slate-950' : 'border-slate-700 bg-slate-950 text-white'}`}
              >
                {item}
              </button>
            ))}
          </div>
        </Card>
        <Button full disabled={equipment.length === 0} onClick={() => onSave({ equipment, level, onboarded: true })}>
          Build my trainer
        </Button>
      </div>
    </main>
  );
}
