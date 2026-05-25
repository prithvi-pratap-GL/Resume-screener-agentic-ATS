import './UI.css';

export function Badge({ status }) {
  const map = {
    Shortlisted: 'badge-green',
    Rejected:    'badge-red',
    'In review': 'badge-blue',
    Pending:     'badge-amber',
    Draft:       'badge-blue',
    Active:      'badge-green',
  };
  return <span className={`badge ${map[status] || 'badge-blue'}`}>{status}</span>;
}

export function ScoreBar({ value, color = '#185FA5' }) {
  return (
    <div className="score-bar-wrap">
      <div className="score-bar-track">
        <div className="score-bar-fill" style={{ width: `${value}%`, background: color }} />
      </div>
      <span className="score-bar-num">{value}</span>
    </div>
  );
}

export function MetricCard({ label, value, delta, deltaColor }) {
  return (
    <div className="metric-card">
      <div className="metric-label">{label}</div>
      <div className="metric-value">{value}</div>
      {delta && <div className="metric-delta" style={{ color: deltaColor || '#1D9E75' }}>{delta}</div>}
    </div>
  );
}

export function Avatar({ name = '?', bg = '#E6F1FB', color = '#0C447C' }) {
  const initials = name.split(' ').filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase();
  return (
    <div className="avatar" style={{ background: bg, color }}>
      {initials || '?'}
    </div>
  );
}

export function ScoreRing({ value, label, color = '#185FA5' }) {
  return (
    <div className="score-ring">
      <div className="score-ring-circle" style={{ borderColor: color }}>
        <span className="score-ring-val" style={{ color }}>{value}</span>
      </div>
      <div className="score-ring-lbl">{label}</div>
    </div>
  );
}

export function Spinner() {
  return <div className="spinner" />;
}

export function EmptyState({ icon, title, desc, action }) {
  return (
    <div className="empty-state">
      <div className="empty-icon">{icon}</div>
      <div className="empty-title">{title}</div>
      <div className="empty-desc">{desc}</div>
      {action}
    </div>
  );
}