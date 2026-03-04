import { categoryMeta, type NodeCategory } from '../data/nodes';
import type { ViewMode } from '../App';
import { Card, CardContent, CardHeader } from './ui/card';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Separator } from './ui/separator';
import { cn } from '@/lib/utils';

interface LegendProps {
  viewMode: ViewMode;
  hiddenCategories: Set<NodeCategory>;
  onToggleCategory: (category: NodeCategory) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onShowArchDocs?: () => void;
  onShowCalibration?: () => void;
  hasCalibration?: boolean;
}

const newIdeaPhases = [
  { label: 'Setup (Stage 1)', color: '#94a3b8' },
  { label: 'Ideate (Stages 2-5)', color: '#2dd4bf' },
  { label: 'Operate (Stages 6, 11, 14)', color: '#c084fc' },
  { label: 'Build (Stages 7-8)', color: '#3b82f6' },
  { label: 'Verify (Stages 9-10)', color: '#f59e0b' },
  { label: 'Ship (Stages 12-13)', color: '#22c55e' },
];

const existingRepoPhases = [
  { label: 'Setup (Stage 1)', color: '#94a3b8' },
  { label: 'Ingest (Stages 2-5)', color: '#f59e0b' },
  { label: 'Ideate (Stages 6-7)', color: '#2dd4bf' },
  { label: 'Operate (Stages 8, 12-13)', color: '#c084fc' },
  { label: 'Build (Stages 9-10)', color: '#3b82f6' },
  { label: 'Ship (Stage 11)', color: '#22c55e' },
];

const contextToMvpPhases = [
  { label: 'Ingest (Stage 1)', color: '#f59e0b' },
  { label: 'Ideate (Stages 2-5)', color: '#2dd4bf' },
  { label: 'Build (Stages 6-7)', color: '#3b82f6' },
  { label: 'Verify (Stages 8-9)', color: '#f59e0b' },
  { label: 'Ship (Stage 10)', color: '#22c55e' },
  { label: 'Operate (Stage 11)', color: '#c084fc' },
];

const domainArchitecturePhases = [
  { label: 'Orchestration (coordination)', color: '#34d399' },
  { label: 'Tier 1 — Foundation (shared substrate)', color: '#f59e0b' },
  { label: 'Tier 2 — Feature (user-facing)', color: '#3b82f6' },
  { label: 'Tier 3 — Experience (cross-cutting)', color: '#a78bfa' },
];

const viewTitles: Record<ViewMode, string> = {
  system: 'Multi-Agent System Explorer',
  newIdea: 'New Idea Workflow',
  existingRepo: 'Existing Repo Workflow',
  contextToMvp: 'Context to MVP Workflow',
  domainArchitecture: 'Domain Micro-Agents',
  monitor: 'Session Monitor',
  commandCenter: 'Command Center',
};

const viewDescriptions: Record<ViewMode, string> = {
  system: '',
  newIdea: 'Clone the template, flush your idea into a PDB, decompose into tasks, build with agents',
  existingRepo: 'Copy template files into your project, audit code, generate a PDB, fix gaps, then build',
  contextToMvp: 'Ingest stakeholder context, fill gaps, generate a PDB, build a demo, and iterate with feedback',
  domainArchitecture: 'Domain-expertise agents organized by software craft area. Each owns a vertical, applies modern practices, and evaluates where AI fits.',
  monitor: 'Visualize agent session transcripts — see agent flow, tool usage, and token consumption',
  commandCenter: 'Real-time session logs, task management, and agent control',
};

