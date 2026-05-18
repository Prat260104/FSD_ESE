import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Play, Plus, X, Settings2 } from 'lucide-react';

export default function AnalyticsSetup() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
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
    // Navigate to results page with criteria state
    navigate('/analytics/results', { state: { criteria } });
  };

  const departments = ['Engineering', 'Sales', 'Marketing', 'HR', 'Finance', 'Design', 'Product'];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card"
      style={{ maxWidth: 700, margin: '0 auto', padding: '32px' }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 32 }}>
        <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(99,102,241,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Settings2 size={24} color="var(--primary-400)" />
        </div>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            Run Performance Analytics
          </h2>
          <p style={{ color: 'var(--text-secondary)' }}>Define criteria to evaluate and rank employees</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        <div className="form-group">
          <label className="form-label">Target Department (Optional)</label>
          <select
            name="targetDepartment"
            className="form-input"
            value={criteria.targetDepartment}
            onChange={handleChange}
          >
            <option value="">All Departments</option>
            {departments.map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 4 }}>
            Leave blank to evaluate the entire organization.
          </p>
        </div>

        <div className="form-group">
          <label className="form-label">Minimum Performance Score (Optional)</label>
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
        </div>

        <div className="form-group">
          <label className="form-label">Required Skills for Evaluation</label>
          <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
            <input
              type="text"
              className="form-input"
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              placeholder="e.g. Leadership, React, Communication"
              onKeyPress={(e) => e.key === 'Enter' && handleAddSkill(e)}
            />
            <button type="button" className="btn btn-secondary" onClick={handleAddSkill}>
              <Plus size={18} /> Add
            </button>
          </div>
          
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, minHeight: 40, padding: '12px', background: 'var(--bg-secondary)', borderRadius: 8 }}>
            {criteria.requiredSkills.map(skill => (
              <span key={skill} className="badge badge-primary" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                {skill}
                <X size={14} style={{ cursor: 'pointer' }} onClick={() => removeSkill(skill)} />
              </span>
            ))}
            {criteria.requiredSkills.length === 0 && (
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 'auto' }}>
                No required skills defined.
              </span>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 12 }}>
          <button type="submit" className="btn btn-primary" style={{ padding: '12px 32px', fontSize: '1rem' }}>
            <Play size={18} />
            Run Evaluation
          </button>
        </div>
      </form>
    </motion.div>
  );
}
