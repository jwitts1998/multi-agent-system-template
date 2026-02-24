export const MODEL_IDS = [
  'claude-sonnet-4',
  'claude-opus-4',
  'gpt-4o',
  'gpt-4o-mini',
  'claude-haiku-3.5',
] as const;

export type ModelId = (typeof MODEL_IDS)[number];

interface ModelPricing {
  label: string;
  inputPer1M: number;
  outputPer1M: number;
}

export const MODELS: Record<ModelId, ModelPricing> = {
  'claude-sonnet-4': { label: 'Claude Sonnet 4', inputPer1M: 3, outputPer1M: 15 },
  'claude-opus-4': { label: 'Claude Opus 4', inputPer1M: 15, outputPer1M: 75 },
  'gpt-4o': { label: 'GPT-4o', inputPer1M: 2.5, outputPer1M: 10 },
  'gpt-4o-mini': { label: 'GPT-4o Mini', inputPer1M: 0.15, outputPer1M: 0.6 },
  'claude-haiku-3.5': { label: 'Claude Haiku 3.5', inputPer1M: 0.8, outputPer1M: 4 },
};

export function calculateCost(inputTokens: number, outputTokens: number, modelId: ModelId): number {
  const model = MODELS[modelId];
  return (inputTokens / 1_000_000) * model.inputPer1M + (outputTokens / 1_000_000) * model.outputPer1M;
}
