import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getStats, getCandidates, getRoles } from '../../lib/api';
import { MetricCard, Badge, ScoreBar, Avatar, Spinner, EmptyState } from '../layout/UI';
import { Upload, RefreshCw } from 'lucide-react';
import CandidateDetail from '../candidates/CandidateDetail';
import './Dashboard.css';

const AVATAR_COLORS = [
  ['#E6F1FB','#0C447C'],['#E1F5EE','#085041'],['#FAEEDA','#633806'],
  ['#FBEAF0','#72243E'],['#EEEDFE','#3C3489'],['#FCEBEB','#791F1F'],
];

export default function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [roles, setRoles] = useState([]);
  const [selected, setSelected] = useState(null);
  const [filter, setFilter] = useState('All');
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const [s, c, r] = await Promise.all([getStats(), getCandidates(), getRoles()]);
    setStats(s); setCandidates(c); setRoles(r);
    if (c.length > 0 && !selected) setSelected(c[0]);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const filtered = candidates.filter(c =>
    filter === 'All' ? true : c.status === filter
  );

  if (loading) return <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'60vh'}}><Spinner /></div>;

  return (
    <div className="page">
      <div className="topbar">
        <div className="page-title">Candidate pipeline</div>
        <div className="topbar-actions">
          <button className="btn" onClick={load}><RefreshCw size={14}/> Refresh</button>
          <button className="btn btn-primary" onClick={() => navigate('/upload')}><Upload size={14}/> Upload resumes</button>
        </div>
      </div>

      <div className="content">
        <div className="metrics-grid">
          <MetricCard label="Total resumes" value={stats?.total_resumes ?? 0} delta={`${roles.length} active role${roles.length !== 1?'s':''}`} />
          <MetricCard label="Shortlisted" value={stats?.shortlisted ?? 0} delta={stats?.total_resumes ? `${Math.round((stats.shortlisted/stats.total_resumes)*100)}% match rate` : '—'} />
          <MetricCard label="Interviews generated" value={stats?.interviews_generated ?? 0} delta="via AI" />
          <MetricCard label="Avg match score" value={stats?.avg_match_score ? `${stats.avg_match_score}%` : '—'} deltaColor="#BA7517" />
        </div>

        <div className="pipeline-panels">
          <div className="panel candidates-panel">
            <div className="panel-header">
              <div className="panel-title">Shortlisted candidates</div>
              <div className="filter-tabs">
                {['All','Shortlisted','Rejected'].map(f => (
                  <button key={f} className={`filter-tab${filter===f?' active':''}`} onClick={() => setFilter(f)}>{f}</button>
                ))}
              </div>
            </div>
            <div className="table-head">
              <div />
              <div>Candidate</div>
              <div>Match score</div>
              <div>Experience</div>
              <div>Status</div>
            </div>
            {filtered.length === 0
              ? <EmptyState icon="📋" title="No candidates yet" desc="Upload resumes to start screening" action={<button className="btn btn-primary" onClick={()=>navigate('/upload')}><Upload size={14}/> Upload</button>} />
              : filtered.map((c, i) => {
                  const [bg, fg] = AVATAR_COLORS[i % AVATAR_COLORS.length];
                  const yrs = c.analysis?.years_experience;
                  return (
                    <div key={c.id} className={`candidate-row${selected?.id===c.id?' selected':''}`} onClick={() => setSelected(c)}>
                      <Avatar name={c.name} bg={bg} color={fg} />
                      <div>
                        <div className="cname">{c.name}</div>
                        <div className="crole">{c.role_title}</div>
                      </div>
                      <ScoreBar value={c.score?.overall ?? 0} />
                      <div className="exp-text">{yrs != null ? `${yrs} yr${yrs!==1?'s':''}` : '—'}</div>
                      <Badge status={c.status} />
                    </div>
                  );
                })
            }
          </div>

          <div className="panel detail-panel">
            {selected
              ? <CandidateDetail candidate={selected} />
              : <EmptyState icon="👤" title="Select a candidate" desc="Click any row to see their detailed profile" />
            }
          </div>
        </div>
      </div>
    </div>
  );
}