import { useEffect, useState } from 'react';
import { supabase } from '../../supabaseClient';
import { Leaf, PlusCircle, Pencil } from 'lucide-react';

export default function IngredientesPage() {
  const [ingredientes, setIngredientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  const [nuevoNombre, setNuevoNombre] = useState('');
  const [nuevaCategoria, setNuevaCategoria] = useState('');
  const [nuevoPrecioExtra, setNuevoPrecioExtra] = useState('');

  const fetchIngredientes = async () => {
    setLoading(true);
    setErrorMsg('');
    const { data, error } = await supabase
      .from('ingredientes')
      .select('*')
      .order('nombre', { ascending: true });

    if (error) {
      console.error('Error cargando ingredientes:', error);
      setErrorMsg('No se pudieron cargar los ingredientes.');
      setIngredientes([]);
    } else {
      setIngredientes(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchIngredientes();
  }, []);

  const handleCrear = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!nuevoNombre.trim()) {
      setErrorMsg('El nombre es obligatorio.');
      return;
    }

    const precio = nuevoPrecioExtra ? Number(nuevoPrecioExtra) : 0;

    const { error } = await supabase.from('ingredientes').insert({
      nombre: nuevoNombre.trim(),
      categoria: nuevaCategoria.trim() || null,
      precio_extra: precio,
    });

    if (error) {
      console.error('Error creando ingrediente:', error);
      setErrorMsg('No se pudo crear el ingrediente.');
      return;
    }

    setNuevoNombre('');
    setNuevaCategoria('');
    setNuevoPrecioExtra('');
    fetchIngredientes();
  };

  const handleEditarRapido = async (ingrediente) => {
    const nuevoNombrePrompt = window.prompt(
      'Nuevo nombre del ingrediente:',
      ingrediente.nombre
    );
    if (nuevoNombrePrompt === null) return; // canceló

    const nuevaCategoriaPrompt = window.prompt(
      'Nueva categoría:',
      ingrediente.categoria || ''
    );
    if (nuevaCategoriaPrompt === null) return;

    const nuevoPrecioPrompt = window.prompt(
      'Nuevo precio extra:',
      String(ingrediente.precio_extra ?? 0)
    );
    if (nuevoPrecioPrompt === null) return;

    const precioNum = Number(nuevoPrecioPrompt) || 0;

    const { error } = await supabase
      .from('ingredientes')
      .update({
        nombre: nuevoNombrePrompt.trim(),
        categoria: nuevaCategoriaPrompt.trim() || null,
        precio_extra: precioNum,
      })
      .eq('id', ingrediente.id);

    if (error) {
      console.error('Error editando ingrediente:', error);
      alert('No se pudo editar el ingrediente.');
      return;
    }

    fetchIngredientes();
  };

  return (
    <div className="space-y-4">
      {/* Header similar a Pedidos */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-md bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 flex items-center justify-center">
            <Leaf className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              Ingredientes
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Administra los ingredientes disponibles para las pizzas.
            </p>
          </div>
        </div>
      </div>

      {/* Formulario de creación (card) */}
      <form
        onSubmit={handleCrear}
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-4 flex flex-wrap gap-4 items-end shadow-sm"
      >
        <div className="flex-1 min-w-[180px]">
          <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
            Nombre
          </label>
          <input
            type="text"
            className="w-full border border-slate-300 dark:border-slate-700 rounded-md px-3 py-2 text-sm bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-900/5 dark:focus:ring-slate-300/10"
            value={nuevoNombre}
            onChange={(e) => setNuevoNombre(e.target.value)}
            placeholder="Queso Mozzarella"
          />
        </div>

        <div className="w-48">
          <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
            Categoría
          </label>
          <input
            type="text"
            className="w-full border border-slate-300 dark:border-slate-700 rounded-md px-3 py-2 text-sm bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-900/5 dark:focus:ring-slate-300/10"
            value={nuevaCategoria}
            onChange={(e) => setNuevaCategoria(e.target.value)}
            placeholder="QUESO / CARNE / VEGETAL"
          />
        </div>

        <div className="w-32">
          <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
            Precio extra
          </label>
          <input
            type="number"
            className="w-full border border-slate-300 dark:border-slate-700 rounded-md px-3 py-2 text-sm bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-900/5 dark:focus:ring-slate-300/10"
            value={nuevoPrecioExtra}
            onChange={(e) => setNuevoPrecioExtra(e.target.value)}
            placeholder="0"
            min="0"
          />
        </div>

        <button
          type="submit"
          className="inline-flex items-center gap-2 bg-emerald-600 text-white text-sm px-4 py-2 rounded-md hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 active:scale-[0.98] transition"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Añadir ingrediente</span>
        </button>

        {errorMsg && (
          <p className="w-full text-sm text-red-500 mt-1">{errorMsg}</p>
        )}
      </form>

      {/* Estados de carga / error */}
      {loading && (
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Cargando ingredientes...
        </p>
      )}

      {!loading && errorMsg && (
        <p className="text-sm text-red-500">{errorMsg}</p>
      )}

      {!loading && !errorMsg && ingredientes.length === 0 && (
        <p className="text-sm text-slate-500 dark:text-slate-400">
          No hay ingredientes registrados todavía.
        </p>
      )}

      {/* Listado (card) */}
      {!loading && !errorMsg && ingredientes.length > 0 && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg shadow-sm overflow-hidden">
          <table className="w-full text-sm text-slate-800 dark:text-slate-100">
            <thead className="bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200">
              <tr>
                <th className="text-left px-4 py-2 border-b border-slate-200 dark:border-slate-700">
                  Nombre
                </th>
                <th className="text-left px-4 py-2 border-b border-slate-200 dark:border-slate-700">
                  Categoría
                </th>
                <th className="text-right px-4 py-2 border-b border-slate-200 dark:border-slate-700">
                  Precio extra
                </th>
                <th className="text-right px-4 py-2 border-b border-slate-200 dark:border-slate-700">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {ingredientes.map((ing) => (
                <tr
                  key={ing.id}
                  className="hover:bg-slate-50 dark:hover:bg-slate-800 transition"
                >
                  <td className="px-4 py-2 border-b border-slate-200 dark:border-slate-800">
                    {ing.nombre}
                  </td>
                  <td className="px-4 py-2 border-b border-slate-200 dark:border-slate-800">
                    {ing.categoria || (
                      <span className="text-slate-400 dark:text-slate-500">
                        —
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-2 border-b border-slate-200 dark:border-slate-800 text-right">
                    ${ing.precio_extra ?? 0}
                  </td>
                  <td className="px-4 py-2 border-b border-slate-200 dark:border-slate-800 text-right">
                    <button
                      onClick={() => handleEditarRapido(ing)}
                      className="inline-flex items-center gap-1 text-xs bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 px-3 py-1 rounded-md text-slate-800 dark:text-slate-100 transition"
                    >
                      <Pencil className="w-3 h-3" />
                      <span>Editar</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}