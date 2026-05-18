import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { aiService, evaluationService } from '../services/dataService';
import { ArrowLeft, Brain, Save, CheckCircle, XCircle, Award, User, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function RecommendationResults() {
  const location = useLocation();
  const navigate = useNavigate();
  const criteria = location.state?.criteria;

  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState([]);
  const [summary, setSummary] = useState(null);
  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState('');
  const [showSaveModal, setShowSaveModal] = useState(false);

  useEffect(() => {
    if (!criteria) {
      navigate('/analytics');
      return;
    }
    runEvaluation();
  }, [criteria]);

  const runEvaluation = async () => {
    try {
      // Use standard evaluation endpoint (algorithmic + performance score)
      const res = await aiService.evaluate(criteria);
      setResults(res.data.results);
      setSummary(res.data.summary);
    } catch (err) {
      toast.error('Evaluation failed');
      navigate('/analytics');
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
        criteria,
        employees: results.map(r => ({
          employee: r.employee._id,
          evaluationScore: r.evaluationScore,
          strengths: r.strengths,
          areasForImprovement: r.areasForImprovement,
          recommendation: r.recommendation
        }))
      };

      await evaluationService.save(evaluationData);
      toast.success('Evaluation saved successfully');
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
      <div style={{ textAlign: 'center', padding: '100px 20px' }}>
        <div className="loading-pulse glass-card" style={{ width: 100, height: 100, margin: '0 auto 24px', borderRadius: '50%' }} />
        <h2 style={{ fontSize: '1.5rem', color: 'var(--text-primary)', marginBottom: 8 }}>Analyzing Employee Performance...</h2>
        <p style={{ color: 'var(--text-secondary)' }}>Evaluating metrics, experience, and skills...</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <button onClick={() => navigate('/analytics')} className="btn btn-ghost" style={{ padding: 8 }}>
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
              Evaluation Results
            </h1>
            <p style={{ color: 'var(--text-secondary)' }}>
              {results.length} employees evaluated against criteria
            </p>
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: 12 }}>
          <button 
            className="btn btn-primary"
            onClick={() => navigate('/ai-performance', { state: { criteria } })}
            style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}
          >
            <Brain size={18} /> Deep AI Analysis
          </button>
          <button className="btn btn-secondary" onClick={() => setShowSaveModal(true)}>
            <Save size={18} /> Save Report
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20 }}>
        <div className="glass-card" style={{ padding: 24, textAlign: 'center' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: 8 }}>Total Evaluated</p>
          <h3 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)' }}>{summary?.totalEmployees || 0}</h3>
        </div>
        <div className="glass-card" style={{ padding: 24, textAlign: 'center' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: 8 }}>Avg. Score</p>
          <h3 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--primary-400)' }}>{summary?.averageScore || 0}</h3>
        </div>
        <div className="glass-card" style={{ padding: 24, textAlign: 'center' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: 8 }}>Top Performers (80+)</p>
          <h3 style={{ fontSize: '2rem', fontWeight: 800, color: '#10b981' }}>{summary?.topPerformers || 0}</h3>
        </div>
      </div>

      {/* Results List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {results.length > 0 ? results.map((result, index) => (
          <motion.div
            key={result.employee._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="glass-card"
            style={{ padding: 24 }}
          >
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24 }}>
              {/* Score & Rank */}
              <div style={{ 
                width: 100, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                borderRight: '1px solid var(--border-color)', paddingRight: 24 
              }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: 4 }}>RANK</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>#{result.rank}</div>
                
                <div style={{ 
                  marginTop: 16, width: 70, height: 70, borderRadius: '50%', 
                  background: result.evaluationScore >= 80 ? 'rgba(16,185,129,0.1)' : result.evaluationScore >= 60 ? 'rgba(245,158,11,0.1)' : 'rgba(239,68,68,0.1)',
                  border: `3px solid ${result.evaluationScore >= 80 ? '#10b981' : result.evaluationScore >= 60 ? '#f59e0b' : '#ef4444'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexDirection: 'column'
                }}>
                  <span style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)' }}>{result.evaluationScore}</span>
                </div>
              </div>

              {/* Details */}
              <div style={{ flex: 1, minWidth: 250 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h3 style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>{result.employee.name}</h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: 12 }}>
                      {result.employee.department} • {result.employee.experience} yrs exp
                    </p>
                  </div>
                  <span className={`badge ${result.evaluationScore >= 80 ? 'badge-high' : result.evaluationScore >= 60 ? 'badge-medium' : 'badge-low'}`}>
                    {result.recommendation}
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div>
                    <p style={{ fontSize: '0.85rem', fontWeight: 600, color: '#10b981', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                      <CheckCircle size={14} /> Strengths / Matches
                    </p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {result.strengths.length > 0 ? result.strengths.map(skill => (
                        <span key={skill} style={{ fontSize: '0.75rem', padding: '4px 8px', background: 'rgba(16,185,129,0.1)', color: '#10b981', borderRadius: 4 }}>
                          {skill}
                        </span>
                      )) : <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>None matched</span>}
                    </div>
                  </div>
                  
                  <div>
                    <p style={{ fontSize: '0.85rem', fontWeight: 600, color: '#ef4444', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                      <XCircle size={14} /> Areas to Improve
                    </p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {result.areasForImprovement.length > 0 ? result.areasForImprovement.map(skill => (
                        <span key={skill} style={{ fontSize: '0.75rem', padding: '4px 8px', background: 'rgba(239,68,68,0.1)', color: '#ef4444', borderRadius: 4 }}>
                          {skill}
                        </span>
                      )) : <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>None required</span>}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )) : (
          <div className="glass-card" style={{ padding: 60, textAlign: 'center' }}>
            <AlertTriangle size={48} color="var(--text-muted)" style={{ margin: '0 auto 16px', opacity: 0.5 }} />
            <h3 style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--text-primary)' }}>No Employees Matched</h3>
            <p style={{ color: 'var(--text-secondary)' }}>Try lowering your minimum performance score or required skills.</p>
          </div>
        )}
      </div>

      {/* Save Modal */}
      {showSaveModal && (
        <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="glass-card" style={{ width: '100%', maxWidth: 400, padding: 24 }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 16 }}>Save Evaluation Report</h3>
            <form onSubmit={handleSave}>
              <div className="form-group">
                <label className="form-label">Report Title</label>
                <input
                  type="text"
                  className="form-input"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Q3 Engineering Review"
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
