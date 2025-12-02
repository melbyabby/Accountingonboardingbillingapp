import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Clock, CheckCircle2, AlertCircle, Plus, Search, Settings } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { AddClientDialog } from './AddClientDialog';
import { toast } from 'sonner';
import { supabase } from '../utils/supabase/client';

interface Client {
  id: string;
  name: string;
  type: 'individual' | 'business' | 'trust' | 'nonprofit';
  status: 'new' | 'in-progress' | 'ready' | 'complete';
  onboarded_date: string;
  assigned_to: string | null;
  setup_progress: number;
}

export function AdminDashboard() {
  const navigate = useNavigate();
  const [clients, setClients] = useState<Client[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [addDialogOpen, setAddDialogOpen] = useState(false);

  // Fetch clients on mount
  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching clients:', error);
        toast.error('Failed to load clients');
        setClients([]);
        return;
      }

      setClients(data || []);
    } catch (error) {
      console.error('Error fetching clients:', error);
      toast.error('Failed to load clients');
      setClients([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredClients = clients.filter((client) => {
    const matchesSearch = client.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || client.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: clients.length,
    new: clients.filter((c) => c.status === 'new').length,
    inProgress: clients.filter((c) => c.status === 'in-progress').length,
    ready: clients.filter((c) => c.status === 'ready').length,
  };

  const getStatusBadge = (status: Client['status']) => {
    const config = {
      new: { label: 'New', className: 'bg-blue-100 text-blue-700' },
      'in-progress': { label: 'In Progress', className: 'bg-amber-100 text-amber-700' },
      ready: { label: 'Ready', className: 'bg-green-100 text-green-700' },
      complete: { label: 'Complete', className: 'bg-slate-100 text-slate-700' },
    };
    const { label, className } = config[status];
    return (
      <Badge variant="secondary" className={className}>
        {label}
      </Badge>
    );
  };

  const getClientTypeLabel = (type: Client['type']) => {
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-slate-900 mb-2">Client Onboarding Dashboard</h1>
              <p className="text-slate-600">Manage new client setup and tracking</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="gap-2" onClick={() => navigate('/admin/settings')}>
                <Settings className="w-4 h-4" />
                Settings
              </Button>
              <Button className="gap-2" onClick={() => setAddDialogOpen(true)}>
                <Plus className="w-4 h-4" />
                Add Manual Client
              </Button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm mb-1">Total Clients</p>
                <p className="text-slate-900">{stats.total}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm mb-1">New</p>
                <p className="text-slate-900">{stats.new}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <AlertCircle className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm mb-1">In Progress</p>
                <p className="text-slate-900">{stats.inProgress}</p>
              </div>
              <div className="p-3 bg-amber-100 rounded-lg">
                <Clock className="w-6 h-6 text-amber-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm mb-1">Ready</p>
                <p className="text-slate-900">{stats.ready}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters & Search */}
        <div className="bg-white rounded-lg border border-slate-200 p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search clients..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              {['all', 'new', 'in-progress', 'ready'].map((status) => (
                <Button
                  key={status}
                  variant={filterStatus === status ? 'default' : 'outline'}
                  onClick={() => setFilterStatus(status)}
                  size="sm"
                >
                  {status === 'all'
                    ? 'All'
                    : status === 'in-progress'
                    ? 'In Progress'
                    : status.charAt(0).toUpperCase() + status.slice(1)}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Clients Table */}
        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
          {loading ? (
            <div className="text-center py-12 text-slate-500">
              <p>Loading clients...</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="text-left px-6 py-4 text-sm text-slate-700">Client Name</th>
                      <th className="text-left px-6 py-4 text-sm text-slate-700">Type</th>
                      <th className="text-left px-6 py-4 text-sm text-slate-700">Status</th>
                      <th className="text-left px-6 py-4 text-sm text-slate-700">Setup Progress</th>
                      <th className="text-left px-6 py-4 text-sm text-slate-700">Assigned To</th>
                      <th className="text-left px-6 py-4 text-sm text-slate-700">Onboarded</th>
                      <th className="text-left px-6 py-4 text-sm text-slate-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {filteredClients.map((client) => (
                      <tr key={client.id} className="hover:bg-slate-50">
                        <td className="px-6 py-4">
                          <p className="text-slate-900">{client.name}</p>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-slate-600">
                            {getClientTypeLabel(client.type)}
                          </span>
                        </td>
                        <td className="px-6 py-4">{getStatusBadge(client.status)}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-blue-600 transition-all"
                                style={{ width: `${client.setup_progress}%` }}
                              />
                            </div>
                            <span className="text-sm text-slate-600 w-12">
                              {client.setup_progress}%
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-slate-600">{client.assigned_to || '-'}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-slate-600">
                            {new Date(client.onboarded_date).toLocaleDateString()}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => navigate(`/admin/client/${client.id}`)}
                            >
                              Setup
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => navigate(`/admin/billing/${client.id}`)}
                            >
                              Billing
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {filteredClients.length === 0 && !loading && (
                <div className="text-center py-12 text-slate-500">
                  <Users className="w-12 h-12 mx-auto mb-3 text-slate-400" />
                  <p>No clients found</p>
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() => setAddDialogOpen(true)}
                  >
                    Add your first client
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Add Client Dialog */}
      <AddClientDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        onClientAdded={fetchClients}
      />
    </div>
  );
}