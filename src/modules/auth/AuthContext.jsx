/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../../supabaseClient";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);          // usuario Supabase
  const [userProfile, setUserProfile] = useState(null); // fila usuarios_app
  const [loading, setLoading] = useState(true);

  const loadSessionAndProfile = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.getUser();

      if (error && error.message?.includes("Auth session missing")) {
        setUser(null);
        setUserProfile(null);
        return;
      }

      if (error) {
        console.error("Error obteniendo usuario:", error);
        setUser(null);
        setUserProfile(null);
        return;
      }

      const currentUser = data.user;
      setUser(currentUser ?? null);

      if (!currentUser) {
        setUserProfile(null);
        return;
      }

      const { data: perfil, error: perfilError } = await supabase
        .from("usuarios_app")
        .select("*")
        .eq("auth_user_id", currentUser.id) // 👈 aquí
        .single();

      if (perfilError) {
        console.warn("No se pudo cargar perfil, usando fallback:", perfilError);
        setUserProfile({
          id: currentUser.id,
          nombre: currentUser.email ?? "Usuario",
          rol: "ADMIN",
        });
      } else {
        setUserProfile(perfil);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSessionAndProfile();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session?.user) {
        setUser(null);
        setUserProfile(null);
        setLoading(false);
        return;
      }

      const currentUser = session.user;
      setUser(currentUser);
      setLoading(true);

      supabase
        .from("usuarios_app")
        .select("*")
        .eq("auth_user_id", currentUser.id) // 👈 y aquí también
        .single()
        .then(({ data, error }) => {
          if (error) {
            console.warn(
              "No se pudo cargar perfil en onAuthStateChange, usando fallback:",
              error
            );
            setUserProfile({
              id: currentUser.id,
              nombre: currentUser.email ?? "Usuario",
              rol: "ADMIN",
            });
          } else {
            setUserProfile(data);
          }
          setLoading(false);
        });
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const value = {
    user,
    userProfile,
    setUserProfile,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
