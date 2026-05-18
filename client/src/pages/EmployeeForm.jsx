import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { employeeService } from '../services/dataService';
import { Save, ArrowLeft, Plus, X } from 'lucide-react';
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card"
      style={{ maxWidth: 800, margin: '0 auto', padding: '32px' }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 32 }}>
        <button onClick={() => navigate(-1)} className="btn btn-ghost" style={{ padding: 8 }}>
          <ArrowLeft size={20} />
        </button>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>
          {isEdit ? 'Edit Employee' : 'Add New Employee'}
        </h2>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          <div className="form-group">
            <label className="form-label">Full Name *</label>
            <input
              type="text"
              name="name"
              className="form-input"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="e.g. John Doe"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Email Address *</label>
            <input
              type="email"
              name="email"
              className="form-input"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="john@example.com"
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          <div className="form-group">
            <label className="form-label">Department *</label>
            <input
              type="text"
              name="department"
              className="form-input"
              value={formData.department}
              onChange={handleChange}
              required
              placeholder="e.g. Engineering, Sales, HR"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Current Position</label>
            <input
              type="text"
              name="currentPosition"
              className="form-input"
              value={formData.currentPosition}
              onChange={handleChange}
              placeholder="e.g. Senior Developer"
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          <div className="form-group">
            <label className="form-label">Performance Score (0-100) *</label>
            <input
              type="number"
              name="performanceScore"
              className="form-input"
              value={formData.performanceScore}
              onChange={handleChange}
              required
              min="0"
              max="100"
              placeholder="e.g. 85"
            />
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

        <div className="form-group">
          <label className="form-label">Skills</label>
          <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
            <input
              type="text"
              className="form-input"
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              placeholder="Type a skill and press Add"
              onKeyPress={(e) => e.key === 'Enter' && handleAddSkill(e)}
            />
            <button type="button" className="btn btn-secondary" onClick={handleAddSkill}>
              <Plus size={18} /> Add
            </button>
          </div>
          
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {formData.skills.map(skill => (
              <span key={skill} className="badge badge-primary" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                {skill}
                <X size={14} style={{ cursor: 'pointer' }} onClick={() => removeSkill(skill)} />
              </span>
            ))}
            {formData.skills.length === 0 && (
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>No skills added yet.</span>
            )}
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Bio / Notes</label>
          <textarea
            name="bio"
            className="form-input"
            rows={4}
            value={formData.bio}
            onChange={handleChange}
            placeholder="Brief background or manager notes..."
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 12 }}>
          <button type="button" className="btn btn-ghost" onClick={() => navigate('/employees')}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            <Save size={18} />
            {loading ? 'Saving...' : 'Save Employee'}
          </button>
        </div>
      </form>
    </motion.div>
  );
}
