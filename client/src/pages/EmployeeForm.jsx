import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { employeeService } from '../services/dataService';
import { Save, ArrowLeft, Plus, X, User, Briefcase, Mail, Award, Target, FileText } from 'lucide-react';
import toast from 'react-hot-toast';

export default function EmployeeForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

  const [loading, setLoading] = useState(false);
  const [skillInput, setSkillInput] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    department: '',
    performanceScore: '',
    experience: '',
    skills: [],
    currentPosition: '',
    bio: ''
  });

  useEffect(() => {
    if (isEdit) {
      fetchEmployee();
    }
  }, [id]);

  const fetchEmployee = async () => {
    try {
      const res = await employeeService.getById(id);
      setFormData(res.data.employee);
    } catch (err) {
      toast.error('Failed to load employee details');
      navigate('/employees');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddSkill = (e) => {
    e.preventDefault();
    if (skillInput.trim() && !formData.skills.includes(skillInput.trim())) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, skillInput.trim()]
      }));
      setSkillInput('');
    }
  };

  const removeSkill = (skillToRemove) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isEdit) {
        await employeeService.update(id, formData);
        toast.success('Employee updated successfully');
      } else {
        await employeeService.create(formData);
        toast.success('Employee added successfully');
      }
      navigate('/employees');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save employee');
    } finally {
      setLoading(false);
    }
  };

  const departments = ['Engineering', 'Sales', 'Marketing', 'HR', 'Finance', 'Design', 'Product'];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      style={{ maxWidth: 850, margin: '0 auto', paddingBottom: 40 }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
        <button onClick={() => navigate(-1)} className="btn btn-ghost" style={{ padding: 8, background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '50%' }}>
          <ArrowLeft size={20} />
        </button>
        <div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            {isEdit ? 'Edit Employee Profile' : 'Register New Employee'}
          </h2>
          <p style={{ color: 'var(--text-secondary)' }}>Fill in the details below to track performance and AI insights.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        {/* Personal Details Section */}
        <div className="glass-card" style={{ padding: '32px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 20, color: 'var(--primary-500)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <User size={18} /> Personal Information
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>
            <div className="form-group">
              <label className="form-label">Full Name *</label>
              <div style={{ position: 'relative' }}>
                <User size={18} style={{ position: 'absolute', left: 14, top: 14, color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  name="name"
                  className="form-input"
                  style={{ paddingLeft: 42 }}
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="e.g. John Doe"
                />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Email Address *</label>
              <div style={{ position: 'relative' }}>
                <Mail size={18} style={{ position: 'absolute', left: 14, top: 14, color: 'var(--text-muted)' }} />
                <input
                  type="email"
                  name="email"
                  className="form-input"
                  style={{ paddingLeft: 42 }}
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="john@example.com"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Corporate Details Section */}
        <div className="glass-card" style={{ padding: '32px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 20, color: 'var(--primary-500)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Briefcase size={18} /> Role & Department
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>
            <div className="form-group">
              <label className="form-label">Department *</label>
              <select
                name="department"
                className="form-input"
                value={formData.department}
                onChange={handleChange}
                required
              >
                <option value="" disabled>Select Department</option>
                {departments.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Current Position</label>
              <input
                type="text"
                name="currentPosition"
                className="form-input"
                value={formData.currentPosition}
                onChange={handleChange}
                placeholder="e.g. Senior Frontend Developer"
              />
            </div>
          </div>
        </div>

        {/* Performance Metrics Section */}
        <div className="glass-card" style={{ padding: '32px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 20, color: 'var(--primary-500)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Target size={18} /> Performance Metrics
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>
            <div className="form-group">
              <label className="form-label">Performance Score (0-100) *</label>
              <div style={{ position: 'relative' }}>
                <Award size={18} style={{ position: 'absolute', left: 14, top: 14, color: 'var(--text-muted)' }} />
                <input
                  type="number"
                  name="performanceScore"
                  className="form-input"
                  style={{ paddingLeft: 42 }}
                  value={formData.performanceScore}
                  onChange={handleChange}
                  required
                  min="0"
                  max="100"
                  placeholder="e.g. 85"
                />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Years of Experience *</label>
              <input
                type="number"
                name="experience"
                className="form-input"
                value={formData.experience}
                onChange={handleChange}
                required
                min="0"
                step="0.5"
                placeholder="e.g. 3.5"
              />
            </div>
          </div>

          <div className="form-group" style={{ marginTop: 24 }}>
            <label className="form-label">Professional Skills</label>
            <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
              <input
                type="text"
                className="form-input"
                style={{ flex: 1 }}
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                placeholder="Type a skill and press Enter or Add..."
                onKeyPress={(e) => e.key === 'Enter' && handleAddSkill(e)}
              />
              <button type="button" className="btn btn-secondary" onClick={handleAddSkill} style={{ padding: '0 24px' }}>
                <Plus size={18} /> Add
              </button>
            </div>
            
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, background: 'var(--bg-secondary)', padding: '16px', borderRadius: '12px', minHeight: '60px' }}>
              {formData.skills.map(skill => (
                <span key={skill} className="badge badge-primary" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 12px', fontSize: '0.85rem' }}>
                  {skill}
                  <X size={14} style={{ cursor: 'pointer', opacity: 0.7 }} onClick={() => removeSkill(skill)} onMouseOver={(e) => e.target.style.opacity = 1} onMouseOut={(e) => e.target.style.opacity = 0.7} />
                </span>
              ))}
              {formData.skills.length === 0 && (
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 'auto' }}>No skills added yet. Add some above!</span>
              )}
            </div>
          </div>

          <div className="form-group" style={{ marginTop: 24 }}>
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <FileText size={16} /> Manager Notes / Bio
            </label>
            <textarea
              name="bio"
              className="form-input"
              rows={4}
              value={formData.bio}
              onChange={handleChange}
              placeholder="Brief background, achievements, or manager notes..."
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
          <button type="button" className="btn btn-ghost" onClick={() => navigate('/employees')} style={{ padding: '12px 24px' }}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={loading} style={{ padding: '12px 32px', fontSize: '1rem', borderRadius: '12px' }}>
            <Save size={20} />
            {loading ? 'Saving Profile...' : 'Save Employee Profile'}
          </button>
        </div>
      </form>
    </motion.div>
  );
}
