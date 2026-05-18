import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { aiService, evaluationService } from '../services/dataService';
import { Brain, ArrowLeft, Zap, Sparkles, AlertCircle, Save, ChevronDown, CheckCircle, Target, Award, ShieldAlert } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AIPerformance() {
  const location = useLocation();
  const navigate = useNavigate();
  const criteria = location.state?.criteria;

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState('');
  const [showSaveModal, setShowSaveModal] = useState(false);

  useEffect(() => {
    if (!criteria) {
      navigate('/analytics');
      return;
    }
    fetchAIAnalysis();
  }, [criteria]);

  const fetchAIAnalysis = async () => {
    try {
      const res = await aiService.aiRecommend(criteria);
      setData(res.data);
      if (res.data.results.length > 0) {
        setExpandedId(res.data.results[0].employee._id);
      }
    } catch (err) {
      toast.error('AI Analysis failed');
      navigate('/analytics/results', { state: { criteria } });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    setSaving(true);
    try {
      const evaluationData = {
        title: title.trim(),
        criteria: data.criteria,
        aiAnalysisSummary: data.summary.aiAnalysis,
        employees: data.results.map(r => ({
          employee: r.employee._id,
          evaluationScore: r.aiScore,
          strengths: r.strengths,
          areasForImprovement: r.areasForImprovement,
          aiFeedback: r.aiFeedback,
          recommendation: r.recommendation
        }))
      };

      await evaluationService.save(evaluationData);
      toast.success('AI Evaluation saved successfully');
      navigate('/saved-evaluations');
    } catch (err) {
      toast.error('Failed to save evaluation');
    } finally {
      setSaving(false);
      setShowSaveModal(false);
    }
  };

  if (loading) {
    return (
      <div style={{ height: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ position: 'relative', width: 140, height: 140, marginBottom: 40 }}>
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 4, repeat: Infinity, ease: "linear" }} style={{ position: 'absolute', inset: 0, border: '4px dashed var(--primary-400)', borderRadius: '50%', opacity: 0.5 }} />
          <motion.div animate={{ rotate: -360 }} transition={{ duration: 3, repeat: Infinity, ease: "linear" }} style={{ position: 'absolute', inset: 12, border: '4px solid transparent', borderLeftColor: 'var(--accent-500)', borderRightColor: 'var(--primary-500)', borderRadius: '50%' }} />
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Brain size={48} color="var(--primary-500)" style={{ filter: 'drop-shadow(0 0 12px rgba(99,102,241,0.6))' }} />
          </div>
        </div>
        <h2 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 16 }}>
          Generating <span style={{ background: 'linear-gradient(to right, #6366f1, #a855f7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>AI Insights...</span>
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', maxWidth: 450, textAlign: 'center', lineHeight: 1.6 }}>
          OpenRouter AI is currently evaluating employee skills, performance scores, and generating actionable feedback and promotion recommendations.
        </p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <button onClick={() => navigate(-1)} className="btn btn-ghost" style={{ padding: 10, background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '50%' }}>
            <ArrowLeft size={22} />
          </button>
          <div>
            <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 12, letterSpacing: '-0.02em' }}>
              <Sparkles color="var(--primary-500)" /> AI Performance Insights
            </h1>
          </div>
        </div>
        <button className="btn btn-primary" onClick={() => setShowSaveModal(true)} style={{ padding: '12px 24px', fontSize: '1rem', borderRadius: 12 }}>
          <Save size={20} /> Save AI Report
        </button>
      </div>

      {/* AI Summary Banner */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card" style={{ padding: 32, background: 'linear-gradient(135deg, rgba(99,102,241,0.08), rgba(168,85,247,0.08))', border: '1px solid rgba(168,85,247,0.3)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -50, right: -50, width: 200, height: 200, background: 'var(--primary-500)', filter: 'blur(100px)', opacity: 0.2 }} />
        <div style={{ display: 'flex', gap: 24, position: 'relative', zIndex: 1 }}>
          <div style={{ width: 56, height: 56, borderRadius: 16, background: 'var(--bg-card)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 24px rgba(168,85,247,0.2)', border: '1px solid rgba(255,255,255,0.1)', flexShrink: 0 }}>
            <Brain size={28} color="#a855f7" />
          </div>
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 12 }}>Executive AI Summary</h3>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: '1rem', fontWeight: 500 }}>
              {data?.summary?.aiAnalysis}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Results List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {data?.results.map((result, index) => {
          const isExpanded = expandedId === result.employee._id;
          const isHigh = result.aiScore >= 80;
          const isLow = result.aiScore < 60;
          
          return (
            <motion.div key={result.employee._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }} className="glass-card" style={{ overflow: 'hidden', border: isExpanded ? `1px solid ${isHigh ? 'rgba(16,185,129,0.3)' : isLow ? 'rgba(239,68,68,0.3)' : 'var(--border-color)'}` : '1px solid var(--border-color)' }}>
              
              {/* Header (Clickable) */}
              <div 
                onClick={() => setExpandedId(isExpanded ? null : result.employee._id)}
                style={{ padding: '24px 32px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 32, background: isExpanded ? 'var(--bg-secondary)' : 'transparent', transition: 'background 0.2s' }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '0.05em' }}>RANK</span>
                  <span style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)' }}>#{result.rank}</span>
                </div>
                
                <div style={{ flex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
                  <div>
                    <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 12 }}>
                      {result.employee.name}
                      <span className={`badge ${isHigh ? 'badge-high' : isLow ? 'badge-low' : 'badge-medium'}`} style={{ fontSize: '0.85rem', padding: '4px 10px' }}>
                        AI Score: {result.aiScore}
                      </span>
                    </h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginTop: 6 }}>
                      {result.employee.department} • {result.employee.experience} yrs exp • Raw Perf: {result.evaluationScore}/100
                    </p>
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, marginBottom: 4, letterSpacing: '0.05em' }}>AI RECOMMENDATION</p>
                      <p style={{ fontSize: '1.1rem', fontWeight: 800, color: result.recommendation.toLowerCase().includes('promot') ? '#10b981' : result.recommendation.toLowerCase().includes('train') ? '#f59e0b' : 'var(--text-primary)' }}>
                        {result.recommendation}
                      </p>
                    </div>
                    <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--bg-card)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border-color)' }}>
                      <ChevronDown size={20} color="var(--text-primary)" style={{ transform: isExpanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.3s' }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Expanded Content */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} style={{ overflow: 'hidden' }}>
                    <div style={{ padding: '0 32px 32px', borderTop: '1px solid var(--border-color)' }}>
                      <div style={{ padding: '32px 0 0', display: 'flex', flexDirection: 'column', gap: 32 }}>
                        
                        {/* Strengths & Weaknesses Grid */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>
                          <div style={{ background: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.2)', padding: 24, borderRadius: 16 }}>
                            <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#10b981', display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                              <Award size={18} /> Core Strengths
                            </h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                              {result.strengths?.length > 0 ? result.strengths.map((str, i) => (
                                <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                                  <CheckCircle size={16} color="#10b981" style={{ marginTop: 2, flexShrink: 0 }} />
                                  <span style={{ fontSize: '0.95rem', color: 'var(--text-primary)', fontWeight: 500 }}>{str}</span>
                                </div>
                              )) : <span style={{ color: 'var(--text-muted)' }}>No notable strengths identified.</span>}
                            </div>
                          </div>
                          
                          <div style={{ background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.2)', padding: 24, borderRadius: 16 }}>
                            <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#ef4444', display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                              <ShieldAlert size={18} /> Areas for Growth
                            </h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                              {result.areasForImprovement?.length > 0 ? result.areasForImprovement.map((area, i) => (
                                <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                                  <AlertCircle size={16} color="#ef4444" style={{ marginTop: 2, flexShrink: 0 }} />
                                  <span style={{ fontSize: '0.95rem', color: 'var(--text-primary)', fontWeight: 500 }}>{area}</span>
                                </div>
                              )) : <span style={{ color: 'var(--text-muted)' }}>No immediate growth areas identified.</span>}
                            </div>
                          </div>
                        </div>

                        {/* AI Feedback */}
                        <div>
                          <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
                            <Zap size={20} color="var(--warning)" /> Detailed AI Feedback
                          </h4>
                          <div style={{ background: 'var(--bg-secondary)', padding: 24, borderRadius: 16, border: '1px solid var(--border-color)' }}>
                            <p style={{ color: 'var(--text-primary)', lineHeight: 1.8, fontSize: '1rem', fontWeight: 500 }}>
                              {result.aiFeedback}
                            </p>
                          </div>
                        </div>

                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>

      {/* Save Modal */}
      {showSaveModal && (
        <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="glass-card" style={{ width: '100%', maxWidth: 450, padding: 32 }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: 'var(--primary-100)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
              <Save size={24} color="var(--primary-600)" />
            </div>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 8 }}>Save AI Evaluation</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 24, fontSize: '0.95rem' }}>This will save the AI analysis and recommendations permanently to the database.</p>
            
            <form onSubmit={handleSave}>
              <div className="form-group">
                <label className="form-label">Report Title</label>
                <input
                  type="text"
                  className="form-input"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Q4 Engineering Performance Review"
                  required
                  autoFocus
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 32 }}>
                <button type="button" className="btn btn-ghost" onClick={() => setShowSaveModal(false)} style={{ padding: '12px 24px' }}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving} style={{ padding: '12px 24px' }}>
                  {saving ? 'Saving...' : 'Confirm & Save'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
