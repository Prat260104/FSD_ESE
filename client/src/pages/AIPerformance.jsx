import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { aiService, evaluationService } from '../services/dataService';
import { Brain, ArrowLeft, Loader, Zap, Sparkles, AlertCircle, Save, ChevronDown, CheckCircle, Target, Award } from 'lucide-react';
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
        <div style={{ position: 'relative', width: 120, height: 120, marginBottom: 32 }}>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            style={{ position: 'absolute', inset: 0, border: '4px solid transparent', borderTopColor: 'var(--primary-400)', borderRadius: '50%' }}
          />
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            style={{ position: 'absolute', inset: 10, border: '4px solid transparent', borderLeftColor: 'var(--accent-400)', borderRadius: '50%' }}
          />
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Brain size={40} color="var(--primary-300)" />
          </div>
        </div>
        <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 12, background: 'linear-gradient(to right, #6366f1, #a855f7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          OpenRouter AI is analyzing performance...
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', maxWidth: 400, textAlign: 'center' }}>
          Evaluating employee skills, scores, and generating actionable feedback and promotion recommendations.
        </p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <button onClick={() => navigate(-1)} className="btn btn-ghost" style={{ padding: 8 }}>
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 12 }}>
              <Brain color="var(--primary-400)" /> AI Performance Insights
            </h1>
          </div>
        </div>
        <button className="btn btn-primary" onClick={() => setShowSaveModal(true)}>
          <Save size={18} /> Save AI Report
        </button>
      </div>

      {/* AI Summary Banner */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card" style={{ padding: 32, background: 'linear-gradient(135deg, rgba(99,102,241,0.05), rgba(168,85,247,0.05))', border: '1px solid rgba(99,102,241,0.2)' }}>
        <div style={{ display: 'flex', gap: 20 }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, background: 'var(--bg-card)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
            <Sparkles size={24} color="var(--primary-400)" />
          </div>
          <div style={{ flex: 1 }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>AI Executive Summary</h3>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, fontSize: '0.95rem' }}>
              {data?.summary?.aiAnalysis}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Results List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {data?.results.map((result, index) => {
          const isExpanded = expandedId === result.employee._id;
          return (
            <motion.div key={result.employee._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }} className="glass-card" style={{ overflow: 'hidden' }}>
              {/* Header (Clickable) */}
              <div 
                onClick={() => setExpandedId(isExpanded ? null : result.employee._id)}
                style={{ padding: '24px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 24, background: isExpanded ? 'rgba(255,255,255,0.02)' : 'transparent' }}
              >
                <div style={{ width: 80, display: 'flex', flexDirection: 'column', alignItems: 'center', borderRight: '1px solid var(--border-color)', paddingRight: 24 }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>AI RANK</span>
                  <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>#{result.rank}</span>
                </div>
                
                <div style={{ flex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
                  <div>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
                      {result.employee.name}
                      <span className={`badge ${result.aiScore >= 80 ? 'badge-high' : result.aiScore >= 60 ? 'badge-medium' : 'badge-low'}`}>
                        AI Score: {result.aiScore}
                      </span>
                    </h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: 4 }}>
                      {result.employee.department} • {result.employee.experience} yrs exp • Raw Perf: {result.evaluationScore}/100
                    </p>
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: 4 }}>RECOMMENDATION</p>
                      <p style={{ fontSize: '1rem', fontWeight: 700, color: result.recommendation.includes('Promot') ? '#10b981' : 'var(--text-primary)' }}>
                        {result.recommendation}
                      </p>
                    </div>
                    <ChevronDown size={20} color="var(--text-muted)" style={{ transform: isExpanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.3s' }} />
                  </div>
                </div>
              </div>

              {/* Expanded Content */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} style={{ overflow: 'hidden' }}>
                    <div style={{ padding: '0 24px 24px', borderTop: '1px solid var(--border-color)' }}>
                      <div style={{ padding: '24px 0 0', display: 'flex', flexDirection: 'column', gap: 24 }}>
                        
                        {/* AI Feedback */}
                        <div>
                          <h4 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                            <Brain size={16} color="var(--primary-400)" /> AI Evaluation & Feedback
                          </h4>
                          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, background: 'var(--bg-secondary)', padding: 16, borderRadius: 8, fontSize: '0.95rem' }}>
                            {result.aiFeedback}
                          </p>
                        </div>

                        {/* Strengths & Weaknesses */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 20 }}>
                          <div>
                            <h4 style={{ fontSize: '0.85rem', fontWeight: 600, color: '#10b981', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
                              <Award size={14} /> Key Strengths
                            </h4>
                            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
                              {result.strengths?.length > 0 ? result.strengths.map((str, i) => (
                                <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                                  <CheckCircle size={14} color="#10b981" style={{ marginTop: 3, flexShrink: 0 }} />
                                  <span>{str}</span>
                                </li>
                              )) : <li style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>None identified</li>}
                            </ul>
                          </div>
                          
                          <div>
                            <h4 style={{ fontSize: '0.85rem', fontWeight: 600, color: '#ef4444', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
                              <Target size={14} /> Areas for Growth
                            </h4>
                            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
                              {result.areasForImprovement?.length > 0 ? result.areasForImprovement.map((area, i) => (
                                <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                                  <AlertCircle size={14} color="#ef4444" style={{ marginTop: 3, flexShrink: 0 }} />
                                  <span>{area}</span>
                                </li>
                              )) : <li style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>None identified</li>}
                            </ul>
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
        <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="glass-card" style={{ width: '100%', maxWidth: 400, padding: 24 }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 16 }}>Save AI Evaluation</h3>
            <form onSubmit={handleSave}>
              <div className="form-group">
                <label className="form-label">Report Title</label>
                <input
                  type="text"
                  className="form-input"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. AI Leadership Assessment 2024"
                  required
                  autoFocus
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 24 }}>
                <button type="button" className="btn btn-ghost" onClick={() => setShowSaveModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Saving...' : 'Save Report'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
