import { TaskFilter, TaskSort } from '../types';
import { Input } from './ui/Input';
import { SearchIcon } from './ui/Icons';

interface FilterBarProps {
  filter: TaskFilter;
  counts: Record<TaskFilter, number>;
  onChange: (f: TaskFilter) => void;
  search: string;
  onSearchChange: (value: string) => void;
  sort: TaskSort;
  onSortChange: (value: TaskSort) => void;
}

const TABS: { key: TaskFilter; label: string }[] = [
  { key: 'all', label: 'All tasks' },
  { key: 'pending', label: 'In progress' },
  { key: 'completed', label: 'Completed' },
];

export function FilterBar({
  filter,
  counts,
  onChange,
  search,
  onSearchChange,
  sort,
  onSortChange,
}: FilterBarProps) {
  return (
    <div className="toolbar">
      <div className="toolbar-top">
        <Input
          label="Search tasks"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search titles, descriptions, priorities, and notes"
          icon={<SearchIcon width={16} height={16} />}
        />

        <label className="field">
          <span className="field-label">Sort by</span>
          <span className="field-control">
            <select className="field-input select-input" value={sort} onChange={(event) => onSortChange(event.target.value as TaskSort)}>
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
              <option value="priority">Priority</option>
              <option value="due-soon">Due soon</option>
              <option value="alphabetical">Alphabetical</option>
            </select>
          </span>
        </label>
      </div>

      <div className="pill-row" role="tablist" aria-label="Filter tasks by status">
        {TABS.map(({ key, label }) => {
          const active = filter === key;
          return (
            <button
              key={key}
              className={`pill ${active ? 'pill-active' : ''}`}
              onClick={() => onChange(key)}
              role="tab"
              aria-selected={active}
            >
              <span>{label}</span>
              <span className="pill-count">{counts[key]}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
