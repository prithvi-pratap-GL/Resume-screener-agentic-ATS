import { useEffect, useState } from 'react';
import { getCandidates, getRoles } from '../../lib/api';
import { Badge, ScoreBar, Avatar, Spinner, EmptyState } from '../layout/UI.jsx';
import CandidateDetail from './CandidateDetail.jsx';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import './CandidatesPage.css';

const AVATAR_COLORS = [
  ['#E6F1FB','#0C447C'],['#E1F5EE','#085041'],['#FAEEDA','#633806'],
  ['#FBEAF0','#72243E'],['#EEEDFE','#3C3489'],['#EAF3DE','#27500A'],
];

export default function CandidatesPage() {
  const [candidates, setCandidates] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    Promise.all([getCandidates(), getRoles()]).then(([c, r]) => {
      setCandidates(c); setRoles(r); setLoading(false);
    });
  }, []);

  const filtered = candidates.filter(c => {
    const matchSearch = !search || c.name?.toLowerCase().includes(search.toLowerCase()) || c.role_title?.toLowerCase().includes(search.toLowerCase());
    const matchRole = !roleFilter || c.role_id === roleFilter;
    const matchStatus = !statusFilter || c.status === statusFilter;
    return matchSearch && matchRole && matchStatus;
  });

  if (loading) return <div className="center-fill"><Spinner /></div>;

  return (
    <div className="page">
      <div className="topbar">
        <div className="page-title">All candidates <span className="count-pill">{filtered.length}</span></div>
        <div style={{ display:'flex', gap:8 }}>
          <div className="search-box">
            <Search size={13} color="#aaa" />
            <input placeholder="Search name or role…" value={search} onChange={e => setSearch(e.target.value)} />
            {search && <button onClick={() => setSearch('')}><X size={12} /></button>}
          </div>
          <select className="filter-select" value={roleFilter} onChange={e => setRoleFilter(e.target.value)}>
            <option value="">All roles</option>
            {roles.map(r => <option key={r.id} value={r.id}>{r.title}</option>)}
          </select>
          <select className="filter-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="">All statuses</option>
            <option>Shortlisted</option>
            <option>Rejected</option>
          </select>
        </div>
      </div>

      <div className="content" style={{ padding: 0, display:'flex', flex:1, overflow:'hidden' }}>
        <div className="candidates-table-wrap">
          <div className="table-head-full">
            <div />
            <div>Candidate</div>
            <div>Role</div>
            <div>Match score</div>
            <div>Skills</div>
            <div>Experience</div>
            <div>Status</div>
          </div>

          {filtered.length === 0
            ? <EmptyState icon="🔍" title="No candidates match" desc="Try adjusting your filters" />
            : filtered.map((c, i) => {
                const [bg, fg] = AVATAR_COLORS[i % AVATAR_COLORS.length];
                const skills = (c.analysis?.skills_found || []).slice(0, 3);
                return (
                  <div
                    key={c.id}
                    className={`cand-row-full${selected?.id === c.id ? ' selected' : ''}`}
                    onClick={() => setSelected(selected?.id === c.id ? null : c)}
                  >
                    <Avatar name={c.name} bg={bg} color={fg} />
                    <div>
                      <div className="cname">{c.name}</div>
                      <div style={{ fontSize:11, color:'#aaa' }}>{new Date(c.created_at).toLocaleDateString()}</div>
                    </div>
                    <div style={{ fontSize:12, color:'#555' }}>{c.role_title}</div>
                    <ScoreBar value={c.score?.overall ?? 0} />
                    <div className="skill-pills">
                      {skills.map(s => <span key={s} className="skill-pill">{s}</span>)}
                      {(c.analysis?.skills_found?.length ?? 0) > 3 && (
                        <span className="skill-pill">+{c.analysis.skills_found.length - 3}</span>
                      )}
                    </div>
                    <div style={{ fontSize:12, color:'#888' }}>
                      {c.analysis?.years_experience != null ? `${c.analysis.years_experience} yrs` : '—'}
                    </div>
                    <Badge status={c.status} />
                  </div>
                );
              })
          }
        </div>

        {selected && (
          <div className="detail-drawer">
            <div className="drawer-close-row">
              <span style={{ fontSize:12, color:'#888' }}>Candidate detail</span>
              <button className="icon-close" onClick={() => setSelected(null)}><X size={14} /></button>
            </div>
            <CandidateDetail candidate={selected} />
          </div>
        )}
      </div>
    </div>
  );
}