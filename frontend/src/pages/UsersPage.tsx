import { useState, useEffect } from 'react';
import api from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { Users, Shield, UserPlus, Edit, Trash2, Search } from 'lucide-react';
import toast from 'react-hot-toast';

const ROLE_BADGES: Record<string, string> = {
  SUPER_ADMIN: 'badge-primary',
  DEPT_ADMIN: 'badge-info',
  FIELD_OFFICER: 'badge-accent',
  AUDITOR: 'badge-warning',
};

export default function UsersPage() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    email: '', password: '', name: '', role: 'FIELD_OFFICER', phone: '',
  });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const { data } = await api.get('/users');
      setUsers(data.data || []);
    } catch {
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    try {
      await api.post('/auth/register', formData);
      toast.success('User created successfully');
      setShowModal(false);
      loadUsers();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to create user');
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1>User Management</h1>
          <p className="page-header-sub">{users.length} registered users</p>
        </div>
        {currentUser?.role === 'SUPER_ADMIN' && (
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            <UserPlus size={18} /> Add User
          </button>
        )}
      </div>

      {loading ? (
        <div className="stagger" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="skeleton" style={{ height: 56, borderRadius: 8 }} />
          ))}
        </div>
      ) : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>User</th>
                <th>Role</th>
                <th>Department</th>
                <th>Status</th>
                <th>Joined</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="sidebar-avatar" style={{ width: 32, height: 32, fontSize: '0.75rem' }}>
                        {u.name?.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600 }}>{u.name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={`badge ${ROLE_BADGES[u.role] || 'badge-neutral'}`}>
                      {u.role?.replace('_', ' ')}
                    </span>
                  </td>
                  <td style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                    {u.department?.name || '—'}
                  </td>
                  <td>
                    <span className={`badge ${u.isActive ? 'badge-accent' : 'badge-danger'}`}>
                      {u.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                    {new Date(u.createdAt).toLocaleDateString('en-IN')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create User Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setShowModal(false); }}>
          <div className="modal-content">
            <div className="modal-header">
              <h2>Create New User</h2>
              <button className="btn btn-ghost btn-icon" onClick={() => setShowModal(false)}>✕</button>
            </div>

            <div className="flex flex-col gap-4">
              <div className="input-group">
                <label>Full Name</label>
                <input className="input" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="John Doe" />
              </div>
              <div className="input-group">
                <label>Email</label>
                <input className="input" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder="user@assettrust.gov.in" />
              </div>
              <div className="input-group">
                <label>Password</label>
                <input className="input" type="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} placeholder="Min 8 chars, upper+lower+number+special" />
              </div>
              <div className="input-group">
                <label>Role</label>
                <select className="input" value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })}>
                  <option value="SUPER_ADMIN">Super Admin</option>
                  <option value="DEPT_ADMIN">Dept Admin</option>
                  <option value="FIELD_OFFICER">Field Officer</option>
                  <option value="AUDITOR">Auditor</option>
                </select>
              </div>
              <div className="input-group">
                <label>Phone (optional)</label>
                <input className="input" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} placeholder="+91-XXXXXXXXXX" />
              </div>
            </div>

            <div className="flex justify-between" style={{ marginTop: 'var(--space-6)' }}>
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleCreate}>Create User</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
