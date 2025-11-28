import { useEffect, useState } from 'react';
import { supabase } from '../../supabaseClient';
import {
  User,
  DollarSign,
  MapPin,
  Clock,
  Filter,
  ChevronDown,
  PlusCircle,
} from 'lucide-react';
import { useAuth } from '../auth/AuthContext';

const ESTADOS = [
  'PENDIENTE',
  'PREPARANDO',
  'HORNEANDO',
  'LISTO',
  'EN_CAMINO',
  'ENTREGADO',
  'CANCELADO',
];

const ESTADOS_FILTRO = ['TODOS', ...ESTADOS];

function getEstadoClasses(estado) {
  switch (estado) {
    case 'PENDIENTE':
      return 'bg-yellow-100 dark:bg-yellow-500/10 dark:text-yellow-400';
    case 'PREPARANDO':
    case 'HORNEANDO':
      return 'bg-orange-100 dark:bg-orange-500/25 dark:text-orange-500';
    case 'LISTO':
      return 'bg-blue-100 dark:bg-blue-500/25 dark:text-blue-400';
    case 'EN_CAMINO':
      return 'bg-indigo-100 dark:bg-indigo-500/25 dark:text-indigo-500';
    case 'ENTREGADO':
      return 'bg-green-100 dark:bg-green-500/25 dark:text-green-500';
    case 'CANCELADO':
      return 'bg-red-100 dark:bg-red-500/25 dark:text-red-600';
    default:
      return 'bg-slate-100 dark:bg-slate-500/25 dark:text-slate-800';
  }
}

