import { useCallback, useState, useRef } from 'react';

interface FileDropZoneProps {
  onFileLoaded: (content: string, filename: string) => void;
}

export function FileDropZone({ onFileLoaded }: FileDropZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback((file: File) => {
    setError(null);
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (ext !== 'jsonl' && ext !== 'txt') {
      setError('Please drop a .jsonl or .txt transcript file');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      if (!content?.trim()) {
        setError('File is empty');
        return;
      }
      onFileLoaded(content, file.name);
    };
    reader.onerror = () => setError('Failed to read file');
    reader.readAsText(file);
  }, [onFileLoaded]);

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

  return (
    <div
      className={`file-drop-zone ${isDragging ? 'dragging' : ''}`}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      onClick={() => fileInputRef.current?.click()}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept=".jsonl,.txt"
        onChange={onInputChange}
        style={{ display: 'none' }}
      />
      <div className="file-drop-icon">{isDragging ? '\u{1F4E5}' : '\u{1F4CA}'}</div>
      <div className="file-drop-title">
        {isDragging ? 'Drop transcript here' : 'Load Agent Session'}
      </div>
      <div className="file-drop-subtitle">
        Drop a <code>.jsonl</code> or <code>.txt</code> transcript file, or click to browse
      </div>
      <div className="file-drop-hint">
        Transcripts are in <code>agent-transcripts/</code>
      </div>
      {error && <div className="file-drop-error">{error}</div>}
    </div>
  );
}
