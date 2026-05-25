import { ScoreRing, Badge } from '../layout/UI';
import './CandidateDetail.css';

export default function CandidateDetail({ candidate: c }) {
  const score = c.score || {};
  const analysis = c.analysis || {};
  const questions = c.interview_questions || [];
  const rejection = c.rejection_feedback;

  return (
    <div className="detail-wrap">
      <div className="detail-header">
        <div>
          <div className="detail-name">{c.name}</div>
          <div className="detail-role">{c.role_title} · {analysis.years_experience ?? '?'} yrs exp</div>
        </div>
        <Badge status={c.status} />
      </div>

      <div className="detail-rings">
        <ScoreRing value={score.overall ?? 0} label="Overall" color="#185FA5" />
        <ScoreRing value={score.skills ?? 0} label="Skills" color="#1D9E75" />
        <ScoreRing value={score.experience ?? 0} label="Experience" color="#BA7517" />
      </div>

      {analysis.skills_found?.length > 0 && (
        <div className="detail-section">
          <div className="detail-sec-title">Matched skills</div>
          <div className="skill-tags">
            {analysis.skills_found.map(s => (
              <span key={s} className="skill-tag">{s}</span>
            ))}
          </div>
        </div>
      )}

      {c.recruiter_summary && (
        <div className="detail-section">
          <div className="detail-sec-title">Recruiter summary</div>
          <div className="detail-summary">{c.recruiter_summary}</div>
        </div>
      )}

      {questions.length > 0 && (
        <div className="detail-section">
          <div className="detail-sec-title-row">
            <span className="detail-sec-title">Interview questions</span>
            <span className="detail-count">{questions.length} generated</span>
          </div>
          {questions.slice(0, 3).map((q, i) => (
            <div key={i} className="q-card">
              <div className="q-type">{q.type} · {q.category}</div>
              <div className="q-text">{q.question}</div>
              {q.follow_up && <div className="q-followup">↳ {q.follow_up}</div>}
            </div>
          ))}
          {questions.length > 3 && (
            <div className="q-more">+{questions.length - 3} more questions</div>
          )}
        </div>
      )}

      {rejection && (
        <div className="detail-section">
          <div className="detail-sec-title">Feedback for candidate</div>
          <div className="rejection-reason">{rejection.reason}</div>
          {rejection.improvement_suggestions?.length > 0 && (
            <ul className="improvement-list">
              {rejection.improvement_suggestions.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}