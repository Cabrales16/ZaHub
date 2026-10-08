// Cliente "Supabase" simulado para el modo demo de ZaHub (admin web + app cliente).
// Implementa el subconjunto de la API que usan ambas apps y guarda todo en localStorage.
// Como las dos apps se publican en el mismo origen, comparten la base de datos: un pedido
// creado desde la app cliente aparece en el panel admin, y viceversa.
import { buildSeed, DEMO_PASSWORD } from "./seed.js";

const DB_KEY = "zahub-demo-db-v1";
const LATENCY_MS = 120;

// ---------- almacenamiento seguro (SSR / nativo → memoria) ----------
const memory = new Map();
const store = {
  get(k) {
    try {
      if (typeof localStorage !== "undefined") return localStorage.getItem(k);
    } catch {
      /* acceso denegado */
    }
    return memory.get(k) ?? null;
  },
  set(k, v) {
    try {
      if (typeof localStorage !== "undefined") return localStorage.setItem(k, v);
    } catch {
      /* cuota llena / modo privado */
    }
    memory.set(k, v);
  },
  remove(k) {
    try {
      if (typeof localStorage !== "undefined") localStorage.removeItem(k);
    } catch {
      /* noop */
    }
    memory.delete(k);
  },
};

const uuid = () =>
  typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0;
        return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
      });

export async function sha256(text) {
  if (typeof crypto !== "undefined" && crypto.subtle) {
    const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
    return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
  }
  return `plain:${text}`; // entornos sin WebCrypto (solo demo)
}

// ---------- base de datos ----------
let db = null;
let dbPromise = null;

async function ensureDb() {
  if (db) return db;
  if (!dbPromise) {
    dbPromise = (async () => {
      try {
        const raw = store.get(DB_KEY);
        if (raw) {
          db = JSON.parse(raw);
          return db;
        }
      } catch {
        /* se vuelve a sembrar */
      }
      db = buildSeed(await sha256(DEMO_PASSWORD));
      persist();
      return db;
    })();
  }
  return dbPromise;
}

function persist() {
  store.set(DB_KEY, JSON.stringify(db));
}

export function resetDemoData() {
  db = null;
  dbPromise = null;
  store.remove(DB_KEY);
  ["admin", "cliente"].forEach((app) => store.remove(`zahub-demo-session-${app}-v1`));
}

const clone = (v) => JSON.parse(JSON.stringify(v));
const wait = () => new Promise((r) => setTimeout(r, LATENCY_MS));

// ---------- relaciones para select embebidos ----------
const RELATIONS = {
  pedidos: {
    usuarios_app: { table: "usuarios_app", kind: "one", fk: "cliente_id" },
    pedido_items: { table: "pedido_items", kind: "many", fk: "pedido_id" },
    historial_estado_pedido: { table: "historial_estado_pedido", kind: "many", fk: "pedido_id" },
  },
  pedido_items: {
    pizzas_base: { table: "pizzas_base", kind: "one", fk: "pizza_base_id" },
    pedido_item_ingredientes: { table: "pedido_item_ingredientes", kind: "many", fk: "pedido_item_id" },
  },
  pedido_item_ingredientes: {
    ingredientes: { table: "ingredientes", kind: "one", fk: "ingrediente_id" },
  },
  historial_estado_pedido: {
    usuarios_app: { table: "usuarios_app", kind: "one", fk: "cambiado_por_id" },
  },
  carrito_items: {
    pizzas_base: { table: "pizzas_base", kind: "one", fk: "pizza_base_id" },
    carrito_item_ingredientes: { table: "carrito_item_ingredientes", kind: "many", fk: "carrito_item_id" },
  },
  carrito_item_ingredientes: {
    ingredientes: { table: "ingredientes", kind: "one", fk: "ingrediente_id" },
  },
};

// Tablas que no se pueden borrar si otras filas dependen de ellas (como las claves foráneas reales)
const REFERENCED_BY = {
  pizzas_base: [["pedido_items", "pizza_base_id"], ["carrito_items", "pizza_base_id"]],
  ingredientes: [["pedido_item_ingredientes", "ingrediente_id"], ["carrito_item_ingredientes", "ingrediente_id"]],
  usuarios_app: [["pedidos", "cliente_id"]],
};

