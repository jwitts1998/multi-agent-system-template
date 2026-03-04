import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface StatCardProps {
  label: string;
  value: string | number;
  color: string;
}

export function StatCard({ label, value, color }: StatCardProps) {
  return (
    <Card
      className={cn(
        "border-slate-700/50 bg-slate-900/50 border-l-4",
      )}
      style={{ borderLeftColor: color }}
    >
      <CardContent className="p-2.5">
        <div className="text-lg font-bold text-slate-100 font-mono">
          {value}
        </div>
        <div className="text-[10px] uppercase tracking-wider text-slate-500">
          {label}
        </div>
      </CardContent>
    </Card>
  );
}
