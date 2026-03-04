import { useState, useCallback, useRef, useMemo } from 'react';
import { parseSessionLog, formatTimestamp, formatDuration, type ParsedLogEntry } from '../data/log-parser';
import yaml from 'js-yaml';

interface CommandCenterProps {
  logContent: string;
  logFilename: string | null;
  onLoadLogFile: (content: string, filename: string) => void;
  onClearLog: () => void;
}

// Agent data - organized by workflow stage
const AGENTS = [
  // Ideation & Planning
  { id: 'idea-to-pdb', name: 'Idea → PDB', cmd: '@idea-to-pdb', cat: 'ideation', desc: 'Explore idea, generate Product Design Blueprint' },
  { id: 'context-to-pdb', name: 'Context → PDB', cmd: '@context-to-pdb', cat: 'ideation', desc: 'Transform stakeholder context into PDB' },
  { id: 'pdb-to-tasks', name: 'PDB → Tasks', cmd: '@pdb-to-tasks', cat: 'ideation', desc: 'Decompose PDB into epics and tasks' },

  // Development
  { id: 'code-reviewer', name: 'Code Review', cmd: '@code-reviewer', cat: 'dev', desc: 'Quality, security, architecture review' },
  { id: 'test-writer', name: 'Test Writer', cmd: '@test-writer', cat: 'dev', desc: 'Test creation and coverage' },
  { id: 'debugger', name: 'Debugger', cmd: '@debugger', cat: 'dev', desc: 'Error investigation and fixes' },
  { id: 'designer', name: 'Designer', cmd: '@designer', cat: 'dev', desc: 'UI/UX, design system, accessibility' },
  { id: 'doc-generator', name: 'Doc Generator', cmd: '@doc-generator', cat: 'dev', desc: 'Documentation creation and maintenance' },

  // Quality & Security
  { id: 'security-auditor', name: 'Security Audit', cmd: '@security-auditor', cat: 'quality', desc: 'Security scanning and hardening' },
  { id: 'performance', name: 'Performance', cmd: '@performance-optimizer', cat: 'quality', desc: 'Performance analysis and optimization' },

  // Specialists
  { id: 'figma-specialist', name: 'Figma Specialist', cmd: '@figma-specialist', cat: 'specialist', desc: 'Figma-to-code, Code Connect, design system' },

  // Ingestion (for existing codebases)
  { id: 'codebase-auditor', name: 'Codebase Auditor', cmd: '@codebase-auditor', cat: 'ingestion', desc: 'Analyze existing code structure' },
  { id: 'gap-analysis', name: 'Gap Analysis', cmd: '@gap-analysis', cat: 'ingestion', desc: 'Identify production-readiness gaps' },
  { id: 'doc-backfill', name: 'Doc Backfill', cmd: '@documentation-backfill', cat: 'ingestion', desc: 'Generate PDB from existing code' },
] as const;

// Visual tool links
const VISUAL_TOOLS = [
  { id: 'system', label: 'System Map', desc: 'All agents & memory', hash: '#system' },
  { id: 'newIdea', label: 'New Idea', desc: 'Idea → Product workflow', hash: '#newIdea' },
  { id: 'existingRepo', label: 'Existing Repo', desc: 'Add to existing codebase', hash: '#existingRepo' },
  { id: 'contextToMvp', label: 'Context → MVP', desc: 'Stakeholder to MVP', hash: '#contextToMvp' },
  { id: 'domainArchitecture', label: 'Domain Agents', desc: 'Software craft expertise', hash: '#domainArchitecture' },
  { id: 'monitor', label: 'Session Monitor', desc: 'Visualize transcripts', hash: '#monitor' },
] as const;

