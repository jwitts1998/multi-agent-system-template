import { ScrollArea } from '@/components/ui/scroll-area';
import { CloseButton } from './CloseButton';
import { cn } from '@/lib/utils';

interface DetailPanelWrapperProps {
  width?: number;
  onClose: () => void;
  closeLabel?: string;
  header: React.ReactNode;
  children: React.ReactNode;
  ariaLabel: string;
}

export function DetailPanelWrapper({
  width = 420,
  onClose,
  closeLabel,
  header,
  children,
  ariaLabel,
}: DetailPanelWrapperProps) {
  return (
    <div
      role="region"
      aria-label={ariaLabel}
      className={cn(
        "absolute top-0 right-0 z-10 flex flex-col overflow-hidden",
        "bg-slate-800 border-l border-slate-600/80",
      )}
      style={{ width }}
    >
      <div
        className={cn(
          "flex items-start justify-between shrink-0",
          "border-b border-slate-600/80 px-5 py-4",
        )}
      >
        <div className="min-w-0 flex-1">{header}</div>
        <CloseButton onClick={onClose} label={closeLabel} />
      </div>
      <ScrollArea className="flex-1">
        <div className="p-4">{children}</div>
      </ScrollArea>
    </div>
  );
}
