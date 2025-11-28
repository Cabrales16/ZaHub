// src/admin/AdminRouter.jsx
import { Routes, Route } from 'react-router-dom';
import AdminLayout from './layout/AdminLayout';

// Páginas del admin
import Dashboard from './pages/Dashboard';
import PedidosPage from './pages/PedidosPage';
import UsuariosPage from './pages/UsuariosPage';
import IngredientesPage from './pages/IngredientesPage';
import PizzasPage from './pages/PizzasPage';
// import ConfigPage from './pages/ConfigPage'; // si tienes una

export default function AdminRouter() {
  return (
    <Routes>
      <Route element={<AdminLayout />}>
        {/* /admin → Dashboard */}
        <Route index element={<Dashboard />} />

        {/* /admin/dashboard */}
        <Route path="dashboard" element={<Dashboard />} />

        {/* resto de secciones */}
        <Route path="pedidos" element={<PedidosPage />} />
        <Route path="usuarios" element={<UsuariosPage />} />
        <Route path="ingredientes" element={<IngredientesPage />} />
        <Route path="pizzas" element={<PizzasPage />} />
        {/* <Route path="configuracion" element={<ConfigPage />} /> */}

        {/* fallback → Dashboard */}
        <Route path="*" element={<Dashboard />} />
      </Route>
    </Routes>
  );
}