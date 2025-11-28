import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "./index.css";
import { AuthProvider } from "./modules/auth/AuthContext";
import LoginPage from "./modules/auth/LoginPage";
import AdminLayout from "./modules/admin/AdminLayout";
import PedidosPage from "./modules/admin/PedidosPage";
import { ThemeProvider } from "./context/ThemeContext";
import ProtectedRoute from "./modules/auth/ProtectedRoute";
import ConfiguracionPage from "./modules/admin/ConfiguracionPage";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />

            <Route
              path="/admin/*"
              element={
                <ProtectedRoute>
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route path="pedidos" element={<PedidosPage />} />
              <Route path="configuracion" element={<ConfiguracionPage />} />
            </Route>

            {/* Redirección por defecto */}
            <Route path="*" element={<Navigate to="/admin/pedidos" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  </React.StrictMode>
);