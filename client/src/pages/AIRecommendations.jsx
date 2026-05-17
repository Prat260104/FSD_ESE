import { useState } from 'react';
import { motion } from 'framer-motion';
import { matchService } from '../services/dataService';
import { Brain, Plus, X, Sparkles, MessageSquare, ChevronDown, ChevronUp } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AIRecommendations() {
  const [requiredSkills, setRequiredSkills] = useState([]);
  const [preferredSkills, setPreferredSkills] = useState([]);
  const [minExperience, setMinExperience] = useState('');
  const [reqInput, setReqInput] = useState('');
  const [prefInput, setPrefInput] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [expandedQ, setExpandedQ] = useState(null);
  const [questionsMap, setQuestionsMap] = useState({});
  const [qLoading, setQLoading] = useState({});

  const addSkill = (type) => {
    if (type === 'req') {
      const t = reqInput.trim();
      if (t && !requiredSkills.includes(t)) { setRequiredSkills([...requiredSkills, t]); setReqInput(''); }
    } else {
      const t = prefInput.trim();
      if (t && !preferredSkills.includes(t)) { setPreferredSkills([...preferredSkills, t]); setPrefInput(''); }
    }
  };

  const analyze = async () => {
    if (requiredSkills.length === 0) { toast.error('Add at least one required skill'); return; }
    setLoading(true);
    try {
      const res = await matchService.aiShortlist({ requiredSkills, preferredSkills, minExperience: minExperience ? parseFloat(minExperience) : 0 });
      setResults(res.data);
      toast.success('AI analysis complete!');
    } catch (err) { toast.error(err.response?.data?.message || 'AI analysis failed'); }
    finally { setLoading(false); }
  };

  const getQuestions = async (candidateId, idx) => {
    if (questionsMap[idx]) { setExpandedQ(expandedQ === idx ? null : idx); return; }
    setQLoading(p => ({ ...p, [idx]: true }));
    try {
      const res = await matchService.interviewQuestions({ candidateId, requiredSkills, preferredSkills, minExperience: minExperience ? parseFloat(minExperience) : 0 });
      setQuestionsMap(p => ({ ...p, [idx]: res.data.questions }));
      setExpandedQ(idx);
    } catch { toast.error('Failed to generate questions'); }
    finally { setQLoading(p => ({ ...p, [idx]: false })); }
  };

  const getColor = (s) => s >= 75 ? 'var(--success)' : s >= 50 ? 'var(--warning)' : 'var(--error)';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Input Panel */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card" style={{ padding: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
          <div style={{ width: 48, height: 48, borderRadius: 14, background: 'linear-gradient(135deg, #8b5cf6, #6366f1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Brain size={24} color="#fff" />
          </div>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>AI Recommendations</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Get intelligent candidate analysis powered by AI</p>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6, display: 'block' }}>Required Skills *</label>
            <div style={{ display: 'flex', gap: 6 }}>
              <input className="input" placeholder="e.g. React" value={reqInput} onChange={e => setReqInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addSkill('req'))} />
              <button className="btn btn-secondary btn-sm" onClick={() => addSkill('req')}><Plus size={16} /></button>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
              {requiredSkills.map((s, i) => (
                <span key={s} className="badge" style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', cursor: 'pointer', padding: '4px 10px', display: 'flex', alignItems: 'center', gap: 4 }} onClick={() => setRequiredSkills(requiredSkills.filter((_, idx) => idx !== i))}>{s}<X size={10} /></span>
              ))}
            </div>
          </div>
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6, display: 'block' }}>Preferred Skills</label>
            <div style={{ display: 'flex', gap: 6 }}>
              <input className="input" placeholder="e.g. Docker" value={prefInput} onChange={e => setPrefInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addSkill('pref'))} />
              <button className="btn btn-secondary btn-sm" onClick={() => addSkill('pref')}><Plus size={16} /></button>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
              {preferredSkills.map((s, i) => (
                <span key={s} className="badge" style={{ background: 'rgba(245,158,11,0.1)', color: '#f59e0b', cursor: 'pointer', padding: '4px 10px', display: 'flex', alignItems: 'center', gap: 4 }} onClick={() => setPreferredSkills(preferredSkills.filter((_, idx) => idx !== i))}>{s}<X size={10} /></span>
              ))}
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end', marginTop: 16 }}>
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6, display: 'block' }}>Min Experience</label>
            <input type="number" className="input" style={{ width: 120 }} placeholder="0" value={minExperience} onChange={e => setMinExperience(e.target.value)} />
          </div>
          <button className="btn btn-lg" disabled={loading || requiredSkills.length === 0} onClick={analyze}
            style={{ background: 'linear-gradient(135deg, #8b5cf6, #6366f1)', color: '#fff', border: 'none', borderRadius: 10, fontFamily: 'var(--font-sans)', fontWeight: 600, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '12px 24px', boxShadow: '0 2px 12px rgba(139,92,246,0.3)' }}>
            {loading ? <span className="loading-pulse">Analyzing...</span> : <><Sparkles size={20} /> Run AI Analysis</>}
          </button>
        </div>
      </motion.div>

      {/* Results */}
      {results && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card" style={{ padding: 20, textAlign: 'center' }}>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{results.summary?.aiAnalysis || `AI analyzed ${results.results?.length || 0} candidates`}</p>
          </motion.div>

          {results.results?.map((r, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }} className="glass-card" style={{ padding: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  <div style={{ width: 46, height: 46, borderRadius: 12, background: `linear-gradient(135deg, ${getColor(r.matchScore)}, ${getColor(r.matchScore)}88)`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: '1rem' }}>
                    #{r.rank || i + 1}
                  </div>
                  <div>
                    <h3 style={{ fontWeight: 700, fontSize: '1.05rem' }}>{r.candidate?.name}</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{r.candidate?.experience} yrs exp</p>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  <div style={{ textAlign: 'center' }}>
                    <p style={{ fontSize: '1.5rem', fontWeight: 800, color: getColor(r.aiScore || r.matchScore) }}>{r.aiScore || r.matchScore}%</p>
                    <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>AI Score</p>
                  </div>
                  <span className={`badge ${r.matchScore >= 75 ? 'badge-high' : r.matchScore >= 50 ? 'badge-medium' : 'badge-low'}`}>{r.aiRecommendation || r.recommendation}</span>
                </div>
              </div>

              <div className="progress-bar" style={{ marginBottom: 16 }}>
                <div className={`progress-bar-fill ${r.matchScore >= 75 ? 'progress-high' : r.matchScore >= 50 ? 'progress-medium' : 'progress-low'}`} style={{ width: `${r.aiScore || r.matchScore}%` }} />
              </div>

              {r.aiExplanation && (
                <div style={{ padding: 14, background: 'rgba(139,92,246,0.06)', borderRadius: 10, border: '1px solid rgba(139,92,246,0.1)', marginBottom: 12 }}>
                  <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--accent-500)', marginBottom: 4 }}><Brain size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 4 }} />AI Insight</p>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{r.aiExplanation}</p>
                </div>
              )}

              {(r.strengths?.length > 0 || r.concerns?.length > 0) && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                  {r.strengths?.length > 0 && (
                    <div>
                      <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--success)', marginBottom: 6 }}>Strengths</p>
                      {r.strengths.map((s, si) => <p key={si} style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: 2 }}>✓ {s}</p>)}
                    </div>
                  )}
                  {r.concerns?.length > 0 && (
                    <div>
                      <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--warning)', marginBottom: 6 }}>Concerns</p>
                      {r.concerns.map((c, ci) => <p key={ci} style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: 2 }}>⚠ {c}</p>)}
                    </div>
                  )}
                </div>
              )}

              <button className="btn btn-ghost btn-sm" onClick={() => getQuestions(r.candidate?._id, i)} disabled={qLoading[i]}>
                {qLoading[i] ? <span className="loading-pulse">Generating...</span> : <><MessageSquare size={14} /> Interview Questions {expandedQ === i ? <ChevronUp size={14} /> : <ChevronDown size={14} />}</>}
              </button>

              {expandedQ === i && questionsMap[i] && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {questionsMap[i].map((q, qi) => (
                    <div key={qi} style={{ padding: '10px 14px', background: 'var(--bg-secondary)', borderRadius: 8, border: '1px solid var(--border-color)' }}>
                      <div style={{ display: 'flex', gap: 6, marginBottom: 4 }}>
                        <span className="badge badge-skill" style={{ fontSize: '0.65rem' }}>{q.category}</span>
                        <span className="badge badge-info" style={{ fontSize: '0.65rem' }}>{q.difficulty}</span>
                      </div>
                      <p style={{ fontWeight: 600, fontSize: '0.85rem' }}>{q.question}</p>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>{q.purpose}</p>
                    </div>
                  ))}
                </motion.div>
              )}
            </motion.div>
          ))}
        </>
      )}

      {!results && !loading && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card" style={{ padding: '60px 24px', textAlign: 'center' }}>
          <Brain size={56} style={{ color: 'var(--text-muted)', opacity: 0.3, marginBottom: 16 }} />
          <h3 style={{ fontWeight: 600, marginBottom: 8 }}>Ready for AI Analysis</h3>
          <p style={{ color: 'var(--text-muted)', maxWidth: 400, margin: '0 auto' }}>Enter your job requirements above and click "Run AI Analysis" to get intelligent candidate recommendations.</p>
        </motion.div>
      )}
    </div>
  );
}