// `productos` es la carta que ve el cliente: se deriva de `pizzas_base` (activas),
// así lo que se edita en el panel admin se refleja de inmediato en la app.
function getRows(name) {
  if (name === "productos") {
    return db.pizzas_base
      .filter((p) => p.activa !== false)
      .map((p) => ({
        id: p.id,
        nombre: p.nombre,
        descripcion: p.descripcion,
        precio: p.precio_base,
        tag: p.tag ?? null,
        imagen_url: p.imagen_url ?? null,
        created_at: p.created_at,
      }));
  }
  return db[name];
}

// ---------- parser de select ----------
function splitTopLevel(str) {
  const parts = [];
  let depth = 0;
  let current = "";
  for (const ch of str) {
    if (ch === "(") depth++;
    if (ch === ")") depth--;
    if (ch === "," && depth === 0) {
      parts.push(current);
      current = "";
    } else current += ch;
  }
  if (current.trim()) parts.push(current);
  return parts.map((p) => p.trim()).filter(Boolean);
}

function parseSelect(str = "*") {
  return splitTopLevel(str).map((item) => {
    const open = item.indexOf("(");
    if (open === -1) return { type: "col", name: item };
    const head = item.slice(0, open).trim();
    const inner = item.slice(open + 1, item.lastIndexOf(")"));
    const [alias, rest] = head.includes(":") ? head.split(":").map((s) => s.trim()) : [head, head];
    const name = rest.split("!")[0].trim(); // "tabla!fk_hint" → "tabla"
    return { type: "embed", alias: alias.split("!")[0].trim(), name, children: parseSelect(inner) };
  });
}

function project(row, table, nodes) {
  const out = {};
  for (const node of nodes) {
    if (node.type === "col") {
      if (node.name === "*") Object.assign(out, row);
      else out[node.name] = row[node.name];
      continue;
    }
    const rel = RELATIONS[table]?.[node.name];
    if (!rel) throw new Error(`Relación desconocida: ${table} -> ${node.name}`);
    if (rel.kind === "one") {
      const target = getRows(rel.table).find((r) => r.id === row[rel.fk]);
      out[node.alias] = target ? project(target, rel.table, node.children) : null;
    } else {
      out[node.alias] = getRows(rel.table)
        .filter((r) => r[rel.fk] === row.id)
        .map((r) => project(r, rel.table, node.children));
    }
  }
  return out;
}

// ---------- reglas de integridad ----------
const err = (message, code = "23503") => ({ message, code });

function validateInsert(table, row) {
  if (table === "pedidos" && !db.usuarios_app.some((u) => u.id === row.cliente_id)) return err("cliente_id no existe (pedidos_cliente_id_fkey)");
  if (table === "pedido_items" && !db.pedidos.some((p) => p.id === row.pedido_id)) return err("pedido_id no existe");
  if (table === "carrito_items" && !db.usuarios_app.some((u) => u.id === row.usuario_id)) return err("usuario_id no existe");
  if (table === "carrito_item_ingredientes" && !db.carrito_items.some((c) => c.id === row.carrito_item_id)) return err("carrito_item_id no existe");
  if (table === "pedido_item_ingredientes" && !db.pedido_items.some((c) => c.id === row.pedido_item_id)) return err("pedido_item_id no existe");
  if (["ingredientes", "pizzas_base"].includes(table) && !String(row.nombre ?? "").trim()) return err("El nombre es obligatorio", "23502");
  return null;
}

function withDefaults(table, row) {
  const next = { id: uuid(), created_at: new Date().toISOString(), ...row };
  if (table === "pedidos") {
    next.estado ??= "PENDIENTE";
    next.total ??= 0;
    next.metodo_pago ??= null;
    next.canal ??= "APP_MOBILE";
    next.asignado_a_usuario_id ??= null;
  }
  if (table === "usuarios_app") {
    next.activo ??= true;
    next.rol ??= "CLIENTE";
  }
  if (table === "ingredientes") next.activo ??= true;
  if (table === "pizzas_base") next.activa ??= true;
  if (typeof next.created_at !== "string") next.created_at = new Date(next.created_at).toISOString();
  if (next.fecha_pedido && typeof next.fecha_pedido !== "string") next.fecha_pedido = new Date(next.fecha_pedido).toISOString();
  return next;
}

