import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Header } from '../components/Header';
import type { Feedback } from '../types';
import { describeFeedbackEffect } from '../utils/progressionEngine';

const options: Feedback[] = ['Easy', 'Good', 'Hard'];

export function FeedbackScreen({ onSubmit }: { onSubmit: (feedback: Feedback) => void }) {
  return (
    <div className="space-y-6">
      <Header title="How did it feel?" subtitle="Easy = next workout becomes harder • Good = next workout stays the same • Hard = next workout becomes easier or returns to previous version." />
      <div className="space-y-4">
        {options.map((option) => (
          <Card key={option} className="space-y-3">
            <h2 className="text-2xl font-black text-white">{option}</h2>
            <p className="text-sm leading-6 text-slate-400">{describeFeedbackEffect(option)}</p>
            <Button full variant={option === 'Hard' ? 'secondary' : 'primary'} onClick={() => onSubmit(option)}>Save as {option}</Button>
          </Card>
        ))}
      </div>
    </div>
  );
}
