import { useState, useEffect } from 'react';
import api from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { AlertTriangle, CheckCircle, BrainCircuit } from 'lucide-react';
import toast from 'react-hot-toast';

const SEVERITY_COLORS: Record<string, string> = {
  LOW: 'badge-info',
  MEDIUM: 'badge-warning',
  HIGH: 'badge-danger',
  CRITICAL: 'badge-danger',
};

export default function AnomaliesPage() {
  const { user } = useAuth();
  const [anomalies, setAnomalies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isResolvedFilter, setIsResolvedFilter] = useState('false');

  useEffect(() => {
    loadAnomalies();
  }, [isResolvedFilter]);

  const loadAnomalies = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (isResolvedFilter !== 'all') {
        params.isResolved = isResolvedFilter;
      }
      const { data } = await api.get('/anomalies', { params });
      setAnomalies(data.data?.anomalies || []);
    } catch {
      toast.error('Failed to load anomalies');
    } finally {
      setLoading(false);
    }
  };

  const resolveAnomaly = async (id: string) => {
    try {
      await api.put(`/anomalies/${id}/resolve`);
      toast.success('Anomaly marked as resolved');
      loadAnomalies();
    } catch {
      toast.error('Failed to resolve anomaly');
    }
  };

  const simulateAnomaly = async () => {
    try {
      await api.post('/anomalies/simulate');
      toast.success('Simulated anomaly generated!');
      setIsResolvedFilter('false');
      loadAnomalies();
    } catch {
      toast.error('Failed to simulate anomaly');
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1>AI Anomaly Detection</h1>
          <p className="page-header-sub">Fraud and risk alerts powered by Grok AI</p>
        </div>
        <div className="flex items-center gap-2">
          {user?.role === 'SUPER_ADMIN' && (
            <button className="btn btn-secondary btn-sm" onClick={simulateAnomaly}>
              Simulate Anomaly
            </button>
          )}
          <span className="badge badge-primary">
            <BrainCircuit size={14} /> AI Active
          </span>
        </div>
      </div>

      <div className="flex items-center gap-4" style={{ marginBottom: 'var(--space-6)' }}>
        <select
          className="input"
          value={isResolvedFilter}
          onChange={(e) => setIsResolvedFilter(e.target.value)}
          style={{ width: 180 }}
        >
          <option value="all">All Alerts</option>
          <option value="false">Active Alerts</option>
          <option value="true">Resolved</option>
        </select>
      </div>

      {loading ? (
        <div className="stagger" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="card skeleton" style={{ height: 100 }} />
          ))}
        </div>
      ) : anomalies.length === 0 ? (
        <div className="empty-state">
          <CheckCircle size={64} style={{ color: 'var(--accent-400)' }} />
          <h3>System is Clear</h3>
          <p>No anomalies detected matching your filters.</p>
        </div>
      ) : (
        <div className="stagger" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {anomalies.map((anomaly) => (
            <div key={anomaly.id} className="card" style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
              <div style={{
                width: 48, height: 48, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: anomaly.isResolved ? 'rgba(148, 163, 184, 0.1)' : 'rgba(239, 68, 68, 0.1)'
              }}>
                <AlertTriangle size={24} style={{ color: anomaly.isResolved ? 'var(--text-muted)' : 'var(--danger-400)' }} />
              </div>
              
              <div style={{ flex: 1 }}>
                <div className="flex items-center gap-3" style={{ marginBottom: 4 }}>
                  <h3 style={{ fontSize: '1.125rem', color: anomaly.isResolved ? 'var(--text-secondary)' : 'var(--text-primary)' }}>
                    {anomaly.title}
                  </h3>
                  {!anomaly.isResolved && (
                    <span className={`badge ${SEVERITY_COLORS[anomaly.severity] || 'badge-neutral'}`}>
                      {anomaly.severity}
                    </span>
                  )}
                  <span className="badge badge-primary" style={{ fontSize: '0.625rem' }}>{anomaly.type}</span>
                </div>
                
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                  {anomaly.description}
                </p>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 8 }}>
                  Detected: {new Date(anomaly.createdAt).toLocaleString()} 
                  &nbsp;•&nbsp; Entity: {anomaly.entityType} ({anomaly.entityId.slice(0,8)})
                </div>
              </div>

              {!anomaly.isResolved && (user?.role === 'SUPER_ADMIN' || user?.role === 'DEPT_ADMIN') && (
                <button className="btn btn-secondary" onClick={() => resolveAnomaly(anomaly.id)}>
                  Mark Resolved
                </button>
              )}
              {anomaly.isResolved && (
                <div style={{ textAlign: 'right', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  <CheckCircle size={14} style={{ display: 'inline', color: 'var(--accent-400)' }} />
                  <br />
                  Resolved
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
