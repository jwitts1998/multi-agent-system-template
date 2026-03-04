import type { ViewMode } from '../App';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';

interface ViewToggleProps {
  viewMode: ViewMode;
  onViewChange: (mode: ViewMode) => void;
}

const VIEW_TABS: { mode: ViewMode; label: string; title: string; separated?: boolean }[] = [
  { mode: 'system', label: 'System Map', title: 'Overview of all agents, memory, and configuration in the system' },
  { mode: 'newIdea', label: 'New Idea', title: 'Workflow for building a new product from an idea' },
  { mode: 'existingRepo', label: 'Existing Repo', title: 'Workflow for adding multi-agent system to an existing codebase' },
  { mode: 'contextToMvp', label: 'Context to MVP', title: 'Workflow for converting stakeholder context into an MVP' },
  { mode: 'domainArchitecture', label: 'Domain Agents', title: 'Domain-expertise agents organized by software craft area', separated: true },
  { mode: 'monitor', label: 'Session Monitor', title: 'Visualize agent session transcripts and token usage', separated: true },
  { mode: 'commandCenter', label: 'Command Center', title: 'Real-time session logs, task management, and agent control' },
];

export function ViewToggle({ viewMode, onViewChange }: ViewToggleProps) {
  return (
    <div
      role="tablist"
      aria-label="Explorer views"
      className={cn(
        "absolute top-3 left-1/2 -translate-x-1/2 z-10 flex gap-0.5",
        "bg-slate-800 border border-slate-600 rounded-[10px] p-1",
        "shadow-lg",
      )}
    >
      {VIEW_TABS.map(tab => (
        <Button
          key={tab.mode}
          role="tab"
          aria-selected={viewMode === tab.mode}
          variant="ghost"
          size="sm"
          className={cn(
            "text-xs font-medium h-8 px-3.5 rounded-lg whitespace-nowrap",
            viewMode === tab.mode
              ? "bg-blue-600 hover:bg-blue-600/90 text-white"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-700/50",
            tab.separated && viewMode !== tab.mode && "border-l border-slate-600 ml-0.5 pl-3.5",
          )}
          onClick={() => onViewChange(tab.mode)}
          title={tab.title}
        >
          {tab.label}
        </Button>
      ))}
    </div>
  );
}
