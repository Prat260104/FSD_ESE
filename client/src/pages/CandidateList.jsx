import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { candidateService } from '../services/dataService';
import { Search, Filter, UserPlus, Edit3, Trash2, Eye, ChevronLeft, ChevronRight, Users, X, Mail, Briefcase } from 'lucide-react';
import toast from 'react-hot-toast';

export default function CandidateList() {
  const [candidates, setCandidates] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [skillFilter, setSkillFilter] = useState('');
  const [minExp, setMinExp] = useState('');
  const [maxExp, setMaxExp] = useState('');
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  useEffect(() => {
    fetchCandidates();
  }, [page]);

  const fetchCandidates = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 12 };
      if (search) params.search = search;
      if (skillFilter) params.skill = skillFilter;
      if (minExp) params.minExp = minExp;
      if (maxExp) params.maxExp = maxExp;

      const res = await candidateService.getAll(params);
      setCandidates(res.data.candidates);
      setPagination(res.data.pagination);
    } catch (err) {
      toast.error('Failed to load candidates');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchCandidates();
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await candidateService.delete(deleteId);
      toast.success('Candidate deleted');
      setDeleteId(null);
      fetchCandidates();
    } catch (err) {
      toast.error('Failed to delete candidate');
    }
  };

  const clearFilters = () => {
    setSearch('');
    setSkillFilter('');
    setMinExp('');
    setMaxExp('');
    setPage(1);
    setTimeout(fetchCandidates, 0);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Search & Filter Bar */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="glass-card" style={{ padding: '20px 24px' }}>
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: 220 }}>
            <Search size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              className="input"
              style={{ paddingLeft: 42 }}
              placeholder="Search by name, email, skill..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              id="search-candidates"
            />
          </div>
          <button type="submit" className="btn btn-primary" id="search-btn">Search</button>
          <button type="button" className="btn btn-ghost" onClick={() => setShowFilters(!showFilters)}>
            <Filter size={18} /> Filters
          </button>
          <Link to="/candidates/new" className="btn btn-primary" id="add-candidate-btn">
            <UserPlus size={18} /> Add Candidate
          </Link>
        </form>

        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              style={{ overflow: 'hidden' }}
            >
              <div style={{ display: 'flex', gap: 12, marginTop: 16, flexWrap: 'wrap', alignItems: 'flex-end' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: 4, display: 'block' }}>Skill</label>
                  <input className="input" placeholder="e.g. React" value={skillFilter} onChange={(e) => setSkillFilter(e.target.value)} style={{ width: 150 }} />
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: 4, display: 'block' }}>Min Exp</label>
                  <input type="number" className="input" placeholder="0" value={minExp} onChange={(e) => setMinExp(e.target.value)} style={{ width: 100 }} />
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: 4, display: 'block' }}>Max Exp</label>
                  <input type="number" className="input" placeholder="50" value={maxExp} onChange={(e) => setMaxExp(e.target.value)} style={{ width: 100 }} />
                </div>
                <button className="btn btn-ghost btn-sm" onClick={clearFilters}>Clear Filters</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Candidates Grid */}
      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="glass-card loading-pulse" style={{ height: 200, padding: 24 }} />
          ))}
        </div>
      ) : candidates.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card" style={{ padding: '60px 24px', textAlign: 'center' }}>
          <Users size={56} style={{ color: 'var(--text-muted)', opacity: 0.3, marginBottom: 16 }} />
          <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 8 }}>No Candidates Found</h3>
          <p style={{ color: 'var(--text-muted)', marginBottom: 20, maxWidth: 400, margin: '0 auto 20px' }}>
            {search || skillFilter ? 'Try adjusting your search or filters.' : 'Get started by adding your first candidate.'}
          </p>
          <Link to="/candidates/new" className="btn btn-primary"><UserPlus size={18} /> Add Candidate</Link>
        </motion.div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
          {candidates.map((c, i) => (
            <motion.div
              key={c._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="glass-card"
              style={{ padding: '24px', cursor: 'pointer' }}
              onClick={() => setSelectedCandidate(c)}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: 12,
                    background: `linear-gradient(135deg, ${['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'][i % 5]}, ${['#818cf8', '#a78bfa', '#f472b6', '#fbbf24', '#34d399'][i % 5]})`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#fff', fontWeight: 700, fontSize: '1rem'
                  }}>
                    {c.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>{c.name}</h3>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Mail size={12} /> {c.email}
                    </p>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12, color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                <Briefcase size={14} /> {c.experience} years experience
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 16 }}>
                {c.skills.slice(0, 4).map(s => (
                  <span key={s} className="badge badge-skill">{s}</span>
                ))}
                {c.skills.length > 4 && <span className="badge badge-info">+{c.skills.length - 4}</span>}
              </div>

              <div style={{ display: 'flex', gap: 8 }}>
                <Link
                  to={`/candidates/${c._id}/edit`}
                  className="btn btn-ghost btn-sm"
                  onClick={(e) => e.stopPropagation()}
                  style={{ flex: 1 }}
                >
                  <Edit3 size={14} /> Edit
                </Link>
                <button
                  className="btn btn-ghost btn-sm"
                  style={{ flex: 1, color: 'var(--error)' }}
                  onClick={(e) => { e.stopPropagation(); setDeleteId(c._id); }}
                >
                  <Trash2 size={14} /> Delete
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 12, marginTop: 8 }}>
          <button className="btn btn-ghost btn-sm" disabled={!pagination.hasPrevPage} onClick={() => setPage(p => p - 1)}>
            <ChevronLeft size={18} /> Previous
          </button>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Page {pagination.currentPage} of {pagination.totalPages} ({pagination.totalCandidates} total)
          </span>
          <button className="btn btn-ghost btn-sm" disabled={!pagination.hasNextPage} onClick={() => setPage(p => p + 1)}>
            Next <ChevronRight size={18} />
          </button>
        </div>
      )}

      {/* Candidate Detail Modal */}
      <AnimatePresence>
        {selectedCandidate && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="modal-overlay"
            onClick={() => setSelectedCandidate(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="modal-content"
              style={{ maxWidth: 560, padding: '32px' }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <h2 style={{ fontSize: '1.3rem', fontWeight: 700 }}>Candidate Profile</h2>
                <button className="btn btn-ghost" style={{ padding: 8 }} onClick={() => setSelectedCandidate(null)}>
                  <X size={20} />
                </button>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
                <div style={{
                  width: 60, height: 60, borderRadius: 16,
                  background: 'linear-gradient(135deg, var(--primary-500), var(--accent-500))',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#fff', fontWeight: 700, fontSize: '1.5rem'
                }}>
                  {selectedCandidate.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>{selectedCandidate.name}</h3>
                  <p style={{ color: 'var(--text-secondary)' }}>{selectedCandidate.email}</p>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Experience</p>
                  <p style={{ fontWeight: 600 }}>{selectedCandidate.experience} years</p>
                </div>
                <div>
                  <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Skills</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {selectedCandidate.skills.map(s => (
                      <span key={s} className="badge badge-skill">{s}</span>
                    ))}
                  </div>
                </div>
                {selectedCandidate.bio && (
                  <div>
                    <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Bio</p>
                    <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: '0.9rem' }}>{selectedCandidate.bio}</p>
                  </div>
                )}
                {selectedCandidate.projects && (
                  <div>
                    <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Projects</p>
                    <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: '0.9rem' }}>{selectedCandidate.projects}</p>
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', gap: 12, marginTop: 24, justifyContent: 'flex-end' }}>
                <Link to={`/candidates/${selectedCandidate._id}/edit`} className="btn btn-primary btn-sm">
                  <Edit3 size={14} /> Edit
                </Link>
                <button className="btn btn-secondary btn-sm" onClick={() => setSelectedCandidate(null)}>Close</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="modal-overlay"
            onClick={() => setDeleteId(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="modal-content"
              style={{ maxWidth: 400, padding: '32px', textAlign: 'center' }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{
                width: 56, height: 56, borderRadius: '50%',
                background: 'var(--error-light)', margin: '0 auto 16px',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <Trash2 size={24} color="var(--error)" />
              </div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 8 }}>Delete Candidate</h3>
              <p style={{ color: 'var(--text-secondary)', marginBottom: 24, fontSize: '0.9rem' }}>
                Are you sure? This action cannot be undone.
              </p>
              <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
                <button className="btn btn-secondary" onClick={() => setDeleteId(null)}>Cancel</button>
                <button className="btn btn-danger" onClick={handleDelete}>Delete</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
