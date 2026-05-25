import { useEffect, useState } from 'react';
import { getCandidates, getRoles } from '../../lib/api';
import { Spinner } from '../layout/UI';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, CartesianGrid, Legend,
  FunnelChart, Funnel, LabelList, Cell,
} from 'recharts';
import './ReportsPage.css';

const BLUE = '#185FA5';
const GREEN = '#1D9E75';
const AMBER = '#BA7517';

export default function ReportsPage() {
  const [candidates, setCandidates] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getCandidates(), getRoles()]).then(([c, r]) => {
      setCandidates(c); setRoles(r); setLoading(false);
    });
  }, []);

  if (loading) return <div className="center-fill"><Spinner /></div>;

  // --- Funnel data ---
  const shortlisted = candidates.filter(c => c.status === 'Shortlisted');
  const withInterviews = candidates.filter(c => c.interview_questions?.length > 0);
  const funnelData = [
    { name: 'Uploaded',   value: candidates.length,        fill: '#185FA5' },
    { name: 'Screened',   value: candidates.length,        fill: '#2E7BC4' },
    { name: 'Shortlisted',value: shortlisted.length,       fill: '#1D9E75' },
    { name: 'Interviewed',value: withInterviews.length,    fill: '#BA7517' },
  ];

  // --- Score distribution ---
  const buckets = { '0–40':0, '41–60':0, '61–74':0, '75–84':0, '85–100':0 };
  candidates.forEach(c => {
    const s = c.score?.overall ?? 0;
    if (s <= 40) buckets['0–40']++;
    else if (s <= 60) buckets['41–60']++;
    else if (s <= 74) buckets['61–74']++;
    else if (s <= 84) buckets['75–84']++;
    else buckets['85–100']++;
  });
  const scoreDistData = Object.entries(buckets).map(([name, count]) => ({ name, count }));

  // --- Per-role breakdown ---
  const roleBreakdown = roles.map(r => {
    const rc = candidates.filter(c => c.role_id === r.id);
    const sl = rc.filter(c => c.status === 'Shortlisted');
    return {
      name: r.title.length > 20 ? r.title.slice(0, 18) + '…' : r.title,
      total: rc.length,
      shortlisted: sl.length,
      avgScore: rc.length ? Math.round(rc.reduce((a,c) => a + (c.score?.overall||0), 0) / rc.length) : 0,
    };
  });

  // --- Screening over time (last 7 days) ---
  const dayMap = {};
  for (let i = 6; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i);
    dayMap[d.toISOString().slice(0,10)] = { date: d.toLocaleDateString('en',{weekday:'short'}), screened:0, shortlisted:0 };
  }
  candidates.forEach(c => {
    const day = c.created_at?.slice(0,10);
    if (dayMap[day]) {
      dayMap[day].screened++;
      if (c.status === 'Shortlisted') dayMap[day].shortlisted++;
    }
  });
  const timelineData = Object.values(dayMap);

  const statCards = [
    { label: 'Total screened',     value: candidates.length },
    { label: 'Shortlisted',        value: shortlisted.length },
    { label: 'Rejection rate',     value: candidates.length ? `${Math.round(((candidates.length - shortlisted.length) / candidates.length) * 100)}%` : '—' },
    { label: 'Avg score',          value: candidates.length ? `${Math.round(candidates.reduce((a,c)=>a+(c.score?.overall||0),0)/candidates.length)}%` : '—' },
  ];

  return (
    <div className="page">
      <div className="topbar">
        <div className="page-title">Reports & analytics</div>
        <button className="btn" onClick={() => {
          const csv = ['Name,Role,Score,Status,Skills'].concat(
            candidates.map(c => `"${c.name}","${c.role_title}",${c.score?.overall??0},${c.status},"${(c.analysis?.skills_found||[]).join('; ')}"`)
          ).join('\n');
          const a = document.createElement('a');
          a.href = 'data:text/csv,' + encodeURIComponent(csv);
          a.download = 'screen-u-report.csv';
          a.click();
        }}>Export CSV</button>
      </div>

      <div className="content">
        <div className="stat-cards">
          {statCards.map(s => (
            <div key={s.label} className="stat-card">
              <div className="stat-label">{s.label}</div>
              <div className="stat-value">{s.value}</div>
            </div>
          ))}
        </div>

        <div className="charts-grid">
          {/* Funnel */}
          <div className="chart-card" style={{ gridColumn: 'span 1' }}>
            <div className="chart-title">Screening funnel</div>
            {candidates.length === 0
              ? <div className="no-data">No data yet</div>
              : <ResponsiveContainer width="100%" height={200}>
                  <FunnelChart>
                    <Tooltip formatter={(v) => [v, 'Candidates']} />
                    <Funnel dataKey="value" data={funnelData} isAnimationActive>
                      {funnelData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                      <LabelList position="right" fill="#555" stroke="none" dataKey="name" fontSize={12} />
                    </Funnel>
                  </FunnelChart>
                </ResponsiveContainer>
            }
          </div>

          {/* Score distribution */}
          <div className="chart-card">
            <div className="chart-title">Score distribution</div>
            {candidates.length === 0
              ? <div className="no-data">No data yet</div>
              : <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={scoreDistData} barSize={28}>
                    <XAxis dataKey="name" tick={{ fontSize:11 }} />
                    <YAxis allowDecimals={false} tick={{ fontSize:11 }} width={28} />
                    <Tooltip />
                    <Bar dataKey="count" fill={BLUE} radius={[4,4,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
            }
          </div>

          {/* Timeline */}
          <div className="chart-card" style={{ gridColumn: 'span 2' }}>
            <div className="chart-title">Screenings over last 7 days</div>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={timelineData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0efe9" />
                <XAxis dataKey="date" tick={{ fontSize:11 }} />
                <YAxis allowDecimals={false} tick={{ fontSize:11 }} width={28} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize:12 }} />
                <Line type="monotone" dataKey="screened"    stroke={BLUE}  strokeWidth={2} dot={false} name="Screened" />
                <Line type="monotone" dataKey="shortlisted" stroke={GREEN} strokeWidth={2} dot={false} name="Shortlisted" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Per-role breakdown */}
          <div className="chart-card" style={{ gridColumn: 'span 2' }}>
            <div className="chart-title">Breakdown by role</div>
            {roleBreakdown.length === 0
              ? <div className="no-data">No roles yet</div>
              : <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={roleBreakdown} barSize={20}>
                    <XAxis dataKey="name" tick={{ fontSize:11 }} />
                    <YAxis allowDecimals={false} tick={{ fontSize:11 }} width={28} />
                    <Tooltip />
                    <Legend wrapperStyle={{ fontSize:12 }} />
                    <Bar dataKey="total"       fill="#ddd"   radius={[4,4,0,0]} name="Total" />
                    <Bar dataKey="shortlisted" fill={GREEN}  radius={[4,4,0,0]} name="Shortlisted" />
                    <Bar dataKey="avgScore"    fill={AMBER}  radius={[4,4,0,0]} name="Avg score" />
                  </BarChart>
                </ResponsiveContainer>
            }
          </div>
        </div>
      </div>
    </div>
  );
}