import { Task, TaskFilter } from '../types';
import { MonthlyCheckInPanel } from './MonthlyCheckInPanel';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { BarChartIcon, CalendarDaysIcon, PlusIcon, SlidersIcon } from './ui/Icons';

interface InsightsPanelProps {
  checkInStorageKey: string;
  tasks: Task[];
  dueTodayCount: number;
  urgentCount: number;
  onCreateTask: () => void;
  onFilterChange: (filter: TaskFilter) => void;
  onNotify?: (message: string, tone?: 'success' | 'error' | 'info') => void;
}

function getTrendData(tasks: Task[]) {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - 6);

  return Array.from({ length: 7 }).map((_, index) => {
    const day = new Date(start);
    day.setDate(start.getDate() + index);
    const nextDay = new Date(day);
    nextDay.setDate(day.getDate() + 1);

    const count = tasks.filter((task) => {
      const updatedAt = new Date(task.updatedAt);
      return updatedAt >= day && updatedAt < nextDay;
    }).length;

    return {
      label: day.toLocaleDateString('en-US', { weekday: 'short' }),
      count,
    };
  });
}

export function InsightsPanel({
  checkInStorageKey,
  tasks,
  dueTodayCount: _dueTodayCount,
  urgentCount: _urgentCount,
  onCreateTask,
  onFilterChange,
  onNotify,
}: InsightsPanelProps) {
  const trend = getTrendData(tasks);
  const maxTrend = Math.max(...trend.map((item) => item.count), 1);

  return (
    <div className="space-y-8">
      <div className="mx-auto w-full max-w-[1200px]">
        <MonthlyCheckInPanel
          storageKey={checkInStorageKey}
          tasks={tasks}
          title="End-of-day reflection"
          submitLabel="Submit response"
          quoteLabel="Appreciation after submit"
          onNotify={onNotify}
        />
      </div>

      <div className="mx-auto grid w-full max-w-[1200px] gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)]">
        <Card className="rounded-[28px] p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--text-muted)]">
                Weekly productivity
              </p>
              <h3 className="mt-2 text-lg font-semibold text-[var(--text-primary)]">Momentum trend</h3>
            </div>
            <div className="rounded-2xl bg-[var(--surface-secondary)] p-2 text-[var(--text-secondary)]">
              <BarChartIcon width={18} height={18} />
            </div>
          </div>

          <div className="mt-6 grid grid-cols-7 items-end gap-2">
            {trend.map((item) => (
              <div key={item.label} className="flex flex-col items-center gap-2">
                <div className="flex h-28 w-full items-end rounded-full bg-[var(--surface-secondary)] p-1">
                  <div
                    className="w-full rounded-full bg-gradient-to-t from-[var(--accent-strong)] to-[var(--accent)] transition-all duration-200"
                    style={{ height: `${Math.max(14, (item.count / maxTrend) * 100)}%` }}
                  />
                </div>
                <span className="text-[11px] font-medium text-[var(--text-muted)]">{item.label}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="rounded-[28px] p-5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--text-muted)]">
            Quick actions
          </p>
          <div className="mt-4 grid gap-3">
            <Button className="h-12 justify-start text-base shadow-[var(--shadow-md)]" onClick={onCreateTask}>
              <PlusIcon width={16} height={16} />
              Add task
            </Button>
            <Button variant="secondary" className="h-11 justify-start" onClick={() => onFilterChange('pending')}>
              <SlidersIcon width={16} height={16} />
              Filter active tasks
            </Button>
            <Button variant="secondary" className="h-11 justify-start" onClick={() => onFilterChange('completed')}>
              <CalendarDaysIcon width={16} height={16} />
              View completed lane
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
