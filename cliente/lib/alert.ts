// lib/alert.ts
// `Alert.alert` de React Native NO hace nada en web: los avisos y las confirmaciones
// (por ejemplo "Confirmar pedido") quedaban sin mostrarse. Este reemplazo mantiene la misma
// firma y usa window.alert / window.confirm en web; en iOS/Android delega en el Alert nativo.
import { Alert as NativeAlert, Platform } from "react-native";

type AlertButton = {
  text?: string;
  style?: "default" | "cancel" | "destructive";
  onPress?: () => void;
};

function webAlert(title: string, message?: string, buttons?: AlertButton[]) {
  const text = message ? `${title}\n\n${message}` : title;
  const actions = buttons ?? [];
  const cancel = actions.find((b) => b.style === "cancel");
  const others = actions.filter((b) => b !== cancel);

  // Aviso simple (0 o 1 botón)
  if (actions.length <= 1) {
    window.alert(text);
    actions[0]?.onPress?.();
    return;
  }

  // Confirmación: Aceptar = primera acción; Cancelar = botón "cancel" o segunda acción
  const accept = others[0];
  const dismiss = cancel ?? others[1];
  const hint =
    accept?.text && dismiss?.text
      ? `\n\n[Aceptar] ${accept.text}   ·   [Cancelar] ${dismiss.text}`
      : "";
  if (window.confirm(text + hint)) accept?.onPress?.();
  else dismiss?.onPress?.();
}

export const Alert = {
  alert(title: string, message?: string, buttons?: AlertButton[]) {
    if (Platform.OS === "web" && typeof window !== "undefined") {
      webAlert(title, message, buttons);
    } else {
      NativeAlert.alert(title, message, buttons);
    }
  },
};
