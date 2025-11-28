import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { supabase } from '../../supabaseClient';
import { useAuth } from '../auth/AuthContext';
import { ClipboardList, Settings, LogOut } from 'lucide-react';

export default function AdminLayout() {
  const { userProfile } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('❌ Error al cerrar sesión:', error);
      }
    } catch (err) {
      console.error('💥 Error inesperado al cerrar sesión:', err);
    } finally {
      navigate('/login', { replace: true });
    }
  };

  const linkClasses = ({ isActive }) =>
    `flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition 
    ${
      isActive
        ? 'bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-200'
        : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
    }`;

  return (
    <div className="h-screen flex bg-slate-100 dark:bg-slate-900 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 flex-shrink-0 bg-white dark:bg-slate-950 shadow-lg flex flex-col border-r border-slate-200 dark:border-slate-800">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800">
          <h2 className="font-semibold text-lg text-slate-900 dark:text-slate-50">
            ZaHub Admin
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {userProfile
              ? `${userProfile.nombre} · ${userProfile.rol}`
              : 'Administrador'}
          </p>
        </div>

        {/* navegación */}
        <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
          <NavLink to="/admin/pedidos" className={linkClasses}>
            <ClipboardList className="w-4 h-4" />
            <span>Pedidos</span>
          </NavLink>
        </nav>

        {/* zona inferior fija */}
        <div className="p-2 border-t border-slate-200 dark:border-slate-800">
          <NavLink to="/admin/configuracion" className={linkClasses}>
            <Settings className="w-4 h-4" />
            <span>Configuración</span>
          </NavLink>

          <button
            onClick={handleLogout}
            className="mt-2 flex items-center justify-center gap-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-sm text-slate-800 dark:text-slate-100 py-2 rounded-lg transition w-full"
          >
            <LogOut className="w-4 h-4" />
            <span>Cerrar sesión</span>
          </button>
        </div>
      </aside>

      {/* Contenido principal con scroll propio */}
      <main className="flex-1 p-6 text-slate-900 dark:text-slate-100 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}