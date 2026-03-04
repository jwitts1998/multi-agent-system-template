import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';

interface QuickAction {
  id: string;
  label: string;
  description: string;
  command: string;
  category: 'workflow' | 'skill' | 'agent';
  icon: string;
}

const QUICK_ACTIONS: QuickAction[] = [
  // Workflows
  {
    id: 'new-idea',
    label: 'New Idea → PDB',
    description: 'Start from scratch with a new product idea',
    command: '@idea-to-pdb',
    category: 'workflow',
    icon: '💡',
  },
  {
    id: 'context-mvp',
    label: 'Context → MVP',
    description: 'Transform stakeholder input into an MVP',
    command: '@context-to-pdb',
    category: 'workflow',
    icon: '🎯',
  },
  {
    id: 'pdb-tasks',
    label: 'PDB → Tasks',
    description: 'Break down PDB into actionable tasks',
    command: '@pdb-to-tasks',
    category: 'workflow',
    icon: '📋',
  },

  // Common Skills
  {
    id: 'code-review',
    label: 'Code Review',
    description: 'Review code for quality and security',
    command: '@code-reviewer',
    category: 'skill',
    icon: '🔍',
  },
  {
    id: 'write-tests',
    label: 'Write Tests',
    description: 'Generate tests for current code',
    command: '@test-writer',
    category: 'skill',
    icon: '🧪',
  },
  {
    id: 'debug',
    label: 'Debug Issue',
    description: 'Investigate and fix errors',
    command: '@debugger',
    category: 'skill',
    icon: '🐛',
  },

  // Agents
  {
    id: 'security-audit',
    label: 'Security Audit',
    description: 'Scan for vulnerabilities',
    command: '@security-auditor',
    category: 'agent',
    icon: '🔒',
  },
  {
    id: 'perf-optimize',
    label: 'Optimize',
    description: 'Analyze and improve performance',
    command: '@performance-optimizer',
    category: 'agent',
    icon: '⚡',
  },
];

export function QuickActionsPanel() {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyCommand = (action: QuickAction) => {
    navigator.clipboard.writeText(action.command);
    setCopiedId(action.id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const workflowActions = QUICK_ACTIONS.filter(a => a.category === 'workflow');
  const skillActions = QUICK_ACTIONS.filter(a => a.category === 'skill');
  const agentActions = QUICK_ACTIONS.filter(a => a.category === 'agent');

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between text-base">
          <span>Quick Actions</span>
          <Badge variant="outline" className="text-xs">Click to copy</Badge>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Workflows */}
        <div>
          <div className="text-xs font-medium text-slate-500 mb-1.5 uppercase tracking-wide">
            Workflows
          </div>
          <div className="grid grid-cols-3 gap-1.5">
            {workflowActions.map((action) => (
              <Button
                key={action.id}
                variant="outline"
                size="sm"
                className={`
                  h-auto py-2 px-2 flex flex-col items-center gap-1 text-xs
                  ${copiedId === action.id ? 'border-green-500 bg-green-500/10' : ''}
                `}
                onClick={() => copyCommand(action)}
                title={action.description}
              >
                <span className="text-lg">{action.icon}</span>
                <span className="truncate w-full text-center">{action.label}</span>
              </Button>
            ))}
          </div>
        </div>

        {/* Skills */}
        <div>
          <div className="text-xs font-medium text-slate-500 mb-1.5 uppercase tracking-wide">
            Skills
          </div>
          <div className="grid grid-cols-3 gap-1.5">
            {skillActions.map((action) => (
              <Button
                key={action.id}
                variant="ghost"
                size="sm"
                className={`
                  h-auto py-1.5 px-2 flex items-center gap-1.5 text-xs justify-start
                  ${copiedId === action.id ? 'bg-green-500/10 text-green-300' : ''}
                `}
                onClick={() => copyCommand(action)}
                title={action.description}
              >
                <span>{action.icon}</span>
                <span className="truncate">{action.label}</span>
              </Button>
            ))}
          </div>
        </div>

        {/* Agents */}
        <div>
          <div className="text-xs font-medium text-slate-500 mb-1.5 uppercase tracking-wide">
            Agents
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            {agentActions.map((action) => (
              <Button
                key={action.id}
                variant="ghost"
                size="sm"
                className={`
                  h-auto py-1.5 px-2 flex items-center gap-1.5 text-xs justify-start
                  ${copiedId === action.id ? 'bg-green-500/10 text-green-300' : ''}
                `}
                onClick={() => copyCommand(action)}
                title={action.description}
              >
                <span>{action.icon}</span>
                <span className="truncate">{action.label}</span>
              </Button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
