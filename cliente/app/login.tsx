// app/login.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Image,
} from "react-native";
import { useRouter } from "expo-router";
import { supabase, isDemo } from "../lib/supabaseClient";
// @ts-ignore: módulo JS compartido
import { DEMO_ACCOUNTS, DEMO_PASSWORD } from "../../shared/mock/seed.js";
import { Ionicons } from "@expo/vector-icons";

function isValidEmail(email: string) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Verifica que el usuario logueado tenga rol CLIENTE
  const ensureClientRole = async () => {
    const { data, error } = await supabase.auth.getUser();

    if (error || !data.user) {
      await supabase.auth.signOut();
      setErrorMsg("No se pudo obtener la sesión. Intenta de nuevo.");
      return false;
    }

    const role = String((data.user.user_metadata as any)?.role || "").toUpperCase();

    if (role !== "CLIENTE") {
      await supabase.auth.signOut();
      setErrorMsg(
        "Tu cuenta no tiene permisos de CLIENTE para usar esta aplicación."
      );
      return false;
    }

    return true;
  };

  const handleLogin = () => doLogin(email, password);

  const doLogin = async (email: string, password: string) => {
    setErrorMsg("");

    if (!email || !password) {
      setErrorMsg("Por favor ingresa tu correo y tu contraseña.");
      return;
    }

    if (!isValidEmail(email)) {
      setErrorMsg("Ingresa un correo electrónico válido.");
      return;
    }

    try {
      setLoading(true);

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.log("Supabase login error:", error);
        const message = error.message?.toLowerCase?.() || "";

        if (
          message.includes("invalid login credentials") ||
          message.includes("invalid email or password")
        ) {
          setErrorMsg("Correo o contraseña incorrectos.");
        } else {
          setErrorMsg(
            "No se pudo iniciar sesión. Revisa tus datos e inténtalo nuevamente."
          );
        }
        return;
      }

      const ok = await ensureClientRole();
      if (!ok) return;

      // 🔸 AQUÍ EL CAMBIO IMPORTANTE
      // Ir al layout de pestañas, donde está Inicio/Menú/etc.
      router.replace("/(tabs)");
    } catch (error: any) {
      console.error("Error login:", error);
      setErrorMsg(
        "Ocurrió un error inesperado al iniciar sesión. Intenta de nuevo."
      );
    } finally {
      setLoading(false);
    }
  };

  const goToRegister = () => {
    router.push("/register");
  };

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  return (
    <View className="flex-1 bg-slate-950 px-6 justify-center">
      {/* Flecha para volver al inicio */}
      <TouchableOpacity
        className="absolute top-12 left-6"
        onPress={() => router.replace("/")}
      >
        <Ionicons name="arrow-back" size={28} color="#ffffff" />
      </TouchableOpacity>

      {/* Logo + texto */}
      <View className="items-center mb-3">
        <Image
          source={require("../assets/LogoNoBack.png")}
          className="w-20 h-20 mb-1"
          resizeMode="contain"
        />
        <Text className="text-slate-50 text-2xl font-bold">ZaHub</Text>
      </View>

      <Text className="text-slate-200 text-lg text-center mb-5">
        Inicia sesión
      </Text>

      {errorMsg ? (
        <Text className="text-red-300 text-center mb-3">{errorMsg}</Text>
      ) : null}

      {/* Formulario */}
      <View className="mb-6 space-y-4">
        <View>
          <Text className="text-slate-400 mb-1 text-sm">
            Correo electrónico
          </Text>
          <TextInput
            className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-50"
            placeholder="tucorreo@ejemplo.com"
            placeholderTextColor="#6B7280"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />
        </View>

        <View>
          <Text className="text-slate-400 mb-1 text-sm">Contraseña</Text>
          <View className="relative">
            <TextInput
              className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 pr-11 text-slate-50"
              placeholder="••••••••"
              placeholderTextColor="#6B7280"
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
            />
            <TouchableOpacity
              className="absolute right-3 top-2.5"
              onPress={togglePasswordVisibility}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons
                name={showPassword ? "eye-off-outline" : "eye-outline"}
                size={20}
                color="#9CA3AF"
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <TouchableOpacity
        className={`bg-red-500 rounded-full py-3 mb-3 items-center ${
          loading ? "opacity-70" : ""
        }`}
        onPress={handleLogin}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#ffffff" />
        ) : (
          <Text className="text-slate-50 text-base font-semibold">
            Entrar
          </Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity onPress={goToRegister}>
        <Text className="text-slate-400 text-center text-sm">
          ¿No tienes cuenta?{" "}
          <Text className="text-orange-400 font-semibold">Regístrate</Text>
        </Text>
      </TouchableOpacity>

      {isDemo && (
        <View className="mt-6 rounded-xl border border-amber-400/40 bg-amber-400/10 p-3">
          <Text className="text-amber-300 text-xs font-semibold mb-2">
            🧪 Demo: entra con la cuenta de prueba
          </Text>
          <TouchableOpacity
            className="rounded-lg border border-amber-400/50 bg-slate-900 py-2 items-center"
            onPress={() => {
              setEmail(DEMO_ACCOUNTS.cliente.email);
              setPassword(DEMO_PASSWORD);
              doLogin(DEMO_ACCOUNTS.cliente.email, DEMO_PASSWORD);
            }}
          >
            <Text className="text-amber-200 text-sm font-medium">Entrar como Cliente</Text>
          </TouchableOpacity>
          <Text className="text-amber-200/70 text-[11px] mt-2">
            {DEMO_ACCOUNTS.cliente.email} · clave: {DEMO_PASSWORD}
          </Text>
        </View>
      )}
    </View>
  );
}
