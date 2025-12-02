import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from './components/ui/sonner';
import { supabase } from './utils/supabase/client';
import { ClientOnboarding } from './components/ClientOnboarding';
import { ClientPortal } from './components/ClientPortal';
import { AdminDashboard } from './components/AdminDashboard';
import { AdminClientSetup } from './components/AdminClientSetup';
import { AdminBillingScreen } from './components/AdminBillingScreen';
import { AdminSettings } from './components/AdminSettings';
import { AdminLogin } from './components/AdminLogin';
import { LogOut, Settings } from 'lucide-react';
import { Button } from './components/ui/button';

export default function App() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [accessToken, setAccessToken] = useState<string>('');
  const [loading, setLoading] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.access_token) {
        setIsAuthenticated(true);
        setAccessToken(session.access_token);
        sessionStorage.setItem('access_token', session.access_token);
      }
    } catch (error) {
      console.error('Session check error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLoginSuccess = (token: string) => {
    setAccessToken(token);
    setIsAuthenticated(true);
    sessionStorage.setItem('access_token', token);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsAuthenticated(false);
    setAccessToken('');
    sessionStorage.removeItem('access_token');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-slate-600">Loading...</p>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-slate-50">
        <Toaster position="top-right" />
        
        {/* Header */}
        <div className="bg-white border-b border-slate-200 px-6 py-3">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-slate-900">CPA Firm Portal</h1>
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <button
                  onClick={() => setIsAdmin(false)}
                  className={`px-3 py-1 rounded ${!isAdmin ? 'bg-blue-100 text-blue-700' : 'hover:bg-slate-100'}`}
                >
                  Client View
                </button>
                <span className="text-slate-300">|</span>
                <button
                  onClick={() => setIsAdmin(true)}
                  className={`px-3 py-1 rounded ${isAdmin ? 'bg-blue-100 text-blue-700' : 'hover:bg-slate-100'}`}
                >
                  Admin View
                </button>
              </div>
            </div>
            
            {isAdmin && isAuthenticated && (
              <Button variant="outline" size="sm" onClick={handleLogout} className="gap-2">
                <LogOut className="w-4 h-4" />
                Sign Out
              </Button>
            )}
          </div>
        </div>

        <Routes>
          {!isAdmin ? (
            <>
              <Route path="/" element={<ClientOnboarding />} />
              <Route path="/portal" element={<ClientPortal />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </>
          ) : !isAuthenticated ? (
            <>
              <Route path="/" element={<AdminLogin onLoginSuccess={handleLoginSuccess} />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </>
          ) : (
            <>
              <Route path="/" element={<AdminDashboard />} />
              <Route path="/admin/client/:id" element={<AdminClientSetup />} />
              <Route path="/admin/billing/:id" element={<AdminBillingScreen />} />
              <Route path="/admin/settings" element={<AdminSettings />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </>
          )}
        </Routes>
      </div>
    </Router>
  );
}