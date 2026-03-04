import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CloseButtonProps {
  onClick: () => void;
  label?: string;
}

export function CloseButton({ onClick, label = 'Close panel' }: CloseButtonProps) {
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={onClick}
      aria-label={label}
      className="shrink-0"
    >
      <X className="size-4" />
    </Button>
  );
}
