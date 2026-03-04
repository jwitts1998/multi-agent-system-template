import {
  Card,
  CardContent,
  CardHeader,
} from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface SectionProps {
  title: string;
  children: React.ReactNode;
  defaultExpanded?: boolean;
}

export function Section({ title, children }: SectionProps) {
  return (
    <Card className="mb-5 border-slate-700/50 bg-slate-900/50">
      <CardHeader className="space-y-0 pb-2">
        <h3 className={cn(
          "text-[11px] font-semibold uppercase tracking-wider",
          "text-slate-400",
        )}>
          {title}
        </h3>
      </CardHeader>
      <CardContent className="pt-0">{children}</CardContent>
    </Card>
  );
}
