import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { evaluationService } from '../services/dataService';
import { BookmarkCheck, Trash2, Calendar, ChevronDown, User, Brain, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function SavedEvaluations() {
  const [evaluations, setEvaluations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    fetchEvaluations();
  }, []);

  const fetchEvaluations = async () => {
    try {
      const res = await evaluationService.getAll({ limit: 50 });
      setEvaluations(res.data.evaluations);
    } catch (err) {
      toast.error('Failed to load saved evaluations');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this evaluation report?')) {
      try {
        await evaluationService.delete(id);
        toast.success('Report deleted successfully');
        setEvaluations(evaluations.filter(e => e._id !== id));
      } catch (err) {
        toast.error('Failed to delete report');
      }
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {[1, 2, 3].map(i => (
          <div key={i} className="glass-card loading-pulse" style={{ height: 120 }} />
        ))}
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: 12 }}>
          <BookmarkCheck color="var(--primary-400)" /> Saved Evaluations
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>View past employee performance and AI analytics reports.</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {evaluations.length > 0 ? evaluations.map((evalReport, index) => {
          const isExpanded = expandedId === evalReport._id;
          return (
            <motion.div 
              key={evalReport._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="glass-card"
              style={{ overflow: 'hidden' }}
            >
              {/* Header (Clickable) */}
              <div 
                onClick={() => setExpandedId(isExpanded ? null : evalReport._id)}
                style={{ padding: '24px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16, background: isExpanded ? 'rgba(255,255,255,0.02)' : 'transparent' }}
              >
                <div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
                    {evalReport.title}
                  </h3>
                  <div style={{ display: 'flex', gap: 16, color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Calendar size={14} /> {new Date(evalReport.createdAt).toLocaleDateString()}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <User size={14} /> {evalReport.employees.length} Employees Evaluated
                    </span>
                    {evalReport.aiAnalysisSummary && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#a855f7' }}>
                        <Brain size={14} /> AI Enhanced
                      </span>
                    )}
                  </div>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleDelete(evalReport._id); }}
                    className="btn btn-ghost"
                    style={{ color: 'var(--error)', padding: 8 }}
                  >
                    <Trash2 size={18} />
                  </button>
                  <ChevronDown size={20} color="var(--text-muted)" style={{ transform: isExpanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.3s' }} />
                </div>
              </div>

              {/* Expanded Content */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} style={{ overflow: 'hidden' }}>
                    <div style={{ padding: '0 24px 24px', borderTop: '1px solid var(--border-color)' }}>
                      
                      {/* Target Criteria */}
                      <div style={{ padding: '20px 0', display: 'flex', gap: 24, borderBottom: '1px solid var(--border-color)' }}>
                        <div>
                          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: 4 }}>TARGET DEPARTMENT</p>
                          <p style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{evalReport.criteria?.targetDepartment || 'Any'}</p>
                        </div>
                        <div>
                          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: 4 }}>REQUIRED SKILLS</p>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                            {evalReport.criteria?.requiredSkills?.length > 0 ? (
                              evalReport.criteria.requiredSkills.map(s => <span key={s} className="badge badge-secondary">{s}</span>)
                            ) : <span style={{ color: 'var(--text-secondary)' }}>None</span>}
                          </div>
                        </div>
                      </div>

                      {/* AI Summary (if any) */}
                      {evalReport.aiAnalysisSummary && (
                        <div style={{ padding: '20px 0', borderBottom: '1px solid var(--border-color)' }}>
                          <p style={{ fontSize: '0.8rem', color: '#a855f7', fontWeight: 600, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                            <Brain size={14} /> AI EXECUTIVE SUMMARY
                          </p>
                          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6 }}>{evalReport.aiAnalysisSummary}</p>
                        </div>
                      )}

                      {/* Evaluated Employees Table */}
                      <div style={{ paddingTop: 20 }}>
                        <h4 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 16 }}>Evaluated Employees</h4>
                        <div className="table-container">
                          <table className="table">
                            <thead>
                              <tr>
                                <th>Name</th>
                                <th>Score</th>
                                <th>Recommendation</th>
                                <th>AI Feedback</th>
                              </tr>
                            </thead>
                            <tbody>
                              {evalReport.employees.map((empResult) => (
                                <tr key={empResult._id}>
                                  <td style={{ fontWeight: 600 }}>{empResult.employee?.name || 'Unknown'}</td>
                                  <td>
                                    <span className={`badge ${empResult.evaluationScore >= 80 ? 'badge-high' : empResult.evaluationScore >= 60 ? 'badge-medium' : 'badge-low'}`}>
                                      {empResult.evaluationScore}
                                    </span>
                                  </td>
                                  <td>{empResult.recommendation}</td>
                                  <td style={{ maxWidth: 300, color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                                    {empResult.aiFeedback || 'N/A'}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                      
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        }) : (
          <div className="glass-card" style={{ padding: 60, textAlign: 'center' }}>
            <BookmarkCheck size={48} color="var(--text-muted)" style={{ margin: '0 auto 16px', opacity: 0.5 }} />
            <h3 style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--text-primary)' }}>No Saved Evaluations</h3>
            <p style={{ color: 'var(--text-secondary)' }}>You haven't saved any employee evaluations yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