export function Legend({ viewMode, hiddenCategories, onToggleCategory, searchQuery, onSearchChange, onShowArchDocs, onShowCalibration, hasCalibration }: LegendProps) {
  const categories = Object.entries(categoryMeta) as [NodeCategory, { label: string; color: string }][];
  const isPipeline = viewMode === 'newIdea' || viewMode === 'existingRepo' || viewMode === 'contextToMvp' || viewMode === 'domainArchitecture';
  const phases = viewMode === 'newIdea'
    ? newIdeaPhases
    : viewMode === 'contextToMvp'
      ? contextToMvpPhases
      : viewMode === 'domainArchitecture'
        ? domainArchitecturePhases
        : existingRepoPhases;

  return (
    <nav
      role="region"
      aria-label={`${viewTitles[viewMode]} legend and controls`}
      className="legend-panel absolute top-3 left-3 z-10 max-w-[220px]"
    >
      <Card className="border-slate-600 bg-slate-800 shadow-lg">
        <CardHeader className="p-4 pb-2">
          <div className={cn("text-sm font-bold text-slate-100 tracking-wide", isPipeline ? "mb-1.5" : "mb-3")}>
            {viewTitles[viewMode]}
          </div>
        </CardHeader>
        <CardContent className="p-4 pt-0 space-y-3">
          <Input
            type="text"
            placeholder="Search nodes..."
            value={searchQuery}
            onChange={e => onSearchChange(e.target.value)}
            aria-label={`Search ${viewTitles[viewMode]} nodes`}
            className="h-8 text-xs bg-slate-900 border-slate-600 placeholder:text-slate-500"
          />

          {viewMode === 'system' ? (
            <div className="flex flex-col gap-1">
              {categories.map(([key, meta]) => {
                const hidden = hiddenCategories.has(key);
                return (
                  <button
                    key={key}
                    onClick={() => onToggleCategory(key)}
                    className={cn(
                      "flex items-center gap-2 px-2 py-1 text-xs rounded border-none cursor-pointer text-left bg-transparent",
                      hidden ? "text-slate-500 line-through" : "text-slate-300",
                    )}
                  >
                    <span
                      className="category-dot h-2.5 w-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: meta.color, opacity: hidden ? 0.3 : 1 }}
                    />
                    {meta.label}
                  </button>
                );
              })}
            </div>
          ) : (
            <>
              <div className="text-[11px] text-slate-400 leading-snug">
                {viewDescriptions[viewMode]}
              </div>
              <div className="flex flex-col gap-1">
                {phases.map((phase) => (
                  <div key={phase.label} className="flex items-center gap-2 px-2 py-1 text-xs text-slate-300">
                    <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: phase.color }} />
                    {phase.label}
                  </div>
                ))}
              </div>

              {viewMode !== 'domainArchitecture' && (
                <>
                  <Separator className="bg-slate-600 my-2" />
                  <div className="flex items-center gap-2 px-2 py-1 text-xs text-amber-400">
                    <span className="w-4 h-0.5 bg-amber-500 rounded shrink-0" />
                    {viewMode === 'contextToMvp' ? 'Feedback loops' : viewMode === 'newIdea' ? 'Feedback loop' : 'Iterative cycle'}
                  </div>
                  <div className="text-[10px] text-slate-500 leading-snug">
                    {viewMode === 'newIdea'
                      ? 'Stages 8-10 form an iterative cycle. Issues found in Quality Review are sent back to Feature Development. Stage 5 calibrates domain agents for your product vertical. System agents (purple) handle routing, monitoring, and memory.'
                      : viewMode === 'contextToMvp'
                        ? 'Quality Review routes issues back to Feature Development. Stakeholder Review feeds new context back to Gap Analysis for iterative refinement toward a demo-ready MVP.'
                        : 'Stages 10-11 repeat for each development cycle. System agents (purple) handle routing, monitoring, and memory across the workflow.'
                    }
                  </div>
                  <div className="p-2 rounded-md bg-slate-900 border border-slate-600">
                    <div className="text-[10px] text-slate-400 leading-snug">
                      Click any stage to see example prompts for invoking agents at that step.
                    </div>
                  </div>
                </>
              )}

              {viewMode === 'domainArchitecture' && (
                <>
                  <Separator className="bg-slate-600 my-2" />
                  <div className="flex items-center gap-2 px-2 py-1 text-xs text-amber-400">
                    <span className="w-4 h-0.5 bg-amber-500 rounded shrink-0" />
                    Dependency (solid) / Consultation (dashed)
                  </div>
                  <div className="text-[10px] text-slate-500 leading-snug">
                    Tier 2 depends on Tier 1 foundations. Tier 3 consults Tier 2 for craft quality. The Product Orchestrator resolves cross-domain conflicts.
                  </div>
                  <div className="p-2 rounded-md bg-slate-900 border border-slate-600">
                    <div className="text-[10px] text-slate-400 leading-snug">
                      Click any domain to see scope, AI applications, dependencies, and monitoring hooks.
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    {onShowArchDocs && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full h-8 text-[11px] font-semibold bg-blue-950 border-blue-500 text-blue-200 hover:bg-blue-900/50"
                        onClick={onShowArchDocs}
                      >
                        Architecture Guide
                      </Button>
                    )}
                    {onShowCalibration && (
                      <Button
                        variant="outline"
                        size="sm"
                        className={cn(
                          "w-full h-8 text-[11px] font-semibold",
                          hasCalibration ? "bg-amber-950/50 border-amber-500 text-amber-200" : "bg-slate-900 border-slate-600 text-slate-400",
                        )}
                        onClick={onShowCalibration}
                      >
                        {hasCalibration ? 'Product Calibration Active' : 'Calibrate for Product'}
                      </Button>
                    )}
                  </div>
                </>
              )}
            </>
          )}

          <Separator className="bg-slate-600 my-2" />
          <div className="text-[10px] text-slate-500 leading-snug pt-1">
            Click a node for details. Drag to pan. Scroll to zoom.{viewMode === 'system' ? ' Click categories to toggle.' : ''}
          </div>
        </CardContent>
      </Card>
    </nav>
  );
}
