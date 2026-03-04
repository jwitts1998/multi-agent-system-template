import { useState, useCallback, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Separator } from './ui/separator';

interface DocFile {
  name: string;
  path: string;
  category: 'pdb' | 'architecture' | 'api' | 'other';
  exists: boolean;
}

// Expected documentation structure from the template
const EXPECTED_DOCS: Omit<DocFile, 'exists'>[] = [
  // Product Design Blueprint
  { name: 'Product Overview', path: 'docs/product_design/00_PRODUCT_OVERVIEW.md', category: 'pdb' },
  { name: 'User Research', path: 'docs/product_design/01_USER_RESEARCH.md', category: 'pdb' },
  { name: 'Problem Definition', path: 'docs/product_design/02_PROBLEM_DEFINITION.md', category: 'pdb' },
  { name: 'Solution Design', path: 'docs/product_design/03_SOLUTION_DESIGN.md', category: 'pdb' },
  { name: 'User Experience', path: 'docs/product_design/04_USER_EXPERIENCE.md', category: 'pdb' },
  { name: 'Technical Specs', path: 'docs/product_design/05_TECHNICAL_SPECIFICATIONS.md', category: 'pdb' },
  { name: 'Development Plan', path: 'docs/product_design/06_DEVELOPMENT_PLAN.md', category: 'pdb' },
  { name: 'Success Metrics', path: 'docs/product_design/07_SUCCESS_METRICS.md', category: 'pdb' },

  // Architecture
  { name: 'Architecture Overview', path: 'docs/architecture/ARCHITECTURE.md', category: 'architecture' },
  { name: 'API Design', path: 'docs/architecture/API_DESIGN.md', category: 'api' },
  { name: 'Data Models', path: 'docs/architecture/DATA_MODELS.md', category: 'architecture' },

  // Other
  { name: 'CLAUDE.md', path: 'CLAUDE.md', category: 'other' },
  { name: 'README', path: 'README.md', category: 'other' },
];

const CATEGORY_LABELS: Record<DocFile['category'], string> = {
  pdb: 'Product Design Blueprint',
  architecture: 'Architecture',
  api: 'API',
  other: 'Project',
};

interface GitInfo {
  branch: string;
  lastCommit: string;
  uncommittedChanges: number;
}

export function ProjectStatusPanel() {
  const [loadedDocs, setLoadedDocs] = useState<DocFile[]>([]);
  const [gitInfo, setGitInfo] = useState<GitInfo | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // For now, we show the expected structure with unknown status
  // In a real implementation, this would check against loaded files or a backend
  const docs: DocFile[] = loadedDocs.length > 0
    ? loadedDocs
    : EXPECTED_DOCS.map(d => ({ ...d, exists: false }));

  const pdbDocs = docs.filter(d => d.category === 'pdb');
  const archDocs = docs.filter(d => d.category === 'architecture' || d.category === 'api');
  const otherDocs = docs.filter(d => d.category === 'other');

  const pdbComplete = pdbDocs.filter(d => d.exists).length;
  const archComplete = archDocs.filter(d => d.exists).length;

  const handleFile = useCallback((file: File) => {
    // Handle a project status JSON file or git info file
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        if (data.docs) {
          setLoadedDocs(data.docs);
        }
        if (data.git) {
          setGitInfo(data.git);
        }
      } catch {
        console.error('Failed to parse status file');
      }
    };
    reader.readAsText(file);
  }, []);

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

  return (
    <Card className="h-[350px] flex flex-col">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between text-base">
          <span>Project Status</span>
          <div className="flex gap-2">
            <Badge variant="outline" className="text-xs">
              PDB: {pdbComplete}/{pdbDocs.length}
            </Badge>
            <Badge variant="outline" className="text-xs">
              Arch: {archComplete}/{archDocs.length}
            </Badge>
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="flex-1 overflow-auto space-y-4">
        {/* Git Status */}
        <div
          className={`
            p-3 rounded-lg border transition-colors
            ${isDragging ? 'border-blue-500 bg-blue-500/10' : 'border-slate-700 bg-slate-800/50'}
          `}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
            style={{ display: 'none' }}
          />

          {gitInfo ? (
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="text-sm">🌿</span>
                <span className="text-sm font-medium text-slate-200">{gitInfo.branch}</span>
                {gitInfo.uncommittedChanges > 0 && (
                  <Badge variant="secondary" className="text-xs">
                    {gitInfo.uncommittedChanges} changes
                  </Badge>
                )}
              </div>
              <p className="text-xs text-slate-500 truncate">
                Last: {gitInfo.lastCommit}
              </p>
            </div>
          ) : (
            <div
              className="text-center cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              <p className="text-sm text-slate-400">📊 Drop status.json to load project info</p>
              <p className="text-xs text-slate-600 mt-1">
                Generate with: <code className="text-slate-500">./scripts/project-status.sh</code>
              </p>
            </div>
          )}
        </div>

        <Separator />

        {/* Documentation Checklist */}
        <div className="space-y-3">
          {/* PDB Section */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-medium text-slate-400 uppercase tracking-wide">
                {CATEGORY_LABELS.pdb}
              </span>
              <span className="text-xs text-slate-500">{pdbComplete}/{pdbDocs.length}</span>
            </div>
            <div className="grid grid-cols-2 gap-1">
              {pdbDocs.map((doc) => (
                <div
                  key={doc.path}
                  className={`
                    text-xs px-2 py-1 rounded flex items-center gap-1.5
                    ${doc.exists ? 'text-green-400 bg-green-900/20' : 'text-slate-500 bg-slate-800/50'}
                  `}
                >
                  <span>{doc.exists ? '✓' : '○'}</span>
                  <span className="truncate">{doc.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Architecture Section */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-medium text-slate-400 uppercase tracking-wide">
                Architecture & API
              </span>
              <span className="text-xs text-slate-500">{archComplete}/{archDocs.length}</span>
            </div>
            <div className="grid grid-cols-2 gap-1">
              {archDocs.map((doc) => (
                <div
                  key={doc.path}
                  className={`
                    text-xs px-2 py-1 rounded flex items-center gap-1.5
                    ${doc.exists ? 'text-green-400 bg-green-900/20' : 'text-slate-500 bg-slate-800/50'}
                  `}
                >
                  <span>{doc.exists ? '✓' : '○'}</span>
                  <span className="truncate">{doc.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Other Docs */}
          <div className="flex gap-2">
            {otherDocs.map((doc) => (
              <Badge
                key={doc.path}
                variant={doc.exists ? 'default' : 'outline'}
                className={`text-xs ${doc.exists ? 'bg-green-900/50 text-green-300' : 'text-slate-500'}`}
              >
                {doc.exists ? '✓' : '○'} {doc.name}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
