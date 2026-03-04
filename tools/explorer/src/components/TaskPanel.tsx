import { useMemo, useCallback, useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';
import { Separator } from './ui/separator';
import yaml from 'js-yaml';

interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'todo' | 'in_progress' | 'done' | 'blocked';
  priority?: 'high' | 'medium' | 'low';
  agent_roles?: string[];
  acceptance_criteria?: string[];
  spec_refs?: string[];
}

interface TaskFile {
  epic?: string;
  description?: string;
  tasks: Task[];
}

interface TaskPanelProps {
  content: string;
  filename: string | null;
  onLoadFile: (content: string, filename: string) => void;
  onClear: () => void;
}

const STATUS_COLORS: Record<Task['status'], string> = {
  todo: 'bg-slate-600 text-slate-200',
  in_progress: 'bg-blue-600 text-blue-100',
  done: 'bg-green-600 text-green-100',
  blocked: 'bg-red-600 text-red-100',
};

const STATUS_ICONS: Record<Task['status'], string> = {
  todo: '○',
  in_progress: '◐',
  done: '●',
  blocked: '✕',
};

const PRIORITY_COLORS: Record<string, string> = {
  high: 'text-red-400',
  medium: 'text-amber-400',
  low: 'text-slate-400',
};

export function TaskPanel({ content, filename, onLoadFile, onClear }: TaskPanelProps) {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const taskFile = useMemo((): TaskFile | null => {
    if (!content.trim()) return null;
    try {
      const parsed = yaml.load(content) as TaskFile;
      return parsed;
    } catch (e) {
      console.error('Failed to parse task file:', e);
      return null;
    }
  }, [content]);

  const taskStats = useMemo(() => {
    if (!taskFile?.tasks) return null;
    const stats = { todo: 0, in_progress: 0, done: 0, blocked: 0, total: 0 };
    for (const task of taskFile.tasks) {
      stats[task.status]++;
      stats.total++;
    }
    return stats;
  }, [taskFile]);

  const handleFile = useCallback((file: File) => {
    setError(null);
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (ext !== 'yml' && ext !== 'yaml') {
      setError('Please select a .yml or .yaml task file');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      if (!text?.trim()) {
        setError('File is empty');
        return;
      }
      onLoadFile(text, file.name);
    };
    reader.onerror = () => setError('Failed to read file');
    reader.readAsText(file);
  }, [onLoadFile]);

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const onDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  }, [handleFile]);

  const onInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFile(e.target.files[0]);
    }
  }, [handleFile]);

  // Empty state with drop zone
  if (!taskFile) {
    return (
      <Card className="h-[350px]">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Tasks</CardTitle>
        </CardHeader>
        <CardContent>
          <div
            className={`
              flex flex-col items-center justify-center h-48
              border-2 border-dashed rounded-lg cursor-pointer transition-colors
              ${isDragging ? 'border-blue-500 bg-blue-500/10' : 'border-slate-600 hover:border-slate-500'}
            `}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".yml,.yaml"
              onChange={onInputChange}
              style={{ display: 'none' }}
            />
            <div className="text-3xl mb-2">📋</div>
            <p className="text-slate-300 font-medium text-sm">Load Task File</p>
            <p className="text-xs text-slate-500 mt-1">
              Drop a <code className="text-slate-400">.yml</code> file from <code className="text-slate-400">tasks/</code>
            </p>
            {error && <p className="text-xs text-red-400 mt-2">{error}</p>}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-[350px] flex flex-col">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between text-base">
          <div className="flex items-center gap-2">
            <span>Tasks</span>
            {filename && (
              <Badge variant="secondary" className="font-mono text-xs">
                {filename}
              </Badge>
            )}
          </div>
          <Button variant="ghost" size="sm" onClick={onClear} className="text-xs">
            ✕ Clear
          </Button>
        </CardTitle>

        {/* Epic info */}
        {taskFile.epic && (
          <p className="text-sm text-slate-400 truncate">{taskFile.epic}</p>
        )}

        {/* Stats */}
        {taskStats && (
          <div className="flex gap-3 mt-2 text-xs">
            <span className="text-slate-400">
              {taskStats.done}/{taskStats.total} complete
            </span>
            {taskStats.in_progress > 0 && (
              <span className="text-blue-400">{taskStats.in_progress} in progress</span>
            )}
            {taskStats.blocked > 0 && (
              <span className="text-red-400">{taskStats.blocked} blocked</span>
            )}
          </div>
        )}
      </CardHeader>

      <Separator />

      <CardContent className="flex-1 overflow-hidden p-0">
        <ScrollArea className="h-full">
          <div className="p-3 space-y-1">
            {taskFile.tasks.map((task) => (
              <div
                key={task.id}
                className={`
                  p-2 rounded-md cursor-pointer transition-colors
                  ${selectedTask?.id === task.id ? 'bg-slate-700' : 'hover:bg-slate-800'}
                `}
                onClick={() => setSelectedTask(selectedTask?.id === task.id ? null : task)}
              >
                <div className="flex items-start gap-2">
                  <span className="text-sm mt-0.5" title={task.status}>
                    {STATUS_ICONS[task.status]}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-slate-200 truncate">{task.title}</span>
                      {task.priority && (
                        <span className={`text-xs ${PRIORITY_COLORS[task.priority]}`}>
                          {task.priority === 'high' ? '↑' : task.priority === 'low' ? '↓' : '–'}
                        </span>
                      )}
                    </div>

                    {/* Expanded details */}
                    {selectedTask?.id === task.id && (
                      <div className="mt-2 space-y-2 text-xs">
                        {task.description && (
                          <p className="text-slate-400">{task.description}</p>
                        )}
                        {task.agent_roles && task.agent_roles.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {task.agent_roles.map((role) => (
                              <Badge key={role} variant="outline" className="text-xs">
                                {role}
                              </Badge>
                            ))}
                          </div>
                        )}
                        {task.acceptance_criteria && task.acceptance_criteria.length > 0 && (
                          <div className="text-slate-500">
                            <span className="font-medium">Acceptance:</span>
                            <ul className="list-disc list-inside mt-1">
                              {task.acceptance_criteria.slice(0, 3).map((c, i) => (
                                <li key={i} className="truncate">{c}</li>
                              ))}
                              {task.acceptance_criteria.length > 3 && (
                                <li className="text-slate-600">+{task.acceptance_criteria.length - 3} more</li>
                              )}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  <Badge className={`${STATUS_COLORS[task.status]} text-xs shrink-0`}>
                    {task.status.replace('_', ' ')}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
