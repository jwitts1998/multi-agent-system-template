import { useState, useMemo, useCallback, useRef } from 'react';
import {
  type SessionLog,
  type ParsedLogEntry,
  type LogEventType,
  parseSessionLog,
  formatDuration,
  formatTimestamp,
  getEventIcon,
  getEventColor,
} from '../data/log-parser';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';
import { Separator } from './ui/separator';

interface LogViewerProps {
  /** Raw JSONL log content */
  logContent: string;
  /** Currently loaded filename */
  filename?: string | null;
  /** Callback when a log file is loaded */
  onLoadFile?: (content: string, filename: string) => void;
  /** Callback to clear the loaded log */
  onClear?: () => void;
  /** Callback when refresh is requested */
  onRefresh?: () => void;
  /** Whether auto-refresh is enabled */
  autoRefresh?: boolean;
  /** Toggle auto-refresh */
  onToggleAutoRefresh?: () => void;
}

type EventFilter = LogEventType | 'all';

const EVENT_FILTERS: { value: EventFilter; label: string }[] = [
  { value: 'all', label: 'All Events' },
  { value: 'tool_start', label: 'Tool Calls' },
  { value: 'subagent_start', label: 'Subagents' },
  { value: 'session_start', label: 'Session' },
];

export function LogViewer({
  logContent,
  filename,
  onLoadFile,
  onClear,
  onRefresh,
  autoRefresh = false,
  onToggleAutoRefresh,
}: LogViewerProps) {
  const [filter, setFilter] = useState<EventFilter>('all');
  const [selectedEntry, setSelectedEntry] = useState<ParsedLogEntry | null>(null);
  const [expandedTools, setExpandedTools] = useState<Set<string>>(new Set());
  const [isDragging, setIsDragging] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback((file: File) => {
    setFileError(null);
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (ext !== 'jsonl') {
      setFileError('Please select a .jsonl log file');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      if (!content?.trim()) {
        setFileError('File is empty');
        return;
      }
      onLoadFile?.(content, file.name);
    };
    reader.onerror = () => setFileError('Failed to read file');
    reader.readAsText(file);
  }, [onLoadFile]);

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const onDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFile(files[0]);
    }
  }, [handleFile]);

  const onInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  }, [handleFile]);

  // Parse the log content
  const session = useMemo(() => {
    if (!logContent.trim()) {
      return null;
    }
    try {
      return parseSessionLog(logContent);
    } catch (e) {
      console.error('Failed to parse log:', e);
      return null;
    }
  }, [logContent]);

  // Filter entries
  const filteredEntries = useMemo(() => {
    if (!session) return [];
    if (filter === 'all') return session.entries;

    // Group related events
    if (filter === 'tool_start') {
      return session.entries.filter(e =>
        e.eventType === 'tool_start' || e.eventType === 'tool_end'
      );
    }
    if (filter === 'subagent_start') {
      return session.entries.filter(e =>
        e.eventType === 'subagent_start' || e.eventType === 'subagent_end'
      );
    }
    if (filter === 'session_start') {
      return session.entries.filter(e =>
        e.eventType === 'session_start' ||
        e.eventType === 'session_end' ||
        e.eventType === 'session_summary'
      );
    }
    return session.entries.filter(e => e.eventType === filter);
  }, [session, filter]);

  const toggleToolExpanded = useCallback((id: string) => {
    setExpandedTools(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  if (!session) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Session Log</span>
            {onRefresh && (
              <Button variant="outline" size="sm" onClick={onRefresh}>
                Refresh
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div
            className={`
              flex flex-col items-center justify-center h-64
              border-2 border-dashed rounded-lg cursor-pointer
              transition-colors
              ${isDragging
                ? 'border-blue-500 bg-blue-500/10'
                : 'border-slate-600 hover:border-slate-500 hover:bg-slate-800/50'}
            `}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            onClick={() => fileInputRef.current?.click()}
            role="button"
            tabIndex={0}
            aria-label="Drop a log file or click to browse"
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                fileInputRef.current?.click();
              }
            }}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".jsonl"
              onChange={onInputChange}
              style={{ display: 'none' }}
            />
            <div className="text-4xl mb-3">{isDragging ? '📥' : '📋'}</div>
            <p className="text-slate-300 font-medium">
              {isDragging ? 'Drop log file here' : 'Load Session Log'}
            </p>
            <p className="text-sm text-slate-500 mt-2">
              Drop a <code className="text-slate-400">.jsonl</code> log file, or click to browse
            </p>
            <p className="text-xs text-slate-600 mt-3">
              Logs are in <code className="text-slate-500">.claude/logs/</code>
            </p>
            {fileError && (
              <p className="text-sm text-red-400 mt-3">{fileError}</p>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span>Session Log</span>
            {filename && (
              <Badge variant="secondary" className="font-mono text-xs">
                {filename}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            {onClear && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClear}
                title="Load different log file"
              >
                📂 Load Different
              </Button>
            )}
            {onToggleAutoRefresh && (
              <Button
                variant={autoRefresh ? 'default' : 'outline'}
                size="sm"
                onClick={onToggleAutoRefresh}
              >
                {autoRefresh ? '⏸ Pause' : '▶ Live'}
              </Button>
            )}
            {onRefresh && (
              <Button variant="outline" size="sm" onClick={onRefresh}>
                ↻ Refresh
              </Button>
            )}
          </div>
        </CardTitle>

        {/* Session Summary */}
        <div className="flex flex-wrap gap-2 mt-2">
          <Badge variant="outline">
            📦 {session.totalToolCalls} tool calls
          </Badge>
          <Badge variant="outline">
            🤖 {session.totalSubagentCalls} subagents
          </Badge>
          {session.startTime && (
            <Badge variant="outline">
              🕐 {formatTimestamp(session.startTime)}
            </Badge>
          )}
          {session.projectDir && (
            <Badge variant="secondary" className="truncate max-w-48">
              📁 {session.projectDir.split('/').pop()}
            </Badge>
          )}
        </div>

        {/* Filters */}
        <div className="flex gap-1 mt-2">
          {EVENT_FILTERS.map(f => (
            <Button
              key={f.value}
              variant={filter === f.value ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setFilter(f.value)}
            >
              {f.label}
            </Button>
          ))}
        </div>
      </CardHeader>

      <Separator />

      <CardContent className="flex-1 overflow-hidden p-0">
        <ScrollArea className="h-full">
          <div className="p-4 space-y-2">
            {filteredEntries.map(entry => (
              <LogEntryRow
                key={entry.id}
                entry={entry}
                isExpanded={expandedTools.has(entry.id)}
                isSelected={selectedEntry?.id === entry.id}
                onToggle={() => toggleToolExpanded(entry.id)}
                onSelect={() => setSelectedEntry(entry)}
              />
            ))}

            {filteredEntries.length === 0 && (
              <div className="text-center text-muted-foreground py-8">
                No events match the current filter
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>

      {/* Detail Panel */}
      {selectedEntry && (
        <>
          <Separator />
          <div className="p-4 bg-muted/50">
            <LogEntryDetail
              entry={selectedEntry}
              onClose={() => setSelectedEntry(null)}
            />
          </div>
        </>
      )}
    </Card>
  );
}

// ── Sub-components ──

interface LogEntryRowProps {
  entry: ParsedLogEntry;
  isExpanded: boolean;
  isSelected: boolean;
  onToggle: () => void;
  onSelect: () => void;
}

function LogEntryRow({
  entry,
  isExpanded,
  isSelected,
  onToggle,
  onSelect,
}: LogEntryRowProps) {
  const icon = getEventIcon(entry.eventType);
  const color = getEventColor(entry.eventType);

  const summary = useMemo(() => {
    switch (entry.eventType) {
      case 'tool_start':
        return `${entry.toolName}`;
      case 'tool_end':
        return `${entry.toolName} ${entry.durationMs ? `(${formatDuration(entry.durationMs)})` : ''}`;
      case 'subagent_start':
        return `${entry.subagentType}`;
      case 'subagent_end':
        return `${entry.subagentType} ${entry.durationMs ? `(${formatDuration(entry.durationMs)})` : ''}`;
      case 'session_start':
        return 'Session started';
      case 'session_end':
        return `Session ended (${entry.reason || 'unknown'})`;
      case 'session_summary':
        return `${entry.totalToolCalls} tools, ${entry.totalSubagentCalls} subagents`;
      default:
        return entry.eventType;
    }
  }, [entry]);

  return (
    <div
      className={`
        rounded-md border p-2 cursor-pointer transition-colors
        ${isSelected ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted/50'}
      `}
      onClick={onSelect}
    >
      <div className="flex items-center gap-2">
        <span className="text-lg">{icon}</span>
        <span
          className="font-mono text-xs px-1.5 py-0.5 rounded"
          style={{ backgroundColor: `${color}20`, color }}
        >
          {formatTimestamp(entry.timestamp)}
        </span>
        <span className="font-medium flex-1 truncate">{summary}</span>

        {(entry.eventType === 'tool_start' || entry.eventType === 'subagent_start') && (
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onToggle();
            }}
          >
            {isExpanded ? '▼' : '▶'}
          </Button>
        )}
      </div>

      {/* Expanded content */}
      {isExpanded && (
        <div className="mt-2 pl-8 text-sm text-muted-foreground">
          {entry.eventType === 'tool_start' && entry.toolInput && (
            <pre className="bg-muted p-2 rounded overflow-x-auto text-xs">
              {JSON.stringify(entry.toolInput, null, 2)}
            </pre>
          )}
          {entry.eventType === 'subagent_start' && entry.subagentPrompt && (
            <p className="italic">{entry.subagentPrompt}</p>
          )}
        </div>
      )}
    </div>
  );
}

interface LogEntryDetailProps {
  entry: ParsedLogEntry;
  onClose: () => void;
}

function LogEntryDetail({ entry, onClose }: LogEntryDetailProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold">
          {getEventIcon(entry.eventType)} {entry.eventType}
        </h4>
        <Button variant="ghost" size="sm" onClick={onClose}>
          ✕
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-2 text-sm">
        <div>
          <span className="text-muted-foreground">Timestamp:</span>
          <span className="ml-2">{entry.timestamp.toISOString()}</span>
        </div>
        <div>
          <span className="text-muted-foreground">Session:</span>
          <span className="ml-2 font-mono text-xs">{entry.sessionId}</span>
        </div>

        {entry.toolName && (
          <div>
            <span className="text-muted-foreground">Tool:</span>
            <span className="ml-2 font-mono">{entry.toolName}</span>
          </div>
        )}

        {entry.subagentType && (
          <div>
            <span className="text-muted-foreground">Subagent:</span>
            <span className="ml-2 font-mono">{entry.subagentType}</span>
          </div>
        )}

        {entry.durationMs !== undefined && (
          <div>
            <span className="text-muted-foreground">Duration:</span>
            <span className="ml-2">{formatDuration(entry.durationMs)}</span>
          </div>
        )}
      </div>

      {/* Raw data */}
      <details className="mt-2">
        <summary className="cursor-pointer text-sm text-muted-foreground">
          Raw JSON
        </summary>
        <pre className="mt-1 bg-muted p-2 rounded overflow-x-auto text-xs">
          {JSON.stringify(entry.raw, null, 2)}
        </pre>
      </details>
    </div>
  );
}
