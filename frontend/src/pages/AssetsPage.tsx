import { useState, useEffect } from 'react';
import api from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import {
  Package, Plus, Search, Filter, ChevronLeft, ChevronRight,
  MapPin, Calendar, DollarSign, Activity, Eye, Edit, Trash2,
  Download, Upload,
} from 'lucide-react';
import toast from 'react-hot-toast';
import AssetTelemetryModal from '../components/AssetTelemetryModal';
import LocationPicker from '../components/LocationPicker';

const STATUS_BADGES: Record<string, string> = {
  PLANNED: 'badge-primary',
  PROCURED: 'badge-info',
  INSTALLED: 'badge-accent',
  IN_USE: 'badge-accent',
  UNDER_MAINTENANCE: 'badge-warning',
  RETIRED: 'badge-danger',
  DISPOSED: 'badge-neutral',
};

const CONDITION_BADGES: Record<string, string> = {
  EXCELLENT: 'badge-accent',
  GOOD: 'badge-accent',
  FAIR: 'badge-warning',
  POOR: 'badge-danger',
  CRITICAL: 'badge-danger',
};

function healthClass(score: number | null) {
  if (!score) return 'health-fair';
  if (score >= 81) return 'health-excellent';
  if (score >= 61) return 'health-good';
  if (score >= 41) return 'health-fair';
  if (score >= 21) return 'health-poor';
  return 'health-critical';
}

function formatCurrency(v: number | null) {
  if (!v) return '—';
  if (v >= 10000000) return `₹${(v / 10000000).toFixed(1)}Cr`;
  if (v >= 100000) return `₹${(v / 100000).toFixed(1)}L`;
  return `₹${v.toLocaleString('en-IN')}`;
}

