import React from 'react';
import { ArrowRight } from 'lucide-react';
import {
  AGENTS,
  DOWNTIME_CLASSIFIER_GROUPS,
  PROJECT_DESCRIPTION,
  SYSTEM_LAUNCH_COMMAND,
  SYSTEM_OUTPUT_FORMAT,
  SYSTEM_RULES,
} from '../data/agents';
import { SCENARIOS } from '../data/scenarios';
import { AgentConveyor } from './AgentConveyor';

interface HomeViewProps {
  onStartScenario: (scenarioId: string) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({ onStartScenario }) => {
  return (
    <main className="pb-20">
      {/* Dark-blue STIMIT gradient hero */}
      <section
        className="relative overflow-hidden text-white"
        style={{
          background:
            'linear-gradient(145deg, #1B3A6B 0%, #132B52 55%, #0A1830 100%)',
        }}
      >
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
          <div className="max-w-4xl">
            <h1
              className="font-display text-3xl font-bold tracking-tight text-white sm:text-5xl leading-[1.15]"
              style={{ textWrap: 'balance' }}
            >
              Как узнать, что творится в цехах, не обходя их лично?
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-relaxed text-slate-200 sm:text-lg">
              AI-диспетчер сам собирает сменное задание, ловит отклонения от плана и
              выясняет причину каждого простоя — прямо во время смены
            </p>

            <div className="mt-7 flex flex-wrap items-center gap-4">
              <button
                type="button"
                onClick={() => onStartScenario('scenario-1')}
                className="font-display inline-flex cursor-pointer items-center gap-2.5 rounded-lg bg-amber-400 px-6 py-3.5 text-base font-bold text-slate-950 shadow-sm transition-all duration-150 hover:bg-amber-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-300 whitespace-nowrap"
              >
                <span>Смотреть пример</span>
                <ArrowRight className="h-4.5 w-4.5" aria-hidden="true" />
              </button>
            </div>
          </div>

          <div className="mt-10 border-t border-white/15 pt-8">
            <p className="mb-4 text-xs font-semibold tracking-wide text-sky-200/90">
              Конвейер из шести агентов работает последовательно в диалоге с мастером смены
            </p>
            <AgentConveyor mode="hero" />
          </div>
        </div>
      </section>

      {/* Three equal scenario cards */}
      <section id="scenarios" className="mx-auto max-w-6xl px-4 pt-12 sm:px-6">
        <div className="mb-6 flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
          <div>
            <h2 className="font-display text-2xl font-bold tracking-tight text-slate-900">
              Выберите смену для разбора
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              Вы играете роль мастера смены: выбирайте реплики, а панель агентов покажет расчёт и логику системы.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {SCENARIOS.map((scenario) => (
            <article
              key={scenario.id}
              className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
            >
              <div>
                <div className="flex flex-wrap items-center gap-1.5 text-xs font-medium text-slate-500 tabular-nums">
                  <span>Сценарий {scenario.number}</span>
                  <span aria-hidden="true">·</span>
                  <span>{scenario.workshop}</span>
                  <span aria-hidden="true">·</span>
                  <span>{scenario.stepsCount} шагов</span>
                </div>

                <h3 className="font-display mt-3 text-lg font-bold leading-snug text-slate-900">
                  {scenario.title}
                </h3>

                <p className="mt-2.5 text-sm leading-relaxed text-slate-600">
                  {scenario.cardSummary}
                </p>

                <p className="mt-4 text-xs font-medium text-slate-500">
                  Роль: {scenario.foremanRole}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => onStartScenario(scenario.id)}
                  className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-[#1B3A6B] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#142D54] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1B3A6B] whitespace-nowrap"
                >
                  <span>Разобрать</span>
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Embedded 6-agent architecture & rules */}
      <section
        id="architecture"
        className="mx-auto max-w-6xl px-4 pt-16 sm:px-6"
      >
        <div className="border-t border-slate-200 pt-12">
          <div className="max-w-3xl">
            <h2 className="font-display text-2xl font-bold tracking-tight text-slate-900">
              Как устроена агентная система «Диспетчер смены»
            </h2>
            <p className="mt-3 text-base leading-relaxed text-slate-600">
              {PROJECT_DESCRIPTION}
            </p>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2 lg:grid-cols-3">
            {AGENTS.map((agent) => (
              <div
                key={agent.id}
                className="border-t border-slate-200 pt-4"
              >
                <div className="flex items-baseline gap-2.5">
                  <span className="font-mono-tabular text-xs font-semibold text-[#1B3A6B]">
                    0{agent.order}.
                  </span>
                  <h3 className="font-display text-base font-bold text-slate-900">
                    {agent.name}
                  </h3>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  {agent.fullSpecification}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Rules, Classifier, Launch Command & Output Format */}
      <section id="rules" className="mx-auto max-w-6xl px-4 pt-14 sm:px-6">
        <div className="grid grid-cols-1 gap-8 border-t border-slate-200 pt-10 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <h3 className="font-display text-lg font-bold text-slate-900">
              Правила работы и классификатор простоев
            </h3>
            <ul className="mt-4 space-y-2.5 text-sm leading-relaxed text-slate-600">
              {SYSTEM_RULES.map((rule, index) => (
                <li key={index} className="flex gap-2.5">
                  <span className="font-mono-tabular mt-0.5 text-xs font-semibold text-[#1B3A6B]">
                    {index + 1}.
                  </span>
                  <span>{rule}</span>
                </li>
              ))}
            </ul>

            <div className="mt-6">
              <p className="text-xs font-semibold text-slate-500">
                Пять групп классификатора причин простоя
              </p>
              <p className="mt-1.5 text-sm font-medium text-slate-800">
                {DOWNTIME_CLASSIFIER_GROUPS.join(' · ')}
              </p>
            </div>
          </div>

          <div className="space-y-5 lg:col-span-5">
            <div>
              <p className="text-xs font-semibold text-slate-500">
                Команда запуска системы
              </p>
              <p className="font-mono-tabular mt-1.5 rounded-lg border border-slate-200 bg-white px-4 py-3 text-xs leading-relaxed text-slate-800">
                {SYSTEM_LAUNCH_COMMAND}
              </p>
            </div>

            <div>
              <p className="text-xs font-semibold text-slate-500">
                Формат итоговой сводки
              </p>
              <p className="font-mono-tabular mt-1.5 rounded-lg border border-slate-200 bg-white px-4 py-3 text-xs leading-relaxed text-slate-700">
                {SYSTEM_OUTPUT_FORMAT}
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};
