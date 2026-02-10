import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Loader2, LayoutDashboard, Package, LogOut, Home as HomeIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { Link } from 'react-router-dom';
import logo from '@/assets/logo-principal.png';
import { COMPANY_INFO } from '@/lib/constants';

export function AdminLayout() {
  const { session, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/admin/login" replace />;
  }

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const navItems = [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/admin' },
    { label: 'Produtos', icon: Package, path: '/admin/produtos' },
  ];

  return (
    <div className="flex min-h-screen bg-slate-100">
      {/* Sidebar */}
      <aside className="w-64 bg-neutral-950 text-white flex flex-col fixed h-full z-10 shadow-xl">
        <div className="p-6 flex flex-col items-center border-b border-neutral-800">
          <img src={logo} alt={COMPANY_INFO.name} className="h-10 w-auto mb-2 invert brightness-0" />
          <span className="text-xs font-medium text-neutral-400 uppercase tracking-wider">Admin</span>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || (item.path !== '/admin' && location.pathname.startsWith(item.path));
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-neutral-400 hover:bg-neutral-900 hover:text-white'
                }`}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-neutral-800 space-y-2">
           <Button variant="ghost" asChild className="w-full justify-start text-neutral-400 hover:text-white hover:bg-neutral-900">
            <Link to="/">
              <HomeIcon className="mr-2 h-4 w-4" />
              Ver Site
            </Link>
          </Button>
          <Button variant="ghost" className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-red-950/30" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Sair
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 p-8 overflow-auto bg-slate-100">
        <div className="max-w-7xl mx-auto">
           {/* Content wrapper with shadow and white bg is handled by pages individually if needed, 
               but layout provides the structure */}
           <Outlet />
        </div>
      </main>
    </div>
  );
}
