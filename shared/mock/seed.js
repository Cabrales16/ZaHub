// Datos de ejemplo del modo demo (todo es ficticio). Las fechas son relativas a "hoy".

export const DEMO_PASSWORD = "demo1234";

export const DEMO_ACCOUNTS = {
  admin: { email: "admin@zahub.demo", label: "Administrador" },
  cajero: { email: "cajero@zahub.demo", label: "Cajero" },
  cocina: { email: "cocina@zahub.demo", label: "Cocina" },
  cliente: { email: "cliente@zahub.demo", label: "Cliente" },
};

// ---------- ilustraciones SVG (sin dependencias externas ni hotlinking) ----------
// base64 (no utf8 + encodeURIComponent): los paréntesis de url(#g) rompían el CSS de react-native-web
const svgUri = (svg) =>
  `data:image/svg+xml;base64,${typeof btoa === "function" ? btoa(svg) : Buffer.from(svg).toString("base64")}`;

function rng(seed) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

export function pizzaImage(seed, toppings, bg = ["#1e293b", "#0f172a"]) {
  const r = rng(seed * 97 + 13);
  let dots = "";
  toppings.forEach(({ color, size, count }) => {
    for (let i = 0; i < count; i++) {
      const a = r() * Math.PI * 2;
      const d = Math.sqrt(r()) * 118;
      const x = 200 + Math.cos(a) * d;
      const y = 150 + Math.sin(a) * d;
      dots += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${size}" fill="${color}" stroke="rgba(0,0,0,.25)" stroke-width="1"/>`;
    }
  });
  return svgUri(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300">` +
      `<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${bg[0]}"/><stop offset="1" stop-color="${bg[1]}"/></linearGradient></defs>` +
      `<rect width="400" height="300" fill="url(#g)"/>` +
      `<circle cx="200" cy="150" r="138" fill="#d9a05b"/>` +
      `<circle cx="200" cy="150" r="124" fill="#c0392b"/>` +
      `<circle cx="200" cy="150" r="118" fill="#f6d365"/>` +
      dots +
      `</svg>`
  );
}

const T = {
  pepperoni: { color: "#b3261e", size: 11, count: 14 },
  jamon: { color: "#f4a6a6", size: 9, count: 10 },
  piña: { color: "#ffe066", size: 8, count: 10 },
  champi: { color: "#e8dcc8", size: 8, count: 9 },
  aceituna: { color: "#1f2937", size: 6, count: 10 },
  pimenton: { color: "#2e9e4f", size: 6, count: 12 },
  albahaca: { color: "#1b7a34", size: 7, count: 7 },
  tomate: { color: "#e5483c", size: 8, count: 8 },
  pollo: { color: "#f1c27d", size: 8, count: 11 },
  bbq: { color: "#6b3a1e", size: 7, count: 9 },
  jalapeno: { color: "#7bc043", size: 6, count: 12 },
  carne: { color: "#7a3b2e", size: 7, count: 12 },
  queso: { color: "#fff3b0", size: 8, count: 12 },
};

const daysAgo = (d, h = 12, m = 0) => {
  const date = new Date();
  date.setDate(date.getDate() - d);
  date.setHours(h, m, 0, 0);
  return date.toISOString();
};
const daysAhead = (d) => daysAgo(-d);

const uuid = () =>
  typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0;
        return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
      });

