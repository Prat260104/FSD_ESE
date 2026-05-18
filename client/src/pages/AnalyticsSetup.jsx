import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Play, Plus, X, Settings2, Building, Target, Zap } from 'lucide-react';

export default function AnalyticsSetup() {
  const navigate = useNavigate();
  const [skillInput, setSkillInput] = useState('');
  
  const [criteria, setCriteria] = useState({
    targetDepartment: '',
    minPerformanceScore: '',
    requiredSkills: []
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCriteria(prev => ({ ...prev, [name]: value }));
  };

  const handleAddSkill = (e) => {
    e.preventDefault();
    if (skillInput.trim() && !criteria.requiredSkills.includes(skillInput.trim())) {
      setCriteria(prev => ({
        ...prev,
        requiredSkills: [...prev.requiredSkills, skillInput.trim()]
      }));
      setSkillInput('');
    }
  };

  const removeSkill = (skillToRemove) => {
    setCriteria(prev => ({
      ...prev,
      requiredSkills: prev.requiredSkills.filter(skill => skill !== skillToRemove)
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    navigate('/analytics/results', { state: { criteria } });
  };

  const departments = ['Engineering', 'Sales', 'Marketing', 'HR', 'Finance', 'Design', 'Product'];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      style={{ maxWidth: 750, margin: '0 auto' }}
    >
      <div style={{ textAlign: 'center', marginBottom: 40 }}>
        <div style={{ width: 64, height: 64, borderRadius: 20, background: 'linear-gradient(135deg, var(--primary-500), var(--accent-500))', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', boxShadow: '0 8px 24px rgba(99,102,241,0.3)' }}>
          <Settings2 size={32} color="#fff" />
        </div>
        <h2 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em', marginBottom: 8 }}>
          Run Performance Analytics
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', maxWidth: 500, margin: '0 auto' }}>
          Define the criteria below to evaluate employees and generate AI-driven performance insights.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="glass-card" style={{ padding: 40, display: 'flex', flexDirection: 'column', gap: 32 }}>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 24 }}>
          <div className="form-group">
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Building size={16} color="var(--primary-500)" /> Target Department
            </label>
            <select
              name="targetDepartment"
              className="form-input"
              value={criteria.targetDepartment}
              onChange={handleChange}
            >
              <option value="">All Departments</option>
              {departments.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 4 }}>
              Leave blank to evaluate the entire organization.
            </p>
          </div>

          <div className="form-group">
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Target size={16} color="var(--primary-500)" /> Minimum Score
            </label>
            <input
              type="number"
              name="minPerformanceScore"
              className="form-input"
              value={criteria.minPerformanceScore}
              onChange={handleChange}
              min="0"
              max="100"
              placeholder="e.g. 70"
            />
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 4 }}>
              Filter employees with raw performance scores above this threshold.
            </p>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Zap size={16} color="var(--primary-500)" /> Required Skills for Evaluation
          </label>
          <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
            <input
              type="text"
              className="form-input"
              style={{ flex: 1 }}
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              placeholder="e.g. Leadership, React, Communication..."
              onKeyPress={(e) => e.key === 'Enter' && handleAddSkill(e)}
            />
            <button type="button" className="btn btn-secondary" onClick={handleAddSkill} style={{ padding: '0 24px' }}>
              <Plus size={18} /> Add
            </button>
          </div>
          
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, background: 'var(--bg-secondary)', padding: '20px', borderRadius: '12px', minHeight: '80px', border: '1px dashed var(--border-color)' }}>
            {criteria.requiredSkills.map(skill => (
              <span key={skill} className="badge badge-primary" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 12px', fontSize: '0.85rem' }}>
                {skill}
                <X size={14} style={{ cursor: 'pointer', opacity: 0.7 }} onClick={() => removeSkill(skill)} onMouseOver={(e) => e.target.style.opacity = 1} onMouseOut={(e) => e.target.style.opacity = 0.7} />
              </span>
            ))}
            {criteria.requiredSkills.length === 0 && (
              <div style={{ margin: 'auto', textAlign: 'center', color: 'var(--text-muted)' }}>
                <p style={{ fontSize: '0.9rem', fontWeight: 500 }}>No required skills defined.</p>
                <p style={{ fontSize: '0.8rem' }}>The AI will only evaluate based on generic performance metrics.</p>
              </div>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 16 }}>
          <button type="submit" className="btn btn-primary" style={{ padding: '14px 40px', fontSize: '1.1rem', borderRadius: '12px', width: '100%', maxWidth: 400 }}>
            <Play size={20} fill="currentColor" />
            Launch AI Evaluation Engine
          </button>
        </div>
      </form>
    </motion.div>
  );
}
