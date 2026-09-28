import { useState, useEffect } from 'react';
import api from '../lib/api';
import { FileText, Shield, CheckCircle, XCircle, AlertTriangle, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AuditLogPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [chainStatus, setChainStatus] = useState<{ valid: boolean; totalEntries: number; brokenAt?: number } | null>(null);
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    try {
      const { data } = await api.get('/audit', { params: { limit: 50 } });
      setLogs(data.data?.logs || data.data || []);
    } catch {
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  const verifyChain = async () => {
    setVerifying(true);
    try {
      const { data } = await api.get('/audit/verify');
      setChainStatus(data.data);
      if (data.data?.valid) {
        toast.success('✅ Hash chain is intact!');
      } else {
        toast.error(`❌ Chain broken at entry #${data.data?.brokenAt}`);
      }
    } catch {
      toast.error('Failed to verify chain');
    } finally {
      setVerifying(false);
    }
  };

  const formatDate = (d: string) => {
    return new Date(d).toLocaleString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  };

  const actionBadge = (action: string) => {
    if (action.includes('CREATE') || action === 'SYSTEM_INIT') return 'badge-accent';
    if (action.includes('DELETE')) return 'badge-danger';
    if (action.includes('UPDATE') || action.includes('STATUS')) return 'badge-warning';
    if (action.includes('LOGIN') || action.includes('LOGOUT')) return 'badge-info';
    return 'badge-neutral';
  };

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1>Audit Log</h1>
          <p className="page-header-sub">
            Tamper-evident hash chain — SHA-256 linked entries
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            className={`btn ${chainStatus?.valid ? 'btn-accent' : chainStatus === null ? 'btn-secondary' : 'btn-danger'}`}
            onClick={verifyChain}
            disabled={verifying}
          >
            {verifying ? (
              <RefreshCw size={16} className="spinning" />
            ) : chainStatus?.valid ? (
              <CheckCircle size={16} />
            ) : chainStatus !== null ? (
              <XCircle size={16} />
            ) : (
              <Shield size={16} />
            )}
            {chainStatus?.valid ? 'Chain Verified' : chainStatus !== null ? 'Chain Broken!' : 'Verify Integrity'}
          </button>
        </div>
      </div>

      {/* Chain Status Card */}
      {chainStatus && (
        <div className={`card ${chainStatus.valid ? '' : ''}`} style={{
          marginBottom: 'var(--space-6)',
          borderColor: chainStatus.valid ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)',
          background: chainStatus.valid
            ? 'linear-gradient(145deg, rgba(16, 185, 129, 0.08), rgba(16, 185, 129, 0.02))'
            : 'linear-gradient(145deg, rgba(239, 68, 68, 0.08), rgba(239, 68, 68, 0.02))',
        }}>
          <div className="flex items-center gap-4">
            {chainStatus.valid ? (
              <CheckCircle size={32} style={{ color: 'var(--accent-400)' }} />
            ) : (
              <AlertTriangle size={32} style={{ color: 'var(--danger-400)' }} />
            )}
            <div>
              <h3 style={{ color: chainStatus.valid ? 'var(--accent-300)' : 'var(--danger-400)' }}>
                {chainStatus.valid ? 'Hash Chain Integrity Verified' : 'Hash Chain Compromised!'}
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                {chainStatus.totalEntries} entries verified
                {chainStatus.brokenAt ? ` — broken at entry #${chainStatus.brokenAt}` : ''}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Logs Table */}
      {loading ? (
        <div className="stagger" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="skeleton" style={{ height: 48, borderRadius: 8 }} />
          ))}
        </div>
      ) : logs.length === 0 ? (
        <div className="empty-state">
          <FileText size={64} />
          <h3>No Audit Entries</h3>
          <p>The audit trail will populate as system actions occur.</p>
        </div>
      ) : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>#</th>
                <th>Action</th>
                <th>Entity</th>
                <th>Actor</th>
                <th>Timestamp</th>
                <th>Hash</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id}>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                    {log.sequence}
                  </td>
                  <td>
                    <span className={`badge ${actionBadge(log.action)}`}>
                      {log.action}
                    </span>
                  </td>
                  <td>
                    <div>
                      <span style={{ fontWeight: 500 }}>{log.entityType}</span>
                      {log.entityId && (
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: 8, fontFamily: 'var(--font-mono)' }}>
                          {log.entityId.slice(0, 8)}...
                        </span>
                      )}
                    </div>
                  </td>
                  <td style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                    {log.actor?.name || 'System'}
                  </td>
                  <td style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                    {formatDate(log.timestamp)}
                  </td>
                  <td>
                    <code style={{
                      fontSize: '0.6875rem',
                      fontFamily: 'var(--font-mono)',
                      color: 'var(--primary-400)',
                      background: 'rgba(99, 102, 241, 0.1)',
                      padding: '2px 6px',
                      borderRadius: 4,
                    }}>
                      {log.hash?.slice(0, 16)}...
                    </code>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
