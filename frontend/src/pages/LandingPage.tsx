import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, MessageSquare, AlertTriangle, ArrowRight, ShieldCheck, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';

export default function LandingPage() {
  const navigate = useNavigate();
  const [showReportForm, setShowReportForm] = React.useState(false);
  const [formData, setFormData] = React.useState({ title: '', category: 'ROAD', location: '', description: '' });

  const handleSubmitReport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.location) return;
    toast.success('Report submitted securely. Thank you for your civic duty!', { duration: 4000 });
    setShowReportForm(false);
    setFormData({ title: '', category: 'ROAD', location: '', description: '' });
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-primary)' }}>
      {/* Navbar */}
      <nav style={{ padding: '24px 48px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-surface)', borderBottom: '1px solid var(--border-color)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ background: 'var(--primary-600)', width: 36, height: 36, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Shield size={20} color="white" />
          </div>
          <span style={{ fontSize: '1.25rem', fontWeight: 800 }}>AssetTrust</span>
        </div>
        <div style={{ display: 'flex', gap: 16 }}>
          <button className="btn btn-secondary" onClick={() => navigate('/login')}>Admin Login</button>
        </div>
      </nav>

      {/* Hero */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 32, textAlign: 'center' }}>
        <div className="badge badge-primary" style={{ marginBottom: 24, padding: '8px 16px', fontSize: '0.875rem' }}>
          <ShieldCheck size={16} /> Transparent Government Infrastructure
        </div>
        <h1 style={{ fontSize: '3.5rem', fontWeight: 800, maxWidth: 800, lineHeight: 1.1, marginBottom: 24, color: 'var(--text-primary)' }}>
          Securing public assets with cryptographically verified trust.
        </h1>
        <p style={{ fontSize: '1.25rem', color: 'var(--text-secondary)', maxWidth: 600, marginBottom: 48 }}>
          The world's most secure, transparent, and AI-powered platform for managing municipal infrastructure and public works.
        </p>

        <div style={{ display: 'flex', gap: 16 }}>
          <button className="btn btn-primary" style={{ fontSize: '1.125rem', padding: '12px 24px' }} onClick={() => setShowReportForm(true)}>
            <MessageSquare size={20} />
            Report an Issue
          </button>
          <button className="btn btn-secondary" style={{ fontSize: '1.125rem', padding: '12px 24px' }} onClick={() => navigate('/login')}>
            View Public Dashboard <ArrowRight size={20} />
          </button>
        </div>
      </main>

      {/* Footer */}
      <footer style={{ padding: 32, textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem', borderTop: '1px solid var(--border-color)' }}>
        &copy; {new Date().getFullYear()} AssetTrust Platform. Hackathon Demo.
      </footer>

      {/* Report Modal */}
      {showReportForm && (
        <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setShowReportForm(false) }}>
          <div className="modal-content">
            <div className="modal-header">
              <h2><AlertTriangle size={20} style={{ display: 'inline', verticalAlign: 'text-bottom', color: 'var(--warning-500)', marginRight: 8 }} /> Report an Infrastructure Issue</h2>
              <button className="btn btn-ghost btn-icon" onClick={() => setShowReportForm(false)}>✕</button>
            </div>
            <form onSubmit={handleSubmitReport} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="input-group">
                <label>Issue Title</label>
                <input className="input" required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} placeholder="e.g. Broken Streetlight" />
              </div>
              <div className="grid-2">
                <div className="input-group">
                  <label>Category</label>
                  <select className="input" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                    <option value="ROAD">Roads & Sidewalks</option>
                    <option value="STREETLIGHT">Streetlights</option>
                    <option value="WATER">Water / Plumbing</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
                <div className="input-group">
                  <label>Location</label>
                  <div className="search-input-wrapper" style={{ width: '100%', maxWidth: 'none' }}>
                    <MapPin size={16} />
                    <input className="input" required value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} placeholder="Enter street or landmark..." />
                  </div>
                </div>
              </div>
              <div className="input-group">
                <label>Description (Optional)</label>
                <textarea className="input" rows={3} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}></textarea>
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '12px', marginTop: 8 }}>
                Submit to Public Portal
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