// Config data - Rules
const RULES = [
  { id: 'token-efficiency', name: 'Token Efficiency', path: '.claude/rules/token-efficiency.md', desc: 'Guidelines for cost-effective Claude Code sessions' },
  { id: 'domain-routing', name: 'Domain Routing', path: '.claude/rules/domain-routing.md', desc: 'Route tasks to appropriate domain agents' },
  { id: 'domain-consultation', name: 'Domain Consultation', path: '.claude/rules/domain-consultation.md', desc: 'Cross-domain agent collaboration rules' },
  { id: 'domain-agent-loading', name: 'Domain Agent Loading', path: '.claude/rules/domain-agent-loading.md', desc: 'When and how to load domain agents' },
  { id: 'domain-knowledge-freshness', name: 'Knowledge Freshness', path: '.claude/rules/domain-knowledge-freshness.md', desc: 'Keep domain knowledge up to date' },
  { id: 'docs-editing', name: 'Docs Editing', path: '.claude/rules/docs-editing.md', desc: 'Rules for editing documentation' },
  { id: 'template-editing', name: 'Template Editing', path: '.claude/rules/template-editing.md', desc: 'Rules for editing template files' },
] as const;

// Config data - Skills
const SKILLS = [
  { id: 'full-pipeline', name: 'Full Pipeline', cmd: '/full-pipeline', path: '.claude/skills/full-pipeline/', desc: 'Run the complete development pipeline' },
  { id: 'apply-multi-agent-template', name: 'Apply Template', cmd: '/apply-multi-agent-template', path: '.claude/skills/apply-multi-agent-template/', desc: 'Apply multi-agent template to a project' },
  { id: 'calibrate-domains', name: 'Calibrate Domains', cmd: '/calibrate-domains', path: '.claude/skills/calibrate-domains/', desc: 'Calibrate domain agents for your product' },
  { id: 'domain-routing', name: 'Domain Routing', cmd: '/domain-routing', path: '.claude/skills/domain-routing/', desc: 'Route to appropriate domain agent' },
  { id: 'feature-audit', name: 'Feature Audit', cmd: '/feature-audit', path: '.claude/skills/feature-audit/', desc: 'Audit a feature implementation' },
  { id: 'descript-captions', name: 'Descript Captions', cmd: '/descript-inspired-captions', path: '.claude/skills/descript-inspired-captions/', desc: 'Generate Descript-style captions' },
] as const;

// Config data - MCP Servers
const MCP_SERVERS = [
  { id: 'idea-reality', name: 'Idea Reality', command: 'uvx idea-reality-mcp', desc: 'Transform ideas into reality with structured workflows' },
] as const;

// Config data - Hooks
const HOOKS = [
  { id: 'session-logger', name: 'Session Logger', path: '.claude/hooks/session-logger.sh', events: ['PreToolUse', 'PostToolUse', 'Stop'], desc: 'Log session events to JSONL for monitoring' },
] as const;

interface Task {
  id: string;
  title: string;
  status: 'todo' | 'in_progress' | 'done' | 'blocked';
  priority?: string;
}

