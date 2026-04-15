import { TaskFilter } from '../types';

interface FilterBarProps {
  filter: TaskFilter;
  counts: Record<TaskFilter, number>;
  onChange: (f: TaskFilter) => void;
  search: string;
  onSearchChange: (value: string) => void;
}

const TABS: { key: TaskFilter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'pending', label: 'Pending' },
  { key: 'completed', label: 'Completed' },
];

export function FilterBar({ filter, counts, onChange, search, onSearchChange }: FilterBarProps) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: 14,
      padding: '20px 24px 0',
    }}>
      <input
        value={search}
        onChange={(event) => onSearchChange(event.target.value)}
        placeholder="Search titles, descriptions, and notes…"
        style={{
          width: '100%',
          padding: '12px 14px',
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius)',
          color: 'var(--text)',
          fontSize: 14,
        }}
      />
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {TABS.map(({ key, label }) => {
          const active = filter === key;
          return (
            <button
              key={key}
              onClick={() => onChange(key)}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '7px 16px',
                background: active ? 'var(--accent)' : 'var(--surface2)',
                border: `1px solid ${active ? 'var(--accent)' : 'var(--border)'}`,
                borderRadius: 100,
                color: active ? '#fff' : 'var(--text2)',
                fontSize: 13, fontWeight: active ? 600 : 400,
                transition: 'all .15s',
              }}
            >
              {label}
              <span style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                minWidth: 20, height: 20, padding: '0 5px',
                background: active ? 'rgba(255,255,255,.2)' : 'var(--border2)',
                borderRadius: 100,
                fontSize: 11, fontWeight: 600,
                fontFamily: 'var(--mono)',
              }}>
                {counts[key]}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
