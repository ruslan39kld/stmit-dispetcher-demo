import React from 'react';
import { Check, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';
import { AGENTS } from '../data/agents';
import { AgentId } from '../types/dispatch';

interface AgentConveyorProps {
  mode: 'hero' | 'progress';
  activeAgentId?: AgentId;
  secondaryAgentId?: AgentId;
  completedAgentIds?: AgentId[];
  allCompleted?: boolean;
}

export const AgentConveyor: React.FC<AgentConveyorProps> = ({
  mode,
  activeAgentId,
  secondaryAgentId,
  completedAgentIds = [],
  allCompleted = false,
}) => {
  const activeIndex = activeAgentId
    ? AGENTS.findIndex((a) => a.id === activeAgentId)
    : -1;

  const progressRatio = allCompleted
    ? 1
    : activeIndex >= 0
      ? activeIndex / (AGENTS.length - 1)
      : 0;

  return (
    <div className="w-full" aria-label="Конвейер из шести агентов">
      {/* Desktop & Tablet horizontal conveyor */}
      <div className="relative hidden md:block pt-2 pb-1">
        {/* Track rail */}
        <div
          className="absolute top-[27px] left-[8%] right-[8%] h-[2px] bg-white/20"
          aria-hidden="true"
        >
          {mode === 'progress' && (
            <motion.div
              className="h-full bg-sky-300"
              initial={false}
              animate={{ scaleX: progressRatio }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              style={{ transformOrigin: 'left center' }}
            />
          )}

          {mode === 'hero' && (
            <motion.div
              className="absolute top-1/2 -translate-y-1/2 h-2.5 w-2.5 rounded-full bg-amber-300 shadow-[0_0_12px_rgba(252,211,77,0.9)]"
              animate={{ left: ['0%', '100%'] }}
              transition={{
                duration: 5.4,
                repeat: Infinity,
                ease: 'linear',
              }}
            />
          )}

          {mode === 'progress' && !allCompleted && activeIndex >= 0 && (
            <motion.div
              key={activeAgentId}
              className="absolute top-1/2 -translate-y-1/2 h-2.5 w-2.5 rounded-full bg-amber-300 shadow-[0_0_10px_rgba(252,211,77,0.85)]"
              initial={{
                left: `${Math.max(0, activeIndex - 1) * (100 / (AGENTS.length - 1))}%`,
              }}
              animate={{
                left: `${activeIndex * (100 / (AGENTS.length - 1))}%`,
              }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            />
          )}
        </div>

        <ol className="relative grid grid-cols-6 gap-2">
          {AGENTS.map((agent, idx) => {
            const isDone =
              allCompleted ||
              completedAgentIds.includes(agent.id) ||
              (mode === 'progress' && activeIndex > idx);
            const isActive =
              !allCompleted &&
              mode === 'progress' &&
              (agent.id === activeAgentId || agent.id === secondaryAgentId);

            return (
              <li
                key={agent.id}
                className="flex flex-col items-center text-center"
              >
                <div className="relative flex items-center justify-center">
                  {mode === 'hero' && (
                    <motion.span
                      className="absolute inset-0 rounded-full border border-sky-300/60"
                      animate={{
                        scale: [1, 1.35, 1],
                        opacity: [0.6, 0, 0.6],
                      }}
                      transition={{
                        duration: 2.7,
                        repeat: Infinity,
                        delay: idx * 0.45,
                        ease: 'easeInOut',
                      }}
                      aria-hidden="true"
                    />
                  )}

                  {isActive && (
                    <motion.span
                      className="absolute -inset-1.5 rounded-full border-2 border-amber-300/80"
                      animate={{
                        scale: [1, 1.18, 1],
                        opacity: [0.85, 0.25, 0.85],
                      }}
                      transition={{
                        duration: 1.8,
                        repeat: Infinity,
                        ease: 'easeInOut',
                      }}
                      aria-hidden="true"
                    />
                  )}

                  <div
                    className={`relative z-10 flex h-10 w-10 items-center justify-center rounded-full border text-sm font-semibold tabular-nums transition-colors duration-200 ${
                      isDone
                        ? 'border-emerald-400 bg-emerald-500 text-white'
                        : isActive
                          ? 'border-amber-300 bg-amber-400 text-slate-950 shadow-sm'
                          : mode === 'hero'
                            ? 'border-sky-300/45 bg-[#16315C] text-white'
                            : 'border-white/25 bg-[#152E56] text-white/70'
                    }`}
                  >
                    {isDone ? (
                      <Check className="h-4.5 w-4.5 stroke-[2.5]" aria-hidden="true" />
                    ) : (
                      agent.order
                    )}
                  </div>
                </div>

                <span
                  className={`mt-2.5 text-xs font-semibold leading-tight tracking-wide whitespace-nowrap ${
                    isActive
                      ? 'text-amber-200'
                      : isDone
                        ? 'text-emerald-200'
                        : mode === 'hero'
                          ? 'text-white'
                          : 'text-slate-300'
                  }`}
                >
                  {agent.shortName}
                </span>

                {mode === 'hero' && (
                  <span className="mt-0.5 text-[11px] leading-snug text-slate-300/90 max-w-[130px]">
                    {agent.stageLabel}
                  </span>
                )}
              </li>
            );
          })}
        </ol>
      </div>

      {/* Mobile compact conveyor */}
      <ol className="grid grid-cols-3 gap-2 md:hidden">
        {AGENTS.map((agent, idx) => {
          const isDone =
            allCompleted ||
            completedAgentIds.includes(agent.id) ||
            (mode === 'progress' && activeIndex > idx);
          const isActive =
            !allCompleted &&
            mode === 'progress' &&
            (agent.id === activeAgentId || agent.id === secondaryAgentId);

          return (
            <li
              key={agent.id}
              className={`flex items-center gap-2 rounded-lg border px-2.5 py-2 text-xs transition-colors ${
                isActive
                  ? 'border-amber-300 bg-amber-400/15 text-amber-100 font-semibold'
                  : isDone
                    ? 'border-emerald-400/40 bg-emerald-500/15 text-emerald-100'
                    : 'border-white/15 bg-white/5 text-slate-200'
              }`}
            >
              <span
                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-bold tabular-nums ${
                  isDone
                    ? 'bg-emerald-500 text-white'
                    : isActive
                      ? 'bg-amber-400 text-slate-950'
                      : 'bg-white/15 text-white'
                }`}
              >
                {isDone ? <Check className="h-3 w-3 stroke-[2.5]" /> : agent.order}
              </span>
              <span className="truncate">{agent.shortName}</span>
              {idx < AGENTS.length - 1 && (
                <ArrowRight className="ml-auto hidden h-3 w-3 opacity-40" aria-hidden="true" />
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
};
