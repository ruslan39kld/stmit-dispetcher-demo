import React, { useEffect, useState } from 'react';
import { ArrowRight, CheckCircle2, RotateCcw } from 'lucide-react';
import { motion } from 'motion/react';
import { SCENARIOS } from '../data/scenarios';
import { Scenario, ShiftOutcome } from '../types/dispatch';
import { AgentConveyor } from './AgentConveyor';

interface ShiftOutcomeViewProps {
  scenario: Scenario;
  outcome: ShiftOutcome;
  onSelectScenario: (scenarioId: string, initialStepIndex?: number) => void;
  onGoHome: () => void;
}

export const ShiftOutcomeView: React.FC<ShiftOutcomeViewProps> = ({
  scenario,
  outcome,
  onSelectScenario,
  onGoHome,
}) => {
  const [displayScore, setDisplayScore] = useState<number>(0);
  const [showScenarioPicker, setShowScenarioPicker] = useState<boolean>(false);

  useEffect(() => {
    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReduced) {
      setDisplayScore(outcome.score);
      return;
    }

    let rafId = 0;
    const duration = 1100;
    const start = performance.now();

    const tick = (now: number) => {
      const elapsed = now - start;
      const t = Math.min(1, elapsed / duration);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplayScore(Math.round(eased * outcome.score));
      if (t < 1) {
        rafId = requestAnimationFrame(tick);
      }
    };

    setDisplayScore(0);
    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [outcome.id, outcome.score]);

  const otherScenarios = SCENARIOS.filter((s) => s.id !== scenario.id);

  return (
    <main className="min-h-[calc(100vh-61px)] bg-slate-50 pb-16">
      {/* Dark-blue summary block in hero style */}
      <section
        className="text-white"
        style={{
          background:
            'linear-gradient(145deg, #1B3A6B 0%, #132B52 55%, #0A1830 100%)',
        }}
      >
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-12">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold tracking-wide text-sky-200">
                Агент «Отчёт» · Итог смены
              </p>
              <h1 className="font-display mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Итог смены: {scenario.title}
              </h1>
              <p className="mt-2 text-sm text-slate-200">
                {outcome.shiftLabel}
              </p>
            </div>

            {/* Animated Shift Score */}
            <div className="flex items-center gap-5 rounded-xl border border-white/20 bg-white/10 px-6 py-5 shrink-0">
              <div>
                <span className="block text-xs font-medium text-sky-200">
                  Балл смены
                </span>
                <div className="mt-1 flex items-baseline gap-1.5">
                  <span className="font-mono-tabular text-5xl font-bold text-amber-300">
                    {displayScore}
                  </span>
                  <span className="font-mono-tabular text-lg font-medium text-slate-300">
                    / 100
                  </span>
                </div>
              </div>
              <div className="border-l border-white/20 pl-5 max-w-[190px]">
                <span className="block text-xs font-semibold text-white">
                  {outcome.scoreVerdict}
                </span>
                <span className="mt-1 block text-xs text-slate-300">
                  Зачёт только по годной продукции
                </span>
              </div>
            </div>
          </div>

          <div className="mt-8 border-t border-white/15 pt-6">
            <AgentConveyor mode="progress" allCompleted />
          </div>
        </div>
      </section>

      {/* Sequentially revealed report blocks */}
      <div className="mx-auto max-w-6xl px-4 pt-8 sm:px-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* 1. План / Факт */}
          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.15 }}
            className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <h2 className="text-xs font-semibold text-slate-500">
              План и факт
            </h2>
            <p className="font-display mt-2 text-xl font-bold text-slate-900 tabular-nums">
              {outcome.planFact}
            </p>
            {outcome.extraQualityLine && (
              <p className="mt-2 text-sm font-medium text-slate-700">
                {outcome.extraQualityLine}
              </p>
            )}
          </motion.section>

          {/* 2. Отклонение */}
          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.35 }}
            className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <h2 className="text-xs font-semibold text-slate-500">
              Отклонение от графика
            </h2>
            <p className="font-display mt-2 text-xl font-bold text-slate-900 tabular-nums">
              {outcome.deviation}
            </p>
            <p className="mt-2 text-sm text-slate-600">
              Допуск системы: −10%. Статус зафиксирован агентом «Контролёр».
            </p>
          </motion.section>
        </div>

        {/* 3. Хронология простоев с причинами */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.55 }}
          className="mt-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <h2 className="font-display text-lg font-bold text-slate-900">
            Хронология простоев и причины
          </h2>
          <ul className="mt-4 space-y-3">
            {outcome.downtimeChronology.map((item, idx) => (
              <li
                key={idx}
                className="flex items-start gap-3 border-t border-slate-100 pt-3 first:border-t-0 first:pt-0 text-sm leading-relaxed text-slate-700"
              >
                <span className="font-mono-tabular mt-0.5 text-xs font-bold text-[#1B3A6B]">
                  0{idx + 1}.
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </motion.section>

        {/* 4 & 5. Выводы и рекомендации */}
        <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.75 }}
            className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <h2 className="font-display text-lg font-bold text-slate-900">
              Выводы по смене
            </h2>
            <ul className="mt-4 space-y-2.5">
              {outcome.conclusions.map((line, idx) => (
                <li
                  key={idx}
                  className="flex items-start gap-2.5 text-sm leading-relaxed text-slate-700"
                >
                  <CheckCircle2
                    className="mt-0.5 h-4 w-4 shrink-0 text-[#1B3A6B]"
                    aria-hidden="true"
                  />
                  <span>{line}</span>
                </li>
              ))}
            </ul>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.95 }}
            className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <h2 className="font-display text-lg font-bold text-slate-900">
              Рекомендации на следующую смену
            </h2>
            <ul className="mt-4 space-y-2.5">
              {outcome.recommendations.map((rec, idx) => (
                <li
                  key={idx}
                  className="flex items-start gap-2.5 text-sm leading-relaxed text-slate-700"
                >
                  <span className="font-mono-tabular mt-0.5 text-xs font-bold text-[#1B3A6B]">
                    {idx + 1}.
                  </span>
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </motion.section>
        </div>

        {/* Structured summary format line */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 1.1 }}
          className="mt-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
        >
          <p className="text-xs font-semibold text-slate-500">
            Сформированная запись журнала (формат вывода системы)
          </p>
          <p className="font-mono-tabular mt-2 text-xs leading-relaxed text-slate-800">
            {outcome.formattedSummary}
          </p>
        </motion.section>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 1.2 }}
          className="mt-8 flex flex-col gap-4"
        >
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => setShowScenarioPicker((prev) => !prev)}
              className="font-display inline-flex cursor-pointer items-center gap-2 rounded-lg bg-[#1B3A6B] px-6 py-3 text-sm font-bold text-white shadow-sm transition-colors hover:bg-[#142D54] whitespace-nowrap focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1B3A6B]"
            >
              <span>Пройти другой сценарий</span>
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </button>

            <button
              type="button"
              onClick={onGoHome}
              className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition-colors hover:border-slate-400 hover:bg-slate-50 whitespace-nowrap focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1B3A6B]"
            >
              <span>Вернуться на главную</span>
            </button>

            {scenario.id === 'scenario-1' && (
              <button
                type="button"
                onClick={() => onSelectScenario('scenario-1', 4)}
                className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-950 transition-colors hover:bg-amber-100 whitespace-nowrap"
              >
                <RotateCcw className="h-4 w-4" aria-hidden="true" />
                <span>Переиграть шаг 5 (другое решение)</span>
              </button>
            )}
          </div>

          {showScenarioPicker && (
            <div className="grid grid-cols-1 gap-4 pt-2 sm:grid-cols-2">
              {otherScenarios.map((sc) => (
                <button
                  key={sc.id}
                  type="button"
                  onClick={() => onSelectScenario(sc.id, 0)}
                  className="flex cursor-pointer items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-4 text-left shadow-sm transition-all hover:border-[#1B3A6B] hover:shadow-md"
                >
                  <div>
                    <span className="text-xs font-medium text-slate-500">
                      Сценарий {sc.number} · {sc.workshop} · {sc.stepsCount} шагов
                    </span>
                    <p className="font-display mt-1 text-base font-bold text-slate-900">
                      {sc.title}
                    </p>
                  </div>
                  <ArrowRight className="h-4 w-4 shrink-0 text-[#1B3A6B]" />
                </button>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </main>
  );
};