export default function PedidosPage() {
  const { userProfile, loading: authLoading } = useAuth();
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filtroEstado, setFiltroEstado] = useState('TODOS');
  const [errorCarga, setErrorCarga] = useState('');

  const fetchPedidos = async () => {
    setLoading(true);
    setErrorCarga('');

    try {
      const { data, error } = await supabase
        .from('pedidos')
        .select(`
          id,
          estado,
          total,
          metodo_pago,
          direccion_entrega,
          created_at,
          usuarios_app:usuarios_app!pedidos_cliente_id_fkey (nombre)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error cargando pedidos desde Supabase:', error);
        setErrorCarga('No se pudieron cargar los pedidos.');
        setPedidos([]);
      } else {
        setPedidos(data || []);
      }
    } catch (err) {
      console.error('💥 Error inesperado cargando pedidos:', err);
      setErrorCarga('Ocurrió un error inesperado al cargar los pedidos.');
      setPedidos([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authLoading) return;
    if (!userProfile) return;
    fetchPedidos();
  }, [authLoading, userProfile?.id]);

  const cambiarEstado = async (pedidoId, nuevoEstado) => {
    // UI optimista
    setPedidos((prev) =>
      prev.map((p) => (p.id === pedidoId ? { ...p, estado: nuevoEstado } : p))
    );

    const { error } = await supabase
      .from('pedidos')
      .update({ estado: nuevoEstado })
      .eq('id', pedidoId);

    if (error) {
      console.error('Error cambiando estado:', error);
      alert('No se pudo cambiar el estado. Se revertirá.');
      fetchPedidos();
    }
  };

  const crearPedidoDePrueba = async () => {
    const clienteId = '11c68e3b-cf7d-417a-ae79-fe6d39f3bc84'; // cliente de prueba

    const { data, error } = await supabase
      .from('pedidos')
      .insert({
        cliente_id: clienteId,
        estado: 'PENDIENTE',
        total: 25000,
        metodo_pago: 'EFECTIVO',
        direccion_entrega: 'Cra 50 #20-15',
        canal: 'APP_MOBILE',
      })
      .select()
      .single();

    if (error) {
      console.error('Error creando pedido:', error);
      alert('Error al crear pedido.');
    } else {
      setPedidos((prev) => [data, ...prev]);
    }
  };

  const pedidosFiltrados = pedidos.filter((p) =>
    filtroEstado === 'TODOS' ? true : p.estado === filtroEstado
  );

  // Estados de auth
  if (authLoading) {
    return (
      <p className="text-sm text-slate-500 dark:text-slate-400">
        Preparando tu panel de administración...
      </p>
    );
  }

  if (!userProfile) {
    return (
      <p className="text-sm text-red-500">
        No se encontró un usuario autenticado. Vuelve a iniciar sesión.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header (alineado con Ingredientes) */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-md bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 flex items-center justify-center">
            <DollarSign className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              Pedidos
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Gestiona los pedidos en tiempo real desde este panel.
            </p>
          </div>
        </div>

        {/* Acciones / filtro */}
        <div className="flex items-end gap-3">
          <button
            onClick={crearPedidoDePrueba}
            className="inline-flex items-center gap-2 bg-emerald-600 text-white text-sm px-4 py-2 rounded-md hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 active:scale-[0.98] transition"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Crear pedido de prueba</span>
          </button>

          <div className="relative">
            <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300 mb-1">
              <Filter className="w-3 h-3" />
              <span>Estado</span>
            </div>
            <div className="relative">
              <select
                value={filtroEstado}
                onChange={(e) => setFiltroEstado(e.target.value)}
                className="appearance-none border border-slate-300 dark:border-slate-700 rounded-md text-sm pl-3 pr-8 py-1.5 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-900/5 focus:border-slate-400 dark:focus:border-slate-500 transition"
              >
                {ESTADOS_FILTRO.map((est) => (
                  <option key={est} value={est}>
                    {est}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      {/* Estados de carga / error */}
      {loading && (
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Cargando pedidos...
        </p>
      )}

      {!loading && errorCarga && (
        <p className="text-sm text-red-500">{errorCarga}</p>
      )}

      {!loading && !errorCarga && pedidosFiltrados.length === 0 && (
        <p className="text-sm text-slate-500 dark:text-slate-400">
          No hay pedidos para el filtro seleccionado.
        </p>
      )}

      {/* Listado (cards estilo ZaHub Admin) */}
      {!loading && !errorCarga && pedidosFiltrados.length > 0 && (
        <div className="space-y-3">
          {pedidosFiltrados.map((p) => (
            <div
              key={p.id}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-4 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 transition hover:-translate-y-0.5 hover:shadow-md hover:border-slate-300 dark:hover:border-slate-500 dark:hover:bg-slate-800"
            >
              <div className="space-y-2">
                <p className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                  <Clock className="w-4 h-4" />
                  <span>#{p.id.slice(0, 8)}</span>
                  <span>·</span>
                  <span>{new Date(p.created_at).toLocaleString()}</span>
                </p>

                <p className="flex items-center gap-2 text-sm font-medium text-slate-900 dark:text-slate-100">
                  <User className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                  <span>
                    Cliente:{' '}
                    <span className="font-semibold">
                      {p.usuarios_app?.nombre ?? 'Desconocido'}
                    </span>
                  </span>
                </p>

                <p className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-200">
                  <DollarSign className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                  <span>Total: ${p.total}</span>
                </p>

                <p className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-200">
                  <span
                    className={
                      'inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold ' +
                      getEstadoClasses(p.estado)
                    }
                  >
                    {p.estado}
                  </span>
                  <span className="text-slate-400 dark:text-slate-500">·</span>
                  <span className="flex items-center gap-1 text-xs text-slate-600 dark:text-slate-300">
                    <span className="uppercase tracking-wide">
                      Pago: {p.metodo_pago ?? 'N/A'}
                    </span>
                  </span>
                </p>

                <p className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                  <MapPin className="w-4 h-4" />
                  <span className="line-clamp-1">
                    Dirección: {p.direccion_entrega}
                  </span>
                </p>
              </div>

              <div className="flex flex-col items-start sm:items-end gap-1">
                <span className="text-xs text-slate-500 dark:text-slate-400 mb-1">
                  Cambiar estado
                </span>
                <select
                  value={p.estado}
                  onChange={(e) => cambiarEstado(p.id, e.target.value)}
                  className="border border-slate-300 dark:border-slate-700 rounded-md px-3 py-1.5 text-sm bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-900/5 focus:border-slate-400 dark:focus:border-slate-500 transition cursor-pointer"
                >
                  {ESTADOS.map((est) => (
                    <option key={est} value={est}>
                      {est}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
