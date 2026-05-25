import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getRole, updateRole, suggestSkills } from '../../lib/api.js';
import { Spinner, ScoreRing } from '../layout/UI.jsx'; 
import { Plus, Trash2, Loader, Sparkles, Save, ArrowLeft } from 'lucide-react';
import './ScoringConfig.css';

const EXP_BANDS = [
  { label: '0-2 yrs', mult: 'x0.6' },
  { label: '3-4 yrs', mult: 'x0.8' },
  { label: '5-7 yrs', mult: 'x1.0' },
  { label: '8+ yrs', mult: 'x1.1' },
];

const DEMO_CANDIDATE = { skills: ['Python','PyTorch','MLOps','Kubernetes','RAG systems'], years: 6 };

export default function ScoringConfig() {
  const { roleId } = useParams();
  const navigate = useNavigate();
  const [role, setRole] = useState(null);
  const [cfg, setCfg] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [suggesting, setSuggesting] = useState(false);
  const [suggestTitle, setSuggestTitle] = useState('');
  const [suggested, setSuggested] = useState([]);
  const [newSkill, setNewSkill] = useState('');

  useEffect(() => {
    getRole(roleId).then(r => {
      setRole(r);
      setCfg(JSON.parse(JSON.stringify(r.scoring_config)));
      setSuggestTitle(r.title);
      setLoading(false);
    });
  }, [roleId]);

  const save = async () => {
    setSaving(true);
    await updateRole(roleId, { scoring_config: cfg });
    setSaving(false);
    alert('Scoring rules saved!');
  };

  const handleSuggest = async () => {
    setSuggesting(true);
    setSuggested([]);
    const { suggested_skills } = await suggestSkills(roleId, suggestTitle);
    setSuggested(suggested_skills);
    setSuggesting(false);
  };

  const addSkill = (name) => {
    if (!name.trim()) return;
    if (cfg.skills.find(s => s.name.toLowerCase() === name.toLowerCase())) return;
    setCfg(c => ({ ...c, skills: [...c.skills, { name: name.trim(), weight: 60, required: false }] }));
    setNewSkill('');
  };

  const removeSkill = (name) => setCfg(c => ({ ...c, skills: c.skills.filter(s => s.name !== name) }));
  const setWeight = (name, w) => setCfg(c => ({ ...c, skills: c.skills.map(s => s.name === name ? { ...s, weight: Number(w) } : s) }));
  const toggleRequired = (name) => setCfg(c => ({ ...c, skills: c.skills.map(s => s.name === name ? { ...s, required: !s.required } : s) }));
  const setSafeguard = (key, val) => setCfg(c => ({ ...c, bias_safeguards: { ...c.bias_safeguards, [key]: val } }));
  const setPenalty = (key, val) => setCfg(c => ({ ...c, penalties: { ...c.penalties, [key]: Number(val) } }));

  // Live score preview
  const liveScore = () => {
    if (!cfg) return { overall: 0, skills: 0, experience: 0 };
    const totalW = cfg.skills.reduce((a, s) => a + s.weight, 0);
    const matchedW = cfg.skills.filter(s =>
      DEMO_CANDIDATE.skills.some(ds => ds.toLowerCase().includes(s.name.toLowerCase()) || s.name.toLowerCase().includes(ds.toLowerCase()))
    ).reduce((a, s) => a + s.weight, 0);
    const skillScore = totalW > 0 ? Math.round((matchedW / totalW) * 100) : 50;
    const expScore = Math.round(Math.max(0, 100 - Math.abs(DEMO_CANDIDATE.years - [1, 3.5, 6, 10][cfg.experience_band]) * 8));
    const overall = Math.round(skillScore * 0.5 + expScore * 0.3 + 78 * 0.2);
    return { overall, skills: skillScore, experience: expScore };
  };

  const preview = liveScore();
  const shortlisted = preview.overall >= (cfg?.threshold ?? 75);

  if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}><Spinner /></div>;

  return (
    <div className="page">
      <div className="topbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button className="btn" onClick={() => navigate('/roles')}><ArrowLeft size={14} /></button>
          <div>
            <div className="page-title">Scoring rules — {role?.title}</div>
            <div style={{ fontSize: 11, color: '#aaa', marginTop: 2 }}>Changes apply to new resume screenings</div>
          </div>
        </div>
        <button className="btn btn-primary" onClick={save} disabled={saving}>
          {saving ? <Loader size={14} className="spin" /> : <Save size={14} />} Save rules
        </button>
      </div>

      <div className="content">
        <div className="cfg-layout">
          <div className="cfg-main">

            {/* Skill Weights */}
            <div className="cfg-section">
              <div className="cfg-sec-header">
                <div>
                  <div className="cfg-sec-title">Skill weights</div>
                  <div className="cfg-sec-hint">Set how much each skill matters. Required skills penalise more if missing.</div>
                </div>
              </div>

              {cfg.skills.length === 0 && <div style={{ fontSize: 12, color: '#aaa', padding: '8px 0' }}>No skills yet — add one below or use "Suggest skills".</div>}

              {cfg.skills.map(s => (
                <div key={s.name} className="skill-row">
                  <div className="skill-name">
                    {s.name}
                    <button className={`req-toggle${s.required ? ' req-on' : ''}`} onClick={() => toggleRequired(s.name)}>
                      {s.required ? 'Required' : 'Optional'}
                    </button>
                  </div>
                  <input type="range" min={0} max={100} step={1} value={s.weight} onChange={e => setWeight(s.name, e.target.value)} />
                  <span className="weight-pct">{s.weight}%</span>
                  <button className="icon-btn" onClick={() => removeSkill(s.name)}><Trash2 size={13} /></button>
                </div>
              ))}

              <div className="add-skill-row">
                <input placeholder="Add skill…" value={newSkill} onChange={e => setNewSkill(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addSkill(newSkill)} />
                <button className="btn btn-primary" onClick={() => addSkill(newSkill)}><Plus size={13} /> Add</button>
              </div>

              <div className="suggest-row">
                <input value={suggestTitle} onChange={e => setSuggestTitle(e.target.value)} placeholder="Job title to search…" style={{ flex: 1 }} />
                <button className="btn" onClick={handleSuggest} disabled={suggesting}>
                  {suggesting ? <Loader size={13} className="spin" /> : <Sparkles size={13} />} Suggest skills
                </button>
              </div>
              {suggested.length > 0 && (
                <div className="suggested-skills">
                  <div style={{ fontSize: 11, color: '#888', marginBottom: 6 }}>Click to add suggested skills:</div>
                  {suggested.map(s => (
                    <button key={s} className="suggest-chip" onClick={() => addSkill(s)}><Plus size={11} /> {s}</button>
                  ))}
                </div>
              )}
            </div>

            {/* Experience Bands */}
            <div className="cfg-section">
              <div className="cfg-sec-title">Experience bands</div>
              <div className="cfg-sec-hint">Score multiplier by years of experience</div>
              <div className="exp-grid">
                {EXP_BANDS.map((b, i) => (
                  <div key={i} className={`exp-band${cfg.experience_band === i ? ' selected' : ''}`} onClick={() => setCfg(c => ({ ...c, experience_band: i }))}>
                    <div className="exp-range">{b.label}</div>
                    <div className="exp-mult">{b.mult}</div>
                  </div>
                ))}
              </div>
              <div className="threshold-row">
                <span className="threshold-label">Auto-shortlist threshold</span>
                <input type="range" min={50} max={95} step={1} value={cfg.threshold} onChange={e => setCfg(c => ({ ...c, threshold: Number(e.target.value) }))} style={{ flex: 1 }} />
                <span className="threshold-val">{cfg.threshold}%</span>
              </div>
            </div>

            {/* Penalty Rules */}
            <div className="cfg-section">
              <div className="cfg-sec-title">Penalty rules</div>
              <div className="cfg-sec-hint">Score deductions for negative signals</div>
              {[
                { key: 'gap_over_12m', label: 'Employment gap > 12 months' },
                { key: 'no_degree', label: 'No relevant degree or equivalent' },
                { key: 'job_hopping', label: 'Job-hopping (3+ roles in 2 yrs)' },
                { key: 'missing_required_skills_pct', label: 'Missing required skills (> 50%)' },
              ].map(p => (
                <div key={p.key} className="penalty-row">
                  <span className="penalty-label">{p.label}</span>
                  <div className="penalty-control">
                    <span style={{ fontSize: 12, color: '#E24B4A' }}>−</span>
                    <input type="number" min={0} max={30} value={cfg.penalties[p.key] ?? 0}
                      onChange={e => setPenalty(p.key, e.target.value)} className="penalty-input" />
                    <span style={{ fontSize: 12, color: '#888' }}>pts</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Bias Safeguards */}
            <div className="cfg-section">
              <div className="cfg-sec-title">Bias safeguards</div>
              {[
                { key: 'anonymise_names', label: 'Anonymise candidate names', desc: 'Hide names during initial scoring pass' },
                { key: 'suppress_university_prestige', label: 'Suppress university prestige', desc: 'Treat all accredited degrees equally' },
                { key: 'remove_graduation_year', label: 'Remove graduation year', desc: 'Prevents age-based scoring bias' },
              ].map(t => (
                <div key={t.key} className="toggle-row">
                  <div>
                    <div className="toggle-label">{t.label}</div>
                    <div className="toggle-desc">{t.desc}</div>
                  </div>
                  <label className="toggle-switch">
                    <input type="checkbox" checked={!!cfg.bias_safeguards[t.key]} onChange={e => setSafeguard(t.key, e.target.checked)} />
                    <span className="toggle-thumb" />
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Live Preview */}
          <div className="cfg-preview">
            <div className="preview-title">Live score preview</div>
            <div className="preview-rings">
              <ScoreRing value={preview.overall} label="Overall" color={preview.overall >= cfg.threshold ? '#185FA5' : '#E24B4A'} />
            </div>
            <div className="preview-breakdown">
              {[
                { label: 'Skills match', val: preview.skills, color: '#185FA5' },
                { label: 'Experience fit', val: preview.experience, color: '#1D9E75' },
                { label: 'Profile quality', val: 78, color: '#BA7517' },
              ].map(r => (
                <div key={r.label} className="breakdown-row">
                  <span className="breakdown-label">{r.label}</span>
                  <div className="breakdown-track"><div className="breakdown-fill" style={{ width: `${r.val}%`, background: r.color }} /></div>
                  <span className="breakdown-val">{r.val}</span>
                </div>
              ))}
            </div>
            <div className="preview-candidate">
              <div style={{ fontSize: 11, color: '#aaa', marginBottom: 6 }}>Sample candidate</div>
              <div style={{ fontSize: 12, fontWeight: 500, marginBottom: 4 }}>Arjun Reddy</div>
              <div style={{ fontSize: 11, color: '#888' }}>6 yrs · Python, PyTorch, MLOps, Kubernetes</div>
            </div>
            <div className={`preview-decision ${shortlisted ? 'decision-pass' : 'decision-fail'}`}>
              {shortlisted ? `✓ Shortlisted (${preview.overall} ≥ ${cfg.threshold})` : `✗ Not shortlisted (${preview.overall} < ${cfg.threshold})`}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}