export default function AssetsPage() {
  const { user } = useAuth();
  const [assets, setAssets] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 12;

  // Create/Edit modal
  const [showModal, setShowModal] = useState(false);
  const [editingAsset, setEditingAsset] = useState<any>(null);
  const [telemetryAsset, setTelemetryAsset] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '', category: 'ROAD', latitude: '', longitude: '',
    address: '', purchaseCost: '', vendor: '', description: '', departmentId: '',
  });

  useEffect(() => {
    loadAssets();
    if (user?.role === 'SUPER_ADMIN') {
      api.get('/departments').then(res => setDepartments(res.data.data)).catch(console.error);
    }
  }, [page, statusFilter, categoryFilter, search]);

  const exportCSV = () => {
    if (assets.length === 0) {
      toast.error('No assets to export');
      return;
    }
    const headers = ['ID', 'Asset ID', 'Name', 'Category', 'Status', 'Health', 'Latitude', 'Longitude'];
    const rows = assets.map(a => [
      a.id, a.assetId, `"${a.name}"`, a.category, a.status, a.healthScore || 'N/A', a.latitude, a.longitude
    ]);
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `assets_export_${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    toast.success('Assets exported to CSV');
  };

  const loadAssets = async () => {
    try {
      setLoading(true);
      const params: any = { page, limit };
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      if (categoryFilter) params.category = categoryFilter;

      const { data } = await api.get('/assets', { params });
      const result = data.data;
      setAssets(result.assets || result || []);
      setTotal(result.total || (result.assets || result || []).length);
    } catch (err: any) {
      toast.error('Failed to load assets');
      setAssets([]);
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.ceil(total / limit) || 1;

  const openCreate = () => {
    setEditingAsset(null);
    setFormData({
      name: '', category: 'ROAD', latitude: '21.17',
      longitude: '72.83', address: '', purchaseCost: '',
      vendor: '', description: '', departmentId: '',
    });
    setShowModal(true);
  };

  const openEdit = (asset: any) => {
    setEditingAsset(asset);
    setFormData({
      name: asset.name,
      category: asset.category,
      latitude: String(asset.latitude),
      longitude: String(asset.longitude),
      address: asset.address || '',
      purchaseCost: asset.purchaseCost ? String(asset.purchaseCost) : '',
      vendor: asset.vendor || '',
      description: asset.description || '',
      departmentId: asset.departmentId || '',
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    try {
      const payload = {
        ...formData,
        latitude: parseFloat(formData.latitude),
        longitude: parseFloat(formData.longitude),
        purchaseCost: formData.purchaseCost ? parseFloat(formData.purchaseCost) : undefined,
      };

      if (editingAsset) {
        await api.put(`/assets/${editingAsset.id}`, payload);
        toast.success('Asset updated');
      } else {
        await api.post('/assets', payload);
        toast.success('Asset created');
      }
      setShowModal(false);
      loadAssets();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to save asset');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this asset?')) return;
    try {
      await api.delete(`/assets/${id}`);
      toast.success('Asset deleted');
      loadAssets();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to delete');
    }
  };

  const canWrite = user?.role === 'SUPER_ADMIN' || user?.role === 'DEPT_ADMIN';

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1>Assets</h1>
          <p className="page-header-sub">
            {total} assets across all departments
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="btn btn-secondary" onClick={exportCSV}>
            <Download size={18} />
            Export CSV
          </button>
          {canWrite && (
            <button className="btn btn-primary" onClick={openCreate}>
              <Plus size={18} />
              Add Asset
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4" style={{ marginBottom: 'var(--space-6)', flexWrap: 'wrap' }}>
        <div className="search-input-wrapper" style={{ flex: 1, maxWidth: 360 }}>
          <Search />
          <input
            type="text"
            className="input"
            placeholder="Search by name, ID, or location..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </div>

        <select
          className="input"
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          style={{ width: 180 }}
        >
          <option value="">All Status</option>
          {['PLANNED', 'PROCURED', 'INSTALLED', 'IN_USE', 'UNDER_MAINTENANCE', 'RETIRED', 'DISPOSED'].map((s) => (
            <option key={s} value={s}>{s.replace('_', ' ')}</option>
          ))}
        </select>

        <select
          className="input"
          value={categoryFilter}
          onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }}
          style={{ width: 180 }}
        >
          <option value="">All Categories</option>
          {['ROAD', 'BRIDGE', 'BUILDING', 'TRANSFORMER', 'WATER_PUMP', 'STREETLIGHT', 'VEHICLE', 'IT_EQUIPMENT', 'OTHER'].map((c) => (
            <option key={c} value={c}>{c.replace('_', ' ')}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      {loading ? (
        <div className="stagger" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="skeleton" style={{ height: 56, borderRadius: 8 }} />
          ))}
        </div>
      ) : assets.length === 0 ? (
        <div className="empty-state">
          <Package size={64} />
          <h3>No Assets Found</h3>
          <p>
            {search || statusFilter || categoryFilter
              ? 'Try adjusting your filters'
              : 'Start by adding your first infrastructure asset'}
          </p>
          {canWrite && !search && !statusFilter && (
            <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={openCreate}>
              <Plus size={18} /> Add First Asset
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Asset</th>
                  <th>Category</th>
                  <th>Status</th>
                  <th>Condition</th>
                  <th>Health</th>
                  <th>Value</th>
                  <th>Location</th>
                  <th style={{ width: 120 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {assets.map((asset) => (
                  <tr key={asset.id}>
                    <td>
                      <div>
                        <div style={{ fontWeight: 600 }}>{asset.name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                          {asset.assetId}
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="badge badge-primary">
                        {asset.category?.replace('_', ' ')}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${STATUS_BADGES[asset.status] || 'badge-neutral'}`}>
                        {asset.status?.replace('_', ' ')}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${CONDITION_BADGES[asset.condition] || 'badge-neutral'}`}>
                        {asset.condition}
                      </span>
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <span className={`health-dot ${healthClass(asset.healthScore)}`} />
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8125rem' }}>
                          {asset.healthScore ?? '—'}
                        </span>
                      </div>
                    </td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8125rem' }}>
                      {formatCurrency(asset.currentValue)}
                    </td>
                    <td>
                      <div className="flex items-center gap-1" style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                        <MapPin size={13} />
                        {asset.address?.split(',')[0] || `${asset.latitude?.toFixed(2)}, ${asset.longitude?.toFixed(2)}`}
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center gap-1">
                        <button className="btn btn-ghost btn-icon btn-sm" title="AI & Telemetry" onClick={() => setTelemetryAsset(asset)}>
                          <Activity size={15} color="var(--primary-600)" />
                        </button>
                        {canWrite && (
                          <>
                            <button className="btn btn-ghost btn-icon btn-sm" onClick={() => openEdit(asset)} title="Edit">
                              <Edit size={15} />
                            </button>
                            {user?.role === 'SUPER_ADMIN' && (
                              <button className="btn btn-ghost btn-icon btn-sm" onClick={() => handleDelete(asset.id)} title="Delete" style={{ color: 'var(--danger-400)' }}>
                                <Trash2 size={15} />
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="pagination">
            <button disabled={page <= 1} onClick={() => setPage(page - 1)}>
              <ChevronLeft size={16} />
            </button>
            {Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => {
              const p = i + 1;
              return (
                <button key={p} className={page === p ? 'active' : ''} onClick={() => setPage(p)}>
                  {p}
                </button>
              );
            })}
            <button disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
              <ChevronRight size={16} />
            </button>
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginLeft: 8 }}>
              Page {page} of {totalPages}
            </span>
          </div>
        </>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setShowModal(false); }}>
          <div className="modal-content" style={{ maxWidth: 640 }}>
            <div className="modal-header">
              <h2>{editingAsset ? 'Edit Asset' : 'Create New Asset'}</h2>
              <button className="btn btn-ghost btn-icon" onClick={() => setShowModal(false)}>✕</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
              <div className="input-group" style={{ gridColumn: '1 / -1' }}>
                <label>Asset Name</label>
                <input className="input" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="e.g. Tapi River Bridge #1" />
              </div>

              <div className="input-group">
                <label>Category</label>
                <select className="input" value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })}>
                  {['ROAD', 'BRIDGE', 'BUILDING', 'TRANSFORMER', 'WATER_PUMP', 'STREETLIGHT', 'VEHICLE', 'IT_EQUIPMENT', 'OTHER'].map((c) => (
                    <option key={c} value={c}>{c.replace('_', ' ')}</option>
                  ))}
                </select>
              </div>

              <div className="input-group">
                <label>Vendor</label>
                <input className="input" value={formData.vendor} onChange={(e) => setFormData({ ...formData, vendor: e.target.value })} placeholder="Vendor name" />
              </div>

              {user?.role === 'SUPER_ADMIN' && (
                <div className="input-group">
                  <label>Department</label>
                  <select className="input" value={formData.departmentId} onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}>
                    <option value="">-- Select Department --</option>
                    {departments.map((d: any) => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>
              )}

              <LocationPicker 
                latitude={formData.latitude} 
                longitude={formData.longitude} 
                address={formData.address} 
                onChange={(lat, lng, addr) => setFormData({ ...formData, latitude: lat.toString(), longitude: lng.toString(), address: addr })} 
              />

              <div className="input-group">
                <label>Purchase Cost (₹)</label>
                <input className="input" type="number" value={formData.purchaseCost} onChange={(e) => setFormData({ ...formData, purchaseCost: e.target.value })} placeholder="0" />
              </div>

              <div className="input-group" style={{ gridColumn: '1 / -1' }}>
                <label>Description</label>
                <textarea className="input" rows={3} value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Optional description..." style={{ resize: 'vertical' }} />
              </div>
            </div>

            <div className="flex justify-between" style={{ marginTop: 'var(--space-6)' }}>
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSave}>
                {editingAsset ? 'Update Asset' : 'Create Asset'}
              </button>
            </div>
          </div>
        </div>
      )}

      {telemetryAsset && (
        <AssetTelemetryModal asset={telemetryAsset} onClose={() => setTelemetryAsset(null)} />
      )}
    </div>
  );
}