// ---------- query builder ----------
class QueryBuilder {
  constructor(table) {
    this.table = table;
    this.op = "select";
    this.selectStr = "*";
    this.filters = [];
    this.orders = [];
    this.limitN = null;
    this.expectOne = false;
    this.payload = null;
    this.returning = false;
  }

  select(str = "*") {
    this.selectStr = str;
    if (this.op !== "select") this.returning = true;
    return this;
  }
  insert(rows) {
    this.op = "insert";
    this.payload = Array.isArray(rows) ? rows : [rows];
    return this;
  }
  update(values) {
    this.op = "update";
    this.payload = values;
    return this;
  }
  delete() {
    this.op = "delete";
    return this;
  }
  eq(col, val) {
    this.filters.push((r) => r[col] === val);
    return this;
  }
  neq(col, val) {
    this.filters.push((r) => r[col] !== val);
    return this;
  }
  in(col, vals) {
    this.filters.push((r) => vals.includes(r[col]));
    return this;
  }
  order(col, { ascending = true } = {}) {
    this.orders.push({ col, ascending });
    return this;
  }
  limit(n) {
    this.limitN = n;
    return this;
  }
  single() {
    this.expectOne = true;
    return this;
  }

  matches(row) {
    return this.filters.every((f) => f(row));
  }

  run() {
    if (!db[this.table] && this.table !== "productos") {
      return { data: null, error: { message: `Tabla desconocida: ${this.table}` } };
    }
    try {
      if (this.op === "insert") return this.runInsert();
      if (this.op === "update") return this.runUpdate();
      if (this.op === "delete") return this.runDelete();
      return this.runSelect();
    } catch (e) {
      return { data: null, error: { message: e.message } };
    }
  }

  runSelect() {
    let rows = getRows(this.table).filter((r) => this.matches(r));
    for (const { col, ascending } of [...this.orders].reverse()) {
      rows = [...rows].sort((a, b) => {
        const av = a[col] ?? "";
        const bv = b[col] ?? "";
        if (av === bv) return 0;
        return (av > bv ? 1 : -1) * (ascending ? 1 : -1);
      });
    }
    if (this.limitN != null) rows = rows.slice(0, this.limitN);
    const nodes = parseSelect(this.selectStr);
    return this.finish(rows.map((r) => project(r, this.table, nodes)));
  }

  runInsert() {
    const inserted = [];
    for (const raw of this.payload) {
      const e = validateInsert(this.table, raw);
      if (e) return { data: null, error: e };
      const row = withDefaults(this.table, raw);
      db[this.table].push(row);
      inserted.push(row);
      // Equivale al trigger de la BD real: todo pedido nuevo abre su historial.
      if (this.table === "pedidos") {
        db.historial_estado_pedido.push({
          id: uuid(),
          pedido_id: row.id,
          estado: row.estado,
          cambiado_por_id: null,
          comentario: "Pedido creado.",
          created_at: row.created_at,
        });
      }
    }
    persist();
    if (!this.returning) return { data: null, error: null };
    const nodes = parseSelect(this.selectStr);
    return this.finish(inserted.map((r) => project(r, this.table, nodes)));
  }

  runUpdate() {
    const targets = db[this.table].filter((r) => this.matches(r));
    targets.forEach((r) => Object.assign(r, this.payload));
    persist();
    if (!this.returning) return { data: null, error: null };
    const nodes = parseSelect(this.selectStr);
    return this.finish(targets.map((r) => project(r, this.table, nodes)));
  }

  runDelete() {
    const targets = db[this.table].filter((r) => this.matches(r));
    for (const [refTable, fk] of REFERENCED_BY[this.table] || []) {
      if (targets.some((t) => db[refTable].some((r) => r[fk] === t.id))) {
        return { data: null, error: err(`update or delete on table "${this.table}" violates foreign key constraint on "${refTable}"`) };
      }
    }
    const ids = new Set(targets.map((t) => t.id));
    db[this.table] = db[this.table].filter((r) => !ids.has(r.id));
    persist();
    return { data: null, error: null };
  }

