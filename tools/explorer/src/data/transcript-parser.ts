import type { Node, Edge } from '@xyflow/react';

// ── Types ──

export interface ToolCall {
  name: string;
  args: Record<string, string>;
}

export interface SessionTurn {
  id: string;
  index: number;
  role: 'user' | 'assistant';
  text: string;
  summary: string;
  toolCalls: ToolCall[];
  subagentInvocations: SubagentInvocation[];
  estimatedTokens: number;
  timestamp?: string;
}

export interface SubagentInvocation {
  type: string;
  description: string;
  model?: string;
  turnIndex: number;
}

export interface SessionData {
  id: string;
  turns: SessionTurn[];
  totalTokens: number;
  inputTokens: number;
  outputTokens: number;
  totalToolCalls: number;
  totalSubagents: number;
  agentTypes: string[];
  duration?: string;
}

export interface MonitorNodeData {
  turn: SessionTurn;
  session: SessionData;
  nodeType: 'user' | 'agent' | 'tool-cluster' | 'subagent';
  [key: string]: unknown;
}

// ── Parsing ──

function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

function extractSummary(text: string, maxLen = 80): string {
  const cleaned = text
    .replace(/<[^>]+>/g, '')
    .replace(/\[Tool (?:call|result)\][^\n]*/g, '')
    .replace(/\n{2,}/g, '\n')
    .trim();

  const firstMeaningful = cleaned.split('\n').find(line => line.trim().length > 10);
  const base = firstMeaningful?.trim() || cleaned.slice(0, maxLen);
  return base.length > maxLen ? base.slice(0, maxLen - 1) + '\u2026' : base;
}

function extractToolCalls(text: string): ToolCall[] {
  const calls: ToolCall[] = [];
  const regex = /\[Tool call\]\s+(\w+)\n((?:\s{2,}\w+:.*\n?)*)/g;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    const name = match[1];
    const argsBlock = match[2] || '';
    const args: Record<string, string> = {};

    for (const line of argsBlock.split('\n')) {
      const kv = line.trim().match(/^(\w+):\s*(.+)$/);
      if (kv) args[kv[1]] = kv[2];
    }
    calls.push({ name, args });
  }

  return calls;
}

function extractSubagentInvocations(text: string, turnIndex: number): SubagentInvocation[] {
  const invocations: SubagentInvocation[] = [];

  const taskPattern = /\[Tool call\]\s+Task\n((?:\s{2,}\w+:.*\n?)*)/g;
  let match: RegExpExecArray | null;

  while ((match = taskPattern.exec(text)) !== null) {
    const argsBlock = match[1] || '';
    const args: Record<string, string> = {};
    for (const line of argsBlock.split('\n')) {
      const kv = line.trim().match(/^(\w+):\s*(.+)$/);
      if (kv) args[kv[1]] = kv[2];
    }
    invocations.push({
      type: args.subagent_type || 'generalPurpose',
      description: args.description || 'Subagent task',
      model: args.model,
      turnIndex,
    });
  }

  return invocations;
}

interface TranscriptEntry {
  role: 'user' | 'assistant';
  message?: {
    content: Array<{ type: string; text: string }>;
  };
}

export function parseTranscript(jsonlContent: string): SessionData {
  const lines = jsonlContent.trim().split('\n').filter(Boolean);
  const turns: SessionTurn[] = [];
  let turnIndex = 0;

  for (const line of lines) {
    let entry: TranscriptEntry;
    try {
      entry = JSON.parse(line);
    } catch {
      continue;
    }

    if (!entry.role || !entry.message?.content) continue;

    const text = entry.message.content
      .filter(c => c.type === 'text')
      .map(c => c.text)
      .join('\n');

    if (!text.trim()) continue;

    const toolCalls = entry.role === 'assistant' ? extractToolCalls(text) : [];
    const subagentInvocations = entry.role === 'assistant'
      ? extractSubagentInvocations(text, turnIndex)
      : [];

    turns.push({
      id: `turn-${turnIndex}`,
      index: turnIndex,
      role: entry.role,
      text,
      summary: extractSummary(text),
      toolCalls,
      subagentInvocations,
      estimatedTokens: estimateTokens(text),
    });

    turnIndex++;
  }

  const totalToolCalls = turns.reduce((sum, t) => sum + t.toolCalls.length, 0);
  const totalSubagents = turns.reduce((sum, t) => sum + t.subagentInvocations.length, 0);
  const totalTokens = turns.reduce((sum, t) => sum + t.estimatedTokens, 0);
  const inputTokens = turns.filter(t => t.role === 'user').reduce((sum, t) => sum + t.estimatedTokens, 0);
  const outputTokens = turns.filter(t => t.role === 'assistant').reduce((sum, t) => sum + t.estimatedTokens, 0);

  const agentTypes = [...new Set(
    turns.flatMap(t => t.subagentInvocations.map(s => s.type))
  )];

  return {
    id: `session-${Date.now()}`,
    turns,
    totalTokens,
    inputTokens,
    outputTokens,
    totalToolCalls,
    totalSubagents,
    agentTypes,
  };
}

