import { useState, useEffect } from 'react';
import api from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { Network, Users, Building, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';

export default function OrgStructurePage() {
  const { user } = useAuth();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrg();
  }, []);

  const loadOrg = async () => {
    try {
      const { data: res } = await api.get('/org/structure');
      setData(res.data);
    } catch {
      toast.error('Failed to load org structure');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="animate-fade-in p-6">
      <div className="page-header mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Network className="text-primary-600" />
            Government Hierarchy
          </h1>
          <p className="text-gray-500">View organization structure and user distribution</p>
        </div>
      </div>

      <div className="bg-white dark:bg-[var(--bg-surface)] p-6 rounded-2xl shadow-sm border border-[var(--border)]">
        {data.map(country => (
          <div key={country.id} className="mb-4">
            <div className="font-bold text-lg mb-2 flex items-center gap-2">
              <MapPin size={18} /> {country.name} ({country.code})
            </div>
            <div className="pl-6 border-l-2 border-gray-100 dark:border-gray-800">
              {country.states.map((state: any) => (
                <div key={state.id} className="mb-4">
                  <div className="font-semibold text-md mb-2 flex items-center gap-2">
                    <MapPin size={16} /> {state.name} State
                  </div>
                  <div className="pl-6 border-l-2 border-gray-100 dark:border-gray-800">
                    {state.districts.map((district: any) => (
                      <div key={district.id} className="mb-4">
                        <div className="font-medium mb-2 flex items-center gap-2">
                          <MapPin size={14} /> {district.name} District
                        </div>
                        <div className="pl-6 border-l-2 border-gray-100 dark:border-gray-800 grid gap-2">
                          {district.departments.map((dept: any) => (
                            <div key={dept.id} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg flex justify-between items-center">
                              <div className="flex items-center gap-2">
                                <Building size={16} className="text-primary-500" />
                                <span>{dept.name} ({dept.code})</span>
                              </div>
                              <div className="flex gap-4 text-sm text-gray-500">
                                <span className="flex items-center gap-1"><Users size={14} /> {dept._count.users} Users</span>
                                <span>{dept._count.assets} Assets</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
