interface HeaderProps {
  onNewTask: () => void;
  userEmail: string | null;
  onSignOut: () => Promise<void>;
}

export function Header({ onNewTask, userEmail, onSignOut }: HeaderProps) {
  return (
    <header style={{
      position: 'sticky', top: 0, zIndex: 50,
      background: 'rgba(10,10,15,.85)', backdropFilter: 'blur(12px)',
      borderBottom: '1px solid var(--border)',
      padding: '0 24px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      height: 64,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{
          width: 32, height: 32, borderRadius: 8,
          background: 'linear-gradient(135deg, var(--accent), var(--accent2))',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 16, fontWeight: 800, color: '#fff',
        }}>T</div>
        <span style={{ fontSize: 18, fontWeight: 700, letterSpacing: '-.02em' }}>
          Task<span style={{ color: 'var(--accent)' }}>Notes</span>
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 12, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '.06em' }}>
            Signed in
          </div>
          <div style={{ fontSize: 13, color: 'var(--text2)', maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {userEmail ?? 'Unknown user'}
          </div>
        </div>
        <button
          onClick={onSignOut}
          style={{
            padding: '8px 12px',
            background: 'transparent',
            color: 'var(--text2)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius)',
            fontSize: 13,
          }}
        >
          Sign Out
        </button>
        <button
          onClick={onNewTask}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '8px 18px',
            background: 'var(--accent)', color: '#fff',
            border: 'none', borderRadius: 'var(--radius)',
            fontSize: 14, fontWeight: 600,
            transition: 'background .15s, transform .1s',
          }}
          onMouseEnter={e => (e.currentTarget.style.background = 'var(--accent2)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'var(--accent)')}
          onMouseDown={e => (e.currentTarget.style.transform = 'scale(.97)')}
          onMouseUp={e => (e.currentTarget.style.transform = 'scale(1)')}
        >
          <span style={{ fontSize: 18, lineHeight: 1 }}>+</span> New Task
        </button>
      </div>
    </header>
  );
}