// ── Also support the .txt transcript format ──

export function parseTxtTranscript(txtContent: string): SessionData {
  const turns: SessionTurn[] = [];
  let turnIndex = 0;

  const blocks = txtContent.split(/^(?=user:|A:)/m);

  for (const block of blocks) {
    const trimmed = block.trim();
    if (!trimmed) continue;

    let role: 'user' | 'assistant';
    let text: string;

    if (trimmed.startsWith('user:')) {
      role = 'user';
      text = trimmed.slice(5).trim();
    } else if (trimmed.startsWith('A:')) {
      role = 'assistant';
      text = trimmed.slice(2).trim();
    } else {
      continue;
    }

    const toolCalls = role === 'assistant' ? extractToolCalls(text) : [];
    const subagentInvocations = role === 'assistant'
      ? extractSubagentInvocations(text, turnIndex)
      : [];

    turns.push({
      id: `turn-${turnIndex}`,
      index: turnIndex,
      role,
      text,
      summary: extractSummary(text),
      toolCalls,
      subagentInvocations,
      estimatedTokens: estimateTokens(text),
    });

    turnIndex++;
  }

  const totalToolCalls = turns.reduce((sum, t) => sum + t.toolCalls.length, 0);
  const totalSubagents = turns.reduce((sum, t) => sum + t.subagentInvocations.length, 0);
  const totalTokens = turns.reduce((sum, t) => sum + t.estimatedTokens, 0);
  const inputTokens = turns.filter(t => t.role === 'user').reduce((sum, t) => sum + t.estimatedTokens, 0);
  const outputTokens = turns.filter(t => t.role === 'assistant').reduce((sum, t) => sum + t.estimatedTokens, 0);

  const agentTypes = [...new Set(
    turns.flatMap(t => t.subagentInvocations.map(s => s.type))
  )];

  return {
    id: `session-${Date.now()}`,
    turns,
    totalTokens,
    inputTokens,
    outputTokens,
    totalToolCalls,
    totalSubagents,
    agentTypes,
  };
}

// ── Convert to ReactFlow ──

const STATUS_COLORS = {
  user: { bg: '#1a2744', border: '#3b82f6', text: '#bfdbfe' },
  agent: { bg: '#1a2e1a', border: '#22c55e', text: '#dcfce7' },
  toolCluster: { bg: '#2a1a04', border: '#f59e0b', text: '#fef3c7' },
  subagent: { bg: '#2e1065', border: '#a78bfa', text: '#e0d4fc' },
};

export function sessionToNodes(session: SessionData): { nodes: Node[]; edges: Edge[] } {
  const nodes: Node[] = [];
  const edges: Edge[] = [];

  let lastMainNodeId: string | null = null;

  for (const turn of session.turns) {
    const nodeId = `monitor-${turn.id}`;
    const nodeType = turn.role === 'user' ? 'user' : 'agent';

    nodes.push({
      id: nodeId,
      type: 'monitorNode',
      position: { x: 0, y: 0 },
      data: {
        turn,
        session,
        nodeType,
      } satisfies MonitorNodeData,
    });

    if (lastMainNodeId) {
      edges.push({
        id: `e-${lastMainNodeId}-${nodeId}`,
        source: lastMainNodeId,
        target: nodeId,
        animated: turn.role === 'assistant',
        style: { stroke: turn.role === 'user' ? '#3b82f6' : '#22c55e', strokeWidth: 2 },
      });
    }

    if (turn.toolCalls.length > 0) {
      const toolClusterId = `tools-${turn.id}`;
      const uniqueTools = [...new Set(turn.toolCalls.map(tc => tc.name))];

      nodes.push({
        id: toolClusterId,
        type: 'monitorNode',
        position: { x: 0, y: 0 },
        data: {
          turn: {
            ...turn,
            id: `tools-${turn.index}`,
            summary: uniqueTools.join(', '),
          },
          session,
          nodeType: 'tool-cluster',
        } satisfies MonitorNodeData,
      });

      edges.push({
        id: `e-${nodeId}-${toolClusterId}`,
        source: nodeId,
        target: toolClusterId,
        style: { stroke: '#f59e0b', strokeWidth: 1.5, strokeDasharray: '4 2' },
      });
    }

    for (const sub of turn.subagentInvocations) {
      const subId = `sub-${turn.id}-${sub.type}`;
      nodes.push({
        id: subId,
        type: 'monitorNode',
        position: { x: 0, y: 0 },
        data: {
          turn: {
            ...turn,
            id: subId,
            summary: `${sub.type}: ${sub.description}`,
          },
          session,
          nodeType: 'subagent',
        } satisfies MonitorNodeData,
      });

      edges.push({
        id: `e-${nodeId}-${subId}`,
        source: nodeId,
        target: subId,
        animated: true,
        style: { stroke: '#a78bfa', strokeWidth: 1.5 },
      });
    }

    lastMainNodeId = nodeId;
  }

  return { nodes, edges };
}

export { STATUS_COLORS };
