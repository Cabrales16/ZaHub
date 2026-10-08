import React, { useState } from "react";
import { Platform, Text, TouchableOpacity, View } from "react-native";
// @ts-ignore: módulo JS compartido
import { resetDemoData } from "../../shared/mock/mockSupabase.js";

// Franja superior que avisa que es una demo y permite restaurar los datos de ejemplo.
export default function DemoBanner() {
  const [confirming, setConfirming] = useState(false);

  const reset = () => {
    resetDemoData();
    if (Platform.OS === "web" && typeof window !== "undefined") window.location.reload();
  };

  const link = { color: "#78350f", fontSize: 11, textDecorationLine: "underline" as const };

  return (
    <View
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        backgroundColor: "#fef3c7",
        paddingVertical: 3,
        paddingHorizontal: 10,
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "center",
        alignItems: "center",
        gap: 10,
      }}
    >
      <Text style={{ color: "#78350f", fontSize: 11 }}>🧪 Modo demo · datos solo en tu navegador, compartidos con el panel admin</Text>
      {confirming ? (
        <>
          <TouchableOpacity onPress={reset}>
            <Text style={[link, { fontWeight: "700" }]}>Confirmar</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setConfirming(false)}>
            <Text style={link}>Cancelar</Text>
          </TouchableOpacity>
        </>
      ) : (
        <TouchableOpacity onPress={() => setConfirming(true)}>
          <Text style={[link, { fontWeight: "700" }]}>Restaurar datos</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
