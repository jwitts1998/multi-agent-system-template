import { useState, useCallback, useRef, useMemo, useEffect } from 'react';
import { parseSessionLog, formatTimestamp, formatDuration, type ParsedLogEntry } from '../data/log-parser';
import yaml from 'js-yaml';

// Recent files storage key
const RECENT_FILES_KEY = 'command-center-recent-files';
const MAX_RECENT_FILES = 5;

interface RecentFile {
  name: string;
  type: 'log' | 'task';
  timestamp: number;
}

// Bundled config data type
interface BundledConfigData {
  generatedAt: string;
  projectRoot: string;
  claudeMd: string | null;
  agents: Array<{ id: string; name: string; cmd: string; path: string; category: string; desc: string; content: string }>;
  rules: Array<{ id: string; name: string; path: string; content: string }>;
  skills: Array<{ id: string; name: string; cmd: string; path: string; content: string }>;
  hooks: Array<{ id: string; name: string; path: string; content: string }>;
  mcpConfig: { path: string; content: string } | null;
}

interface CommandCenterProps {
  logContent: string;
  logFilename: string | null;
  onLoadLogFile: (content: string, filename: string) => void;
  onClearLog: () => void;
}

// Visual tool links
const VISUAL_TOOLS = [
  { id: 'system', label: 'System Map', desc: 'All agents & memory', hash: '#system' },
  { id: 'newIdea', label: 'New Idea', desc: 'Idea → Product workflow', hash: '#newIdea' },
  { id: 'existingRepo', label: 'Existing Repo', desc: 'Add to existing codebase', hash: '#existingRepo' },
  { id: 'contextToMvp', label: 'Context → MVP', desc: 'Stakeholder to MVP', hash: '#contextToMvp' },
  { id: 'domainArchitecture', label: 'Domain Agents', desc: 'Software craft expertise', hash: '#domainArchitecture' },
  { id: 'monitor', label: 'Session Monitor', desc: 'Visualize transcripts', hash: '#monitor' },
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
  const [activeTab, setActiveTab] = useState<'logs' | 'tasks' | 'files'>('logs');
  const [taskContent, setTaskContent] = useState('');
  const [taskFilename, setTaskFilename] = useState<string | null>(null);
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);
  const [selectedEntry, setSelectedEntry] = useState<ParsedLogEntry | null>(null);
  const [logFilter, setLogFilter] = useState<'all' | 'tools' | 'agents'>('all');
  const [recentFiles, setRecentFiles] = useState<RecentFile[]>([]);
  const [configData, setConfigData] = useState<BundledConfigData | null>(null);
  const [configLoading, setConfigLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const taskInputRef = useRef<HTMLInputElement>(null);

  // Load bundled config data
  useEffect(() => {
    fetch('/config-data.json')
      .then(res => res.json())
      .then((data: BundledConfigData) => {
        setConfigData(data);
        setConfigLoading(false);
      })
      .catch(err => {
        console.warn('Could not load config data:', err);
        setConfigLoading(false);
      });
  }, []);

  // Load recent files from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(RECENT_FILES_KEY);
      if (saved) {
        setRecentFiles(JSON.parse(saved));
      }
    } catch {
      // Ignore errors
    }
  }, []);

  // Save recent file
  const addRecentFile = useCallback((name: string, type: 'log' | 'task') => {
    setRecentFiles(prev => {
      const filtered = prev.filter(f => f.name !== name);
      const updated = [{ name, type, timestamp: Date.now() }, ...filtered].slice(0, MAX_RECENT_FILES);
      try {
        localStorage.setItem(RECENT_FILES_KEY, JSON.stringify(updated));
      } catch {
        // Ignore storage errors
      }
      return updated;
    });
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if in input
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;

      // Tab shortcuts: 1-3
      if (e.key === '1') setActiveTab('logs');
      else if (e.key === '2') setActiveTab('tasks');
      else if (e.key === '3') setActiveTab('files');
      // Focus file input with 'o'
      else if (e.key === 'o' && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        if (activeTab === 'logs') fileInputRef.current?.click();
        else if (activeTab === 'tasks') taskInputRef.current?.click();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeTab]);

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
      if (content?.trim()) {
        onLoadLogFile(content, file.name);
        addRecentFile(file.name, 'log');
      }
    };
    reader.readAsText(file);
  }, [onLoadLogFile, addRecentFile]);

  const handleTaskFile = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      if (content?.trim()) {
        setTaskContent(content);
        setTaskFilename(file.name);
        addRecentFile(file.name, 'task');
      }
    };
    reader.readAsText(file);
  }, [addRecentFile]);

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
            {(['logs', 'tasks', 'files'] as const).map(tab => (
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
                {tab === 'logs' ? 'Session Logs' : tab === 'tasks' ? 'Tasks' : 'Files'}
                {tab === 'tasks' && tasks.length > 0 && (
                  <span className="ml-2 text-xs text-white/30">{tasks.length}</span>
                )}
                {tab === 'files' && configData && (
                  <span className="ml-2 text-xs text-white/30">
                    {(configData.agents?.length || 0) + configData.rules.length + configData.skills.length + configData.hooks.length + (configData.mcpConfig ? 1 : 0) + (configData.claudeMd ? 1 : 0)}
                  </span>
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
            recentFiles={recentFiles.filter(f => f.type === 'log')}
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
            recentFiles={recentFiles.filter(f => f.type === 'task')}
          />
        )}

        {activeTab === 'files' && (
          <FilesView
            configData={configData}
            configLoading={configLoading}
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
  recentFiles: RecentFile[];
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
  recentFiles,
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
            Find logs in <code className="text-white/50">.claude/logs/</code> &middot; Press <kbd className="px-1 py-0.5 bg-white/10 rounded text-white/50">o</kbd> to open
          </p>

          {/* Recent Files */}
          {recentFiles.length > 0 && (
            <div className="mt-6 pt-4 border-t border-white/10">
              <div className="text-xs text-white/40 mb-2">Recent logs</div>
              <div className="flex flex-wrap gap-2 justify-center">
                {recentFiles.map(f => (
                  <span
                    key={f.name}
                    className="text-xs text-white/50 bg-white/5 px-2 py-1 rounded"
                    title={new Date(f.timestamp).toLocaleString()}
                  >
                    {f.name}
                  </span>
                ))}
              </div>
            </div>
          )}
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
  recentFiles: RecentFile[];
}

function TasksView({ tasks, stats, filename, onLoadFile, onClear, fileInputRef, recentFiles }: TasksViewProps) {
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
            Find tasks in <code className="text-white/50">tasks/</code> &middot; Press <kbd className="px-1 py-0.5 bg-white/10 rounded text-white/50">o</kbd> to open
          </p>

          {/* Recent Files */}
          {recentFiles.length > 0 && (
            <div className="mt-6 pt-4 border-t border-white/10">
              <div className="text-xs text-white/40 mb-2">Recent tasks</div>
              <div className="flex flex-wrap gap-2 justify-center">
                {recentFiles.map(f => (
                  <span
                    key={f.name}
                    className="text-xs text-white/50 bg-white/5 px-2 py-1 rounded"
                    title={new Date(f.timestamp).toLocaleString()}
                  >
                    {f.name}
                  </span>
                ))}
              </div>
            </div>
          )}
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
// Files View (Directory Browser)
// ─────────────────────────────────────────────────────────────────────────────

interface FilesViewProps {
  configData: BundledConfigData | null;
  configLoading: boolean;
  copiedCmd: string | null;
  onCopy: (cmd: string) => void;
}

// Category labels for agents
const AGENT_CATEGORIES: Record<string, string> = {
  ideation: 'Ideation & Planning',
  generic: 'Development',
  domains: 'Domain Experts',
  specialists: 'Specialists',
  ingestion: 'Codebase Ingestion',
  system: 'System',
};

function FilesView({
  configData,
  configLoading,
  copiedCmd,
  onCopy,
}: FilesViewProps) {
  const [expandedSection, setExpandedSection] = useState<string | null>('agents');
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [agentCategoryFilter, setAgentCategoryFilter] = useState<string | null>(null);

  // Get counts from config data
  const agentsCount = configData?.agents?.length ?? 0;
  const rulesCount = configData?.rules.length ?? 0;
  const skillsCount = configData?.skills.length ?? 0;
  const hooksCount = configData?.hooks.length ?? 0;
  const hasMcp = configData?.mcpConfig !== null;

  // Group agents by category
  const agentCategories = useMemo(() => {
    if (!configData?.agents) return [];
    const cats = new Map<string, number>();
    configData.agents.forEach(a => {
      cats.set(a.category, (cats.get(a.category) || 0) + 1);
    });
    return Array.from(cats.entries()).sort((a, b) => b[1] - a[1]);
  }, [configData?.agents]);

  const filteredAgents = useMemo(() => {
    if (!configData?.agents) return [];
    if (!agentCategoryFilter) return configData.agents;
    return configData.agents.filter(a => a.category === agentCategoryFilter);
  }, [configData?.agents, agentCategoryFilter]);

  const sections = [
    { id: 'agents', label: 'Agents', count: agentsCount, icon: '🤖' },
    { id: 'rules', label: 'Rules', count: rulesCount, icon: '📜' },
    { id: 'skills', label: 'Skills', count: skillsCount, icon: '⚡' },
    { id: 'hooks', label: 'Hooks', count: hooksCount, icon: '🪝' },
    { id: 'mcp', label: 'MCP Config', count: hasMcp ? 1 : 0, icon: '🔌' },
    { id: 'claudemd', label: 'CLAUDE.md', count: configData?.claudeMd ? 1 : 0, icon: '📄' },
  ];

  // Get current item content
  const getSelectedContent = useCallback((): { name: string; path: string; content: string; cmd?: string } | null => {
    if (!configData || !selectedItemId) return null;

    if (expandedSection === 'agents') {
      const agent = configData.agents?.find(a => a.id === selectedItemId);
      if (agent) return { name: agent.name, path: agent.path, content: agent.content, cmd: agent.cmd };
    } else if (expandedSection === 'rules') {
      const rule = configData.rules.find(r => r.id === selectedItemId);
      if (rule) return { name: rule.name, path: rule.path, content: rule.content };
    } else if (expandedSection === 'skills') {
      const skill = configData.skills.find(s => s.id === selectedItemId);
      if (skill) return { name: skill.name, path: skill.path, content: skill.content, cmd: skill.cmd };
    } else if (expandedSection === 'hooks') {
      const hook = configData.hooks.find(h => h.id === selectedItemId);
      if (hook) return { name: hook.name, path: hook.path, content: hook.content };
    }
    return null;
  }, [configData, selectedItemId, expandedSection]);

  const selectedContent = getSelectedContent();

  // Loading state
  if (configLoading) {
    return (
      <div className="h-full flex items-center justify-center text-white/40">
        Loading files...
      </div>
    );
  }

  // No data state
  if (!configData) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-white/40">
        <p className="mb-4">Files not loaded</p>
        <p className="text-xs text-white/30">Run <code className="bg-white/10 px-1.5 py-0.5 rounded">npm run bundle-config</code> to generate</p>
      </div>
    );
  }

  return (
    <div className="h-full flex">
      {/* Directory Sidebar */}
      <div className="w-44 flex-none border-r border-white/10 p-3 overflow-y-auto">
        <div className="text-[10px] uppercase tracking-wider text-white/30 mb-2 px-2">Directory</div>
        <div className="space-y-0.5">
          {sections.map(section => (
            <button
              key={section.id}
              onClick={() => {
                setExpandedSection(section.id);
                setSelectedItemId(null);
                setAgentCategoryFilter(null);
              }}
              className={`
                w-full flex items-center justify-between px-2 py-1.5 rounded text-left transition-colors text-sm
                ${expandedSection === section.id
                  ? 'bg-white/10 text-white'
                  : 'text-white/50 hover:text-white/80 hover:bg-white/5'}
              `}
            >
              <div className="flex items-center gap-2">
                <span className="text-xs">{section.icon}</span>
                <span className="font-medium">{section.label}</span>
              </div>
              <span className="text-xs text-white/30">{section.count}</span>
            </button>
          ))}
        </div>

        <div className="mt-4 pt-3 border-t border-white/10">
          <div className="text-[10px] uppercase tracking-wider text-white/30 mb-1 px-2">Updated</div>
          <div className="text-xs text-white/40 px-2">
            {new Date(configData.generatedAt).toLocaleTimeString()}
          </div>
        </div>
      </div>

      {/* File List */}
      <div className={`${selectedContent ? 'w-56' : 'w-64'} flex-none border-r border-white/10 overflow-y-auto`}>
        {/* Agents with category filter */}
        {expandedSection === 'agents' && configData.agents && (
          <div className="p-3">
            {/* Category filter chips */}
            <div className="flex flex-wrap gap-1 mb-3">
              <button
                onClick={() => setAgentCategoryFilter(null)}
                className={`px-2 py-1 text-xs rounded transition-colors ${
                  !agentCategoryFilter ? 'bg-white/20 text-white' : 'bg-white/5 text-white/50 hover:bg-white/10'
                }`}
              >
                All ({agentsCount})
              </button>
              {agentCategories.map(([cat, count]) => (
                <button
                  key={cat}
                  onClick={() => setAgentCategoryFilter(cat)}
                  className={`px-2 py-1 text-xs rounded transition-colors ${
                    agentCategoryFilter === cat ? 'bg-white/20 text-white' : 'bg-white/5 text-white/50 hover:bg-white/10'
                  }`}
                >
                  {AGENT_CATEGORIES[cat] || cat} ({count})
                </button>
              ))}
            </div>

            <div className="space-y-1">
              {filteredAgents.map(agent => (
                <button
                  key={agent.id}
                  onClick={() => setSelectedItemId(agent.id)}
                  className={`
                    w-full p-2 rounded text-left transition-all text-sm
                    ${selectedItemId === agent.id
                      ? 'bg-blue-500/20 text-white'
                      : 'hover:bg-white/5 text-white/70'}
                  `}
                >
                  <div className="flex items-center gap-2">
                    <span className="font-medium truncate">{agent.name}</span>
                  </div>
                  <code className="text-xs text-emerald-400/70">{agent.cmd}</code>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Rules */}
        {expandedSection === 'rules' && (
          <div className="p-3 space-y-1">
            {configData.rules.map(rule => (
              <button
                key={rule.id}
                onClick={() => setSelectedItemId(rule.id)}
                className={`
                  w-full p-2 rounded text-left transition-all text-sm
                  ${selectedItemId === rule.id
                    ? 'bg-blue-500/20 text-white'
                    : 'hover:bg-white/5 text-white/70'}
                `}
              >
                <div className="font-medium">{rule.name}</div>
                <code className="text-xs text-white/40 truncate block">{rule.path.split('/').pop()}</code>
              </button>
            ))}
          </div>
        )}

        {/* Skills */}
        {expandedSection === 'skills' && (
          <div className="p-3 space-y-1">
            {configData.skills.map(skill => (
              <button
                key={skill.id}
                onClick={() => setSelectedItemId(skill.id)}
                className={`
                  w-full p-2 rounded text-left transition-all text-sm
                  ${selectedItemId === skill.id
                    ? 'bg-blue-500/20 text-white'
                    : 'hover:bg-white/5 text-white/70'}
                `}
              >
                <div className="flex items-center gap-2">
                  <span className="font-medium">{skill.name}</span>
                  <code className="text-xs text-emerald-400 bg-emerald-500/10 px-1 rounded">{skill.cmd}</code>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Hooks */}
        {expandedSection === 'hooks' && (
          <div className="p-3 space-y-1">
            {configData.hooks.map(hook => (
              <button
                key={hook.id}
                onClick={() => setSelectedItemId(hook.id)}
                className={`
                  w-full p-2 rounded text-left transition-all text-sm
                  ${selectedItemId === hook.id
                    ? 'bg-blue-500/20 text-white'
                    : 'hover:bg-white/5 text-white/70'}
                `}
              >
                <div className="font-medium">{hook.name}</div>
                <code className="text-xs text-white/40">{hook.path.split('/').pop()}</code>
              </button>
            ))}
          </div>
        )}

        {/* MCP Config */}
        {expandedSection === 'mcp' && configData.mcpConfig && (
          <div className="p-3">
            <button
              onClick={() => setSelectedItemId('mcp')}
              className={`
                w-full p-2 rounded text-left transition-all text-sm
                ${selectedItemId === 'mcp'
                  ? 'bg-blue-500/20 text-white'
                  : 'hover:bg-white/5 text-white/70'}
              `}
            >
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="font-medium">.mcp.json</span>
              </div>
            </button>
          </div>
        )}

        {/* CLAUDE.md */}
        {expandedSection === 'claudemd' && configData.claudeMd && (
          <div className="p-3">
            <button
              onClick={() => setSelectedItemId('claudemd')}
              className={`
                w-full p-2 rounded text-left transition-all text-sm
                ${selectedItemId === 'claudemd'
                  ? 'bg-blue-500/20 text-white'
                  : 'hover:bg-white/5 text-white/70'}
              `}
            >
              <div className="font-medium">CLAUDE.md</div>
              <span className="text-xs text-white/40">Project configuration</span>
            </button>
          </div>
        )}
      </div>

      {/* Content Viewer */}
      <div className="flex-1 flex flex-col overflow-hidden bg-[#0d0d0d]">
        {/* Show selected content */}
        {selectedContent && (
          <>
            <div className="flex-none px-4 py-3 border-b border-white/10 flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-white/90">{selectedContent.name}</span>
                  {selectedContent.cmd && (
                    <code className="text-xs text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                      {selectedContent.cmd}
                    </code>
                  )}
                </div>
                <code className="text-xs text-white/40 truncate block">{selectedContent.path}</code>
              </div>
              <div className="flex items-center gap-2">
                {selectedContent.cmd && (
                  <button
                    onClick={() => onCopy(selectedContent.cmd!)}
                    className={`
                      px-3 py-1.5 text-xs font-medium rounded-md transition-colors
                      ${copiedCmd === selectedContent.cmd
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : 'bg-white/10 text-white/70 hover:bg-white/20'}
                    `}
                  >
                    {copiedCmd === selectedContent.cmd ? 'Copied!' : 'Copy Cmd'}
                  </button>
                )}
                <button
                  onClick={() => onCopy(selectedContent.content)}
                  className={`
                    px-3 py-1.5 text-xs font-medium rounded-md transition-colors
                    ${copiedCmd === selectedContent.content
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : 'bg-white/10 text-white/70 hover:bg-white/20'}
                  `}
                >
                  {copiedCmd === selectedContent.content ? 'Copied!' : 'Copy All'}
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-auto p-4">
              <pre className="text-sm text-white/80 font-mono whitespace-pre-wrap">{selectedContent.content}</pre>
            </div>
            <div className="flex-none px-4 py-2 border-t border-white/10 text-xs text-white/40">
              {selectedContent.content.split('\n').length} lines
            </div>
          </>
        )}

        {/* Show CLAUDE.md content */}
        {expandedSection === 'claudemd' && selectedItemId === 'claudemd' && configData.claudeMd && !selectedContent && (
          <>
            <div className="flex-none px-4 py-3 border-b border-white/10 flex items-center justify-between">
              <div>
                <div className="font-medium text-white/90">CLAUDE.md</div>
                <code className="text-xs text-white/40">Project root</code>
              </div>
              <button
                onClick={() => onCopy(configData.claudeMd!)}
                className={`
                  px-3 py-1.5 text-xs font-medium rounded-md transition-colors
                  ${copiedCmd === configData.claudeMd
                    ? 'bg-emerald-500/20 text-emerald-400'
                    : 'bg-white/10 text-white/70 hover:bg-white/20'}
                `}
              >
                {copiedCmd === configData.claudeMd ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <div className="flex-1 overflow-auto p-4">
              <pre className="text-sm text-white/80 font-mono whitespace-pre-wrap">{configData.claudeMd}</pre>
            </div>
          </>
        )}

        {/* Show MCP config */}
        {expandedSection === 'mcp' && selectedItemId === 'mcp' && configData.mcpConfig && !selectedContent && (
          <>
            <div className="flex-none px-4 py-3 border-b border-white/10 flex items-center justify-between">
              <div>
                <div className="font-medium text-white/90">MCP Configuration</div>
                <code className="text-xs text-white/40">.mcp.json</code>
              </div>
              <button
                onClick={() => onCopy(configData.mcpConfig!.content)}
                className={`
                  px-3 py-1.5 text-xs font-medium rounded-md transition-colors
                  ${copiedCmd === configData.mcpConfig!.content
                    ? 'bg-emerald-500/20 text-emerald-400'
                    : 'bg-white/10 text-white/70 hover:bg-white/20'}
                `}
              >
                {copiedCmd === configData.mcpConfig!.content ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <div className="flex-1 overflow-auto p-4">
              <pre className="text-sm text-white/80 font-mono whitespace-pre-wrap">{configData.mcpConfig.content}</pre>
            </div>
          </>
        )}

        {/* Empty state */}
        {!selectedItemId && (
          <div className="flex-1 flex items-center justify-center text-white/30 text-sm">
            Select a file to view its content
          </div>
        )}
      </div>
    </div>
  );
}
