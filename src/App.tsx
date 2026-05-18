import { useMemo, useState } from 'react';
import { BottomNav } from './components/BottomNav';
import { Dashboard } from './screens/Dashboard';
import { ActiveWorkoutScreen } from './screens/ActiveWorkoutScreen';
import { FeedbackScreen } from './screens/FeedbackScreen';
import { OnboardingScreen } from './screens/OnboardingScreen';
import { ProgressHistoryScreen } from './screens/ProgressHistoryScreen';
import { SettingsScreen } from './screens/SettingsScreen';
import { WorkoutGeneratorScreen } from './screens/WorkoutGeneratorScreen';
import type { CompletedWorkout, Feedback, Screen, UserSettings, Workout } from './types';
import { updateProgressionAfterWorkout } from './utils/progressionEngine';
import { loadState, resetAllProgress, saveHistory, saveProgression, saveSettings } from './utils/storage';

function App() {
  const initialState = useMemo(() => loadState(), []);
  const [settings, setSettings] = useState<UserSettings | null>(initialState.settings);
  const [history, setHistory] = useState(initialState.history);
  const [progression, setProgression] = useState(initialState.progression);
  const [screen, setScreen] = useState<Screen>(initialState.settings?.onboarded ? 'dashboard' : 'onboarding');
  const [activeWorkout, setActiveWorkout] = useState<Workout | null>(null);

  const handleSaveSettings = (nextSettings: UserSettings) => {
    setSettings(nextSettings);
    saveSettings(nextSettings);
    setScreen('dashboard');
  };

  const handleStartWorkout = (workout: Workout) => {
    setActiveWorkout(workout);
    setScreen('active');
  };

  const handleFeedback = (feedback: Feedback) => {
    if (!activeWorkout) return;
    const completed: CompletedWorkout = {
      ...activeWorkout,
      feedback,
      completedAt: new Date().toISOString(),
    };
    const nextHistory = [completed, ...history];
    const nextProgression = updateProgressionAfterWorkout(progression, completed);
    setHistory(nextHistory);
    setProgression(nextProgression);
    saveHistory(nextHistory);
    saveProgression(nextProgression);
    setActiveWorkout(null);
    setScreen('history');
  };

  const handleReset = () => {
    resetAllProgress();
    setHistory([]);
    setProgression({});
  };

  if (!settings || screen === 'onboarding') {
    return <OnboardingScreen initial={settings} onSave={handleSaveSettings} />;
  }

  const content = (() => {
    if (screen === 'dashboard') return <Dashboard settings={settings} history={history} progression={progression} onNavigate={setScreen} />;
    if (screen === 'generator') return <WorkoutGeneratorScreen settings={settings} progression={progression} onStart={handleStartWorkout} />;
    if (screen === 'active' && activeWorkout) return <ActiveWorkoutScreen workout={activeWorkout} onFinish={() => setScreen('feedback')} />;
    if (screen === 'feedback') return <FeedbackScreen onSubmit={handleFeedback} />;
    if (screen === 'history') return <ProgressHistoryScreen history={history} progression={progression} onReset={handleReset} />;
    if (screen === 'settings') return <SettingsScreen settings={settings} onSave={handleSaveSettings} onReset={handleReset} />;
    return <Dashboard settings={settings} history={history} progression={progression} onNavigate={setScreen} />;
  })();

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#1e293b,#020617_55%)] px-4 pb-28 pt-8">
      <div className="mx-auto max-w-md">{content}</div>
      {screen !== 'active' && screen !== 'feedback' ? <BottomNav current={screen} onNavigate={setScreen} /> : null}
    </main>
  );
}

export default App;