  finish(rows) {
    if (this.expectOne) {
      if (rows.length !== 1) {
        return { data: null, error: { message: "JSON object requested, multiple (or no) rows returned", code: "PGRST116" } };
      }
      return { data: clone(rows[0]), error: null };
    }
    return { data: clone(rows), error: null };
  }

  then(resolve, reject) {
    return ensureDb()
      .then(wait)
      .then(() => this.run())
      .then(resolve, reject);
  }
}

// ---------- cliente ----------
export function createMockClient({ app = "admin" } = {}) {
  const SESSION_KEY = `zahub-demo-session-${app}-v1`;
  const listeners = new Set();

  const emit = (event, session) => listeners.forEach((cb) => cb(event, session));
  const publicUser = (u) => ({
    id: u.id,
    email: u.email,
    user_metadata: u.user_metadata || {},
    identities: [{ id: u.id }],
  });
  const readSession = () => {
    const id = store.get(SESSION_KEY);
    if (!id) return null;
    const u = db?.auth_users.find((x) => x.id === id);
    return u ? { user: publicUser(u) } : null;
  };

  const auth = {
    async getSession() {
      await ensureDb();
      await wait();
      return { data: { session: readSession() }, error: null };
    },
    async getUser() {
      await ensureDb();
      await wait();
      const session = readSession();
      if (!session) {
        return { data: { user: null }, error: { name: "AuthSessionMissingError", message: "Auth session missing!" } };
      }
      return { data: { user: session.user }, error: null };
    },
    async signInWithPassword({ email, password }) {
      await ensureDb();
      await wait();
      const hash = await sha256(password ?? "");
      const u = db.auth_users.find((x) => x.email.toLowerCase() === String(email).trim().toLowerCase() && x.passHash === hash);
      if (!u) return { data: { user: null, session: null }, error: { message: "Invalid login credentials" } };
      const perfil = db.usuarios_app.find((p) => p.auth_user_id === u.id);
      if (perfil && perfil.activo === false) {
        return { data: { user: null, session: null }, error: { message: "Tu cuenta está desactivada." } };
      }
      store.set(SESSION_KEY, u.id);
      const session = { user: publicUser(u) };
      setTimeout(() => emit("SIGNED_IN", session), 0);
      return { data: { user: session.user, session }, error: null };
    },
    async signUp({ email, password, options }) {
      await ensureDb();
      await wait();
      const mail = String(email ?? "").trim();
      if (!/^\S+@\S+\.\S+$/.test(mail)) return { data: { user: null, session: null }, error: { message: "Unable to validate email address: invalid format" } };
      if (!password || password.length < 6) return { data: { user: null, session: null }, error: { message: "Password should be at least 6 characters." } };
      const existing = db.auth_users.find((x) => x.email.toLowerCase() === mail.toLowerCase());
      if (existing) {
        // Igual que Supabase con confirmación de correo: no revela el error, devuelve identities vacío.
        return { data: { user: { id: existing.id, email: existing.email, identities: [] }, session: null }, error: null };
      }
      const meta = options?.data || {};
      const u = { id: uuid(), email: mail, passHash: await sha256(password), user_metadata: meta, created_at: new Date().toISOString() };
      db.auth_users.push(u);
      // Equivale al trigger que crea el perfil en usuarios_app
      db.usuarios_app.push({
        id: uuid(),
        auth_user_id: u.id,
        nombre: meta.full_name || mail.split("@")[0],
        email: mail,
        telefono: null,
        rol: String(meta.role || "CLIENTE").toUpperCase(),
        activo: true,
        created_at: new Date().toISOString(),
      });
      persist();
      return { data: { user: publicUser(u), session: null }, error: null };
    },
    async signOut() {
      await wait();
      store.remove(SESSION_KEY);
      emit("SIGNED_OUT", null);
      return { error: null };
    },
    onAuthStateChange(cb) {
      listeners.add(cb);
      // Supabase emite INITIAL_SESSION al suscribirse.
      ensureDb().then(() => setTimeout(() => listeners.has(cb) && cb("INITIAL_SESSION", readSession()), 0));
      return { data: { subscription: { unsubscribe: () => listeners.delete(cb) } } };
    },
  };

  return { from: (table) => new QueryBuilder(table), auth };
}
