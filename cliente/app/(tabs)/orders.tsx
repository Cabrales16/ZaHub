// app/(tabs)/orders.tsx
// "Mis pedidos": el carrito enviaba a esta ruta pero la pantalla no existía.
import React, { useCallback, useState } from "react";
import { View, Text, ScrollView, ActivityIndicator, TouchableOpacity } from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "../../lib/supabaseClient";

type Item = {
  id: string;
  cantidad: number;
  subtotal: number;
  nombre_personalizado: string | null;
  tamano: string | null;
  pizzas_base: { nombre: string } | null;
};

type Pedido = {
  id: string;
  estado: string;
  total: number;
  created_at: string;
  direccion_entrega: string | null;
  pedido_items: Item[];
};

const ESTADO_STYLE: Record<string, { bg: string; text: string; label: string }> = {
  PENDIENTE: { bg: "bg-yellow-500/20", text: "text-yellow-300", label: "Pendiente" },
  PREPARANDO: { bg: "bg-sky-500/20", text: "text-sky-300", label: "Preparando" },
  HORNEANDO: { bg: "bg-orange-500/20", text: "text-orange-300", label: "Horneando" },
  LISTO: { bg: "bg-violet-500/20", text: "text-violet-300", label: "Listo" },
  EN_CAMINO: { bg: "bg-blue-500/20", text: "text-blue-300", label: "En camino" },
  ENTREGADO: { bg: "bg-emerald-500/20", text: "text-emerald-300", label: "Entregado" },
  CANCELADO: { bg: "bg-red-500/20", text: "text-red-300", label: "Cancelado" },
};

const formatCOP = (value: number) =>
  new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(value);

export default function OrdersScreen() {
  const router = useRouter();
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setErrorMsg("");

    const { data: auth } = await supabase.auth.getUser();
    if (!auth?.user) {
      setErrorMsg("Inicia sesión para ver tus pedidos.");
      setLoading(false);
      return;
    }

    const { data: usuarioApp } = await supabase
      .from("usuarios_app")
      .select("id")
      .eq("auth_user_id", auth.user.id)
      .single();

    if (!usuarioApp) {
      setErrorMsg("No encontramos tu perfil de usuario.");
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("pedidos")
      .select(
        `id, estado, total, created_at, direccion_entrega,
         pedido_items ( id, cantidad, subtotal, nombre_personalizado, tamano, pizzas_base ( nombre ) )`
      )
      .eq("cliente_id", usuarioApp.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error cargando pedidos:", error);
      setErrorMsg("No se pudieron cargar tus pedidos.");
    } else {
      setPedidos((data || []) as Pedido[]);
    }
    setLoading(false);
  }, []);

  // Se recarga cada vez que la pestaña recibe el foco (el estado lo cambia el panel admin)
  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  return (
    <View className="flex-1 bg-slate-950 pt-10 px-4">
      <View className="flex-row items-center justify-between mb-1">
        <Text className="text-white text-xl font-bold">Mis pedidos</Text>
        <TouchableOpacity onPress={load}>
          <Ionicons name="refresh-outline" size={20} color="#fb923c" />
        </TouchableOpacity>
      </View>
      <Text className="text-slate-400 text-xs mb-3">Sigue el estado de tus Zas en tiempo real.</Text>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#fb923c" />
        </View>
      ) : errorMsg ? (
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-red-400 text-center mb-3">{errorMsg}</Text>
          <TouchableOpacity className="bg-red-500 px-6 py-2 rounded-full" onPress={() => router.replace("/login")}>
            <Text className="text-white font-semibold">Ir a iniciar sesión</Text>
          </TouchableOpacity>
        </View>
      ) : pedidos.length === 0 ? (
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-slate-300 text-center mb-3">Aún no tienes pedidos 🍕</Text>
          <TouchableOpacity className="bg-red-500 px-6 py-2 rounded-full" onPress={() => router.push("/(tabs)/menu")}>
            <Text className="text-white font-semibold">Ver el menú</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
          {pedidos.map((p) => {
            const st = ESTADO_STYLE[p.estado] ?? { bg: "bg-slate-500/20", text: "text-slate-300", label: p.estado };
            return (
              <View key={p.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-4 mb-3">
                <View className="flex-row items-center justify-between mb-1">
                  <Text className="text-white font-semibold">Pedido #{p.id.slice(0, 8)}</Text>
                  <View className={`px-2 py-1 rounded-full ${st.bg}`}>
                    <Text className={`text-[10px] font-semibold uppercase ${st.text}`}>{st.label}</Text>
                  </View>
                </View>
                <Text className="text-slate-500 text-[11px] mb-2">
                  {new Date(p.created_at).toLocaleString("es-CO", { dateStyle: "medium", timeStyle: "short" })}
                </Text>
                {(p.pedido_items || []).map((it) => (
                  <Text key={it.id} className="text-slate-300 text-xs">
                    {it.cantidad} × {it.pizzas_base?.nombre || it.nombre_personalizado || "Za personalizada"}
                    {it.tamano ? ` (${it.tamano.toLowerCase()})` : ""}
                  </Text>
                ))}
                <View className="flex-row items-center justify-between mt-2 pt-2 border-t border-slate-800">
                  <Text className="text-slate-400 text-[11px] flex-1 mr-2" numberOfLines={1}>
                    {p.direccion_entrega || "Sin dirección"}
                  </Text>
                  <Text className="text-orange-400 font-bold">{formatCOP(p.total)}</Text>
                </View>
              </View>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
}
