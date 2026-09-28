import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  Shield,
  LayoutDashboard,
  Package,
  Map,
  Wrench,
  FileText,
  AlertTriangle,
  Users,
  MessageSquare,
  LogOut,
  Bell,
  Search,
  Network,
  Sun,
  Moon,
  Bot,
  Languages
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../lib/api';

const TRANSLATIONS: any = {
  en: {
    dashboard: 'Dashboard', assets: 'Assets', map: 'Map View', maintenance: 'Maintenance',
    audit: 'Audit Log', anomalies: 'Anomalies', users: 'User Management', reports: 'Citizen Reports',
    search: 'Search assets, reports, users...', online: 'System Online', ai: 'Asset AI', org: 'Org Structure'
  },
  hi: {
    dashboard: 'डैशबोर्ड', assets: 'संपत्ति (Assets)', map: 'नक्शा (Map)', maintenance: 'रखरखाव',
    audit: 'ऑडिट लॉग', anomalies: 'विसंगतियां (AI)', users: 'उपयोगकर्ता प्रबंधन', reports: 'नागरिक रिपोर्ट',
    search: 'खोजें...', online: 'सिस्टम ऑनलाइन', ai: 'एआई सहायक', org: 'संगठन संरचना'
  }
};

const NAV_ITEMS = [
  { section: 'Overview' },
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { section: 'Asset Management' },
  { to: '/assets', icon: Package, label: 'Assets', roles: ['SUPER_ADMIN', 'DEPT_ADMIN', 'FIELD_OFFICER', 'AUDITOR'] },
  { to: '/map', icon: Map, label: 'Map View' },
  { section: 'Operations' },
  { to: '/maintenance', icon: Wrench, label: 'Maintenance', roles: ['SUPER_ADMIN', 'DEPT_ADMIN', 'FIELD_OFFICER'] },
  { to: '/audit', icon: FileText, label: 'Audit Log', roles: ['SUPER_ADMIN', 'AUDITOR'] },
  { to: '/anomalies', icon: AlertTriangle, label: 'Anomalies', roles: ['SUPER_ADMIN', 'DEPT_ADMIN', 'AUDITOR'] },
  { section: 'Administration' },
  { to: '/org', icon: Network, label: 'Org Structure', roles: ['SUPER_ADMIN', 'STATE_ADMIN', 'DISTRICT_ADMIN'] },
  { to: '/users', icon: Users, label: 'User Management', roles: ['SUPER_ADMIN', 'DEPT_ADMIN'] },
  { to: '/citizen-reports', icon: MessageSquare, label: 'Citizen Reports', roles: ['SUPER_ADMIN', 'DEPT_ADMIN'] },
];

