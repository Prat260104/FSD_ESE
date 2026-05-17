import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { shortlistService } from '../services/dataService';
import { BookmarkCheck, Trash2, Eye, X, Download, Calendar, Users, ChevronLeft, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';

export default function SavedShortlists() {
  const [shortlists, setShortlists] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  useEffect(() => { fetchShortlists(); }, [page]);

  const fetchShortlists = async () => {
    setLoading(true);
    try {
      const res = await shortlistService.getAll({ page, limit: 10 });
      setShortlists(res.data.shortlists);
      setPagination(res.data.pagination);
    } catch { toast.error('Failed to load shortlists'); }
    finally { setLoading(false); }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await shortlistService.delete(deleteId);
      toast.success('Shortlist deleted');
      setDeleteId(null);
      fetchShortlists();
    } catch { toast.error('Failed to delete'); }
  };

  const exportPDF = async (shortlist) => {
    try {
      const { jsPDF } = await import('jspdf');
      const { default: autoTable } = await import('jspdf-autotable');
      const doc = new jsPDF();

      doc.setFontSize(18);
      doc.setTextColor(99, 102, 241);
      doc.text('HireAI — Shortlist Report', 14, 22);

      doc.setFontSize(12);
      doc.setTextColor(60, 60, 60);
      doc.text(shortlist.title, 14, 32);
      doc.setFontSize(9);
      doc.setTextColor(120, 120, 120);
      doc.text(`Generated: ${new Date(shortlist.createdAt).toLocaleString()}`, 14, 38);

      if (shortlist.jobRequirements?.requiredSkills?.length) {
        doc.text(`Required: ${shortlist.jobRequirements.requiredSkills.join(', ')}`, 14, 44);
      }

      const rows = shortlist.candidates.map((c, i) => [
        i + 1,
        c.candidate?.name || 'N/A',
        c.candidate?.email || 'N/A',
        `${c.matchScore}%`,
        (c.matchedSkills || []).join(', '),
        (c.missingSkills || []).join(', '),
        c.recommendation || 'N/A'
      ]);

      autoTable(doc, {
        startY: 50,
        head: [['#', 'Name', 'Email', 'Score', 'Matched Skills', 'Missing Skills', 'Recommendation']],
        body: rows,
        styles: { fontSize: 8, cellPadding: 3 },
        headStyles: { fillColor: [99, 102, 241], textColor: 255 },
        alternateRowStyles: { fillColor: [245, 247, 250] }
      });

      doc.save(`${shortlist.title.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`);
      toast.success('PDF exported!');
    } catch (err) {
      console.error(err);
      toast.error('PDF export failed');
    }
  };

  const getColor = (s) => s >= 75 ? 'var(--success)' : s >= 50 ? 'var(--warning)' : 'var(--error)';

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {[1, 2, 3].map(i => <div key={i} className="glass-card loading-pulse" style={{ height: 120, padding: 24 }} />)}
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h2 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: 4 }}>Saved Shortlists</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>View and manage your saved candidate shortlists</p>
      </motion.div>

      {shortlists.length === 0 ? (
        <div className="glass-card" style={{ padding: '60px 24px', textAlign: 'center' }}>
          <BookmarkCheck size={56} style={{ color: 'var(--text-muted)', opacity: 0.3, marginBottom: 16 }} />
          <h3 style={{ fontWeight: 600, marginBottom: 8 }}>No Shortlists Yet</h3>
          <p style={{ color: 'var(--text-muted)' }}>Run a match or AI analysis and save the results to see them here.</p>
        </div>
      ) : (
        shortlists.map((sl, i) => (
          <motion.div key={sl._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="glass-card" style={{ padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
              <div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: 4 }}>{sl.title}</h3>
                <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Calendar size={14} /> {new Date(sl.createdAt).toLocaleDateString()}
                  </span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Users size={14} /> {sl.candidates?.length || 0} candidates
                  </span>
                </div>
                {sl.jobRequirements?.requiredSkills?.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 10 }}>
                    {sl.jobRequirements.requiredSkills.map(s => <span key={s} className="badge badge-skill">{s}</span>)}
                  </div>
                )}
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn btn-ghost btn-sm" onClick={() => setSelected(sl)}><Eye size={14} /> View</button>
                <button className="btn btn-ghost btn-sm" onClick={() => exportPDF(sl)}><Download size={14} /> PDF</button>
                <button className="btn btn-ghost btn-sm" style={{ color: 'var(--error)' }} onClick={() => setDeleteId(sl._id)}><Trash2 size={14} /></button>
              </div>
            </div>
          </motion.div>
        ))
      )}

      {pagination.totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 12, alignItems: 'center' }}>
          <button className="btn btn-ghost btn-sm" disabled={!pagination.hasPrevPage} onClick={() => setPage(p => p - 1)}><ChevronLeft size={18} /> Prev</button>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Page {pagination.currentPage} of {pagination.totalPages}</span>
          <button className="btn btn-ghost btn-sm" disabled={!pagination.hasNextPage} onClick={() => setPage(p => p + 1)}>Next <ChevronRight size={18} /></button>
        </div>
      )}

      {/* Detail Modal */}
      <AnimatePresence>
        {selected && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="modal-overlay" onClick={() => setSelected(null)}>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="modal-content" style={{ maxWidth: 700, padding: 32 }} onClick={e => e.stopPropagation()}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h2 style={{ fontSize: '1.2rem', fontWeight: 700 }}>{selected.title}</h2>
                <button className="btn btn-ghost" style={{ padding: 8 }} onClick={() => setSelected(null)}><X size={20} /></button>
              </div>

              {selected.candidates?.map((c, i) => (
                <div key={i} style={{ padding: 16, marginBottom: 12, background: 'var(--bg-secondary)', borderRadius: 12, border: '1px solid var(--border-color)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <div>
                      <h4 style={{ fontWeight: 700 }}>{c.candidate?.name || 'N/A'}</h4>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{c.candidate?.email}</p>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <p style={{ fontSize: '1.25rem', fontWeight: 800, color: getColor(c.matchScore) }}>{c.matchScore}%</p>
                      <span className={`badge ${c.matchScore >= 75 ? 'badge-high' : c.matchScore >= 50 ? 'badge-medium' : 'badge-low'}`} style={{ fontSize: '0.65rem' }}>{c.recommendation}</span>
                    </div>
                  </div>
                  <div className="progress-bar" style={{ height: 6 }}>
                    <div className={`progress-bar-fill ${c.matchScore >= 75 ? 'progress-high' : c.matchScore >= 50 ? 'progress-medium' : 'progress-low'}`} style={{ width: `${c.matchScore}%` }} />
                  </div>
                  <div style={{ display: 'flex', gap: 12, marginTop: 10, flexWrap: 'wrap' }}>
                    <div>
                      <p style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: 4 }}>Matched</p>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                        {c.matchedSkills?.map(s => <span key={s} className="badge badge-high" style={{ fontSize: '0.65rem' }}>{s}</span>)}
                      </div>
                    </div>
                    <div>
                      <p style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: 4 }}>Missing</p>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                        {c.missingSkills?.map(s => <span key={s} className="badge badge-low" style={{ fontSize: '0.65rem' }}>{s}</span>)}
                      </div>
                    </div>
                  </div>
                  {c.aiExplanation && <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: 8, fontStyle: 'italic' }}>{c.aiExplanation}</p>}
                </div>
              ))}

              <button className="btn btn-primary" style={{ width: '100%', marginTop: 8 }} onClick={() => exportPDF(selected)}><Download size={18} /> Export as PDF</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Modal */}
      <AnimatePresence>
        {deleteId && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="modal-overlay" onClick={() => setDeleteId(null)}>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="modal-content" style={{ maxWidth: 400, padding: 32, textAlign: 'center' }} onClick={e => e.stopPropagation()}>
              <Trash2 size={40} color="var(--error)" style={{ marginBottom: 16 }} />
              <h3 style={{ fontWeight: 700, marginBottom: 8 }}>Delete Shortlist?</h3>
              <p style={{ color: 'var(--text-secondary)', marginBottom: 20 }}>This action cannot be undone.</p>
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
