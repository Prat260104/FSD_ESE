import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { employeeService } from '../services/dataService';
import { Search, Filter, Plus, Edit2, Trash2, ChevronLeft, ChevronRight, User } from 'lucide-react';
import toast from 'react-hot-toast';

export default function EmployeeList() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState(null);
  
  // Filters
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('');
  const [minPerformance, setMinPerformance] = useState('');
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchEmployees();
  }, [page, department]); // Fetch on page or department change

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (page !== 1) setPage(1);
      else fetchEmployees();
    }, 500);
    return () => clearTimeout(timer);
  }, [search, minPerformance]);

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 12 };
      if (search) params.search = search;
      if (department) params.department = department;
      if (minPerformance) params.minPerformance = minPerformance;

      const res = await employeeService.getAll(params);
      setEmployees(res.data.employees);
      setPagination(res.data.pagination);
    } catch (err) {
      toast.error('Failed to fetch employees');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this employee?')) {
      try {
        await employeeService.delete(id);
        toast.success('Employee deleted successfully');
        fetchEmployees();
      } catch (err) {
        toast.error('Failed to delete employee');
      }
    }
  };

  const departments = ['Engineering', 'Sales', 'Marketing', 'HR', 'Finance', 'Design', 'Product'];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            Employees Database
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>Manage and track employee performance</p>
        </div>
        <Link to="/employees/new" className="btn btn-primary">
          <Plus size={18} /> Add Employee
        </Link>
      </div>

      {/* Filters Bar */}
      <div className="glass-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 250, position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: 14, top: 11, color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Search by name or skills..."
              className="form-input"
              style={{ paddingLeft: 40 }}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button 
            className={`btn ${showFilters ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter size={18} /> Filters
          </button>
        </div>

        <AnimatePresence>
          {showFilters && (
            <motion.initial
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              style={{ overflow: 'hidden' }}
            >
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, paddingTop: 16, borderTop: '1px solid var(--border-color)' }}>
                <div className="form-group">
                  <label className="form-label" style={{ fontSize: '0.8rem' }}>Department</label>
                  <select 
                    className="form-input" 
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                  >
                    <option value="">All Departments</option>
                    {departments.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label" style={{ fontSize: '0.8rem' }}>Min Performance Score</label>
                  <input 
                    type="number" 
                    className="form-input" 
                    placeholder="e.g. 70"
                    value={minPerformance}
                    onChange={(e) => setMinPerformance(e.target.value)}
                  />
                </div>
              </div>
            </motion.initial>
          )}
        </AnimatePresence>
      </div>

      {/* Grid */}
      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="glass-card loading-pulse" style={{ height: 280 }} />
          ))}
        </div>
      ) : employees.length > 0 ? (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
            {employees.map((emp, i) => (
              <motion.div
                key={emp._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="glass-card"
                style={{ padding: 24, display: 'flex', flexDirection: 'column' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <User size={24} color="var(--text-secondary)" />
                    </div>
                    <div>
                      <h3 style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '1.1rem' }}>{emp.name}</h3>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{emp.currentPosition || emp.department}</p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <Link to={`/employees/${emp._id}/edit`} className="btn btn-ghost" style={{ padding: 6, color: 'var(--primary-400)' }}>
                      <Edit2 size={16} />
                    </Link>
                    <button onClick={() => handleDelete(emp._id)} className="btn btn-ghost" style={{ padding: 6, color: 'var(--error)' }}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                
                <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
                  <span className="badge badge-info">{emp.department}</span>
                  <span className={`badge ${emp.performanceScore >= 80 ? 'badge-high' : emp.performanceScore >= 60 ? 'badge-medium' : 'badge-low'}`}>
                    Score: {emp.performanceScore}
                  </span>
                  <span className="badge badge-secondary">{emp.experience} yrs exp</span>
                </div>

                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 8, fontWeight: 500 }}>Core Skills:</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {emp.skills.slice(0, 5).map(skill => (
                      <span key={skill} style={{ fontSize: '0.75rem', background: 'var(--bg-secondary)', padding: '4px 8px', borderRadius: 6, color: 'var(--text-primary)' }}>
                        {skill}
                      </span>
                    ))}
                    {emp.skills.length > 5 && (
                      <span style={{ fontSize: '0.75rem', background: 'var(--bg-secondary)', padding: '4px 8px', borderRadius: 6, color: 'var(--text-muted)' }}>
                        +{emp.skills.length - 5} more
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Pagination */}
          {pagination?.totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 16, marginTop: 24 }}>
              <button 
                className="btn btn-secondary" 
                disabled={!pagination.hasPrevPage}
                onClick={() => setPage(p => p - 1)}
              >
                <ChevronLeft size={18} /> Prev
              </button>
              <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                Page <strong style={{ color: 'var(--text-primary)' }}>{pagination.currentPage}</strong> of {pagination.totalPages}
              </span>
              <button 
                className="btn btn-secondary" 
                disabled={!pagination.hasNextPage}
                onClick={() => setPage(p => p + 1)}
              >
                Next <ChevronRight size={18} />
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="glass-card" style={{ padding: '60px 20px', textAlign: 'center' }}>
          <User size={48} color="var(--text-muted)" style={{ margin: '0 auto 16px', opacity: 0.5 }} />
          <h3 style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 8 }}>No Employees Found</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>
            Try adjusting your search filters or add a new employee to the database.
          </p>
          <Link to="/employees/new" className="btn btn-primary">
            <Plus size={18} /> Add Employee
          </Link>
        </div>
      )}
    </div>
  );
}