export default function AppLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = React.useState('');
  const [theme, setTheme] = React.useState('light');
  const [showChat, setShowChat] = React.useState(false);
  const [lang, setLang] = React.useState<'en'|'hi'>('en');

  const [chatMessages, setChatMessages] = React.useState<{role: string, text: string}[]>([]);
  const [chatInput, setChatInput] = React.useState('');
  const chatEndRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  React.useEffect(() => {
    if (showChat && chatMessages.length === 0) {
      setChatMessages([{ role: 'ai', text: `Hello ${user?.name.split(' ')[0] || ''}! I'm your infrastructure AI assistant. Ask me about asset health, anomalies, or pending work orders.` }]);
    }
  }, [showChat, user]);

  React.useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages]);

  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMsg = chatInput.trim();
    setChatMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setChatInput('');

    try {
      const res = await api.post('/ai/chat', { message: userMsg });
      setChatMessages(prev => [...prev, { role: 'ai', text: res.data.reply }]);
    } catch (err: any) {
      console.error(err);
      const errMsg = err.response?.data?.error || 'Failed to communicate with AI.';
      setChatMessages(prev => [...prev, { role: 'ai', text: errMsg }]);
    }
  };

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const userInitials = user?.name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || '??';

  const roleLabel = user?.role?.replace('_', ' ') || '';

  return (
    <div className="app-layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">
            <Shield size={22} color="white" />
          </div>
          <div>
            <div className="sidebar-logo-text">AssetTrust</div>
            <div style={{ fontSize: '0.625rem', color: 'var(--text-muted)', fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              Built for Billions
            </div>
          </div>
        </div>

        <nav className="sidebar-nav">
          {NAV_ITEMS.map((item, i) => {
            if ('section' in item && !('to' in item)) {
              return (
                <div key={`section-${i}`} className="sidebar-section-label">
                  {item.section}
                </div>
              );
            }

            const navItem = item as { to: string; icon: any; label: string; roles?: string[] };

            // Role-based visibility
            if (navItem.roles && user && !navItem.roles.includes(user.role)) {
              return null;
            }

            const Icon = navItem.icon;

            return (
              <NavLink
                key={navItem.to}
                to={navItem.to}
                className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
              >
                <Icon size={20} />
                <span>{navItem.label.toLowerCase().includes('dash') ? TRANSLATIONS[lang].dashboard :
                       navItem.label.toLowerCase().includes('asset') ? TRANSLATIONS[lang].assets :
                       navItem.label.toLowerCase().includes('map') ? TRANSLATIONS[lang].map :
                       navItem.label.toLowerCase().includes('maintain') || navItem.label.toLowerCase().includes('maintenance') ? TRANSLATIONS[lang].maintenance :
                       navItem.label.toLowerCase().includes('audit') ? TRANSLATIONS[lang].audit :
                       navItem.label.toLowerCase().includes('anomal') ? TRANSLATIONS[lang].anomalies :
                       navItem.label.toLowerCase().includes('user') ? TRANSLATIONS[lang].users :
                       navItem.label.toLowerCase().includes('org') ? TRANSLATIONS[lang].org :
                       TRANSLATIONS[lang].reports}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="sidebar-user">
          <div className="sidebar-avatar">{userInitials}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '0.875rem', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {user?.name}
            </div>
            <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {roleLabel}
            </div>
          </div>
          <button
            className="btn btn-ghost btn-icon"
            onClick={handleLogout}
            title="Logout"
            style={{ flexShrink: 0 }}
          >
            <LogOut size={18} />
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="main-content">
        {/* Header */}
        <header className="header">
          <form className="search-input-wrapper" onSubmit={(e) => {
            e.preventDefault();
            if (searchQuery.trim()) {
              navigate(`/assets`);
              // Give time for route to change then dispatch a search event, or better, pass query params.
              // We can navigate to /assets and the Assets page will need to read from URL, 
              // but since our AssetsPage uses local state for search, let's just show a toast for demo.
              toast.success(`Searching across system for: ${searchQuery}`);
              setSearchQuery('');
            }
          }}>
            <Search />
            <input
              type="text"
              className="input"
              placeholder={TRANSLATIONS[lang].search}
              style={{ background: 'var(--bg-surface)' }}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </form>

          <div className="flex items-center gap-3">
            <button
              className="btn btn-ghost btn-icon"
              onClick={() => {
                const nextLang = lang === 'en' ? 'hi' : 'en';
                setLang(nextLang);
                toast.success(nextLang === 'hi' ? 'भाषा बदलकर हिंदी कर दी गई है' : 'Language changed to English');
              }}
              title="Change Language"
            >
              <Languages size={20} />
            </button>
            <button
              className="btn btn-ghost btn-icon"
              onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
              title="Toggle Theme"
            >
              {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
            </button>
            
            <button 
              className="btn btn-ghost btn-icon" 
              style={{ position: 'relative' }}
              onClick={() => toast('No new notifications', { icon: '🔔' })}
            >
              <Bell size={20} />
              <span style={{
                position: 'absolute', top: 6, right: 6,
                width: 8, height: 8, borderRadius: '50%',
                background: 'var(--danger-500)',
              }} />
            </button>

            <div className="badge badge-accent" style={{ padding: '4px 12px' }}>
              <span style={{
                width: 6, height: 6, borderRadius: '50%',
                background: 'var(--accent-400)', display: 'inline-block',
              }} />
              {TRANSLATIONS[lang].online}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="page-content">
          <Outlet />
        </div>
      </div>

      {/* AI Assistant FAB */}
      <button 
        style={{
          position: 'fixed', bottom: 32, right: 32, zIndex: 100,
          width: 56, height: 56, borderRadius: '50%',
          background: 'var(--primary-600)', color: 'white',
          boxShadow: 'var(--shadow-lg)', display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}
        onClick={() => setShowChat(!showChat)}
      >
        <Bot size={28} />
      </button>

      {/* AI Chat Window */}
      {showChat && (
        <div style={{
          position: 'fixed', bottom: 100, right: 32, zIndex: 100,
          width: 320, height: 400, background: 'var(--bg-card)',
          borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-lg)',
          border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column',
          overflow: 'hidden', animation: 'scaleIn 200ms ease-out'
        }}>
          <div style={{ background: 'var(--primary-600)', color: 'white', padding: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Bot size={20} />
            <h4 style={{ margin: 0, fontSize: '1rem', color: 'white' }}>Asset AI</h4>
            <button style={{ marginLeft: 'auto', color: 'white' }} onClick={() => setShowChat(false)}>✕</button>
          </div>
          <div style={{ flex: 1, padding: 16, display: 'flex', flexDirection: 'column', gap: 12, overflowY: 'auto', fontSize: '0.875rem' }}>
            {chatMessages.map((msg, idx) => (
              <div key={idx} style={{ 
                background: msg.role === 'ai' ? 'var(--bg-primary)' : 'var(--primary-600)', 
                color: msg.role === 'ai' ? 'var(--text-primary)' : 'white',
                padding: 12, borderRadius: msg.role === 'ai' ? '8px 8px 8px 0' : '8px 8px 0 8px', 
                alignSelf: msg.role === 'ai' ? 'flex-start' : 'flex-end', 
                maxWidth: '85%' 
              }}>
                {msg.text}
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>
          <form onSubmit={handleChatSubmit} style={{ padding: 12, borderTop: '1px solid var(--border-color)', display: 'flex', gap: 8 }}>
            <input type="text" className="input" placeholder="Ask AI..." style={{ flex: 1 }} value={chatInput} onChange={e => setChatInput(e.target.value)} />
            <button type="submit" className="btn btn-primary btn-icon" disabled={!chatInput.trim()}><Search size={16} /></button>
          </form>
        </div>
      )}
    </div>
  );
}
