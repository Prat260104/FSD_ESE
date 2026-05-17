import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { candidateService } from '../services/dataService';
import { Save, X, Plus, User, Mail, Briefcase, Code, FileText, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AddCandidate() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = !!id;

  const [form, setForm] = useState({
    name: '', email: '', experience: '', bio: '', projects: ''
  });
  const [skills, setSkills] = useState([]);
  const [skillInput, setSkillInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(isEditing);

  useEffect(() => {
    if (isEditing) {
      fetchCandidate();
    }
  }, [id]);

  const fetchCandidate = async () => {
    try {
      const res = await candidateService.getById(id);
      const c = res.data.candidate;
      setForm({ name: c.name, email: c.email, experience: c.experience.toString(), bio: c.bio || '', projects: c.projects || '' });
      setSkills(c.skills);
    } catch (err) {
      toast.error('Failed to load candidate');
      navigate('/candidates');
    } finally {
      setFetchLoading(false);
    }
  };

  const addSkill = () => {
    const trimmed = skillInput.trim();
    if (trimmed && !skills.find(s => s.toLowerCase() === trimmed.toLowerCase())) {
      setSkills([...skills, trimmed]);
      setSkillInput('');
    }
  };

  const handleSkillKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addSkill();
    }
  };

  const removeSkill = (index) => {
    setSkills(skills.filter((_, i) => i !== index));
  };

  const validate = () => {
    if (!form.name.trim()) { toast.error('Name is required'); return false; }
    if (!form.email.trim()) { toast.error('Email is required'); return false; }
    if (!/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(form.email)) { toast.error('Invalid email format'); return false; }
    if (skills.length === 0) { toast.error('Add at least one skill'); return false; }
    if (!form.experience || isNaN(form.experience) || parseFloat(form.experience) < 0) { toast.error('Valid experience is required'); return false; }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const payload = {
        ...form,
        experience: parseFloat(form.experience),
        skills
      };

      if (isEditing) {
        await candidateService.update(id, payload);
        toast.success('Candidate updated!');
      } else {
        await candidateService.create(payload);
        toast.success('Candidate added!');
      }
      navigate('/candidates');
    } catch (err) {
      toast.error(err.response?.data?.message || err.response?.data?.errors?.[0] || 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) {
    return <div className="glass-card loading-pulse" style={{ height: 400, padding: 24 }} />;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="glass-card" style={{ padding: '32px', maxWidth: 720, margin: '0 auto' }}>
        <h2 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: 24, color: 'var(--text-primary)' }}>
          {isEditing ? 'Edit Candidate' : 'Add New Candidate'}
        </h2>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Name & Email row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                <User size={14} /> Full Name *
              </label>
              <input
                className="input"
                placeholder="e.g. Jane Smith"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                id="candidate-name"
              />
            </div>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                <Mail size={14} /> Email *
              </label>
              <input
                type="email"
                className="input"
                placeholder="jane@example.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                id="candidate-email"
              />
            </div>
          </div>

          {/* Experience */}
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Briefcase size={14} /> Experience (years) *
            </label>
            <input
              type="number"
              step="0.5"
              min="0"
              max="50"
              className="input"
              style={{ maxWidth: 200 }}
              placeholder="e.g. 3"
              value={form.experience}
              onChange={(e) => setForm({ ...form, experience: e.target.value })}
              id="candidate-experience"
            />
          </div>

          {/* Skills */}
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Code size={14} /> Skills * <span style={{ fontWeight: 400, color: 'var(--text-muted)' }}>(press Enter to add)</span>
            </label>
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                className="input"
                placeholder="e.g. React, Node.js, Python"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={handleSkillKeyDown}
                id="candidate-skill-input"
              />
              <button type="button" className="btn btn-secondary" onClick={addSkill} id="add-skill-btn">
                <Plus size={18} />
              </button>
            </div>
            {skills.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 12 }}>
                {skills.map((skill, i) => (
                  <motion.span
                    key={skill}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="badge badge-skill"
                    style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 10px', cursor: 'pointer' }}
                    onClick={() => removeSkill(i)}
                    title="Click to remove"
                  >
                    {skill}
                    <X size={12} />
                  </motion.span>
                ))}
              </div>
            )}
          </div>

          {/* Bio */}
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
              <FileText size={14} /> Bio / Summary
            </label>
            <textarea
              className="input"
              rows={3}
              placeholder="Brief professional summary..."
              value={form.bio}
              onChange={(e) => setForm({ ...form, bio: e.target.value })}
              style={{ resize: 'vertical', minHeight: 80 }}
              id="candidate-bio"
            />
          </div>

          {/* Projects */}
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Code size={14} /> Projects / Portfolio
            </label>
            <textarea
              className="input"
              rows={3}
              placeholder="Describe notable projects..."
              value={form.projects}
              onChange={(e) => setForm({ ...form, projects: e.target.value })}
              style={{ resize: 'vertical', minHeight: 80 }}
              id="candidate-projects"
            />
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 8 }}>
            <button type="button" className="btn btn-secondary" onClick={() => navigate('/candidates')}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading} id="save-candidate-btn">
              {loading ? (
                <span className="loading-pulse">{isEditing ? 'Updating...' : 'Saving...'}</span>
              ) : (
                <><Save size={18} /> {isEditing ? 'Update Candidate' : 'Save Candidate'}</>
              )}
            </button>
          </div>
        </form>
      </div>
    </motion.div>
  );
}
