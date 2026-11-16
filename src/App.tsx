import { useState } from 'react';
import { MotionConfig } from 'motion/react';
import { SCENARIOS } from './data/scenarios';
import { TopBar } from './components/TopBar';
import { HomeView } from './components/HomeView';
import { SimulationView } from './components/SimulationView';
import { ShiftOutcomeView } from './components/ShiftOutcomeView';

type AppMode = 'home' | 'simulation' | 'outcome';

export default function App() {
  const [mode, setMode] = useState<AppMode>('home');
  const [activeScenarioId, setActiveScenarioId] = useState<string>('scenario-1');
  const [initialStepIndex, setInitialStepIndex] = useState<number>(0);
  const [outcomeKey, setOutcomeKey] = useState<string>('reallocate');
  const [runCounter, setRunCounter] = useState<number>(0);
  const [hasDismissedHint, setHasDismissedHint] = useState<boolean>(false);

  const activeScenario =
    SCENARIOS.find((s) => s.id === activeScenarioId) ?? SCENARIOS[0];

  const activeOutcome =
    activeScenario.outcomes[outcomeKey] ??
    Object.values(activeScenario.outcomes)[0];

  const handleGoHome = () => {
    setMode('home');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleStartScenario = (scenarioId: string, stepIdx = 0) => {
    setActiveScenarioId(scenarioId);
    setInitialStepIndex(stepIdx);
    setRunCounter((c) => c + 1);
    setMode('simulation');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCompleteShift = (selectedOutcomeKey: string) => {
    setOutcomeKey(selectedOutcomeKey);
    setMode('outcome');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleScrollToSection = (sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <MotionConfig reducedMotion="user">
      <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
        <TopBar
          mode={mode}
          activeScenarioId={mode === 'home' ? undefined : activeScenario.id}
          onGoHome={handleGoHome}
          onStartScenario={(id) => handleStartScenario(id, 0)}
          onScrollToSection={handleScrollToSection}
        />

        {mode === 'home' && (
          <HomeView onStartScenario={(id) => handleStartScenario(id, 0)} />
        )}

        {mode === 'simulation' && (
          <SimulationView
            key={`${activeScenario.id}-${runCounter}`}
            scenario={activeScenario}
            initialStepIndex={initialStepIndex}
            showInitialHint={!hasDismissedHint}
            onDismissHint={() => setHasDismissedHint(true)}
            onSelectScenario={(id) => handleStartScenario(id, 0)}
            onCompleteShift={handleCompleteShift}
          />
        )}

        {mode === 'outcome' && (
          <ShiftOutcomeView
            scenario={activeScenario}
            outcome={activeOutcome}
            onSelectScenario={handleStartScenario}
            onGoHome={handleGoHome}
          />
        )}
      </div>
    </MotionConfig>
  );
}
