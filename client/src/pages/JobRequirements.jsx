import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { matchService } from '../services/dataService';
import { FileSearch, Plus, X, Brain, Zap, Briefcase, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function JobRequirements() {
  const navigate = useNavigate();
  const [requiredSkills, setRequiredSkills] = useState([]);
  const [preferredSkills, setPreferredSkills] = useState([]);
  const [minExperience, setMinExperience] = useState('');
  const [reqInput, setReqInput] = useState('');
  const [prefInput, setPrefInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);

  const addSkill = (type) => {
    if (type === 'required') {
      const t = reqInput.trim();
      if (t && !requiredSkills.find(s => s.toLowerCase() === t.toLowerCase())) {
        setRequiredSkills([...requiredSkills, t]);
        setReqInput('');
      }
    } else {
      const t = prefInput.trim();
      if (t && !preferredSkills.find(s => s.toLowerCase() === t.toLowerCase())) {
        setPreferredSkills([...preferredSkills, t]);
        setPrefInput('');
      }
    }
  };

  const getReq = () => ({
    requiredSkills,
    preferredSkills,
    minExperience: minExperience ? parseFloat(minExperience) : 0
  });

  const handleAlgo = async () => {
    if (requiredSkills.length === 0) { toast.error('Add at least one required skill'); return; }
    setLoading(true);
    try {
      const res = await matchService.match(getReq());
      navigate('/match/results', { state: { results: res.data, type: 'algorithm' } });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Matching failed');
    } finally { setLoading(false); }
  };

  const handleAI = async () => {
    if (requiredSkills.length === 0) { toast.error('Add at least one required skill'); return; }
    setAiLoading(true);
    try {
      const res = await matchService.aiShortlist(getReq());
      navigate('/match/results', { state: { results: res.data, type: 'ai' } });
    } catch (err) {
      toast.error(err.response?.data?.message || 'AI shortlisting failed');
    } finally { setAiLoading(false); }
  };

  const SkillSection = ({ label, icon, color, skills, setSkills, input, setInput, type, id }) => (
    <div>
      <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
        {icon} {label}
      </label>
      <div style={{ display: 'flex', gap: 8 }}>
        <input className="input" placeholder={type === 'required' ? 'e.g. React, TypeScript' : 'e.g. GraphQL, Docker'} value={input} onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill(type))} id={id} />
        <button className="btn btn-secondary" onClick={() => addSkill(type)}><Plus size={18} /></button>
      </div>
      {skills.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 12 }}>
          {skills.map((s, i) => (
            <motion.span key={s} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
              className="badge" style={{ background: `${color}15`, color, padding: '6px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
              onClick={() => setSkills(skills.filter((_, idx) => idx !== i))} title="Click to remove">
              {s} <X size={12} />
            </motion.span>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ maxWidth: 720, margin: '0 auto' }}>
      <div className="glass-card" style={{ padding: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
          <div style={{ width: 48, height: 48, borderRadius: 14, background: 'linear-gradient(135deg, var(--primary-500), var(--accent-500))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FileSearch size={24} color="#fff" />
          </div>
          <div>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 700 }}>Job Requirements</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Define what you're looking for in candidates</p>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <SkillSection label="Required Skills *" icon={<Zap size={16} color="var(--error)" />} color="#ef4444" skills={requiredSkills} setSkills={setRequiredSkills} input={reqInput} setInput={setReqInput} type="required" id="required-skill-input" />
          <SkillSection label="Preferred Skills" icon={<Zap size={16} color="var(--warning)" />} color="#f59e0b" skills={preferredSkills} setSkills={setPreferredSkills} input={prefInput} setInput={setPrefInput} type="preferred" id="preferred-skill-input" />

          <div>
            <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Briefcase size={16} /> Minimum Experience (years)
            </label>
            <input type="number" step="0.5" min="0" className="input" style={{ maxWidth: 200 }} placeholder="e.g. 2" value={minExperience} onChange={(e) => setMinExperience(e.target.value)} id="min-experience-input" />
          </div>

          <div style={{ background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.15)', borderRadius: 12, padding: 16, display: 'flex', gap: 12 }}>
            <AlertCircle size={20} color="var(--info)" style={{ flexShrink: 0, marginTop: 2 }} />
            <div>
              <p style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: 4 }}>How it works</p>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                <strong>Algorithm Match</strong> uses skill overlap + experience scoring.<br />
                <strong>AI Shortlist</strong> uses OpenRouter AI for intelligent analysis.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 12, marginTop: 8, flexWrap: 'wrap' }}>
            <button className="btn btn-primary btn-lg" onClick={handleAlgo} disabled={loading || aiLoading || requiredSkills.length === 0} id="algo-match-btn" style={{ flex: 1, minWidth: 200 }}>
              {loading ? <span className="loading-pulse">Matching...</span> : <><FileSearch size={20} /> Algorithm Match</>}
            </button>
            <button className="btn btn-lg" onClick={handleAI} disabled={loading || aiLoading || requiredSkills.length === 0} id="ai-match-btn"
              style={{ flex: 1, minWidth: 200, background: 'linear-gradient(135deg, #8b5cf6, #6366f1)', color: '#fff', boxShadow: '0 2px 12px rgba(139,92,246,0.3)', border: 'none', borderRadius: 10, fontFamily: 'var(--font-sans)', fontWeight: 600, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              {aiLoading ? <span className="loading-pulse">AI Analyzing...</span> : <><Brain size={20} /> AI Shortlist</>}
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
