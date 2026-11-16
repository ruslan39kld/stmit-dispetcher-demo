import React, { useEffect, useRef, useState } from 'react';
import {
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Send,
  X,
  RotateCcw,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AGENTS } from '../data/agents';
import { SCENARIOS } from '../data/scenarios';
import {
  AgentId,
  AgentPanelField,
  AgentReasoningLog,
  DialogueMessage,
  ReplyOption,
  Scenario,
} from '../types/dispatch';
import { AgentConveyor } from './AgentConveyor';

interface SimulationViewProps {
  scenario: Scenario;
  showInitialHint: boolean;
  onDismissHint: () => void;
  onSelectScenario: (scenarioId: string) => void;
  onCompleteShift: (outcomeKey: string) => void;
  initialStepIndex?: number;
}

interface StepLogEntry {
  stepNumber: number;
  agentId: AgentId;
  reasoning: AgentReasoningLog;
}

export const SimulationView: React.FC<SimulationViewProps> = ({
  scenario,
  showInitialHint,
  onDismissHint,
  onSelectScenario,
  onCompleteShift,
  initialStepIndex = 0,
}) => {
  const [currentStepIdx, setCurrentStepIdx] = useState<number>(initialStepIndex);
  const [messages, setMessages] = useState<DialogueMessage[]>([]);
  const [isTyping, setIsTyping] = useState<boolean>(true);
  const [typingAgentName, setTypingAgentName] = useState<string>(
    AGENTS.find((a) => a.id === scenario.steps[initialStepIndex].agentId)?.name ??
      'Диспетчер'
  );
  const [askedOptionIds, setAskedOptionIds] = useState<string[]>([]);
  const [isTransitioning, setIsTransitioning] = useState<boolean>(false);
  const [selectedBranch, setSelectedBranch] = useState<string>('standard');
  const [isShiftFinished, setIsShiftFinished] = useState<boolean>(false);
  const [allAgentsDone, setAllAgentsDone] = useState<boolean>(false);

  const [panelFields, setPanelFields] = useState<AgentPanelField[]>(
    scenario.steps[initialStepIndex].panelFields
  );
  const [changedFieldKeys, setChangedFieldKeys] = useState<string[]>([]);
  const [activeReasoning, setActiveReasoning] = useState<AgentReasoningLog>(
    scenario.steps[initialStepIndex].reasoning
  );
  const [stepLogs, setStepLogs] = useState<StepLogEntry[]>([
    {
      stepNumber: scenario.steps[initialStepIndex].stepNumber,
      agentId: scenario.steps[initialStepIndex].agentId,
      reasoning: scenario.steps[initialStepIndex].reasoning,
    },
  ]);
  const [selectedLogStep, setSelectedLogStep] = useState<number>(
    scenario.steps[initialStepIndex].stepNumber
  );
  const [isJournalOpen, setIsJournalOpen] = useState<boolean>(false);

  const [mobileTab, setMobileTab] = useState<'dialogue' | 'agents'>('dialogue');
  const [hasUnreadAgentUpdate, setHasUnreadAgentUpdate] = useState<boolean>(false);
  const [arbitraryInput, setArbitraryInput] = useState<string>('');

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const timeoutsRef = useRef<number[]>([]);
  const prevFieldMapRef = useRef<Record<string, string>>({});

  const clearTimers = () => {
    timeoutsRef.current.forEach((id) => window.clearTimeout(id));
    timeoutsRef.current = [];
  };

  const schedule = (fn: () => void, ms: number) => {
    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const id = window.setTimeout(fn, prefersReduced ? 30 : ms);
    timeoutsRef.current.push(id);
  };

  // Initialize / reset when scenario changes
  useEffect(() => {
    clearTimers();
    const startStep = scenario.steps[initialStepIndex];
    const startAgent = AGENTS.find((a) => a.id === startStep.agentId);

    setCurrentStepIdx(initialStepIndex);
    setAskedOptionIds([]);
    setIsTransitioning(false);
    setSelectedBranch(scenario.id === 'scenario-1' ? 'reallocate' : 'standard');
    setIsShiftFinished(false);
    setAllAgentsDone(false);
    setMessages([]);
    setIsTyping(true);
    setTypingAgentName(startAgent?.name ?? 'Планировщик');
    setPanelFields(startStep.panelFields);
    setChangedFieldKeys(startStep.panelFields.map((f) => f.key));
    setActiveReasoning(startStep.reasoning);
    setStepLogs([
      {
        stepNumber: startStep.stepNumber,
        agentId: startStep.agentId,
        reasoning: startStep.reasoning,
      },
    ]);
    setSelectedLogStep(startStep.stepNumber);
    setIsJournalOpen(false);
    setMobileTab('dialogue');
    setHasUnreadAgentUpdate(false);

    const map: Record<string, string> = {};
    startStep.panelFields.forEach((f) => {
      map[f.key] = f.value;
    });
    prevFieldMapRef.current = map;

    schedule(() => {
      setIsTyping(false);
      setMessages([
        {
          id: `init-${scenario.id}-${startStep.stepNumber}`,
          sender: 'system',
          agentId: startStep.agentId,
          agentName: startAgent?.name ?? 'Планировщик',
          text: startStep.systemPrompt,
        },
      ]);
      if (startStep.isFinalStep && startStep.options.length === 0) {
        setIsShiftFinished(true);
        setAllAgentsDone(true);
      }
    }, 480);

    return () => clearTimers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scenario.id, initialStepIndex]);

  // Highlight changed panel fields for 1.8s
  const applyPanelUpdate = (nextFields: AgentPanelField[]) => {
    const changed: string[] = [];
    const nextMap: Record<string, string> = {};

    nextFields.forEach((f) => {
      nextMap[f.key] = f.value;
      if (prevFieldMapRef.current[f.key] !== f.value) {
        changed.push(f.key);
      }
    });

    if (changed.length === 0) {
      nextFields.forEach((f) => changed.push(f.key));
    }

    prevFieldMapRef.current = nextMap;
    setPanelFields(nextFields);
    setChangedFieldKeys(changed);
    if (mobileTab === 'dialogue') {
      setHasUnreadAgentUpdate(true);
    }

    schedule(() => {
      setChangedFieldKeys([]);
    }, 1800);
  };

  const upsertStepLog = (entry: StepLogEntry) => {
    setStepLogs((prev) => {
      const idx = prev.findIndex((e) => e.stepNumber === entry.stepNumber);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = entry;
        return copy;
      }
      return [...prev, entry];
    });
    setSelectedLogStep(entry.stepNumber);
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages, isTyping, isShiftFinished]);

  const currentStep = scenario.steps[currentStepIdx];
  const activeAgent = AGENTS.find((a) => a.id === currentStep.agentId);

  const handleOptionClick = (option: ReplyOption) => {
    if (isTransitioning || isTyping || isShiftFinished) return;

    onDismissHint();
    setIsTransitioning(true);

    const branchUsed = option.branchKey ?? selectedBranch;
    if (option.branchKey) {
      setSelectedBranch(option.branchKey);
    }

    const userMsg: DialogueMessage = {
      id: `u-${Date.now()}-${option.id}`,
      sender: 'master',
      text: option.text,
    };

    setMessages((prev) => [...prev, userMsg]);
    setTypingAgentName(activeAgent?.name ?? 'Диспетчер');
    setIsTyping(true);

    schedule(() => {
      setIsTyping(false);

      const sysMsg: DialogueMessage = {
        id: `s-${Date.now()}-${option.id}`,
        sender: 'system',
        agentId: currentStep.agentId,
        agentName: activeAgent?.name ?? 'Диспетчер',
        text: option.systemResponse,
        isComment: Boolean(option.returnsToButtons),
      };

      setMessages((prev) => [...prev, sysMsg]);

      if (option.updatedPanelFields) {
        applyPanelUpdate(option.updatedPanelFields);
      }

      if (option.updatedReasoning) {
        setActiveReasoning(option.updatedReasoning);
        upsertStepLog({
          stepNumber: currentStep.stepNumber,
          agentId: currentStep.agentId,
          reasoning: option.updatedReasoning,
        });
      }

      if (option.returnsToButtons) {
        setAskedOptionIds((prev) => [...prev, option.id]);
        setIsTransitioning(false);
        return;
      }

      // If this step itself is the final step (Scenario 2 Step 5)
      if (currentStep.isFinalStep) {
        setAllAgentsDone(true);
        setIsShiftFinished(true);
        setIsTransitioning(false);
        return;
      }

      // Advance to the next step automatically (no "Next" button!)
      const nextIdx = currentStepIdx + 1;
      if (nextIdx < scenario.steps.length) {
        const nextStep = scenario.steps[nextIdx];
        const nextAgent = AGENTS.find((a) => a.id === nextStep.agentId);

        schedule(() => {
          setTypingAgentName(nextAgent?.name ?? 'Диспетчер');
          setIsTyping(true);

          schedule(() => {
            setIsTyping(false);
            setCurrentStepIdx(nextIdx);
            setAskedOptionIds([]);

            const override =
              nextStep.branchOverrides && branchUsed
                ? nextStep.branchOverrides[branchUsed]
                : undefined;

            const promptText = override?.systemPrompt ?? nextStep.systemPrompt;
            const nextPanel = override?.panelFields ?? nextStep.panelFields;
            const nextReasoning = override?.reasoning ?? nextStep.reasoning;

            applyPanelUpdate(nextPanel);
            setActiveReasoning(nextReasoning);
            upsertStepLog({
              stepNumber: nextStep.stepNumber,
              agentId: nextStep.agentId,
              reasoning: nextReasoning,
            });

            setMessages((prev) => [
              ...prev,
              {
                id: `step-${nextStep.stepNumber}-${Date.now()}`,
                sender: 'system',
                agentId: nextStep.agentId,
                agentName: nextAgent?.name ?? 'Диспетчер',
                text: promptText,
              },
            ]);

            if (nextStep.isFinalStep && nextStep.options.length === 0) {
              setAllAgentsDone(true);
              setIsShiftFinished(true);
            }

            setIsTransitioning(false);
          }, 500);
        }, 620);
      } else {
        setAllAgentsDone(true);
        setIsShiftFinished(true);
        setIsTransitioning(false);
      }
    }, 460);
  };

  const handleArbitrarySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = arbitraryInput.trim();
    if (!trimmed || isTransitioning) return;

    onDismissHint();
    setArbitraryInput('');
    setIsTransitioning(true);

    setMessages((prev) => [
      ...prev,
      {
        id: `arb-u-${Date.now()}`,
        sender: 'master',
        text: trimmed,
      },
    ]);

    setTypingAgentName('Система');
    setIsTyping(true);

    schedule(() => {
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          id: `arb-s-${Date.now()}`,
          sender: 'system',
          agentName: 'Диспетчер смены',
          text: 'Это демо-стенд: здесь показан сценарий работы системы. Выберите один из примеров',
          isArbitraryFallback: true,
        },
      ]);
      setIsTransitioning(false);
    }, 360);
  };

  const displayedLog =
    stepLogs.find((l) => l.stepNumber === selectedLogStep) ??
    stepLogs[stepLogs.length - 1];

  const toneStyles: Record<string, string> = {
    neutral: 'text-slate-900',
    nominal: 'text-emerald-700',
    warning: 'text-amber-700',
    alert: 'text-red-700',
  };

  return (
    <div className="min-h-[calc(100vh-61px)] bg-slate-50 pb-12">
      {/* Dark-blue status & conveyor header */}
      <section
        className="text-white"
        style={{
          background:
            'linear-gradient(145deg, #1B3A6B 0%, #132B52 60%, #0D1F3C 100%)',
        }}
      >
        <div className="mx-auto max-w-6xl px-4 py-5 sm:px-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2 text-xs text-sky-200">
                <span>Сценарий {scenario.number}</span>
                <span aria-hidden="true">·</span>
                <span>{scenario.workshop}</span>
                <span aria-hidden="true">·</span>
                <span>{scenario.shiftWindow}</span>
              </div>
              <h1 className="font-display mt-1 text-lg font-bold tracking-tight text-white sm:text-xl">
                {scenario.title}
              </h1>
              <p className="mt-0.5 text-xs text-slate-300">
                Ваша роль: {scenario.foremanRole}
              </p>
            </div>

            <div className="flex items-center gap-3 self-start sm:self-center">
              <div className="rounded-lg border border-white/20 bg-white/10 px-3.5 py-2 text-right">
                <span className="block text-[11px] text-sky-200">Прогресс</span>
                <span className="font-mono-tabular text-sm font-bold text-white">
                  Шаг {currentStep.stepNumber} из {scenario.stepsCount}
                </span>
              </div>
              <button
                type="button"
                onClick={() => onSelectScenario(scenario.id)}
                title="Начать сценарий сначала"
                className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-white/20 bg-white/5 px-3 py-2.5 text-xs font-medium text-slate-200 transition-colors hover:bg-white/15 whitespace-nowrap"
              >
                <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                <span className="hidden sm:inline">Заново</span>
              </button>
            </div>
          </div>

          <div className="mt-5 border-t border-white/15 pt-4">
            <AgentConveyor
              mode="progress"
              activeAgentId={currentStep.agentId}
              secondaryAgentId={currentStep.secondaryAgentId}
              allCompleted={allAgentsDone}
            />
          </div>
        </div>
      </section>

      {/* Mobile tabs: Диалог / Агенты */}
      <div className="mx-auto max-w-6xl px-4 pt-4 md:hidden">
        <div
          className="grid grid-cols-2 gap-1 rounded-lg border border-slate-200 bg-slate-100 p-1"
          role="tablist"
          aria-label="Режим просмотра"
        >
          <button
            type="button"
            role="tab"
            aria-selected={mobileTab === 'dialogue'}
            onClick={() => setMobileTab('dialogue')}
            className={`cursor-pointer rounded-md px-3 py-2 text-sm font-semibold transition-colors whitespace-nowrap ${
              mobileTab === 'dialogue'
                ? 'bg-white text-[#1B3A6B] shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Диалог
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mobileTab === 'agents'}
            onClick={() => {
              setMobileTab('agents');
              setHasUnreadAgentUpdate(false);
            }}
            className={`cursor-pointer rounded-md px-3 py-2 text-sm font-semibold transition-colors whitespace-nowrap ${
              mobileTab === 'agents'
                ? 'bg-white text-[#1B3A6B] shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Агенты{hasUnreadAgentUpdate ? ' (обновлено)' : ''}
          </button>
        </div>
      </div>

      {/* Main workspace: Dialogue (left) + Agent Panel (right) */}
      <div className="mx-auto max-w-6xl px-4 pt-5 sm:px-6">
        {/* First-entry dismissible hint bubble */}
        <AnimatePresence>
          {showInitialHint && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
              className="mb-4 flex items-center justify-between gap-4 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-950 shadow-sm"
            >
              <p className="font-medium">
                Вы — мастер смены: выбирайте реплики, а агенты покажут, как думает система
              </p>
              <button
                type="button"
                onClick={onDismissHint}
                aria-label="Скрыть подсказку"
                className="cursor-pointer rounded-md p-1 text-amber-800 transition-colors hover:bg-amber-200/60 shrink-0"
              >
                <X className="h-4 w-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-12 md:items-start">
          {/* LEFT: Dialogue column */}
          <div
            className={`md:col-span-7 flex flex-col rounded-xl border border-slate-200 bg-white shadow-sm ${
              mobileTab === 'dialogue' ? 'flex' : 'hidden md:flex'
            }`}
          >
            {/* Launch command context header */}
            <div className="border-b border-slate-100 px-5 py-3 flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-semibold text-slate-500">
                Команда запуска:
              </span>
              <span className="font-mono-tabular text-xs text-slate-700">
                «{scenario.launchCommand}»
              </span>
            </div>

            {/* Messages feed */}
            <div className="flex-1 space-y-4 px-5 py-5 max-h-[460px] min-h-[300px] overflow-y-auto">
              <AnimatePresence initial={false}>
                {messages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                    className={`flex flex-col ${
                      msg.sender === 'master' ? 'items-end' : 'items-start'
                    }`}
                  >
                    <span className="mb-1 text-[11px] font-semibold text-slate-500">
                      {msg.sender === 'master'
                        ? `Мастер (${scenario.foremanName})`
                        : msg.agentName ?? 'Диспетчер смены'}
                    </span>

                    <div
                      className={`max-w-[90%] rounded-xl px-4 py-3 text-sm leading-relaxed ${
                        msg.sender === 'master'
                          ? 'bg-[#1B3A6B] text-white'
                          : msg.isArbitraryFallback
                            ? 'border border-amber-200 bg-amber-50 text-slate-800'
                            : 'border border-slate-200 bg-slate-50 text-slate-900'
                      }`}
                    >
                      <p>{msg.text}</p>

                      {msg.isArbitraryFallback && (
                        <div className="mt-3 flex flex-wrap gap-2 border-t border-amber-200/80 pt-3">
                          {SCENARIOS.map((sc) => (
                            <button
                              key={sc.id}
                              type="button"
                              onClick={() => onSelectScenario(sc.id)}
                              className="cursor-pointer rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-[#1B3A6B] transition-colors hover:border-[#1B3A6B] hover:bg-blue-50 whitespace-nowrap"
                            >
                              Сценарий {sc.number}: {sc.workshop}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Typing indicator */}
              {isTyping && (
                <div className="flex flex-col items-start">
                  <span className="mb-1 text-[11px] font-semibold text-slate-500">
                    {typingAgentName}
                  </span>
                  <div className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs font-medium text-slate-600">
                    <span>печатает…</span>
                    <span className="inline-flex items-center gap-1" aria-hidden="true">
                      <span className="h-1.5 w-1.5 rounded-full bg-slate-400 typing-dot-1" />
                      <span className="h-1.5 w-1.5 rounded-full bg-slate-400 typing-dot-2" />
                      <span className="h-1.5 w-1.5 rounded-full bg-slate-400 typing-dot-3" />
                    </span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Reply choices OR Final CTA */}
            <div className="border-t border-slate-200 bg-slate-50/70 px-5 py-4">
              {isShiftFinished ? (
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm font-medium text-slate-700">
                    Все данные смены собраны агентами. Итоговый отчёт готов.
                  </p>
                  <button
                    type="button"
                    onClick={() => onCompleteShift(selectedBranch)}
                    className="font-display inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg bg-amber-400 px-6 py-3 text-sm font-bold text-slate-950 shadow-sm transition-colors hover:bg-amber-300 whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1B3A6B]"
                  >
                    <span>Открыть итог смены</span>
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
              ) : (
                <div>
                  <p className="mb-2.5 text-xs font-semibold text-slate-500">
                    Ваш ответ как мастера смены:
                  </p>
                  <div className="flex flex-col gap-2">
                    {currentStep.options.map((opt) => {
                      const alreadyAsked = askedOptionIds.includes(opt.id);
                      const disabled =
                        isTyping || isTransitioning || alreadyAsked;
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          disabled={disabled}
                          onClick={() => handleOptionClick(opt)}
                          className={`group flex w-full items-center justify-between gap-3 rounded-lg border px-4 py-3 text-left text-sm font-medium transition-all duration-150 ${
                            alreadyAsked
                              ? 'cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400 line-through'
                              : disabled
                                ? 'cursor-wait border-slate-200 bg-white text-slate-400'
                                : 'cursor-pointer border-slate-300 bg-white text-slate-900 shadow-xs hover:border-[#1B3A6B] hover:bg-blue-50/50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1B3A6B]'
                          }`}
                        >
                          <span>{opt.text}</span>
                          {!alreadyAsked && (
                            <ArrowRight
                              className="h-4 w-4 shrink-0 text-slate-400 transition-transform group-hover:translate-x-0.5 group-hover:text-[#1B3A6B]"
                              aria-hidden="true"
                            />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Arbitrary text input */}
              <form
                onSubmit={handleArbitrarySubmit}
                className="mt-4 flex items-center gap-2 border-t border-slate-200/80 pt-3.5"
              >
                <label htmlFor="arbitrary-reply" className="sr-only">
                  Произвольная реплика
                </label>
                <input
                  id="arbitrary-reply"
                  type="text"
                  value={arbitraryInput}
                  onChange={(e) => setArbitraryInput(e.target.value)}
                  placeholder="Написать произвольную реплику…"
                  className="min-w-0 flex-1 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#1B3A6B] focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={!arbitraryInput.trim() || isTransitioning}
                  className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm font-semibold text-slate-700 transition-colors hover:border-slate-400 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50 whitespace-nowrap shrink-0"
                >
                  <Send className="h-3.5 w-3.5" aria-hidden="true" />
                  <span className="hidden sm:inline">Отправить</span>
                </button>
              </form>
            </div>
          </div>

          {/* RIGHT: Compact Agent Thinking Panel */}
          <aside
            className={`md:col-span-5 rounded-xl border border-slate-200 bg-white shadow-sm ${
              mobileTab === 'agents' ? 'block' : 'hidden md:block'
            }`}
          >
            {/* Active agent header */}
            <div className="border-b border-slate-100 px-5 py-4">
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs font-semibold text-[#1B3A6B]">
                  Активный агент · {activeAgent?.order} из 6
                </span>
                <span className="font-mono-tabular text-xs text-slate-500">
                  {activeAgent?.stageLabel}
                </span>
              </div>
              <h2 className="font-display mt-1 text-xl font-bold text-slate-900">
                {activeAgent?.name}
                {currentStep.secondaryAgentId === 'report' && allAgentsDone
                  ? ' → Отчёт'
                  : ''}
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                {activeAgent?.roleSummary}
              </p>
            </div>

            {/* 2-3 Key Panel Fields with update flash */}
            <div className="px-5 py-4">
              <p className="mb-3 text-xs font-semibold text-slate-500">
                Ключевые показатели шага
              </p>

              <div className="grid grid-cols-1 gap-2.5">
                {panelFields.map((field) => {
                  const isFlashing = changedFieldKeys.includes(field.key);
                  return (
                    <div
                      key={`${field.key}-${field.value}`}
                      className={`flex items-baseline justify-between gap-4 rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2.5 transition-colors ${
                        isFlashing ? 'animate-field-flash' : ''
                      }`}
                    >
                      <span className="text-xs font-medium text-slate-600">
                        {field.label}
                      </span>
                      <span
                        className={`font-mono-tabular text-sm font-bold text-right ${
                          toneStyles[field.tone ?? 'neutral']
                        }`}
                      >
                        {field.value}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Expandable detailed agent log */}
              <div className="mt-5 border-t border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={() => setIsJournalOpen((prev) => !prev)}
                  aria-expanded={isJournalOpen}
                  className="flex w-full cursor-pointer items-center justify-between gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm font-semibold text-[#1B3A6B] transition-colors hover:border-[#1B3A6B]/40 hover:bg-blue-50/40"
                >
                  <span>Подробнее: как думали агенты</span>
                  {isJournalOpen ? (
                    <ChevronUp className="h-4 w-4 shrink-0" aria-hidden="true" />
                  ) : (
                    <ChevronDown className="h-4 w-4 shrink-0" aria-hidden="true" />
                  )}
                </button>

                {isJournalOpen && (
                  <div className="mt-3 space-y-4 text-sm">
                    {stepLogs.length > 1 && (
                      <div className="flex flex-wrap gap-1.5">
                        {stepLogs.map((entry) => {
                          const ag = AGENTS.find((a) => a.id === entry.agentId);
                          const isSelected = entry.stepNumber === selectedLogStep;
                          return (
                            <button
                              key={entry.stepNumber}
                              type="button"
                              onClick={() => setSelectedLogStep(entry.stepNumber)}
                              className={`cursor-pointer rounded-md border px-2.5 py-1 text-xs font-medium transition-colors whitespace-nowrap ${
                                isSelected
                                  ? 'border-[#1B3A6B] bg-[#1B3A6B] text-white'
                                  : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                              }`}
                            >
                              {entry.stepNumber}. {ag?.shortName}
                            </button>
                          );
                        })}
                      </div>
                    )}

                    <div className="space-y-3 border-t border-slate-100 pt-3">
                      <div>
                        <span className="block text-xs font-semibold text-slate-500">
                          Какой агент работал
                        </span>
                        <p className="mt-0.5 font-semibold text-slate-900">
                          {displayedLog.reasoning.agentName} (шаг{' '}
                          {displayedLog.stepNumber})
                        </p>
                      </div>

                      <div>
                        <span className="block text-xs font-semibold text-slate-500">
                          Что получил на вход
                        </span>
                        <p className="mt-0.5 leading-relaxed text-slate-700">
                          {displayedLog.reasoning.receivedInput}
                        </p>
                      </div>

                      <div>
                        <span className="block text-xs font-semibold text-slate-500">
                          Что решил
                        </span>
                        <p className="mt-0.5 leading-relaxed text-slate-700">
                          {displayedLog.reasoning.decisionLogic}
                        </p>
                      </div>

                      <div>
                        <span className="block text-xs font-semibold text-slate-500">
                          Что передал дальше (структурированные данные)
                        </span>
                        <dl className="mt-1.5 grid grid-cols-2 gap-x-3 gap-y-1.5 border-t border-slate-100 pt-2 text-xs">
                          <div>
                            <dt className="text-slate-500">Цех</dt>
                            <dd className="font-medium text-slate-900">
                              {displayedLog.reasoning.handoffPayload.workshop}
                            </dd>
                          </div>
                          <div>
                            <dt className="text-slate-500">План</dt>
                            <dd className="font-mono-tabular font-medium text-slate-900">
                              {displayedLog.reasoning.handoffPayload.plan}
                            </dd>
                          </div>
                          <div>
                            <dt className="text-slate-500">Факт</dt>
                            <dd className="font-mono-tabular font-medium text-slate-900">
                              {displayedLog.reasoning.handoffPayload.fact}
                            </dd>
                          </div>
                          <div>
                            <dt className="text-slate-500">Отклонение</dt>
                            <dd className="font-mono-tabular font-medium text-slate-900">
                              {displayedLog.reasoning.handoffPayload.deviation}
                            </dd>
                          </div>
                          <div>
                            <dt className="text-slate-500">Простой</dt>
                            <dd className="font-mono-tabular font-medium text-slate-900">
                              {
                                displayedLog.reasoning.handoffPayload
                                  .downtimeMinutes
                              }
                            </dd>
                          </div>
                          <div>
                            <dt className="text-slate-500">Классификатор</dt>
                            <dd className="font-medium text-slate-900">
                              {
                                displayedLog.reasoning.handoffPayload
                                  .classifierReason
                              }
                            </dd>
                          </div>
                        </dl>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};