export function buildSeed(passHash) {
  // ---------- usuarios ----------
  const people = [
    ["Zahira Admin", "admin@zahub.demo", "ADMIN", "3001000001"],
    ["Carlos Cajero", "cajero@zahub.demo", "CAJERO", "3001000002"],
    ["Clara Cocina", "cocina@zahub.demo", "COCINA", "3001000003"],
    ["Rafa Repartidor", "repartidor@zahub.demo", "REPARTIDOR", "3001000004"],
    ["Camila Cliente", "cliente@zahub.demo", "CLIENTE", "3105550001"],
    ["Juan Pérez", "juan@zahub.demo", "CLIENTE", "3105550002"],
    ["Laura Gómez", "laura@zahub.demo", "CLIENTE", "3105550003"],
    ["Mateo Rojas", "mateo@zahub.demo", "CLIENTE", "3105550004"],
    ["Valentina Cruz", "valentina@zahub.demo", "CLIENTE", "3105550005"],
    ["Sebastián Mora", "sebastian@zahub.demo", "CLIENTE", "3105550006"],
  ];
  const auth_users = [];
  const usuarios_app = people.map(([nombre, email, rol, telefono], i) => {
    const authId = uuid();
    auth_users.push({
      id: authId,
      email,
      passHash,
      user_metadata: { full_name: nombre, role: rol === "CLIENTE" ? "CLIENTE" : rol },
      created_at: daysAgo(60 - i),
    });
    return {
      id: uuid(),
      auth_user_id: authId,
      nombre,
      email,
      telefono,
      rol,
      activo: true,
      created_at: daysAgo(60 - i),
    };
  });
  usuarios_app[9].activo = false; // un usuario inactivo para probar el filtro
  const clientes = usuarios_app.filter((u) => u.rol === "CLIENTE");
  const staff = usuarios_app.filter((u) => u.rol !== "CLIENTE");

  // ---------- ingredientes ----------
  const ingData = [
    ["Mozzarella extra", "Quesos", 3000],
    ["Queso azul", "Quesos", 3500],
    ["Parmesano", "Quesos", 3000],
    ["Pepperoni", "Carnes", 3500],
    ["Jamón", "Carnes", 3000],
    ["Pollo desmechado", "Carnes", 3500],
    ["Carne molida", "Carnes", 3800],
    ["Tocineta", "Carnes", 4000],
    ["Champiñones", "Vegetales", 2500],
    ["Pimentón", "Vegetales", 2000],
    ["Cebolla caramelizada", "Vegetales", 2000],
    ["Aceitunas negras", "Vegetales", 2200],
    ["Maíz tierno", "Vegetales", 2000],
    ["Piña", "Vegetales", 2200],
    ["Jalapeños", "Vegetales", 2200],
    ["Salsa BBQ", "Salsas", 1500],
    ["Salsa de ajo", "Salsas", 1500],
    ["Picante de la casa", "Salsas", 1200],
  ];
  const ingredientes = ingData.map(([nombre, categoria, precio_extra], i) => ({
    id: uuid(),
    nombre,
    categoria,
    precio_extra,
    activo: i !== 17 ? true : false, // "Picante de la casa" desactivado
    created_at: daysAgo(80 - i),
  }));

  // ---------- pizzas ----------
  const pizzaData = [
    ["Margarita", "Salsa de tomate, mozzarella fresca y albahaca. La clásica de siempre.", "MEDIANA", 28000, "Clásica", [T.tomate, T.albahaca, T.queso], ["#14532d", "#052e16"]],
    ["Pepperoni Lover", "Doble porción de pepperoni crocante sobre mozzarella derretida.", "MEDIANA", 34000, "Popular", [T.pepperoni, T.queso], ["#7f1d1d", "#450a0a"]],
    ["Hawaiana", "Jamón y piña caramelizada: el eterno debate, en tu mesa.", "MEDIANA", 32000, "Polémica", [T.jamon, T.piña, T.queso], ["#92400e", "#451a03"]],
    ["Mexicana", "Carne molida, jalapeños, pimentón y maíz con un toque picante.", "MEDIANA", 36000, "Picante", [T.carne, T.jalapeno, T.pimenton, T.queso], ["#9a3412", "#431407"]],
    ["Cuatro Quesos", "Mozzarella, parmesano, queso azul y gouda sobre base blanca.", "MEDIANA", 35000, "Nueva", [T.queso, T.queso, T.albahaca], ["#854d0e", "#422006"]],
    ["BBQ Pollo", "Pollo desmechado, cebolla caramelizada y salsa BBQ ahumada.", "MEDIANA", 36000, "Popular", [T.pollo, T.bbq, T.queso], ["#78350f", "#27140a"]],
    ["Vegetariana", "Champiñones, pimentón, aceitunas y tomate fresco.", "MEDIANA", 31000, "Veggie", [T.champi, T.pimenton, T.aceituna, T.tomate], ["#166534", "#052e16"]],
    ["Familiar Suprema", "Pepperoni, jamón, champiñones y pimentón para compartir.", "FAMILIAR", 52000, "Familiar", [T.pepperoni, T.jamon, T.champi, T.pimenton, T.queso], ["#1e3a8a", "#0f172a"]],
  ];
  const pizzas_base = pizzaData.map(([nombre, descripcion, tamano, precio_base, tag, toppings, bg], i) => ({
    id: uuid(),
    nombre,
    descripcion,
    tamano,
    precio_base,
    activa: true,
    tag,
    imagen_url: pizzaImage(i + 1, toppings, bg),
    created_at: daysAgo(90 - i),
  }));
  pizzas_base[4].activa = true;

  // ---------- promociones ----------
  const promoData = [
    ["2x1 en Pepperoni Lover", "Los martes, lleva dos y paga una.", "2x1", 2, [T.pepperoni, T.queso], ["#b91c1c", "#450a0a"]],
    ["Combo Familiar", "Familiar Suprema + bebida de 1.5 L por un precio especial.", "COMBO", 1, [T.pepperoni, T.jamon, T.champi], ["#1d4ed8", "#0f172a"]],
    ["Estrena la Cuatro Quesos", "Prueba la nueva reina de los quesos con 15% de descuento.", "NUEVA", 3, [T.queso, T.albahaca], ["#ca8a04", "#422006"]],
    ["Miércoles Veggie", "Todas las pizzas vegetarianas con 20% de descuento.", "-20%", 4, [T.champi, T.pimenton, T.aceituna], ["#15803d", "#052e16"]],
  ];
  const promociones = promoData.map(([titulo, subtitulo, badge, orden, toppings, bg], i) => ({
    id: uuid(),
    titulo,
    subtitulo,
    badge,
    image_url: pizzaImage(20 + i, toppings, bg),
    orden,
    is_active: true,
    starts_at: daysAgo(10),
    ends_at: daysAhead(20),
    created_at: daysAgo(15),
  }));

  // ---------- pedidos ----------
  const pedidos = [];
  const pedido_items = [];
  const pedido_item_ingredientes = [];
  const historial_estado_pedido = [];
  const FLOW = ["PENDIENTE", "PREPARANDO", "HORNEANDO", "LISTO", "EN_CAMINO", "ENTREGADO"];
  const direcciones = [
    "Cra 50 #20-15, Bogotá",
    "Calle 72 #10-34, Bogotá",
    "Av. Boyacá #80-94, Bogotá",
    "Cra 15 #85-20, Bogotá",
    "Calle 127 #15-30, Bogotá",
  ];
  const metodos = ["EFECTIVO", "TARJETA", "TRANSFERENCIA"];
  const canales = ["APP_MOBILE", "APP_MOBILE", "APP_MOBILE", "MOSTRADOR", "TELEFONO"];

  // [cliente(idx), estado, díasAtrás, [[pizza(idx)|null, cantidad]...]]
  const plan = [
    [0, "PENDIENTE", 0, [[1, 1]]],
    [0, "HORNEANDO", 0, [[5, 1], [0, 1]]],
    [0, "EN_CAMINO", 1, [[3, 1]]],
    [0, "ENTREGADO", 6, [[1, 2]]],
    [0, "ENTREGADO", 14, [[6, 1], [2, 1]]],
    [0, "CANCELADO", 22, [[4, 1]]],
    [1, "PREPARANDO", 0, [[2, 1]]],
    [1, "LISTO", 0, [[7, 1]]],
    [1, "ENTREGADO", 3, [[1, 1], [3, 1]]],
    [1, "ENTREGADO", 11, [[0, 2]]],
    [2, "PENDIENTE", 0, [[4, 1]]],
    [2, "ENTREGADO", 2, [[5, 1]]],
    [2, "ENTREGADO", 9, [[6, 1]]],
    [3, "EN_CAMINO", 0, [[1, 1], [5, 1]]],
    [3, "ENTREGADO", 5, [[2, 2]]],
    [3, "ENTREGADO", 18, [[7, 1]]],
    [4, "PREPARANDO", 0, [[0, 1]]],
    [4, "ENTREGADO", 4, [[3, 1]]],
    [4, "CANCELADO", 12, [[1, 1]]],
    [5, "ENTREGADO", 7, [[5, 1]]],
    [5, "ENTREGADO", 16, [[4, 1], [0, 1]]],
    [1, "ENTREGADO", 21, [[6, 1]]],
    [2, "ENTREGADO", 25, [[1, 1]]],
    [3, "ENTREGADO", 28, [[3, 1]]],
  ];

  const extrasPool = ingredientes.filter((i) => i.activo);
  plan.forEach(([cIdx, estado, dias, lines], i) => {
    const cliente = clientes[cIdx];
    const pedidoId = uuid();
    const created = daysAgo(dias, 11 + (i % 9), (i * 7) % 60);
    let total = 0;
    lines.forEach(([pIdx, qty], li) => {
      const pizza = pizzas_base[pIdx];
      const itemId = uuid();
      let unit = pizza.precio_base;
      // algunos pedidos llevan un extra
      if ((i + li) % 3 === 0) {
        const extra = extrasPool[(i + li) % extrasPool.length];
        unit += extra.precio_extra;
        pedido_item_ingredientes.push({
          id: uuid(),
          pedido_item_id: itemId,
          ingrediente_id: extra.id,
          tipo: "EXTRA",
          precio_extra: extra.precio_extra,
        });
      }
      pedido_items.push({
        id: itemId,
        pedido_id: pedidoId,
        pizza_base_id: pizza.id,
        nombre_personalizado: null,
        tamano: pizza.tamano,
        cantidad: qty,
        precio_unitario: unit,
        subtotal: unit * qty,
        created_at: created,
      });
      total += unit * qty;
    });
    // un par de pedidos con una "Za" personalizada
    if (i % 7 === 3) {
      const itemId = uuid();
      const base = 28000;
      const ings = [extrasPool[0], extrasPool[3], extrasPool[8]];
      const extras = ings.reduce((s, x) => s + x.precio_extra, 0);
      pedido_items.push({
        id: itemId,
        pedido_id: pedidoId,
        pizza_base_id: null,
        nombre_personalizado: "Mi Za personalizada",
        tamano: "MEDIANA",
        cantidad: 1,
        precio_unitario: base + extras,
        subtotal: base + extras,
        created_at: created,
      });
      ings.forEach((ing) =>
        pedido_item_ingredientes.push({ id: uuid(), pedido_item_id: itemId, ingrediente_id: ing.id, tipo: "EXTRA", precio_extra: ing.precio_extra })
      );
      total += base + extras;
    }

    pedidos.push({
      id: pedidoId,
      cliente_id: cliente.id,
      estado,
      total,
      metodo_pago: estado === "PENDIENTE" ? null : metodos[i % 3],
      direccion_entrega: direcciones[i % direcciones.length],
      referencia_direccion: null,
      notas_cliente: null,
      canal: canales[i % canales.length],
      asignado_a_usuario_id: ["EN_CAMINO", "ENTREGADO"].includes(estado) ? usuarios_app[3].id : null,
      created_at: created,
    });

    // historial coherente con el estado final
    const path = estado === "CANCELADO" ? ["PENDIENTE", "CANCELADO"] : FLOW.slice(0, FLOW.indexOf(estado) + 1);
    path.forEach((est, k) => {
      const at = new Date(new Date(created).getTime() + k * 9 * 60000).toISOString();
      historial_estado_pedido.push({
        id: uuid(),
        pedido_id: pedidoId,
        estado: est,
        cambiado_por_id: k === 0 ? null : staff[1 + (k % 2)].id,
        comentario: k === 0 ? "Pedido creado." : `Estado actualizado a ${est}.`,
        created_at: at,
      });
    });
  });

  return {
    auth_users,
    usuarios_app,
    ingredientes,
    pizzas_base,
    promociones,
    pedidos,
    pedido_items,
    pedido_item_ingredientes,
    historial_estado_pedido,
    carrito_items: [],
    carrito_item_ingredientes: [],
  };
}
