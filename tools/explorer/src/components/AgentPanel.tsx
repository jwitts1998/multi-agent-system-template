import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';

interface Agent {
  id: string;
  name: string;
  description: string;
  category: 'ideation' | 'development' | 'specialist' | 'ingestion';
  invocation: string;
}

// Known agents from the multi-agent template
const TEMPLATE_AGENTS: Agent[] = [
  // Ideation
  { id: 'idea-to-pdb', name: 'Idea to PDB', description: 'Explore an idea and generate a Product Design Blueprint', category: 'ideation', invocation: '@idea-to-pdb' },
  { id: 'context-to-pdb', name: 'Context to PDB', description: 'Transform stakeholder context into a PDB', category: 'ideation', invocation: '@context-to-pdb' },
  { id: 'pdb-to-tasks', name: 'PDB to Tasks', description: 'Decompose a PDB into epics and task files', category: 'ideation', invocation: '@pdb-to-tasks' },

  // Development
  { id: 'code-reviewer', name: 'Code Reviewer', description: 'Code quality, security, architecture review', category: 'development', invocation: '@code-reviewer' },
  { id: 'test-writer', name: 'Test Writer', description: 'Test creation and coverage', category: 'development', invocation: '@test-writer' },
  { id: 'debugger', name: 'Debugger', description: 'Error investigation and fixes', category: 'development', invocation: '@debugger' },
  { id: 'designer', name: 'Designer', description: 'UI/UX, design system, accessibility', category: 'development', invocation: '@designer' },
  { id: 'doc-generator', name: 'Doc Generator', description: 'Documentation creation and maintenance', category: 'development', invocation: '@doc-generator' },
  { id: 'security-auditor', name: 'Security Auditor', description: 'Security scanning and hardening', category: 'development', invocation: '@security-auditor' },
  { id: 'performance-optimizer', name: 'Performance Optimizer', description: 'Performance analysis and optimization', category: 'development', invocation: '@performance-optimizer' },

  // Specialists
  { id: 'figma-specialist', name: 'Figma Specialist', description: 'Figma-to-code implementation, Code Connect', category: 'specialist', invocation: '@figma-specialist' },

  // Ingestion
  { id: 'codebase-auditor', name: 'Codebase Auditor', description: 'Analyze existing code structure', category: 'ingestion', invocation: '@codebase-auditor' },
  { id: 'gap-analysis', name: 'Gap Analysis', description: 'Identify production-readiness gaps', category: 'ingestion', invocation: '@gap-analysis' },
  { id: 'documentation-backfill', name: 'Doc Backfill', description: 'Generate PDB from existing code', category: 'ingestion', invocation: '@documentation-backfill' },
];

const CATEGORY_COLORS: Record<Agent['category'], string> = {
  ideation: 'bg-teal-900/50 text-teal-300 border-teal-700',
  development: 'bg-blue-900/50 text-blue-300 border-blue-700',
  specialist: 'bg-purple-900/50 text-purple-300 border-purple-700',
  ingestion: 'bg-amber-900/50 text-amber-300 border-amber-700',
};

const CATEGORY_LABELS: Record<Agent['category'], string> = {
  ideation: 'Ideation',
  development: 'Development',
  specialist: 'Specialist',
  ingestion: 'Ingestion',
};

export function AgentPanel() {
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [filter, setFilter] = useState<Agent['category'] | 'all'>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filteredAgents = filter === 'all'
    ? TEMPLATE_AGENTS
    : TEMPLATE_AGENTS.filter(a => a.category === filter);

  const groupedAgents = filteredAgents.reduce((acc, agent) => {
    if (!acc[agent.category]) acc[agent.category] = [];
    acc[agent.category].push(agent);
    return acc;
  }, {} as Record<string, Agent[]>);

  const copyInvocation = (agent: Agent) => {
    navigator.clipboard.writeText(agent.invocation);
    setCopiedId(agent.id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  return (
    <Card className="h-[280px] flex flex-col">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between text-base">
          <span>Agents</span>
          <Badge variant="outline" className="text-xs">
            {TEMPLATE_AGENTS.length} available
          </Badge>
        </CardTitle>

        {/* Category filters */}
        <div className="flex gap-1 mt-2 flex-wrap">
          <Button
            variant={filter === 'all' ? 'secondary' : 'ghost'}
            size="sm"
            className="h-6 text-xs px-2"
            onClick={() => setFilter('all')}
          >
            All
          </Button>
          {(['ideation', 'development', 'specialist', 'ingestion'] as const).map((cat) => (
            <Button
              key={cat}
              variant={filter === cat ? 'secondary' : 'ghost'}
              size="sm"
              className="h-6 text-xs px-2"
              onClick={() => setFilter(cat)}
            >
              {CATEGORY_LABELS[cat]}
            </Button>
          ))}
        </div>
      </CardHeader>

      <CardContent className="flex-1 overflow-hidden p-0">
        <ScrollArea className="h-full">
          <div className="p-3 space-y-3">
            {Object.entries(groupedAgents).map(([category, agents]) => (
              <div key={category}>
                {filter === 'all' && (
                  <div className="text-xs font-medium text-slate-500 mb-1.5 uppercase tracking-wide">
                    {CATEGORY_LABELS[category as Agent['category']]}
                  </div>
                )}
                <div className="space-y-1">
                  {agents.map((agent) => (
                    <div
                      key={agent.id}
                      className={`
                        p-2 rounded-md cursor-pointer transition-colors border
                        ${selectedAgent?.id === agent.id
                          ? CATEGORY_COLORS[agent.category]
                          : 'border-transparent hover:bg-slate-800'}
                      `}
                      onClick={() => setSelectedAgent(selectedAgent?.id === agent.id ? null : agent)}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-200">{agent.name}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-5 px-1.5 text-xs text-slate-400 hover:text-slate-200"
                          onClick={(e) => {
                            e.stopPropagation();
                            copyInvocation(agent);
                          }}
                        >
                          {copiedId === agent.id ? '✓' : '📋'}
                        </Button>
                      </div>

                      {selectedAgent?.id === agent.id && (
                        <div className="mt-2 space-y-1.5 text-xs">
                          <p className="text-slate-400">{agent.description}</p>
                          <code className="block bg-slate-900 px-2 py-1 rounded text-slate-300">
                            {agent.invocation}
                          </code>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
