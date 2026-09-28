import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Shield, Mail, Lock, Zap } from 'lucide-react';
import toast from 'react-hot-toast';

const DEMO_USERS = [
  { label: 'Super Admin', email: 'admin@assettrust.gov.in', password: 'Admin@123', role: 'SUPER_ADMIN' },
  { label: 'Dept Admin', email: 'deptadmin@assettrust.gov.in', password: 'DeptAdmin@123', role: 'DEPT_ADMIN' },
  { label: 'Field Officer', email: 'officer@assettrust.gov.in', password: 'Officer@123', role: 'FIELD_OFFICER' },
  { label: 'Auditor', email: 'auditor@assettrust.gov.in', password: 'Auditor@123', role: 'AUDITOR' },
];

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await login(email, password);
      toast.success('Welcome to AssetTrust!');
      navigate('/dashboard');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async (demoEmail: string, demoPassword: string) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setIsLoading(true);
    try {
      await login(demoEmail, demoPassword);
      toast.success('Welcome to AssetTrust!');
      navigate('/dashboard');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card animate-scale-in">
        <div className="login-logo">
          <div className="login-logo-badge">
            <Shield size={32} color="white" />
          </div>
          <h1 className="login-title">AssetTrust</h1>
          <p className="login-subtitle">
            Government Infrastructure Platform<br />
            <span style={{ color: 'var(--primary-400)', fontWeight: 600 }}>
              Built for Billions
            </span>
          </p>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="input-group">
            <label htmlFor="login-email">Email Address</label>
            <div className="input-icon-wrapper">
              <Mail />
              <input
                id="login-email"
                type="email"
                className="input"
                placeholder="admin@assettrust.gov.in"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>
          </div>

          <div className="input-group">
            <label htmlFor="login-password">Password</label>
            <div className="input-icon-wrapper">
              <Lock />
              <input
                id="login-password"
                type="password"
                className="input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-lg"
            disabled={isLoading}
            style={{ width: '100%', marginTop: 'var(--space-2)' }}
          >
            {isLoading ? (
              <span className="spinner" style={{ width: 20, height: 20, borderWidth: 2 }} />
            ) : (
              <>
                <Zap size={18} />
                Sign In
              </>
            )}
          </button>
        </form>

        <div className="login-demo-users">
          <h4>Quick Demo Access</h4>
          <div className="flex flex-col gap-2">
            {DEMO_USERS.map((u) => (
              <button
                key={u.email}
                className="demo-user-btn"
                onClick={() => handleDemoLogin(u.email, u.password)}
                disabled={isLoading}
              >
                <span>{u.label}</span>
                <span className="badge badge-primary" style={{ fontSize: '0.625rem' }}>
                  {u.role.replace('_', ' ')}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
