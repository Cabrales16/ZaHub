import { useEffect, useState } from 'react';
import { supabase } from '../../supabaseClient';
import { Pizza, PlusCircle, ToggleLeft, ToggleRight, Pencil } from 'lucide-react';

const TAMANOS = ['PERSONAL', 'MEDIANA', 'FAMILIAR'];

export default function PizzasPage() {
  const [pizzas, setPizzas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [tamano, setTamano] = useState('MEDIANA');
  const [precioBase, setPrecioBase] = useState('');

  const fetchPizzas = async () => {
    setLoading(true);
    setErrorMsg('');

    const { data, error } = await supabase
      .from('pizzas_base')
      .select('*')
      .order('nombre', { ascending: true });

    if (error) {
      console.error('Error cargando pizzas:', error);
      setErrorMsg('No se pudieron cargar las pizzas.');
      setPizzas([]);
    } else {
      setPizzas(data || []);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchPizzas();
  }, []);

  const handleCrear = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!nombre.trim()) {
      setErrorMsg('El nombre es obligatorio.');
      return;
    }

    const precio = precioBase ? Number(precioBase) : 0;

    const { error } = await supabase.from('pizzas_base').insert({
      nombre: nombre.trim(),
      descripcion: descripcion.trim() || null,
      tamano,
      precio_base: precio,
      activa: true,
    });

    if (error) {
      console.error('Error creando pizza:', error);
      setErrorMsg('No se pudo crear la pizza.');
      return;
    }

    setNombre('');
    setDescripcion('');
    setTamano('MEDIANA');
    setPrecioBase('');
    fetchPizzas();
  };

  const toggleActiva = async (pizza) => {
    const nuevaActiva = !pizza.activa;

    // UI optimista
    setPizzas((prev) =>
      prev.map((p) =>
        p.id === pizza.id ? { ...p, activa: nuevaActiva } : p
      )
    );

    const { error } = await supabase
      .from('pizzas_base')
      .update({ activa: nuevaActiva })
      .eq('id', pizza.id);

    if (error) {
      console.error('Error cambiando estado de pizza:', error);
      alert('No se pudo cambiar el estado. Se revertirá.');
      fetchPizzas();
    }
  };

  const handleEditarRapido = async (pizza) => {
    const nuevoNombre = window.prompt('Nuevo nombre:', pizza.nombre);
    if (nuevoNombre === null) return;

    const nuevaDescripcion = window.prompt(
      'Nueva descripción:',
      pizza.descripcion || ''
    );
    if (nuevaDescripcion === null) return;

    const nuevoTamano = window.prompt(
      'Tamaño (PERSONAL, MEDIANA, FAMILIAR):',
      pizza.tamano || 'MEDIANA'
    );
    if (nuevoTamano === null) return;

    const nuevoPrecio = window.prompt(
      'Nuevo precio base:',
      String(pizza.precio_base ?? 0)
    );
    if (nuevoPrecio === null) return;

    const precioNum = Number(nuevoPrecio) || 0;

    const { error } = await supabase
      .from('pizzas_base')
      .update({
        nombre: nuevoNombre.trim(),
        descripcion: nuevaDescripcion.trim() || null,
        tamano: nuevoTamano.trim().toUpperCase(),
        precio_base: precioNum,
      })
      .eq('id', pizza.id);

    if (error) {
      console.error('Error editando pizza:', error);
      alert('No se pudo editar la pizza.');
      return;
    }

    fetchPizzas();
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-md bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 flex items-center justify-center">
            <Pizza className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              Pizzas
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Gestiona el catálogo de pizzas base de ZaHub.
            </p>
          </div>
        </div>
      </div>

      {/* Formulario de creación */}
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
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Pizza ZaHub Especial"
          />
        </div>

        <div className="flex-1 min-w-[220px]">
          <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
            Descripción
          </label>
          <input
            type="text"
            className="w-full border border-slate-300 dark:border-slate-700 rounded-md px-3 py-2 text-sm bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-900/5 dark:focus:ring-slate-300/10"
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            placeholder="Quesos, pepperoni, tocineta..."
          />
        </div>

        <div className="w-40">
          <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
            Tamaño
          </label>
          <select
            className="w-full border border-slate-300 dark:border-slate-700 rounded-md px-3 py-2 text-sm bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-900/5 dark:focus:ring-slate-300/10"
            value={tamano}
            onChange={(e) => setTamano(e.target.value)}
          >
            {TAMANOS.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        <div className="w-32">
          <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
            Precio base
          </label>
          <input
            type="number"
            className="w-full border border-slate-300 dark:border-slate-700 rounded-md px-3 py-2 text-sm bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-900/5 dark:focus:ring-slate-300/10"
            value={precioBase}
            onChange={(e) => setPrecioBase(e.target.value)}
            placeholder="0"
            min="0"
          />
        </div>

        <button
          type="submit"
          className="inline-flex items-center gap-2 bg-emerald-600 text-white text-sm px-4 py-2 rounded-md hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 active:scale-[0.98] transition"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Añadir pizza</span>
        </button>

        {errorMsg && (
          <p className="w-full text-sm text-red-500 mt-1">{errorMsg}</p>
        )}
      </form>

      {/* Estados de carga / error */}
      {loading && (
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Cargando pizzas...
        </p>
      )}

      {!loading && errorMsg && (
        <p className="text-sm text-red-500">{errorMsg}</p>
      )}

      {!loading && !errorMsg && pizzas.length === 0 && (
        <p className="text-sm text-slate-500 dark:text-slate-400">
          No hay pizzas registradas todavía.
        </p>
      )}

      {/* Listado */}
      {!loading && !errorMsg && pizzas.length > 0 && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg shadow-sm overflow-hidden">
          <table className="w-full text-sm text-slate-800 dark:text-slate-100">
            <thead className="bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200">
              <tr>
                <th className="text-left px-4 py-2 border-b border-slate-200 dark:border-slate-700">
                  Nombre
                </th>
                <th className="text-left px-4 py-2 border-b border-slate-200 dark:border-slate-700">
                  Tamaño
                </th>
                <th className="text-left px-4 py-2 border-b border-slate-200 dark:border-slate-700">
                  Descripción
                </th>
                <th className="text-right px-4 py-2 border-b border-slate-200 dark:border-slate-700">
                  Precio base
                </th>
                <th className="text-center px-4 py-2 border-b border-slate-200 dark:border-slate-700">
                  Estado
                </th>
                <th className="text-right px-4 py-2 border-b border-slate-200 dark:border-slate-700">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {pizzas.map((pz) => (
                <tr
                  key={pz.id}
                  className="hover:bg-slate-50 dark:hover:bg-slate-800 transition"
                >
                  <td className="px-4 py-2 border-b border-slate-200 dark:border-slate-800">
                    {pz.nombre}
                  </td>
                  <td className="px-4 py-2 border-b border-slate-200 dark:border-slate-800">
                    {pz.tamano ?? '—'}
                  </td>
                  <td className="px-4 py-2 border-b border-slate-200 dark:border-slate-800">
                    <span className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2">
                      {pz.descripcion || 'Sin descripción'}
                    </span>
                  </td>
                  <td className="px-4 py-2 border-b border-slate-200 dark:border-slate-800 text-right">
                    ${pz.precio_base ?? 0}
                  </td>
                  <td className="px-4 py-2 border-b border-slate-200 dark:border-slate-800 text-center">
                    <button
                      type="button"
                      onClick={() => toggleActiva(pz)}
                      className="inline-flex items-center gap-1 text-xs text-slate-700 dark:text-slate-200"
                    >
                      {pz.activa ? (
                        <>
                          <ToggleRight className="w-4 h-4 text-emerald-500" />
                          <span>Activa</span>
                        </>
                      ) : (
                        <>
                          <ToggleLeft className="w-4 h-4 text-slate-400" />
                          <span>Inactiva</span>
                        </>
                      )}
                    </button>
                  </td>
                  <td className="px-4 py-2 border-b border-slate-200 dark:border-slate-800 text-right">
                    <button
                      onClick={() => handleEditarRapido(pz)}
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