export function CommandCenter({
  logContent,
  logFilename,
  onLoadLogFile,
  onClearLog,
}: CommandCenterProps) {
  const [activeTab, setActiveTab] = useState<'logs' | 'tasks' | 'agents' | 'config'>('logs');
  const [taskContent, setTaskContent] = useState('');
  const [taskFilename, setTaskFilename] = useState<string | null>(null);
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);
  const [selectedEntry, setSelectedEntry] = useState<ParsedLogEntry | null>(null);
  const [logFilter, setLogFilter] = useState<'all' | 'tools' | 'agents'>('all');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const taskInputRef = useRef<HTMLInputElement>(null);

  // Parse logs
  const session = useMemo(() => {
    if (!logContent.trim()) return null;
    try {
      return parseSessionLog(logContent);
    } catch {
      return null;
    }
  }, [logContent]);

  // Filter entries
  const filteredEntries = useMemo(() => {
    if (!session) return [];
    if (logFilter === 'all') return session.entries;
    if (logFilter === 'tools') {
      return session.entries.filter(e => e.eventType === 'tool_start' || e.eventType === 'tool_end');
    }
    return session.entries.filter(e => e.eventType === 'subagent_start' || e.eventType === 'subagent_end');
  }, [session, logFilter]);

  // Parse tasks
  const tasks = useMemo((): Task[] => {
    if (!taskContent.trim()) return [];
    try {
      const parsed = yaml.load(taskContent) as { tasks?: Task[] };
      return parsed?.tasks || [];
    } catch {
      return [];
    }
  }, [taskContent]);

  const taskStats = useMemo(() => {
    const stats = { todo: 0, in_progress: 0, done: 0, blocked: 0 };
    tasks.forEach(t => stats[t.status]++);
    return stats;
  }, [tasks]);

  // File handlers
  const handleLogFile = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      if (content?.trim()) onLoadLogFile(content, file.name);
    };
    reader.readAsText(file);
  }, [onLoadLogFile]);

  const handleTaskFile = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      if (content?.trim()) {
        setTaskContent(content);
        setTaskFilename(file.name);
      }
    };
    reader.readAsText(file);
  }, []);

  const copyCmd = useCallback((cmd: string) => {
    navigator.clipboard.writeText(cmd);
    setCopiedCmd(cmd);
    setTimeout(() => setCopiedCmd(null), 1500);
  }, []);

  return (
    <div className="h-full w-full bg-[#0a0a0a] text-white overflow-hidden flex flex-col">
      {/* Header */}
      <header className="flex-none border-b border-white/10 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-lg font-semibold tracking-tight">Command Center</h1>
            <div className="flex items-center gap-1.5 text-xs text-white/40">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Active
            </div>
          </div>
          <div className="flex items-center gap-2">
            {session && (
              <div className="flex items-center gap-4 text-xs text-white/50 mr-4">
                <span>{session.totalToolCalls} tools</span>
                <span>{session.totalSubagentCalls} agents</span>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Tab Bar */}
      <nav className="flex-none border-b border-white/10 px-6">
        <div className="flex items-center justify-between">
          <div className="flex gap-6">
            {(['logs', 'tasks', 'agents', 'config'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`
                  py-3 text-sm font-medium border-b-2 -mb-px transition-colors
                  ${activeTab === tab
                    ? 'border-white text-white'
                    : 'border-transparent text-white/40 hover:text-white/70'}
                `}
              >
                {tab === 'logs' ? 'Session Logs' : tab === 'tasks' ? 'Tasks' : tab === 'agents' ? 'Agents' : 'Config'}
                {tab === 'tasks' && tasks.length > 0 && (
                  <span className="ml-2 text-xs text-white/30">{tasks.length}</span>
                )}
              </button>
            ))}
          </div>

          {/* Visual Tools Quick Links */}
          <div className="flex items-center gap-1">
            <span className="text-xs text-white/30 mr-2">Visual Tools:</span>
            {VISUAL_TOOLS.map(tool => (
              <a
                key={tool.id}
                href={tool.hash}
                className="px-2.5 py-1.5 text-xs text-white/50 hover:text-white hover:bg-white/10 rounded-md transition-colors"
                title={tool.desc}
              >
                {tool.label}
              </a>
            ))}
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="flex-1 overflow-hidden">
        {activeTab === 'logs' && (
          <LogsView
            session={session}
            entries={filteredEntries}
            filter={logFilter}
            onFilterChange={setLogFilter}
            selectedEntry={selectedEntry}
            onSelectEntry={setSelectedEntry}
            filename={logFilename}
            onLoadFile={handleLogFile}
            onClear={onClearLog}
            fileInputRef={fileInputRef}
          />
        )}

        {activeTab === 'tasks' && (
          <TasksView
            tasks={tasks}
            stats={taskStats}
            filename={taskFilename}
            onLoadFile={handleTaskFile}
            onClear={() => { setTaskContent(''); setTaskFilename(null); }}
            fileInputRef={taskInputRef}
          />
        )}

        {activeTab === 'agents' && (
          <AgentsView
            agents={AGENTS}
            copiedCmd={copiedCmd}
            onCopy={copyCmd}
          />
        )}

        {activeTab === 'config' && (
          <ConfigView
            rules={RULES}
            skills={SKILLS}
            mcpServers={MCP_SERVERS}
            hooks={HOOKS}
            copiedCmd={copiedCmd}
            onCopy={copyCmd}
          />
        )}
      </main>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Logs View
// ─────────────────────────────────────────────────────────────────────────────

interface LogsViewProps {
  session: ReturnType<typeof parseSessionLog> | null;
  entries: ParsedLogEntry[];
  filter: 'all' | 'tools' | 'agents';
  onFilterChange: (f: 'all' | 'tools' | 'agents') => void;
  selectedEntry: ParsedLogEntry | null;
  onSelectEntry: (e: ParsedLogEntry | null) => void;
  filename: string | null;
  onLoadFile: (file: File) => void;
  onClear: () => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
}

function LogsView({
  session,
  entries,
  filter,
  onFilterChange,
  selectedEntry,
  onSelectEntry,
  filename,
  onLoadFile,
  onClear,
  fileInputRef,
}: LogsViewProps) {
  const [isDragging, setIsDragging] = useState(false);

  if (!session) {
    return (
      <div
        className={`
          h-full flex flex-col items-center justify-center
          ${isDragging ? 'bg-white/5' : ''}
        `}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          if (e.dataTransfer.files[0]) onLoadFile(e.dataTransfer.files[0]);
        }}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".jsonl"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && onLoadFile(e.target.files[0])}
        />
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/5 flex items-center justify-center">
            <svg className="w-8 h-8 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-white/90 mb-2">No session loaded</h3>
          <p className="text-sm text-white/40 mb-6 max-w-xs">
            Drop a <code className="text-white/60 bg-white/10 px-1.5 py-0.5 rounded">.jsonl</code> log file here or click to browse
          </p>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-2 text-sm font-medium bg-white text-black rounded-lg hover:bg-white/90 transition-colors"
          >
            Load Session
          </button>
          <p className="text-xs text-white/30 mt-4">
            Find logs in <code className="text-white/50">.claude/logs/</code>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex">
      {/* Log List */}
      <div className="flex-1 flex flex-col border-r border-white/10">
        {/* Toolbar */}
        <div className="flex-none flex items-center justify-between px-4 py-3 border-b border-white/5">
          <div className="flex items-center gap-1">
            {(['all', 'tools', 'agents'] as const).map(f => (
              <button
                key={f}
                onClick={() => onFilterChange(f)}
                className={`
                  px-3 py-1.5 text-xs font-medium rounded-md transition-colors
                  ${filter === f ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white/70'}
                `}
              >
                {f === 'all' ? 'All' : f === 'tools' ? 'Tools' : 'Agents'}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-3">
            {filename && (
              <span className="text-xs text-white/40 font-mono">{filename}</span>
            )}
            <button
              onClick={onClear}
              className="text-xs text-white/40 hover:text-white/70 transition-colors"
            >
              Clear
            </button>
          </div>
        </div>

        {/* Entries */}
        <div className="flex-1 overflow-y-auto">
          {entries.length === 0 ? (
            <div className="flex items-center justify-center h-full text-white/30 text-sm">
              No events match filter
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {entries.map(entry => (
                <button
                  key={entry.id}
                  onClick={() => onSelectEntry(selectedEntry?.id === entry.id ? null : entry)}
                  className={`
                    w-full px-4 py-3 text-left transition-colors
                    ${selectedEntry?.id === entry.id ? 'bg-white/5' : 'hover:bg-white/[0.02]'}
                  `}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg">
                      {entry.eventType.includes('tool') ? '⚡' : entry.eventType.includes('subagent') ? '🤖' : '○'}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-white/90 truncate">
                          {entry.toolName || entry.subagentType || entry.eventType}
                        </span>
                        {entry.durationMs && (
                          <span className="text-xs text-white/30">
                            {formatDuration(entry.durationMs)}
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-white/30 mt-0.5">
                        {formatTimestamp(entry.timestamp)}
                      </div>
                    </div>
                    <span className={`
                      text-[10px] px-1.5 py-0.5 rounded font-medium uppercase tracking-wide
                      ${entry.eventType.includes('start') ? 'bg-blue-500/20 text-blue-400' : 'bg-emerald-500/20 text-emerald-400'}
                    `}>
                      {entry.eventType.includes('start') ? 'start' : 'end'}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Detail Panel */}
      <div className="w-80 flex-none bg-white/[0.02] overflow-y-auto">
        {selectedEntry ? (
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium text-white/90">
                {selectedEntry.toolName || selectedEntry.subagentType || 'Event'}
              </h3>
              <button
                onClick={() => onSelectEntry(null)}
                className="text-white/40 hover:text-white/70"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-sm">
              <div>
                <div className="text-xs text-white/40 uppercase tracking-wide mb-1">Type</div>
                <div className="text-white/70">{selectedEntry.eventType}</div>
              </div>

              <div>
                <div className="text-xs text-white/40 uppercase tracking-wide mb-1">Timestamp</div>
                <div className="text-white/70 font-mono text-xs">
                  {selectedEntry.timestamp.toISOString()}
                </div>
              </div>

              {selectedEntry.durationMs && (
                <div>
                  <div className="text-xs text-white/40 uppercase tracking-wide mb-1">Duration</div>
                  <div className="text-white/70">{formatDuration(selectedEntry.durationMs)}</div>
                </div>
              )}

              {selectedEntry.toolInput && (
                <div>
                  <div className="text-xs text-white/40 uppercase tracking-wide mb-1">Input</div>
                  <pre className="text-xs text-white/60 bg-black/30 p-2 rounded overflow-x-auto">
                    {JSON.stringify(selectedEntry.toolInput, null, 2)}
                  </pre>
                </div>
              )}

              {selectedEntry.subagentPrompt && (
                <div>
                  <div className="text-xs text-white/40 uppercase tracking-wide mb-1">Prompt</div>
                  <p className="text-white/60 text-xs">{selectedEntry.subagentPrompt}</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="h-full flex items-center justify-center text-white/20 text-sm">
            Select an event
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Tasks View
// ─────────────────────────────────────────────────────────────────────────────

interface TasksViewProps {
  tasks: Task[];
  stats: { todo: number; in_progress: number; done: number; blocked: number };
  filename: string | null;
  onLoadFile: (file: File) => void;
  onClear: () => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
}

function TasksView({ tasks, stats, filename, onLoadFile, onClear, fileInputRef }: TasksViewProps) {
  const [isDragging, setIsDragging] = useState(false);

  if (tasks.length === 0) {
    return (
      <div
        className={`
          h-full flex flex-col items-center justify-center
          ${isDragging ? 'bg-white/5' : ''}
        `}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          if (e.dataTransfer.files[0]) onLoadFile(e.dataTransfer.files[0]);
        }}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".yml,.yaml"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && onLoadFile(e.target.files[0])}
        />
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/5 flex items-center justify-center">
            <svg className="w-8 h-8 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-white/90 mb-2">No tasks loaded</h3>
          <p className="text-sm text-white/40 mb-6 max-w-xs">
            Drop a <code className="text-white/60 bg-white/10 px-1.5 py-0.5 rounded">.yml</code> task file here
          </p>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-2 text-sm font-medium bg-white text-black rounded-lg hover:bg-white/90 transition-colors"
          >
            Load Tasks
          </button>
          <p className="text-xs text-white/30 mt-4">
            Find tasks in <code className="text-white/50">tasks/</code>
          </p>
        </div>
      </div>
    );
  }

  const total = tasks.length;
  const progress = total > 0 ? Math.round((stats.done / total) * 100) : 0;

  return (
    <div className="h-full flex flex-col">
      {/* Stats Header */}
      <div className="flex-none px-6 py-4 border-b border-white/5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            {filename && (
              <span className="text-sm text-white/60 font-mono">{filename}</span>
            )}
            <button
              onClick={onClear}
              className="text-xs text-white/40 hover:text-white/70"
            >
              Clear
            </button>
          </div>
          <span className="text-sm text-white/60">{progress}% complete</span>
        </div>

        {/* Progress Bar */}
        <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-emerald-500 transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Stats */}
        <div className="flex gap-6 mt-3">
          <div className="text-center">
            <div className="text-lg font-semibold text-white/90">{stats.todo}</div>
            <div className="text-xs text-white/40">Todo</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-blue-400">{stats.in_progress}</div>
            <div className="text-xs text-white/40">In Progress</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-emerald-400">{stats.done}</div>
            <div className="text-xs text-white/40">Done</div>
          </div>
          {stats.blocked > 0 && (
            <div className="text-center">
              <div className="text-lg font-semibold text-red-400">{stats.blocked}</div>
              <div className="text-xs text-white/40">Blocked</div>
            </div>
          )}
        </div>
      </div>

      {/* Task List */}
      <div className="flex-1 overflow-y-auto">
        <div className="divide-y divide-white/5">
          {tasks.map(task => (
            <div key={task.id} className="px-6 py-4 hover:bg-white/[0.02] transition-colors">
              <div className="flex items-start gap-3">
                <span className={`
                  mt-1 w-2 h-2 rounded-full flex-none
                  ${task.status === 'done' ? 'bg-emerald-500' :
                    task.status === 'in_progress' ? 'bg-blue-500' :
                    task.status === 'blocked' ? 'bg-red-500' : 'bg-white/20'}
                `} />
                <div className="flex-1 min-w-0">
                  <div className={`text-sm ${task.status === 'done' ? 'text-white/40 line-through' : 'text-white/90'}`}>
                    {task.title}
                  </div>
                  <div className="text-xs text-white/30 mt-0.5">
                    {task.id}
                  </div>
                </div>
                <span className={`
                  text-[10px] px-2 py-1 rounded font-medium uppercase tracking-wide
                  ${task.status === 'done' ? 'bg-emerald-500/20 text-emerald-400' :
                    task.status === 'in_progress' ? 'bg-blue-500/20 text-blue-400' :
                    task.status === 'blocked' ? 'bg-red-500/20 text-red-400' :
                    'bg-white/10 text-white/50'}
                `}>
                  {task.status.replace('_', ' ')}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Agents View
// ─────────────────────────────────────────────────────────────────────────────

interface AgentsViewProps {
  agents: readonly { id: string; name: string; cmd: string; cat: string; desc: string }[];
  copiedCmd: string | null;
  onCopy: (cmd: string) => void;
}

const CATEGORY_INFO = {
  ideation: { label: 'Ideation & Planning', cols: 1 },
  dev: { label: 'Development', cols: 2 },
  quality: { label: 'Quality & Security', cols: 2 },
  specialist: { label: 'Specialists', cols: 1 },
  ingestion: { label: 'Codebase Ingestion', cols: 1 },
} as const;

function AgentsView({ agents, copiedCmd, onCopy }: AgentsViewProps) {
  const categories = ['ideation', 'dev', 'quality', 'specialist', 'ingestion'] as const;

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="max-w-3xl mx-auto space-y-8">
        {categories.map(cat => {
          const catAgents = agents.filter(a => a.cat === cat);
          if (catAgents.length === 0) return null;
          const info = CATEGORY_INFO[cat];

          return (
            <section key={cat}>
              <h3 className="text-xs font-medium text-white/40 uppercase tracking-wider mb-4">
                {info.label}
              </h3>
              <div className={`grid gap-3 ${info.cols === 2 ? 'grid-cols-2' : 'grid-cols-1'}`}>
                {catAgents.map(agent => (
                  <button
                    key={agent.id}
                    onClick={() => onCopy(agent.cmd)}
                    className={`
                      flex items-center justify-between p-4 rounded-lg border transition-all text-left
                      ${copiedCmd === agent.cmd
                        ? 'border-emerald-500/50 bg-emerald-500/10'
                        : 'border-white/10 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04]'}
                    `}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-white/90">{agent.name}</span>
                        <code className="text-xs text-white/30 bg-white/5 px-1.5 py-0.5 rounded">{agent.cmd}</code>
                      </div>
                      <p className="text-xs text-white/40 mt-1 truncate">{agent.desc}</p>
                    </div>
                    <span className={`
                      ml-3 text-xs font-medium transition-colors flex-none
                      ${copiedCmd === agent.cmd ? 'text-emerald-400' : 'text-white/20'}
                    `}>
                      {copiedCmd === agent.cmd ? '✓ Copied' : 'Copy'}
                    </span>
                  </button>
                ))}
              </div>
            </section>
          );
        })}

        {/* Quick Help */}
        <section className="pt-4 border-t border-white/5">
          <div className="text-xs text-white/30">
            Click any agent to copy its invocation command. Paste into Claude Code to invoke.
          </div>
        </section>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Config View
// ─────────────────────────────────────────────────────────────────────────────

interface ConfigViewProps {
  rules: readonly { id: string; name: string; path: string; desc: string }[];
  skills: readonly { id: string; name: string; cmd: string; path: string; desc: string }[];
  mcpServers: readonly { id: string; name: string; command: string; desc: string }[];
  hooks: readonly { id: string; name: string; path: string; events: readonly string[]; desc: string }[];
  copiedCmd: string | null;
  onCopy: (cmd: string) => void;
}

function ConfigView({ rules, skills, mcpServers, hooks, copiedCmd, onCopy }: ConfigViewProps) {
  const [expandedSection, setExpandedSection] = useState<string | null>('rules');

  const sections = [
    { id: 'rules', label: 'Rules', count: rules.length, icon: '📜' },
    { id: 'skills', label: 'Skills', count: skills.length, icon: '⚡' },
    { id: 'mcp', label: 'MCP Servers', count: mcpServers.length, icon: '🔌' },
    { id: 'hooks', label: 'Hooks', count: hooks.length, icon: '🪝' },
  ];

  return (
    <div className="h-full flex">
      {/* Sidebar */}
      <div className="w-56 flex-none border-r border-white/10 p-4">
        <div className="space-y-1">
          {sections.map(section => (
            <button
              key={section.id}
              onClick={() => setExpandedSection(expandedSection === section.id ? null : section.id)}
              className={`
                w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition-colors
                ${expandedSection === section.id
                  ? 'bg-white/10 text-white'
                  : 'text-white/50 hover:text-white/80 hover:bg-white/5'}
              `}
            >
              <div className="flex items-center gap-2">
                <span>{section.icon}</span>
                <span className="text-sm font-medium">{section.label}</span>
              </div>
              <span className="text-xs text-white/30">{section.count}</span>
            </button>
          ))}
        </div>

        <div className="mt-6 pt-4 border-t border-white/10">
          <div className="text-xs text-white/30 mb-2">Quick Reference</div>
          <a
            href="https://docs.anthropic.com/en/docs/claude-code"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-xs text-white/50 hover:text-white/80 py-1"
          >
            Claude Code Docs →
          </a>
          <button
            onClick={() => onCopy('cat CLAUDE.md')}
            className="block text-xs text-white/50 hover:text-white/80 py-1 text-left"
          >
            View CLAUDE.md
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {expandedSection === 'rules' && (
          <div className="max-w-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-white/90">Rules</h3>
              <span className="text-xs text-white/40">.claude/rules/</span>
            </div>
            <p className="text-sm text-white/40 mb-6">
              Rules are auto-loaded instructions that guide Claude's behavior. They can be global or path-specific.
            </p>
            <div className="space-y-3">
              {rules.map(rule => (
                <div
                  key={rule.id}
                  className="p-4 rounded-lg border border-white/10 bg-white/[0.02] hover:bg-white/[0.04] transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-medium text-white/90">{rule.name}</div>
                      <p className="text-xs text-white/40 mt-1">{rule.desc}</p>
                    </div>
                    <code className="text-xs text-white/30 bg-white/5 px-2 py-1 rounded shrink-0 ml-4">
                      {rule.path.split('/').pop()}
                    </code>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {expandedSection === 'skills' && (
          <div className="max-w-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-white/90">Skills</h3>
              <span className="text-xs text-white/40">.claude/skills/</span>
            </div>
            <p className="text-sm text-white/40 mb-6">
              Skills are reusable workflows invoked with slash commands. Click to copy the command.
            </p>
            <div className="space-y-3">
              {skills.map(skill => (
                <button
                  key={skill.id}
                  onClick={() => onCopy(skill.cmd)}
                  className={`
                    w-full p-4 rounded-lg border text-left transition-all
                    ${copiedCmd === skill.cmd
                      ? 'border-emerald-500/50 bg-emerald-500/10'
                      : 'border-white/10 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04]'}
                  `}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-white/90">{skill.name}</span>
                        <code className="text-xs text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                          {skill.cmd}
                        </code>
                      </div>
                      <p className="text-xs text-white/40 mt-1">{skill.desc}</p>
                    </div>
                    <span className={`
                      text-xs font-medium transition-colors shrink-0 ml-4
                      ${copiedCmd === skill.cmd ? 'text-emerald-400' : 'text-white/20'}
                    `}>
                      {copiedCmd === skill.cmd ? '✓ Copied' : 'Copy'}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {expandedSection === 'mcp' && (
          <div className="max-w-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-white/90">MCP Servers</h3>
              <span className="text-xs text-white/40">.mcp.json</span>
            </div>
            <p className="text-sm text-white/40 mb-6">
              Model Context Protocol servers extend Claude's capabilities with external tools.
            </p>
            <div className="space-y-3">
              {mcpServers.map(server => (
                <div
                  key={server.id}
                  className="p-4 rounded-lg border border-white/10 bg-white/[0.02]"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                        <span className="font-medium text-white/90">{server.name}</span>
                      </div>
                      <p className="text-xs text-white/40 mt-1">{server.desc}</p>
                      <code className="text-xs text-white/30 mt-2 block">{server.command}</code>
                    </div>
                  </div>
                </div>
              ))}
              {mcpServers.length === 0 && (
                <div className="text-center py-8 text-white/30 text-sm">
                  No MCP servers configured
                </div>
              )}
            </div>
          </div>
        )}

        {expandedSection === 'hooks' && (
          <div className="max-w-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-white/90">Hooks</h3>
              <span className="text-xs text-white/40">.claude/hooks/</span>
            </div>
            <p className="text-sm text-white/40 mb-6">
              Hooks run shell commands in response to Claude Code events like tool calls.
            </p>
            <div className="space-y-3">
              {hooks.map(hook => (
                <div
                  key={hook.id}
                  className="p-4 rounded-lg border border-white/10 bg-white/[0.02]"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-medium text-white/90">{hook.name}</div>
                      <p className="text-xs text-white/40 mt-1">{hook.desc}</p>
                      <div className="flex gap-2 mt-2">
                        {hook.events.map(event => (
                          <span
                            key={event}
                            className="text-xs text-blue-400 bg-blue-500/10 px-1.5 py-0.5 rounded"
                          >
                            {event}
                          </span>
                        ))}
                      </div>
                    </div>
                    <code className="text-xs text-white/30 bg-white/5 px-2 py-1 rounded shrink-0 ml-4">
                      {hook.path.split('/').pop()}
                    </code>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {!expandedSection && (
          <div className="h-full flex items-center justify-center text-white/20 text-sm">
            Select a section from the sidebar
          </div>
        )}
      </div>
    </div>
  );
}
