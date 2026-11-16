export type AgentId =
  | 'planner'
  | 'collector'
  | 'controller'
  | 'detective'
  | 'forecaster'
  | 'report';

export interface AgentDefinition {
  id: AgentId;
  order: number;
  name: string;
  shortName: string;
  stageLabel: string;
  roleSummary: string;
  fullSpecification: string;
}

export interface AgentPanelField {
  key: string;
  label: string;
  value: string;
  tone?: 'neutral' | 'nominal' | 'warning' | 'alert';
}

export interface AgentReasoningLog {
  agentName: string;
  receivedInput: string;
  decisionLogic: string;
  handoffPayload: {
    workshop: string;
    plan: string;
    fact: string;
    deviation: string;
    downtimeMinutes: string;
    classifierReason: string;
  };
}

export interface ReplyOption {
  id: string;
  text: string;
  isPrimary: boolean;
  systemResponse: string;
  /**
   * When true, the agent keeps the user on the current step so they still
   * complete the step's main confirmation or provide the required fact.
   */
  returnsToButtons?: boolean;
  /**
   * Optional branch key recorded when this option is chosen (e.g. Scenario 1 Step 5).
   */
  branchKey?: string;
  /**
   * Optional panel field overrides applied right after choosing this option.
   */
  updatedPanelFields?: AgentPanelField[];
  /**
   * Optional reasoning override applied when this option is chosen.
   */
  updatedReasoning?: AgentReasoningLog;
}

export interface ScenarioStep {
  stepNumber: number;
  agentId: AgentId;
  secondaryAgentId?: AgentId;
  systemPrompt: string;
  options: ReplyOption[];
  panelFields: AgentPanelField[];
  reasoning: AgentReasoningLog;
  /**
   * Optional branch-dependent overrides when entering this step (e.g. Scenario 1 Step 6).
   */
  branchOverrides?: Record<
    string,
    {
      systemPrompt: string;
      panelFields: AgentPanelField[];
      reasoning: AgentReasoningLog;
    }
  >;
  /**
   * If true, this step compiles the final shift report and shows the final CTA.
   */
  isFinalStep?: boolean;
}

export interface ShiftOutcome {
  id: string;
  shiftLabel: string;
  workshop: string;
  foreman: string;
  planFact: string;
  extraQualityLine?: string;
  deviation: string;
  deviationInTolerance: boolean;
  downtimeChronology: string[];
  score: number;
  scoreVerdict: string;
  conclusions: string[];
  recommendations: string[];
  formattedSummary: string;
}

export interface Scenario {
  id: string;
  number: number;
  title: string;
  workshop: string;
  stepsCount: number;
  cardSummary: string;
  foremanName: string;
  foremanRole: string;
  shiftWindow: string;
  launchCommand: string;
  steps: ScenarioStep[];
  outcomes: Record<string, ShiftOutcome>;
}

export interface DialogueMessage {
  id: string;
  sender: 'system' | 'master';
  agentId?: AgentId;
  agentName?: string;
  text: string;
  isComment?: boolean;
  isArbitraryFallback?: boolean;
  timestampLabel?: string;
}
