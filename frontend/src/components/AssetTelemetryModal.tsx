import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { QRCodeSVG } from 'qrcode.react';
import { Activity, BrainCircuit, QrCode, Cpu, ShieldCheck } from 'lucide-react';

interface Props {
  asset: any;
  onClose: () => void;
}

export default function AssetTelemetryModal({ asset, onClose }: Props) {
  const [activeTab, setActiveTab] = useState<'iot' | 'ai' | 'qr'>('iot');
  const [liveData, setLiveData] = useState<any[]>([]);

  // Generate mock live IoT data
  useEffect(() => {
    if (activeTab !== 'iot') return;
    
    // Initial data
    const initial = Array.from({ length: 20 }).map((_, i) => ({
      time: new Date(Date.now() - (20 - i) * 1000).toLocaleTimeString(),
      temp: 45 + Math.random() * 5,
      vibration: 0.5 + Math.random() * 0.2
    }));
    setLiveData(initial);

    // Update every second
    const interval = setInterval(() => {
      setLiveData(prev => {
        const newData = [...prev.slice(1)];
        newData.push({
          time: new Date().toLocaleTimeString(),
          temp: 45 + Math.random() * 5 + (Math.random() > 0.8 ? Math.random() * 15 : 0), // Occasional spikes
          vibration: 0.5 + Math.random() * 0.2
        });
        return newData;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [activeTab]);

  // Mock Predictive AI data (Next 30 days)
  const aiForecastData = Array.from({ length: 30 }).map((_, i) => {
    const day = new Date();
    day.setDate(day.getDate() + i);
    // Exponential decay of health based on current score
    const startHealth = asset.healthScore || 85;
    const decay = Math.pow(1.05, i); 
    const predictedHealth = Math.max(0, startHealth - decay - (Math.random() * 2));
    
    return {
      date: day.toLocaleDateString(),
      health: Math.round(predictedHealth),
      confidence: [Math.max(0, predictedHealth - 5), Math.min(100, predictedHealth + 5)]
    };
  });

  return (
    <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <div className="modal-content" style={{ maxWidth: 800 }}>
        <div className="modal-header">
          <div>
            <h2 style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Cpu size={24} color="var(--primary-600)" />
              {asset.name} Intelligence
            </h2>
            <div style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: 'var(--text-muted)' }}>{asset.assetId}</div>
          </div>
          <button className="btn btn-ghost btn-icon" onClick={onClose}>✕</button>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 24, borderBottom: '1px solid var(--border-color)', paddingBottom: 16 }}>
          <button className={`btn ${activeTab === 'iot' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setActiveTab('iot')}>
            <Activity size={16} /> Live IoT Telemetry
          </button>
          <button className={`btn ${activeTab === 'ai' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setActiveTab('ai')}>
            <BrainCircuit size={16} /> Predictive AI
          </button>
          <button className={`btn ${activeTab === 'qr' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setActiveTab('qr')}>
            <QrCode size={16} /> Digital QR Tag
          </button>
        </div>

        {/* Tab Contents */}
        <div style={{ height: 400 }}>
          
          {/* IOT TAB */}
          {activeTab === 'iot' && (
            <div className="animate-fade-in" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                <div>
                  <h3 style={{ fontSize: '1.125rem' }}>Real-time Sensor Stream</h3>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Polling 1Hz via MQTT Protocol</p>
                </div>
                <div className="badge badge-accent animate-pulse"><div className="health-dot health-excellent" /> Sensor Active</div>
              </div>
              <div style={{ flex: 1, background: 'var(--bg-primary)', padding: 16, borderRadius: 12, border: '1px solid var(--border-color)' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={liveData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                    <XAxis dataKey="time" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} />
                    <YAxis yAxisId="left" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} domain={[0, 80]} />
                    <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} domain={[0, 2]} />
                    <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 8 }} />
                    <Line yAxisId="left" type="monotone" dataKey="temp" stroke="#ef4444" strokeWidth={2} dot={false} name="Temperature (°C)" isAnimationActive={false} />
                    <Line yAxisId="right" type="monotone" dataKey="vibration" stroke="#3b82f6" strokeWidth={2} dot={false} name="Vibration (g)" isAnimationActive={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* AI TAB */}
          {activeTab === 'ai' && (
            <div className="animate-fade-in" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
               <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                <div>
                  <h3 style={{ fontSize: '1.125rem' }}>30-Day Failure Prediction</h3>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Powered by Grok ML Degradation Model</p>
                </div>
                <div className="badge badge-primary"><BrainCircuit size={14} /> AI Forecast</div>
              </div>
              <div style={{ flex: 1, background: 'var(--bg-primary)', padding: 16, borderRadius: 12, border: '1px solid var(--border-color)' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={aiForecastData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                    <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} minTickGap={30} />
                    <YAxis tick={{ fontSize: 10, fill: 'var(--text-muted)' }} domain={[0, 100]} />
                    <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 8 }} />
                    
                    <Area type="monotone" dataKey="confidence" stroke="none" fill="#3b82f6" fillOpacity={0.1} />
                    <Area type="monotone" dataKey="health" stroke="#3b82f6" strokeWidth={3} fill="url(#colorHealth)" />
                    
                    <defs>
                      <linearGradient id="colorHealth" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              {aiForecastData[29].health < 40 && (
                <div style={{ marginTop: 16, padding: 12, background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 8, color: '#991b1b', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <ShieldCheck size={18} />
                  <strong>AI Recommendation:</strong> Schedule preventative maintenance within 14 days to avoid critical failure.
                </div>
              )}
            </div>
          )}

          {/* QR TAB */}
          {activeTab === 'qr' && (
            <div className="animate-fade-in" style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ background: 'white', padding: 32, borderRadius: 24, boxShadow: 'var(--shadow-lg)', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <QRCodeSVG 
                  value={`assettrust://verify/${asset.id}`} 
                  size={200}
                  level="H"
                  imageSettings={{
                    src: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/11/Blue_question_mark_icon.svg/1200px-Blue_question_mark_icon.svg.png", // Mock logo
                    x: undefined, y: undefined, height: 40, width: 40, excavate: true,
                  }}
                />
                <h3 style={{ marginTop: 24, color: '#0f172a' }}>{asset.assetId}</h3>
                <p style={{ color: '#64748b', fontSize: '0.875rem', marginTop: 4 }}>Scan for Proof of Presence</p>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
