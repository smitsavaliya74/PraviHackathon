import { useState } from 'react';
import { MessageSquare, MapPin, Eye, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const MOCK_REPORTS = [
  {
    id: 'rep_1',
    title: 'Pothole on Ring Road',
    description: 'Large pothole forming near the main intersection, causing traffic slowdowns and potential vehicle damage.',
    category: 'ROAD',
    status: 'SUBMITTED',
    reporterName: 'Rahul Desai',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
    location: 'Surat Ring Road'
  },
  {
    id: 'rep_2',
    title: 'Streetlight not working',
    description: 'Streetlight pole #45 has been completely dark for 3 nights in a row. Very unsafe for pedestrians.',
    category: 'STREETLIGHT',
    status: 'REVIEWED',
    reporterName: 'Priya Sharma',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
    location: 'Adajan Gam'
  }
];

export default function CitizenReportsPage() {
  const [reports, setReports] = useState(MOCK_REPORTS);
  
  const handleConvert = (id: string) => {
    toast.success('Report converted to Work Order!');
    setReports(reports.map(r => r.id === id ? { ...r, status: 'CONVERTED' } : r));
  };

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1>Citizen Reports</h1>
          <p className="page-header-sub">Public infrastructure issue reports</p>
        </div>
      </div>

      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Issue</th>
              <th>Category</th>
              <th>Location</th>
              <th>Reporter</th>
              <th>Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {reports.map((report) => (
              <tr key={report.id}>
                <td>
                  <div style={{ fontWeight: 600 }}>{report.title}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', maxWidth: 300, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {report.description}
                  </div>
                </td>
                <td>
                  <span className="badge badge-primary">{report.category}</span>
                </td>
                <td>
                  <div className="flex items-center gap-1" style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                    <MapPin size={13} />
                    {report.location}
                  </div>
                </td>
                <td style={{ fontSize: '0.875rem' }}>{report.reporterName}</td>
                <td style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                  {new Date(report.createdAt).toLocaleDateString()}
                </td>
                <td>
                  <span className={`badge ${report.status === 'CONVERTED' ? 'badge-accent' : report.status === 'REVIEWED' ? 'badge-info' : 'badge-warning'}`}>
                    {report.status}
                  </span>
                </td>
                <td>
                  <div className="flex items-center gap-2">
                    <button className="btn btn-ghost btn-icon btn-sm" title="View Details">
                      <Eye size={16} />
                    </button>
                    {report.status !== 'CONVERTED' && (
                      <button className="btn btn-accent btn-icon btn-sm" title="Convert to Work Order" onClick={() => handleConvert(report.id)}>
                        <CheckCircle size={16} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
