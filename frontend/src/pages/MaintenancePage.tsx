import { useState, useEffect } from 'react';
import api from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { Wrench, Plus, CheckCircle, Clock, Search, Edit } from 'lucide-react';
import toast from 'react-hot-toast';

const STATUS_BADGES: Record<string, string> = {
  OPEN: 'badge-info',
  IN_PROGRESS: 'badge-warning',
  COMPLETED: 'badge-accent',
  CANCELLED: 'badge-neutral',
};

export default function MaintenancePage() {
  const { user } = useAuth();
  const [workOrders, setWorkOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingOrder, setEditingOrder] = useState<any>(null);
  
  // Minimal form data for demo
  const [formData, setFormData] = useState({
    title: '', description: '', assetId: '', priority: 'MEDIUM', status: 'OPEN'
  });
  
  // Need assets to select from when creating
  const [assets, setAssets] = useState<any[]>([]);

  useEffect(() => {
    loadWorkOrders();
  }, [statusFilter]);

  const loadWorkOrders = async () => {
    try {
      const params: any = {};
      if (statusFilter) params.status = statusFilter;

      const { data } = await api.get('/work-orders', { params });
      setWorkOrders(data.data?.workOrders || []);
    } catch {
      toast.error('Failed to load work orders');
    } finally {
      setLoading(false);
    }
  };

  const fetchAssetsForSelect = async () => {
    try {
       const { data } = await api.get('/assets', { params: { limit: 100 } });
       setAssets(data.data?.assets || []);
    } catch {
       toast.error('Failed to load assets');
    }
  };

  const openCreate = async () => {
    setEditingOrder(null);
    setFormData({ title: '', description: '', assetId: '', priority: 'MEDIUM', status: 'OPEN' });
    await fetchAssetsForSelect();
    setShowModal(true);
  };

  const openEdit = async (order: any) => {
    setEditingOrder(order);
    setFormData({
      title: order.title,
      description: order.description || '',
      assetId: order.assetId,
      priority: order.priority,
      status: order.status
    });
    await fetchAssetsForSelect();
    setShowModal(true);
  };

  const handleSave = async () => {
    try {
      if (editingOrder) {
        await api.put(`/work-orders/${editingOrder.id}`, formData);
        toast.success('Work order updated');
      } else {
        await api.post('/work-orders', formData);
        toast.success('Work order created');
      }
      setShowModal(false);
      loadWorkOrders();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to save');
    }
  };

  const completeOrder = async (id: string) => {
    try {
      await api.put(`/work-orders/${id}`, { status: 'COMPLETED', completedAt: new Date() });
      toast.success('Work order marked as completed!');
      loadWorkOrders();
    } catch {
      toast.error('Failed to update status');
    }
  };

  const canWrite = user?.role === 'SUPER_ADMIN' || user?.role === 'DEPT_ADMIN';

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1>Maintenance</h1>
          <p className="page-header-sub">Work orders and active repairs</p>
        </div>
        <div className="flex items-center gap-3">
          {canWrite && (
            <button className="btn btn-primary" onClick={openCreate}>
              <Plus size={18} />
              New Work Order
            </button>
          )}
        </div>
      </div>

      <div className="flex items-center gap-4" style={{ marginBottom: 'var(--space-6)' }}>
        <select
          className="input"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{ width: 180 }}
        >
          <option value="">All Status</option>
          <option value="OPEN">Open</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="COMPLETED">Completed</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
      </div>

      {loading ? (
        <div className="stagger grid-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="card skeleton" style={{ height: 180 }} />
          ))}
        </div>
      ) : workOrders.length === 0 ? (
        <div className="empty-state">
          <Wrench size={64} />
          <h3>No Work Orders</h3>
          <p>You have no active maintenance tasks right now.</p>
        </div>
      ) : (
        <div className="grid-3 stagger">
          {workOrders.map((order) => (
            <div key={order.id} className="card" style={{ display: 'flex', flexDirection: 'column' }}>
              <div className="flex justify-between items-start" style={{ marginBottom: 12 }}>
                <span className={`badge ${STATUS_BADGES[order.status]}`}>
                  {order.status.replace('_', ' ')}
                </span>
                <span className={`badge ${order.priority === 'HIGH' ? 'badge-danger' : order.priority === 'CRITICAL' ? 'badge-danger' : 'badge-neutral'}`}>
                  {order.priority}
                </span>
              </div>
              
              <h3 style={{ fontSize: '1.125rem', marginBottom: 4 }}>{order.title}</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: 16, flex: 1 }}>
                {order.description || 'No description provided.'}
              </p>

              <div style={{ background: 'rgba(255,255,255,0.03)', padding: 12, borderRadius: 8, marginBottom: 16 }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Target Asset</div>
                <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{order.asset?.name || 'Unknown Asset'}</div>
                <div style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: 'var(--primary-400)' }}>{order.asset?.assetId}</div>
              </div>

              <div className="flex justify-between items-center" style={{ marginTop: 'auto', paddingTop: 12, borderTop: '1px solid var(--border-color)' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  <Clock size={12} style={{ display: 'inline', marginRight: 4 }} />
                  {new Date(order.createdAt).toLocaleDateString()}
                </div>
                
                <div className="flex gap-2">
                  <button className="btn btn-ghost btn-sm btn-icon" onClick={() => openEdit(order)}>
                    <Edit size={16} />
                  </button>
                  {order.status !== 'COMPLETED' && (
                    <button className="btn btn-accent btn-sm btn-icon" onClick={() => completeOrder(order.id)} title="Mark Complete">
                      <CheckCircle size={16} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setShowModal(false); }}>
          <div className="modal-content">
            <div className="modal-header">
              <h2>{editingOrder ? 'Edit Work Order' : 'Create Work Order'}</h2>
              <button className="btn btn-ghost btn-icon" onClick={() => setShowModal(false)}>✕</button>
            </div>

            <div className="flex flex-col gap-4">
              <div className="input-group">
                <label>Title</label>
                <input className="input" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} placeholder="e.g., Replace broken transformer" />
              </div>
              
              <div className="input-group">
                <label>Target Asset</label>
                <select className="input" value={formData.assetId} onChange={e => setFormData({...formData, assetId: e.target.value})}>
                  <option value="">Select an asset...</option>
                  {assets.map(a => (
                    <option key={a.id} value={a.id}>{a.name} ({a.assetId})</option>
                  ))}
                </select>
              </div>

              <div className="grid-2">
                <div className="input-group">
                  <label>Priority</label>
                  <select className="input" value={formData.priority} onChange={e => setFormData({...formData, priority: e.target.value})}>
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="CRITICAL">Critical</option>
                  </select>
                </div>
                <div className="input-group">
                  <label>Status</label>
                  <select className="input" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                    <option value="OPEN">Open</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="CANCELLED">Cancelled</option>
                  </select>
                </div>
              </div>

              <div className="input-group">
                <label>Description</label>
                <textarea className="input" rows={3} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
              </div>
            </div>

            <div className="flex justify-between" style={{ marginTop: 'var(--space-6)' }}>
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSave} disabled={!formData.title || !formData.assetId}>
                {editingOrder ? 'Update Order' : 'Create Order'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
