import { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { matchService, shortlistService } from '../services/dataService';
import { Trophy, ArrowLeft, BookmarkCheck, Brain, MessageSquare, ChevronDown, ChevronUp, CheckCircle, XCircle, Save } from 'lucide-react';
import toast from 'react-hot-toast';

export default function MatchResults() {
  const location = useLocation();
  const navigate = useNavigate();
  const data = location.state?.results;
  const matchType = location.state?.type;
  const [expandedId, setExpandedId] = useState(null);
  const [questionsMap, setQuestionsMap] = useState({});
  const [questionsLoading, setQuestionsLoading] = useState({});
  const [saving, setSaving] = useState(false);

  if (!data) {
    return (
      <div className="glass-card" style={{ padding: 40, textAlign: 'center' }}>
        <p style={{ color: 'var(--text-muted)', marginBottom: 16 }}>No match results found.</p>
        <Link to="/match" className="btn btn-primary"><ArrowLeft size={18} /> Go to Matching</Link>
      </div>
    );
  }

  const results = data.results || [];
  const summary = data.summary || {};
  const chartData = results.slice(0, 10).map(r => ({
    name: r.candidate?.name?.split(' ')[0] || 'N/A',
    score: r.matchScore,
    aiScore: r.aiScore || r.matchScore
  }));

  const getScoreColor = (score) => {
    if (score >= 75) return 'var(--success)';
    if (score >= 50) return 'var(--warning)';
    return 'var(--error)';
  };

  const getBadgeClass = (rec) => {
    if (rec?.includes('High') || rec?.includes('Strongly')) return 'badge-high';
    if (rec?.includes('Medium') || rec?.includes('Recommended')) return 'badge-medium';
    return 'badge-low';
  };

  const handleInterviewQuestions = async (candidateId, index) => {
    if (questionsMap[index]) { setExpandedId(expandedId === index ? null : index); return; }
    setQuestionsLoading(prev => ({ ...prev, [index]: true }));
    try {
      const res = await matchService.interviewQuestions({
        candidateId,
        requiredSkills: data.requirements?.requiredSkills || [],
        preferredSkills: data.requirements?.preferredSkills || [],
        minExperience: data.requirements?.minExperience || 0
      });
      setQuestionsMap(prev => ({ ...prev, [index]: res.data.questions }));
      setExpandedId(index);
    } catch (err) {
      toast.error('Failed to generate questions');
    } finally {
      setQuestionsLoading(prev => ({ ...prev, [index]: false }));
    }
  };

  const handleSaveShortlist = async () => {
    setSaving(true);
    try {
      await shortlistService.save({
        title: `Shortlist — ${data.requirements?.requiredSkills?.join(', ') || 'Custom'}`,
        jobRequirements: data.requirements,
        candidates: results.map(r => ({
          candidateId: r.candidate?._id,
          matchScore: r.matchScore,
          matchedSkills: r.matchedSkills || [],
          missingSkills: r.missingSkills || [],
          aiExplanation: r.aiExplanation || '',
          recommendation: r.recommendation || r.aiRecommendation || 'Low Match'
        })),
        aiAnalysis: summary.aiAnalysis || ''
      });
      toast.success('Shortlist saved!');
    } catch (err) {
      toast.error('Failed to save shortlist');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Link to="/match" className="btn btn-ghost" style={{ padding: 10 }}><ArrowLeft size={20} /></Link>
          <div>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 700 }}>
              {matchType === 'ai' ? 'AI Shortlist Results' : 'Match Results'}
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{results.length} candidates analyzed</p>
          </div>
        </div>
        <button className="btn btn-primary" onClick={handleSaveShortlist} disabled={saving} id="save-shortlist-btn">
          {saving ? <span className="loading-pulse">Saving...</span> : <><Save size={18} /> Save Shortlist</>}
        </button>
      </motion.div>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12 }}>
        {[
          { label: 'Total', value: summary.totalCandidates || 0, color: 'var(--primary-500)' },
          { label: 'High Match', value: summary.highMatch || 0, color: 'var(--success)' },
          { label: 'Medium Match', value: summary.mediumMatch || 0, color: 'var(--warning)' },
          { label: 'Low Match', value: summary.lowMatch || 0, color: 'var(--error)' },
          { label: 'Avg Score', value: `${summary.averageScore || 0}%`, color: 'var(--info)' },
        ].map(s => (
          <motion.div key={s.label} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="glass-card" style={{ padding: 16, textAlign: 'center' }}>
            <p style={{ fontSize: '1.5rem', fontWeight: 800, color: s.color }}>{s.value}</p>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>{s.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Chart */}
      {chartData.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card" style={{ padding: 24 }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 16 }}>Score Comparison</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
              <XAxis dataKey="name" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} />
              <YAxis domain={[0, 100]} tick={{ fill: 'var(--text-muted)', fontSize: 12 }} />
              <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 10, color: 'var(--text-primary)' }} />
              <Bar dataKey="score" name="Algorithm" fill="#6366f1" radius={[6, 6, 0, 0]} barSize={24} />
              {matchType === 'ai' && <Bar dataKey="aiScore" name="AI Score" fill="#8b5cf6" radius={[6, 6, 0, 0]} barSize={24} />}
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      )}

      {/* Result Cards */}
      {results.map((r, i) => (
        <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.05 }} className="glass-card" style={{ padding: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
            <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
              <div style={{
                width: 50, height: 50, borderRadius: 14,
                background: `linear-gradient(135deg, ${getScoreColor(r.matchScore)}, ${getScoreColor(r.matchScore)}88)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', fontWeight: 800, fontSize: '1.1rem'
              }}>
                #{r.rank || i + 1}
              </div>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>{r.candidate?.name}</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{r.candidate?.email} · {r.candidate?.experience} yrs</p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <div style={{ textAlign: 'center' }}>
                <p style={{ fontSize: '1.75rem', fontWeight: 800, color: getScoreColor(r.matchScore) }}>{r.matchScore}%</p>
                <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Match Score</p>
              </div>
              <span className={`badge ${getBadgeClass(r.recommendation || r.aiRecommendation)}`}>
                {r.recommendation || r.aiRecommendation}
              </span>
            </div>
          </div>

          {/* Progress Bar */}
          <div style={{ marginTop: 16 }}>
            <div className="progress-bar">
              <div
                className={`progress-bar-fill ${r.matchScore >= 75 ? 'progress-high' : r.matchScore >= 50 ? 'progress-medium' : 'progress-low'}`}
                style={{ width: `${r.matchScore}%` }}
              />
            </div>
          </div>

          {/* Skills */}
          <div style={{ display: 'flex', gap: 24, marginTop: 16, flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: 200 }}>
              <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 4 }}>
                <CheckCircle size={12} color="var(--success)" /> Matched Skills
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {(r.matchedSkills || []).map(s => (
                  <span key={s} className="badge badge-high">{s}</span>
                ))}
                {(!r.matchedSkills || r.matchedSkills.length === 0) && <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>None</span>}
              </div>
            </div>
            <div style={{ flex: 1, minWidth: 200 }}>
              <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 4 }}>
                <XCircle size={12} color="var(--error)" /> Missing Skills
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {(r.missingSkills || []).map(s => (
                  <span key={s} className="badge badge-low">{s}</span>
                ))}
                {(!r.missingSkills || r.missingSkills.length === 0) && <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>None</span>}
              </div>
            </div>
          </div>

          {/* AI Explanation */}
          {r.aiExplanation && (
            <div style={{ marginTop: 16, padding: '14px', background: 'rgba(139, 92, 246, 0.06)', borderRadius: 10, border: '1px solid rgba(139, 92, 246, 0.1)' }}>
              <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--accent-500)', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
                <Brain size={14} /> AI Explanation
              </p>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{r.aiExplanation}</p>
            </div>
          )}

          {/* Interview Questions Button */}
          <div style={{ marginTop: 16, display: 'flex', gap: 8 }}>
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => handleInterviewQuestions(r.candidate?._id, i)}
              disabled={questionsLoading[i]}
            >
              {questionsLoading[i] ? <span className="loading-pulse">Generating...</span> : (
                <><MessageSquare size={14} /> AI Interview Questions {expandedId === i ? <ChevronUp size={14} /> : <ChevronDown size={14} />}</>
              )}
            </button>
          </div>

          {/* Questions Accordion */}
          {expandedId === i && questionsMap[i] && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} style={{ marginTop: 12, overflow: 'hidden' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {questionsMap[i].map((q, qi) => (
                  <div key={qi} style={{ padding: '12px 16px', background: 'var(--bg-secondary)', borderRadius: 10, border: '1px solid var(--border-color)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, flexWrap: 'wrap', gap: 6 }}>
                      <span className="badge badge-skill">{q.category}</span>
                      <span className="badge badge-info">{q.difficulty}</span>
                    </div>
                    <p style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: 4 }}>{q.question}</p>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{q.purpose}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </motion.div>
      ))}
    </div>
  );
}
