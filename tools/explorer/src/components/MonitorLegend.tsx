import type { SessionData } from '../data/transcript-parser';
import { calculateCost, type ModelId } from '../data/model-pricing';
import { Card, CardContent, CardHeader } from './ui/card';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoadedSession {
  session: SessionData;
  filename: string;
}

interface MonitorLegendProps {
  sessions: LoadedSession[];
  activeSessionIndex: number;
  monitorSession: SessionData;
  selectedModel: ModelId;
  monitorSearchQuery: string;
  monitorMatchCount: { matching: number; total: number } | null;
  onSelectSession: (index: number) => void;
  onRemoveSession: (index: number) => void;
  onAddSession: () => void;
  onShowOverview: () => void;
  onSearchChange: (query: string) => void;
}

export function MonitorLegend({
  sessions,
  activeSessionIndex,
  monitorSession,
  selectedModel,
  monitorSearchQuery,
  monitorMatchCount,
  onSelectSession,
  onRemoveSession,
  onAddSession,
  onShowOverview,
  onSearchChange,
}: MonitorLegendProps) {
  return (
    <nav
      role="region"
      aria-label="Session monitor controls"
      className="legend-panel absolute top-3 left-3 z-10 max-w-[220px]"
    >
      <Card className="border-slate-600 bg-slate-800 shadow-lg">
        <CardHeader className="p-4 pb-2">
          <div className="text-sm font-bold text-slate-100 mb-2">
            Session Monitor
          </div>
        </CardHeader>
        <CardContent className="p-4 pt-0 space-y-2.5">
          <div>
            <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">
              Sessions ({sessions.length})
            </div>
            <ScrollArea className="h-[120px] rounded">
              <div className="flex flex-col gap-0.5 pr-2">
                {sessions.map((s, i) => (
                  <div
                    key={s.session.id}
                    className={cn(
                      "flex items-center justify-between rounded",
                      i === activeSessionIndex && "bg-slate-900 border-l-4 border-l-blue-500",
                    )}
                  >
                    <button
                      onClick={() => onSelectSession(i)}
                      aria-label={`Switch to session: ${s.filename}`}
                      aria-current={i === activeSessionIndex ? 'true' : undefined}
                      className={cn(
                        "flex items-center gap-1.5 min-w-0 flex-1 px-2 py-1 text-[11px] cursor-pointer text-left bg-transparent border-none",
                        i === activeSessionIndex ? "text-slate-200" : "text-slate-400",
                      )}
                    >
                      <span className="overflow-hidden text-ellipsis whitespace-nowrap">
                        {s.filename.length > 20 ? s.filename.slice(0, 20) + '\u2026' : s.filename}
                      </span>
                      <span className="text-[9px] text-slate-500 shrink-0">
                        {s.session.turns.length}t
                      </span>
                    </button>
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      className="h-6 w-6 shrink-0 text-slate-500 hover:text-slate-300"
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemoveSession(i);
                      }}
                      aria-label={`Remove session: ${s.filename}`}
                    >
                      <X className="size-3.5" />
                    </Button>
                  </div>
                ))}
              </div>
            </ScrollArea>
            <Button
              variant="outline"
              size="sm"
              className="w-full mt-1.5 h-7 text-[11px] border-dashed border-slate-600 text-slate-500 hover:bg-slate-800/50"
              onClick={onAddSession}
            >
              + Add Session
            </Button>
          </div>

          <div className="flex flex-col gap-1">
            {[
              { label: 'User Input', color: '#3b82f6' },
              { label: 'Agent Turn', color: '#22c55e' },
              { label: 'Tool Calls', color: '#f59e0b' },
              { label: 'Subagent', color: '#a78bfa' },
            ].map(({ label, color }) => (
              <div key={label} className="flex items-center gap-2 px-2 py-0.5 text-xs text-slate-300">
                <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ background: color }} aria-hidden />
                {label}
              </div>
            ))}
          </div>

          <div className="relative">
            <Input
              type="text"
              placeholder="Search nodes..."
              value={monitorSearchQuery}
              onChange={e => onSearchChange(e.target.value)}
              aria-label="Search session monitor nodes"
              className={cn(
                "h-8 text-xs bg-slate-900 border-slate-600 pr-8",
                monitorSearchQuery && "pr-8",
              )}
            />
            {monitorSearchQuery && (
              <Button
                variant="ghost"
                size="icon-xs"
                className="absolute right-1.5 top-1/2 -translate-y-1/2 h-6 w-6 text-slate-500"
                onClick={() => onSearchChange('')}
                aria-label="Clear search"
              >
                <X className="size-3.5" />
              </Button>
            )}
          </div>
          {monitorMatchCount && (
            <div className="text-[10px] text-slate-500" aria-live="polite">
              {monitorMatchCount.matching} of {monitorMatchCount.total} nodes match
            </div>
          )}

          <div className="monitor-session-bar flex items-center gap-3 px-3.5 py-2 bg-slate-900 rounded-lg border border-slate-600">
            <div className="monitor-session-stat flex items-center gap-1 text-[11px] text-slate-400">
              <strong className="text-slate-100 font-mono text-xs">{monitorSession.turns.length}</strong> turns
            </div>
            <div className="monitor-session-stat flex items-center gap-1 text-[11px] text-slate-400">
              <strong className="text-slate-100 font-mono text-xs">~{monitorSession.totalTokens.toLocaleString()}</strong> tok
            </div>
            <div className="monitor-session-stat flex items-center gap-1 text-[11px] text-slate-400">
              <strong className="text-emerald-400 font-mono text-xs">
                ${calculateCost(monitorSession.inputTokens, monitorSession.outputTokens, selectedModel).toFixed(2)}
              </strong> est.
            </div>
          </div>

          <div className="flex gap-1.5">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 h-8 text-[11px] bg-slate-900 border-slate-600 text-slate-400 hover:bg-slate-800"
              onClick={onShowOverview}
            >
              Overview
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex-1 h-8 text-[11px] bg-slate-900 border-slate-600 text-slate-400 hover:bg-slate-800"
              onClick={() => onRemoveSession(activeSessionIndex)}
            >
              Close Session
            </Button>
          </div>

          <div className="pt-3 mt-1 border-t border-slate-600 text-[10px] text-slate-500 leading-snug">
            Click a node for details. Click Overview for session summary.
          </div>
        </CardContent>
      </Card>
    </nav>
  );
}
