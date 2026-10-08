// app/(tabs)/pizza-detail.tsx
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Image,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "../../lib/supabaseClient";
import { Alert } from "../../lib/alert";

type ZaProducto = {
  id: string;
  nombre: string;
  descripcion: string | null;
  precio: number;
  tag: string | null;
  imagen_url: string | null;
};

export default function PizzaDetailScreen() {
  const router = useRouter();
  const { pizzaId } = useLocalSearchParams<{ pizzaId?: string }>();

  const [za, setZa] = useState<ZaProducto | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  const formatPrice = (value: number) =>
    new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
    }).format(value);

  useEffect(() => {
    const fetchZa = async () => {
      if (!pizzaId) {
        setErrorMsg("No se recibió el identificador de la Za.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setErrorMsg("");

      const { data, error } = await supabase
        .from("productos")
        .select("id, nombre, descripcion, precio, tag, imagen_url")
        .eq("id", pizzaId)
        .single();

      if (error || !data) {
        console.error("Error cargando Za:", error);
        setErrorMsg("No encontramos los detalles de esta Za.");
        setZa(null);
      } else {
        setZa(data as ZaProducto);
      }

      setLoading(false);
    };

    fetchZa();
  }, [pizzaId]);

  const [adding, setAdding] = useState(false);

  const handleAddToCart = async () => {
    if (!za || adding) return;
    setAdding(true);

    try {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth?.user) {
        Alert.alert("Inicia sesión", "Debes iniciar sesión para agregar productos al carrito.", [
          { text: "Ir a login", onPress: () => router.replace("/login") },
        ]);
        return;
      }

      const { data: usuarioApp } = await supabase
        .from("usuarios_app")
        .select("id")
        .eq("auth_user_id", auth.user.id)
        .single();

      if (!usuarioApp) {
        Alert.alert("Error", "No encontramos tu perfil de usuario en ZaHub.");
        return;
      }

      // Si esa Za ya está en el carrito, se suma la cantidad en vez de duplicar la línea
      const { data: existentes } = await supabase
        .from("carrito_items")
        .select("id, cantidad")
        .eq("usuario_id", usuarioApp.id)
        .eq("pizza_base_id", za.id);

      const existente = (existentes || [])[0];
      let error;
      if (existente) {
        const nuevaCantidad = Number(existente.cantidad) + quantity;
        ({ error } = await supabase
          .from("carrito_items")
          .update({ cantidad: nuevaCantidad, subtotal: nuevaCantidad * za.precio })
          .eq("id", existente.id));
      } else {
        ({ error } = await supabase.from("carrito_items").insert({
          usuario_id: usuarioApp.id,
          pizza_base_id: za.id,
          nombre_personalizado: null,
          tamano: "MEDIANA",
          masa: "Tradicional",
          borde: "Clásico",
          cantidad: quantity,
          precio_unitario: za.precio,
          subtotal: za.precio * quantity,
        }));
      }

      if (error) {
        console.error("Error agregando al carrito:", error);
        Alert.alert("Error", "No se pudo agregar la Za al carrito. Intenta de nuevo.");
        return;
      }

      Alert.alert("¡Listo! 😋", `${za.nombre} x${quantity} fue agregada al carrito.`, [
        { text: "Ir al carrito", onPress: () => router.push("/(tabs)/cart") },
        { text: "Seguir pidiendo", style: "cancel", onPress: () => router.back() },
      ]);
    } finally {
      setAdding(false);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 bg-slate-950 items-center justify-center">
        <ActivityIndicator color="#fb923c" />
      </View>
    );
  }

  if (errorMsg || !za) {
    return (
      <View className="flex-1 bg-slate-950 items-center justify-center px-6">
        <Text className="text-red-400 mb-3">
          {errorMsg || "No encontramos los detalles de esta Za."}
        </Text>
        <TouchableOpacity
          className="bg-red-500 rounded-full px-6 py-2"
          onPress={() => router.back()}
        >
          <Text className="text-white text-sm font-semibold">
            Volver al menú
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-slate-950 pt-12 px-5 pb-3">
      {/* Header */}
      <View className="flex-row items-center mb-4">
        <TouchableOpacity className="mr-2" onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#ffffff" />
        </TouchableOpacity>
        <Text className="text-white text-xl font-bold">Detalle de Za</Text>
      </View>

      {/* Contenido + botones fijos abajo */}
      <View className="flex-1">
        <ScrollView
          contentContainerStyle={{ paddingBottom: 24 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Imagen */}
          {za.imagen_url ? (
            <Image
              source={{ uri: za.imagen_url }}
              className="w-full h-48 rounded-2xl mb-4 bg-slate-800"
              resizeMode="cover"
            />
          ) : (
            <View className="w-full h-48 rounded-2xl mb-4 bg-slate-800 items-center justify-center">
              <Ionicons name="pizza-outline" size={40} color="#9CA3AF" />
            </View>
          )}

          {/* Nombre + tag + precio */}
          <View className="mb-3">
            <View className="flex-row items-center mb-1">
              <Text className="text-white text-2xl font-bold mr-2">
                {za.nombre}
              </Text>
              {za.tag && (
                <Text className="text-[10px] px-2 py-1 rounded-full bg-red-500/20 text-red-300 font-semibold uppercase">
                  {za.tag}
                </Text>
              )}
            </View>
            <Text className="text-orange-400 font-bold text-base">
              {formatPrice(za.precio)}
            </Text>
          </View>

          {/* Descripción */}
          <View className="mb-4">
            <Text className="text-slate-300 text-sm mb-1">Descripción</Text>
            <Text className="text-slate-400 text-xs">
              {za.descripcion || "Deliciosa Za preparada al estilo ZaHub."}
            </Text>
          </View>

          {/* Info fija */}
          <View className="mb-4">
            <Text className="text-slate-300 text-sm mb-1">Tamaño y masa</Text>
            <Text className="text-slate-400 text-xs mb-1">
              Tamaño mediano (8 porciones). Masa tradicional, borde clásico.
            </Text>
            <Text className="text-slate-400 text-xs">
              Más adelante podrás elegir tamaño, tipo de masa y borde relleno
              desde esta misma pantalla.
            </Text>
          </View>

          {/* Cantidad */}
          <View className="mb-2">
            <Text className="text-slate-300 text-sm mb-2">Cantidad</Text>
            <View className="flex-row items-center">
              <TouchableOpacity
                className="w-9 h-9 rounded-full border border-slate-600 items-center justify-center"
                onPress={() => setQuantity((q) => Math.max(1, q - 1))}
              >
                <Ionicons name="remove" size={16} color="#E5E7EB" />
              </TouchableOpacity>

              <Text className="text-white text-base font-semibold mx-4">
                {quantity}
              </Text>

              <TouchableOpacity
                className="w-9 h-9 rounded-full bg-red-500 items-center justify-center"
                onPress={() => setQuantity((q) => q + 1)}
              >
                <Ionicons name="add" size={16} color="#F9FAFB" />
              </TouchableOpacity>
            </View>

            <Text className="text-slate-400 text-xs mt-2">
              Total aproximado:{" "}
              <Text className="text-orange-400 font-semibold">
                {formatPrice(za.precio * quantity)}
              </Text>
            </Text>
          </View>
        </ScrollView>

        {/* Barra de acciones fija abajo */}
        <View className="flex-row pt-3 border-t border-slate-800">
          <TouchableOpacity
            className="flex-1 bg-red-500 rounded-full py-3 mr-2 items-center"
            onPress={handleAddToCart}
          >
            <Text className="text-white text-sm font-semibold">
              Agregar al carrito
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="flex-1 border border-slate-600 rounded-full py-3 items-center"
            onPress={() => router.back()}
          >
            <Text className="text-slate-200 text-sm font-semibold">
              Cancelar
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
