import React from 'react';

interface TopBarProps {
  mode: 'home' | 'simulation' | 'outcome';
  activeScenarioId?: string;
  onGoHome: () => void;
  onStartScenario: (scenarioId: string) => void;
  onScrollToSection?: (sectionId: string) => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  mode,
  activeScenarioId,
  onGoHome,
  onStartScenario,
  onScrollToSection,
}) => {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-8 px-4 py-3.5 sm:px-6">
        <button
          type="button"
          onClick={onGoHome}
          className="font-display cursor-pointer text-lg font-bold tracking-tight text-[#1B3A6B] whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#1B3A6B]"
        >
          Диспетчер смены
        </button>

        {mode === 'home' ? (
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
            <button
              type="button"
              onClick={() => onScrollToSection?.('scenarios')}
              className="cursor-pointer transition-colors hover:text-[#1B3A6B] whitespace-nowrap shrink-0"
            >
              Сценарии
            </button>
            <button
              type="button"
              onClick={() => onScrollToSection?.('architecture')}
              className="cursor-pointer transition-colors hover:text-[#1B3A6B] whitespace-nowrap shrink-0"
            >
              6 агентов
            </button>
            <button
              type="button"
              onClick={() => onScrollToSection?.('rules')}
              className="cursor-pointer transition-colors hover:text-[#1B3A6B] whitespace-nowrap shrink-0"
            >
              Правила и формат
            </button>
          </nav>
        ) : (
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
            <button
              type="button"
              onClick={() => onStartScenario('scenario-1')}
              className={`cursor-pointer transition-colors whitespace-nowrap shrink-0 ${
                activeScenarioId === 'scenario-1'
                  ? 'font-semibold text-[#1B3A6B] underline decoration-2 underline-offset-8'
                  : 'hover:text-[#1B3A6B]'
              }`}
            >
              Металлообработка
            </button>
            <button
              type="button"
              onClick={() => onStartScenario('scenario-2')}
              className={`cursor-pointer transition-colors whitespace-nowrap shrink-0 ${
                activeScenarioId === 'scenario-2'
                  ? 'font-semibold text-[#1B3A6B] underline decoration-2 underline-offset-8'
                  : 'hover:text-[#1B3A6B]'
              }`}
            >
              Сборочный цех
            </button>
            <button
              type="button"
              onClick={() => onStartScenario('scenario-3')}
              className={`cursor-pointer transition-colors whitespace-nowrap shrink-0 ${
                activeScenarioId === 'scenario-3'
                  ? 'font-semibold text-[#1B3A6B] underline decoration-2 underline-offset-8'
                  : 'hover:text-[#1B3A6B]'
              }`}
            >
              Термический цех
            </button>
          </nav>
        )}

        <div className="flex items-center shrink-0">
          {mode === 'home' ? (
            <button
              type="button"
              onClick={() => onStartScenario('scenario-1')}
              className="cursor-pointer rounded-lg bg-[#1B3A6B] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#142D54] whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1B3A6B]"
            >
              Смотреть пример
            </button>
          ) : (
            <button
              type="button"
              onClick={onGoHome}
              className="cursor-pointer rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:border-slate-400 hover:bg-slate-50 whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1B3A6B]"
            >
              На главную
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
