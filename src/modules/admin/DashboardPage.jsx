import { useEffect, useState } from 'react';
import { supabase } from '../../supabaseClient';
import {
  Pizza,
  Users,
  DollarSign,
  Clock,
  Truck,
  Flame,
} from 'lucide-react';
import { useAuth } from '../auth/AuthContext';

export default function Dashboard() {
  const { userProfile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [pedidos, setPedidos] = useState([]);
  const [usuariosCount, setUsuariosCount] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setErrorMsg('');

      try {
        const [{ data: pedidosData, error: pedidosError }, { data: usuariosData, error: usuariosError }] =
          await Promise.all([
            supabase
              .from('pedidos')
              .select(
                `
                id,
                estado,
                total,
                metodo_pago,
                created_at,
                usuarios_app:usuarios_app!pedidos_cliente_id_fkey (nombre)
              `
              )
              .order('created_at', { ascending: false })
              .limit(20),
            supabase.from('usuarios_app').select('id'),
          ]);

        if (pedidosError) throw pedidosError;
        if (usuariosError) throw usuariosError;

        setPedidos(pedidosData || []);
        setUsuariosCount(usuariosData ? usuariosData.length : 0);
      } catch (err) {
        console.error('Error cargando datos de dashboard:', err);
        setErrorMsg('No se pudo cargar el dashboard.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Métricas básicas sobre los pedidos recientes
  const totalPedidos = pedidos.length;
  const totalIngresos = pedidos.reduce((acc, p) => acc + (p.total || 0), 0);
  const pendientes = pedidos.filter((p) => p.estado === 'PENDIENTE').length;
  const enCamino = pedidos.filter((p) => p.estado === 'EN_CAMINO').length;
  const horneando = pedidos.filter((p) => p.estado === 'HORNEANDO').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-md bg-gradient-to-br from-orange-500 to-amber-400 flex items-center justify-center">
            <Pizza className="w-5 h-5 text-slate-950" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-slate-100">
              Panel general
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Resumen rápido del desempeño de ZaHub.
            </p>
          </div>
        </div>

        {userProfile && (
          <p className="text-xs text-slate-400">
            Hola,{' '}
            <span className="text-slate-100 font-medium">
              {userProfile.nombre}
            </span>
            . Listo para hornear decisiones 🍕
          </p>
        )}
      </div>

      {/* Estados de carga / error */}
      {loading && (
        <p className="text-sm text-slate-400">Cargando datos del dashboard...</p>
      )}

      {!loading && errorMsg && (
        <p className="text-sm text-red-500">{errorMsg}</p>
      )}

      {/* Contenido principal */}
      {!loading && !errorMsg && (
        <>
          {/* Métricas principales */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Pedidos recientes */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">Pedidos recientes</span>
                <span className="inline-flex items-center gap-1 px-2 py-[2px] rounded-full bg-orange-500/10 text-[11px] text-orange-300 border border-orange-500/40">
                  <Clock className="w-3 h-3" />
                  Hoy
                </span>
              </div>
              <p className="text-2xl font-semibold text-slate-50">
                {totalPedidos}
              </p>
              <p className="text-xs text-slate-400">
                Últimos pedidos registrados en el sistema.
              </p>
            </div>

            {/* Ingresos */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">Ingresos estimados</span>
                <DollarSign className="w-4 h-4 text-emerald-400" />
              </div>
              <p className="text-2xl font-semibold text-emerald-300">
                ${totalIngresos}
              </p>
              <p className="text-xs text-slate-400">
                Basado en los últimos pedidos cargados.
              </p>
            </div>

            {/* Usuarios */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">
                  Usuarios registrados
                </span>
                <Users className="w-4 h-4 text-sky-300" />
              </div>
              <p className="text-2xl font-semibold text-slate-50">
                {usuariosCount}
              </p>
              <p className="text-xs text-slate-400">
                Entre administradores, cocina, repartidores y clientes.
              </p>
            </div>
          </div>

          {/* Segunda fila: pedidos + estado cocina */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Últimos pedidos */}
            <div className="lg:col-span-2 bg-slate-900/80 border border-slate-800 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold text-slate-100">
                  Últimos pedidos
                </h2>
                <span className="text-[11px] text-slate-500">
                  Mostrando {Math.min(5, totalPedidos)} de {totalPedidos}
                </span>
              </div>

              {pedidos.length === 0 ? (
                <p className="text-xs text-slate-500">
                  No hay pedidos registrados todavía.
                </p>
              ) : (
                <div className="space-y-2">
                  {pedidos.slice(0, 5).map((p) => (
                    <div
                      key={p.id}
                      className="flex items-center justify-between gap-3 rounded-lg border border-slate-800/80 bg-slate-950/60 px-3 py-2 hover:border-orange-500/40 transition"
                    >
                      <div className="flex flex-col">
                        <span className="text-[11px] text-slate-500">
                          #{p.id.slice(0, 8)} ·{' '}
                          {new Date(p.created_at).toLocaleTimeString('es-CO', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                        <span className="text-xs text-slate-100">
                          {p.usuarios_app?.nombre ?? 'Cliente sin nombre'}
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-xs text-slate-300">
                          ${p.total}
                        </span>
                        <span
                          className={
                            'inline-flex items-center px-2 py-[2px] rounded-md text-[10px] font-semibold ' +
                            getEstadoBadge(p.estado)
                          }
                        >
                          {p.estado}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Estado de la cocina */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-slate-100">
                  Estado de la cocina
                </h2>
                <Flame className="w-4 h-4 text-orange-400" />
              </div>

              <p className="text-xs text-slate-400">
                Un vistazo rápido a cómo va el horno de ZaHub.
              </p>

              <div className="space-y-2 text-xs text-slate-300">
                <p className="flex items-center justify-between">
                  <span>Pedidos pendientes</span>
                  <span className="font-semibold text-yellow-300">
                    {pendientes}
                  </span>
                </p>
                <p className="flex items-center justify-between">
                  <span>En el horno</span>
                  <span className="font-semibold text-orange-300">
                    {horneando}
                  </span>
                </p>
                <p className="flex items-center justify-between">
                  <span>En camino</span>
                  <span className="font-semibold text-sky-300">
                    {enCamino}
                  </span>
                </p>
              </div>

              <div className="mt-2">
                {/* barra “termómetro” simple */}
                <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500"
                    style={{
                      width: `${
                        totalPedidos === 0
                          ? 0
                          : Math.min(
                              100,
                              ((pendientes + horneando + enCamino) /
                                totalPedidos) *
                                100
                            )
                      }%`,
                    }}
                  />
                </div>
                <p className="mt-1 text-[11px] text-slate-500 flex items-center gap-1">
                  <Truck className="w-3 h-3" />
                  <span>
                    {totalPedidos === 0
                      ? 'Sin actividad reciente.'
                      : 'Cocina trabajando a buen ritmo.'}
                  </span>
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// clase para las badges del listado de últimos pedidos
function getEstadoBadge(estado) {
  switch (estado) {
    case 'PENDIENTE':
      return 'bg-yellow-500/15 text-yellow-300 border border-yellow-500/40';
    case 'PREPARANDO':
    case 'HORNEANDO':
      return 'bg-orange-500/15 text-orange-300 border border-orange-500/40';
    case 'LISTO':
      return 'bg-blue-500/15 text-blue-300 border border-blue-500/40';
    case 'EN_CAMINO':
      return 'bg-indigo-500/15 text-indigo-300 border border-indigo-500/40';
    case 'ENTREGADO':
      return 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/40';
    case 'CANCELADO':
      return 'bg-red-500/15 text-red-300 border border-red-500/40';
    default:
      return 'bg-slate-700/40 text-slate-200 border border-slate-600';
  }
}